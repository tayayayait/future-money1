import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { startOfMonth, endOfMonth, subMonths, addMonths, setDate, format } from 'date-fns';
import { toast } from 'sonner';
import { Transaction } from './useTransactions';

export interface RecurringProposal extends Transaction {
  description: string; // For UI display
}

export function usePendingRecurringTransactions() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['recurring-proposals', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      const now = new Date();
      const currentDay = now.getDate();
      const previousMonth = subMonths(now, 1);
      
      // 1. Fetch last month's recurring transactions
      const { data: lastMonthRecurring, error: lastError } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_recurring', true)
        .gte('transaction_date', format(startOfMonth(previousMonth), 'yyyy-MM-dd'))
        .lte('transaction_date', format(endOfMonth(previousMonth), 'yyyy-MM-dd'));

      if (lastError) throw lastError;
      if (!lastMonthRecurring || lastMonthRecurring.length === 0) return [];

      // 2. Fetch current month's transactions (to check for duplicates)
      const { data: currentMonthTx, error: currError } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .gte('transaction_date', format(startOfMonth(now), 'yyyy-MM-dd'))
        .lte('transaction_date', format(endOfMonth(now), 'yyyy-MM-dd'));

      if (currError) throw currError;

      // 3. Filter out those already added AND those not yet due
      const pending = lastMonthRecurring.filter(prev => {
        // A. Filter by Day: Only show if today >= recurring_day
        // We need the original day. `recurring_day` field might be null for old data, 
        // so fallback to date's day.
        const prevDate = new Date(prev.transaction_date);
        const recurringDay = prev.recurring_day || prevDate.getDate();

        // If today is before the recurring day, don't show it yet.
        if (currentDay < recurringDay) return false;

        // B. Check if already exists in current month
        const exists = currentMonthTx?.some(curr => 
          curr.category_id === prev.category_id &&
          Math.abs(curr.amount - prev.amount) < 100 && 
          curr.memo === prev.memo
        );
        return !exists;
      });

      return pending as Transaction[];
    },
    enabled: !!user?.id,
    staleTime: 1000 * 60 * 60, // 1 hour
  });
}

export function useCopyRecurringTransactions() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: async (transactions: Transaction[]) => {
      if (!user?.id) throw new Error('Not authenticated');

      const now = new Date();
      const currentMonthStr = format(now, 'yyyy-MM'); // e.g., 2026-02

      const newTransactions = transactions.map(t => {
        // Create new date: Current Year/Month + Original Day
        const originalDate = new Date(t.transaction_date);
        let newDate = setDate(now, originalDate.getDate());
        
        // Handle edge case: e.g., Jan 31 -> Feb 28
        // setDate handles this automatically (e.g. setDate(Feb, 31) -> Mar 3 or Feb 28 depending on impl, usually overflow)
        // Let's use robust logic:
        // If original day > days in current month, set to last day of current month? 
        // Actually setDate(new Date(), 31) in Feb results in March 3rd. We probably want Feb 28th.
        const lastDayOfCurrentMonth = endOfMonth(now).getDate();
        const targetDay = Math.min(originalDate.getDate(), lastDayOfCurrentMonth);
        
        newDate = setDate(now, targetDay);

        return {
          user_id: user.id,
          category_id: t.category_id,
          amount: t.amount,
          memo: t.memo,
          transaction_date: format(newDate, 'yyyy-MM-dd'),
          is_recurring: true, // Keep it recurring for next month too
          recurring_day: targetDay,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
      });

      const { error } = await supabase
        .from('transactions')
        .insert(newTransactions);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['recurring-proposals'] });
      toast.success('고정 지출이 이번 달 내역에 추가되었습니다.');
    },
    onError: (error) => {
      console.error(error);
      toast.error('고정 지출 복사 실패');
    }
  });
}
