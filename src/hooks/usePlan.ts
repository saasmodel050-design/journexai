import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useTrades } from '@/hooks/useTrades';

export const FREE_DAILY_TRADE_LIMIT = 1;
export const FREE_MONTHLY_TRADE_LIMIT = 30;
// Legacy alias
export const FREE_TRADE_LIMIT = FREE_MONTHLY_TRADE_LIMIT;
export const FREE_AI_MESSAGE_LIMIT = 0;

export type Plan = 'free' | 'pro' | 'pro_trial';

export function usePlan() {
  const { user } = useAuth();

  const query = useQuery({
    queryKey: ['plan', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('plan, plan_status, trial_start_date, trial_end_date, subscription_type')
        .eq('user_id', user!.id)
        .single();
      if (error) throw error;
      return data as {
        plan: Plan;
        plan_status: string;
        trial_start_date: string | null;
        trial_end_date: string | null;
        subscription_type: string;
      };
    },
    enabled: !!user,
  });

  const plan: Plan = (query.data?.plan as Plan) ?? 'free';
  const trialEnd = query.data?.trial_end_date ? new Date(query.data.trial_end_date) : null;
  const now = new Date();
  const isTrial = plan === 'pro_trial';
  const trialActive = !!(isTrial && trialEnd && trialEnd.getTime() > now.getTime());
  const msLeft = trialEnd ? Math.max(0, trialEnd.getTime() - now.getTime()) : 0;
  const daysLeft = Math.ceil(msLeft / (1000 * 60 * 60 * 24));
  const hoursLeft = Math.floor(msLeft / (1000 * 60 * 60));

  // Pro features unlocked for paying Pro AND active trial
  const isPro = plan === 'pro' || trialActive;
  const isFree = !isPro;
  const trialExpired = query.data?.plan_status === 'trial_expired';

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
    isLoading: query.isLoading,
    refetch: query.refetch,
  };
}

export function useTradeUsage() {
  const { trades } = useTrades();
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime();

  const todayCount = trades.filter(t => new Date(t.trade_time).getTime() >= startOfDay).length;
  const monthCount = trades.filter(t => new Date(t.trade_time).getTime() >= startOfMonth).length;

  return {
    todayCount,
    monthCount,
    dailyLimit: FREE_DAILY_TRADE_LIMIT,
    monthlyLimit: FREE_MONTHLY_TRADE_LIMIT,
    reachedDaily: todayCount >= FREE_DAILY_TRADE_LIMIT,
    reachedMonthly: monthCount >= FREE_MONTHLY_TRADE_LIMIT,
  };
}
