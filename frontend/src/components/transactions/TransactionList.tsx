import type { Transaction } from '../../types'
import { TransactionRow } from './TransactionRow'
import { Checkbox } from '../ui/Checkbox'

interface TransactionListProps {
  transactions: Transaction[]
  onEdit: (tx: Transaction) => void
  selectedIds: Set<number>
  onToggleSelect: (id: number) => void
  onToggleAll: () => void
  selectMode: boolean
}

export function TransactionList({
  transactions,
  onEdit,
  selectedIds,
  onToggleSelect,
  onToggleAll,
  selectMode,
}: TransactionListProps) {
  if (transactions.length === 0) {
    return (
      <div className="py-20 text-center">
        <div className="inline-block border-2 border-dashed border-border rounded-xl px-10 py-10">
          <div className="text-3xl mb-3 opacity-40">⇄</div>
          <div className="text-text3 text-base font-sans font-semibold mb-1">
            No transactions found
          </div>
          <div className="text-text3/60 text-sm">
            Try adjusting your filters or add a new transaction.
          </div>
        </div>
      </div>
    )
  }

  const allSelected = transactions.length > 0 && transactions.every((tx) => selectedIds.has(tx.id))

  return (
    <div>
      {/* Select-all header — only visible in select mode */}
      {selectMode && (
        <div className="flex items-center gap-3 px-4 py-2 border-b border-border bg-surface2/50">
          <Checkbox checked={allSelected} onChange={onToggleAll} />
          <span className="text-xs text-text3">
            {selectedIds.size} of {transactions.length} selected
          </span>
        </div>
      )}
      <div className="max-h-[500px] overflow-y-auto custom-scrollbar">
        {transactions.map((tx) => (
          <TransactionRow
            key={tx.id}
            transaction={tx}
            onEdit={onEdit}
            isSelected={selectedIds.has(tx.id)}
            onToggle={() => onToggleSelect(tx.id)}
            showCheckbox={selectMode}
          />
        ))}
      </div>
    </div>
  )
}
