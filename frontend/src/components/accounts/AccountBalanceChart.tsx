import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { useCurrency } from '../../hooks/useCurrency'
import type { Account, Transaction } from '../../types'

interface Props {
  account: Account
  transactions: Transaction[]
}

interface DataPoint {
  date: string
  balance: number
}

export function AccountBalanceChart({ account, transactions }: Props) {
  const format = useCurrency()

  const accountTxs = transactions
    .filter(
      (t) =>
        t.status === 'confirmed' && (t.accountId === account.id || t.toAccountId === account.id)
    )
    .sort((a, b) => a.date.localeCompare(b.date))

  // Build balance-over-time data points
  const dateMap = new Map<string, number>()
  let running = account.initialBalance

  // Start point
  const startDate = accountTxs.length > 0 ? accountTxs[0].date : account.createdAt.slice(0, 10)
  dateMap.set(startDate, running)

  for (const tx of accountTxs) {
    if (tx.type === 'income' && tx.accountId === account.id) running += tx.amount
    else if (tx.type === 'expense' && tx.accountId === account.id) running -= tx.amount
    else if (tx.type === 'transfer' && tx.accountId === account.id) running -= tx.amount
    else if (tx.type === 'transfer' && tx.toAccountId === account.id) running += tx.amount
    dateMap.set(tx.date, running)
  }

  const data: DataPoint[] = Array.from(dateMap.entries()).map(([date, balance]) => ({
    date,
    balance: Math.round(balance * 100) / 100,
  }))

  if (data.length < 2) {
    return (
      <div className="text-xs text-text3 text-center py-4">Not enough data for chart</div>
    )
  }

  return (
    <div className="h-48">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 5, right: 10, left: 10, bottom: 0 }}>
          <defs>
            <linearGradient id={`fill-${account.id}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={account.color} stopOpacity={0.3} />
              <stop offset="100%" stopColor={account.color} stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="date"
            tick={{ fill: '#666', fontSize: 11 }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            tick={{ fill: '#666', fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v: number) => format(v)}
            width={80}
          />
          <Tooltip
            contentStyle={{
              background: '#1a1a2e',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 8,
              fontSize: 12,
            }}
            formatter={(value) => [format(Number(value)), 'Balance']}
            labelStyle={{ color: '#888' }}
          />
          <Area
            type="monotone"
            dataKey="balance"
            stroke={account.color}
            strokeWidth={2}
            fill={`url(#fill-${account.id})`}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
