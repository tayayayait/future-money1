import { cn } from '@/lib/utils';
import { formatCurrency } from '@/lib/format';

interface AmountDisplayProps {
  value: number;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  showSign?: boolean;
  showColor?: boolean;
  className?: string;
}

const sizeClasses = {
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-lg',
  xl: 'text-xl',
  '2xl': 'text-2xl',
};

export function AmountDisplay({
  value,
  size = 'md',
  showSign = false,
  showColor = true,
  className,
}: AmountDisplayProps) {
  const colorClass = showColor
    ? value > 0
      ? 'text-success'
      : value < 0
        ? 'text-destructive'
        : 'text-foreground'
    : '';

  return (
    <span
      className={cn(
        'amount-display',
        sizeClasses[size],
        colorClass,
        className
      )}
    >
      {formatCurrency(value, showSign)}
    </span>
  );
}
