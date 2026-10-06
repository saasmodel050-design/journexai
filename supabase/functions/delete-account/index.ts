// Permanently deletes the calling user's account and all their data (GDPR erasure).
import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  const url = Deno.env.get("SUPABASE_URL")!;
  const anon = Deno.env.get("SUPABASE_ANON_KEY")!;
  const service = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

  const authHeader = req.headers.get("Authorization") ?? "";
  if (!authHeader.startsWith("Bearer ")) return json({ error: "Unauthorized" }, 401);

  const userClient = createClient(url, anon, { global: { headers: { Authorization: authHeader } } });
  const { data: { user }, error: userErr } = await userClient.auth.getUser();
  if (userErr || !user) return json({ error: "Unauthorized" }, 401);

  const body = await req.json().catch(() => ({}));
  if (body?.confirm !== "DELETE") return json({ error: "Confirmation required" }, 400);

  const admin = createClient(url, service);
  const uid = user.id;

  try {
    // Storage: remove the user's files from private buckets
    for (const bucket of ["trade-screenshots", "payment-proofs"]) {
      const { data: files } = await admin.storage.from(bucket).list(uid, { limit: 1000 });
      if (files?.length) await admin.storage.from(bucket).remove(files.map((f) => `${uid}/${f.name}`));
    }

    // Tables without a cascading FK to auth.users
    const { data: tickets } = await admin.from("support_tickets").select("id").eq("user_id", uid);
    const ticketIds = (tickets ?? []).map((t) => t.id);
    if (ticketIds.length) await admin.from("ticket_replies").delete().in("ticket_id", ticketIds);
    await admin.from("ticket_replies").delete().eq("author_id", uid);
    await admin.from("support_tickets").delete().eq("user_id", uid);
    await admin.from("ai_logs").delete().eq("user_id", uid);
    await admin.from("user_roles").delete().eq("user_id", uid);
    await admin.from("referrals").delete().eq("referred_user_id", uid);

    const { data: aff } = await admin.from("affiliates").select("id").eq("user_id", uid).maybeSingle();
    if (aff) {
      await admin.from("affiliate_clicks").delete().eq("affiliate_id", aff.id);
      await admin.from("commissions").delete().eq("affiliate_id", aff.id);
      await admin.from("payouts").delete().eq("affiliate_id", aff.id);
      await admin.from("referrals").delete().eq("affiliate_id", aff.id);
      await admin.from("affiliates").delete().eq("id", aff.id);
    }

    // profiles, trades, crypto_payments cascade from auth.users
    const { error: delErr } = await admin.auth.admin.deleteUser(uid);
    if (delErr) throw delErr;

    return json({ ok: true });
  } catch (e) {
    console.error("delete-account failed", e);
    return json({ error: "Could not delete account. Please contact support." }, 500);
  }
});
