import Skeleton from 'react-loading-skeleton'
import { useCurrentMonth } from '../../hooks/useMonthBudget'
import { useSpentByCategory } from '../../hooks/useTransactions'
import { useAppContext } from '../../context/AppContext'
import { CategoryRow } from './CategoryRow'
import type { Category } from '../../types'

interface CategoryTableProps {
  onEdit: (cat: Category) => void
  readOnly?: boolean
}

export function CategoryTable({ onEdit, readOnly }: CategoryTableProps) {
  const { isHydrating } = useAppContext()
  const month = useCurrentMonth()
  const spentMap = useSpentByCategory()

  if (isHydrating) {
    return (
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <tbody>
            {Array.from({ length: 8 }).map((_, i) => (
              <tr key={i}>
                {Array.from({ length: readOnly ? 6 : 7 }).map((__, j) => (
                  <td key={j} className="px-5 py-3.5 border-b border-white/[0.03]">
                    <Skeleton height={14} width={j === 0 ? 100 : 60} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  }

  if (!month) return null

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr>
            <th className="px-5 py-3 text-left text-xs text-text3 tracking-[0.12em] uppercase border-b border-border whitespace-nowrap">
              Item
            </th>
            <th className="px-5 py-3 text-left text-xs text-text3 tracking-[0.12em] uppercase border-b border-border whitespace-nowrap">
              Budget $
            </th>
            <th className="px-5 py-3 text-left text-xs text-text3 tracking-[0.12em] uppercase border-b border-border whitespace-nowrap">
              Spent
            </th>
            <th className="px-5 py-3 text-left text-xs text-text3 tracking-[0.12em] uppercase border-b border-border whitespace-nowrap">
              Left
            </th>
            <th className="px-5 py-3 text-left text-xs text-text3 tracking-[0.12em] uppercase border-b border-border whitespace-nowrap max-[640px]:hidden">
              Status
            </th>
            {!readOnly && <th className="px-5 py-3 border-b border-border max-[640px]:hidden"></th>}
          </tr>
        </thead>
        <tbody>
          {month.categories.map((cat) => (
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
  )
}
