/**
 * OpenAI ChatGPT API 서비스
 * 
 * 재정 조언, 소비 패턴 분석, 맞춤형 인사이트 생성, 거래 자동 분류에 사용
 */

const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

// API 키 확인
export function isOpenAIConfigured(): boolean {
  return Boolean(OPENAI_API_KEY);
}

// 메시지 타입
export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

// API 응답 타입
interface OpenAIResponse {
  choices: {
    message: {
      content: string;
    };
  }[];
  usage?: {
    total_tokens: number;
  };
}

/**
 * ChatGPT API 호출
 */
export async function chatCompletion(
  messages: ChatMessage[],
  options: {
    model?: string;
    temperature?: number;
    maxTokens?: number;
  } = {}
): Promise<string> {
  if (!OPENAI_API_KEY) {
    throw new Error('OpenAI API 키가 설정되지 않았습니다');
  }

  const {
    model = 'gpt-4o-mini',
    temperature = 0.7,
    maxTokens = 1000,
  } = options;

  const response = await fetch(OPENAI_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model,
      messages,
      temperature,
      max_tokens: maxTokens,
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error?.message || `API 요청 실패: ${response.status}`);
  }

  const data: OpenAIResponse = await response.json();
  return data.choices[0]?.message?.content || '';
}

/**
 * 재정 조언 시스템 프롬프트
 */
const FINANCIAL_ADVISOR_SYSTEM_PROMPT = `당신은 전문적이고 친근한 개인 재정 상담사입니다.

역할:
- 사용자의 재정 상태를 분석하고 실용적인 조언을 제공합니다
- 긍정적이면서도 현실적인 톤으로 소통합니다
- 구체적이고 실행 가능한 제안을 합니다
- 수치와 데이터를 활용하여 명확하게 설명합니다

응답 가이드:
1. 간결하고 명료하게 (3-5 문장)
2. 실행 가능한 구체적 조언
3. 긍정적인 측면과 개선할 점을 균형있게
4. 이모지 사용 자제 (있어도 1-2개)
5. 친근하지만 전문적인 어투 유지`;

/**
 * 재정 조언 생성
 */
export async function getFinancialAdvice(
  context: {
    monthlyIncome: number;
    monthlyExpense: number;
    savingsRate: number;
    topCategories?: Array<{
      name: string;
      amount: number;
      percentage: number;
    }>;
    netWorth?: number;
    goals?: Array<{
      name: string;
      targetAmount: number;
      currentAmount: number;
    }>;
  },
  userQuestion?: string
): Promise<string> {
  const {
    monthlyIncome,
    monthlyExpense,
    savingsRate,
    topCategories = [],
    netWorth = 0,
    goals = [],
  } = context;

  const contextString = `
현재 재정 상태:
- 월 수입: ${monthlyIncome.toLocaleString()}원
- 월 지출: ${monthlyExpense.toLocaleString()}원
- 저축률: ${savingsRate.toFixed(1)}%
- 순자산: ${netWorth.toLocaleString()}원
${topCategories.length > 0 ? `
주요 지출 카테고리:
${topCategories.map(c => `- ${c.name}: ${c.amount.toLocaleString()}원 (${c.percentage.toFixed(1)}%)`).join('\n')}
` : ''}
${goals.length > 0 ? `
재정 목표:
${goals.map(g => `- ${g.name}: ${g.currentAmount.toLocaleString()}/${g.targetAmount.toLocaleString()}원`).join('\n')}
` : ''}`;

  const prompt = userQuestion || '현재 재정 상태를 분석하고 개선 방안을 제안해주세요.';

  const messages: ChatMessage[] = [
    { role: 'system', content: FINANCIAL_ADVISOR_SYSTEM_PROMPT },
    { role: 'user', content: `${contextString}\n\n${prompt}` },
  ];

  return chatCompletion(messages, {
    model: 'gpt-4o-mini',
    temperature: 0.7,
    maxTokens: 500,
  });
}

/**
 * 간단한 질문에 대한 AI 답변
 */
export async function askFinancialQuestion(question: string): Promise<string> {
  const messages: ChatMessage[] = [
    { role: 'system', content: FINANCIAL_ADVISOR_SYSTEM_PROMPT },
    { role: 'user', content: question },
  ];

  return chatCompletion(messages, {
    model: 'gpt-4o-mini',
    temperature: 0.7,
    maxTokens: 500,
  });
}

/**
 * 재정 컨텍스트 타입 export
 */
export interface FinancialContext {
  monthlyIncome: number;
  monthlyExpense: number;
  savingsRate: number;
  topCategories?: Array<{
    name: string;
    amount: number;
    percentage: number;
  }>;
  netWorth?: number;
  goals?: Array<{
    name: string;
    targetAmount: number;
    currentAmount: number;
  }>;
}

/**
 * AI 인사이트 생성 (특정 주제에 대한 조언)
 */
export async function generateAIInsight(
  context: FinancialContext,
  insightType: 'spending' | 'saving' | 'goal' | 'general' = 'general'
): Promise<string> {
  const prompts = {
    spending: '지출 패턴을 분석하고 개선 방안을 제안해주세요.',
    saving: '저축을 늘리기 위한 구체적인 방법을 제안해주세요.',
    goal: '재정 목표 달성을 위한 전략을 추천해주세요.',
    general: '현재 재정 상태에서 가장 주목해야 할 점을 알려주세요.',
  };

  return getFinancialAdvice(context, prompts[insightType]);
}

/**
 * 시뮬레이션 결과 기반 AI 조언 생성
 */
export async function getSimulationAdvice(
  context: {
    currentNetWorth: number;
    futureNetWorth: number;
    years: number;
    monthlyIncome: number;
    monthlyExpense: number;
    economicScenario: string;
    scenarioParams: {
      inflationRate: number;
      investmentReturn: number;
      incomeGrowth: number;
    };
  }
): Promise<string> {
  const {
    currentNetWorth,
    futureNetWorth,
    years,
    monthlyIncome,
    monthlyExpense,
    economicScenario,
    scenarioParams,
  } = context;

  const netWorthChange = futureNetWorth - currentNetWorth;
  const savingsRate = monthlyIncome > 0 ? ((monthlyIncome - monthlyExpense) / monthlyIncome) * 100 : 0;

  const contextString = `
현재 재정 상태:
- 현재 순자산: ${currentNetWorth.toLocaleString()}원
- 월 수입: ${monthlyIncome.toLocaleString()}원
- 월 지출: ${monthlyExpense.toLocaleString()}원
- 저축률: ${savingsRate.toFixed(1)}%

시뮬레이션 결과 (${years}년 후):
- 예상 순자산: ${futureNetWorth.toLocaleString()}원
- 순자산 변화: ${netWorthChange >= 0 ? '+' : ''}${netWorthChange.toLocaleString()}원
- 경제 시나리오: ${economicScenario}
- 가정 (물가 ${scenarioParams.inflationRate}%, 투자수익률 ${scenarioParams.investmentReturn}%, 소득증가율 ${scenarioParams.incomeGrowth}%)`;

  const prompt = `위 시뮬레이션 결과를 분석하고, 재정 목표 달성을 위한 구체적이고 실행 가능한 조언을 3-4문장으로 제공해주세요. 긍정적인 부분과 개선이 필요한 부분을 균형있게 다뤄주세요.`;

  const messages: ChatMessage[] = [
    { role: 'system', content: FINANCIAL_ADVISOR_SYSTEM_PROMPT },
    { role: 'user', content: `${contextString}\n\n${prompt}` },
  ];

  return chatCompletion(messages, {
    model: 'gpt-4o-mini',
    temperature: 0.7,
    maxTokens: 600,
  });
}

/**
 * 거래 설명을 기반으로 카테고리 자동 분류
 */
export async function classifyTransaction(
  description: string,
  type: 'expense' | 'income'
): Promise<string> {
  if (!description || description.trim().length === 0) {
    return ''; // 빈 설명이면 분류하지 않음
  }

  // 카테고리 목록 (categories.ts와 동기화)
  const expenseCategories = [
    { id: 'food', name: '식비', examples: '식당, 카페, 배달, 식재료, 외식, 커피, 음료' },
    { id: 'transport', name: '교통', examples: '택시, 버스, 지하철, 기차, 주유, 주차, 톨게이트' },
    { id: 'shopping', name: '쇼핑', examples: '의류, 신발, 화장품, 생필품, 쿠팡, 쇼핑몰, 백화점' },
    { id: 'entertainment', name: '여가', examples: '영화, 게임, 취미, 여행, 콘서트, 레저' },
    { id: 'health', name: '건강', examples: '병원, 약국, 헬스장, 요가, 피트니스, 의약품' },
    { id: 'education', name: '교육', examples: '학원, 과외, 교재, 강의, 수강료, 도서' },
    { id: 'housing', name: '주거', examples: '월세, 관리비, 인테리어, 가구, 집수리' },
    { id: 'utilities', name: '공과금', examples: '전기, 수도, 가스, 통신, 인터넷, 휴대폰' },
    { id: 'savings', name: '저축', examples: '적금, 예금, 저축, 투자계좌 입금' },
    { id: 'investment', name: '투자', examples: '주식매수, 펀드, 코인, ETF, 투자' },
    { id: 'other', name: '기타', examples: '기타 지출' },
  ];

  const incomeCategories = [
    { id: 'salary', name: '급여', examples: '월급, 연봉, 보너스, 상여금' },
    { id: 'investment_income', name: '투자수익', examples: '주식배당, 이자, 투자수익, 매매차익' },
    { id: 'other_income', name: '기타수입', examples: '용돈, 선물, 환급, 부수입' },
  ];

  const categories = type === 'expense' ? expenseCategories : incomeCategories;
  const categoryList = categories.map(c => `- ${c.id} (${c.name}): ${c.examples}`).join('\n');

  const systemPrompt = `당신은 거래 내역을 분석하여 적절한 카테고리를 분류하는 AI입니다.

사용자가 입력한 거래 설명을 보고, 아래 카테고리 중 가장 적합한 하나를 선택하세요.

${type === 'expense' ? '지출 카테고리' : '수입 카테고리'}:
${categoryList}

규칙:
1. 거래 설명의 핵심 내용을 파악하여 가장 적합한 카테고리 ID만 반환하세요.
2. 반드시 위 목록에 있는 카테고리 ID만 사용하세요.
3. 응답은 카테고리 ID만 반환하고, 다른 설명은 포함하지 마세요.
4. 예시: "food", "transport", "shopping" 등`;

  const userPrompt = `거래 설명: "${description}"

위 거래는 어떤 카테고리에 해당하나요? (카테고리 ID만 반환)`;

  try {
    const response = await chatCompletion(
      [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      {
        model: 'gpt-4o-mini',
        temperature: 0.3, // 낮은 temperature로 일관성 있는 분류
        maxTokens: 20, // 카테고리 ID만 반환하므로 짧게
      }
    );

    // 응답에서 카테고리 ID 추출 (공백 제거 및 소문자 변환)
    const categoryId = response.trim().toLowerCase();

    // 유효한 카테고리 ID인지 확인
    if (categories.some(c => c.id === categoryId)) {
      return categoryId;
    }

    // 유효하지 않은 경우 기본 카테고리 반환
    return type === 'expense' ? 'other' : 'other_income';
  } catch (error) {
    console.error('AI 분류 오류:', error);
    // 오류 발생 시 빈 문자열 반환 (사용자가 직접 선택)
    return '';
  }
}
