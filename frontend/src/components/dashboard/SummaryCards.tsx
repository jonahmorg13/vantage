import { useCurrentMonth } from '../../hooks/useMonthBudget'
import { useSpentByCategory } from '../../hooks/useTransactions'
import { formatCurrency } from '../../utils/format'
import { Card, CardLabel, CardValue, CardSub } from '../ui/Card'

export function SummaryCards() {
  const month = useCurrentMonth()
  const spentMap = useSpentByCategory()

  if (!month) return null

  const totalBudget = month.categories.reduce((a, c) => a + c.budgetAmount, 0)
  const totalSpent = Array.from(spentMap.values()).reduce((a, v) => a + v, 0)
  const totalLeft = totalBudget - totalSpent
  const unallocated = month.takeHomePay - totalBudget

  return (
    <div className="grid grid-cols-4 gap-5 mb-10 max-[900px]:grid-cols-2">
      <Card accentColor="var(--color-accent)">
        <CardLabel>Total Budget</CardLabel>
        <CardValue>{formatCurrency(totalBudget)}</CardValue>
        <CardSub>{(totalBudget / month.takeHomePay * 100).toFixed(1)}% of take-home</CardSub>
      </Card>

      <Card accentColor="var(--color-accent4)">
        <CardLabel>Total Spent</CardLabel>
        <CardValue className="text-accent2">{formatCurrency(totalSpent)}</CardValue>
        <CardSub>
          {totalBudget > 0 ? (totalSpent / totalBudget * 100).toFixed(1) : '0'}% of budget used
        </CardSub>
      </Card>

      <Card accentColor="var(--color-accent2)">
        <CardLabel>Amount Left</CardLabel>
        <CardValue className={totalLeft < 0 ? 'text-danger' : 'text-accent3'}>
          {totalLeft < 0 ? '-' : ''}{formatCurrency(totalLeft)}
        </CardValue>
        <CardSub>{totalLeft >= 0 ? 'remaining' : 'OVER BUDGET'}</CardSub>
      </Card>

      <Card accentColor="var(--color-accent3)">
        <CardLabel>Unallocated</CardLabel>
        <CardValue className={unallocated < 0 ? 'text-danger' : 'text-accent4'}>
          {unallocated < 0 ? '-' : ''}{formatCurrency(unallocated)}
        </CardValue>
        <CardSub>{(unallocated / month.takeHomePay * 100).toFixed(1)}% of take-home</CardSub>
      </Card>
    </div>
  )
}
