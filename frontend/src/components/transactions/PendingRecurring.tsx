import { useTransactions } from '../../hooks/useTransactions'
import { useAppContext } from '../../context/AppContext'
import { useCurrentMonth } from '../../hooks/useMonthBudget'
import { formatCurrency } from '../../utils/format'

export function PendingRecurring() {
  const { dispatch } = useAppContext()
  const month = useCurrentMonth()
  const pending = useTransactions({ status: 'pending' })

  if (pending.length === 0) return null

  return (
    <div className="mb-6 bg-surface border border-accent4/30 rounded-xl overflow-hidden">
      <div className="px-6 py-4 bg-accent4/10 border-b border-accent4/20 flex items-center justify-between">
        <span className="text-sm text-accent4 font-medium">
          Pending Recurring ({pending.length})
        </span>
        <div className="flex gap-3">
          <button
            onClick={() => pending.forEach(tx => dispatch({ type: 'CONFIRM_TRANSACTION', id: tx.id }))}
            className="text-xs text-accent3 bg-accent3/10 px-3 py-1.5 rounded border border-accent3/30 hover:bg-accent3/20 transition-colors cursor-pointer"
          >
            Confirm All
          </button>
          <button
            onClick={() => pending.forEach(tx => dispatch({ type: 'DISMISS_TRANSACTION', id: tx.id }))}
            className="text-xs text-danger bg-danger/10 px-3 py-1.5 rounded border border-danger/30 hover:bg-danger/20 transition-colors cursor-pointer"
          >
            Dismiss All
          </button>
        </div>
      </div>
      <div>
        {pending.map(tx => {
          const cat = month?.categories.find(c => c.id === tx.categoryId)
          return (
            <div
              key={tx.id}
              className="flex items-center gap-4 px-6 py-3.5 border-b border-white/[0.03] last:border-b-0"
            >
              <span
                className="inline-block w-2 h-2 rounded-full shrink-0"
                style={{ background: cat?.color ?? '#555' }}
              />
              <span className="text-sm text-text flex-1">{tx.name}</span>
              <span className="text-sm text-accent2 font-medium">
                {formatCurrency(tx.amount)}
              </span>
              <button
                onClick={() => dispatch({ type: 'CONFIRM_TRANSACTION', id: tx.id })}
                className="text-xs text-accent3 bg-accent3/10 px-2.5 py-1 rounded border border-accent3/30 hover:bg-accent3/20 transition-colors cursor-pointer"
              >
                ✓
              </button>
              <button
                onClick={() => dispatch({ type: 'DISMISS_TRANSACTION', id: tx.id })}
                className="text-xs text-danger bg-danger/10 px-2.5 py-1 rounded border border-danger/30 hover:bg-danger/20 transition-colors cursor-pointer"
              >
                ×
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}
