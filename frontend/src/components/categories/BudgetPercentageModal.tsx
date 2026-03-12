import { useState, useEffect } from 'react'
import { useAppContext } from '../../context/AppContext'
import { useCurrentMonth } from '../../hooks/useMonthBudget'
import { useRepositories } from '../../repositories/RepositoryContext'
import { useCurrency } from '../../hooks/useCurrency'
import { useToast } from '../ui/Toast'
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
  const { showToast } = useToast()
  const [percentages, setPercentages] = useState<Record<number, string>>({})
  const [confirming, setConfirming] = useState(false)

  // Pre-populate percentages from current budget amounts when opened
  useEffect(() => {
    if (open && month && month.takeHomePay > 0) {
      const initial: Record<number, string> = {}
      for (const cat of month.categories) {
        if (cat.budgetAmount > 0) {
          const pct = (cat.budgetAmount / month.takeHomePay) * 100
          initial[cat.id] = pct % 1 === 0 ? pct.toFixed(0) : pct.toFixed(1)
        }
      }
      setPercentages(initial)
    }
    if (open) setConfirming(false)
  }, [open, month])

  if (!open || !month) return null

  const takeHomePay = month.takeHomePay
  const categories = month.categories

  function handlePctChange(id: number, val: string) {
    const filtered = val.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1')
    setPercentages((prev) => ({ ...prev, [id]: filtered }))
    setConfirming(false)
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

  // Compute which categories actually changed
  const changes = Object.entries(percentages)
    .filter(([, v]) => v !== '' && !isNaN(parseFloat(v)))
    .map(([idStr, pctStr]) => {
      const id = parseInt(idStr)
      const newAmount = Math.round(calcAmount(pctStr) * 100) / 100
      const cat = categories.find((c) => c.id === id)
      const oldAmount = cat?.budgetAmount ?? 0
      return { id, name: cat?.name ?? '', color: cat?.color ?? '#555', oldAmount, newAmount }
    })
    .filter((c) => Math.abs(c.newAmount - c.oldAmount) >= 0.01)

  async function handleApply() {
    if (!confirming) {
      setConfirming(true)
      return
    }
    await Promise.all(
      changes.map((c) =>
        categoriesRepo.update(state.currentMonthKey, c.id, { budgetAmount: c.newAmount })
      )
    )
    showToast(`Updated ${changes.length} ${changes.length === 1 ? 'category' : 'categories'}`)
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

        {confirming && changes.length > 0 && (
          <div className="mt-4 p-3 bg-accent4/10 border border-accent4/20 rounded-lg">
            <p className="text-xs text-accent4 font-medium mb-2">
              {changes.length} {changes.length === 1 ? 'category' : 'categories'} will change:
            </p>
            <div className="space-y-1">
              {changes.map((c) => (
                <div key={c.id} className="flex items-center gap-2 text-xs">
                  <span className="w-2 h-2 rounded-full shrink-0" style={{ background: c.color }} />
                  <span className="text-text2 flex-1 truncate">{c.name}</span>
                  <span className="text-text3 font-mono">{format(c.oldAmount)}</span>
                  <span className="text-text3">&rarr;</span>
                  <span className="text-text font-mono">{format(c.newAmount)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-6 pt-4 border-t border-border flex items-center justify-between">
          <span className={`text-sm font-mono ${totalPct > 100 ? 'text-danger' : 'text-text2'}`}>
            Total: {totalPct.toFixed(1)}%
          </span>
          <div className="flex gap-3">
            <Button variant="secondary" onClick={confirming ? () => setConfirming(false) : onClose}>
              {confirming ? 'Back' : 'Cancel'}
            </Button>
            <Button onClick={handleApply} disabled={changes.length === 0}>
              {confirming ? `Confirm (${changes.length})` : 'Apply to Current Month'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
