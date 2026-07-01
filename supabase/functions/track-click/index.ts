// Public affiliate click tracker. Uses service_role to bypass RLS safely.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { code, ua, referrer } = await req.json().catch(() => ({}));
    if (!code || typeof code !== "string" || code.length > 64) {
      return new Response(JSON.stringify({ ok: false }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { data: aff } = await supabase
      .from("affiliates")
      .select("id")
      .eq("referral_code", code)
      .eq("status", "active")
      .maybeSingle();

    if (!aff?.id) {
      return new Response(JSON.stringify({ ok: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    await supabase.from("affiliate_clicks").insert({
      affiliate_id: aff.id,
      referral_code: code,
      user_agent: typeof ua === "string" ? ua.slice(0, 500) : null,
      referrer: typeof referrer === "string" ? referrer.slice(0, 500) : null,
    });

    await supabase.rpc("increment_affiliate_clicks", { _aff_id: aff.id }).then(async (r) => {
      if (r.error) {
        // Fallback: direct increment via SQL not available; do read-modify-write.
        const { data } = await supabase.from("affiliates").select("total_clicks").eq("id", aff.id).maybeSingle();
        await supabase.from("affiliates").update({ total_clicks: (data?.total_clicks ?? 0) + 1 }).eq("id", aff.id);
      }
    });

    return new Response(JSON.stringify({ ok: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch {
    return new Response(JSON.stringify({ ok: false }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
