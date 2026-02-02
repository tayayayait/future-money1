import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import {
  Wallet,
  Target,
  TrendingUp,
  ArrowRight,
  ArrowLeft,
  Home,
  Building,
  Users,
  Loader2,
  CreditCard,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { useUpdateProfile } from "@/hooks/useProfile";
import { useCreateAsset } from "@/hooks/useAssets";
import { useCreateGoal } from "@/hooks/useGoals";

type Step = "welcome" | "basicInfo" | "assetSelection" | "assetDetails" | "goals";

interface OnboardingData {
  // 기본 정보
  monthlyIncome: string;
  payDay: string;
  housingType: string;
  
  // 자산 선택 (체크박스)
  selectedAssets: string[]; // ['cash', 'investment', 'realEstate', 'debt']
  
  // 자산 상세 금액
  cashAmount: string;
  investmentAmount: string;
  realEstateAmount: string;
  debtAmount: string;
  
  // 목표
  goalType: string;
  goalAmount: string;
  goalDate: string;
}

const stepOrder: Step[] = ["welcome", "basicInfo", "assetSelection", "assetDetails", "goals"];

const housingOptions = [
  { value: "own", label: "자가", icon: Home },
  { value: "rent", label: "월세", icon: Building },
  { value: "jeonse", label: "전세", icon: Building },
  { value: "living_with_family", label: "가족과 거주", icon: Users },
];

const assetTypes = [
  {
    id: 'cash',
    label: '현금/예금',
    icon: Wallet,
    placeholder: '10,000,000',
    examples: '입출금 통장, 적금, 정기예금',
    color: 'text-blue-500',
  },
  {
    id: 'investment',
    label: '투자자산',
    icon: TrendingUp,
    placeholder: '5,000,000',
    examples: '주식, 펀드, 채권, 가상화폐',
    color: 'text-green-500',
  },
  {
    id: 'realEstate',
    label: '부동산',
    icon: Home,
    placeholder: '300,000,000',
    examples: '아파트, 주택, 토지',
    color: 'text-purple-500',
  },
  {
    id: 'debt',
    label: '대출/부채',
    icon: CreditCard,
    placeholder: '50,000,000',
    examples: '주택담보대출, 신용대출, 학자금대출',
    color: 'text-red-500',
  },
];

const goalTypes = [
  { value: "emergency_fund", label: "비상금 마련" },
  { value: "home_purchase", label: "주택 구매" },
  { value: "retirement", label: "은퇴 자금" },
  { value: "travel", label: "여행" },
  { value: "debt_payoff", label: "부채 상환" },
  { value: "other", label: "기타" },
];

export default function Onboarding() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState<Step>("welcome");
  const [isSaving, setIsSaving] = useState(false);
  const [data, setData] = useState<OnboardingData>({
    // 기본 정보
    monthlyIncome: "",
    payDay: "25",
    housingType: "",
    // 자산 선택
    selectedAssets: [],
    // 자산 상세 금액
    cashAmount: "",
    investmentAmount: "",
    realEstateAmount: "",
    debtAmount: "",
    // 목표
    goalType: "",
    goalAmount: "",
    goalDate: "",
  });

  // Supabase mutation hooks
  const updateProfile = useUpdateProfile();
  const createAsset = useCreateAsset();
  const createGoal = useCreateGoal();

  const currentStepIndex = stepOrder.indexOf(currentStep);
  const progress = (currentStepIndex / (stepOrder.length - 1)) * 100;

  const updateData = (field: keyof OnboardingData, value: string) => {
    setData((prev) => ({ ...prev, [field]: value }));
  };

  const toggleAsset = (assetId: string) => {
    setData((prev) => ({
      ...prev,
      selectedAssets: prev.selectedAssets.includes(assetId)
        ? prev.selectedAssets.filter(id => id !== assetId)
        : [...prev.selectedAssets, assetId]
    }));
  };

  const nextStep = async () => {
    const nextIndex = currentStepIndex + 1;
    if (nextIndex < stepOrder.length) {
      setCurrentStep(stepOrder[nextIndex]);
    } else {
      // Complete onboarding - Save all data to Supabase
      setIsSaving(true);
      try {
        // 1. Save profile (basic info) + onboarding completion flag
        await updateProfile.mutateAsync({
          monthly_income: data.monthlyIncome
            ? parseInt(data.monthlyIncome)
            : null,
          pay_day: data.payDay ? parseInt(data.payDay) : null,
          housing_type: data.housingType || null,
          onboarding_completed: true,
          onboarding_completed_at: new Date().toISOString(),
        });

        // 2. Save selected assets
        // 현금/예금
        if (data.selectedAssets.includes('cash') && data.cashAmount && parseInt(data.cashAmount) > 0) {
          await createAsset.mutateAsync({
            type: "savings",
            name: "현금/예금",
            amount: parseInt(data.cashAmount),
          });
        }

        // 투자자산
        if (data.selectedAssets.includes('investment') && data.investmentAmount && parseInt(data.investmentAmount) > 0) {
          await createAsset.mutateAsync({
            type: "investment",
            name: "투자자산",
            amount: parseInt(data.investmentAmount),
          });
        }

        // 부동산
        if (data.selectedAssets.includes('realEstate') && data.realEstateAmount && parseInt(data.realEstateAmount) > 0) {
          await createAsset.mutateAsync({
            type: "investment", // assets 테이블에는 realEstate 타입이 없으므로 investment로 저장
            name: "부동산",
            amount: parseInt(data.realEstateAmount),
          });
        }

        // 대출/부채
        if (data.selectedAssets.includes('debt') && data.debtAmount && parseInt(data.debtAmount) > 0) {
          await createAsset.mutateAsync({
            type: "debt",
            name: "대출/부채",
            amount: -parseInt(data.debtAmount), // negative for debt
          });
        }

        // 3. Save goal
        if (data.goalType && data.goalAmount) {
          const goalTypeLabels: Record<string, string> = {
            emergency_fund: "비상금 마련",
            home_purchase: "주택 구매",
            retirement: "은퇴 자금",
            travel: "여행",
            debt_payoff: "부채 상환",
            other: "기타",
          };
          await createGoal.mutateAsync({
            type: data.goalType,
            name: goalTypeLabels[data.goalType] || "재정 목표",
            target_amount: parseInt(data.goalAmount),
            target_date: data.goalDate || undefined,
          });
        }

        toast.success("온보딩이 완료되었습니다!");
        navigate("/");
      } catch (error) {
        console.error("Onboarding save error:", error);
        toast.error("저장 중 오류가 발생했습니다. 다시 시도해주세요.");
      } finally {
        setIsSaving(false);
      }
    }
  };

  const prevStep = () => {
    const prevIndex = currentStepIndex - 1;
    if (prevIndex >= 0) {
      setCurrentStep(stepOrder[prevIndex]);
    }
  };

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 100 : -100,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      x: direction < 0 ? 100 : -100,
      opacity: 0,
    }),
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Progress Bar */}
      {currentStep !== "welcome" && (
        <div className="p-4 pt-safe-top">
          <Progress value={progress} className="h-1" />
          <p className="text-xs text-muted-foreground mt-2 text-center">
            {currentStepIndex} / {stepOrder.length - 1}
          </p>
        </div>
      )}

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        <AnimatePresence mode="wait" custom={1}>
          {/* WELCOME STEP */}
          {currentStep === "welcome" && (
            <motion.div
              key="welcome"
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              custom={1}
              className="h-full flex flex-col items-center justify-center p-6 text-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", delay: 0.2 }}
                className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mb-8"
              >
                <Wallet className="w-12 h-12 text-primary" />
              </motion.div>

              <h1 className="text-3xl font-bold mb-4">미래 재정 시뮬레이터</h1>
              <p className="text-muted-foreground mb-8 max-w-sm">
                당신의 소비 패턴을 분석하고, 다양한 시나리오로 미래를
                설계해보세요.
              </p>

              <div className="grid grid-cols-3 gap-4 mb-8 w-full max-w-sm">
                <div className="flex flex-col items-center gap-2">
                  <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-secondary" />
                  </div>
                  <span className="text-xs text-muted-foreground">
                    소비 분석
                  </span>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Target className="w-6 h-6 text-primary" />
                  </div>
                  <span className="text-xs text-muted-foreground">
                    목표 설정
                  </span>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center">
                    <Wallet className="w-6 h-6 text-success" />
                  </div>
                  <span className="text-xs text-muted-foreground">
                    미래 예측
                  </span>
                </div>
              </div>

              <Button
                size="lg"
                onClick={nextStep}
                className="gap-2 w-full max-w-sm"
              >
                시작하기
                <ArrowRight className="w-4 h-4" />
              </Button>
            </motion.div>
          )}

          {/* BASIC INFO STEP */}
          {currentStep === "basicInfo" && (
            <motion.div
              key="basicInfo"
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              custom={1}
              className="p-6 space-y-6"
            >
              <div>
                <h2 className="text-2xl font-bold mb-2">기본 정보</h2>
                <p className="text-muted-foreground">
                  더 정확한 분석을 위해 기본 정보를 입력해주세요.
                </p>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="monthlyIncome">월 실수령액</Label>
                  <div className="relative">
                    <Input
                      id="monthlyIncome"
                      type="number"
                      placeholder="3,500,000"
                      value={data.monthlyIncome}
                      onChange={(e) =>
                        updateData("monthlyIncome", e.target.value)
                      }
                      className="pr-8"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                      원
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="payDay">급여일</Label>
                  <div className="relative">
                    <Input
                      id="payDay"
                      type="number"
                      min="1"
                      max="31"
                      placeholder="25"
                      value={data.payDay}
                      onChange={(e) => updateData("payDay", e.target.value)}
                      className="pr-8"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                      일
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>거주 형태</Label>
                  <RadioGroup
                    value={data.housingType}
                    onValueChange={(value) => updateData("housingType", value)}
                    className="grid grid-cols-2 gap-3"
                  >
                    {housingOptions.map((option) => (
                      <Label
                        key={option.value}
                        htmlFor={option.value}
                        className={`
                          flex items-center gap-3 p-4 rounded-lg border cursor-pointer transition-all
                          ${
                            data.housingType === option.value
                              ? "border-primary bg-primary/5"
                              : "border-border hover:border-primary/50"
                          }
                        `}
                      >
                        <RadioGroupItem
                          value={option.value}
                          id={option.value}
                          className="sr-only"
                        />
                        <option.icon className="w-5 h-5 text-muted-foreground" />
                        <span>{option.label}</span>
                      </Label>
                    ))}
                  </RadioGroup>
                </div>
              </div>
            </motion.div>
          )}

          {/* ASSET SELECTION STEP */}
          {currentStep === "assetSelection" && (
           <motion.div
              key="assetSelection"
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              custom={1}
              className="p-6 space-y-6"
            >
              <div>
                <h2 className="text-2xl font-bold mb-2">보유 자산 선택</h2>
                <p className="text-muted-foreground">
                  현재 보유하고 계신 자산 종류를 선택해주세요. (복수 선택 가능)
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {assetTypes.map((type) => {
                  const Icon = type.icon;
                  const isSelected = data.selectedAssets.includes(type.id);
                  
                  return (
                    <div
                      key={type.id}
                      onClick={() => toggleAsset(type.id)}
                      className={`
                        flex flex-col items-center gap-3 p-5 rounded-xl border-2 cursor-pointer transition-all
                        ${isSelected 
                          ? 'border-primary bg-primary/5 shadow-sm' 
                          : 'border-border hover:border-primary/30 hover:bg-accent/50'}
                      `}
                    >
                      <div className={`p-3 rounded-full ${isSelected ? 'bg-primary/10' : 'bg-muted'}`}>
                        <Icon className={`w-6 h-6 ${isSelected ? 'text-primary' : 'text-muted-foreground'}`} />
                      </div>
                      <div className="text-center">
                        <div className="font-semibold mb-1">{type.label}</div>
                        <div className="text-xs text-muted-foreground">{type.examples}</div>
                      </div>
                      <Checkbox 
                        checked={isSelected}
                        className="mt-2"
                      />
                    </div>
                  );
                })}
              </div>

              <Card className="bg-info-light border-info/20">
                <CardContent className="p-4">
                  <p className="text-sm text-muted-foreground">
                    💡 선택하신 자산의 구체적인 금액은 다음 단계에서 입력합니다.
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* ASSET DETAILS STEP */}
          {currentStep === "assetDetails" && (
            <motion.div
              key="assetDetails"
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              custom={1}
              className="p-6 space-y-6"
            >
              <div>
                <h2 className="text-2xl font-bold mb-2">자산 금액 입력</h2>
                <p className="text-muted-foreground">
                  선택하신 자산의 대략적인 금액을 입력해주세요.
                </p>
              </div>

              {data.selectedAssets.length === 0 ? (
                <Card className="bg-warning-light border-warning/20">
                  <CardContent className="p-4 text-center">
                    <p className="text-sm">
                      이전 단계에서 자산을 선택하지 않으셨습니다.<br />
                      바로 다음 단계로 진행하거나 이전으로 돌아가세요.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {data.selectedAssets.includes('cash') && (
                    <div className="space-y-2">
                      <Label htmlFor="cashAmount" className="flex items-center gap-2">
                        <Wallet className="w-4 h-4 text-blue-500" />
                        현금 / 예금 총액
                      </Label>
                      <div className="relative">
                        <Input
                          id="cashAmount"
                          type="number"
                          placeholder="10,000,000"
                          value={data.cashAmount}
                          onChange={(e) => updateData("cashAmount", e.target.value)}
                          className="pr-8"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                          원
                        </span>
                      </div>
                    </div>
                  )}

                  {data.selectedAssets.includes('investment') && (
                    <div className="space-y-2">
                      <Label htmlFor="investmentAmount" className="flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-green-500" />
                        투자자산 총액
                      </Label>
                      <div className="relative">
                        <Input
                          id="investmentAmount"
                          type="number"
                          placeholder="5,000,000"
                          value={data.investmentAmount}
                          onChange={(e) => updateData("investmentAmount", e.target.value)}
                          className="pr-8"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                          원
                        </span>
                      </div>
                    </div>
                  )}

                  {data.selectedAssets.includes('realEstate') && (
                    <div className="space-y-2">
                      <Label htmlFor="realEstateAmount" className="flex items-center gap-2">
                        <Home className="w-4 h-4 text-purple-500" />
                        부동산 총액
                      </Label>
                      <div className="relative">
                        <Input
                          id="realEstateAmount"
                          type="number"
                          placeholder="300,000,000"
                          value={data.realEstateAmount}
                          onChange={(e) => updateData("realEstateAmount", e.target.value)}
                          className="pr-8"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                          원
                        </span>
                      </div>
                    </div>
                  )}

                  {data.selectedAssets.includes('debt') && (
                    <div className="space-y-2">
                      <Label htmlFor="debtAmount" className="flex items-center gap-2">
                        <CreditCard className="w-4 h-4 text-red-500" />
                        대출 / 부채 총액
                      </Label>
                      <div className="relative">
                        <Input
                          id="debtAmount"
                          type="number"
                          placeholder="50,000,000"
                          value={data.debtAmount}
                          onChange={(e) => updateData("debtAmount", e.target.value)}
                          className="pr-8"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                          원
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              <Card className="bg-info-light border-info/20">
                <CardContent className="p-4">
                  <p className="text-sm text-muted-foreground">
                    💡 정확하지 않아도 괜찮습니다. 대략적인 금액만 입력해주세요.
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* GOALS STEP */}
          {currentStep === "goals" && (
            <motion.div
              key="goals"
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              custom={1}
              className="p-6 space-y-6"
            >
              <div>
                <h2 className="text-2xl font-bold mb-2">재정 목표</h2>
                <p className="text-muted-foreground">
                  달성하고 싶은 재정 목표를 설정해보세요.
                </p>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>목표 유형</Label>
                  <RadioGroup
                    value={data.goalType}
                    onValueChange={(value) => updateData("goalType", value)}
                    className="grid grid-cols-2 gap-3"
                  >
                    {goalTypes.map((option) => (
                      <Label
                        key={option.value}
                        htmlFor={`goal-${option.value}`}
                        className={`
                          flex items-center justify-center p-4 rounded-lg border cursor-pointer transition-all text-center
                          ${
                            data.goalType === option.value
                              ? "border-primary bg-primary/5"
                              : "border-border hover:border-primary/50"
                          }
                        `}
                      >
                        <RadioGroupItem
                          value={option.value}
                          id={`goal-${option.value}`}
                          className="sr-only"
                        />
                        <span>{option.label}</span>
                      </Label>
                    ))}
                  </RadioGroup>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="goalAmount">목표 금액</Label>
                  <div className="relative">
                    <Input
                      id="goalAmount"
                      type="number"
                      placeholder="50,000,000"
                      value={data.goalAmount}
                      onChange={(e) => updateData("goalAmount", e.target.value)}
                      className="pr-8"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                      원
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="goalDate">달성 희망일</Label>
                  <Input
                    id="goalDate"
                    type="date"
                    value={data.goalDate}
                    onChange={(e) => updateData("goalDate", e.target.value)}
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Navigation Buttons */}
      {currentStep !== "welcome" && (
        <div className="p-6 flex gap-3 safe-area-bottom">
          <Button variant="outline" onClick={prevStep} className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            이전
          </Button>
          <Button
            onClick={nextStep}
            className="flex-1 gap-2"
            disabled={isSaving}
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                저장 중...
              </>
            ) : (
              <>
                {currentStep === "goals" ? "완료" : "다음"}
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
