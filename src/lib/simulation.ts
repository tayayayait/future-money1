/**
 * 미래 재정 시뮬레이션 엔진
 * 
 * 현재 소비 패턴을 기반으로 N년 후 순자산을 예측합니다.
 */

// 시뮬레이션 입력 데이터
// 시뮬레이션 입력 데이터
export interface AssetsBreakdown {
  cash: number;       // 현금성 자산 (예금 등)
  investment: number; // 투자 자산 (주식, 펀드 등)
  realEstate: number; // 부동산 (상승률 적용)
  debt: number;       // 부채 (이자율 적용)
}

export interface LifeEvent {
  date: Date;
  amount: number;
  name: string;
  type: 'expense' | 'asset_acquisition';
}

export interface SimulationInput {
  // 현재 재정 상태 (상세)
  assetsBreakdown?: AssetsBreakdown;
  
  // 기존 호환성 유지 (breakdown이 없을 경우 사용)
  currentNetWorth: number;         

  monthlyIncome: number;           // 월 수입
  monthlyExpense: number;          // 월 지출
  monthlySavings?: number;         // 월 저축 (선택, 없으면 수입-지출로 계산)
  
  // 생애 이벤트
  lifeEvents?: LifeEvent[];

  // 가정값
  annualInflationRate?: number;    // 연간 물가 상승률 (기본 2%)
  annualInvestmentReturn?: number; // 연간 투자 수익률 (기본 4%)
  annualIncomeGrowth?: number;     // 연간 소득 증가율 (기본 3%)
  annualDebtInterest?: number;     // 연간 대출 이자율 (기본 5%)
  annualRealEstateGrowth?: number; // 연간 부동산 상승률 (기본 3%)
  
  // 실제 데이터 사용 여부
  useRealEconomicData?: boolean;   // true시 ECOS API 사용, false시 가정값 사용 (기본: false)
  
  // 시뮬레이션 기간
  years: number;                   // 시뮬레이션 기간 (년)

  // 은퇴 설계
  currentAge?: number;             // 현재 나이 (기본: 30)
  retirementAge?: number;          // 은퇴 나이 (기본: 60)
  monthlyPension?: number;         // 예상 월 수령 연금액 (현재 가치 기준, 물가상승 반영)
}

// 월별 시뮬레이션 결과
export interface MonthlyProjection {
  month: number;                   // 몇 번째 달 (0 = 현재)
  date: Date;                      // 해당 월 날짜
  age: number;                     // 
  isRetired: boolean;              // 은퇴 여부
  netWorth: number;                // 순자산
  assets: AssetsBreakdown;         // 자산 상세
  monthlyIncome: number;           // 해당 월 수입
  monthlyExpense: number;          // 해당 월 지출
  monthlySavings: number;          // 해당 월 저축
  emergencyFundMonths: number;     // 비상금 (개월 수)
  events: string[];                // 해당 월 발생 이벤트
}

// ... (ScenarioAdjustment, ScenarioResult, SimulationResult interfaces remain similar but check runSimulation)

// 시ना리오 조정 옵션
export interface ScenarioAdjustment {
  id: string;
  name: string;
  description: string;
  
  // 조정 비율 (1.0 = 변동 없음, 0.8 = 20% 감소)
  expenseMultiplier?: number;      // 지출 조정
  savingsMultiplier?: number;      // 저축 조정
  incomeMultiplier?: number;       // 수입 조정
  
  // 또는 고정 금액 조정
  monthlyExpenseChange?: number;   // 월 지출 변경 금액
  monthlySavingsChange?: number;   // 월 저축 변경 금액
  
  // 공격적 저축 시나리오 상세 정보 (선택)
  categoryReductions?: Array<{     // 카테고리별 절감 계획
    categoryId: string;
    categoryName: string;
    currentAmount: number;
    targetAmount: number;
    reductionAmount: number;
    reductionPercentage: number;
    difficulty: 'easy' | 'moderate' | 'hard';
    tips: string[];
  }>;
  savingsRationale?: string;       // 절약 근거 설명
  aiGenerated?: boolean;           // AI 생성 여부
}

// 시나리오 결과
export interface ScenarioResult {
  id: string;
  name: string;
  description: string;
  adjustment: ScenarioAdjustment;
  
  // 최종 결과
  finalNetWorth: number;           // 최종 순자산
  netWorthChange: number;          // 기준 대비 순자산 변화
  goalAchievementDate?: Date;      // 목표 달성 예상 날짜
  emergencyFundMonths: number;     // 최종 비상금 (개월 수)
  
  // 월별 추이
  projections: MonthlyProjection[];
}

// 시뮬레이션 전체 결과
export interface SimulationResult {
  input: SimulationInput;
  baseline: ScenarioResult;        // 현재 유지 시나리오
  scenarios: ScenarioResult[];     // 비교 시나리오들
  createdAt: Date;
}

/**
 * 기본 시뮬레이션 실행
 */
export function runSimulation(input: SimulationInput): MonthlyProjection[] {
  const {
    currentNetWorth,
    assetsBreakdown = {
      cash: currentNetWorth,
      investment: 0,
      realEstate: 0,
      debt: 0
    },
    monthlyIncome,
    monthlyExpense,
    monthlySavings = monthlyIncome - monthlyExpense,
    lifeEvents = [],
    annualInflationRate = 0.02,
    annualInvestmentReturn = 0.04,
    annualIncomeGrowth = 0.03,
    annualDebtInterest = 0.05,
    annualRealEstateGrowth = 0.03,
    years,
    currentAge = 35, // Default age
    retirementAge = 65, // Default retirement age
    monthlyPension = 0 // Default pension
  } = input;

  const totalMonths = years * 12;
  const projections: MonthlyProjection[] = [];
  
  // 월별 증가율 계산
  const monthlyInflation = Math.pow(1 + annualInflationRate, 1/12) - 1;
  const monthlyReturn = Math.pow(1 + annualInvestmentReturn, 1/12) - 1;
  const monthlyIncomeGrowth = Math.pow(1 + annualIncomeGrowth, 1/12) - 1;
  const monthlyDebtInterest = Math.pow(1 + annualDebtInterest, 1/12) - 1;
  const monthlyRealEstateGrowth = Math.pow(1 + annualRealEstateGrowth, 1/12) - 1;

  // 초기 상태 설정
  let currentAssets = { ...assetsBreakdown };
  // 급여 소득 (현재 가치)
  let currentSalary = monthlyIncome;
  // 연금 소득 (현재 가치, 은퇴 전까진 0으로 취급하거나 별도 로직)
  // 여기서는 '현재 가치'로 입력받은 연금이 물가 상승에 따라 명목 금액이 커진다고 가정 (국민연금 등은 물가연동)
  // 따라서 연금 수령액도 Inflation 만큼 증가시킨다고 가정.
  let currentPensionValue = monthlyPension;

  let expense = monthlyExpense;
  // 저축율 보존을 위해 비율 계산? 아니면 amount 계산?
  // 여기서는 단순히 Income - Expense = Savings 구조 유지.
  
  const now = new Date();
  
  // 은퇴 시점 계산 (개월 수)
  const monthsToRetirement = (retirementAge - currentAge) * 12;

  for (let month = 0; month <= totalMonths; month++) {
    const date = new Date(now.getFullYear(), now.getMonth() + month, 1);
    const age = currentAge + Math.floor(month / 12);
    const isRetired = month >= monthsToRetirement;
    const monthEvents: string[] = [];
    
    // 현재 시점의 수입 결정
    // 은퇴 여부에 따라 수입원 변경
    // 은퇴 후: 급여 0 + 연금
    // 은퇴 전: 급여 + 연금 0
    const totalIncome = isRetired ? currentPensionValue : currentSalary;
    
    // 순자산 계산
    let netWorth = currentAssets.cash + currentAssets.investment + currentAssets.realEstate - currentAssets.debt;
       
    // 비상금
    const emergencyFundMonths = expense > 0 ? currentAssets.cash / expense : 0;
    
    // 저축액 = 수입 - 지출
    // 은퇴 후엔 지출이 수입보다 많으면 '마이너스 저축' (즉 자산 인출)
    let savings = totalIncome - expense;

    projections.push({
      month,
      date,
      age,
      isRetired,
      netWorth: Math.round(netWorth),
      assets: { ...currentAssets },
      monthlyIncome: Math.round(totalIncome),
      monthlyExpense: Math.round(expense),
      monthlySavings: Math.round(savings),
      emergencyFundMonths: Math.round(emergencyFundMonths * 10) / 10,
      events: monthEvents
    });
    
    if (month < totalMonths) {
      // --- 다음 달 계산 ---

      // 1. 이벤트 처리
      const eventsThisMonth = lifeEvents.filter(e => {
        const eDate = new Date(e.date);
        return eDate.getFullYear() === date.getFullYear() && eDate.getMonth() === date.getMonth();
      });

      eventsThisMonth.forEach(e => {
        let remainingCost = e.amount;
        monthEvents.push(`${e.name} (${e.type === 'asset_acquisition' ? '자산취득' : '지출'})`);

        // 자산 취득
        if (e.type === 'asset_acquisition') {
          currentAssets.realEstate += e.amount;
        }

        // 비용 지불 (현금 -> 투자금 -> 부채)
        if (currentAssets.cash >= remainingCost) {
          currentAssets.cash -= remainingCost;
          remainingCost = 0;
        } else {
          remainingCost -= currentAssets.cash;
          currentAssets.cash = 0;
        }

        if (remainingCost > 0) {
          if (currentAssets.investment >= remainingCost) {
            currentAssets.investment -= remainingCost;
            remainingCost = 0;
          } else {
            remainingCost -= currentAssets.investment;
            currentAssets.investment = 0;
          }
        }

        // 남은 비용은 빚으로
        if (remainingCost > 0) {
          currentAssets.debt += remainingCost;
        }
      });

      // 2. 자산 성장 및 이자
      currentAssets.investment *= (1 + monthlyReturn);
      currentAssets.realEstate *= (1 + monthlyRealEstateGrowth);
      currentAssets.debt *= (1 + monthlyDebtInterest);
      
      // 3. 자금 흐름 반영 (저축 or 인출)
      // savings가 양수면 현금 증가 (저축)
      // savings가 음수면 현금 감소 (인출), 현금 부족 시 투자금 매도
      if (savings >= 0) {
         currentAssets.cash += savings;
      } else {
         const deficit = Math.abs(savings);
         if (currentAssets.cash >= deficit) {
             currentAssets.cash -= deficit;
         } else {
             const remainingDeficit = deficit - currentAssets.cash;
             currentAssets.cash = 0;
             // 투자금에서 인출
             if (currentAssets.investment >= remainingDeficit) {
                 currentAssets.investment -= remainingDeficit;
             } else {
                 // 투자금도 바닥나면... 빚? 아니면 그냥 0? 
                 // 은퇴 후 파산 시나리오.
                 // 일단 투자금 0으로 만들고 나머지 빚을 늘릴지 고민.
                 // 현실적으로 '빚'이 늘어남 (생계형 대출).
                 currentAssets.debt += (remainingDeficit - currentAssets.investment);
                 currentAssets.investment = 0;
             }
         }
      }

      // 4. 다음 달 경제 지표 반영
      // 급여는 임금상승률 반영 (은퇴 전까지만 의미 있음, 하지만 변수 자체는 계속 증가시켜둠)
      currentSalary *= (1 + monthlyIncomeGrowth);
      
      // 연금은 물가상승률 반영 (실질 가치 보존 가정 시)
      currentPensionValue *= (1 + monthlyInflation);
      
      // 지출은 물가상승률 반영
      // 은퇴 후 지출 감소? (보통 은퇴 후 70% 수준이라고 하나, 일단은 동일 유지 or 마켓플레이스에서 조정)
      expense *= (1 + monthlyInflation);
    }
  }
  
  return projections;
}

/**
 * 시나리오 조정 적용 후 시뮬레이션
 */
export function runScenarioSimulation(
  input: SimulationInput,
  adjustment: ScenarioAdjustment
): ScenarioResult {
  // 조정된 입력값 계산
  let adjustedIncome = input.monthlyIncome;
  let adjustedExpense = input.monthlyExpense;
  
  if (adjustment.incomeMultiplier) {
    adjustedIncome *= adjustment.incomeMultiplier;
  }
  
  if (adjustment.expenseMultiplier) {
    adjustedExpense *= adjustment.expenseMultiplier;
  }
  
  if (adjustment.monthlyExpenseChange) {
    adjustedExpense += adjustment.monthlyExpenseChange;
  }
  
  let adjustedSavings = adjustedIncome - adjustedExpense;
  
  if (adjustment.savingsMultiplier) {
    adjustedSavings *= adjustment.savingsMultiplier;
  }
  
  if (adjustment.monthlySavingsChange) {
    adjustedSavings += adjustment.monthlySavingsChange;
  }
  
  // 시뮬레이션 실행
  const projections = runSimulation({
    ...input,
    monthlyIncome: adjustedIncome,
    monthlyExpense: adjustedExpense,
    monthlySavings: adjustedSavings,
  });
  
  const finalProjection = projections[projections.length - 1];
  
  return {
    id: adjustment.id,
    name: adjustment.name,
    description: adjustment.description,
    adjustment,
    finalNetWorth: finalProjection.netWorth,
    netWorthChange: 0, // baseline 대비 계산이 필요
    emergencyFundMonths: finalProjection.emergencyFundMonths,
    projections,
  };
}

/**
 * 전체 시뮬레이션 실행 (baseline + 시나리오들)
 */
export function runFullSimulation(
  input: SimulationInput,
  adjustments: ScenarioAdjustment[]
): SimulationResult {
  // 1. Baseline (현재 유지) 시뮬레이션
  const baselineProjections = runSimulation(input);
  const baselineFinal = baselineProjections[baselineProjections.length - 1];
  
  const baseline: ScenarioResult = {
    id: 'baseline',
    name: '현재 유지',
    description: '현재 소비 패턴을 유지할 경우',
    adjustment: {
      id: 'baseline',
      name: '현재 유지',
      description: '변경 없음',
    },
    finalNetWorth: baselineFinal.netWorth,
    netWorthChange: 0,
    emergencyFundMonths: baselineFinal.emergencyFundMonths,
    projections: baselineProjections,
  };
  
  // 2. 각 시나리오 시뮬레이션
  const scenarios = adjustments.map(adj => {
    const result = runScenarioSimulation(input, adj);
    // baseline 대비 변화량 계산
    result.netWorthChange = result.finalNetWorth - baseline.finalNetWorth;
    return result;
  });
  
  return {
    input,
    baseline,
    scenarios,
    createdAt: new Date(),
  };
}

/**
 * 경제 상황 시나리오 (Market Conditions)
 */
export interface EconomicScenario {
  id: 'neutral' | 'bull' | 'bear';
  name: string;
  emoji: string; // 🐻, 🐂, 😐
  description: string;
  params: {
    inflationRate: number;    // 물가상승률
    investmentReturn: number; // 투자수익률
    incomeGrowth: number;     // 소득증가율
    debtInterest: number;     // 대출이자율
    realEstateGrowth: number; // 부동산상승률
  };
}

export const ECONOMIC_SCENARIOS: Record<string, EconomicScenario> = {
  neutral: {
    id: 'neutral',
    name: '현재 추세',
    emoji: '😐',
    description: '최근 3년 평균 경제 지표를 반영합니다.',
    params: {
      inflationRate: 2.5,
      investmentReturn: 4.0,
      incomeGrowth: 3.0,
      debtInterest: 5.0,
      realEstateGrowth: 3.0,
    }
  },
  bull: {
    id: 'bull',
    name: '호황기 (Boom)',
    emoji: '🐂',
    description: '경제가 성장하고 자산 가치가 빠르게 상승합니다.',
    params: {
      inflationRate: 2.0,
      investmentReturn: 8.0,
      incomeGrowth: 5.0,
      debtInterest: 4.0,
      realEstateGrowth: 5.0,
    }
  },
  bear: {
    id: 'bear',
    name: '위기 (Crisis)',
    emoji: '🐻',
    description: '고물가와 경기 침체가 동시에 오는 상황입니다.',
    params: {
      inflationRate: 5.0,
      investmentReturn: -2.0, // 마이너스 수익률 (손실)
      incomeGrowth: 1.0,
      debtInterest: 7.0,
      realEstateGrowth: -1.0, // 부동산 하락
    }
  }
};

/**
 * 거래 내역 기반 공격적 저축 시나리오 생성
 */
export function generateAggressiveSavingScenario(
  spendingAnalysis: {
    avgMonthlyExpense: number;
    categories: Array<{
      categoryId: string;
      categoryName: string;
      avgMonthlyAmount: number;
      savingsPotential: 'high' | 'medium' | 'low';
    }>;
  },
  categoryReductions: Array<{
    categoryId: string;
    categoryName: string;
    currentAmount: number;
    targetAmount: number;
    reductionAmount: number;
    reductionPercentage: number;
    difficulty: 'easy' | 'moderate' | 'hard';
    tips: string[];
  }>,
  rationaleText: string
): ScenarioAdjustment {
  // 총 절감액 계산
  const totalReduction = categoryReductions.reduce((sum, r) => sum + r.reductionAmount, 0);
  const reductionPercentage = ((totalReduction / spendingAnalysis.avgMonthlyExpense) * 100).toFixed(1);

  return {
    id: 'aggressive-saving-custom',
    name: '맞춤형 공격적 저축',
    description: `거래 내역 분석 결과, 월 ${Math.round(totalReduction / 10000)}만원(${reductionPercentage}%) 절감 가능`,
    monthlyExpenseChange: -totalReduction,
    categoryReductions,
    savingsRationale: rationaleText,
    aiGenerated: false,
  };
}

/**
 * 기본 시나리오 프리셋
 */
export const DEFAULT_SCENARIOS: ScenarioAdjustment[] = [
  {
    id: 'aggressive-saving',
    name: '공격적 저축',
    description: '지출 20% 감소',
    expenseMultiplier: 0.8,
  },
];


/**
 * 차트용 데이터 포맷팅
 */
export function formatProjectionsForChart(
  scenarios: ScenarioResult[],
  samplePoints: number = 12
): { month: string; [key: string]: number | string }[] {
  const data: { month: string; [key: string]: number | string }[] = [];
  
  if (scenarios.length === 0) return data;
  
  const totalMonths = scenarios[0].projections.length;
  const step = Math.max(1, Math.floor(totalMonths / samplePoints));
  
  for (let i = 0; i < totalMonths; i += step) {
    const point: { month: string; [key: string]: number | string } = {
      month: `${Math.floor(i / 12)}년`,
    };
    
    scenarios.forEach(scenario => {
      const projection = scenario.projections[i];
      if (projection) {
        // 만원 단위로 변환
        point[scenario.name] = Math.round(projection.netWorth / 10000);
      }
    });
    
    data.push(point);
  }
  
  return data;
}
