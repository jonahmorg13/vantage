import { useState, useEffect } from 'react'
import { useCurrentMonth } from '../hooks/useMonthBudget'
import { useAppContext } from '../context/AppContext'
import { useRepositories } from '../repositories/RepositoryContext'
import { useToast } from '../components/ui/Toast'
import { formatMonthDisplay, getCurrentMonthKey } from '../utils/format'
import { useCurrency } from '../hooks/useCurrency'
import { AlertsBanner } from '../components/dashboard/AlertsBanner'
import { SummaryCards } from '../components/dashboard/SummaryCards'
import { AllocationChart } from '../components/dashboard/AllocationChart'
import { RecentTransactions } from '../components/dashboard/RecentTransactions'
import { Button } from '../components/ui/Button'

export function DashboardPage() {
  const format = useCurrency()
  const { state } = useAppContext()
  const { months: monthRepo } = useRepositories()
  const { showToast } = useToast()
  const month = useCurrentMonth()
  const [takeHomePay, setTakeHomePay] = useState('')

  useEffect(() => {
    if (month) setTakeHomePay(month.takeHomePay.toFixed(2))
  }, [state.currentMonthKey, month?.takeHomePay])

  if (!month) return null

  const isPastMonth = state.currentMonthKey < getCurrentMonthKey()
  const hasChanged = parseFloat(takeHomePay) !== month.takeHomePay

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const filtered = e.target.value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1')
    setTakeHomePay(filtered)
  }

  function handleBlur() {
    const num = parseFloat(takeHomePay)
    if (!isNaN(num)) setTakeHomePay(num.toFixed(2))
  }

  function save() {
    monthRepo.updateIncome(state.currentMonthKey, parseFloat(takeHomePay) || 0)
    showToast('Take-home pay updated')
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-start justify-between mb-10 gap-6 flex-wrap">
        <div>
          <h1 className="font-sans text-2xl md:text-4xl font-extrabold tracking-tight gradient-text">
            Dashboard
          </h1>
          <div className="text-text3 text-sm tracking-[0.15em] uppercase mt-2">
            {formatMonthDisplay(state.currentMonthKey)} · Budget Tracking
          </div>
        </div>
        <div className="flex flex-col items-start md:items-end gap-2 w-full md:w-auto">
          <div className="text-xs text-text3 tracking-[0.12em] uppercase">Take-Home Pay</div>
          {isPastMonth ? (
            <div className="font-mono text-2xl font-medium text-text3">
              {format(month.takeHomePay)}
            </div>
          ) : (
            <div className="flex items-center gap-2 w-full md:w-auto">
              <div className="relative flex-1 md:flex-none">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text3 font-mono text-2xl font-medium pointer-events-none">
                  {state.settings.currencySymbol ?? '$'}
                </span>
                <input
                  type="text"
                  inputMode="decimal"
                  className="bg-surface2 border border-border text-text font-mono text-2xl font-medium pl-9 pr-4 py-2.5 rounded-lg w-full md:w-52 text-right transition-colors focus:outline-none focus:border-accent"
                  value={takeHomePay}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  onFocus={(e) => e.target.select()}
                />
              </div>
              {hasChanged && (
                <Button onClick={save} className="whitespace-nowrap !py-2.5">
                  Save
                </Button>
              )}
            </div>
          )}
        </div>
      </div>

      <AlertsBanner />
      <SummaryCards />

      <div className="grid grid-cols-1 gap-6">
        <AllocationChart />
        <RecentTransactions />
      </div>
    </div>
  )
}
