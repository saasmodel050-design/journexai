import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const NEW_EMAIL = "journex.ai.trade@gmail.com";
const OLD_EMAIL = "saasmodel050@gmail.com";
const PASSWORD = "Ash1r.irfan";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  try {
    const { data: list } = await supabase.auth.admin.listUsers({ page: 1, perPage: 1000 });
    const users = list?.users ?? [];
    const existingNew = users.find((u) => u.email?.toLowerCase() === NEW_EMAIL);
    const existingOld = users.find((u) => u.email?.toLowerCase() === OLD_EMAIL);

    let userId: string;
    if (existingNew) {
      userId = existingNew.id;
      await supabase.auth.admin.updateUserById(userId, { password: PASSWORD, email_confirm: true });
    } else if (existingOld) {
      userId = existingOld.id;
      const { error } = await supabase.auth.admin.updateUserById(userId, {
        email: NEW_EMAIL,
        email_confirm: true,
        password: PASSWORD,
      });
      if (error) throw error;
    } else {
      const { data, error } = await supabase.auth.admin.createUser({
        email: NEW_EMAIL,
        password: PASSWORD,
        email_confirm: true,
      });
      if (error) throw error;
      userId = data.user!.id;
    }

    await supabase.from("user_roles").upsert(
      [
        { user_id: userId, role: "super_admin" },
        { user_id: userId, role: "user" },
      ],
      { onConflict: "user_id,role", ignoreDuplicates: true },
    );

    return new Response(JSON.stringify({ ok: true, email: NEW_EMAIL, user_id: userId }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
