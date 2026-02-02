import { useState, useMemo, ComponentProps } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { MainLayout } from '@/components/layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ScenarioCard } from '@/components/ui/scenario-card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend,
  ReferenceLine,
} from 'recharts';
import { motion } from 'framer-motion';
import { Info, TrendingUp, AlertTriangle, Settings2, ChevronDown, ChevronUp, Target, Loader2 } from 'lucide-react';
import { useProfile } from '@/hooks/useProfile';
import { useTransactions } from '@/hooks/useTransactions';
import { useAssets } from '@/hooks/useAssets';
import { useGoals } from '@/hooks/useGoals';
import { runFullSimulation, DEFAULT_SCENARIOS, ECONOMIC_SCENARIOS, type SimulationResult, generateAggressiveSavingScenario } from '@/lib/simulation';
import { format, startOfMonth, endOfMonth, subMonths } from 'date-fns';
import { analyzeSpending, generateCategoryReductions, generateAnalysisSummary } from '@/lib/spending-analyzer';
import { AggressiveSavingCard } from '@/components/simulation/AggressiveSavingCard';
import { CategoryReductionChart } from '@/components/simulation/CategoryReductionChart';
import { toast } from 'sonner';

type TimePeriod = '1y' | '3y' | '5y';

const periodYears: Record<TimePeriod, number> = {
  '1y': 1,
  '3y': 3,
  '5y': 5,
};

export default function Simulation() {
  const location = useLocation();
  const navigate = useNavigate();
  const [period, setPeriod] = useState<TimePeriod>('3y');
  const [activeScenario, setActiveScenario] = useState<string>('aggressive-saving');
  const [showLiquidOnly, setShowLiquidOnly] = useState(false);
  // Retirement state removed

  
  // 경제 시나리오 상태 (Economic Theme)
  const [currentEconomicTheme, setCurrentEconomicTheme] = useState<keyof typeof ECONOMIC_SCENARIOS>('neutral');
  const [showAdvanced, setShowAdvanced] = useState(false);
  
  // 맞춤형 공격적 저축 시나리오 상태
  const [customAggressiveScenario, setCustomAggressiveScenario] = useState<any>(null);
  const [isGeneratingScenario, setIsGeneratingScenario] = useState(false);

  // Dashboard에서 전달받은 데이터
  const dashboardData = location.state as {
    from?: string;
    monthlyIncome?: number;
    monthlyExpense?: number;
    netWorth?: number;
    timestamp?: string;
  } | null;

  // 새로고침 핸들러 - state 제거
  const handleRefresh = () => {
    navigate('/simulation', { replace: true, state: null });
  };

  // Supabase에서 데이터 가져오기
  // 🚀 Dashboard에서 데이터를 전달받으면 불필요한 쿼리 비활성화
  const hasDashboardData = dashboardData?.from === 'dashboard';
  
  const { data: profile, isLoading: profileLoading } = useProfile();
  const now = new Date();
  const startDate = format(startOfMonth(now), 'yyyy-MM-dd');
  const endDate = format(endOfMonth(now), 'yyyy-MM-dd');
  const { data: transactions = [], isLoading: transactionsLoading } = useTransactions({ 
    startDate, 
    endDate,
    enabled: !hasDashboardData,  // Dashboard 데이터 있으면 쿼리 비활성화
  });
  
  // 분석용 장기 거래 내역 (최근 3개월) - 항상 필요
  const analysisStartDate = format(startOfMonth(subMonths(now, 3)), 'yyyy-MM-dd');
  const { data: allTransactions = [] } = useTransactions({ startDate: analysisStartDate, endDate });
  
  const { data: assets = [], isLoading: assetsLoading } = useAssets();
  const { data: goals = [] } = useGoals();

  const isLoading = profileLoading || (!hasDashboardData && transactionsLoading) || assetsLoading;

  // 월별 수입/지출 계산
  const { monthlyIncome, monthlyExpense, currentNetWorth, assetsBreakdown: monthlyIncomeAndAssets } = useMemo(() => {
    // Dashboard에서 데이터를 전달받았으면 우선 사용
    if (dashboardData?.from === 'dashboard') {
      return {
        monthlyIncome: dashboardData.monthlyIncome || 0,
        monthlyExpense: dashboardData.monthlyExpense || 0,
        currentNetWorth: dashboardData.netWorth || 0,
      };
    }

    // 아니면 Supabase에서 직접 계산
    let income = 0;
    let expense = 0;
    
    transactions.forEach((t) => {
      if (t.amount >= 0) {
        income += t.amount;
      } else {
        expense += Math.abs(t.amount);
      }
    });

    // 프로필의 월수입이 있으면 사용 (거래 내역이 없을 때)
    if (profile?.monthly_income && income === 0) {
      income = profile.monthly_income;
    }

    // 순자산 및 자산 분류 계산
    const breakdown = {
      cash: 0,
      investment: 0,
      realEstate: 0,
      debt: 0
    };

    assets.forEach(asset => {
      switch (asset.type) {
        case 'savings':
          breakdown.cash += asset.amount;
          break;
        case 'investment':
          breakdown.investment += asset.amount;
          break;
        case 'debt':
          breakdown.debt += asset.amount;
          break;
        default:
          // 기타는 현금으로 간주하거나 별도 분리
          breakdown.cash += asset.amount;
      }
    });

    // 현재 잔액 추가 (현금으로)
    const currentBalance = (income || 0) - (expense || 0);
    breakdown.cash += currentBalance;

    const netWorth = breakdown.cash + breakdown.investment + breakdown.realEstate - breakdown.debt;

    return {
      monthlyIncome: income,
      monthlyExpense: expense,
      currentNetWorth: netWorth,
      assetsBreakdown: breakdown,
    };
  }, [dashboardData, transactions, profile, assets]);

  // 목표를 생애 이벤트로 변환
  const lifeEvents = useMemo(() => {
    return goals
      .filter(g => g.target_date && g.target_amount > (g.current_amount || 0))
      .filter(g => g.type !== 'simulation_target') // 시뮬레이션 목표는 지출로 계산하지 않음
      .map(g => {
        // 자산 취득 키워드 감지
        const assetKeywords = ['주택', '아파트', '빌라', '부동산', '건물', '토지', '집', 'house', 'apartment', '매매'];
        const isAssetAcquisition = assetKeywords.some(keyword => g.name.includes(keyword));

        return {
          date: new Date(g.target_date!),
          amount: g.target_amount - (g.current_amount || 0), // 남은 금액만큼 지출 발생
          name: g.name,
          type: (isAssetAcquisition ? 'asset_acquisition' : 'expense') as 'expense' | 'asset_acquisition'
        };
      });
  }, [goals]);

  // \ub9de\ucda4\ud615 \uacf5\uaca9\uc801 \uc800\ucd95 \uc2dc\ub098\ub9ac\uc624 \uc0dd\uc131
  const handleGenerateAggressiveScenario = async () => {
    if (allTransactions.length === 0) {
      toast.error('\uac70\ub798 \ub0b4\uc5ed\uc774 \ubd80\uc871\ud569\ub2c8\ub2e4', {
        description: '\ucd5c\uadfc 3\uac1c\uc6d4 \uac70\ub798 \ub0b4\uc5ed\uc774 \ud544\uc694\ud569\ub2c8\ub2e4.',
      });
      return;
    }

    if (monthlyExpense <= 0) {
      toast.error('\uc9c0\ucd9c \ub370\uc774\ud130\uac00 \uc5c6\uc2b5\ub2c8\ub2e4', {
        description: '\uc9c0\ucd9c \ub0b4\uc5ed\uc744 \uba3c\uc800 \uc785\ub825\ud574\uc8fc\uc138\uc694.',
      });
      return;
    }

    setIsGeneratingScenario(true);
    
    try {

      // 지능형 기간 감지 모드: 데이터 양에 따라 자동으로 기간 결정
      const analysis = analyzeSpending(allTransactions);
      
      if (analysis.categories.length === 0) {
        toast.error('\ubd84\uc11d\ud560 \uc9c0\ucd9c \ub0b4\uc5ed\uc774 \uc5c6\uc2b5\ub2c8\ub2e4');
        setIsGeneratingScenario(false);
        return;
      }

      const targetSavingsIncrease = monthlyExpense * 0.20;
      const reductions = generateCategoryReductions(analysis, targetSavingsIncrease);
      
      if (reductions.length === 0) {
        toast.error('\uc808\uac10 \uac00\ub2a5\ud55c \ud56d\ubaa9\uc744 \ucc3e\uc744 \uc218 \uc5c6\uc2b5\ub2c8\ub2e4', {
          description: '\uc9c0\ucd9c \ud328\ud134\uc744 \ub354 \ub2e4\uc591\ud558\uac8c \uae30\ub85d\ud574\ubcf4\uc138\uc694.',
        });
        setIsGeneratingScenario(false);
        return;
      }

      const rationale = generateAnalysisSummary(analysis, reductions);
      const scenario = generateAggressiveSavingScenario(analysis, reductions, rationale);

      setCustomAggressiveScenario({
        ...scenario,
        analysis,
        reductions,
      });

      setActiveScenario('aggressive-saving-custom');

      toast.success('\uc808\uc57d \uacc4\ud68d\uc774 \uc0dd\uc131\ub418\uc5c8\uc2b5\ub2c8\ub2e4! \ud83c\udfaf', {
        description: `\uc6d4 ${Math.round((reductions.reduce((sum, r) => sum + r.reductionAmount, 0)) / 10000)}\ub9cc\uc6d0 \uc808\uac10 \uac00\ub2a5`,
      });
    } catch (error) {
      console.error('\uc2dc\ub098\ub9ac\uc624 \uc0dd\uc131 \uc2e4\ud328:', error);
      toast.error('\uc2dc\ub098\ub9ac\uc624 \uc0dd\uc131\uc5d0 \uc2e4\ud328\ud588\uc2b5\ub2c8\ub2e4');
    } finally {
      setIsGeneratingScenario(false);
    }
  };

  // \uc2dc\ubbac\ub808\uc774\uc158 \uc2e4\ud589
  const simulationResult: SimulationResult | null = useMemo(() => {
    if (monthlyIncome <= 0) return null;

    const p = ECONOMIC_SCENARIOS[currentEconomicTheme].params;

    return runFullSimulation(
      {
        currentNetWorth,
        assetsBreakdown: monthlyIncomeAndAssets,
        monthlyIncome,
        monthlyExpense,
        lifeEvents,
        years: periodYears[period],
        annualInflationRate: p.inflationRate / 100,
        annualInvestmentReturn: p.investmentReturn / 100,
        annualIncomeGrowth: p.incomeGrowth / 100,
        annualDebtInterest: p.debtInterest / 100,
        annualRealEstateGrowth: p.realEstateGrowth / 100,
        currentAge: 35, // 임시 고정값 (프로필 연동 필요)
        retirementAge: 65,
        monthlyPension: 1000000,
      },
      [] // 시나리오 없이 baseline만 표시
    );
  }, [currentNetWorth, monthlyIncome, monthlyExpense, monthlyIncomeAndAssets, period, lifeEvents, currentEconomicTheme]);

  // 차트 데이터 생성
  const chartData = useMemo(() => {
    if (!simulationResult) return [];
    
    // Use the baseline projections as the source of truth for the timeline
    const allScenarios = [simulationResult.baseline, ...simulationResult.scenarios];
    const data: any[] = [];
    
    // Generate data points for every month (high resolution for accurate markers)
    // To avoid too many points, maybe step by 1 for short term, bigger for long?
    // Let's stick to every month but Recharts handles it? 
    // Or downsample but keep specific event months?
    // Let's try 1/3 or 1/6 sampling but ensuring event months are included.
    
    const projections = simulationResult.baseline.projections;
    const step = period === '1y' ? 1 : period === '3y' ? 3 : 6;
    
    for (let i = 0; i < projections.length; i++) {
        // Include point if it's a step OR has an event
        const hasEvent = allScenarios.some(s => s.projections[i]?.events.length > 0);
        
        if (i % step === 0 || hasEvent) {
             const point: any = {
                date: format(projections[i].date, 'yyyy.MM'),
                originalDate: projections[i].date, // Keep for ReferenceLine matching checking if needed? No, string match.
             };

             allScenarios.forEach(s => {
                 const p = s.projections[i];
                 if (p) {
                   if (showLiquidOnly) {
                     // Liquid = Cash + Investment - Debt (Simulate net liquid?)
                     // Or just Cash + Investment? "Liquidity View" usually means what I can spend.
                     // Let's strict: Cash + Investment.
                     // But Debt payments are expense. Debt balance is huge negative.
                     // Usually Net Liquid = (Cash + Inv) - (Short term debt).
                     // Ideally: Cash + Investment. That's "Assets" excluding Real Estate.
                     // Net Worth = Cash + Inv + RE - Debt.
                     // Liquid View = Cash + Inv - Debt.
                     point[s.name] = Math.round((p.assets.cash + p.assets.investment - p.assets.debt) / 10000);
                   } else {
                     point[s.name] = Math.round(p.netWorth / 10000);
                   }
                   
                   // Add event info to point if this scenario has one
                   if (p.events.length > 0) {
                       point[`event_${s.id}`] = p.events[0]; // Take first event
                   }
                 }
             });
             data.push(point);
        }
    }
    
    return data;
  }, [simulationResult, showLiquidOnly, period]);

  // 현재 유지 시나리오 카드 데이터
  const scenarioCards = useMemo(() => {
    if (!simulationResult) return [];

    const baseline = simulationResult.baseline;
    const cards: ComponentProps<typeof ScenarioCard>[] = [
      {
        type: 'current',
        id: 'baseline',
        title: baseline.name,
        description: baseline.description,
        netWorth: baseline.finalNetWorth,
        emergencyFund: Math.round(baseline.emergencyFundMonths * monthlyExpense),
        goalDate: format(baseline.projections[baseline.projections.length - 1].date, 'yyyy년 M월'),
      },
    ];

    return cards;
  }, [simulationResult, monthlyExpense]);

  // 활성 시나리오 상세 정보
  const activeScenarioDetail = useMemo(() => {
    if (!simulationResult) return null;
    
    if (activeScenario === 'baseline') {
      return simulationResult.baseline;
    }
    
    return simulationResult.scenarios.find(s => s.id === activeScenario) || simulationResult.scenarios[0];
  }, [simulationResult, activeScenario]);

  // 데이터가 없을 때
  const hasNoData = monthlyIncome === 0 && monthlyExpense === 0;

  return (
    <div className="pb-24">
      <div className="p-4 space-y-6">
        {/* Header */}
        <div className="pt-2">
          <h1 className="text-2xl font-bold">미래 시뮬레이션</h1>
          <p className="text-muted-foreground text-sm">
            시나리오별 재정 상태를 비교해보세요
          </p>
        </div>

        {/* Period Selector */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <Tabs value={period} onValueChange={(v) => setPeriod(v as TimePeriod)} className="w-full sm:w-[180px]">
             <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="1y">1년</TabsTrigger>
              <TabsTrigger value="3y">3년</TabsTrigger>
              <TabsTrigger value="5y">5년</TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="flex items-center gap-4">
            <div className="flex items-center space-x-2">
              <Switch id="liquidity-mode" checked={showLiquidOnly} onCheckedChange={setShowLiquidOnly} />
              <Label htmlFor="liquidity-mode" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                현금 흐름 뷰
              </Label>
            </div>

            <Collapsible open={showAdvanced} onOpenChange={setShowAdvanced}>
              <CollapsibleTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                  <Settings2 className="w-4 h-4" />
                  상세 설정
                  {showAdvanced ? <ChevronUp className="w-4 h-4" /> : <TrendingUp className="w-4 h-4" />}
                </Button>
              </CollapsibleTrigger>
            </Collapsible>
          </div>
        </div>


        {/* Advanced Settings Panel */}
        <Collapsible open={showAdvanced} onOpenChange={setShowAdvanced}>
          <CollapsibleContent>
            <Card className="mt-2 bg-muted/50">
              <CardContent className="p-4 space-y-4">
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <Label className="text-base font-semibold">경제 상황 시나리오 선택</Label>
                        <span className="text-xs text-muted-foreground">
                            * 선택한 시나리오에 따라 물가, 금리, 수익률이 자동 조정됩니다.
                        </span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {Object.values(ECONOMIC_SCENARIOS).map((scenario) => (
                            <div 
                                key={scenario.id}
                                className={`
                                    cursor-pointer rounded-lg border-2 p-3 transition-all hover:bg-accent
                                    ${currentEconomicTheme === scenario.id ? 'border-primary bg-primary/5' : 'border-transparent bg-background'}
                                `}
                                onClick={() => setCurrentEconomicTheme(scenario.id)}
                            >
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="text-xl">{scenario.emoji}</span>
                                    <span className="font-semibold">{scenario.name}</span>
                                </div>
                                <p className="text-xs text-muted-foreground mb-3 min-h-[32px]">
                                    {scenario.description}
                                </p>
                                <div className="grid grid-cols-2 gap-y-1 gap-x-2 text-xs">
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">물가</span>
                                        <span className="font-medium">{scenario.params.inflationRate}%</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">투자</span>
                                        <span className={`font-medium ${scenario.params.investmentReturn < 0 ? 'text-destructive' : 'text-success'}`}>
                                            {scenario.params.investmentReturn > 0 ? '+' : ''}{scenario.params.investmentReturn}%
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

{/* Retirement Planning section removed */}
                </div>
              </CardContent>
            </Card>
          </CollapsibleContent>
        </Collapsible>

        {/* Dashboard Data Banner */}
        {dashboardData?.from === 'dashboard' && (
          <Card className="bg-info-light border-info/20">
            <CardContent className="p-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Info className="w-4 h-4 text-info" />
                <p className="text-sm">
                  Dashboard 데이터를 사용 중입니다
                  {dashboardData.timestamp && (
                    <span className="text-muted-foreground ml-1">
                      ({format(new Date(dashboardData.timestamp), 'HH:mm')})
                    </span>
                  )}
                </p>
              </div>
              <Button 
                size="sm" 
                variant="ghost"
                onClick={handleRefresh}
                className="h-7 px-2 text-xs"
              >
                새로고침
              </Button>
            </CardContent>
          </Card>
        )}

        {/* No Data Warning */}
        {hasNoData && !isLoading && (
          <Card className="bg-warning-light border-warning/20">
            <CardContent className="p-4 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-warning mt-0.5" />
              <div>
                <p className="font-medium text-sm">데이터가 부족합니다</p>
                <p className="text-xs text-muted-foreground">
                  거래 내역과 프로필 정보를 입력하면 더 정확한 시뮬레이션이 가능해요.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

{/* Chart */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">순자산 추이</CardTitle>
              <Badge variant="outline" className="text-xs">
                단위: 만원
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-64 w-full" />
            ) : (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart 
                    data={chartData} 
                    margin={{ top: 8, right: 16, left: 0, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient id="colorBaseline" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--muted-foreground))" stopOpacity={0.35} />
                        <stop offset="95%" stopColor="hsl(var(--muted-foreground))" stopOpacity={0.05} />
                      </linearGradient>
                      <linearGradient id="colorA" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.35} />
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.05} />
                      </linearGradient>
                      <linearGradient id="colorB" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--secondary))" stopOpacity={0.35} />
                        <stop offset="95%" stopColor="hsl(var(--secondary))" stopOpacity={0.05} />
                      </linearGradient>
                      <linearGradient id="colorC" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--success))" stopOpacity={0.35} />
                        <stop offset="95%" stopColor="hsl(var(--success))" stopOpacity={0.05} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" />
                    <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 10 }} />
                    <Tooltip
                      content={({ active, payload, label }) => {
                        if (!active || !payload?.length) return null;

                        const eventText =
                          payload?.[0]?.payload?.[`event_${activeScenario}`] ||
                          payload?.find((entry) => entry?.payload?.[`event_${activeScenario}`])?.payload?.[
                            `event_${activeScenario}`
                          ];

                        return (
                          <div className="rounded-lg border border-border bg-background/95 p-2 shadow-sm">
                            <p className="text-[0.70rem] text-muted-foreground">{label}</p>
                            <div className="mt-1 space-y-1">
                              {payload.map((entry, index) => (
                                <div
                                  key={`${entry.name}-${index}`}
                                  className="flex items-center justify-between gap-3 text-[0.70rem]"
                                >
                                  <div className="flex items-center gap-2">
                                    <span
                                      className="h-2 w-2 rounded-full"
                                      style={{ backgroundColor: entry.color }}
                                    />
                                    <span className="text-muted-foreground">{entry.name}</span>
                                  </div>
                                  <span className="font-mono font-semibold">
                                    {Number(entry.value).toLocaleString()}만원
                                  </span>
                                </div>
                              ))}
                            </div>
                            {eventText && (
                              <div className="mt-2 border-t border-border pt-2">
                                <div className="flex items-start gap-1.5 text-destructive">
                                  <TrendingUp className="h-3 w-3 mt-0.5" />
                                  <span className="text-[0.70rem] font-bold">
                                    {String(eventText).split('(')[0]}
                                  </span>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      }}
                    />
                    <Legend />
                    {activeScenarioDetail?.projections
                      .filter((p) => p.events.length > 0)
                      .map((p, i) => {
                        const dateParams = format(p.date, 'yyyy.MM');
                        
                        return (
                        <ReferenceLine
                          key={i}
                          x={dateParams}
                          stroke="hsl(var(--destructive))"
                          strokeDasharray="3 3"
                        />
                      )})}
                    <Area
                      type="monotone"
                      dataKey="현재 유지"
                      name="현재 유지"
                      stroke="hsl(var(--muted-foreground))"
                      fillOpacity={1}
                      fill="url(#colorBaseline)"
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Current Scenario Card */}
        {/* 공격적 저축 시나리오 생성 버튼 */}
        {!hasNoData && !isLoading && (
          <Card className="bg-gradient-to-r from-primary/5 to-transparent border-primary/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-full">
                    <Target className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm">맞춤형 절약 계획</h3>
                    <p className="text-xs text-muted-foreground">
                      거래 내역을 분석하여 실행 가능한 절약 가이드를 생성합니다
                    </p>
                  </div>
                </div>
                <Button
                  onClick={handleGenerateAggressiveScenario}
                  disabled={isGeneratingScenario || allTransactions.length === 0}
                  className="gap-2"
                >
                  {isGeneratingScenario ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      분석 중...
                    </>
                  ) : (
                    <>
                      <Target className="w-4 h-4" />
                      절약 계획 생성
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <div>
          <h2 className="font-semibold mb-3">현재 재정 상태</h2>
          {isLoading ? (
            <div className="flex gap-4 overflow-x-auto no-scrollbar pb-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="min-w-[260px] h-40" />
              ))}
            </div>
          ) : (
            <div className="flex gap-4 overflow-x-auto no-scrollbar pb-4 -mx-4 px-4">
              {scenarioCards.map((scenario) => (
                <ScenarioCard
                  key={scenario.id}
                  {...scenario}
                  isActive={activeScenario === scenario.id}
                  onClick={() => setActiveScenario(scenario.id)}
                />
              ))}
            </div>
          )}
        </div>

        {/* AI Analysis Card */}
        {activeScenarioDetail && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
             <Card className="bg-primary/5 border-primary/20">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-primary/10 rounded-full">
                    <Info className="w-4 h-4 text-primary" />
                  </div>
                  <CardTitle className="text-base text-primary font-bold">AI 시뮬레이션 분석</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm">
                  {simulationResult && (
                    <>
                      {period === '1y' ? '1년' : period === '3y' ? '3년' : '5년'} 뒤 예상 순자산은 
                      <span className="font-bold text-foreground mx-1 text-lg">
                        {(activeScenarioDetail.finalNetWorth / 10000).toLocaleString()}만원
                      </span>
                      입니다.
                    </>
                  )}
                </p>
                
                 <div className="space-y-2">
                  <h5 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">주요 변동 요인</h5>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start gap-2">
                       <span className="text-success min-w-[14px] mt-1">+</span> 
                       <span>
                         <strong>기본 저축:</strong> 월 {(monthlyIncomeAndAssets.cash < 0 ? 0 : monthlyIncome - monthlyExpense).toLocaleString()}원씩 꾸준히 모아 자산을 형성했습니다.
                       </span>
                    </li>
                    {activeScenarioDetail.projections[activeScenarioDetail.projections.length - 1].assets.realEstate > 0 && (
                       <li className="flex items-start gap-2">
                       <span className="text-success min-w-[14px] mt-1">+</span> 
                       <span>
                         <strong>자산 취득:</strong> 목표 달성을 위해 현금을 <strong>부동산 자산</strong>으로 전환하여 포트폴리오를 다각화했습니다.
                         (총 부동산 자산: {(activeScenarioDetail.projections[activeScenarioDetail.projections.length - 1].assets.realEstate / 10000).toLocaleString()}만원)
                       </span>
                    </li>
                    )}
                     <li className="flex items-start gap-2">
                       <span className="text-success min-w-[14px] mt-1">+</span> 
                       <span>
                         <strong>투자 효과:</strong> 연 {ECONOMIC_SCENARIOS[currentEconomicTheme].params.investmentReturn}%의 수익률이 복리로 작용하여 자산 증식을 도왔습니다.
                       </span>
                    </li>
                     {activeScenarioDetail.projections[activeScenarioDetail.projections.length - 1].assets.debt > 0 && (
                        <li className="flex items-start gap-2">
                        <span className="text-destructive min-w-[14px] mt-1">-</span> 
                        <span>
                          <strong>대출 실행:</strong> 주택 구매 시 부족한 자금은 <strong>대출(부채)</strong>로 자동 충당되었습니다. 
                          (현재 대출 잔액: {(activeScenarioDetail.projections[activeScenarioDetail.projections.length - 1].assets.debt / 10000).toLocaleString()}만원, 연 {ECONOMIC_SCENARIOS[currentEconomicTheme].params.debtInterest}% 이자 적용 중)
                        </span>
                     </li>
                     )}
                  </ul>
                </div>

                <div className="pt-2 border-t border-primary/10">
                   <p className="text-xs text-muted-foreground">
                     * 이 분석은 현재 설정된 가정값(물가상승률 {ECONOMIC_SCENARIOS[currentEconomicTheme].params.inflationRate}%, 임금상승률 {ECONOMIC_SCENARIOS[currentEconomicTheme].params.incomeGrowth}%)을 기반으로 합니다.
                   </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Scenario Details */}
        {activeScenarioDetail && (
          <motion.div
            key={activeScenario}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <Info className="w-4 h-4 text-muted-foreground" />
                  <CardTitle className="text-base">시나리오 상세</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium mb-2">예상 결과</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• 최종 순자산: {(activeScenarioDetail.finalNetWorth / 10000).toLocaleString()}만원</li>
                    <li>• 비상금: {activeScenarioDetail.emergencyFundMonths.toFixed(1)}개월분</li>
                    {activeScenarioDetail.netWorthChange !== 0 && (
                      <li className={activeScenarioDetail.netWorthChange > 0 ? 'text-success' : 'text-destructive'}>
                        • 기준 대비: {activeScenarioDetail.netWorthChange > 0 ? '+' : ''}
                        {(activeScenarioDetail.netWorthChange / 10000).toLocaleString()}만원
                      </li>
                    )}
                  </ul>
                </div>

                <div>
                  <h4 className="text-sm font-medium mb-2">가정 조건</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• 연 물가상승률: {ECONOMIC_SCENARIOS[currentEconomicTheme].params.inflationRate}%</li>
                    <li>• 투자 수익률: {ECONOMIC_SCENARIOS[currentEconomicTheme].params.investmentReturn}%</li>
                    <li>• 소득 증가율: 연 {ECONOMIC_SCENARIOS[currentEconomicTheme].params.incomeGrowth}%</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* 맞춤형 공격적 저축 상세 카드 */}
        {customAggressiveScenario && activeScenario === 'aggressive-saving-custom' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <AggressiveSavingCard
              categoryReductions={customAggressiveScenario.reductions}
              savingsRationale={customAggressiveScenario.savingsRationale}
              totalCurrentExpense={customAggressiveScenario.analysis.avgMonthlyExpense}
              totalTargetExpense={
                customAggressiveScenario.analysis.avgMonthlyExpense -
                customAggressiveScenario.reductions.reduce((sum: number, r: any) => sum + r.reductionAmount, 0)
              }
            />
            
            <div className="mt-6">
              <CategoryReductionChart categoryReductions={customAggressiveScenario.reductions} />
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
