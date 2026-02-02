import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { RefreshCw, TrendingUp, TrendingDown, AlertCircle } from 'lucide-react';
import { useEconomicData } from '@/hooks/useEconomicData';

interface EconomicDataCardProps {
  className?: string;
}

/**
 * 한국은행 경제 데이터 카드
 * 
 * 기준금리, 인플레이션율, 환율 등 실시간 경제 지표 표시
 */
export function EconomicDataCard({ className = '' }: EconomicDataCardProps) {
  const { data, isLoading, error, refetch } = useEconomicData();

  if (error) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-destructive" />
            경제 지표
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">{error}</p>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={refetch}
            className="mt-4"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            다시 시도
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">
          실시간 경제 지표
        </CardTitle>
        <Button
          variant="ghost"
          size="icon"
          onClick={refetch}
          disabled={isLoading}
          className="h-8 w-8"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        ) : data ? (
          <div className="space-y-4">
            {/* 기준금리 */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-primary/10">
                  <TrendingUp className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium">기준금리</p>
                  <p className="text-xs text-muted-foreground">한국은행</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold">{data.baseRate.toFixed(2)}%</p>
              </div>
            </div>

            {/* 인플레이션율 */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-orange-500/10">
                  {data.inflationRate > 3 ? (
                    <TrendingUp className="w-4 h-4 text-orange-500" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-green-500" />
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium">인플레이션율</p>
                  <p className="text-xs text-muted-foreground">전년 대비</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold">
                  {data.inflationRate > 0 ? '+' : ''}
                  {data.inflationRate.toFixed(2)}%
                </p>
              </div>
            </div>

            {/* 환율 */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-blue-500/10">
                  <TrendingUp className="w-4 h-4 text-blue-500" />
                </div>
                <div>
                  <p className="text-sm font-medium">원/달러 환율</p>
                  <p className="text-xs text-muted-foreground">매매기준율</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold">
                  ₩{data.exchangeRate.toLocaleString()}
                </p>
              </div>
            </div>

            {/* 추정 투자 수익률 */}
            <div className="pt-4 border-t">
              <p className="text-sm font-medium mb-3">예상 투자 수익률</p>
              <div className="grid grid-cols-3 gap-2">
                <div className="text-center p-2 rounded-lg bg-green-500/10">
                  <p className="text-xs text-muted-foreground mb-1">저위험</p>
                  <p className="text-sm font-bold text-green-600">
                    {data.estimatedReturn.low.toFixed(1)}%
                  </p>
                </div>
                <div className="text-center p-2 rounded-lg bg-yellow-500/10">
                  <p className="text-xs text-muted-foreground mb-1">중위험</p>
                  <p className="text-sm font-bold text-yellow-600">
                    {data.estimatedReturn.medium.toFixed(1)}%
                  </p>
                </div>
                <div className="text-center p-2 rounded-lg bg-red-500/10">
                  <p className="text-xs text-muted-foreground mb-1">고위험</p>
                  <p className="text-sm font-bold text-red-600">
                    {data.estimatedReturn.high.toFixed(1)}%
                  </p>
                </div>
              </div>
            </div>

            {/* 마지막 업데이트 시간 */}
            <div className="pt-2 flex items-center justify-between text-xs text-muted-foreground">
              <span>출처: 한국은행 ECOS</span>
              <span>
                업데이트: {new Date(data.fetchedAt).toLocaleTimeString('ko-KR')}
              </span>
            </div>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
