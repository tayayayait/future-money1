import { useEffect } from 'react';
import { useBankAccounts } from '@/hooks/useBankAccounts';
import { AccountCard } from '@/components/accounts/AccountCard';
import { TransactionList } from '@/components/transactions/TransactionList';
import { Button } from '@/components/ui/button';
import { Plus, RefreshCcw } from 'lucide-react';

export default function AccountsPage() {
  const { 
    accounts, 
    transactions, 
    isLoading, 
    fetchAccounts, 
    fetchTransactions, 
    connectNewAccount 
  } = useBankAccounts();

  useEffect(() => {
    fetchAccounts();
    fetchTransactions();
  }, [fetchAccounts, fetchTransactions]);

  const handleRefresh = () => {
    fetchAccounts();
    fetchTransactions();
  };

  return (
    <div className="container mx-auto p-4 space-y-8 max-w-4xl pb-20">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">자산 관리</h1>
          <p className="text-muted-foreground mt-1">
            연동된 계좌와 최근 거래 내역을 확인하세요.
          </p>
        </div>
        <Button onClick={connectNewAccount} disabled={isLoading}>
          <Plus className="mr-2 h-4 w-4" /> 계좌 연동
        </Button>
      </header>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">내 계좌</h2>
          <Button variant="ghost" size="sm" onClick={handleRefresh} disabled={isLoading}>
            <RefreshCcw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            새로고침
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {accounts.map(account => (
            <AccountCard key={account.id} account={account} />
          ))}
          
          {/* 계좌 없을 때 빈 상태 표시 */}
          {accounts.length === 0 && !isLoading && (
            <div className="col-span-full py-8 text-center border-2 border-dashed rounded-lg bg-muted/50">
              <p className="text-muted-foreground mb-2">연동된 계좌가 없습니다.</p>
              <Button variant="outline" size="sm" onClick={connectNewAccount}>
                계좌 연동하기
              </Button>
            </div>
          )}
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">최근 거래 내역</h2>
        <TransactionList transactions={transactions} isLoading={isLoading} />
      </section>
    </div>
  );
}
