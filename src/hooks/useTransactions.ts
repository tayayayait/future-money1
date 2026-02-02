import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export interface Transaction {
  id: string;
  user_id: string;
  category_id: string;
  amount: number;
  memo: string | null;
  transaction_date: string;
  is_recurring: boolean;
  recurring_day: number | null;
  created_at: string;
  updated_at: string;
}

export interface CreateTransactionInput {
  category_id: string;
  amount: number;
  memo?: string;
  transaction_date?: string;
  is_recurring?: boolean;
  recurring_day?: number;
}

export function useTransactions(options?: { 
  limit?: number; 
  startDate?: string; 
  endDate?: string;
  enabled?: boolean;  // 🚀 조건부 쿼리 비활성화 지원
}) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['transactions', user?.id, options],
    queryFn: async () => {
      if (!user?.id) return [];

      let query = supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('transaction_date', { ascending: false });

      if (options?.startDate) {
        query = query.gte('transaction_date', options.startDate);
      }

      if (options?.endDate) {
        query = query.lte('transaction_date', options.endDate);
      }

      if (options?.limit) {
        query = query.limit(options.limit);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as Transaction[];
    },
    // enabled 옵션이 false면 쿼리 비활성화, 기본값은 true
    enabled: !!user?.id && (options?.enabled !== false),
  });
}

export function useCreateTransaction() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (input: CreateTransactionInput) => {
      if (!user?.id) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('transactions')
        .insert({
          user_id: user.id,
          category_id: input.category_id,
          amount: input.amount,
          memo: input.memo,
          transaction_date: input.transaction_date || new Date().toISOString().split('T')[0],
          is_recurring: input.is_recurring || false,
          recurring_day: input.recurring_day,
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      toast.success('거래가 저장되었습니다');
    },
    onError: (error) => {
      toast.error('거래 저장 실패');
      console.error(error);
    },
  });
}

export function useUpdateTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...data }: Partial<Transaction> & { id: string }) => {
      const { error } = await supabase
        .from('transactions')
        .update(data)
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      toast.success('거래가 수정되었습니다');
    },
    onError: (error) => {
      toast.error('거래 수정 실패');
      console.error(error);
    },
  });
}

export function useDeleteTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      toast.success('거래가 삭제되었습니다');
    },
    onError: (error) => {
      toast.error('거래 삭제 실패');
      console.error(error);
    },
  });
}
