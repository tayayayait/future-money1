import type { Transaction } from '@/hooks/useTransactions';
import type { Goal } from '@/hooks/useGoals';

/**
 * 거래 내역을 기반으로 목표 진행도 자동 계산
 * 
 * @param goal - 계산할 목표
 * @param transactions - 사용자의 모든 거래 내역
 * @returns 계산된 current_amount
 */
export function calculateGoalProgress(
  goal: Goal,
  transactions: Transaction[]
): number {
  // 목표 생성일 이후 거래만 집계
  const goalDate = new Date(goal.created_at);
  const relevantTransactions = transactions.filter(
    t => new Date(t.transaction_date) >= goalDate
  );

  switch (goal.type) {
    case 'savings':
      // 저축/투자 카테고리 수입만 집계
      return relevantTransactions
        .filter(t => ['savings', 'investment'].includes(t.category_id))
        .filter(t => t.amount > 0)
        .reduce((sum, t) => sum + t.amount, 0);
    
    case 'emergency':
    case 'emergency_fund':
      // 순저축 (수입 - 지출)
      const income = relevantTransactions
        .filter(t => t.amount > 0)
        .reduce((sum, t) => sum + t.amount, 0);
      const expense = relevantTransactions
        .filter(t => t.amount < 0)
        .reduce((sum, t) => sum + Math.abs(t.amount), 0);
      return Math.max(0, income - expense);
    
    case 'investment':
      // 투자 카테고리만 집계
      return relevantTransactions
        .filter(t => t.category_id === 'investment')
        .filter(t => t.amount > 0)
        .reduce((sum, t) => sum + t.amount, 0);
    
    default:
      // 알 수 없는 타입이거나 사용자 정의 목표는 현재 값 유지
      return goal.current_amount || 0;
  }
}

/**
 * 모든 목표의 진행도 일괄 계산
 * 
 * @param goals - 계산할 목표 목록
 * @param transactions - 사용자의 모든 거래 내역
 * @returns 진행도가 계산된 목표 목록
 */
export function calculateAllGoalsProgress(
  goals: Goal[],
  transactions: Transaction[]
): Goal[] {
  if (!goals.length || !transactions.length) {
    return goals;
  }

  return goals.map(goal => {
    try {
      return {
        ...goal,
        current_amount: calculateGoalProgress(goal, transactions),
      };
    } catch (error) {
      console.error(`Error calculating progress for goal ${goal.id}:`, error);
      // 오류 발생 시 기존 값 유지
      return goal;
    }
  });
}

/**
 * 목표 달성 여부 확인
 * 
 * @param goal - 확인할 목표
 * @returns 목표 달성 여부
 */
export function isGoalAchieved(goal: Goal): boolean {
  return goal.current_amount >= goal.target_amount;
}

/**
 * 목표 진행률 계산 (%)
 * 
 * @param goal - 계산할 목표
 * @returns 진행률 (0-100)
 */
export function calculateGoalProgressPercentage(goal: Goal): number {
  if (goal.target_amount === 0) return 0;
  return Math.min((goal.current_amount / goal.target_amount) * 100, 100);
}
