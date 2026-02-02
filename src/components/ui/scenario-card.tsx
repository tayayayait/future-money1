import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AmountDisplay } from '@/components/ui/amount-display';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

type ScenarioType = 'current' | 'a' | 'b' | 'c';

interface ScenarioCardProps {
  id: string;
  type: ScenarioType;
  title: string;
  description?: string;
  netWorth: number;
  netWorthChange?: number;
  emergencyFund?: number;
  goalDate?: string;
  isRecommended?: boolean;
  isActive?: boolean;
  onClick?: () => void;
  className?: string;
}

const scenarioColors: Record<ScenarioType, string> = {
  current: 'bg-scenario-current',
  a: 'bg-scenario-a',
  b: 'bg-scenario-b',
  c: 'bg-scenario-c',
};

const scenarioLabels: Record<ScenarioType, string> = {
  current: '현재 유지',
  a: '조정안 A',
  b: '조정안 B',
  c: '조정안 C',
};

export function ScenarioCard({
  type,
  title,
  description,
  netWorth,
  netWorthChange,
  emergencyFund,
  goalDate,
  isRecommended = false,
  isActive = false,
  onClick,
  className,
}: ScenarioCardProps) {
  const TrendIcon =
    netWorthChange && netWorthChange > 0
      ? TrendingUp
      : netWorthChange && netWorthChange < 0
        ? TrendingDown
        : Minus;

  return (
    <Card
      className={cn(
        'relative overflow-hidden transition-all duration-200 min-w-[160px] p-0',
        onClick && 'cursor-pointer hover:shadow-md hover:-translate-y-0.5',
        isActive && 'ring-2 ring-primary bg-primary/5',
        className
      )}
      onClick={onClick}
    >
      {/* Color bar at top removed or minimized? Let's keep a tiny top border instead of a separate div if we want, 
          but actually the separate div is fine. Let's make it thinner. */}
      <div className={cn('h-1 w-full', scenarioColors[type])} />

      <CardContent className="p-3 text-center space-y-2">
        <Badge variant={isActive ? "default" : "secondary"} className="text-[10px] h-5 px-1.5 font-normal opacity-80">
          {title}
        </Badge>

        <div className="space-y-0.5">
           <div className="flex items-center justify-center gap-1">
             <span className="text-xl font-bold text-foreground tracking-tight">
               {Math.round(netWorth / 10000).toLocaleString()}
             </span>
             <span className="text-xs text-muted-foreground pb-0.5">만</span>
           </div>

          {netWorthChange !== undefined && netWorthChange !== 0 && (
            <div
              className={cn(
                'flex items-center justify-center gap-0.5 text-xs font-medium',
                netWorthChange > 0 ? 'text-success' : 'text-destructive'
              )}
            >
              <TrendIcon className="w-3 h-3" />
              <span>
                {Math.round(Math.abs(netWorthChange) / 10000).toLocaleString()}만
              </span>
            </div>
          )}
           {netWorthChange === 0 && (
             <div className="h-5"></div> // Spacer to keep height consistent
            )}
        </div>
      </CardContent>
    </Card>
  );
}
