import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export interface Goal {
  id: string;
  user_id: string;
  type: string;
  name: string;
  target_amount: number;
  current_amount: number;
  target_date: string | null;
  is_completed: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateGoalInput {
  type: string;
  name: string;
  target_amount: number;
  current_amount?: number;
  target_date?: string;
}

export function useGoals() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['goals', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      const { data, error } = await supabase
        .from('goals')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Goal[];
    },
    enabled: !!user?.id,
  });
}

export function useCreateGoal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateGoalInput) => {
      // useAuth의 상태 대신 Supabase에서 직접 현재 세션을 확인
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user?.id) {
        throw new Error('Not authenticated');
      }

      const { error } = await supabase
        .from('goals')
        .insert({
          user_id: session.user.id,
          type: input.type,
          name: input.name,
          target_amount: input.target_amount,
          current_amount: input.current_amount || 0,
          target_date: input.target_date,
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] });
      toast.success('목표가 저장되었습니다');
    },
    onError: (error) => {
      toast.error('목표 저장 실패');
      console.error(error);
    },
  });
}

export function useUpdateGoal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...data }: Partial<Goal> & { id: string }) => {
      const { error } = await supabase
        .from('goals')
        .update(data)
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] });
      toast.success('목표가 수정되었습니다');
    },
    onError: (error) => {
      toast.error('목표 수정 실패');
      console.error(error);
    },
  });
}

export function useDeleteGoal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('goals')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] });
      toast.success('목표가 삭제되었습니다');
    },
    onError: (error) => {
      toast.error('목표 삭제 실패');
      console.error(error);
    },
  });
}
