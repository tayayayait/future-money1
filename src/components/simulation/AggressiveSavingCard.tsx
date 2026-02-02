import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CategoryIcon } from '@/components/ui/category-icon';
import { ChevronDown, ChevronUp, Lightbulb, Target } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

interface CategoryReduction {
  categoryId: string;
  categoryName: string;
  currentAmount: number;
  targetAmount: number;
  reductionAmount: number;
  reductionPercentage: number;
  difficulty: 'easy' | 'moderate' | 'hard';
  tips: string[];
}

interface AggressiveSavingCardProps {
  categoryReductions: CategoryReduction[];
  savingsRationale?: string;
  totalCurrentExpense: number;
  totalTargetExpense: number;
}

const difficultyConfig = {
  easy: { label: '쉬움', emoji: '🟢', color: 'text-green-600', bgColor: 'bg-green-100' },
  moderate: { label: '보통', emoji: '🟡', color: 'text-yellow-600', bgColor: 'bg-yellow-100' },
  hard: { label: '어려움', emoji: '🔴', color: 'text-red-600', bgColor: 'bg-red-100' },
};

export function AggressiveSavingCard({
  categoryReductions,
  savingsRationale,
  totalCurrentExpense,
  totalTargetExpense,
}: AggressiveSavingCardProps) {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(() => {
    // 절감액이 가장 큰 항목을 기본으로 펼침
    if (categoryReductions.length > 0) {
      const topReduction = categoryReductions.reduce((prev, current) => 
        (prev.reductionAmount > current.reductionAmount) ? prev : current
      );
      return new Set([topReduction.categoryId]);
    }
    return new Set();
  });

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId);
      } else {
        newSet.add(categoryId);
      }
      return newSet;
    });
  };

  const totalReduction = totalCurrentExpense - totalTargetExpense;
  const reductionPercentage = ((totalReduction / totalCurrentExpense) * 100).toFixed(1);

  return (
    <Card className="mt-6 border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Target className="w-6 h-6 text-primary" />
          <CardTitle className="text-xl">맞춤형 절약 가이드</CardTitle>
        </div>
        <p className="text-sm text-muted-foreground mt-2">
          거래 내역 분석을 통해 생성된 실행 가능한 절약 계획입니다
        </p>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* 전체 요약 */}
        <div className="bg-card rounded-lg p-4 border">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-muted-foreground">절감 목표</span>
            <div className="text-right">
              <div className="text-2xl font-bold text-primary">
                -{Math.round(totalReduction / 10000)}만원
              </div>
              <div className="text-xs text-muted-foreground">
                월 지출 {reductionPercentage}% 감소
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>현재 월평균 지출</span>
              <span className="font-medium">{Math.round(totalCurrentExpense / 10000)}만원</span>
            </div>
            <Progress value={100} className="h-2" />
            <div className="flex justify-between text-sm">
              <span className="text-primary font-medium">목표 지출</span>
              <span className="font-bold text-primary">{Math.round(totalTargetExpense / 10000)}만원</span>
            </div>
            <Progress value={(totalTargetExpense / totalCurrentExpense) * 100} className="h-2" />
          </div>
        </div>

        {/* 전체 전략 설명 */}
        {savingsRationale && (
          <div className="bg-blue-50 dark:bg-blue-950/20 rounded-lg p-4 border border-blue-200 dark:border-blue-900">
            <div className="flex items-start gap-2">
              <Lightbulb className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-blue-900 dark:text-blue-100 whitespace-pre-line">
                {savingsRationale}
              </div>
            </div>
          </div>
        )}

        {/* 카테고리별 절감 계획 */}
        <div className="space-y-3">
          <h3 className="font-semibold text-sm flex items-center gap-2">
            <span>카테고리별 절약 계획</span>
            <Badge variant="secondary" className="text-xs">
              {categoryReductions.length}개 항목
            </Badge>
          </h3>

          {categoryReductions.map((reduction) => {
            const isExpanded = expandedCategories.has(reduction.categoryId);
            const difficultyInfo = difficultyConfig[reduction.difficulty];
            const achievementRate = ((reduction.currentAmount - reduction.targetAmount) / reduction.currentAmount) * 100;

            return (
              <Card
                key={reduction.categoryId}
                className="overflow-hidden transition-all hover:shadow-md cursor-pointer"
                onClick={() => toggleCategory(reduction.categoryId)}
              >
                <CardContent className="p-4">
                  {/* 카테고리 헤더 */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1">
                      <CategoryIcon categoryId={reduction.categoryId} size="sm" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{reduction.categoryName}</span>
                          <Badge
                            variant="secondary"
                            className={cn('text-xs px-2 py-0', difficultyInfo.bgColor, difficultyInfo.color)}
                          >
                            {difficultyInfo.emoji} {difficultyInfo.label}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                          <span>{Math.round(reduction.currentAmount / 10000)}만원</span>
                          <span>→</span>
                          <span className="font-medium text-primary">
                            {Math.round(reduction.targetAmount / 10000)}만원
                          </span>
                          <span className="text-destructive font-medium">
                            (-{Math.round(reduction.reductionAmount / 10000)}만원)
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-bold text-destructive">
                          -{reduction.reductionPercentage.toFixed(0)}%
                        </div>
                      </div>
                      {isExpanded ? (
                        <ChevronUp className="w-5 h-5 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-muted-foreground" />
                      )}
                    </div>
                  </div>

                  {/* 진행률 바 */}
                  <div className="mt-3">
                    <Progress value={achievementRate} className="h-1.5" />
                  </div>

                  {/* 확장된 내용 - 절약 팁 */}
                  {isExpanded && reduction.tips.length > 0 && (
                    <div className="mt-4 pt-4 border-t">
                      <div className="text-xs font-medium text-muted-foreground mb-2">
                        💡 절약 팁
                      </div>
                      <ul className="space-y-1.5">
                        {reduction.tips.map((tip, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-sm">
                            <span className="text-primary mt-1">•</span>
                            <span className="flex-1">{tip}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* 실천 가이드 */}
        <div className="bg-muted/50 rounded-lg p-4 text-sm">
          <div className="font-medium mb-2">📋 실천 가이드</div>
          <ul className="space-y-1 text-muted-foreground">
            <li>• 쉬움 난이도 항목부터 시작하면 빠른 성과를 경험할 수 있습니다</li>
            <li>• 한 번에 모든 카테고리를 줄이기보다, 1-2개씩 단계적으로 실천하세요</li>
            <li>• 매주 지출을 확인하며 목표 달성도를 점검하세요</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
