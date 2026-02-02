import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getCategoryById } from '@/lib/categories';

interface CategoryReduction {
  categoryId: string;
  categoryName: string;
  currentAmount: number;
  targetAmount: number;
  reductionAmount: number;
  reductionPercentage: number;
}

interface CategoryReductionChartProps {
  categoryReductions: CategoryReduction[];
}

export function CategoryReductionChart({ categoryReductions }: CategoryReductionChartProps) {
  // 차트 데이터 포맷팅
  const chartData = categoryReductions
    .sort((a, b) => b.currentAmount - a.currentAmount) // 현재 지출 큰 순으로 정렬
    .map(reduction => ({
      category: reduction.categoryName,
      '현재 월평균': Math.round(reduction.currentAmount / 10000), // 만원 단위
      '목표 지출': Math.round(reduction.targetAmount / 10000),
      절감액: Math.round(reduction.reductionAmount / 10000),
    }));

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card border rounded-lg shadow-lg p-3">
          <p className="font-medium text-sm mb-2">{payload[0].payload.category}</p>
          <div className="space-y-1 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-sm bg-blue-500" />
              <span>현재: {payload[0].value}만원</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-sm bg-green-500" />
              <span>목표: {payload[1].value}만원</span>
            </div>
            <div className="flex items-center gap-2 pt-1 border-t">
              <span className="font-medium text-destructive">
                절감: {payload[0].value - payload[1].value}만원
              </span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">카테고리별 현재 vs 목표 지출</CardTitle>
        <p className="text-xs text-muted-foreground">
          각 카테고리의 현재 지출과 목표 지출을 비교합니다
        </p>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={categoryReductions.length * 60 + 80}>
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ top: 5, right: 30, left: 10, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis 
              type="number" 
              className="text-xs"
              tickFormatter={(value) => `${value}만`}
            />
            <YAxis 
              type="category" 
              dataKey="category" 
              className="text-xs"
              width={80}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              wrapperStyle={{ fontSize: '12px' }}
              iconType="square"
            />
            <Bar 
              dataKey="현재 월평균" 
              fill="hsl(var(--chart-1))" 
              radius={[0, 4, 4, 0]}
              name="현재 월평균 지출"
            />
            <Bar 
              dataKey="목표 지출" 
              fill="hsl(var(--chart-2))" 
              radius={[0, 4, 4, 0]}
              name="목표 지출"
            />
          </BarChart>
        </ResponsiveContainer>

        {/* 범례 설명 */}
        <div className="mt-4 flex items-center justify-center gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm bg-chart-1" />
            <span>현재 월평균 지출</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm bg-chart-2" />
            <span>절약 후 목표 지출</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
