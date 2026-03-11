import { useAppContext } from '../../context/AppContext'
import { useCurrency } from '../../hooks/useCurrency'
import { StatusPill } from '../ui/StatusPill'
import { ProgressBar } from '../ui/ProgressBar'
import type { Category } from '../../types'

interface CategoryRowProps {
  category: Category
  spent: number
  onEdit: (cat: Category) => void
  readOnly?: boolean
}

export function CategoryRow({ category: cat, spent, onEdit, readOnly }: CategoryRowProps) {
  const format = useCurrency()
  const { state, dispatch } = useAppContext()
  const left = cat.budgetAmount - spent
  const pct = cat.budgetAmount > 0 ? Math.min((spent / cat.budgetAmount) * 100, 100) : 0
  const overLimit = cat.budgetAmount > 0 && spent > cat.budgetAmount
  const nearLimit = cat.budgetAmount > 0 && spent > cat.budgetAmount * 0.85 && spent <= cat.budgetAmount

  const isFull = !overLimit && pct >= 100
  const barColor = overLimit
    ? 'var(--color-danger)'
    : nearLimit
      ? 'var(--color-warning)'
      : cat.color
  const status: 'ok' | 'warn' | 'over' | 'full' | 'none' = overLimit
    ? 'over'
    : isFull
      ? 'full'
      : nearLimit
        ? 'warn'
        : cat.budgetAmount === 0
          ? 'none'
          : 'ok'

  return (
    <>
      <tr
        className="hover:bg-accent/[0.04] cursor-pointer"
        onClick={() => onEdit(cat)}
      >
        <td className="px-5 py-3 text-sm border-b-0">
          <div className="flex items-center gap-2.5">
            <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: cat.color }} />
            <span>{cat.name}</span>
          </div>
        </td>
        <td className="px-5 py-3 border-b-0">
          <span className="text-text font-mono text-sm">{format(cat.budgetAmount)}</span>
        </td>
        <td className="px-5 py-3 text-sm text-accent2 border-b-0">{format(spent)}</td>
        <td className={`px-5 py-3 text-sm border-b-0 ${left < 0 ? 'text-danger' : 'text-accent3'}`}>
          {left < 0 ? '-' : ''}
          {format(left)}
        </td>
        <td className="px-5 py-3 border-b-0 max-[640px]:hidden">
          <StatusPill status={status} />
        </td>
        {!readOnly && (
          <td className="px-5 py-3 border-b-0 max-[640px]:hidden" onClick={(e) => e.stopPropagation()}>
            <div className="flex gap-1.5">
              <button
                onClick={() => onEdit(cat)}
                className="bg-transparent border-none text-text3 cursor-pointer text-xl p-1.5 px-2 rounded transition-all hover:bg-accent/15 hover:text-accent leading-none"
                title="Edit"
              >
                ✎
              </button>
              <button
                onClick={() => {
                  if (confirm('Delete this budget item? Transactions in it will be removed too.')) {
                    dispatch({
                      type: 'DELETE_CATEGORY',
                      monthKey: state.currentMonthKey,
                      id: cat.id,
                    })
                  }
                }}
                className="bg-transparent border-none text-text3 cursor-pointer text-2xl p-1 px-2 rounded transition-all hover:bg-danger/15 hover:text-danger leading-none"
                title="Delete"
              >
                ×
              </button>
            </div>
          </td>
        )}
      </tr>
      <tr onClick={() => onEdit(cat)} className="cursor-pointer">
        <td colSpan={7} className="px-5 pb-2.5 border-b border-white/[0.03]">
          <ProgressBar
            percentage={pct}
            color={cat.budgetAmount === 0 && spent === 0 ? 'transparent' : barColor}
          />
        </td>
      </tr>
    </>
  )
}
