import { useState } from 'react'
import { useTransactions } from '../hooks/useTransactions'
import { useRepositories } from '../repositories/RepositoryContext'
import { useToast } from '../components/ui/Toast'
import { Panel } from '../components/ui/Panel'
import { Button } from '../components/ui/Button'
import { TransactionFilters } from '../components/transactions/TransactionFilters'
import { TransactionList } from '../components/transactions/TransactionList'
import { TransactionModal } from '../components/transactions/TransactionModal'
import { PendingRecurring } from '../components/transactions/PendingRecurring'
import type { Transaction } from '../types'

export function TransactionsPage() {
  const { transactions: txRepo } = useRepositories()
  const { showToast } = useToast()

  const [modalOpen, setModalOpen] = useState(false)
  const [editTx, setEditTx] = useState<Transaction | null>(null)
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<number | undefined>()
  const [typeFilter, setTypeFilter] = useState<'expense' | 'income' | undefined>()
  const [selectMode, setSelectMode] = useState(false)
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set())
  const [confirming, setConfirming] = useState(false)

  const transactions = useTransactions({
    search,
    categoryId: categoryFilter,
    type: typeFilter,
    status: 'confirmed',
  })

  function handleEdit(tx: Transaction) {
    setEditTx(tx)
    setModalOpen(true)
  }

  function handleClose() {
    setModalOpen(false)
    setEditTx(null)
  }

  function toggleSelect(id: number) {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  function toggleAll() {
    const allIds = new Set(transactions.map((tx) => tx.id))
    const allSelected = transactions.every((tx) => selectedIds.has(tx.id))
    setSelectedIds(allSelected ? new Set() : allIds)
  }

  function exitSelectMode() {
    setSelectMode(false)
    setSelectedIds(new Set())
    setConfirming(false)
  }

  function deleteSelected() {
    const count = selectedIds.size
    selectedIds.forEach((id) => txRepo.delete(id))
    setSelectedIds(new Set())
    setConfirming(false)
    showToast(`Deleted ${count} transaction${count !== 1 ? 's' : ''}`)
  }

  const panelAction = !selectMode ? (
    <Button variant="secondary" onClick={() => setSelectMode(true)} className="text-xs py-1.5 px-3">
      Select
    </Button>
  ) : confirming ? (
    <div className="flex items-center gap-2">
      <span className="hidden sm:inline text-xs text-danger font-mono">
        Delete {selectedIds.size}?
      </span>
      <Button
        variant="secondary"
        onClick={() => setConfirming(false)}
        className="text-xs py-1.5 px-3"
      >
        Cancel
      </Button>
      <Button variant="danger" onClick={deleteSelected} className="text-xs py-1.5 px-3">
        Confirm
      </Button>
    </div>
  ) : (
    <div className="flex items-center gap-2">
      {selectedIds.size > 0 && (
        <span className="hidden sm:inline text-xs text-text3 font-mono">
          {selectedIds.size} selected
        </span>
      )}
      <Button variant="secondary" onClick={exitSelectMode} className="text-xs py-1.5 px-3">
        Done
      </Button>
      {selectedIds.size > 0 && (
        <Button
          variant="danger"
          onClick={() => setConfirming(true)}
          className="text-xs py-1.5 px-3"
        >
          Delete
        </Button>
      )}
    </div>
  )

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-sans text-2xl font-bold tracking-tight text-text">Transactions</h1>
        <Button onClick={() => setModalOpen(true)} className="hidden md:inline-flex">
          + Add Transaction
        </Button>
      </div>

      <PendingRecurring />

      <Panel title="All Transactions" action={panelAction}>
        <TransactionFilters
          search={search}
          onSearchChange={setSearch}
          categoryFilter={categoryFilter}
          onCategoryFilterChange={setCategoryFilter}
          typeFilter={typeFilter}
          onTypeFilterChange={setTypeFilter}
        />
        <TransactionList
          transactions={transactions}
          onEdit={handleEdit}
          selectedIds={selectedIds}
          onToggleSelect={toggleSelect}
          onToggleAll={toggleAll}
          selectMode={selectMode}
        />
      </Panel>

      <TransactionModal open={modalOpen} onClose={handleClose} editTransaction={editTx} />

      {/* Mobile FAB */}
      <button
        onClick={() => setModalOpen(true)}
        className="md:hidden fixed bottom-20 right-5 z-40 w-14 h-14 rounded-full bg-accent text-bg text-2xl font-bold shadow-lg flex items-center justify-center transition-transform active:scale-95"
        aria-label="Add transaction"
      >
        +
      </button>
    </div>
  )
}
