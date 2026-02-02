import { useState, useEffect } from 'react';
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { usePendingRecurringTransactions, useCopyRecurringTransactions } from '@/hooks/useRecurringTransaction';
import { getCategoryById } from '@/lib/categories';
import { formatNumber } from '@/lib/format';
import { Loader2, CalendarClock } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

export function RecurringExpenseModal() {
  const { data: pendingTransactions, isLoading } = usePendingRecurringTransactions();
  const { mutate: copyTransactions, isPending: isCopying } = useCopyRecurringTransactions();
  
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [hasOpenedThisSession, setHasOpenedThisSession] = useState(false);

  // 데이터가 로드되면 모달 열기 (세션당 1회 또는 로직에 따라)
  useEffect(() => {
    if (!isLoading && pendingTransactions && pendingTransactions.length > 0) {
      // 이미 이번 세션에서 닫았는지 확인 (sessionStorage 사용)
      const ignored = sessionStorage.getItem('ignore_recurring_modal');
      if (!ignored && !hasOpenedThisSession) {
        setIsOpen(true);
        setSelectedIds(pendingTransactions.map(t => t.id));
        setHasOpenedThisSession(true);
      }
    }
  }, [pendingTransactions, isLoading, hasOpenedThisSession]);

  const handleClose = () => {
    setIsOpen(false);
    sessionStorage.setItem('ignore_recurring_modal', 'true');
  };

  const handleConfirm = () => {
    if (!pendingTransactions) return;
    
    const transactionsToCopy = pendingTransactions.filter(t => selectedIds.includes(t.id));
    
    copyTransactions(transactionsToCopy, {
      onSuccess: () => {
        setIsOpen(false);
      }
    });
  };

  const toggleSelection = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) 
        ? prev.filter(i => i !== id)
        : [...prev, id]
    );
  };

  if (!pendingTransactions || pendingTransactions.length === 0) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-primary/10 rounded-full">
              <CalendarClock className="w-5 h-5 text-primary" />
            </div>
            <DialogTitle>지난달 고정 지출이 있어요</DialogTitle>
          </div>
          <DialogDescription>
            이번 달({new Date().getMonth() + 1}월)에도 동일하게 적용하시겠어요?
            <br />
            변동된 내역은 체크를 해제해주세요.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-3">
          <div className="bg-muted/30 rounded-lg p-3 max-h-[300px] overflow-y-auto space-y-2">
            {pendingTransactions.map((tx) => {
              const category = getCategoryById(tx.category_id);
              const isSelected = selectedIds.includes(tx.id);
              
              return (
                <motion.div 
                  key={tx.id}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center space-x-3 p-2 rounded-md bg-card border hover:border-primary/50 transition-colors"
                >
                  <Checkbox 
                    id={`tx-${tx.id}`} 
                    checked={isSelected}
                    onCheckedChange={() => toggleSelection(tx.id)}
                  />
                  <div className="grid gap-1.5 leading-none flex-1">
                    <label
                      htmlFor={`tx-${tx.id}`}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex justify-between w-full"
                    >
                      <span className="flex items-center gap-2">
                        <span>{category.name}</span>
                        {tx.memo && <span className="text-xs text-muted-foreground font-normal">({tx.memo})</span>}
                      </span>
                      <span className={tx.amount < 0 ? "text-destructive" : "text-success"}>
                        {formatNumber(tx.amount)}원
                      </span>
                    </label>
                  </div>
                </motion.div>
              );
            })}
          </div>
          
          <div className="flex justify-between items-center px-2 text-sm text-muted-foreground">
            <span>선택된 항목: {selectedIds.length}건</span>
            <span>
              총 {formatNumber(pendingTransactions
                .filter(t => selectedIds.includes(t.id))
                .reduce((sum, t) => sum + t.amount, 0))}원
            </span>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={handleClose}>
            입력 안 함
          </Button>
          <Button onClick={handleConfirm} disabled={isCopying || selectedIds.length === 0}>
            {isCopying && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {selectedIds.length}건 한 번에 입력
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
