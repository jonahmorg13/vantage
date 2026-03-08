import { useAppContext } from '../../context/AppContext'
import { useCurrentMonth } from '../../hooks/useMonthBudget'
import { formatCurrency, formatDate } from '../../utils/format'
import type { Transaction } from '../../types'

interface TransactionRowProps {
  transaction: Transaction
  onEdit: (tx: Transaction) => void
}

export function TransactionRow({ transaction: tx, onEdit }: TransactionRowProps) {
  const { dispatch } = useAppContext()
  const month = useCurrentMonth()
  const cat = month?.categories.find(c => c.id === tx.categoryId)

  return (
    <div className="grid grid-cols-[160px_1fr_120px_120px_auto] items-center gap-4 px-6 py-3.5 border-b border-white/[0.03] hover:bg-accent/[0.04] transition-colors animate-fade-in max-[900px]:grid-cols-[130px_1fr_100px_auto]">
      <div className="overflow-hidden">
        <span className="inline-flex items-center gap-2 text-xs text-text2 bg-surface2 px-2.5 py-1 rounded border border-border max-w-full overflow-hidden">
          <span
            className="inline-block w-2 h-2 rounded-full shrink-0"
            style={{ background: cat?.color ?? '#555' }}
          />
          <span className="truncate">{cat?.name ?? 'Unknown'}</span>
        </span>
      </div>
      <div className="text-sm text-text min-w-0 truncate">{tx.name}</div>
      <div className={`text-sm text-right font-medium ${tx.type === 'income' ? 'text-accent3' : 'text-accent2'}`}>
        {tx.type === 'income' ? '+' : ''}{formatCurrency(tx.amount)}
      </div>
      <div className="text-xs text-text3 text-right max-[900px]:hidden">
        {formatDate(tx.date)}
      </div>
      <div className="flex gap-1.5">
        <button
          onClick={() => onEdit(tx)}
          className="bg-transparent border-none text-text3 cursor-pointer text-lg p-2 px-2.5 rounded transition-all hover:bg-accent/15 hover:text-accent leading-none"
          title="Edit"
        >
          ✎
        </button>
        <button
          onClick={() => dispatch({ type: 'DELETE_TRANSACTION', id: tx.id })}
          className="bg-transparent border-none text-text3 cursor-pointer text-xl p-1.5 px-2.5 rounded transition-all hover:bg-danger/15 hover:text-danger leading-none"
          title="Delete"
        >
          ×
        </button>
      </div>
    </div>
  )
}
