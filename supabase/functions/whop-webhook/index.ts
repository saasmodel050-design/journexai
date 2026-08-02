// Whop webhook — activates / deactivates the Pro plan after payment.
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

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const body = await req.json();
    const event: string = body?.action ?? body?.type ?? body?.event ?? "";
    const data = body?.data ?? body;

    const email: string | undefined =
      data?.user?.email ?? data?.email ?? data?.user_email ?? data?.metadata?.email;
    const userId: string | undefined = data?.metadata?.user_id ?? data?.metadata?.userId;

    console.log("whop-webhook", { event, email, userId });

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
      const match = list?.users?.find(
        (u) => (u.email ?? "").toLowerCase() === email.toLowerCase(),
      );
      targetUserId = match?.id ?? null;
    }

    if (!targetUserId) {
      console.warn("whop-webhook: no matching user", { email });
      return new Response(JSON.stringify({ error: "user_not_found", email }), {
        status: 202,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const updates = ACTIVATE.has(event)
      ? { plan: "pro", plan_status: "active", subscription_type: "paid", payment_status: "paid" }
      : { plan: "free", plan_status: "active", subscription_type: "none", payment_status: "unpaid" };

    const { error } = await supabase.from("profiles").update(updates).eq("user_id", targetUserId);
    if (error) throw error;

    return new Response(JSON.stringify({ ok: true, user_id: targetUserId, event }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("whop-webhook error", e);
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
