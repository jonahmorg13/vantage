import { useState, useEffect } from 'react'
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
import { useToast } from '../components/ui/Toast'
import type { Category } from '../types'

export function CategoriesPage() {
  const format = useCurrency()
  const { state } = useAppContext()
  const { settings: settingsRepo, months: monthRepo } = useRepositories()
  const month = useCurrentMonth()
  const { showToast } = useToast()
  const isPastMonth = state.currentMonthKey < getCurrentMonthKey()
  const [modalOpen, setModalOpen] = useState(false)
  const [editCat, setEditCat] = useState<Category | null>(null)
  const [pctModalOpen, setPctModalOpen] = useState(false)
  const [saveTemplateOpen, setSaveTemplateOpen] = useState(false)
  const [takeHomePay, setTakeHomePay] = useState('')

  useEffect(() => {
    if (month) setTakeHomePay(month.takeHomePay.toFixed(2))
  }, [state.currentMonthKey, month?.takeHomePay])

  const totalBudget = month?.categories.reduce((a, c) => a + c.budgetAmount, 0) ?? 0
  const unallocated = (month?.takeHomePay ?? 0) - totalBudget
  const budgetHasChanged = parseFloat(takeHomePay) !== month?.takeHomePay

  function handleBudgetChange(e: React.ChangeEvent<HTMLInputElement>) {
    const filtered = e.target.value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1')
    setTakeHomePay(filtered)
  }

  function handleBudgetBlur() {
    const num = parseFloat(takeHomePay)
    if (!isNaN(num)) setTakeHomePay(num.toFixed(2))
  }

  function saveBudget() {
    monthRepo.updateIncome(state.currentMonthKey, parseFloat(takeHomePay) || 0)
    showToast('Monthly budget updated')
  }

  function handleEdit(cat: Category) {
    if (isPastMonth) return
    setEditCat(cat)
    setModalOpen(true)
  }

  function handleClose() {
    setModalOpen(false)
    setEditCat(null)
  }

  async function handleSaveTemplate() {
    if (!month) return
    await settingsRepo.replaceTemplates(
      month.categories.map((c, i) => ({
        name: c.name,
        color: c.color,
        defaultBudgetAmount: c.budgetAmount,
        sortOrder: i,
      }))
    )
    showToast('Template saved')
    setSaveTemplateOpen(false)
  }

  return (
    <div>
      <div className="mb-4">
        <div className="flex items-center justify-between gap-3 flex-wrap">
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
        {month && (
          <div className="flex items-center gap-3 mt-3">
            <span className="text-xs text-text3 tracking-[0.12em] uppercase">Monthly Budget</span>
            {isPastMonth ? (
              <span className="font-mono text-lg font-medium text-text3">
                {format(month.takeHomePay)}
              </span>
            ) : (
              <>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text3 font-mono text-sm pointer-events-none">
                    {state.settings.currencySymbol ?? '$'}
                  </span>
                  <input
                    type="text"
                    inputMode="decimal"
                    className="bg-surface2 border border-border text-text font-mono text-sm pl-7 pr-3 py-1.5 rounded-lg w-36 text-right transition-colors focus:outline-none focus:border-accent"
                    value={takeHomePay}
                    onChange={handleBudgetChange}
                    onBlur={handleBudgetBlur}
                    onFocus={(e) => e.target.select()}
                  />
                </div>
                {budgetHasChanged && (
                  <Button onClick={saveBudget} className="!py-1.5 text-sm">
                    Save
                  </Button>
                )}
              </>
            )}
          </div>
        )}
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
