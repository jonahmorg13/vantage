import type { Transaction } from '../../types'
import { TransactionRow } from './TransactionRow'

interface TransactionListProps {
  transactions: Transaction[]
  onEdit: (tx: Transaction) => void
}

export function TransactionList({ transactions, onEdit }: TransactionListProps) {
  if (transactions.length === 0) {
    return (
      <div className="py-20 text-center">
        <div className="inline-block border-2 border-dashed border-border rounded-xl px-10 py-10">
          <div className="text-3xl mb-3 opacity-40">⇄</div>
          <div className="text-text3 text-base font-sans font-semibold mb-1">No transactions found</div>
          <div className="text-text3/60 text-sm">Try adjusting your filters or add a new transaction.</div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-h-[500px] overflow-y-auto custom-scrollbar">
      {transactions.map(tx => (
        <TransactionRow key={tx.id} transaction={tx} onEdit={onEdit} />
      ))}
    </div>
  )
}
