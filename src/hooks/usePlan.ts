import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useTrades } from '@/hooks/useTrades';

export const FREE_DAILY_TRADE_LIMIT = 1;
export const FREE_MONTHLY_TRADE_LIMIT = 30;
// Legacy (kept for backwards compatibility with existing imports)
export const FREE_TRADE_LIMIT = FREE_MONTHLY_TRADE_LIMIT;
export const FREE_AI_MESSAGE_LIMIT = 0; // AI Trainer disabled on Free

export type Plan = 'free' | 'pro';

export function usePlan() {
  const { user } = useAuth();

  const query = useQuery({
    queryKey: ['plan', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('plan, plan_status')
        .eq('user_id', user!.id)
        .single();
      if (error) throw error;
      return data as { plan: Plan; plan_status: string };
    },
    enabled: !!user,
  });

  const plan: Plan = (query.data?.plan as Plan) ?? 'free';
  return {
    plan,
    isPro: plan === 'pro',
    isFree: plan === 'free',
    isLoading: query.isLoading,
    refetch: query.refetch,
  };
}

/** Trade usage stats for Free-plan limit enforcement. */
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
