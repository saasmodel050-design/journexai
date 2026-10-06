import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useTrades } from '@/hooks/useTrades';
import { startOfDayInTz, startOfMonthInTz } from '@/lib/timezone';

// Keep in sync with enforce_trade_limits() database trigger (server-side enforcement).
export const FREE_DAILY_TRADE_LIMIT = 5;
export const FREE_MONTHLY_TRADE_LIMIT = 30;
// Legacy alias
export const FREE_TRADE_LIMIT = FREE_MONTHLY_TRADE_LIMIT;
export const FREE_AI_MESSAGE_LIMIT = 0;

export type Plan = 'free' | 'pro' | 'pro_trial';

export function usePlan() {
  const { user } = useAuth();
  const qc = useQueryClient();

  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel(`profile-${user.id}-${Math.random().toString(36).slice(2)}`)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'profiles', filter: `user_id=eq.${user.id}` }, () => {
        qc.invalidateQueries({ queryKey: ['plan', user.id] });
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user?.id]);


  const query = useQuery({
    queryKey: ['plan', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('plan, plan_status, trial_start_date, trial_end_date, subscription_type, timezone, pro_until, cancel_at_period_end')
        .eq('user_id', user!.id)
        .single();
      if (error) throw error;
      return data as {
        plan: Plan;
        plan_status: string;
        trial_start_date: string | null;
        trial_end_date: string | null;
        subscription_type: string;
        timezone: string | null;
        pro_until: string | null;
        cancel_at_period_end: boolean;
      };
    },
    enabled: !!user,
  });

  const plan: Plan = (query.data?.plan as Plan) ?? 'free';
  const trialEnd = null as Date | null;
  const isTrial = false;
  const trialActive = false;
  const msLeft = 0;
  const daysLeft = 0;
  const hoursLeft = 0;

  // Trials disabled platform-wide
  const isPro = plan === 'pro';
  const isFree = !isPro;
  const trialExpired = false;

  return {
    plan,
    isPro,
    isFree,
    isTrial,
    trialActive,
    trialExpired,
    trialEnd,
    daysLeft,
    hoursLeft,
    msLeft,
    planStatus: query.data?.plan_status,
    subscriptionType: query.data?.subscription_type,
    proUntil: query.data?.pro_until ?? null,
    cancelAtPeriodEnd: !!query.data?.cancel_at_period_end,
    timezone: query.data?.timezone || 'UTC',
    isLoading: query.isLoading,
    refetch: query.refetch,
  };
}

export function useTradeUsage() {
  const { trades } = useTrades();
  const { timezone } = usePlan();
  // Mirrors the server trigger: counts by when the trade was logged, using the profile's timezone.
  const startOfDay = startOfDayInTz(timezone).getTime();
  const startOfMonth = startOfMonthInTz(timezone).getTime();
  const loggedAt = (t: any) => new Date(t.created_at ?? t.trade_time).getTime();

  const todayCount = trades.filter(t => loggedAt(t) >= startOfDay).length;
  const monthCount = trades.filter(t => loggedAt(t) >= startOfMonth).length;

  return {
    todayCount,
    monthCount,
    dailyLimit: FREE_DAILY_TRADE_LIMIT,
    monthlyLimit: FREE_MONTHLY_TRADE_LIMIT,
    reachedDaily: todayCount >= FREE_DAILY_TRADE_LIMIT,
    reachedMonthly: monthCount >= FREE_MONTHLY_TRADE_LIMIT,
  };
}
