import type { Transaction } from '@/hooks/useTransactions';
import { getCategoryById } from './categories';
import { subDays } from 'date-fns';

export interface QuickTransaction {
  categoryId: string;
  amount: number;
  label: string;
  frequency: number;
}

/**
 * 최근 30일 거래를 분석하여 자주 쓰는 거래 패턴 추출
 */
export function getFrequentTransactions(
  transactions: Transaction[]
): QuickTransaction[] {
  if (transactions.length === 0) {
    return [];
  }

  // 최근 30일 거래만 필터링
  const thirtyDaysAgo = subDays(new Date(), 30);
  const recentTransactions = transactions.filter(t => {
    const txDate = new Date(t.transaction_date);
    return txDate >= thirtyDaysAgo;
  });

  if (recentTransactions.length === 0) {
    return [];
  }

  // 지출 거래만 (amount < 0)
  const expenses = recentTransactions.filter(t => t.amount < 0);

  // 카테고리별, 금액별로 그룹핑 (1000원 단위로 반올림)
  const grouped = new Map<string, Transaction[]>();

  expenses.forEach(tx => {
    const roundedAmount = Math.round(Math.abs(tx.amount) / 1000) * 1000;
    const key = `${tx.category_id}-${roundedAmount}`;
    
    if (!grouped.has(key)) {
      grouped.set(key, []);
    }
    grouped.get(key)!.push(tx);
  });

  // 빈도수 기준으로 정렬 및 변환
  const frequentTransactions = Array.from(grouped.entries())
    .map(([key, txs]) => {
      const categoryId = txs[0].category_id;
      const category = getCategoryById(categoryId);
      
      // 평균 금액 계산
      const avgAmount = Math.round(
        txs.reduce((sum, t) => sum + Math.abs(t.amount), 0) / txs.length
      );

      return {
        categoryId,
        amount: avgAmount,
        label: `${category.name} ${formatAmount(avgAmount)}`,
        frequency: txs.length,
      };
    })
    .filter(item => item.frequency >= 2) // 최소 2회 이상
    .sort((a, b) => b.frequency - a.frequency) // 빈도수 내림차순
    .slice(0, 5); // 상위 5개만

  return frequentTransactions;
}

/**
 * 금액 포맷팅 (만원 단위)
 */
function formatAmount(amount: number): string {
  if (amount >= 10000) {
    const man = Math.floor(amount / 10000);
    const remainder = amount % 10000;
    if (remainder === 0) {
      return `${man}만원`;
    }
    return `${man}.${Math.floor(remainder / 1000)}만원`;
  }
  return `${(amount / 1000).toFixed(0)}천원`;
}
