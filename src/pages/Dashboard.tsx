import { useMemo, useEffect, useState } from 'react';
import { MainLayout } from '@/components/layout';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { CircularProgress } from '@/components/ui/circular-progress';
import { AmountDisplay } from '@/components/ui/amount-display';
import { TransactionItem } from '@/components/ui/transaction-item';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { AIAdviceCard } from '@/components/ui/ai-advice-card';
import { EconomicDataCard } from '@/components/dashboard/EconomicDataCard';
import { showLocalNotification } from '@/lib/notifications';
import { 
  Wallet, 
  TrendingUp, 
  Lightbulb, 
  ChevronRight,
  ArrowUpRight,
  ArrowDownRight,
  Info,
  CreditCard,
  PiggyBank
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTransactions } from '@/hooks/useTransactions';
import { useProfile } from '@/hooks/useProfile';
import { useGoals } from '@/hooks/useGoals';
import { calculateAllGoalsProgress } from '@/lib/goalCalculator';
import { useAssets } from '@/hooks/useAssets';
import { getCategoryById } from '@/lib/categories';
import { groupTransactionsByCategory } from '@/lib/insights';
import { startOfMonth, endOfMonth, format } from 'date-fns';
import { RecurringExpenseModal } from '@/components/RecurringExpenseModal';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export default function Dashboard() {
  const navigate = useNavigate();
  // 현재 월의 시작/끝 날짜 계산
  const now = new Date();
  const startDate = format(startOfMonth(now), 'yyyy-MM-dd');
  const endDate = format(endOfMonth(now), 'yyyy-MM-dd');

  // Supabase에서 데이터 가져오기
  const { data: profile, isLoading: profileLoading } = useProfile();
  const { data: transactions = [], isLoading: transactionsLoading } = useTransactions({
    startDate,
    endDate,
  });
  const { data: recentTransactions = [], isLoading: recentLoading } = useTransactions({ limit: 5 });
  const { data: goals = [], isLoading: goalsLoading } = useGoals();
  const { data: assets = [], isLoading: assetsLoading } = useAssets();

  // Selected Goal State
  const [selectedGoalId, setSelectedGoalId] = useState<string>(() => 
    localStorage.getItem('dashboard_selected_goal_id') || ''
  );

  // 월간 수입/지출 계산
  const { monthlyIncome, monthlyExpense, monthlyBalance } = useMemo(() => {
    let income = 0;
    let expense = 0;
    
    transactions.forEach((t) => {
      if (t.amount >= 0) {
        income += t.amount;
      } else {
        expense += Math.abs(t.amount);
      }
    });

    // 프로필의 월수입이 있으면 사용
    if (profile?.monthly_income && income === 0) {
      income = profile.monthly_income;
    }

    return {
      monthlyIncome: income,
      monthlyExpense: expense,
      monthlyBalance: income - expense,
    };
  }, [transactions, profile]);

  // 예산 소진율 계산
  const budgetUsed = monthlyIncome > 0 ? (monthlyExpense / monthlyIncome) * 100 : 0;

  // 순자산 계산 (자산 - 부채 + 이번 달 잔액)
  const { netWorth, assetsTotal, debtTotal } = useMemo(() => {
    let aTotal = 0;
    let dTotal = 0;
    
    assets.forEach((asset) => {
      if (asset.type === 'debt') {
        dTotal += asset.amount;
      } else {
        aTotal += asset.amount;
      }
    });
    
    // 순자산 = (총 자산 - 총 부채) + 월 잔액
    // 월 잔액은 유동 자산으로 포함
    return {
      netWorth: (aTotal - dTotal) + monthlyBalance,
      assetsTotal: aTotal + (monthlyBalance > 0 ? monthlyBalance : 0),
      debtTotal: dTotal + (monthlyBalance < 0 ? Math.abs(monthlyBalance) : 0) 
    };
  }, [assets, monthlyBalance]);

  // Goals 진행도 자동 계산
  const goalsWithProgress = useMemo(() => {
    if (!goals.length || !transactions.length) return goals;
    return calculateAllGoalsProgress(goals, transactions);
  }, [goals, transactions]);

  // 목표 진행률 계산 (선택된 목표 기준)
  const displayGoal = useMemo(() => {
    if (selectedGoalId) {
      const found = goalsWithProgress.find(g => g.id === selectedGoalId);
      if (found) return found;
    }
    return goalsWithProgress[0];
  }, [selectedGoalId, goalsWithProgress]);

  const goalProgress = useMemo(() => {
    if (!displayGoal) return 0;
    const current = displayGoal.current_amount || 0;
    return Math.min((current / displayGoal.target_amount) * 100, 100);
  }, [displayGoal]);

  // Update selected goal in localStorage
  useEffect(() => {
    if (selectedGoalId) {
      localStorage.setItem('dashboard_selected_goal_id', selectedGoalId);
    } else if (goalsWithProgress.length > 0) {
      // Initialize with first goal if nothing selected
      setSelectedGoalId(goalsWithProgress[0].id);
    }
  }, [selectedGoalId, goalsWithProgress]);

  // AI 조언용 context
  const aiContext = useMemo(() => {
    const categoryBreakdown = groupTransactionsByCategory(transactions);
    return {
      monthlyIncome,
      monthlyExpense,
      savingsRate: monthlyIncome > 0 ? ((monthlyIncome - monthlyExpense) / monthlyIncome) * 100 : 0,
      topCategories: categoryBreakdown.slice(0, 3).map(c => ({
        name: c.categoryName,
        amount: c.amount,
        percentage: c.percentage,
      })),
      netWorth,
      goals: goalsWithProgress.map(g => ({
        name: g.name,
        targetAmount: g.target_amount,
        currentAmount: g.current_amount || 0,
      })),
    };
  }, [monthlyIncome, monthlyExpense, transactions, netWorth, goals]);

  // 로딩 상태
  const isLoading = profileLoading || transactionsLoading || goalsLoading || assetsLoading;

  // 사용자 이름
  const userName = profile?.name || '사용자';

  // 시뮬레이션 페이지로 데이터 전달
  const handleStartSimulation = () => {
    navigate('/simulation', {
      state: {
        from: 'dashboard',
        monthlyIncome,
        monthlyExpense,
        netWorth,
        timestamp: new Date().toISOString(),
      },
    });
  };

  // 알림: 목표 달성 체크
  useEffect(() => {
    if (goalsWithProgress.length === 0) return;
    
    goalsWithProgress.forEach(goal => {
      const isAchieved = goal.current_amount >= goal.target_amount;
      
      if (isAchieved && !goal.is_completed) {
        showLocalNotification(
          '🎉 목표 달성!',
          `"${goal.name}" 목표를 달성했어요! 축하합니다!`,
          { tag: `goal-${goal.id}`, requireInteraction: true }
        );
      }
    });
  }, [goalsWithProgress]);

  // 알림: 예산 경고 (80% 이상)
  useEffect(() => {
    if (budgetUsed > 80 && budgetUsed <= 85) {
      showLocalNotification(
        '⚠️ 예산 경고',
        `이번 달 예산의 ${Math.round(budgetUsed)}%를 사용했어요. 지출을 조절해주세요!`,
        { tag: 'budget-warning' }
      );
    }
  }, [budgetUsed]);

  return (
    <div className="pb-20"> {/* Added pb-20 to ensure content isn't hidden behind bottom nav if not already handled by layout */}
      <motion.div
        className="p-6 space-y-8" /* Increased padding and vertical spacing */
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Header */}
        <motion.div variants={itemVariants} className="pt-4 flex items-center justify-between">
          <div>
            <p className="text-muted-foreground text-sm font-medium mb-1">안녕하세요,</p>
            {profileLoading ? (
              <Skeleton className="h-8 w-32" />
            ) : (
              <h1 className="text-3xl font-bold tracking-tight">{userName}님</h1>
            )}
          </div>
          <div className="size-10 rounded-full bg-surface-dark border border-white/10 overflow-hidden">
             {/* Placeholder for avatar if needed, or just keep it clean */}
             <div className="w-full h-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                {userName.charAt(0)}
             </div>
          </div>
        </motion.div>

        {/* Cash Flow Card */}
        <motion.div variants={itemVariants}>
          <Card className="rounded-3xl border-0 shadow-2xl relative overflow-hidden">
            {/* Premium Gradient Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#1c1c1c] to-[#111111] z-0" />
            
            <CardContent className="p-6 relative z-10">
              <div className="flex items-center justify-between mb-6">
                <p className="text-[#9db9a6] text-sm font-medium">이번 달 현금흐름</p>
                <div className="p-2 rounded-full bg-white/5 backdrop-blur-sm">
                  <Wallet className="w-5 h-5 text-primary" />
                </div>
              </div>
              
              {isLoading ? (
                <div className="space-y-4">
                  <Skeleton className="h-8 w-full bg-white/5" />
                  <Skeleton className="h-4 w-full bg-white/5" />
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    <div>
                      <div className="flex items-center gap-1 text-[#9db9a6] text-xs mb-1.5">
                        <ArrowDownRight className="w-3 h-3 text-red-400" />
                        <span>수입</span>
                      </div>
                      <p className="font-semibold text-white">{(monthlyIncome / 10000).toFixed(0)}만</p>
                    </div>
                    <div>
                      <div className="flex items-center gap-1 text-[#9db9a6] text-xs mb-1.5">
                        <ArrowUpRight className="w-3 h-3 text-green-400" />
                        <span>지출</span>
                      </div>
                      <p className="font-semibold text-white">{(monthlyExpense / 10000).toFixed(0)}만</p>
                    </div>
                    <div>
                      <div className="text-[#9db9a6] text-xs mb-1.5">잔액</div>
                      <p className="font-bold text-lg text-primary">{(monthlyBalance / 10000).toFixed(0)}만</p>
                    </div>
                  </div>

                  {/* Budget Progress */}
                  <div>
                    <div className="flex justify-between text-xs mb-2">
                       <span className="text-[#9db9a6]">예산 소진율</span>
                       <span className={`font-medium ${budgetUsed > 90 ? 'text-red-400' : 'text-primary'}`}>
                         {budgetUsed.toFixed(0)}%
                       </span>
                    </div>
                    <Progress 
                      value={Math.min(budgetUsed, 100)} 
                      className="h-2 bg-white/5"
                    />
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Stats Row */}
        <motion.div variants={itemVariants} className="grid grid-cols-2 gap-4">
          <Card className="card-interactive min-h-[160px]">
            <CardContent className="p-4 flex flex-col items-center justify-between h-full">
              {goalsLoading ? (
                <Skeleton className="h-20 w-20 rounded-full" />
              ) : (
                <>
                  <CircularProgress 
                    value={goalProgress} 
                    size="lg" 
                    label="목표"
                    colorClass="stroke-secondary"
                  />
                  <div className="flex flex-col items-center w-full gap-1 mt-2">
                    <span className="text-xs text-muted-foreground">목표 달성률</span>
                    {goalsWithProgress.length > 0 ? (
                      <Select value={selectedGoalId} onValueChange={setSelectedGoalId}>
                        <SelectTrigger className="h-7 w-full text-xs bg-transparent border-0 ring-0 focus:ring-0 px-0 flex justify-center hover:bg-muted/50 rounded-sm">
                          <SelectValue placeholder="목표 선택">
                            <span className="font-medium truncate max-w-[100px] text-center">
                              {displayGoal?.name || '목표 선택'}
                            </span>
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          {goalsWithProgress.map(goal => (
                            <SelectItem key={goal.id} value={goal.id}>
                              {goal.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <span className="text-xs text-muted-foreground">목표 없음</span>
                    )}
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          <Card className="card-interactive min-h-[160px]">
            <CardContent className="p-4 h-full flex flex-col">
              <div className="flex items-center gap-2 mb-4">
                <div className="p-2 rounded-lg bg-secondary/10">
                  <TrendingUp className="w-4 h-4 text-secondary" />
                </div>
                <span className="text-sm text-muted-foreground flex-1">순자산</span>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full hover:bg-muted">
                      <Info className="w-3.5 h-3.5 text-muted-foreground" />
                      <span className="sr-only">순자산 정보</span>
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-64" align="end">
                    <div className="space-y-3">
                      <h4 className="font-medium leading-none">순자산 계산</h4>
                      <div className="text-xs text-muted-foreground">
                        총 자산에서 부채를 빼고, 이번 달의 수입/지출 잔액을 더한 금액입니다.
                      </div>
                      <div className="space-y-2 pt-2 border-t">
                        <div className="flex justify-between text-sm">
                          <span className="flex items-center gap-1 text-muted-foreground">
                            <PiggyBank className="w-3 h-3" /> 총 자산
                          </span>
                          <span className="text-green-600 font-medium">
                            + {assetsTotal.toLocaleString()}원
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="flex items-center gap-1 text-muted-foreground">
                            <CreditCard className="w-3 h-3" /> 총 부채
                          </span>
                          <span className="text-red-500 font-medium">
                            - {debtTotal.toLocaleString()}원
                          </span>
                        </div>
                        <div className="flex justify-between font-bold pt-2 border-t">
                          <span>합계</span>
                          <span>{netWorth.toLocaleString()}원</span>
                        </div>
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
              
              <div className="flex-1 flex items-center justify-center">
                {assetsLoading ? (
                  <Skeleton className="h-8 w-24" />
                ) : (
                  <AmountDisplay value={netWorth} size="lg" showColor={false} />
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Insight Card */}
        <motion.div variants={itemVariants}>
          <Card className="bg-info-light border-info/20">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-info/10">
                  <Lightbulb className="w-5 h-5 text-info" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium mb-1">오늘의 인사이트</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    {monthlyExpense > 0 
                      ? `이번 달 지출은 ${(monthlyExpense / 10000).toFixed(0)}만원입니다. 남은 예산을 확인하고 계획적으로 소비해보세요.`
                      : '거래 내역을 입력하면 맞춤 분석을 받아볼 수 있어요!'
                    }
                  </p>
                  <Button 
                    onClick={handleStartSimulation} 
                    className="w-full gap-2"
                    size="sm"
                  >
                    <TrendingUp className="w-4 h-4" />
                    미래 시뮬레이션 시작하기
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* AI Advice Card */}
        <motion.div variants={itemVariants}>
          <AIAdviceCard context={aiContext} />
        </motion.div>

        {/* Economic Data Card */}
        <motion.div variants={itemVariants}>
          <EconomicDataCard />
        </motion.div>

        {/* Recent Transactions */}
        <motion.div variants={itemVariants}>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold">최근 거래</h2>
            <Link to="/transactions">
              <Button variant="ghost" size="sm" className="gap-1">
                더보기
                <ChevronRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>

          <div className="space-y-2">
            {recentLoading ? (
              [...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))
            ) : recentTransactions.length === 0 ? (
              <Card className="p-6 text-center text-muted-foreground">
                <p>아직 거래 내역이 없어요</p>
                <Link to="/add">
                  <Button variant="link" className="mt-2">+ 첫 거래 입력하기</Button>
                </Link>
              </Card>
            ) : (
              recentTransactions.map((transaction) => {
                const category = getCategoryById(transaction.category_id);
                return (
                  <TransactionItem
                    key={transaction.id}
                    id={transaction.id}
                    categoryId={transaction.category_id}
                    categoryName={category?.name || '기타'}
                    amount={transaction.amount}
                    memo={transaction.memo || undefined}
                    date={new Date(transaction.transaction_date)}
                    isRecurring={transaction.is_recurring || false}
                  />
                );
              })
            )}
          </div>
        </motion.div>
        
        {/* Smart Features */}
        <RecurringExpenseModal />
      </motion.div>
    </div>
  );
}
