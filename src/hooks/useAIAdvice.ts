import { useState, useCallback } from 'react';
import { 
  getFinancialAdvice, 
  generateAIInsight, 
  askFinancialQuestion,
  isOpenAIConfigured,
  type FinancialContext,
} from '@/lib/openai';

interface UseAIAdviceReturn {
  advice: string | null;
  isLoading: boolean;
  error: string | null;
  isConfigured: boolean;
  fetchAdvice: (context: FinancialContext, question?: string) => Promise<void>;
  fetchInsight: (context: FinancialContext, type?: 'spending' | 'saving' | 'goal' | 'general') => Promise<void>;
  askQuestion: (question: string) => Promise<void>;
  clearAdvice: () => void;
}

/**
 * AI 재정 조언 훅
 * 
 * @example
 * const { advice, isLoading, fetchAdvice } = useAIAdvice();
 * 
 * const handleGetAdvice = () => {
 *   fetchAdvice({
 *     monthlyIncome: 3500000,
 *     monthlyExpense: 2100000,
 *     savingsRate: 40,
 *     topCategories: [...],
 *     netWorth: 45000000,
 *   });
 * };
 */
export function useAIAdvice(): UseAIAdviceReturn {
  const [advice, setAdvice] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isConfigured = isOpenAIConfigured();

  const fetchAdvice = useCallback(async (context: FinancialContext, question?: string) => {
    if (!isConfigured) {
      setError('OpenAI API가 설정되지 않았습니다');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await getFinancialAdvice(context, question);
      setAdvice(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : '조언 생성 중 오류가 발생했습니다');
      console.error('AI Advice Error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [isConfigured]);

  const fetchInsight = useCallback(async (
    context: FinancialContext, 
    type: 'spending' | 'saving' | 'goal' | 'general' = 'general'
  ) => {
    if (!isConfigured) {
      setError('OpenAI API가 설정되지 않았습니다');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await generateAIInsight(context, type);
      setAdvice(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : '인사이트 생성 중 오류가 발생했습니다');
      console.error('AI Insight Error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [isConfigured]);

  const askQuestion = useCallback(async (question: string) => {
    if (!isConfigured) {
      setError('OpenAI API가 설정되지 않았습니다');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await askFinancialQuestion(question);
      setAdvice(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : '질문 처리 중 오류가 발생했습니다');
      console.error('AI Question Error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [isConfigured]);

  const clearAdvice = useCallback(() => {
    setAdvice(null);
    setError(null);
  }, []);

  return {
    advice,
    isLoading,
    error,
    isConfigured,
    fetchAdvice,
    fetchInsight,
    askQuestion,
    clearAdvice,
  };
}
