// One-time admin seeding endpoint. Creates the super admin account if missing
// and ensures it has the super_admin role. Idempotent.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const ADMIN_EMAIL = "saasmodel050@gmail.com";
const ADMIN_PASSWORD = "Ash1r.irfan";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // Find existing user
    let userId: string | null = null;
    const { data: list } = await admin.auth.admin.listUsers({ page: 1, perPage: 200 });
    const existing = list?.users.find((u) => u.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase());

    if (existing) {
      userId = existing.id;
      // Ensure password is set / updated and email is confirmed
      await admin.auth.admin.updateUserById(existing.id, {
        password: ADMIN_PASSWORD,
        email_confirm: true,
      });
    } else {
      const { data: created, error: createErr } = await admin.auth.admin.createUser({
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD,
        email_confirm: true,
        user_metadata: { full_name: "Super Admin" },
      });
      if (createErr) throw createErr;
      userId = created.user!.id;
    }

    // Ensure profile exists
    await admin.from("profiles").upsert(
      { user_id: userId, full_name: "Super Admin", plan: "pro", plan_status: "active" },
      { onConflict: "user_id" },
    );

    // Ensure super_admin role
    const { data: existingRole } = await admin
      .from("user_roles")
      .select("id")
      .eq("user_id", userId)
      .eq("role", "super_admin")
      .maybeSingle();
    if (!existingRole) {
      await admin.from("user_roles").insert({ user_id: userId, role: "super_admin" });
    }

    return new Response(JSON.stringify({ ok: true, userId }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e: any) {
    return new Response(JSON.stringify({ ok: false, error: e?.message ?? String(e) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
