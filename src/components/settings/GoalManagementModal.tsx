import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { 
  Loader2, 
  Plus, 
  Calendar as CalendarIcon,
  Target,
  Trash2,
  Pencil,
} from 'lucide-react';
import { useGoals, useCreateGoal, useUpdateGoal, useDeleteGoal } from '@/hooks/useGoals';

const goalSchema = z.object({
  type: z.string().min(1, '목표 유형을 선택해주세요'),
  name: z.string().min(1, '목표 이름을 입력해주세요').max(100),
  target_amount: z.number().min(1, '목표 금액은 0보다 커야 합니다'),
  current_amount: z.number().min(0).default(0),
  target_date: z.string().optional(),
});

type GoalFormData = z.infer<typeof goalSchema>;

const GOAL_TYPES = [
  { value: '비상금', label: '💰 비상금' },
  { value: '주택구매', label: '🏠 주택구매' },
  { value: '결혼자금', label: '💍 결혼자금' },
  { value: '은퇴자금', label: '🌅 은퇴자금' },
  { value: '자동차', label: '🚗 자동차' },
  { value: '여행', label: '✈️ 여행' },
  { value: '기타', label: '📌 기타' },
];

interface GoalManagementModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function GoalManagementModal({ open, onOpenChange }: GoalManagementModalProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  const { data: goals, isLoading: goalsLoading } = useGoals();
  const createGoal = useCreateGoal();
  const updateGoal = useUpdateGoal();
  const deleteGoal = useDeleteGoal();

  const form = useForm<GoalFormData>({
    resolver: zodResolver(goalSchema),
    defaultValues: {
      type: '',
      name: '',
      target_amount: 0,
      current_amount: 0,
      target_date: '',
    },
  });

  const onSubmit = async (data: GoalFormData) => {
    try {
      if (editingId) {
        await updateGoal.mutateAsync({ id: editingId, ...data });
      } else {
        await createGoal.mutateAsync(data);
      }
      
      form.reset();
      setEditingId(null);
      setShowForm(false);
    } catch (error) {
      console.error('목표 저장 오류:', error);
    }
  };

  const handleEdit = (goal: any) => {
    setEditingId(goal.id);
    form.reset({
      type: goal.type,
      name: goal.name,
      target_amount: goal.target_amount,
      current_amount: goal.current_amount || 0,
      target_date: goal.target_date || '',
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('정말 이 목표를 삭제하시겠습니까?')) {
      await deleteGoal.mutateAsync(id);
    }
  };

  const handleCancel = () => {
    form.reset();
    setEditingId(null);
    setShowForm(false);
  };

  const calculateProgress = (current: number, target: number) => {
    return Math.min(100, Math.round((current / target) * 100));
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ko-KR').format(amount);
  };

  const isSubmitting = createGoal.isPending || updateGoal.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            목표 관리
          </DialogTitle>
          <DialogDescription>
            재정 목표를 설정하고 진행 상황을 관리하세요
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* 목표 리스트 */}
          {!showForm && (
            <>
              {goalsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : goals && goals.length > 0 ? (
                <div className="space-y-3">
                  {goals.map((goal) => {
                    const progress = calculateProgress(goal.current_amount, goal.target_amount);
                    return (
                      <div key={goal.id} className="border rounded-lg p-4 space-y-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold">{goal.name}</h3>
                              <span className="text-xs bg-muted px-2 py-0.5 rounded">
                                {goal.type}
                              </span>
                            </div>
                            {goal.target_date && (
                              <p className="text-sm text-muted-foreground mt-1">
                                목표일: {format(new Date(goal.target_date), 'PPP', { locale: ko })}
                              </p>
                            )}
                          </div>
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEdit(goal)}
                              disabled={isSubmitting || deleteGoal.isPending}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDelete(goal.id)}
                              disabled={isSubmitting || deleteGoal.isPending}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">진행률</span>
                            <span className="font-medium">{progress}%</span>
                          </div>
                          <Progress value={progress} className="h-2" />
                          <div className="flex justify-between text-sm">
                            <span className="text-success">
                              {formatCurrency(goal.current_amount)}원
                            </span>
                            <span className="text-muted-foreground">
                              목표: {formatCurrency(goal.target_amount)}원
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Target className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>아직 설정된 목표가 없습니다</p>
                  <p className="text-sm">새 목표를 추가해보세요</p>
                </div>
              )}

              <Button
                onClick={() => setShowForm(true)}
                className="w-full"
                variant="outline"
              >
                <Plus className="h-4 w-4 mr-2" />
                새 목표 추가
              </Button>
            </>
          )}

          {/* 목표 추가/수정 폼 */}
          {showForm && (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>목표 유형</FormLabel>
                      <Select
                        disabled={isSubmitting}
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="목표 유형을 선택하세요" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {GOAL_TYPES.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>목표 이름</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="예: 비상금 1000만원"
                          {...field}
                          disabled={isSubmitting}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="target_amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>목표 금액</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="10000000"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                          disabled={isSubmitting}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="current_amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>현재 금액</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="0"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                          disabled={isSubmitting}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="target_date"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>목표 달성일 (선택)</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className={cn(
                                'w-full pl-3 text-left font-normal',
                                !field.value && 'text-muted-foreground'
                              )}
                              disabled={isSubmitting}
                            >
                              {field.value ? (
                                format(new Date(field.value), 'PPP', { locale: ko })
                              ) : (
                                <span>날짜를 선택하세요</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value ? new Date(field.value) : undefined}
                            onSelect={(date) => field.onChange(date?.toISOString().split('T')[0])}
                            disabled={(date) => date < new Date()}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex gap-2 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCancel}
                    disabled={isSubmitting}
                    className="flex-1"
                  >
                    취소
                  </Button>
                  <Button type="submit" disabled={isSubmitting} className="flex-1">
                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {editingId ? '수정' : '추가'}
                  </Button>
                </div>
              </form>
            </Form>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
