/**
 * 거래 내역 분석 엔진
 * 
 * 사용자의 지출 패턴을 분석하여 카테고리별 통계와 절약 가능성을 도출합니다.
 */

import { Transaction } from '@/hooks/useTransactions';
import { getCategoryById } from './categories';
import { startOfMonth, endOfMonth, subMonths, isWithinInterval } from 'date-fns';

export interface CategorySpending {
  categoryId: string;
  categoryName: string;
  totalAmount: number;
  avgMonthlyAmount: number;
  transactionCount: number;
  percentage: number;  // 전체 지출 대비 비중
  isRecurring: boolean; // 고정비 여부 (매월 유사한 금액이 지출되는지)
  savingsPotential: 'high' | 'medium' | 'low'; // 절약 가능성
}

export interface CategoryReduction {
  categoryId: string;
  categoryName: string;
  currentAmount: number;
  targetAmount: number;
  reductionAmount: number;
  reductionPercentage: number;
  difficulty: 'easy' | 'moderate' | 'hard';
  tips: string[];
}

export interface SpendingAnalysis {
  totalExpense: number;
  avgMonthlyExpense: number;
  categories: CategorySpending[];
  fixedExpenses: number;
  variableExpenses: number;
  analyzedMonths: number;
  periodStart: Date;
  periodEnd: Date;
}

/**
 * 특정 기간 동안의 거래 내역을 분석
 */
export function analyzeSpending(
  transactions: Transaction[],
  months: number = 3 // 기본값: 최근 3개월 (0 입력 시 '이번 달만' 분석)
): SpendingAnalysis {
  const now = new Date();
  // months가 0이면 이번 달 1일부터, 아니면 n개월 전 1일부터
  const periodStart = startOfMonth(subMonths(now, months));
  const periodEnd = endOfMonth(now);

  // 분석 기간 내 지출만 필터링 (수입 제외)
  const expenseTransactions = transactions.filter(t => {
    const transactionDate = new Date(t.transaction_date);
    const category = getCategoryById(t.category_id);
    
    // 지출 카테고리만 (저축, 투자는 제외)
    const isExpense = !['savings', 'investment', 'salary', 'investment_income', 'other_income'].includes(t.category_id);
    
    return isExpense && 
           t.amount !== 0 && 
           isWithinInterval(transactionDate, { start: periodStart, end: periodEnd });
  });

  if (expenseTransactions.length === 0) {
    return {
      totalExpense: 0,
      avgMonthlyExpense: 0,
      categories: [],
      fixedExpenses: 0,
      variableExpenses: 0,
      analyzedMonths: months,
      periodStart,
      periodEnd,
    };
  }

  // 카테고리별로 그룹화
  const categoryMap = new Map<string, Transaction[]>();
  expenseTransactions.forEach(t => {
    if (!categoryMap.has(t.category_id)) {
      categoryMap.set(t.category_id, []);
    }
    categoryMap.get(t.category_id)!.push(t);
  });

  // 지능형 기간 감지: 실제 데이터가 존재하는 '월'의 개수를 셉니다.
  // 1월 데이터만 있다 → 1로 나눔 (합계 유지)
  // 1월, 2월 데이터가 있다 → 2로 나눔
  // 3개월치 다 있다 → 3개월 평균
  let effectiveMonths = 1;
  
  if (expenseTransactions.length > 0) {
    const uniqueMonths = new Set(
      expenseTransactions.map(t => t.transaction_date.substring(0, 7)) // YYYY-MM
    );
    // 실제 데이터가 존재하는 월 수만 사용 (상한 제한 없음)
    effectiveMonths = uniqueMonths.size;
  }

  // 최소 1개월로 보장 (0으로 나누기 방지)
  effectiveMonths = Math.max(effectiveMonths, 1);

  console.log(`[spending-analyzer] 지능형 기간 감지: ${effectiveMonths}개월 데이터 발견`);

  // 전체 지출 계산 (절대값 사용)
  const totalExpense = expenseTransactions.reduce((sum, t) => sum + Math.abs(t.amount), 0);
  const avgMonthlyExpense = totalExpense / effectiveMonths;

  // 카테고리별 분석
  const categories: CategorySpending[] = [];
  let fixedExpenses = 0;
  let variableExpenses = 0;

  categoryMap.forEach((txns, categoryId) => {
    const category = getCategoryById(categoryId);
    const categoryName = category?.name || '기타';
    
    const categoryTotal = txns.reduce((sum, t) => sum + Math.abs(t.amount), 0);
    const avgMonthly = categoryTotal / effectiveMonths;
    const percentage = (categoryTotal / totalExpense) * 100;

    // 고정비 판별: 매월 거래가 있고, 금액 변동이 적은 경우
    const isRecurring = identifyRecurringExpense(txns, effectiveMonths);
    
    // 절약 가능성 평가
    const savingsPotential = evaluateSavingsPotential(categoryId, percentage, isRecurring);

    if (isRecurring) {
      fixedExpenses += categoryTotal;
    } else {
      variableExpenses += categoryTotal;
    }

    categories.push({
      categoryId,
      categoryName,
      totalAmount: categoryTotal,
      avgMonthlyAmount: avgMonthly,
      transactionCount: txns.length,
      percentage,
      isRecurring,
      savingsPotential,
    });
  });

  // 비중 순으로 정렬
  categories.sort((a, b) => b.totalAmount - a.totalAmount);

  return {
    totalExpense,
    avgMonthlyExpense,
    categories,
    fixedExpenses,
    variableExpenses,
    analyzedMonths: effectiveMonths, // 실제 분석된 월 수 반환
    periodStart,
    periodEnd,
  };
}

/**
 * 고정비 여부 판별
 * - 매월 거래가 있는지
 * - 금액 변동 계수(CV)가 낮은지
 */
function identifyRecurringExpense(transactions: Transaction[], totalMonths: number): boolean {
  if (transactions.length < 2) return false;

  // 월별로 그룹화
  const monthlyTotals = new Map<string, number>();
  transactions.forEach(t => {
    const monthKey = t.transaction_date.substring(0, 7); // YYYY-MM
    monthlyTotals.set(monthKey, (monthlyTotals.get(monthKey) || 0) + Math.abs(t.amount));
  });

  // 매월 거래가 있는지 확인 (최소 70% 이상의 월에 거래)
  const monthsWithTransactions = monthlyTotals.size;
  if (monthsWithTransactions < totalMonths * 0.7) {
    return false;
  }

  // 변동 계수(CV = 표준편차 / 평균) 계산
  const amounts = Array.from(monthlyTotals.values());
  const mean = amounts.reduce((sum, val) => sum + val, 0) / amounts.length;
  const variance = amounts.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / amounts.length;
  const stdDev = Math.sqrt(variance);
  const cv = stdDev / mean;

  // CV가 0.3 이하면 고정비로 판단 (변동이 적음)
  return cv <= 0.3;
}

/**
 * 절약 가능성 평가
 */
function evaluateSavingsPotential(
  categoryId: string,
  percentage: number,
  isRecurring: boolean
): 'high' | 'medium' | 'low' {
  // 고정비는 절약이 어려움
  if (isRecurring) {
    if (['housing', 'utilities'].includes(categoryId)) {
      return 'low'; // 주거, 공과금은 줄이기 매우 어려움
    }
    return 'medium';
  }

  // 변동비는 카테고리와 비중에 따라 판단
  if (['food', 'entertainment', 'shopping'].includes(categoryId)) {
    if (percentage > 20) {
      return 'high'; // 비중이 크면 절감 여지가 큼
    } else if (percentage > 10) {
      return 'medium';
    }
  }

  if (['transport', 'health', 'education'].includes(categoryId)) {
    return percentage > 15 ? 'medium' : 'low';
  }

  return 'low';
}

/**
 * 목표 저축 증가액을 달성하기 위한 카테고리별 절감 계획 생성
 */
export function generateCategoryReductions(
  analysis: SpendingAnalysis,
  targetMonthlySavingsIncrease: number
): CategoryReduction[] {
  const reductions: CategoryReduction[] = [];

  // 절약 가능성 높은 순으로 정렬
  const sortedCategories = [...analysis.categories].sort((a, b) => {
    const potentialOrder = { high: 3, medium: 2, low: 1 };
    const diff = potentialOrder[b.savingsPotential] - potentialOrder[a.savingsPotential];
    if (diff !== 0) return diff;
    return b.totalAmount - a.totalAmount; // 같으면 금액 큰 순
  });

  let remainingTarget = targetMonthlySavingsIncrease;

  for (const cat of sortedCategories) {
    if (remainingTarget <= 0) break;

    // 카테고리별 최대 절감 비율 설정
    const maxReductionRate = getMaxReductionRate(cat.categoryId, cat.savingsPotential);
    if (maxReductionRate === 0) continue;

    // 실제 절감 금액 계산
    const potentialReduction = cat.avgMonthlyAmount * maxReductionRate;
    const actualReduction = Math.min(potentialReduction, remainingTarget);
    const reductionPercentage = (actualReduction / cat.avgMonthlyAmount) * 100;

    if (actualReduction < 1000) continue; // 1,000원 미만은 스킵

    // 난이도 평가
    const difficulty = evaluateDifficulty(cat.savingsPotential, reductionPercentage);

    // 절약 팁 생성
    const tips = generateSavingsTipsForCategory(cat.categoryId, reductionPercentage);

    reductions.push({
      categoryId: cat.categoryId,
      categoryName: cat.categoryName,
      currentAmount: cat.avgMonthlyAmount,
      targetAmount: cat.avgMonthlyAmount - actualReduction,
      reductionAmount: actualReduction,
      reductionPercentage,
      difficulty,
      tips,
    });

    remainingTarget -= actualReduction;
  }

  return reductions;
}

/**
 * 카테고리별 최대 절감 가능 비율
 */
function getMaxReductionRate(categoryId: string, savingsPotential: string): number {
  const rates: Record<string, Record<string, number>> = {
    food: { high: 0.25, medium: 0.15, low: 0.10 },
    transport: { high: 0.20, medium: 0.10, low: 0.05 },
    shopping: { high: 0.40, medium: 0.25, low: 0.15 },
    entertainment: { high: 0.35, medium: 0.20, low: 0.10 },
    health: { high: 0.15, medium: 0.10, low: 0.05 },
    education: { high: 0.10, medium: 0.05, low: 0.0 },
    housing: { high: 0.05, medium: 0.03, low: 0.0 },
    utilities: { high: 0.10, medium: 0.05, low: 0.03 },
    other: { high: 0.20, medium: 0.10, low: 0.05 },
  };

  return rates[categoryId]?.[savingsPotential] || 0.10;
}

/**
 * 절약 난이도 평가
 */
function evaluateDifficulty(
  savingsPotential: string,
  reductionPercentage: number
): 'easy' | 'moderate' | 'hard' {
  if (savingsPotential === 'high' && reductionPercentage <= 20) {
    return 'easy';
  }
  
  if (savingsPotential === 'medium' || (savingsPotential === 'high' && reductionPercentage <= 30)) {
    return 'moderate';
  }

  return 'hard';
}

/**
 * 카테고리별 절약 팁 생성 (기본 템플릿)
 */
function generateSavingsTipsForCategory(categoryId: string, reductionPercentage: number): string[] {
  const tips: Record<string, string[]> = {
    food: [
      '외식 횟수를 줄이고 집에서 간단한 요리 시도하기',
      '마트는 장보기 리스트를 미리 작성하고 불필요한 충동구매 피하기',
      '배달 앱 대신 직접 포장하여 배달비 절약하기',
      '점심 도시락 준비로 한 끼 비용 50% 절감',
    ],
    transport: [
      '가까운 거리는 걷거나 자전거 이용하기',
      '대중교통 정기권 또는 할인 카드 활용',
      '카풀이나 공유 서비스 고려하기',
      '택시 대신 심야버스나 지하철 막차 활용',
    ],
    shopping: [
      '구매 전 24시간 대기 규칙으로 충동구매 방지',
      '필요한 물건 리스트 작성 후 계획적 구매',
      '세일 기간과 할인 쿠폰 적극 활용',
      '중고 거래 플랫폼에서 먼저 검색하기',
    ],
    entertainment: [
      '유료 구독 서비스 정리 (사용하지 않는 것 해지)',
      '무료 문화 프로그램과 이벤트 찾아보기',
      '영화관 대신 홈시어터, OTT 활용',
      '친구들과 모임 시 집에서 파티 열기',
    ],
    health: [
      '헬스장 대신 홈트레이닝 앱 활용',
      '영양제는 정말 필요한 것만 구매',
      '병원 진료 전 건강보험 혜택 확인',
    ],
    utilities: [
      '에너지 절약형 가전제품 사용',
      '사용하지 않는 전자기기 플러그 뽑기',
      '냉난방 온도 1도 조절로 10% 절약',
      '샤워 시간 줄이고 절수 샤워기 사용',
    ],
    housing: [
      '월세 재협상 또는 보증금 전환 고려',
      '룸메이트와 주거비 분담',
    ],
    education: [
      '온라인 무료 강의 플랫폼 활용 (유튜브, Coursera)',
      '도서관 이용으로 책 구매 비용 절감',
    ],
    other: [
      '지출 내역 정기적으로 검토하기',
      '불필요한 구독과 멤버십 해지',
    ],
  };

  const categoryTips = tips[categoryId] || tips.other;
  
  // 절감 비율에 따라 팁 개수 조정
  const tipCount = reductionPercentage > 25 ? 4 : reductionPercentage > 15 ? 3 : 2;
  
  return categoryTips.slice(0, tipCount);
}

/**
 * 분석 결과 요약 텍스트 생성
 */
export function generateAnalysisSummary(
  analysis: SpendingAnalysis,
  reductions: CategoryReduction[]
): string {
  const totalReduction = reductions.reduce((sum, r) => sum + r.reductionAmount, 0);
  const totalReductionPercentage = ((totalReduction / analysis.avgMonthlyExpense) * 100).toFixed(1);
  
  const topCategories = analysis.categories
    .slice(0, 3)
    .map(c => `${c.categoryName}(${c.percentage.toFixed(0)}%)`)
    .join(', ');

  // 1개월 데이터일 경우 "이번 달"로 자연스럽게 표현
  const periodText = analysis.analyzedMonths === 1 
    ? '이번 달' 
    : `최근 ${analysis.analyzedMonths}개월간`;
  let summary = `${periodText} 월평균 ${Math.round(analysis.avgMonthlyExpense / 10000)}만원을 지출하셨습니다.\n\n`;
  summary += `주요 지출 항목은 ${topCategories}입니다.\n\n`;
  summary += `${reductions.length}개 카테고리에서 총 월 ${Math.round(totalReduction / 10000)}만원(${totalReductionPercentage}%)을 절감할 수 있습니다.\n\n`;
  
  const easyCuts = reductions.filter(r => r.difficulty === 'easy');
  if (easyCuts.length > 0) {
    summary += `💡 먼저 ${easyCuts.map(r => r.categoryName).join(', ')}부터 시작하면 쉽게 절약할 수 있습니다.`;
  }

  return summary;
}
