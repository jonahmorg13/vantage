import { useCurrentMonth } from '../../hooks/useMonthBudget'
import { useSpentByCategory } from '../../hooks/useTransactions'
import { formatCurrency } from '../../utils/format'
import { CategoryRow } from './CategoryRow'
import type { Category } from '../../types'

interface CategoryTableProps {
  onEdit: (cat: Category) => void
  readOnly?: boolean
}

export function CategoryTable({ onEdit, readOnly }: CategoryTableProps) {
  const month = useCurrentMonth()
  const spentMap = useSpentByCategory()

  if (!month) return null

  const totalBudget = month.categories.reduce((a, c) => a + c.budgetAmount, 0)
  const unallocated = month.grossIncome - totalBudget

  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="px-5 py-3 text-left text-xs text-text3 tracking-[0.12em] uppercase border-b border-border whitespace-nowrap">Category</th>
              <th className="px-5 py-3 text-left text-xs text-text3 tracking-[0.12em] uppercase border-b border-border whitespace-nowrap">Budget $</th>
              <th className="px-5 py-3 text-left text-xs text-text3 tracking-[0.12em] uppercase border-b border-border whitespace-nowrap">Limit</th>
              <th className="px-5 py-3 text-left text-xs text-text3 tracking-[0.12em] uppercase border-b border-border whitespace-nowrap">Spent</th>
              <th className="px-5 py-3 text-left text-xs text-text3 tracking-[0.12em] uppercase border-b border-border whitespace-nowrap">Left</th>
              <th className="px-5 py-3 text-left text-xs text-text3 tracking-[0.12em] uppercase border-b border-border whitespace-nowrap">Status</th>
              {!readOnly && <th className="px-5 py-3 border-b border-border"></th>}
            </tr>
          </thead>
          <tbody>
            {month.categories.map(cat => (
              <CategoryRow
                key={cat.id}
                category={cat}
                spent={spentMap.get(cat.id) ?? 0}
                onEdit={onEdit}
                readOnly={readOnly}
              />
            ))}
          </tbody>
        </table>
      </div>
      {Math.abs(unallocated) > 0.005 && (
        <div className={`text-sm px-5 py-3 ${unallocated < 0 ? 'text-danger' : 'text-warning'}`}>
          {unallocated > 0
            ? `⚠ ${formatCurrency(unallocated)} unallocated (${(unallocated / month.grossIncome * 100).toFixed(1)}% of gross)`
            : `⚠ Over-allocated by ${formatCurrency(Math.abs(unallocated))}`
          }
        </div>
      )}
    </>
  )
}
