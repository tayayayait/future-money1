import { useMemo, useState } from "react";
import { MainLayout } from "@/components/layout";
import { TransactionItem } from "@/components/ui/transaction-item";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Sheet,
  SheetContent,
  SheetClose,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { EXPENSE_CATEGORIES, getCategoryById } from "@/lib/categories";
import { motion } from "framer-motion";
import { Filter, Search, Plus } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import {
  useTransactions,
  useDeleteTransaction,
  type Transaction,
} from "@/hooks/useTransactions";
import { format, parseISO, startOfDay, endOfDay } from "date-fns";
import { ko } from "date-fns/locale";

// 날짜별로 거래를 그룹화
function groupByDate(transactions: Transaction[]) {
  const groups: Record<string, Transaction[]> = {};

  transactions.forEach((t) => {
    const date = parseISO(t.transaction_date);
    const dateKey = format(date, "yyyy년 M월 d일 (E)", { locale: ko });
    if (!groups[dateKey]) {
      groups[dateKey] = [];
    }
    groups[dateKey].push(t);
  });

  return groups;
}

type TabType = "all" | "expense" | "income";

type TransactionFilters = {
  startDate: string;
  endDate: string;
  minAmount: string;
  maxAmount: string;
  recurringOnly: boolean;
};

const INITIAL_FILTERS: TransactionFilters = {
  startDate: "",
  endDate: "",
  minAmount: "",
  maxAmount: "",
  recurringOnly: false,
};

export default function Transactions() {
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>("all");
  const navigate = useNavigate();
  const [searchActive, setSearchActive] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<TransactionFilters>(INITIAL_FILTERS);
  const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [transactionToDelete, setTransactionToDelete] = useState<string | null>(
    null,
  );

  const { mutate: deleteTransaction } = useDeleteTransaction();

  const handleDeleteClick = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setTransactionToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (transactionToDelete) {
      deleteTransaction(transactionToDelete);
      setDeleteDialogOpen(false);
      setTransactionToDelete(null);
    }
  };

  // Supabase에서 거래 내역 가져오기
  const { data: transactions = [], isLoading } = useTransactions();
  const hasActiveFilters = Boolean(
    filters.startDate ||
    filters.endDate ||
    filters.minAmount ||
    filters.maxAmount ||
    filters.recurringOnly,
  );
  const handleSearchToggle = () => {
    setSearchActive((prev) => {
      if (prev) {
        setSearchQuery("");
      }
      return !prev;
    });
  };
  const handleFilterReset = () => {
    setFilters(INITIAL_FILTERS);
  };

  // 필터링된 거래 내역
  const filteredTransactions = useMemo(() => {
    let filtered = [...transactions];

    // 탭 필터
    if (activeTab === "expense") {
      filtered = filtered.filter((t) => t.amount < 0);
    } else if (activeTab === "income") {
      filtered = filtered.filter((t) => t.amount >= 0);
    }

    // 카테고리 필터
    if (activeFilter) {
      filtered = filtered.filter((t) => t.category_id === activeFilter);
    }

    const searchTerm = searchActive ? searchQuery.trim().toLowerCase() : "";
    if (searchTerm) {
      filtered = filtered.filter((t) => {
        const memo = t.memo?.toLowerCase() ?? "";
        const categoryName =
          getCategoryById(t.category_id)?.name?.toLowerCase() ?? "";
        const amountLabel = t.amount.toString();
        const dateLabel = t.transaction_date.toLowerCase();
        return (
          memo.includes(searchTerm) ||
          categoryName.includes(searchTerm) ||
          amountLabel.includes(searchTerm) ||
          dateLabel.includes(searchTerm)
        );
      });
    }

    if (filters.recurringOnly) {
      filtered = filtered.filter((t) => t.is_recurring);
    }

    if (filters.startDate) {
      const from = startOfDay(parseISO(filters.startDate));
      filtered = filtered.filter((t) => parseISO(t.transaction_date) >= from);
    }

    if (filters.endDate) {
      const until = endOfDay(parseISO(filters.endDate));
      filtered = filtered.filter((t) => parseISO(t.transaction_date) <= until);
    }

    const minInput = filters.minAmount.trim();
    if (minInput !== "") {
      const minValue = Number(minInput);
      if (!Number.isNaN(minValue)) {
        filtered = filtered.filter((t) => t.amount >= minValue);
      }
    }

    const maxInput = filters.maxAmount.trim();
    if (maxInput !== "") {
      const maxValue = Number(maxInput);
      if (!Number.isNaN(maxValue)) {
        filtered = filtered.filter((t) => t.amount <= maxValue);
      }
    }

    return filtered;
  }, [
    transactions,
    activeTab,
    activeFilter,
    filters,
    searchActive,
    searchQuery,
  ]);

  // 날짜별 그룹화
  const groupedTransactions = useMemo(() => {
    return groupByDate(filteredTransactions);
  }, [filteredTransactions]);

  // 선택된 기간 합계
  const monthlyTotal = useMemo(() => {
    return filteredTransactions.reduce((sum, t) => sum + t.amount, 0);
  }, [filteredTransactions]);

  return (
    <div className="pb-20">
      <div className="p-4 space-y-4">
        {/* Header */}
        <div className="space-y-2 pt-2">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold">거래 내역</h1>
              <p className="text-sm text-muted-foreground">
                총 {filteredTransactions.length}건
                {monthlyTotal !== 0 && (
                  <span
                    className={
                      monthlyTotal >= 0
                        ? "text-success ml-2"
                        : "text-destructive ml-2"
                    }
                  >
                    {monthlyTotal >= 0 ? "+" : ""}
                    {(monthlyTotal / 10000).toFixed(0)}만원
                  </span>
                )}
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant={searchActive ? "secondary" : "outline"}
                size="icon"
                onClick={handleSearchToggle}
                aria-label={searchActive ? "검색 닫기" : "거래 검색"}
              >
                <Search className="w-4 h-4" />
              </Button>
              <Sheet
                open={isFilterSheetOpen}
                onOpenChange={setIsFilterSheetOpen}
              >
                <SheetTrigger asChild>
                  <Button
                    variant={hasActiveFilters ? "secondary" : "outline"}
                    size="icon"
                    aria-label="필터 열기"
                  >
                    <Filter className="w-4 h-4" />
                  </Button>
                </SheetTrigger>
                <SheetContent
                  side="bottom"
                  className="rounded-t-3xl border border-border px-6 pb-6 pt-5 shadow-xl"
                >
                  <SheetHeader>
                    <SheetTitle>거래 필터</SheetTitle>
                    <p className="text-sm text-muted-foreground">
                      날짜, 금액, 정기 조건을 조합해서 결과를 좁혀보세요.
                    </p>
                  </SheetHeader>
                  <div className="mt-4 space-y-4">
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="space-y-1">
                        <Label htmlFor="filter-start">조회 시작일</Label>
                        <Input
                          id="filter-start"
                          type="date"
                          value={filters.startDate}
                          onChange={(event) =>
                            setFilters((prev) => ({
                              ...prev,
                              startDate: event.target.value,
                            }))
                          }
                        />
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="filter-end">조회 종료일</Label>
                        <Input
                          id="filter-end"
                          type="date"
                          value={filters.endDate}
                          onChange={(event) =>
                            setFilters((prev) => ({
                              ...prev,
                              endDate: event.target.value,
                            }))
                          }
                        />
                      </div>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="space-y-1">
                        <Label htmlFor="filter-min">최소 금액</Label>
                        <Input
                          id="filter-min"
                          type="number"
                          placeholder="예: -500000"
                          value={filters.minAmount}
                          onChange={(event) =>
                            setFilters((prev) => ({
                              ...prev,
                              minAmount: event.target.value,
                            }))
                          }
                        />
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="filter-max">최대 금액</Label>
                        <Input
                          id="filter-max"
                          type="number"
                          placeholder="예: 1000000"
                          value={filters.maxAmount}
                          onChange={(event) =>
                            setFilters((prev) => ({
                              ...prev,
                              maxAmount: event.target.value,
                            }))
                          }
                        />
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="filter-recurring"
                        checked={filters.recurringOnly}
                        onCheckedChange={(checked) =>
                          setFilters((prev) => ({
                            ...prev,
                            recurringOnly: Boolean(checked),
                          }))
                        }
                      />
                      <Label
                        htmlFor="filter-recurring"
                        className="text-sm font-medium cursor-pointer"
                      >
                        정기 거래만 보기
                      </Label>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      입력한 금액은 실거래 금액(원) 기준이며, 검색어는
                      카테고리/메모/금액/날짜를 기준으로 합니다.
                    </p>
                  </div>
                  <SheetFooter className="mt-6 flex items-center justify-between">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleFilterReset}
                    >
                      초기화
                    </Button>
                    <SheetClose asChild>
                      <Button size="sm">적용</Button>
                    </SheetClose>
                  </SheetFooter>
                </SheetContent>
              </Sheet>
            </div>
          </div>
          {searchActive && (
            <div className="w-full sm:max-w-md">
              <Input
                type="text"
                placeholder="카테고리, 메모, 금액으로 검색"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                autoFocus
              />
            </div>
          )}
        </div>
        {/* Category Filter */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
          <Badge
            variant={activeFilter === null ? "default" : "outline"}
            className="cursor-pointer whitespace-nowrap"
            onClick={() => setActiveFilter(null)}
          >
            전체
          </Badge>
          {EXPENSE_CATEGORIES.slice(0, 6).map((cat) => (
            <Badge
              key={cat.id}
              variant={activeFilter === cat.id ? "default" : "outline"}
              className="cursor-pointer whitespace-nowrap"
              onClick={() => setActiveFilter(cat.id)}
            >
              {cat.name}
            </Badge>
          ))}
        </div>

        {/* Tabs */}
        <Tabs
          value={activeTab}
          onValueChange={(v) => setActiveTab(v as TabType)}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="all">전체</TabsTrigger>
            <TabsTrigger value="expense">지출</TabsTrigger>
            <TabsTrigger value="income">수입</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="space-y-6 mt-4">
            {isLoading ? (
              // 로딩 스켈레톤
              [...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))
            ) : Object.keys(groupedTransactions).length === 0 ? (
              // 빈 상태
              <Card className="p-8 text-center">
                <p className="text-muted-foreground mb-4">
                  {activeFilter
                    ? "해당 카테고리의 거래 내역이 없습니다."
                    : "아직 거래 내역이 없습니다."}
                </p>
                <Link to="/add">
                  <Button className="gap-2">
                    <Plus className="w-4 h-4" />
                    거래 추가하기
                  </Button>
                </Link>
              </Card>
            ) : (
              // 거래 목록
              Object.entries(groupedTransactions).map(
                ([date, transactions]) => (
                  <motion.div
                    key={date}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <h3 className="text-sm font-medium text-muted-foreground mb-2">
                      {date}
                    </h3>
                    <div className="space-y-2">
                      {transactions.map((t) => {
                        const category = getCategoryById(t.category_id);
                        return (
                          <TransactionItem
                            key={t.id}
                            id={t.id}
                            categoryId={t.category_id}
                            categoryName={category?.name || "기타"}
                            amount={t.amount}
                            memo={t.memo || undefined}
                            date={parseISO(t.transaction_date)}
                            isRecurring={t.is_recurring || false}
                            onClick={() =>
                              navigate("/add", { state: { transaction: t } })
                            }
                            onDelete={(e) => handleDeleteClick(e, t.id)}
                          />
                        );
                      })}
                    </div>
                  </motion.div>
                ),
              )
            )}
          </TabsContent>
        </Tabs>

        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent className="w-[90%] max-w-md rounded-2xl">
            <AlertDialogHeader>
              <AlertDialogTitle>거래 내역 삭제</AlertDialogTitle>
              <AlertDialogDescription>
                정말 이 거래 내역을 삭제하시겠습니까? 삭제 후에는 복구할 수
                없습니다.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>취소</AlertDialogCancel>
              <AlertDialogAction
                onClick={confirmDelete}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                삭제
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
