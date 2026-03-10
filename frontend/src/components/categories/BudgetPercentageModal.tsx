import { useState } from 'react'
import { useAppContext } from '../../context/AppContext'
import { useCurrentMonth } from '../../hooks/useMonthBudget'
import { useRepositories } from '../../repositories/RepositoryContext'
import { useCurrency } from '../../hooks/useCurrency'
import { Button } from '../ui/Button'

interface Props {
  open: boolean
  onClose: () => void
}

export function BudgetPercentageModal({ open, onClose }: Props) {
  const { state } = useAppContext()
  const month = useCurrentMonth()
  const { categories: categoriesRepo } = useRepositories()
  const format = useCurrency()
  const [percentages, setPercentages] = useState<Record<number, string>>({})

  if (!open || !month) return null

  const takeHomePay = month.takeHomePay
  const categories = month.categories

  function handlePctChange(id: number, val: string) {
    const filtered = val.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1')
    setPercentages((prev) => ({ ...prev, [id]: filtered }))
  }

  function calcAmount(pctStr: string): number {
    const pct = parseFloat(pctStr)
    if (isNaN(pct)) return 0
    return takeHomePay * (pct / 100)
  }

  const totalPct = Object.values(percentages).reduce((sum, v) => {
    const n = parseFloat(v)
    return sum + (isNaN(n) ? 0 : n)
  }, 0)

  async function handleApply() {
    const updates = Object.entries(percentages).filter(([, v]) => v !== '' && !isNaN(parseFloat(v)))
    await Promise.all(
      updates.map(([idStr, pctStr]) => {
        const id = parseInt(idStr)
        const amount = Math.round(calcAmount(pctStr) * 100) / 100
        return categoriesRepo.update(state.currentMonthKey, id, {
          budgetAmount: amount,
          spendLimit: amount,
        })
      })
    )
    onClose()
  }

  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div className="bg-surface border border-border rounded-2xl p-8 w-[560px] max-w-[95vw] animate-slide-up">
        <h2 className="font-sans text-xl font-bold mb-6 text-text">Allocate by Percentage</h2>

        <div className="mb-2 grid grid-cols-[1fr_80px_120px] gap-3 text-xs text-text3 tracking-[0.1em] uppercase">
          <span>Item</span>
          <span className="text-right">%</span>
          <span className="text-right">Amount</span>
        </div>

        <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
          {categories.map((cat) => {
            const pctStr = percentages[cat.id] ?? ''
            const amount = pctStr !== '' ? calcAmount(pctStr) : null
            return (
              <div key={cat.id} className="grid grid-cols-[1fr_80px_120px] gap-3 items-center">
                <div className="flex items-center gap-2 min-w-0">
                  <span
                    className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                    style={{ backgroundColor: cat.color }}
                  />
                  <span className="text-sm text-text truncate">{cat.name}</span>
                </div>
                <input
                  type="text"
                  inputMode="decimal"
                  value={pctStr}
                  onChange={(e) => handlePctChange(cat.id, e.target.value)}
                  placeholder="—"
                  className="w-full bg-surface2 border border-border text-text font-mono text-sm px-2 py-1.5 rounded-lg text-right focus:outline-none focus:border-accent"
                />
                <span className="text-sm font-mono text-text2 text-right">
                  {amount !== null ? format(amount) : '—'}
                </span>
              </div>
            )
          })}
        </div>

        <div className="mt-6 pt-4 border-t border-border flex items-center justify-between">
          <span className={`text-sm font-mono ${totalPct > 100 ? 'text-danger' : 'text-text2'}`}>
            Total: {totalPct.toFixed(1)}%
          </span>
          <div className="flex gap-3">
            <Button variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleApply} disabled={totalPct === 0}>
              Apply to Current Month
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
