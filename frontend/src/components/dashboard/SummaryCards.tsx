import Skeleton from 'react-loading-skeleton'
import { useCurrentMonth } from '../../hooks/useMonthBudget'
import { useSpentByCategory } from '../../hooks/useTransactions'
import { useAppContext } from '../../context/AppContext'
import { useCurrency } from '../../hooks/useCurrency'
import { Card, CardLabel, CardValue, CardSub } from '../ui/Card'

function getAccountBalance(
  accountId: number,
  initialBalance: number,
  transactions: ReturnType<typeof useAppContext>['state']['transactions']
): number {
  return transactions.reduce((sum, t) => {
    if (t.status !== 'confirmed') return sum
    if (t.type === 'income' && t.accountId === accountId) return sum + t.amount
    if (t.type === 'expense' && t.accountId === accountId) return sum - t.amount
    if (t.type === 'transfer' && t.accountId === accountId) return sum - t.amount
    if (t.type === 'transfer' && t.toAccountId === accountId) return sum + t.amount
    return sum
  }, initialBalance)
}

export function SummaryCards() {
  const format = useCurrency()
  const { state, isHydrating } = useAppContext()
  const month = useCurrentMonth()
  const spentMap = useSpentByCategory()

  if (isHydrating) {
    return (
      <div className="grid grid-cols-4 gap-5 mb-10 max-[900px]:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-surface border border-border rounded-xl px-5 py-4">
            <Skeleton width={80} height={11} className="mb-3" />
            <Skeleton width={110} height={26} className="mb-2" />
            <Skeleton width={100} height={10} />
          </div>
        ))}
      </div>
    )
  }

  if (!month) return null

  const totalBudget = month.categories.reduce((a, c) => a + c.budgetAmount, 0)
  const totalSpent = Array.from(spentMap.values()).reduce((a, v) => a + v, 0)
  const totalLeft = totalBudget - totalSpent
  const unallocated = month.takeHomePay - totalBudget

  const monthTransactions = state.transactions.filter((t) => t.monthKey <= state.currentMonthKey)
  const netWorth = state.accounts.reduce((sum, a) => {
    return sum + getAccountBalance(a.id, a.initialBalance, monthTransactions)
  }, 0)

  return (
    <div className="grid grid-cols-4 gap-5 mb-10 max-[900px]:grid-cols-2">
      <Card accentColor="var(--color-accent)">
        <CardLabel>Total Budget</CardLabel>
        <CardValue>{format(totalBudget)}</CardValue>
        <CardSub>{month.takeHomePay > 0 ? `${((totalBudget / month.takeHomePay) * 100).toFixed(1)}% of budget` : '\u00A0'}</CardSub>
      </Card>

      <Card accentColor="var(--color-accent4)">
        <CardLabel>Total Spent</CardLabel>
        <CardValue className="text-accent2">{format(totalSpent)}</CardValue>
        <CardSub>
          {totalBudget > 0 ? ((totalSpent / totalBudget) * 100).toFixed(1) : '0'}% of budget used
        </CardSub>
      </Card>

      <Card accentColor="var(--color-accent2)">
        <CardLabel>Amount Left</CardLabel>
        <CardValue className={totalLeft < 0 ? 'text-danger' : 'text-accent3'}>
          {totalLeft < 0 ? '-' : ''}
          {format(Math.abs(totalLeft))}
        </CardValue>
        <CardSub>{totalLeft >= 0 ? 'remaining' : 'OVER BUDGET'}</CardSub>
      </Card>

      {state.accounts.length > 0 ? (
        <Card accentColor="var(--color-accent3)">
          <CardLabel>Net Worth</CardLabel>
          <CardValue className={netWorth < 0 ? 'text-danger' : 'text-accent3'}>
            {netWorth < 0 ? '-' : ''}
            {format(Math.abs(netWorth))}
          </CardValue>
          <CardSub>
            {state.accounts.length} account{state.accounts.length !== 1 ? 's' : ''}
          </CardSub>
        </Card>
      ) : (
        <Card accentColor="var(--color-accent3)">
          <CardLabel>Unallocated</CardLabel>
          <CardValue className={unallocated < 0 ? 'text-danger' : 'text-accent4'}>
            {unallocated < 0 ? '-' : ''}
            {format(Math.abs(unallocated))}
          </CardValue>
          <CardSub>{month.takeHomePay > 0 ? `${((unallocated / month.takeHomePay) * 100).toFixed(1)}% of budget` : '\u00A0'}</CardSub>
        </Card>
      )}
    </div>
  )
}
