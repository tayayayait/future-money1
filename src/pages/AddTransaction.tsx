import { useState, useCallback, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { MainLayout } from '@/components/layout';
import { Button } from '@/components/ui/button';
import { CategoryIcon } from '@/components/ui/category-icon';
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '@/lib/categories';
import { formatNumber } from '@/lib/format';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { format, parseISO } from 'date-fns';
import { ko } from 'date-fns/locale';
import { CalendarIcon, X, Check, Delete, Loader2, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { useCreateTransaction, useUpdateTransaction, type Transaction } from '@/hooks/useTransactions';
import { classifyTransaction } from '@/lib/openai';

type TransactionType = 'expense' | 'income';

const numpadKeys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '00', '0', 'delete'];

export default function AddTransaction() {
  const navigate = useNavigate();
  const location = useLocation();
  const editingTransaction = (location.state as { transaction?: Transaction } | undefined)?.transaction;
  const isEditing = Boolean(editingTransaction);

  const [type, setType] = useState<TransactionType>(() =>
    editingTransaction ? (editingTransaction.amount < 0 ? 'expense' : 'income') : 'expense'
  );
  const [amount, setAmount] = useState(() =>
    editingTransaction ? Math.abs(editingTransaction.amount).toString() : ''
  );
  const [selectedCategory, setSelectedCategory] = useState<string | null>(
    editingTransaction ? editingTransaction.category_id : null
  );
  const [memo, setMemo] = useState(editingTransaction?.memo ?? '');
  const [date, setDate] = useState<Date>(
    editingTransaction ? parseISO(editingTransaction.transaction_date) : new Date()
  );
  const [isRecurring, setIsRecurring] = useState(editingTransaction?.is_recurring ?? false);
  const [isClassifying, setIsClassifying] = useState(false);
  const [suggestedCategory, setSuggestedCategory] = useState<string | null>(null);

  const createTransaction = useCreateTransaction();
  const updateTransaction = useUpdateTransaction();
  const categories = type === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;
  const isSaving = createTransaction.isPending || updateTransaction.isPending;

  // AI 자동 분류: memo가 변경되면 1초 후 자동 분류
  useEffect(() => {
    if (!memo || memo.trim().length < 2) {
      setSuggestedCategory(null);
      return;
    }

    const timer = setTimeout(async () => {
      setIsClassifying(true);
      try {
        const categoryId = await classifyTransaction(memo, type);
        if (categoryId) {
          setSuggestedCategory(categoryId);
          // 자동으로 선택하지 않고, 사용자가 수락하도록 제안만 함
        }
      } catch (error) {
        console.error('AI 분류 실패:', error);
      } finally {
        setIsClassifying(false);
      }
    }, 1000); // 1초 디바운스

    return () => clearTimeout(timer);
  }, [memo, type]);

  const handleNumpadClick = useCallback((key: string) => {
    if (key === 'delete') {
      setAmount(prev => prev.slice(0, -1));
    } else {
      setAmount(prev => {
        const newAmount = prev + key;
        // Limit to reasonable amount
        if (parseInt(newAmount) > 999999999) return prev;
        return newAmount;
      });
    }
  }, []);

  const handleSubmit = async () => {
    if (!amount || amount === '0') {
      toast.error('금액을 입력해주세요');
      return;
    }
    if (!selectedCategory) {
      toast.error('카테고리를 선택해주세요');
      return;
    }

    try {
      // 지출은 음수, 수입은 양수로 저장
      const signedAmount = type === 'expense' ? -parseInt(amount) : parseInt(amount);
      const payload = {
        category_id: selectedCategory,
        amount: signedAmount,
        memo: memo || undefined,
        transaction_date: format(date, 'yyyy-MM-dd'),
        is_recurring: isRecurring,
        recurring_day: isRecurring ? date.getDate() : undefined,
      };

      if (isEditing && editingTransaction) {
        await updateTransaction.mutateAsync({
          id: editingTransaction.id,
          ...payload,
        });
      } else {
        await createTransaction.mutateAsync(payload);
      }

      navigate(-1);
    } catch (error) {
      console.error('Transaction save error:', error);
      // Error toast is already handled by the hooks
    }
  };

  const displayAmount = amount ? formatNumber(parseInt(amount)) : '0';

  return (
    <MainLayout showNavigation={false}>
      <div className="flex flex-col h-screen">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <Button variant="ghost" size="icon" onClick={() => window.history.back()}>
            <X className="w-5 h-5" />
          </Button>
          <h1 className="font-semibold">{isEditing ? '거래 수정' : '거래 입력'}</h1>
          <Button variant="ghost" size="icon" onClick={handleSubmit} disabled={isSaving}>
            {isSaving ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Check className="w-5 h-5" />
            )}
          </Button>
        </div>

        {/* Type Toggle */}
        <Tabs value={type} onValueChange={(v) => setType(v as TransactionType)} className="p-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="expense">지출</TabsTrigger>
            <TabsTrigger value="income">수입</TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Amount Display */}
        <div className="px-6 py-4 text-center">
          <motion.div
            key={displayAmount}
            initial={{ scale: 1.05 }}
            animate={{ scale: 1 }}
            className={cn(
              'text-4xl font-bold',
              type === 'expense' ? 'text-destructive' : 'text-success'
            )}
          >
            {type === 'expense' ? '-' : '+'}
            {displayAmount}원
          </motion.div>
        </div>

        {/* Category Selection */}
        <div className="px-4 py-2">
          <p className="text-sm text-muted-foreground mb-3">카테고리</p>
          <div className="grid grid-cols-4 gap-3">
            <AnimatePresence mode="wait">
              {categories.map((cat) => (
                <motion.button
                  key={cat.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={cn(
                    'flex flex-col items-center gap-2 p-3 rounded-xl transition-all touch-target',
                    selectedCategory === cat.id
                      ? 'bg-primary/10 ring-2 ring-primary'
                      : 'bg-muted/50 hover:bg-muted'
                  )}
                >
                  <CategoryIcon categoryId={cat.id} size="md" />
                  <span className="text-xs">{cat.name}</span>
                </motion.button>
              ))}
            </AnimatePresence>
          </div>
        </div>

        {/* Options */}
        <div className="px-4 py-4 space-y-4">
          {/* Memo with AI Classification */}
          <div className="space-y-2">
            <div className="relative">
              <Input
                placeholder="메모 (예: 스타벅스 아메리카노)"
                value={memo}
                onChange={(e) => setMemo(e.target.value)}
                className="pr-10"
              />
              {isClassifying && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                </div>
              )}
            </div>
            
            {/* AI 카테고리 추천 */}
            {suggestedCategory && suggestedCategory !== selectedCategory && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 p-2 rounded-lg bg-primary/5 border border-primary/20"
              >
                <Sparkles className="w-4 h-4 text-primary flex-shrink-0" />
                <p className="text-sm flex-1">
                  <span className="text-muted-foreground">AI 추천: </span>
                  <span className="font-medium">
                    {categories.find(c => c.id === suggestedCategory)?.name}
                  </span>
                </p>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setSelectedCategory(suggestedCategory);
                    setSuggestedCategory(null);
                    toast.success('카테고리가 선택되었습니다');
                  }}
                  className="h-7 px-2 text-xs"
                >
                  적용
                </Button>
              </motion.div>
            )}
          </div>

          <div className="flex items-center justify-between">
            {/* Date Picker */}
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <CalendarIcon className="w-4 h-4" />
                  {format(date, 'M월 d일 (E)', { locale: ko })}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={(d) => d && setDate(d)}
                  locale={ko}
                />
              </PopoverContent>
            </Popover>

            {/* Recurring Toggle */}
            <div className="flex items-center gap-2">
              <Checkbox
                id="recurring"
                checked={isRecurring}
                onCheckedChange={(checked) => setIsRecurring(checked as boolean)}
              />
              <label htmlFor="recurring" className="text-sm cursor-pointer">
                고정비
              </label>
            </div>
          </div>
        </div>

        {/* Numpad */}
        <div className="mt-auto bg-muted/30 p-4">
          <div className="grid grid-cols-3 gap-2">
            {numpadKeys.map((key) => (
              <motion.button
                key={key}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleNumpadClick(key)}
                className={cn(
                  'h-14 rounded-xl font-medium text-lg transition-colors touch-target',
                  key === 'delete'
                    ? 'bg-destructive/10 text-destructive hover:bg-destructive/20'
                    : 'bg-card hover:bg-accent'
                )}
              >
                {key === 'delete' ? (
                  <Delete className="w-5 h-5 mx-auto" />
                ) : (
                  key
                )}
              </motion.button>
            ))}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
