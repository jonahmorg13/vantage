import { useState } from 'react'
import Skeleton from 'react-loading-skeleton'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { Panel } from '../components/ui/Panel'
import { Modal, FormGroup, FormInput, FormSelect, MoneyInput } from '../components/ui/Modal'
import { Button } from '../components/ui/Button'
import { AccountBalanceChart } from '../components/accounts/AccountBalanceChart'
import { useAppContext } from '../context/AppContext'
import { useRepositories } from '../repositories/RepositoryContext'
import { useToast } from '../components/ui/Toast'
import { useCurrency } from '../hooks/useCurrency'
import { todayISO } from '../utils/format'
import type { Account, Transaction } from '../types'

const ACCOUNT_TYPE_LABELS: Record<Account['accountType'], string> = {
  checking: 'Checking',
  savings: 'Savings',
  brokerage: 'Brokerage',
  '401k': '401(k)',
  ira: 'IRA',
  roth_ira: 'Roth IRA',
  hsa: 'HSA',
  other: 'Other',
}

const DEFAULT_COLORS = [
  '#7c6dfa',
  '#fa6d8e',
  '#6dfab0',
  '#fac86d',
  '#6db8fa',
  '#fa9d6d',
  '#b06dfa',
  '#fa6dc8',
  '#6dfaed',
  '#faed6d',
]

interface AccountFormState {
  name: string
  accountType: Account['accountType']
  color: string
  initialBalance: string
  adjustBalance: string
  adjustDate: string
}

const defaultAccountForm = (): AccountFormState => ({
  name: '',
  accountType: 'checking',
  color: DEFAULT_COLORS[0],
  initialBalance: '0',
  adjustBalance: '',
  adjustDate: todayISO(),
})

function getAccountBalance(account: Account, transactions: Transaction[]): number {
  return transactions.reduce((sum, t) => {
    if (t.status !== 'confirmed') return sum
    if (t.type === 'income' && t.accountId === account.id) return sum + t.amount
    if (t.type === 'expense' && t.accountId === account.id) return sum - t.amount
    if (t.type === 'transfer' && t.accountId === account.id) return sum - t.amount
    if (t.type === 'transfer' && t.toAccountId === account.id) return sum + t.amount
    return sum
  }, account.initialBalance)
}

function getAccountActivity(account: Account, transactions: Transaction[]): Transaction[] {
  return transactions
    .filter(
      (t) =>
        t.status === 'confirmed' && (t.accountId === account.id || t.toAccountId === account.id)
    )
    .sort((a, b) => b.date.localeCompare(a.date))
}

export function AccountsPage() {
  const format = useCurrency()
  const { state, isHydrating } = useAppContext()
  const { accounts: accountRepo, transactions: txRepo } = useRepositories()
  const { showToast } = useToast()
  const { accounts, transactions } = state

  const [accountModal, setAccountModal] = useState<{ open: boolean; editId: number | null }>({
    open: false,
    editId: null,
  })
  const [accountForm, setAccountForm] = useState<AccountFormState>(defaultAccountForm())
  const [submitted, setSubmitted] = useState(false)
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [expandedCharts, setExpandedCharts] = useState<Set<number>>(new Set())

  function openEditAccount(account: Account) {
    setSubmitted(false)
    setAccountForm({
      name: account.name,
      accountType: account.accountType,
      color: account.color,
      initialBalance: String(account.initialBalance),
      adjustBalance: '',
      adjustDate: todayISO(),
    })
    setAccountModal({ open: true, editId: account.id })
  }

  function closeAccountModal() {
    setAccountModal({ open: false, editId: null })
  }

  const nameError = !accountForm.name.trim() ? 'Account name is required' : ''

  async function saveAccount() {
    setSubmitted(true)
    if (nameError) return

    try {
      if (accountModal.editId !== null) {
        accountRepo.update(accountModal.editId, {
          name: accountForm.name,
          accountType: accountForm.accountType,
          color: accountForm.color,
        })

        // Create a balance adjustment transaction if requested
        if (accountForm.adjustBalance !== '') {
          const account = accounts.find((a) => a.id === accountModal.editId)
          if (account) {
            const currentBalance = getAccountBalance(account, transactions)
            const desiredBalance = parseFloat(accountForm.adjustBalance) || 0
            const diff = desiredBalance - currentBalance

            if (diff !== 0) {
              const adjustDate = accountForm.adjustDate || todayISO()
              await txRepo.create({
                name: 'Balance Adjustment',
                amount: Math.abs(diff),
                type: diff > 0 ? 'income' : 'expense',
                accountId: account.id,
                date: adjustDate,
                monthKey: adjustDate.slice(0, 7),
                status: 'confirmed',
              })
            }
          }
        }

        showToast('Account updated')
      } else {
        const initialBalance = parseFloat(accountForm.initialBalance) || 0
        accountRepo.create({
          name: accountForm.name,
          accountType: accountForm.accountType,
          color: accountForm.color,
          initialBalance,
        })
        showToast('Account added')
      }
      closeAccountModal()
    } catch {
      showToast('Failed to save account', 'error')
    }
  }

  function deleteAccount(id: number) {
    accountRepo.delete(id)
    showToast('Account deleted')
  }

  const colorIndex = accounts.length % DEFAULT_COLORS.length

  const totalNetWorth = accounts.reduce((sum, a) => sum + getAccountBalance(a, transactions), 0)

  if (isHydrating) {
    return (
      <div>
        <div className="flex items-center justify-between mb-8">
          <div>
            <Skeleton width={120} height={32} className="mb-2" />
            <Skeleton width={220} height={14} />
          </div>
          <Skeleton width={120} height={36} borderRadius={8} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-surface border border-border rounded-xl px-5 py-4">
              <Skeleton width={80} height={11} className="mb-2" />
              <Skeleton width={100} height={26} />
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="bg-surface border border-border rounded-xl overflow-hidden">
              <div className="px-6 py-4 border-b border-border flex items-center justify-between">
                <Skeleton width={120} height={18} />
                <Skeleton width={60} height={30} borderRadius={8} />
              </div>
              <div className="px-6 py-5">
                <div className="grid grid-cols-2 gap-4 mb-6">
                  {Array.from({ length: 2 }).map((__, j) => (
                    <div key={j}>
                      <Skeleton width={80} height={11} className="mb-1" />
                      <Skeleton width={90} height={22} />
                    </div>
                  ))}
                </div>
                <Skeleton height={14} className="mb-2" />
                <Skeleton height={14} className="mb-2" />
                <Skeleton height={14} />
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-sans text-3xl font-extrabold tracking-tight gradient-text">
            Accounts
          </h1>
          <p className="text-text3 text-sm mt-1">
            Track your checking, savings, and investment accounts
          </p>
        </div>
        <Button
          variant="primary"
          onClick={() => {
            setSubmitted(false)
            setAccountForm({ ...defaultAccountForm(), color: DEFAULT_COLORS[colorIndex] })
            setAccountModal({ open: true, editId: null })
          }}
        >
          + Add Account
        </Button>
      </div>

      {accounts.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
          <div className="bg-surface border border-border rounded-xl px-5 py-4">
            <div className="text-xs text-text3 uppercase tracking-[0.1em] mb-1">Net Worth</div>
            <div
              className={`font-mono text-2xl font-bold ${totalNetWorth < 0 ? 'text-danger' : 'text-accent3'}`}
            >
              {totalNetWorth < 0 ? '-' : ''}
              {format(Math.abs(totalNetWorth))}
            </div>
          </div>
          <div className="hidden sm:block bg-surface border border-border rounded-xl px-5 py-4">
            <div className="text-xs text-text3 uppercase tracking-[0.1em] mb-1">Accounts</div>
            <div className="font-mono text-2xl font-bold text-accent">{accounts.length}</div>
          </div>
          <div className="hidden sm:block bg-surface border border-border rounded-xl px-5 py-4">
            <div className="text-xs text-text3 uppercase tracking-[0.1em] mb-1">
              Total Transactions
            </div>
            <div className="font-mono text-2xl font-bold text-text2">
              {transactions.filter((t) => t.accountId != null || t.toAccountId != null).length}
            </div>
          </div>
        </div>
      )}

      {accounts.length === 0 ? (
        <Panel title="Accounts">
          <div className="px-8 py-16 text-center text-text3">
            <div className="text-4xl mb-4">◈</div>
            <div className="text-sm">No accounts yet. Add one to get started.</div>
          </div>
        </Panel>
      ) : (
        <div className="flex flex-col gap-5">
          {accounts.map((account) => {
            const balance = getAccountBalance(account, transactions)
            const activity = getAccountActivity(account, transactions)

            return (
              <Panel
                key={account.id}
                title={account.name}
                action={
                  <div className="flex items-center gap-2">
                    <Button
                      variant="secondary"
                      onClick={() => openEditAccount(account)}
                      className="text-xs py-1.5 px-3"
                    >
                      Edit
                    </Button>
                    {!account.isDefault && deletingId === account.id ? (
                      <>
                        <Button
                          variant="secondary"
                          onClick={() => setDeletingId(null)}
                          className="text-xs py-1.5 px-3"
                        >
                          Cancel
                        </Button>
                        <Button
                          variant="danger"
                          onClick={() => { deleteAccount(account.id); setDeletingId(null) }}
                          className="text-xs py-1.5 px-3"
                        >
                          Confirm
                        </Button>
                      </>
                    ) : !account.isDefault && (
                      <Button
                        variant="danger"
                        onClick={() => setDeletingId(account.id)}
                        className="text-xs py-1.5 px-3"
                      >
                        Delete
                      </Button>
                    )}
                  </div>
                }
              >
                <div className="px-6 py-5">
                  {/* Account header row */}
                  <div className="flex items-center gap-3 mb-5">
                    <div
                      className="w-3 h-3 rounded-full shrink-0"
                      style={{ background: account.color }}
                    />
                    <span
                      className="text-xs font-mono px-2 py-0.5 rounded-md border"
                      style={{
                        color: account.color,
                        borderColor: account.color + '40',
                        background: account.color + '18',
                      }}
                    >
                      {ACCOUNT_TYPE_LABELS[account.accountType]}
                    </span>
                  </div>

                  {/* Stats grid */}
                  <div className="grid grid-cols-2 gap-4 mb-5">
                    <div className="bg-surface2 rounded-lg px-4 py-3">
                      <div className="text-xs text-text3 uppercase tracking-[0.1em] mb-1">
                        Current Balance
                      </div>
                      <div
                        className={`font-mono text-base font-bold ${balance < 0 ? 'text-danger' : 'text-accent3'}`}
                      >
                        {balance < 0 ? '-' : ''}
                        {format(Math.abs(balance))}
                      </div>
                    </div>
                    <div className="bg-surface2 rounded-lg px-4 py-3">
                      <div className="text-xs text-text3 uppercase tracking-[0.1em] mb-1">
                        Transactions
                      </div>
                      <div className="font-mono text-base font-bold text-accent">
                        {activity.length}
                      </div>
                    </div>
                  </div>

                  {/* Balance History Chart */}
                  <div className="mb-5">
                    <button
                      onClick={() =>
                        setExpandedCharts((prev) => {
                          const next = new Set(prev)
                          next.has(account.id) ? next.delete(account.id) : next.add(account.id)
                          return next
                        })
                      }
                      className="flex items-center gap-1.5 text-xs text-text3 uppercase tracking-[0.1em] hover:text-text2 transition-colors cursor-pointer"
                    >
                      Balance History
                      {expandedCharts.has(account.id) ? (
                        <ChevronUp size={14} />
                      ) : (
                        <ChevronDown size={14} />
                      )}
                    </button>
                    {expandedCharts.has(account.id) && (
                      <div className="mt-3">
                        <AccountBalanceChart account={account} transactions={transactions} />
                      </div>
                    )}
                  </div>

                  {/* Activity list */}
                  {activity.length > 0 && (
                    <div>
                      <div className="text-xs text-text3 uppercase tracking-[0.1em] mb-2">
                        Recent Activity
                      </div>
                      <div className="flex flex-col gap-1.5 max-h-48 overflow-y-auto">
                        {activity.slice(0, 20).map((tx) => {
                          const isIncoming =
                            (tx.type === 'income' && tx.accountId === account.id) ||
                            (tx.type === 'transfer' && tx.toAccountId === account.id)
                          const isOutgoing =
                            (tx.type === 'expense' && tx.accountId === account.id) ||
                            (tx.type === 'transfer' && tx.accountId === account.id)
                          const amountColor = isIncoming
                            ? 'text-accent3'
                            : isOutgoing
                              ? 'text-accent2'
                              : 'text-text'
                          const prefix = isIncoming ? '+' : isOutgoing ? '-' : ''

                          return (
                            <div
                              key={tx.id}
                              className="flex items-center justify-between bg-surface2 rounded-lg px-4 py-2 text-sm"
                            >
                              <div className="flex items-center gap-3">
                                <span className="text-text3 font-mono text-xs">{tx.date}</span>
                                <span className="text-text2">{tx.name || '—'}</span>
                                {tx.type === 'transfer' && (
                                  <span className="text-xs text-text3 font-mono">transfer</span>
                                )}
                              </div>
                              <span className={`${amountColor} font-mono font-bold`}>
                                {prefix}
                                {format(tx.amount)}
                              </span>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </Panel>
            )
          })}
        </div>
      )}

      {/* Account Modal */}
      <Modal
        open={accountModal.open}
        onClose={closeAccountModal}
        title={accountModal.editId !== null ? 'Edit Account' : 'Add Account'}
      >
        <form onSubmit={(e) => { e.preventDefault(); saveAccount() }}>
          <FormGroup label="Account Name" error={submitted ? nameError : ''}>
            <FormInput
              type="text"
              value={accountForm.name}
              onChange={(e) => setAccountForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="e.g. Chase Checking"
            />
          </FormGroup>
          <FormGroup label="Account Type">
            <FormSelect
              value={accountForm.accountType}
              onChange={(e) =>
                setAccountForm((f) => ({
                  ...f,
                  accountType: e.target.value as Account['accountType'],
                }))
              }
            >
              {(Object.keys(ACCOUNT_TYPE_LABELS) as Account['accountType'][]).map((t) => (
                <option key={t} value={t}>
                  {ACCOUNT_TYPE_LABELS[t]}
                </option>
              ))}
            </FormSelect>
          </FormGroup>
          <FormGroup label="Color">
            <div className="flex gap-2 flex-wrap">
              {DEFAULT_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setAccountForm((f) => ({ ...f, color: c }))}
                  className="w-7 h-7 rounded-full border-2 transition-all duration-150"
                  style={{
                    background: c,
                    borderColor: accountForm.color === c ? '#fff' : 'transparent',
                    outline: accountForm.color === c ? `2px solid ${c}` : 'none',
                  }}
                />
              ))}
            </div>
          </FormGroup>
          {accountModal.editId === null ? (
            <FormGroup label="Initial Balance">
              <MoneyInput
                value={accountForm.initialBalance}
                onChange={(v) => setAccountForm((f) => ({ ...f, initialBalance: v }))}
                placeholder="0.00"
              />
            </FormGroup>
          ) : (
            <>
              <FormGroup label="Adjust Balance To">
                <MoneyInput
                  value={accountForm.adjustBalance}
                  onChange={(v) => setAccountForm((f) => ({ ...f, adjustBalance: v }))}
                  placeholder="Leave blank to skip"
                />
              </FormGroup>
              {accountForm.adjustBalance !== '' && (
                <FormGroup label="As of Date">
                  <FormInput
                    type="date"
                    value={accountForm.adjustDate}
                    onChange={(e) => setAccountForm((f) => ({ ...f, adjustDate: e.target.value }))}
                  />
                </FormGroup>
              )}
            </>
          )}
          <div className="flex gap-3 mt-6 justify-end">
            <Button variant="secondary" type="button" onClick={closeAccountModal}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              {accountModal.editId !== null ? 'Save Changes' : 'Add Account'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
