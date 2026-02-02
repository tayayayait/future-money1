/**
 * 소비 패턴 분석 및 인사이트 생성 모듈
 */

import type { Transaction } from '@/hooks/useTransactions';
import { getCategoryById, EXPENSE_CATEGORIES } from '@/lib/categories';

// 인사이트 타입
export interface Insight {
  id: string;
  type: 'warning' | 'tip' | 'achievement' | 'info';
  title: string;
  description: string;
  icon?: string;
  actionLabel?: string;
  actionPath?: string;
  priority: number; // 1-10, 높을수록 중요
}

// 카테고리별 지출 요약
export interface CategorySpending {
  categoryId: string;
  categoryName: string;
  amount: number;
  percentage: number;
  transactionCount: number;
  trend?: 'up' | 'down' | 'stable'; // 전월 대비
  trendPercentage?: number;
}

// 소비 패턴 분석 결과
export interface SpendingAnalysis {
  totalIncome: number;
  totalExpense: number;
  savingsRate: number; // 저축률 (%)
  categoryBreakdown: CategorySpending[];
  topCategories: CategorySpending[];
  insights: Insight[];
  period: {
    startDate: string;
    endDate: string;
  };
}

/**
 * 거래 내역을 카테고리별로 그룹화
 */
export function groupTransactionsByCategory(transactions: Transaction[]): CategorySpending[] {
  const categoryMap = new Map<string, { amount: number; count: number }>();
  let totalExpense = 0;

  // 지출 거래만 필터링
  const expenses = transactions.filter(t => t.amount < 0);

  expenses.forEach(t => {
    const absAmount = Math.abs(t.amount);
    totalExpense += absAmount;
    
    const existing = categoryMap.get(t.category_id) || { amount: 0, count: 0 };
    categoryMap.set(t.category_id, {
      amount: existing.amount + absAmount,
      count: existing.count + 1,
    });
  });

  const breakdown: CategorySpending[] = [];

  categoryMap.forEach((data, categoryId) => {
    const category = getCategoryById(categoryId);
    breakdown.push({
      categoryId,
      categoryName: category?.name || '기타',
      amount: data.amount,
      percentage: totalExpense > 0 ? (data.amount / totalExpense) * 100 : 0,
      transactionCount: data.count,
    });
  });

  // 금액 기준 내림차순 정렬
  return breakdown.sort((a, b) => b.amount - a.amount);
}

/**
 * 인사이트 생성
 */
export function generateInsights(
  currentTransactions: Transaction[],
  previousTransactions: Transaction[],
  monthlyIncome: number
): Insight[] {
  const insights: Insight[] = [];
  let insightId = 0;

  // 현재 월 분석
  const currentBreakdown = groupTransactionsByCategory(currentTransactions);
  const previousBreakdown = groupTransactionsByCategory(previousTransactions);
  
  const currentTotalExpense = currentTransactions
    .filter(t => t.amount < 0)
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);

  const previousTotalExpense = previousTransactions
    .filter(t => t.amount < 0)
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);

  // 1. 전월 대비 총 지출 변화
  if (previousTotalExpense > 0) {
    const changeRate = ((currentTotalExpense - previousTotalExpense) / previousTotalExpense) * 100;
    
    if (changeRate > 20) {
      insights.push({
        id: `insight-${++insightId}`,
        type: 'warning',
        title: '지출 증가 알림',
        description: `이번 달 지출이 지난달 대비 ${changeRate.toFixed(0)}% 증가했어요. 지출 내역을 확인해보세요.`,
        priority: 8,
        actionLabel: '거래 내역 보기',
        actionPath: '/transactions',
      });
    } else if (changeRate < -10) {
      insights.push({
        id: `insight-${++insightId}`,
        type: 'achievement',
        title: '지출 절감 성공! 🎉',
        description: `이번 달 지출이 지난달 대비 ${Math.abs(changeRate).toFixed(0)}% 감소했어요. 잘하고 있어요!`,
        priority: 6,
      });
    }
  }

  // 2. 저축률 분석
  if (monthlyIncome > 0) {
    const savingsRate = ((monthlyIncome - currentTotalExpense) / monthlyIncome) * 100;
    
    if (savingsRate < 10) {
      insights.push({
        id: `insight-${++insightId}`,
        type: 'warning',
        title: '저축률이 낮아요',
        description: `현재 저축률이 ${savingsRate.toFixed(0)}%예요. 비상금 마련을 위해 저축을 늘려보세요.`,
        priority: 9,
        actionLabel: '시뮬레이션 보기',
        actionPath: '/simulation',
      });
    } else if (savingsRate >= 30) {
      insights.push({
        id: `insight-${++insightId}`,
        type: 'achievement',
        title: '훌륭한 저축률! 💪',
        description: `저축률 ${savingsRate.toFixed(0)}%! 재정 건전성이 매우 좋습니다.`,
        priority: 5,
      });
    }
  }

  // 3. 카테고리별 과소비 감지
  currentBreakdown.forEach(current => {
    const previous = previousBreakdown.find(p => p.categoryId === current.categoryId);
    
    if (previous && previous.amount > 0) {
      const categoryChange = ((current.amount - previous.amount) / previous.amount) * 100;
      
      if (categoryChange > 50 && current.amount > 100000) {
        insights.push({
          id: `insight-${++insightId}`,
          type: 'tip',
          title: `${current.categoryName} 지출 증가`,
          description: `${current.categoryName} 지출이 지난달 대비 ${categoryChange.toFixed(0)}% 증가했어요. 줄이면 월 ${Math.round((current.amount - previous.amount) / 10000)}만원 절약!`,
          priority: 7,
        });
      }
    }
  });

  // 4. 상위 지출 카테고리 팁
  if (currentBreakdown.length > 0) {
    const topCategory = currentBreakdown[0];
    if (topCategory.percentage > 40) {
      insights.push({
        id: `insight-${++insightId}`,
        type: 'info',
        title: `${topCategory.categoryName}이(가) 최대 지출`,
        description: `전체 지출의 ${topCategory.percentage.toFixed(0)}%가 ${topCategory.categoryName}이에요.`,
        priority: 4,
      });
    }
  }

  // 5. 고정 지출 패턴 감지
  const recurringTransactions = currentTransactions.filter(t => t.is_recurring);
  if (recurringTransactions.length > 0) {
    const recurringTotal = recurringTransactions.reduce((sum, t) => sum + Math.abs(t.amount), 0);
    insights.push({
      id: `insight-${++insightId}`,
      type: 'info',
      title: '고정 지출 패턴',
      description: `매월 반복되는 고정 지출이 ${(recurringTotal / 10000).toFixed(0)}만원 있어요.`,
      priority: 3,
    });
  }

  // 6. 거래가 없을 때
  if (currentTransactions.length === 0) {
    insights.push({
      id: `insight-${++insightId}`,
      type: 'tip',
      title: '거래 내역을 입력해주세요',
      description: '소비 패턴을 분석하려면 거래 내역이 필요해요. 오늘부터 시작해보세요!',
      priority: 10,
      actionLabel: '거래 입력하기',
      actionPath: '/add',
    });
  }

  // 우선순위 기준 정렬
  return insights.sort((a, b) => b.priority - a.priority);
}

/**
 * 전체 소비 패턴 분석
 */
export function analyzeSpending(
  currentTransactions: Transaction[],
  previousTransactions: Transaction[],
  monthlyIncome: number,
  period: { startDate: string; endDate: string }
): SpendingAnalysis {
  const totalIncome = currentTransactions
    .filter(t => t.amount >= 0)
    .reduce((sum, t) => sum + t.amount, 0) || monthlyIncome;

  const totalExpense = currentTransactions
    .filter(t => t.amount < 0)
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);

  const savingsRate = totalIncome > 0 
    ? ((totalIncome - totalExpense) / totalIncome) * 100 
    : 0;

  const categoryBreakdown = groupTransactionsByCategory(currentTransactions);
  const insights = generateInsights(currentTransactions, previousTransactions, monthlyIncome);

  return {
    totalIncome,
    totalExpense,
    savingsRate,
    categoryBreakdown,
    topCategories: categoryBreakdown.slice(0, 3),
    insights,
    period,
  };
}

/**
 * 인사이트 타입별 스타일 반환
 */
export function getInsightStyle(type: Insight['type']) {
  switch (type) {
    case 'warning':
      return {
        bgClass: 'bg-warning-light',
        borderClass: 'border-warning/20',
        iconClass: 'text-warning',
      };
    case 'tip':
      return {
        bgClass: 'bg-info-light',
        borderClass: 'border-info/20',
        iconClass: 'text-info',
      };
    case 'achievement':
      return {
        bgClass: 'bg-success-light',
        borderClass: 'border-success/20',
        iconClass: 'text-success',
      };
    case 'info':
    default:
      return {
        bgClass: 'bg-muted',
        borderClass: 'border-border',
        iconClass: 'text-muted-foreground',
      };
  }
}
