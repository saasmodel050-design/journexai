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
const DEACTIVATE = new Set([
  "membership.went_invalid",
  "membership_went_invalid",
  "membership.cancelled",
]);

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

    const rawEmail = data?.user?.email ?? data?.email ?? data?.user_email ?? data?.metadata?.email;
    const rawUserId = data?.metadata?.user_id ?? data?.metadata?.userId;

    const email = typeof rawEmail === "string" && EMAIL_RE.test(rawEmail.trim())
      ? rawEmail.trim().toLowerCase()
      : undefined;
    const userId = typeof rawUserId === "string" && UUID_RE.test(rawUserId.trim())
      ? rawUserId.trim()
      : undefined;

    console.log("whop-webhook", { event, hasEmail: !!email, hasUserId: !!userId });

    if (!ACTIVATE.has(event) && !DEACTIVATE.has(event)) {
      return new Response(JSON.stringify({ ignored: event }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    let targetUserId = userId ?? null;
    if (!targetUserId && email) {
      const { data: list } = await supabase.auth.admin.listUsers({ page: 1, perPage: 1000 });
      const match = list?.users?.find((u) => (u.email ?? "").toLowerCase() === email);
      targetUserId = match?.id ?? null;
    }

    if (!targetUserId) {
      console.warn("whop-webhook: no matching user");
      return new Response(JSON.stringify({ error: "user_not_found" }), {
        status: 202,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const updates = ACTIVATE.has(event)
      ? { plan: "pro", plan_status: "active", subscription_type: "paid", payment_status: "paid" }
      : { plan: "free", plan_status: "active", subscription_type: "none", payment_status: "unpaid" };

    const { error } = await supabase.from("profiles").update(updates).eq("user_id", targetUserId);
    if (error) throw error;

    return new Response(JSON.stringify({ ok: true, event }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("whop-webhook error", e);
    return new Response(JSON.stringify({ error: "internal_error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
