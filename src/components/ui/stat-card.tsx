import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { AmountDisplay } from '@/components/ui/amount-display';
import { type LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: number;
  subtitle?: string;
  icon?: LucideIcon;
  iconColorClass?: string;
  trend?: {
    value: number;
    label?: string;
  };
  variant?: 'default' | 'glass';
  className?: string;
}

export function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  iconColorClass = 'text-primary',
  trend,
  variant = 'default',
  className,
}: StatCardProps) {
  return (
    <Card
      className={cn(
        'overflow-hidden',
        variant === 'glass' && 'card-glass',
        className
      )}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">{title}</p>
            <AmountDisplay value={value} size="xl" showColor={false} />
            {subtitle && (
              <p className="text-xs text-muted-foreground">{subtitle}</p>
            )}
          </div>

          {Icon && (
            <div className={cn('p-2 rounded-lg bg-muted/50', iconColorClass)}>
              <Icon className="w-5 h-5" />
            </div>
          )}
        </div>

        {trend && (
          <div className="mt-3 pt-3 border-t">
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  'text-sm font-medium',
                  trend.value >= 0 ? 'text-success' : 'text-destructive'
                )}
              >
                {trend.value >= 0 ? '+' : ''}
                {trend.value.toFixed(1)}%
              </span>
              {trend.label && (
                <span className="text-xs text-muted-foreground">
                  {trend.label}
                </span>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
