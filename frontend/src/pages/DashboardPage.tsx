import { useCurrentMonth } from '../hooks/useMonthBudget'
import { useAppContext } from '../context/AppContext'
import { formatMonthDisplay } from '../utils/format'
import { AlertsBanner } from '../components/dashboard/AlertsBanner'
import { SummaryCards } from '../components/dashboard/SummaryCards'
import { AllocationChart } from '../components/dashboard/AllocationChart'
import { RecentTransactions } from '../components/dashboard/RecentTransactions'

export function DashboardPage() {
  const { state, dispatch } = useAppContext()
  const month = useCurrentMonth()

  if (!month) return null

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
          <div className="text-xs text-text3 tracking-[0.12em] uppercase">
            Monthly Take-Home Pay
          </div>
          <div className="relative w-full md:w-auto">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text3 font-mono text-2xl font-medium pointer-events-none">$</span>
            <input
              type="number"
              className="bg-surface2 border border-border text-text font-mono text-2xl font-medium pl-9 pr-4 py-2.5 rounded-lg w-full md:w-52 text-right transition-colors focus:outline-none focus:border-accent"
              value={month.takeHomePay.toFixed(2)}
              step="0.01"
              onChange={e => dispatch({
                type: 'UPDATE_MONTH_INCOME',
                monthKey: state.currentMonthKey,
                takeHomePay: parseFloat(e.target.value) || 0,
              })}
            />
          </div>
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
