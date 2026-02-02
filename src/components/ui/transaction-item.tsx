import { cn } from '@/lib/utils';
import { CategoryIcon } from '@/components/ui/category-icon';
import { AmountDisplay } from '@/components/ui/amount-display';
import { formatDate } from '@/lib/format';
import { motion } from 'framer-motion';

import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface TransactionItemProps {
  id: string;
  categoryId: string;
  categoryName: string;
  amount: number;
  memo?: string;
  date: Date | string;
  isRecurring?: boolean;
  onClick?: () => void;
  onDelete?: (e: React.MouseEvent) => void;
  className?: string;
}

export function TransactionItem({
  categoryId,
  categoryName,
  amount,
  memo,
  date,
  isRecurring = false,
  onClick,
  onDelete,
  className,
}: TransactionItemProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        'flex items-center gap-3 p-3 rounded-lg bg-card border transition-colors group relative',
        onClick && 'cursor-pointer hover:bg-accent/50',
        className
      )}
      onClick={onClick}
    >
      <CategoryIcon categoryId={categoryId} size="md" />

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="font-medium truncate">{categoryName}</p>
          {isRecurring && (
            <span className="text-xs px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
              고정
            </span>
          )}
        </div>
        {memo && (
          <p className="text-sm text-muted-foreground truncate">{memo}</p>
        )}
      </div>

      <div className="text-right">
        <AmountDisplay value={amount} size="md" showSign />
        <p className="text-xs text-muted-foreground">
          {formatDate(date, 'short')}
        </p>
      </div>

      {onDelete && (
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-all absolute right-2"
          onClick={onDelete}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      )}
    </motion.div>
  );
}
