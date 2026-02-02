import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export interface Asset {
  id: string;
  user_id: string;
  type: string;
  name: string;
  amount: number;
  interest_rate: number | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateAssetInput {
  type: string;
  name: string;
  amount: number;
  interest_rate?: number;
  notes?: string;
}

export function useAssets() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['assets', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      const { data, error } = await supabase
        .from('assets')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Asset[];
    },
    enabled: !!user?.id,
  });
}

export function useCreateAsset() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateAssetInput) => {
      // useAuth의 상태 대신 Supabase에서 직접 현재 세션을 확인
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user?.id) {
        throw new Error('Not authenticated');
      }

      const { error } = await supabase
        .from('assets')
        .insert({
          user_id: session.user.id,
          type: input.type,
          name: input.name,
          amount: input.amount,
          interest_rate: input.interest_rate,
          notes: input.notes,
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assets'] });
      toast.success('자산이 저장되었습니다');
    },
    onError: (error) => {
      toast.error('자산 저장 실패');
      console.error(error);
    },
  });
}

export function useUpdateAsset() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...data }: Partial<Asset> & { id: string }) => {
      const { error } = await supabase
        .from('assets')
        .update(data)
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assets'] });
      toast.success('자산이 수정되었습니다');
    },
    onError: (error) => {
      toast.error('자산 수정 실패');
      console.error(error);
    },
  });
}

export function useDeleteAsset() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('assets')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assets'] });
      toast.success('자산이 삭제되었습니다');
    },
    onError: (error) => {
      toast.error('자산 삭제 실패');
      console.error(error);
    },
  });
}
