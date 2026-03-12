import { useState } from 'react'
import { useAppContext } from '../../context/AppContext'
import { useRepositories } from '../../repositories/RepositoryContext'
import { useToast } from '../ui/Toast'
import { Panel } from '../ui/Panel'
import { Button } from '../ui/Button'
import { Modal, FormGroup, FormInput, FormSelect } from '../ui/Modal'
import { useCurrency } from '../../hooks/useCurrency'
import type { RecurringTransaction } from '../../types'

export function RecurringManager() {
  const format = useCurrency()
  const { state } = useAppContext()
  const { recurring: recurringRepo } = useRepositories()
  const { showToast } = useToast()
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<RecurringTransaction | null>(null)
  const [deletingId, setDeletingId] = useState<number | null>(null)

  const [name, setName] = useState('')
  const [amount, setAmount] = useState('')
  const [type, setType] = useState<'expense' | 'income' | 'transfer'>('expense')
  const [categoryId, setCategoryId] = useState<number>(0)
  const [accountId, setAccountId] = useState<number>(0)
  const [toAccountId, setToAccountId] = useState<number>(0)
  const [dayOfMonth, setDayOfMonth] = useState('1')
  const [submitted, setSubmitted] = useState(false)

  const templates = state.settings.categoryTemplates

  function openModal(recurring?: RecurringTransaction) {
    if (recurring) {
      setEditing(recurring)
      setName(recurring.name)
      setAmount(recurring.amount.toString())
      setType(recurring.type)
      setCategoryId(recurring.categoryId ?? 0)
      setAccountId(recurring.accountId ?? 0)
      setToAccountId(recurring.toAccountId ?? 0)
      setDayOfMonth(recurring.dayOfMonth.toString())
    } else {
      setEditing(null)
      setName('')
      setAmount('')
      setType('expense')
      setCategoryId(templates[0]?.id ?? 0)
      setAccountId(0)
      setToAccountId(0)
      setDayOfMonth('1')
    }
    setSubmitted(false)
    setModalOpen(true)
  }

  const nameError = !name.trim() ? 'Name is required' : ''
  const amountError = !amount ? 'Amount is required' : parseFloat(amount) <= 0 ? 'Amount must be greater than 0' : ''
  const dayError = !dayOfMonth || parseInt(dayOfMonth) < 1 || parseInt(dayOfMonth) > 31 ? 'Must be 1-31' : ''
  const fromAccountError = type === 'transfer' && accountId === 0 ? 'From account is required' : ''
  const toAccountError = type === 'transfer' && toAccountId === 0 ? 'To account is required'
    : type === 'transfer' && toAccountId === accountId ? 'Must be different from source' : ''

  function handleSave() {
    setSubmitted(true)
    if (nameError || amountError || dayError || fromAccountError || toAccountError) return

    const isTransfer = type === 'transfer'
    const resolvedAccountId = accountId !== 0 ? accountId : undefined
    const resolvedToAccountId = isTransfer && toAccountId !== 0 ? toAccountId : undefined
    const resolvedCategoryId = type !== 'income' && categoryId !== 0 ? categoryId : undefined

    if (editing) {
      recurringRepo.update(editing.id, {
        name: name.trim(),
        amount: parseFloat(amount),
        type,
        categoryId: resolvedCategoryId,
        accountId: resolvedAccountId,
        toAccountId: resolvedToAccountId,
        dayOfMonth: parseInt(dayOfMonth) || 1,
      })
      showToast('Recurring transaction updated')
    } else {
      recurringRepo.create({
        name: name.trim(),
        amount: parseFloat(amount),
        type,
        categoryId: resolvedCategoryId,
        accountId: resolvedAccountId,
        toAccountId: resolvedToAccountId,
        dayOfMonth: parseInt(dayOfMonth) || 1,
        isActive: true,
      })
      showToast('Recurring transaction added')
    }
    setModalOpen(false)
  }

  return (
    <>
      <Panel
        title="Recurring Transactions"
        action={<Button onClick={() => openModal()}>+ Add Recurring</Button>}
      >
        <div>
          <p className="text-xs text-text3 px-6 py-4">
            Recurring transactions are auto-generated as pending entries when you navigate to a new
            month.
          </p>
          {state.recurringTransactions.length === 0 ? (
            <div className="py-12 text-center text-text3 text-sm">
              No recurring transactions yet.
            </div>
          ) : (
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-left text-xs text-text3 tracking-[0.12em] uppercase border-b border-border">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs text-text3 tracking-[0.12em] uppercase border-b border-border">
                    Amount
                  </th>
                  <th className="max-[640px]:hidden px-6 py-3 text-left text-xs text-text3 tracking-[0.12em] uppercase border-b border-border">
                    Type
                  </th>
                  <th className="max-[640px]:hidden px-6 py-3 text-left text-xs text-text3 tracking-[0.12em] uppercase border-b border-border">
                    Day
                  </th>
                  <th className="px-6 py-3 text-left text-xs text-text3 tracking-[0.12em] uppercase border-b border-border">
                    Active
                  </th>
                  <th className="max-[640px]:hidden px-6 py-3 border-b border-border"></th>
                </tr>
              </thead>
              <tbody>
                {state.recurringTransactions.map((r) => (
                  <>
                    <tr key={r.id} className="hover:bg-accent/[0.04] max-[640px]:cursor-pointer" onClick={() => { if (window.innerWidth < 640) openModal(r) }}>
                      <td className="px-6 py-3 text-sm max-[640px]:border-b-0 border-b border-white/[0.03] max-w-0 w-full">
                        <span className="block truncate">{r.name}</span>
                      </td>
                      <td
                        className={`px-6 py-3 text-sm max-[640px]:border-b-0 border-b border-white/[0.03] ${r.type === 'income' ? 'text-accent3' : r.type === 'transfer' ? 'text-text2' : 'text-accent2'}`}
                      >
                        {r.type === 'income' ? '+' : r.type === 'transfer' ? '⇄ ' : ''}
                        {format(r.amount)}
                      </td>
                      <td className="max-[640px]:hidden px-6 py-3 text-sm text-text2 border-b border-white/[0.03] capitalize">
                        {r.type}
                      </td>
                      <td className="max-[640px]:hidden px-6 py-3 text-sm text-text2 border-b border-white/[0.03]">
                        {r.dayOfMonth}
                      </td>
                      <td className="px-6 py-3 max-[640px]:border-b-0 border-b border-white/[0.03]">
                        <button
                          onClick={(e) => { e.stopPropagation(); recurringRepo.update(r.id, { isActive: !r.isActive }); showToast(r.isActive ? 'Recurring paused' : 'Recurring activated') }}
                          className={`text-xs px-2.5 py-1 rounded border cursor-pointer transition-colors ${
                            r.isActive
                              ? 'text-accent3 bg-accent3/10 border-accent3/30'
                              : 'text-text3 bg-surface3 border-border'
                          }`}
                        >
                          {r.isActive ? 'ON' : 'OFF'}
                        </button>
                      </td>
                      <td className="max-[640px]:hidden px-6 py-3 border-b border-white/[0.03]">
                        {deletingId === r.id ? (
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => setDeletingId(null)}
                              className="text-xs text-text3 bg-surface3 px-2.5 py-1 rounded border border-border hover:bg-surface2 transition-colors cursor-pointer"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={() => {
                                recurringRepo.delete(r.id)
                                setDeletingId(null)
                                showToast('Recurring transaction deleted')
                              }}
                              className="text-xs text-danger bg-danger/10 px-2.5 py-1 rounded border border-danger/30 hover:bg-danger/20 transition-colors cursor-pointer"
                            >
                              Delete
                            </button>
                          </div>
                        ) : (
                          <div className="flex gap-1">
                            <button
                              onClick={() => openModal(r)}
                              className="bg-transparent border-none text-text3 cursor-pointer text-lg p-1.5 px-2 rounded transition-all hover:bg-accent/15 hover:text-accent leading-none"
                            >
                              ✎
                            </button>
                            <button
                              onClick={() => setDeletingId(r.id)}
                              className="bg-transparent border-none text-text3 cursor-pointer text-2xl p-1 px-2 rounded transition-all hover:bg-danger/15 hover:text-danger leading-none"
                            >
                              ×
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                    <tr className="min-[640px]:hidden hover:bg-accent/[0.04]">
                      <td colSpan={6} className="px-6 pb-2.5 text-xs text-text3 border-b border-white/[0.03]">
                        Day {r.dayOfMonth} · <span className="capitalize">{r.type}</span>
                      </td>
                    </tr>
                  </>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </Panel>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Edit Recurring Transaction' : 'Add Recurring Transaction'}
      >
        <form onSubmit={(e) => { e.preventDefault(); handleSave() }}>
          <FormGroup label="Name / Description" error={submitted ? nameError : ''}>
            <FormInput
              type="text"
              placeholder="e.g. Roth IRA"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </FormGroup>
          <div className="grid grid-cols-2 gap-4">
            <FormGroup label="Amount ($)" error={submitted ? amountError : ''}>
              <FormInput
                type="number"
                placeholder="0.00"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </FormGroup>
            <FormGroup label="Day of Month" error={submitted ? dayError : ''}>
              <FormInput
                type="number"
                min="1"
                max="31"
                value={dayOfMonth}
                onChange={(e) => setDayOfMonth(e.target.value)}
              />
            </FormGroup>
          </div>
          <FormGroup label="Type">
            <FormSelect
              value={type}
              onChange={(e) => setType(e.target.value as 'expense' | 'income' | 'transfer')}
            >
              <option value="expense">Expense</option>
              <option value="income">Income</option>
              {state.accounts.length >= 2 && <option value="transfer">Transfer</option>}
            </FormSelect>
          </FormGroup>
          {type !== 'income' && (
            <FormGroup label={type === 'transfer' ? 'Budget Item (optional)' : 'Budget Item'}>
              <FormSelect value={categoryId} onChange={(e) => setCategoryId(Number(e.target.value))}>
                <option value={0}>None</option>
                {templates.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </FormSelect>
            </FormGroup>
          )}
          {type === 'transfer' ? (
            <>
              <FormGroup label="From Account" error={submitted ? fromAccountError : ''}>
                <FormSelect value={accountId} onChange={(e) => setAccountId(Number(e.target.value))}>
                  <option value={0}>Select account</option>
                  {state.accounts.map((a) => (
                    <option key={a.id} value={a.id}>{a.name}</option>
                  ))}
                </FormSelect>
              </FormGroup>
              <FormGroup label="To Account" error={submitted ? toAccountError : ''}>
                <FormSelect value={toAccountId} onChange={(e) => setToAccountId(Number(e.target.value))}>
                  <option value={0}>Select account</option>
                  {state.accounts.map((a) => (
                    <option key={a.id} value={a.id}>{a.name}</option>
                  ))}
                </FormSelect>
              </FormGroup>
            </>
          ) : state.accounts.length > 0 ? (
            <FormGroup label="Account (optional)">
              <FormSelect value={accountId} onChange={(e) => setAccountId(Number(e.target.value))}>
                <option value={0}>None</option>
                {state.accounts.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name}
                  </option>
                ))}
              </FormSelect>
            </FormGroup>
          ) : null}
          <div className="flex gap-3 mt-6">
            <Button variant="secondary" type="button" onClick={() => setModalOpen(false)} className="flex-1 !py-3">
              Cancel
            </Button>
            <Button type="submit" className="flex-1 !py-3">
              {editing ? 'Save Changes' : 'Add Recurring Transaction'}
            </Button>
          </div>
        </form>
      </Modal>
    </>
  )
}
