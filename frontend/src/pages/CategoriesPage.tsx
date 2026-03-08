import { useState } from 'react'
import { Panel } from '../components/ui/Panel'
import { Button } from '../components/ui/Button'
import { CategoryTable } from '../components/categories/CategoryTable'
import { CategoryModal } from '../components/categories/CategoryModal'
import { useAppContext } from '../context/AppContext'
import { useCurrentMonth } from '../hooks/useMonthBudget'
import { getCurrentMonthKey, formatCurrency } from '../utils/format'
import type { Category } from '../types'

export function CategoriesPage() {
  const { state } = useAppContext()
  const month = useCurrentMonth()
  const isPastMonth = state.currentMonthKey < getCurrentMonthKey()
  const [modalOpen, setModalOpen] = useState(false)
  const [editCat, setEditCat] = useState<Category | null>(null)

  const totalBudget = month?.categories.reduce((a, c) => a + c.budgetAmount, 0) ?? 0
  const unallocated = (month?.takeHomePay ?? 0) - totalBudget

  function handleEdit(cat: Category) {
    if (isPastMonth) return
    setEditCat(cat)
    setModalOpen(true)
  }

  function handleClose() {
    setModalOpen(false)
    setEditCat(null)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8 gap-4 flex-wrap">
        <h1 className="font-sans text-2xl font-bold tracking-tight text-text">Categories</h1>
        <div className="flex items-center gap-4">
          {Math.abs(unallocated) > 0.005 && (
            <span className={`text-sm ${unallocated < 0 ? 'text-danger' : 'text-warning'}`}>
              {unallocated > 0
                ? `⚠ ${formatCurrency(unallocated)} unallocated`
                : `⚠ Over-allocated by ${formatCurrency(Math.abs(unallocated))}`
              }
            </span>
          )}
          {isPastMonth ? (
            <span className="text-sm text-text3">Viewing past month (read-only)</span>
          ) : (
            <Button onClick={() => setModalOpen(true)}>+ Add Category</Button>
          )}
        </div>
      </div>

      <Panel title="Budget Allocations">
        <CategoryTable onEdit={handleEdit} readOnly={isPastMonth} />
      </Panel>

      {!isPastMonth && (
        <CategoryModal open={modalOpen} onClose={handleClose} editCategory={editCat} />
      )}
    </div>
  )
}
