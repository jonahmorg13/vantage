import { useCurrentMonth } from '../hooks/useMonthBudget'
import { useAppContext } from '../context/AppContext'
import { formatCurrency, formatMonthDisplay } from '../utils/format'
import { AlertsBanner } from '../components/dashboard/AlertsBanner'
import { SummaryCards } from '../components/dashboard/SummaryCards'
import { AllocationChart } from '../components/dashboard/AllocationChart'
import { RecentTransactions } from '../components/dashboard/RecentTransactions'

export function DashboardPage() {
  const { state, dispatch } = useAppContext()
  const month = useCurrentMonth()

  if (!month) return null

  const net = month.grossIncome * (1 - month.taxRate)

  return (
    <div>
      {/* Header */}
      <div className="flex items-start justify-between mb-10 gap-6 flex-wrap">
        <div>
          <h1 className="font-sans text-4xl font-extrabold tracking-tight gradient-text">
            Budget Tracker
          </h1>
          <div className="text-text3 text-sm tracking-[0.15em] uppercase mt-2">
            {formatMonthDisplay(state.currentMonthKey)} · Personal Finance
          </div>
        </div>
        <div className="flex flex-col items-end gap-2">
          <div className="text-xs text-text3 tracking-[0.12em] uppercase">
            Monthly Gross Income
          </div>
          <input
            type="number"
            className="bg-surface2 border border-border text-text font-mono text-2xl font-medium px-4 py-2.5 rounded-lg w-48 text-right transition-colors focus:outline-none focus:border-accent"
            value={month.grossIncome}
            step="0.01"
            onChange={e => dispatch({
              type: 'UPDATE_MONTH_INCOME',
              monthKey: state.currentMonthKey,
              grossIncome: parseFloat(e.target.value) || 0,
            })}
          />
          <div className="text-sm text-text2">
            Net (after tax): <span className="text-accent3 font-medium">{formatCurrency(net)}</span>
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
