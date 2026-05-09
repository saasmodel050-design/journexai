import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export type Affiliate = {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  country: string | null;
  referral_code: string;
  status: "pending" | "active" | "banned" | "rejected";
  commission_rate: number;
  paypal_email: string | null;
  total_clicks: number;
  total_referrals: number;
  total_conversions: number;
  total_earnings: number;
  pending_earnings: number;
  paid_earnings: number;
  created_at: string;
};

export function useAffiliate() {
  const { user, loading: authLoading } = useAuth();
  const [affiliate, setAffiliate] = useState<Affiliate | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!user) { setAffiliate(null); setLoading(false); return; }
    const { data } = await (supabase as any)
      .from("affiliates").select("*").eq("user_id", user.id).maybeSingle();
    setAffiliate(data as any);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    if (authLoading) return;
    refresh();
  }, [authLoading, refresh]);

  return { affiliate, loading: loading || authLoading, refresh };
}
