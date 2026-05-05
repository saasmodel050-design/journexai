import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export const FREE_TRADE_LIMIT = 20;
export const FREE_AI_MESSAGE_LIMIT = 5;

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
