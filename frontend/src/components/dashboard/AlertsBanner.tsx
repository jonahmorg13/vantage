import { useState } from 'react'
import { useCurrentMonth } from '../../hooks/useMonthBudget'
import { useSpentByCategory } from '../../hooks/useTransactions'
import { useCurrency } from '../../hooks/useCurrency'

export function AlertsBanner() {
  const format = useCurrency()
  const month = useCurrentMonth()
  const spentMap = useSpentByCategory()
  const [expanded, setExpanded] = useState<Set<number>>(new Set())

  if (!month) return null

  const alerts = month.categories
    .filter((cat) => {
      const spent = spentMap.get(cat.id) ?? 0
      return cat.spendLimit > 0 && spent > cat.spendLimit
    })
    .map((cat) => {
      const spent = spentMap.get(cat.id) ?? 0
      return { cat, spent, over: spent - cat.spendLimit }
    })

  if (alerts.length === 0) return null

  function toggle(id: number) {
    setExpanded((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  return (
    <div className="mb-6 flex flex-col gap-2">
      {alerts.map(({ cat, spent, over }) => {
        const isOpen = expanded.has(cat.id)
        return (
          <button
            key={cat.id}
            onClick={() => toggle(cat.id)}
            className="w-full text-left px-4 py-2.5 bg-danger/10 border border-danger/30 rounded-lg text-danger animate-fade-in transition-colors hover:bg-danger/15"
          >
            <div className="flex items-center justify-between gap-3 text-sm">
              <span className="flex items-center gap-2 font-medium min-w-0">
                <span className="shrink-0">⚠</span>
                <span className="truncate">{cat.name}</span>
              </span>
              <span className="flex items-center gap-2 shrink-0 text-xs font-mono">
                <span>+{format(over)}</span>
                <span className="text-danger/60">{isOpen ? '▲' : '▼'}</span>
              </span>
            </div>
            {isOpen && (
              <div className="mt-2 pt-2 border-t border-danger/20 text-xs text-danger/80 font-mono">
                Spent {format(spent)} vs limit {format(cat.spendLimit)} — over by {format(over)}
              </div>
            )}
          </button>
        )
      })}
    </div>
  )
}
