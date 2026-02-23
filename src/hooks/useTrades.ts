import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Trade } from '@/types/database';
import { toast } from 'sonner';

export function useTrades() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const tradesQuery = useQuery({
    queryKey: ['trades', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('trades')
        .select('*')
        .order('trade_time', { ascending: false });
      if (error) throw error;
      return data as Trade[];
    },
    enabled: !!user,
  });

  const addTrade = useMutation({
    mutationFn: async (trade: Omit<Trade, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('trades')
        .insert({ ...trade, user_id: user!.id })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trades'] });
      toast.success('Trade saved successfully');
    },
    onError: (error: any) => {
      toast.error(error.message);
    },
  });

  const deleteTrade = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('trades').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trades'] });
      toast.success('Trade deleted');
    },
    onError: (error: any) => {
      toast.error(error.message);
    },
  });

  return { trades: tradesQuery.data ?? [], isLoading: tradesQuery.isLoading, addTrade, deleteTrade };
}
