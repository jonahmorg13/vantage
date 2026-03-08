import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts'
import { useCurrentMonth } from '../../hooks/useMonthBudget'
import { Panel } from '../ui/Panel'

export function AllocationChart() {
  const month = useCurrentMonth()

  if (!month) return null

  const totalBudget = month.categories.reduce((a, c) => a + c.budgetAmount, 0)
  const data = month.categories
    .filter(c => c.budgetAmount > 0)
    .sort((a, b) => b.budgetAmount - a.budgetAmount)

  const displayTotal = totalBudget > 0
    ? `$${(Math.round(totalBudget / 100) / 10).toFixed(1)}k`
    : '$0'

  return (
    <Panel title="Allocation Breakdown">
      <div className="grid grid-cols-[240px_1fr] gap-8 items-center p-8 max-[900px]:grid-cols-1 max-[900px]:justify-items-center">
        {/* Donut */}
        <div className="relative w-[200px] h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data.length > 0 ? data : [{ name: 'Empty', budgetAmount: 1, color: 'var(--color-surface3)' }]}
                dataKey="budgetAmount"
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={90}
                paddingAngle={1}
                strokeWidth={0}
              >
                {(data.length > 0 ? data : [{ color: 'var(--color-surface3)' }]).map((entry, i) => (
                  <Cell key={i} fill={entry.color} opacity={0.85} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <div className="font-sans text-xl font-bold">{displayTotal}</div>
            <div className="text-xs text-text3 uppercase tracking-[0.1em] mt-1">
              Budgeted
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-col gap-3">
          {data.slice(0, 8).map(cat => (
            <div key={cat.id} className="flex items-center gap-3 text-sm">
              <div
                className="w-2.5 h-2.5 rounded-sm shrink-0"
                style={{ background: cat.color }}
              />
              <span className="text-text2 flex-1">{cat.name}</span>
              <span className="text-text3 text-xs">
                {(cat.budgetAmount / totalBudget * 100).toFixed(0)}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </Panel>
  )
}
