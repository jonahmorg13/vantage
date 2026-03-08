import { useState, useMemo } from 'react'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { Panel } from '../components/ui/Panel'
import { useAppContext } from '../context/AppContext'
import { formatCurrency } from '../utils/format'

const INVESTMENT_TYPES: string[] = ['brokerage', '401k', 'ira', 'roth_ira', 'hsa']

interface AccountProjectionSettings {
  monthlyContribution: string
}

export function FuturePage() {
  const { state } = useAppContext()
  const investmentAccounts = state.accounts.filter(a => INVESTMENT_TYPES.includes(a.accountType))

  const [annualRate, setAnnualRate] = useState(7)
  const [horizonYears, setHorizonYears] = useState(30)
  const [accountSettings, setAccountSettings] = useState<Record<number, AccountProjectionSettings>>({})

  // Compute current balance per account (initial + all confirmed activity)
  const currentBalances = useMemo(() => {
    const result: Record<number, number> = {}
    for (const account of investmentAccounts) {
      result[account.id] = state.transactions.reduce((sum, t) => {
        if (t.status !== 'confirmed') return sum
        if (t.type === 'income' && t.accountId === account.id) return sum + t.amount
        if (t.type === 'expense' && t.accountId === account.id) return sum - t.amount
        if (t.type === 'transfer' && t.accountId === account.id) return sum - t.amount
        if (t.type === 'transfer' && t.toAccountId === account.id) return sum + t.amount
        return sum
      }, account.initialBalance)
    }
    return result
  }, [investmentAccounts, state.transactions])

  // Average monthly income contribution per account
  const averageMonthly = useMemo(() => {
    const result: Record<number, number> = {}
    for (const account of investmentAccounts) {
      const contribs = state.transactions.filter(
        t => t.type === 'income' && t.accountId === account.id && t.status === 'confirmed'
      )
      if (contribs.length === 0) {
        result[account.id] = 0
      } else {
        const uniqueMonths = new Set(contribs.map(c => c.monthKey)).size
        const total = contribs.reduce((a, c) => a + c.amount, 0)
        result[account.id] = uniqueMonths > 0 ? total / uniqueMonths : 0
      }
    }
    return result
  }, [investmentAccounts, state.transactions])

  function getMonthlyContribution(accountId: number): number {
    const override = accountSettings[accountId]?.monthlyContribution
    if (override !== undefined && override !== '') {
      return parseFloat(override) || 0
    }
    return averageMonthly[accountId] ?? 0
  }

  // Projection: one data point per year
  const chartData = useMemo(() => {
    const monthlyRate = annualRate / 100 / 12
    const totalMonths = horizonYears * 12

    const balances: Record<number, number> = { ...currentBalances }

    const dataPoints: Record<string, number | string>[] = []

    // Year 0 (current state)
    const year0: Record<string, number | string> = { year: 0 }
    for (const account of investmentAccounts) {
      year0[`account_${account.id}`] = Math.round(balances[account.id] ?? 0)
    }
    dataPoints.push(year0)

    // Simulate month by month, capture yearly snapshots
    const runningBalances = { ...balances }
    for (let month = 1; month <= totalMonths; month++) {
      for (const account of investmentAccounts) {
        const monthly = getMonthlyContribution(account.id)
        runningBalances[account.id] = (runningBalances[account.id] ?? 0) * (1 + monthlyRate) + monthly
      }
      if (month % 12 === 0) {
        const yearNum = month / 12
        const point: Record<string, number | string> = { year: yearNum }
        for (const account of investmentAccounts) {
          point[`account_${account.id}`] = Math.round(runningBalances[account.id] ?? 0)
        }
        dataPoints.push(point)
      }
    }

    return dataPoints
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [investmentAccounts, currentBalances, annualRate, horizonYears, accountSettings])

  // Summary stats
  const finalPoint = chartData[chartData.length - 1]
  const totalFinalValue = investmentAccounts.reduce((a, acc) => {
    const val = finalPoint ? (finalPoint[`account_${acc.id}`] as number) : 0
    return a + val
  }, 0)

  const initialPoint = chartData[0]
  const totalInitial = investmentAccounts.reduce((a, acc) => {
    const val = initialPoint ? (initialPoint[`account_${acc.id}`] as number) : 0
    return a + val
  }, 0)

  const totalContributions = investmentAccounts.reduce((a, acc) => {
    return a + getMonthlyContribution(acc.id) * horizonYears * 12
  }, 0)

  const totalGrowth = totalFinalValue - totalInitial - totalContributions

  function formatYAxis(value: number): string {
    if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`
    if (value >= 1_000) return `$${(value / 1_000).toFixed(0)}k`
    return `$${value}`
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-sans text-3xl font-extrabold tracking-tight gradient-text">Future Projections</h1>
        <p className="text-text3 text-sm mt-1">See how your investments could grow over time</p>
      </div>

      {/* Settings Panel */}
      <Panel title="Projection Settings" className="mb-6">
        <div className="px-6 py-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs text-text3 tracking-[0.1em] uppercase mb-2">
                Annual Return Rate: <span className="text-accent font-mono">{annualRate}%</span>
              </label>
              <input
                type="range"
                min={0}
                max={20}
                step={0.5}
                value={annualRate}
                onChange={e => setAnnualRate(parseFloat(e.target.value))}
                className="w-full accent-[var(--color-accent)] h-2 rounded-lg appearance-none bg-surface2 cursor-pointer"
              />
              <div className="flex justify-between text-xs text-text3 mt-1">
                <span>0%</span>
                <span>20%</span>
              </div>
            </div>
            <div>
              <label className="block text-xs text-text3 tracking-[0.1em] uppercase mb-2">
                Projection Horizon: <span className="text-accent font-mono">{horizonYears} years</span>
              </label>
              <input
                type="range"
                min={1}
                max={50}
                step={1}
                value={horizonYears}
                onChange={e => setHorizonYears(parseInt(e.target.value))}
                className="w-full accent-[var(--color-accent)] h-2 rounded-lg appearance-none bg-surface2 cursor-pointer"
              />
              <div className="flex justify-between text-xs text-text3 mt-1">
                <span>1 yr</span>
                <span>50 yrs</span>
              </div>
            </div>
          </div>

          {/* Per-account contribution overrides */}
          {investmentAccounts.length > 0 && (
            <div className="mt-6">
              <div className="text-xs text-text3 uppercase tracking-[0.1em] mb-3">Monthly Contributions</div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {investmentAccounts.map(account => (
                  <div key={account.id} className="flex items-center gap-3 bg-surface2 rounded-lg px-4 py-3">
                    <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: account.color }} />
                    <span className="text-text2 text-sm flex-1 truncate">{account.name}</span>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text3 text-sm font-mono">$</span>
                      <input
                        type="number"
                        min="0"
                        step="1"
                        placeholder={averageMonthly[account.id]?.toFixed(0) ?? '0'}
                        value={accountSettings[account.id]?.monthlyContribution ?? ''}
                        onChange={e =>
                          setAccountSettings(prev => ({
                            ...prev,
                            [account.id]: { monthlyContribution: e.target.value },
                          }))
                        }
                        className="w-28 bg-surface border border-border text-text font-mono text-sm pl-7 pr-3 py-1.5 rounded-lg focus:outline-none focus:border-accent"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </Panel>

      {/* Summary Cards */}
      {investmentAccounts.length > 0 && (
        <div className="grid grid-cols-3 gap-5 mb-6 max-[700px]:grid-cols-1">
          <div className="bg-surface border border-border rounded-xl px-5 py-4">
            <div className="text-xs text-text3 uppercase tracking-[0.1em] mb-1">Total Value in {horizonYears}y</div>
            <div className="font-mono text-2xl font-bold text-accent3">{formatCurrency(totalFinalValue)}</div>
          </div>
          <div className="bg-surface border border-border rounded-xl px-5 py-4">
            <div className="text-xs text-text3 uppercase tracking-[0.1em] mb-1">Total Contributions</div>
            <div className="font-mono text-2xl font-bold text-accent">{formatCurrency(totalInitial + totalContributions)}</div>
          </div>
          <div className="bg-surface border border-border rounded-xl px-5 py-4">
            <div className="text-xs text-text3 uppercase tracking-[0.1em] mb-1">Total Growth</div>
            <div className="font-mono text-2xl font-bold text-accent2">{formatCurrency(Math.max(0, totalGrowth))}</div>
          </div>
        </div>
      )}

      {/* Chart */}
      <Panel title="Portfolio Growth">
        {investmentAccounts.length === 0 ? (
          <div className="px-8 py-16 text-center text-text3">
            <div className="text-4xl mb-4">◈</div>
            <div className="text-sm">Add investment accounts (brokerage, 401k, IRA, HSA) to see projections.</div>
          </div>
        ) : (
          <div className="p-6">
            <ResponsiveContainer width="100%" height={380}>
              <AreaChart data={chartData} margin={{ top: 10, right: 20, left: 20, bottom: 0 }}>
                <defs>
                  {investmentAccounts.map(account => (
                    <linearGradient key={account.id} id={`grad_${account.id}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={account.color} stopOpacity={0.35} />
                      <stop offset="95%" stopColor={account.color} stopOpacity={0.05} />
                    </linearGradient>
                  ))}
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis
                  dataKey="year"
                  tickFormatter={v => `${v}y`}
                  tick={{ fill: 'var(--color-text3)', fontSize: 12, fontFamily: 'var(--font-mono)' }}
                  axisLine={{ stroke: 'var(--color-border)' }}
                  tickLine={false}
                />
                <YAxis
                  tickFormatter={formatYAxis}
                  tick={{ fill: 'var(--color-text3)', fontSize: 12, fontFamily: 'var(--font-mono)' }}
                  axisLine={{ stroke: 'var(--color-border)' }}
                  tickLine={false}
                  width={70}
                />
                <Tooltip
                  contentStyle={{
                    background: 'var(--color-surface)',
                    border: '1px solid var(--color-border)',
                    borderRadius: '10px',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '13px',
                    color: 'var(--color-text)',
                  }}
                  labelFormatter={v => `Year ${v}`}
                  formatter={(value, name) => {
                    const nameStr = String(name ?? '')
                    const accountId = parseInt(nameStr.replace('account_', ''))
                    const account = investmentAccounts.find(a => a.id === accountId)
                    return [formatCurrency(Number(value ?? 0)), account?.name ?? nameStr]
                  }}
                />
                {investmentAccounts.map(account => (
                  <Area
                    key={account.id}
                    type="monotone"
                    dataKey={`account_${account.id}`}
                    stackId="1"
                    stroke={account.color}
                    strokeWidth={2}
                    fill={`url(#grad_${account.id})`}
                    dot={false}
                    activeDot={{ r: 4, fill: account.color }}
                  />
                ))}
              </AreaChart>
            </ResponsiveContainer>

            {/* Legend */}
            <div className="flex flex-wrap gap-4 mt-4 justify-center">
              {investmentAccounts.map(account => (
                <div key={account.id} className="flex items-center gap-2 text-sm">
                  <div className="w-3 h-3 rounded-sm" style={{ background: account.color }} />
                  <span className="text-text2">{account.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </Panel>
    </div>
  )
}
