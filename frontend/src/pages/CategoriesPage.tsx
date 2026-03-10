import { useState } from 'react'
import { Panel } from '../components/ui/Panel'
import { Button } from '../components/ui/Button'
import { CategoryTable } from '../components/categories/CategoryTable'
import { CategoryModal } from '../components/categories/CategoryModal'
import { BudgetPercentageModal } from '../components/categories/BudgetPercentageModal'
import { useAppContext } from '../context/AppContext'
import { useRepositories } from '../repositories/RepositoryContext'
import { useCurrentMonth } from '../hooks/useMonthBudget'
import { getCurrentMonthKey } from '../utils/format'
import { useCurrency } from '../hooks/useCurrency'
import type { Category } from '../types'

export function CategoriesPage() {
  const format = useCurrency()
  const { state } = useAppContext()
  const { settings: settingsRepo } = useRepositories()
  const month = useCurrentMonth()
  const isPastMonth = state.currentMonthKey < getCurrentMonthKey()
  const [modalOpen, setModalOpen] = useState(false)
  const [editCat, setEditCat] = useState<Category | null>(null)
  const [pctModalOpen, setPctModalOpen] = useState(false)
  const [saveTemplateOpen, setSaveTemplateOpen] = useState(false)

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

  function handleSaveTemplate() {
    if (!month) return
    settingsRepo.replaceTemplates(
      month.categories.map((c, i) => ({
        name: c.name,
        color: c.color,
        defaultBudgetAmount: c.budgetAmount,
        defaultSpendLimit: c.spendLimit,
        sortOrder: i,
      }))
    )
    setSaveTemplateOpen(false)
  }

  return (
    <div>
      <div className="mb-4">
        <div className="flex items-center justify-between gap-3">
          <h1 className="font-sans text-2xl font-bold tracking-tight text-text">Budget</h1>
          <div className="flex items-center gap-2">
            {isPastMonth ? (
              <span className="text-sm text-text3">Read-only</span>
            ) : (
              <>
                <Button
                  variant="secondary"
                  className="hidden sm:inline-flex"
                  onClick={() => setSaveTemplateOpen(true)}
                >
                  Save as Template
                </Button>
                <Button variant="secondary" onClick={() => setPctModalOpen(true)}>
                  % Allocate
                </Button>
                <Button onClick={() => setModalOpen(true)}>+ Add Item</Button>
              </>
            )}
          </div>
        </div>
      </div>

      <Panel
        title="Budget"
        action={
          Math.abs(unallocated) > 0.005 ? (
            <span className={`text-xs font-medium ${unallocated < 0 ? 'text-danger' : 'text-warning'}`}>
              {unallocated > 0
                ? `⚠ ${format(unallocated)} unallocated`
                : `⚠ Over by ${format(Math.abs(unallocated))}`}
            </span>
          ) : undefined
        }
      >
        <CategoryTable onEdit={handleEdit} readOnly={isPastMonth} />
      </Panel>

      {!isPastMonth && (
        <CategoryModal open={modalOpen} onClose={handleClose} editCategory={editCat} />
      )}
      {!isPastMonth && (
        <BudgetPercentageModal open={pctModalOpen} onClose={() => setPctModalOpen(false)} />
      )}

      {/* Save as Template confirmation */}
      {saveTemplateOpen && month && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center animate-fade-in"
          onClick={(e) => {
            if (e.target === e.currentTarget) setSaveTemplateOpen(false)
          }}
        >
          <div className="bg-surface border border-border rounded-2xl p-8 w-[480px] max-w-[95vw] animate-slide-up">
            <h2 className="font-sans text-xl font-bold mb-2 text-text">
              Save as Default Template?
            </h2>
            <p className="text-sm text-text3 mb-5">
              This will replace all existing budget templates with the {month.categories.length}{' '}
              items from this month. Future months will start with these items and amounts.
            </p>

            <div className="flex flex-col gap-1.5 max-h-52 overflow-y-auto mb-6">
              {month.categories.map((c) => (
                <div
                  key={c.id}
                  className="flex items-center gap-3 bg-surface2 rounded-lg px-3 py-2 text-sm"
                >
                  <div className="w-2 h-2 rounded-full shrink-0" style={{ background: c.color }} />
                  <span className="text-text2 flex-1">{c.name}</span>
                  <span className="text-text3 font-mono text-xs">{format(c.budgetAmount)}</span>
                </div>
              ))}
            </div>

            <div className="flex gap-3">
              <Button
                variant="secondary"
                onClick={() => setSaveTemplateOpen(false)}
                className="flex-1 !py-3"
              >
                Cancel
              </Button>
              <Button onClick={handleSaveTemplate} className="flex-1 !py-3">
                Save as Template
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
