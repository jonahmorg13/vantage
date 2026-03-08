import { useState } from 'react'
import { Panel } from '../components/ui/Panel'
import { Button } from '../components/ui/Button'
import { CategoryTable } from '../components/categories/CategoryTable'
import { CategoryModal } from '../components/categories/CategoryModal'
import { useAppContext } from '../context/AppContext'
import { getCurrentMonthKey } from '../utils/format'
import type { Category } from '../types'

export function CategoriesPage() {
  const { state } = useAppContext()
  const isPastMonth = state.currentMonthKey < getCurrentMonthKey()
  const [modalOpen, setModalOpen] = useState(false)
  const [editCat, setEditCat] = useState<Category | null>(null)

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
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-sans text-2xl font-bold tracking-tight text-text">Categories</h1>
        {isPastMonth ? (
          <span className="text-sm text-text3">Viewing past month (read-only)</span>
        ) : (
          <Button onClick={() => setModalOpen(true)}>+ Add Category</Button>
        )}
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
