// Whop webhook — activates / deactivates the Pro plan after payment.
// Requests must be signed by Whop (HMAC-SHA256 over the raw body using WHOP_WEBHOOK_SECRET).
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-whop-signature",
};

const ACTIVATE = new Set([
  "membership.went_valid",
  "membership_went_valid",
  "payment.succeeded",
  "payment_succeeded",
]);
// Cancelled = stop renewing; keep Pro until the paid period ends.
const CANCEL = new Set([
  "membership.cancelled",
  "membership_cancelled",
  "membership.cancel_at_period_end_changed",
]);
// Immediate loss of access.
const DEACTIVATE = new Set([
  "membership.went_invalid",
  "membership_went_invalid",
  "payment.refunded",
  "payment_refunded",
  "refund.created",
  "refund_created",
  "dispute.created",
  "dispute_created",
  "payment.disputed",
  "chargeback.created",
]);

const json = (obj: unknown, status = 200) =>
  new Response(JSON.stringify(obj), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

function toIso(v: unknown): string | null {
  if (v == null || v === "") return null;
  const n = Number(v);
  const d = Number.isFinite(n) ? new Date(n < 1e12 ? n * 1000 : n) : new Date(String(v));
  return isNaN(d.getTime()) ? null : d.toISOString();
}

async function sha256Hex(text: string) {
  return toHex(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text)));
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function toHex(buf: ArrayBuffer) {
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

/** Accepts either a bare hex digest or a "t=...,v1=..." style header. */
function extractCandidates(header: string): string[] {
  const out: string[] = [];
  for (const part of header.split(",")) {
    const seg = part.trim();
    const eq = seg.indexOf("=");
    if (eq > -1 && /^(v1|v0|sha256|s)$/i.test(seg.slice(0, eq))) {
      out.push(seg.slice(eq + 1).trim());
    } else if (eq === -1 && seg.length > 0) {
      out.push(seg.replace(/^sha256=/i, ""));
    }
  }
  return out;
}

function safeEqual(a: string, b: string) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

async function verifySignature(rawBody: string, header: string | null, secret: string) {
  if (!header) return false;
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const digest = toHex(await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(rawBody)));
  return extractCandidates(header).some((c) => safeEqual(c.toLowerCase(), digest));
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const secret = Deno.env.get("WHOP_WEBHOOK_SECRET");
    if (!secret) {
      console.error("whop-webhook: WHOP_WEBHOOK_SECRET not configured");
      return new Response(JSON.stringify({ error: "not_configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const rawBody = await req.text();
    const valid = await verifySignature(rawBody, req.headers.get("x-whop-signature"), secret);
    if (!valid) {
      console.warn("whop-webhook: invalid signature");
      return new Response(JSON.stringify({ error: "invalid_signature" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let body: any;
    try {
      body = JSON.parse(rawBody);
    } catch {
      return new Response(JSON.stringify({ error: "invalid_json" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const event: string = body?.action ?? body?.type ?? body?.event ?? "";
    const data = body?.data ?? body;
    const eventId: string =
      req.headers.get("webhook-id") ?? req.headers.get("x-whop-event-id") ?? body?.id ??
      (data?.id ? `${event}:${data.id}` : `hash:${await sha256Hex(rawBody)}`);

    const rawEmail = data?.user?.email ?? data?.email ?? data?.user_email ?? data?.metadata?.email;
    const rawUserId = data?.metadata?.user_id ?? data?.metadata?.userId;
    const email = typeof rawEmail === "string" && EMAIL_RE.test(rawEmail.trim()) ? rawEmail.trim().toLowerCase() : undefined;
    const metaUserId = typeof rawUserId === "string" && UUID_RE.test(rawUserId.trim()) ? rawUserId.trim() : undefined;

    const periodEnd = toIso(data?.renewal_period_end ?? data?.expires_at ?? data?.membership?.renewal_period_end ?? data?.valid_until);
    const periodDays = Number(data?.plan?.billing_period ?? data?.billing_period ?? data?.plan?.renewal_period ?? 0);
    const planText = JSON.stringify([data?.plan_id, data?.plan?.id, data?.plan?.name, data?.product?.name, data?.product?.route, data?.metadata?.billing]).toLowerCase();
    const billing = periodDays >= 300 || /year|annual/.test(planText) ? "yearly" : "monthly";
    const amount = Number(data?.final_amount ?? data?.amount ?? data?.subtotal ?? NaN);

    const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

    // ---- Idempotency + audit ----
    const { data: existing } = await supabase.from("webhook_events").select("status").eq("event_id", eventId).maybeSingle();
    if (existing?.status === "processed" || existing?.status === "ignored") {
      return json({ duplicate: true, event_id: eventId });
    }
    if (!existing) {
      await supabase.from("webhook_events").insert({
        event_id: eventId, event_type: event || "unknown", email: email ?? null,
        amount: Number.isFinite(amount) ? amount : null, currency: data?.currency ?? null, payload: body,
      });
    }
    const mark = (fields: Record<string, unknown>) =>
      supabase.from("webhook_events").update({ ...fields, processed_at: new Date().toISOString() }).eq("event_id", eventId);

    console.log("whop-webhook", { event, eventId, hasEmail: !!email, hasUserId: !!metaUserId });

    const isActivate = ACTIVATE.has(event), isCancel = CANCEL.has(event), isDeactivate = DEACTIVATE.has(event);
    if (!isActivate && !isCancel && !isDeactivate) {
      await mark({ status: "ignored" });
      return json({ ignored: event });
    }

    // ---- Resolve the account: email is authoritative; metadata.user_id must agree with it ----
    let emailUserId: string | null = null;
    if (email) {
      const { data: id } = await supabase.rpc("find_user_id_by_email", { p_email: email });
      emailUserId = (id as string | null) ?? null;
    }
    let targetUserId: string | null = emailUserId;
    if (metaUserId) {
      const { data: metaEmail } = await supabase.rpc("get_user_email", { p_user_id: metaUserId });
      if (metaEmail && (!email || metaEmail === email)) {
        targetUserId = metaUserId;
      } else if (metaEmail && email && metaEmail !== email) {
        console.warn("whop-webhook: metadata.user_id does not match paying email; using email match");
      }
    }

    if (!targetUserId) {
      if (isActivate && email) {
        await supabase.from("pending_purchases").upsert({
          email, event, event_id: eventId, billing, pro_until: periodEnd, payload: body,
        }, { onConflict: "event_id", ignoreDuplicates: true });
        await mark({ status: "pending_user", error: "no matching account yet" });
        // Non-2xx so Whop retries; the purchase is also claimed automatically when this email signs up.
        return json({ error: "user_not_found", queued: true }, 409);
      }
      await mark({ status: "no_user" });
      return json({ ok: true, note: "no matching account" });
    }

    let updates: Record<string, unknown>;
    if (isActivate) {
      updates = { plan: "pro", plan_status: "active", subscription_type: billing, payment_status: "paid", pro_until: periodEnd, cancel_at_period_end: false };
    } else if (isCancel) {
      // Keep Pro until the paid period ends; an hourly job downgrades once it passes.
      const until = periodEnd ?? new Date().toISOString();
      updates = { plan_status: "cancelled", cancel_at_period_end: true, pro_until: until };
      if (new Date(until).getTime() <= Date.now()) {
        updates = { plan: "free", plan_status: "active", subscription_type: "none", payment_status: "unpaid", cancel_at_period_end: false };
      }
    } else {
      updates = {
        plan: "free", plan_status: "active", subscription_type: "none",
        payment_status: event.includes("refund") ? "refunded" : event.includes("dispute") || event.includes("chargeback") ? "disputed" : "unpaid",
        cancel_at_period_end: false, pro_until: null,
      };
    }

    const { error } = await supabase.from("profiles").update(updates).eq("user_id", targetUserId);
    if (error) {
      await mark({ status: "error", error: error.message, user_id: targetUserId });
      throw error;
    }
    if (email) {
      await supabase.from("pending_purchases").update({ resolved_at: new Date().toISOString(), resolved_user_id: targetUserId })
        .eq("email", email).is("resolved_at", null);
    }
    await mark({ status: "processed", user_id: targetUserId, error: null });
    return json({ ok: true, event });
  } catch (e) {
    console.error("whop-webhook error", e);
    return new Response(JSON.stringify({ error: "internal_error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
