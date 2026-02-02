import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Zap } from 'lucide-react';
import { useTransactions, useCreateTransaction } from '@/hooks/useTransactions';
import { getFrequentTransactions } from '@/lib/quickTransactions';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { getCategoryById } from '@/lib/categories';

export function QuickInputWidget() {
  const { data: transactions = [] } = useTransactions();
  const { mutate: createTransaction, isPending } = useCreateTransaction();

  // 자주 쓰는 거래 분석
  const quickTransactions = useMemo(() => {
    return getFrequentTransactions(transactions);
  }, [transactions]);

  // 빠른 입력 핸들러
  const handleQuickAdd = (quick: { categoryId: string; amount: number; label: string }) => {
    const category = getCategoryById(quick.categoryId);
    
    createTransaction({
      category_id: quick.categoryId,
      amount: -quick.amount, // 지출은 음수
      memo: category.name,
      transaction_date: format(new Date(), 'yyyy-MM-dd'),
      is_recurring: false,
    }, {
      onSuccess: () => {
        toast.success(`✅ ${quick.label} 추가됨`);
      },
      onError: () => {
        toast.error('거래 추가 실패');
      }
    });
  };

  // 자주 쓰는 거래가 없으면 표시하지 않음
  if (quickTransactions.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Zap className="w-4 h-4 text-warning" />
          빠른 입력
        </CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-2">
        {quickTransactions.map((quick, idx) => {
          const category = getCategoryById(quick.categoryId);
          
          return (
            <Button
              key={idx}
              onClick={() => handleQuickAdd(quick)}
              disabled={isPending}
              variant="outline"
              className="h-16 flex flex-col justify-center items-center gap-0.5"
            >
              <span className="text-xs text-muted-foreground">
                {category.name}
              </span>
              <span className="font-medium text-sm">
                {formatCurrency(quick.amount)}
              </span>
            </Button>
          );
        })}
      </CardContent>
    </Card>
  );
}

// 금액 포맷팅 헬퍼
function formatCurrency(amount: number): string {
  if (amount >= 10000) {
    const man = Math.floor(amount / 10000);
    const remainder = amount % 10000;
    if (remainder === 0) {
      return `${man}만원`;
    }
    const chun = Math.floor(remainder / 1000);
    if (chun > 0) {
      return `${man}.${chun}만원`;
    }
    return `${man}만원`;
  }
  return `${(amount / 1000).toFixed(0)}천원`;
}
