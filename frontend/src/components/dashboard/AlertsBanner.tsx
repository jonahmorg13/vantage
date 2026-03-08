import { useCurrentMonth } from '../../hooks/useMonthBudget'
import { useSpentByCategory } from '../../hooks/useTransactions'
import { formatCurrency } from '../../utils/format'

export function AlertsBanner() {
  const month = useCurrentMonth()
  const spentMap = useSpentByCategory()

  if (!month) return null

  const alerts = month.categories
    .filter(cat => {
      const spent = spentMap.get(cat.id) ?? 0
      return cat.spendLimit > 0 && spent > cat.spendLimit
    })
    .map(cat => {
      const spent = spentMap.get(cat.id) ?? 0
      return { cat, spent, over: spent - cat.spendLimit }
    })

  if (alerts.length === 0) return null

  return (
    <div className="mb-6 flex flex-col gap-3">
      {alerts.map(({ cat, spent, over }) => (
        <div
          key={cat.id}
          className="flex items-center gap-3 px-5 py-3 bg-danger/10 border border-danger/30 rounded-lg text-sm text-danger animate-fade-in"
        >
          ⚠ <strong>{cat.name}</strong> is over its limit — spent {formatCurrency(spent)} vs limit {formatCurrency(cat.spendLimit)} (+{formatCurrency(over)})
        </div>
      ))}
    </div>
  )
}
