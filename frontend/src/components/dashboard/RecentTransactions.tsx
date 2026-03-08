import { Link } from 'react-router-dom'
import { useTransactions } from '../../hooks/useTransactions'
import { useCurrentMonth } from '../../hooks/useMonthBudget'
import { useAppContext } from '../../context/AppContext'
import { formatCurrency, formatDate } from '../../utils/format'
import { Panel } from '../ui/Panel'
import { Button } from '../ui/Button'

export function RecentTransactions() {
  const { state } = useAppContext()
  const transactions = useTransactions({ status: 'confirmed' })
  const month = useCurrentMonth()

  const recent = transactions.slice(0, 10)

  return (
    <Panel
      title="Recent Transactions"
      action={
        <Link to="/transactions">
          <Button variant="secondary">View All</Button>
        </Link>
      }
    >
      <div className="max-h-96 overflow-y-auto custom-scrollbar">
        {recent.length === 0 ? (
          <div className="py-16 text-center text-text3 text-sm">
            No transactions yet. Add one from the Transactions page.
          </div>
        ) : (
          recent.map(tx => {
            const cat = tx.categoryId != null ? month?.categories.find(c => c.id === tx.categoryId) : null
            const account = tx.accountId != null ? state.accounts.find(a => a.id === tx.accountId) : null
            const toAccount = tx.toAccountId != null ? state.accounts.find(a => a.id === tx.toAccountId) : null

            let labelColor: string
            let labelText: string

            if (tx.type === 'transfer') {
              labelColor = account?.color ?? toAccount?.color ?? '#555'
              labelText = account && toAccount ? `${account.name} → ${toAccount.name}` : 'Transfer'
            } else {
              labelColor = account?.color ?? cat?.color ?? '#555'
              labelText = account ? account.name : (cat?.name ?? 'Uncategorized')
            }

            const amountColor =
              tx.type === 'income' ? 'text-accent3' :
              tx.type === 'transfer' ? 'text-text2' :
              'text-accent2'

            const amountPrefix =
              tx.type === 'income' ? '+' :
              tx.type === 'transfer' ? '⇄ ' :
              ''

            return (
              <div
                key={tx.id}
                className="grid grid-cols-[160px_1fr_120px_120px] items-center gap-4 px-6 py-3.5 border-b border-white/[0.03] hover:bg-accent/[0.04] transition-colors animate-fade-in max-[900px]:grid-cols-[130px_1fr_100px]"
              >
                <div>
                  <span className="inline-flex items-center gap-2 text-xs text-text2 bg-surface2 px-2.5 py-1 rounded border border-border max-w-full overflow-hidden">
                    <span
                      className="inline-block w-2 h-2 rounded-full shrink-0"
                      style={{ background: labelColor }}
                    />
                    <span className="truncate">{labelText}</span>
                  </span>
                </div>
                <div className="text-sm text-text">{tx.name}</div>
                <div className={`text-sm text-right font-medium ${amountColor}`}>
                  {amountPrefix}{formatCurrency(tx.amount)}
                </div>
                <div className="text-xs text-text3 text-right max-[900px]:hidden">
                  {formatDate(tx.date)}
                </div>
              </div>
            )
          })
        )}
      </div>
    </Panel>
  )
}
