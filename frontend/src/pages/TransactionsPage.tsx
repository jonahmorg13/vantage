import { useState } from 'react'
import { useTransactions } from '../hooks/useTransactions'
import { Panel } from '../components/ui/Panel'
import { Button } from '../components/ui/Button'
import { TransactionFilters } from '../components/transactions/TransactionFilters'
import { TransactionList } from '../components/transactions/TransactionList'
import { TransactionModal } from '../components/transactions/TransactionModal'
import { PendingRecurring } from '../components/transactions/PendingRecurring'
import type { Transaction } from '../types'

export function TransactionsPage() {
  const [modalOpen, setModalOpen] = useState(false)
  const [editTx, setEditTx] = useState<Transaction | null>(null)
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<number | undefined>()
  const [typeFilter, setTypeFilter] = useState<'expense' | 'income' | undefined>()

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

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-sans text-2xl font-bold tracking-tight text-text">Transactions</h1>
        <Button onClick={() => setModalOpen(true)}>+ Add Transaction</Button>
      </div>

      <PendingRecurring />

      <Panel title="All Transactions">
        <TransactionFilters
          search={search}
          onSearchChange={setSearch}
          categoryFilter={categoryFilter}
          onCategoryFilterChange={setCategoryFilter}
          typeFilter={typeFilter}
          onTypeFilterChange={setTypeFilter}
        />
        <TransactionList transactions={transactions} onEdit={handleEdit} />
      </Panel>

      <TransactionModal open={modalOpen} onClose={handleClose} editTransaction={editTx} />
    </div>
  )
}
