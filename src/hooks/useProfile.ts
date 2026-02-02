import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export interface Profile {
  id: string;
  user_id: string;
  name: string | null;
  monthly_income: number | null;
  pay_day: number | null;
  housing_type: string | null;
  onboarding_completed: boolean | null;
  onboarding_completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export function useProfile() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;
      return data as Profile | null;
    },
    enabled: !!user?.id,
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Partial<Profile>) => {
      // useAuth의 상태 대신 Supabase에서 직접 현재 세션을 확인
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user?.id) {
        throw new Error('Not authenticated');
      }

      const { error } = await supabase
        .from('profiles')
        .upsert({
          user_id: session.user.id,
          ...data,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'user_id'
        });

      if (error) throw error;
    },
    onSuccess: async () => {
      // 쿼리 무효화 후 다시 데이터를 가져올 때까지 기다림
      await queryClient.invalidateQueries({ queryKey: ['profile'] });
      toast.success('프로필이 업데이트되었습니다');
    },
    onError: (error) => {
      toast.error('프로필 업데이트 실패');
      console.error(error);
    },
  });
}
