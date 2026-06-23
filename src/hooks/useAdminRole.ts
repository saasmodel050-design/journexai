import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export type AdminRole = "super_admin" | "support_admin" | "user";

export function useAdminRole() {
  const { user, loading: authLoading } = useAuth();
  const [roles, setRoles] = useState<AdminRole[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user) { setRoles([]); setLoading(false); return; }
    (async () => {
      const { data } = await (supabase as any)
        .from("user_roles").select("role").eq("user_id", user.id);
      setRoles((data ?? []).map((r: any) => r.role));
      setLoading(false);
    })();
  }, [user, authLoading]);

  const isSuperAdmin = roles.includes("super_admin");
  const isSupportAdmin = roles.includes("support_admin");
  const isAdmin = isSuperAdmin || isSupportAdmin;
  return { roles, isAdmin, isSuperAdmin, isSupportAdmin, loading: loading || authLoading };
}

export async function logAudit(_adminId: string, action: string, entity?: string, entityId?: string, before?: any, after?: any) {
  await (supabase as any).rpc("log_admin_audit", {
    p_action: action,
    p_entity: entity ?? null,
    p_entity_id: entityId ?? null,
    p_before: before ?? null,
    p_after: after ?? null,
  });
}
