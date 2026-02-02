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
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Loader2, 
  Plus,
  Trash2,
  Pencil,
  PiggyBank,
  CreditCard,
} from 'lucide-react';
import { useAssets, useCreateAsset, useUpdateAsset, useDeleteAsset } from '@/hooks/useAssets';

const assetSchema = z.object({
  type: z.enum(['savings', 'debt']),
  name: z.string().min(1, '이름을 입력해주세요').max(100),
  amount: z.number().min(0, '금액은 0 이상이어야 합니다'),
  interest_rate: z.number().min(0).max(100).optional(),
  notes: z.string().max(500).optional(),
});

type AssetFormData = z.infer<typeof assetSchema>;

const ASSET_TYPES = {
  savings: { label: '예금/저축', icon: PiggyBank, color: 'text-green-600' },
  debt: { label: '대출/부채', icon: CreditCard, color: 'text-red-600' },
};

interface AssetManagementModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AssetManagementModal({ open, onOpenChange }: AssetManagementModalProps) {
  const [activeTab, setActiveTab] = useState<'savings' | 'debt'>('savings');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  const { data: assets, isLoading: assetsLoading } = useAssets();
  const createAsset = useCreateAsset();
  const updateAsset = useUpdateAsset();
  const deleteAsset = useDeleteAsset();

  const form = useForm<AssetFormData>({
    resolver: zodResolver(assetSchema),
    defaultValues: {
      type: activeTab,
      name: '',
      amount: 0,
      interest_rate: 0,
      notes: '',
    },
  });

  const filteredAssets = assets?.filter(asset => asset.type === activeTab) || [];

  const onSubmit = async (data: AssetFormData) => {
    try {
      if (editingId) {
        await updateAsset.mutateAsync({ id: editingId, ...data });
      } else {
        await createAsset.mutateAsync(data);
      }
      
      form.reset({ type: activeTab, name: '', amount: 0, interest_rate: 0, notes: '' });
      setEditingId(null);
      setShowForm(false);
    } catch (error) {
      console.error('자산 저장 오류:', error);
    }
  };

  const handleEdit = (asset: any) => {
    setEditingId(asset.id);
    form.reset({
      type: asset.type,
      name: asset.name,
      amount: asset.amount,
      interest_rate: asset.interest_rate || 0,
      notes: asset.notes || '',
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('정말 이 항목을 삭제하시겠습니까?')) {
      await deleteAsset.mutateAsync(id);
    }
  };

  const handleCancel = () => {
    form.reset({ type: activeTab, name: '', amount: 0, interest_rate: 0, notes: '' });
    setEditingId(null);
    setShowForm(false);
  };

  const handleTabChange = (value: string) => {
    const newTab = value as 'savings' | 'debt';
    setActiveTab(newTab);
    form.setValue('type', newTab);
    setShowForm(false);
    setEditingId(null);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ko-KR').format(amount);
  };

  const isSubmitting = createAsset.isPending || updateAsset.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>자산/부채 관리</DialogTitle>
          <DialogDescription>
            예금, 대출 항목을 관리하세요
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="savings" className="gap-1.5">
              <PiggyBank className="h-4 w-4" />
              <span className="hidden sm:inline">예금</span>
            </TabsTrigger>
            <TabsTrigger value="debt" className="gap-1.5">
              <CreditCard className="h-4 w-4" />
              <span className="hidden sm:inline">대출</span>
            </TabsTrigger>
          </TabsList>

          {(['savings', 'debt'] as const).map((type) => {
            const TypeIcon = ASSET_TYPES[type as keyof typeof ASSET_TYPES].icon;
            const typeLabel = ASSET_TYPES[type as keyof typeof ASSET_TYPES].label;
            const iconColor = ASSET_TYPES[type as keyof typeof ASSET_TYPES].color;

            return (
              <TabsContent key={type} value={type} className="space-y-4">
                {!showForm && (
                  <>
                    {assetsLoading ? (
                      <div className="flex items-center justify-center py-8">
                        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                      </div>
                    ) : filteredAssets.length > 0 ? (
                      <div className="space-y-3">
                        {filteredAssets.map((asset) => (
                          <div key={asset.id} className="border rounded-lg p-4">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <TypeIcon className={`h-5 w-5 ${iconColor}`} />
                                  <h3 className="font-semibold">{asset.name}</h3>
                                </div>
                                <p className="text-lg font-bold">
                                  {formatCurrency(asset.amount)}원
                                </p>
                                {asset.interest_rate && (
                                  <p className="text-sm text-muted-foreground mt-1">
                                    {type === 'debt' ? '대출' : ''} 이자율: {asset.interest_rate}%
                                  </p>
                                )}
                                {asset.notes && (
                                  <p className="text-sm text-muted-foreground mt-2">
                                    {asset.notes}
                                  </p>
                                )}
                              </div>
                              <div className="flex gap-1">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleEdit(asset)}
                                  disabled={isSubmitting || deleteAsset.isPending}
                                >
                                  <Pencil className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleDelete(asset.id)}
                                  disabled={isSubmitting || deleteAsset.isPending}
                                >
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        <TypeIcon className={`h-12 w-12 mx-auto mb-2 opacity-50 ${iconColor}`} />
                        <p>등록된 {typeLabel} 항목이 없습니다</p>
                        <p className="text-sm">새 항목을 추가해보세요</p>
                      </div>
                    )}

                    <Button
                      onClick={() => setShowForm(true)}
                      className="w-full"
                      variant="outline"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      {typeLabel} 추가
                    </Button>
                  </>
                )}

                {showForm && (
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>항목 이름</FormLabel>
                            <FormControl>
                              <Input
                                placeholder={
                                  type === 'savings' ? '예: 비상금 통장' :
                                  '예: 주택담보대출'
                                }
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
                        name="amount"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              {type === 'debt' ? '대출 잔액' : '금액'}
                            </FormLabel>
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
                        name="interest_rate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>이자율 (%) (선택)</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                step="0.1"
                                placeholder="3.5"
                                {...field}
                                onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                disabled={isSubmitting}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="notes"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>메모 (선택)</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="추가 정보를 입력하세요"
                                className="resize-none"
                                {...field}
                                disabled={isSubmitting}
                              />
                            </FormControl>
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
              </TabsContent>
            );
          })}
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
