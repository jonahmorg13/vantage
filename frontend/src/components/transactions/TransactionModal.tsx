import { useState, useEffect } from 'react'
import { useAppContext } from '../../context/AppContext'
import { useRepositories } from '../../repositories/RepositoryContext'
import { useCurrentMonth } from '../../hooks/useMonthBudget'
import { Modal, FormGroup, FormInput, FormSelect, MoneyInput } from '../ui/Modal'
import { Button } from '../ui/Button'
import { useToast } from '../ui/Toast'
import { todayISO } from '../../utils/format'
import type { Transaction } from '../../types'

interface TransactionModalProps {
  open: boolean
  onClose: () => void
  editTransaction?: Transaction | null
}

export function TransactionModal({ open, onClose, editTransaction }: TransactionModalProps) {
  const { state } = useAppContext()
  const { transactions: txRepo } = useRepositories()
  const { showToast } = useToast()
  const month = useCurrentMonth()
  const [name, setName] = useState('')
  const [amount, setAmount] = useState('')
  const [date, setDate] = useState(todayISO())
  const [type, setType] = useState<'expense' | 'income' | 'transfer'>('expense')
  const [categoryId, setCategoryId] = useState<number>(0)
  const [accountId, setAccountId] = useState<number>(0) // for expense/income: optional linked account
  const [toAccountId, setToAccountId] = useState<number>(0) // for transfer: destination account
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    if (open) {
      setSubmitted(false)
      if (editTransaction) {
        setName(editTransaction.name)
        setAmount(editTransaction.amount.toString())
        setDate(editTransaction.date)
        setType(editTransaction.type)
        setCategoryId(editTransaction.categoryId ?? 0)
        setAccountId(editTransaction.accountId ?? 0)
        setToAccountId(editTransaction.toAccountId ?? 0)
      } else {
        setName('')
        setAmount('')
        setDate(todayISO())
        setType('expense')
        setCategoryId(month?.categories[0]?.id ?? 0)
        setAccountId(0)
        setToAccountId(state.accounts[1]?.id ?? state.accounts[0]?.id ?? 0)
      }
    }
  }, [open, editTransaction, month, state.accounts])

  const nameError = !name.trim() ? 'Name is required' : ''
  const amountError = !amount ? 'Amount is required' : parseFloat(amount) <= 0 ? 'Amount must be greater than 0' : ''
  const dateError = !date ? 'Date is required' : ''
  const fromAccountError = type === 'transfer' && accountId === 0 ? 'From account is required' : ''
  const toAccountError = type === 'transfer' && toAccountId === 0 ? 'To account is required'
    : type === 'transfer' && toAccountId === accountId ? 'Must be different from source' : ''

  function handleSave() {
    setSubmitted(true)
    if (nameError || amountError || dateError || fromAccountError || toAccountError) return

    const base = {
      name: name.trim(),
      amount: parseFloat(amount),
      date,
      type,
      monthKey: state.currentMonthKey,
      status: 'confirmed' as const,
    }

    let payload: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>
    if (type === 'transfer') {
      payload = { ...base, accountId, toAccountId, categoryId: categoryId !== 0 ? categoryId : undefined }
    } else if (type === 'income') {
      payload = {
        ...base,
        categoryId: undefined,
        accountId: accountId !== 0 ? accountId : undefined,
        toAccountId: undefined,
      }
    } else {
      payload = {
        ...base,
        categoryId: categoryId !== 0 ? categoryId : undefined,
        accountId: accountId !== 0 ? accountId : undefined,
        toAccountId: undefined,
      }
    }

    try {
      if (editTransaction) {
        txRepo.update(editTransaction.id, payload)
        showToast('Transaction updated')
      } else {
        txRepo.create(payload)
        showToast('Transaction added')
      }
      onClose()
    } catch {
      showToast('Failed to save transaction', 'error')
    }
  }

  const isTransfer = type === 'transfer'

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={editTransaction ? 'Edit Transaction' : 'Add Transaction'}
    >
      <form onSubmit={(e) => { e.preventDefault(); handleSave() }}>
        <FormGroup label="Name / Description" error={submitted ? nameError : ''}>
          <FormInput
            type="text"
            placeholder="e.g. Whole Foods"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </FormGroup>
        <div className="grid grid-cols-2 gap-4">
          <FormGroup label="Amount ($)" error={submitted ? amountError : ''}>
            <MoneyInput value={amount} onChange={setAmount} />
          </FormGroup>
          <FormGroup label="Date" error={submitted ? dateError : ''}>
            <FormInput type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </FormGroup>
        </div>

        <FormGroup label="Type">
          <FormSelect value={type} onChange={(e) => setType(e.target.value as typeof type)}>
            <option value="expense">Expense</option>
            <option value="income">Income</option>
            {state.accounts.length >= 2 && <option value="transfer">Transfer</option>}
          </FormSelect>
        </FormGroup>

        {isTransfer ? (
          <>
            <div className="grid grid-cols-2 gap-4">
              <FormGroup label="From Account" error={submitted ? fromAccountError : ''}>
                <FormSelect value={accountId} onChange={(e) => setAccountId(Number(e.target.value))}>
                  <option value={0} disabled>
                    Select account
                  </option>
                  {state.accounts.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name}
                    </option>
                  ))}
                </FormSelect>
              </FormGroup>
              <FormGroup label="To Account" error={submitted ? toAccountError : ''}>
                <FormSelect
                  value={toAccountId}
                  onChange={(e) => setToAccountId(Number(e.target.value))}
                >
                  <option value={0} disabled>
                    Select account
                  </option>
                  {state.accounts
                    .filter((a) => a.id !== accountId)
                    .map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.name}
                      </option>
                    ))}
                </FormSelect>
              </FormGroup>
            </div>
            <FormGroup label="Budget Item (optional)">
              <FormSelect value={categoryId} onChange={(e) => setCategoryId(Number(e.target.value))}>
                <option value={0}>None</option>
                {month?.categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </FormSelect>
            </FormGroup>
          </>
        ) : type === 'income' ? (
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
        ) : (
          <div className="grid grid-cols-2 gap-4">
            <FormGroup label="Budget Item (optional)">
              <FormSelect value={categoryId} onChange={(e) => setCategoryId(Number(e.target.value))}>
                <option value={0}>None</option>
                {month?.categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </FormSelect>
            </FormGroup>
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
          </div>
        )}

        <div className="flex gap-2.5 mt-6">
          <Button variant="secondary" type="button" onClick={onClose} className="flex-1 !py-3">
            Cancel
          </Button>
          <Button type="submit" className="flex-1 !py-3">
            {editTransaction ? 'Save Changes' : 'Add Transaction'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
