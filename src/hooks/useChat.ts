/**
 * 채팅 상담 커스텀 Hook
 * 
 * 사용자의 재정 컨텍스트를 포함하여 개인화된 AI 상담을 제공합니다.
 */
import { useState, useCallback, useMemo } from 'react';
import { ChatMessage, chatCompletion, type FinancialContext } from '@/lib/openai';
import type { Message } from '@/components/chat/ChatMessage';

// 재정 상담 시스템 프롬프트 생성
function buildSystemPrompt(context?: FinancialContext): string {
  const basePrompt = `당신은 친절하고 전문적인 AI 재정 상담사입니다.

역할:
- 사용자의 재정 관련 질문에 명확하고 실용적인 답변을 제공합니다
- 저축, 투자, 지출 관리, 예산 계획 등 다양한 재정 주제를 다룹니다
- 한국 금융 환경에 맞는 조언을 제공합니다
- 사용자의 실제 재정 데이터를 기반으로 맞춤형 조언을 제공합니다

응답 스타일:
1. 친근하면서도 전문적인 어투
2. 간결하고 핵심을 짚는 답변 (3-5문장 권장)
3. 사용자의 실제 수치를 언급하며 구체적으로 답변
4. 복잡한 개념은 쉽게 풀어서 설명
5. 이모지 사용 최소화 (있어도 1-2개)`;

  if (!context) {
    return basePrompt;
  }

  // 사용자 재정 정보 구성
  const savingsRate = context.savingsRate || 0;
  const monthlyBalance = context.monthlyIncome - context.monthlyExpense;

  let contextInfo = `

=== 현재 사용자의 재정 상태 ===
• 월 수입: ${context.monthlyIncome.toLocaleString()}원
• 월 지출: ${context.monthlyExpense.toLocaleString()}원
• 월 잔액: ${monthlyBalance >= 0 ? '+' : ''}${monthlyBalance.toLocaleString()}원
• 저축률: ${savingsRate.toFixed(1)}%`;

  if (context.netWorth !== undefined) {
    contextInfo += `
• 순자산: ${context.netWorth.toLocaleString()}원`;
  }

  if (context.topCategories && context.topCategories.length > 0) {
    contextInfo += `

주요 지출 카테고리:`;
    context.topCategories.forEach((cat, i) => {
      contextInfo += `
  ${i + 1}. ${cat.name}: ${cat.amount.toLocaleString()}원 (${cat.percentage.toFixed(1)}%)`;
    });
  }

  if (context.goals && context.goals.length > 0) {
    contextInfo += `

재정 목표:`;
    context.goals.forEach((goal, i) => {
      const progress = goal.targetAmount > 0 
        ? ((goal.currentAmount / goal.targetAmount) * 100).toFixed(1) 
        : '0';
      contextInfo += `
  ${i + 1}. ${goal.name}: ${goal.currentAmount.toLocaleString()}원 / ${goal.targetAmount.toLocaleString()}원 (${progress}% 달성)`;
    });
  }

  contextInfo += `
===========================

위 정보를 바탕으로 사용자의 질문에 개인화된 조언을 제공하세요. 사용자의 실제 데이터를 참조하여 구체적인 답변을 해주세요.`;

  return basePrompt + contextInfo;
}

// 고유 ID 생성
function generateId(): string {
  return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

interface UseChatOptions {
  financialContext?: FinancialContext;
}

export function useChat(options: UseChatOptions = {}) {
  const { financialContext } = options;
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 시스템 프롬프트 메모이제이션
  const systemPrompt = useMemo(() => {
    return buildSystemPrompt(financialContext);
  }, [financialContext]);

  // 메시지 전송
  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim() || isLoading) return;

    // 사용자 메시지 추가
    const userMessage: Message = {
      id: generateId(),
      role: 'user',
      content: content.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    setError(null);

    try {
      // 대화 히스토리 구성
      const chatMessages: ChatMessage[] = [
        { role: 'system', content: systemPrompt },
        ...messages.map(msg => ({
          role: msg.role as 'user' | 'assistant',
          content: msg.content,
        })),
        { role: 'user', content: content.trim() },
      ];

      // API 호출
      const response = await chatCompletion(chatMessages, {
        model: 'gpt-4o-mini',
        temperature: 0.7,
        maxTokens: 800,
      });

      // AI 응답 추가
      const assistantMessage: Message = {
        id: generateId(),
        role: 'assistant',
        content: response,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '응답을 가져오는 데 실패했습니다';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [messages, isLoading, systemPrompt]);

  // 대화 초기화
  const clearMessages = useCallback(() => {
    setMessages([]);
    setError(null);
  }, []);

  return {
    messages,
    isLoading,
    error,
    sendMessage,
    clearMessages,
  };
}

