import { useAppContext } from '../../context/AppContext'
import { formatCurrency } from '../../utils/format'
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
  const { state, dispatch } = useAppContext()
  const left = cat.budgetAmount - spent
  const pct = cat.budgetAmount > 0 ? Math.min((spent / cat.budgetAmount) * 100, 100) : 0
  const overLimit = cat.spendLimit > 0 && spent > cat.spendLimit
  const nearLimit = cat.spendLimit > 0 && spent > cat.spendLimit * 0.85 && spent <= cat.spendLimit

  const barColor = overLimit ? 'var(--color-danger)' : nearLimit ? 'var(--color-warning)' : cat.color
  const status: 'ok' | 'warn' | 'over' | 'none' =
    overLimit ? 'over' : nearLimit ? 'warn' :
    (cat.spendLimit === 0 && cat.budgetAmount === 0) ? 'none' : 'ok'

  function updateField(field: 'budgetAmount' | 'spendLimit', value: string) {
    dispatch({
      type: 'UPDATE_CATEGORY',
      monthKey: state.currentMonthKey,
      id: cat.id,
      updates: { [field]: parseFloat(value) || 0 },
    })
  }

  return (
    <>
      <tr className="hover:bg-accent/[0.04]">
        <td className="px-5 py-3 text-sm border-b border-white/[0.03]">
          <div className="flex items-center gap-2.5">
            <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: cat.color }} />
            <span>{cat.name}</span>
          </div>
        </td>
        <td className="px-5 py-3 border-b border-white/[0.03]">
          {readOnly ? (
            <span className="text-text font-mono text-sm">{formatCurrency(cat.budgetAmount)}</span>
          ) : (
            <input
              type="number"
              className="bg-transparent border border-transparent text-text font-mono text-sm px-2 py-1 rounded w-[100px] text-right transition-all focus:outline-none focus:border-accent focus:bg-surface2"
              value={cat.budgetAmount.toFixed(2)}
              onChange={e => updateField('budgetAmount', e.target.value)}
              step="0.01"
            />
          )}
        </td>
        <td className="px-5 py-3 border-b border-white/[0.03]">
          {readOnly ? (
            <span className="text-text font-mono text-sm">{cat.spendLimit > 0 ? formatCurrency(cat.spendLimit) : '—'}</span>
          ) : (
            <input
              type="number"
              className="bg-transparent border border-transparent text-text font-mono text-sm px-2 py-1 rounded w-[100px] text-right transition-all focus:outline-none focus:border-accent focus:bg-surface2"
              value={cat.spendLimit > 0 ? cat.spendLimit.toFixed(2) : ''}
              placeholder="—"
              onChange={e => updateField('spendLimit', e.target.value)}
              step="0.01"
            />
          )}
        </td>
        <td className="px-5 py-3 text-sm text-accent2 border-b border-white/[0.03]">
          {formatCurrency(spent)}
        </td>
        <td className={`px-5 py-3 text-sm border-b border-white/[0.03] ${left < 0 ? 'text-danger' : 'text-accent3'}`}>
          {left < 0 ? '-' : ''}{formatCurrency(left)}
        </td>
        <td className="px-5 py-3 border-b border-white/[0.03]">
          <StatusPill status={status} />
        </td>
        {!readOnly && (
          <td className="px-5 py-3 border-b border-white/[0.03]">
            <div className="flex gap-1.5">
              <button
                onClick={() => onEdit(cat)}
                className="bg-transparent border-none text-text3 cursor-pointer text-sm p-1.5 px-2 rounded transition-all hover:bg-accent/15 hover:text-accent leading-none"
                title="Edit"
              >
                ✎
              </button>
              <button
                onClick={() => {
                  if (confirm('Delete this category? Transactions in it will be removed too.')) {
                    dispatch({ type: 'DELETE_CATEGORY', monthKey: state.currentMonthKey, id: cat.id })
                  }
                }}
                className="bg-transparent border-none text-text3 cursor-pointer text-lg p-1 px-2 rounded transition-all hover:bg-danger/15 hover:text-danger leading-none"
                title="Delete"
              >
                ×
              </button>
            </div>
          </td>
        )}
      </tr>
      {(cat.budgetAmount > 0 || spent > 0) && (
        <tr>
          <td colSpan={7} className="px-5 pb-2.5 border-b border-white/[0.03]">
            <ProgressBar percentage={pct} color={barColor} />
          </td>
        </tr>
      )}
    </>
  )
}
