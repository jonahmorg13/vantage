import { useState } from 'react'
import { useAppContext } from '../../context/AppContext'
import { useRepositories } from '../../repositories/RepositoryContext'
import { useCurrentMonth } from '../../hooks/useMonthBudget'
import { formatDate } from '../../utils/format'
import { useCurrency } from '../../hooks/useCurrency'
import { useToast } from '../ui/Toast'
import { Checkbox } from '../ui/Checkbox'
import type { Transaction } from '../../types'

interface TransactionRowProps {
  transaction: Transaction
  onEdit: (tx: Transaction) => void
  isSelected: boolean
  onToggle: () => void
  showCheckbox: boolean
}

export function TransactionRow({
  transaction: tx,
  onEdit,
  isSelected,
  onToggle,
  showCheckbox,
}: TransactionRowProps) {
  const format = useCurrency()
  const { state } = useAppContext()
  const { transactions: txRepo } = useRepositories()
  const { showToast } = useToast()
  const month = useCurrentMonth()
  const [confirmingDelete, setConfirmingDelete] = useState(false)

  const cat = tx.categoryId != null ? month?.categories.find((c) => c.id === tx.categoryId) : null
  const account = tx.accountId != null ? state.accounts.find((a) => a.id === tx.accountId) : null
  const toAccount =
    tx.toAccountId != null ? state.accounts.find((a) => a.id === tx.toAccountId) : null

  let labelColor: string
  let labelText: string

  if (tx.type === 'transfer') {
    labelColor = account?.color ?? toAccount?.color ?? '#555'
    labelText = account && toAccount ? `${account.name} → ${toAccount.name}` : 'Transfer'
  } else {
    labelColor = account?.color ?? cat?.color ?? '#555'
    labelText = account ? account.name : (cat?.name ?? 'Uncategorized')
  }

  const amountColor =
    tx.type === 'income' ? 'text-accent3' : tx.type === 'transfer' ? 'text-text2' : 'text-accent2'

  const amountPrefix = tx.type === 'income' ? '+' : tx.type === 'transfer' ? '⇄ ' : ''

  function confirmDelete() {
    txRepo.delete(tx.id)
    showToast('Transaction deleted')
  }

  return (
    <div
      className={`group grid items-center gap-3 px-4 py-3.5 border-b border-white/[0.03] transition-colors animate-fade-in ${
        showCheckbox
          ? 'grid-cols-[28px_160px_1fr_110px_110px_auto] max-[900px]:grid-cols-[28px_20px_1fr_88px_auto]'
          : 'grid-cols-[160px_1fr_110px_110px_auto] max-[900px]:grid-cols-[20px_1fr_88px_auto]'
      } ${isSelected ? 'bg-accent/[0.07]' : confirmingDelete ? 'bg-danger/[0.05]' : 'hover:bg-accent/[0.04]'}`}
    >
      {showCheckbox && (
        <div className="flex items-center justify-center">
          <Checkbox checked={isSelected} onChange={onToggle} />
        </div>
      )}

      {/* Label: full badge on desktop, color dot only on mobile */}
      <div className="overflow-hidden">
        <span className="hidden min-[900px]:inline-flex items-center gap-2 text-xs text-text2 bg-surface2 px-2.5 py-1 rounded border border-border max-w-full overflow-hidden">
          <span
            className="inline-block w-2 h-2 rounded-full shrink-0"
            style={{ background: labelColor }}
          />
          <span className="truncate">{labelText}</span>
        </span>
        <span
          className="min-[900px]:hidden inline-block w-3 h-3 rounded-full"
          style={{ background: labelColor }}
        />
      </div>

      <div className="text-sm text-text min-w-0 truncate">{tx.name}</div>
      <div className={`text-sm text-right font-medium tabular-nums ${amountColor}`}>
        {amountPrefix}
        {format(tx.amount)}
      </div>
      <div className="text-xs text-text3 text-right max-[900px]:hidden">{formatDate(tx.date)}</div>

      {/* Actions / confirm state */}
      <div className="flex gap-1 justify-end items-center">
        {confirmingDelete ? (
          <>
            <button
              onClick={() => setConfirmingDelete(false)}
              className="text-xs text-text3 px-2 py-1 rounded hover:bg-surface2 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={confirmDelete}
              className="text-xs text-danger px-2 py-1 rounded hover:bg-danger/15 transition-colors cursor-pointer font-medium"
            >
              Delete
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => onEdit(tx)}
              className="bg-transparent border-none text-text3 cursor-pointer text-lg p-2 px-2 rounded transition-all hover:bg-accent/15 hover:text-accent leading-none"
              title="Edit"
            >
              ✎
            </button>
            <button
              onClick={() => setConfirmingDelete(true)}
              className="bg-transparent border-none text-text3 cursor-pointer text-xl p-1.5 px-2 rounded transition-all hover:bg-danger/15 hover:text-danger leading-none"
              title="Delete"
            >
              ×
            </button>
          </>
        )}
      </div>
    </div>
  )
}
