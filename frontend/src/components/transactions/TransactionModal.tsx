import { useState, useEffect } from 'react'
import { useAppContext } from '../../context/AppContext'
import { useCurrentMonth } from '../../hooks/useMonthBudget'
import { Modal, FormGroup, FormInput, FormSelect } from '../ui/Modal'
import { Button } from '../ui/Button'
import { todayISO } from '../../utils/format'
import type { Transaction } from '../../types'

interface TransactionModalProps {
  open: boolean
  onClose: () => void
  editTransaction?: Transaction | null
}

export function TransactionModal({ open, onClose, editTransaction }: TransactionModalProps) {
  const { state, dispatch } = useAppContext()
  const month = useCurrentMonth()
  const [name, setName] = useState('')
  const [amount, setAmount] = useState('')
  const [date, setDate] = useState(todayISO())
  const [categoryId, setCategoryId] = useState<number>(0)
  const [type, setType] = useState<'expense' | 'income'>('expense')

  useEffect(() => {
    if (open) {
      if (editTransaction) {
        setName(editTransaction.name)
        setAmount(editTransaction.amount.toString())
        setDate(editTransaction.date)
        setCategoryId(editTransaction.categoryId)
        setType(editTransaction.type)
      } else {
        setName('')
        setAmount('')
        setDate(todayISO())
        setCategoryId(month?.categories[0]?.id ?? 0)
        setType('expense')
      }
    }
  }, [open, editTransaction, month])

  function handleSave() {
    if (!name.trim() || !parseFloat(amount) || !date) return

    if (editTransaction) {
      dispatch({
        type: 'UPDATE_TRANSACTION',
        id: editTransaction.id,
        updates: {
          name: name.trim(),
          amount: parseFloat(amount),
          date,
          categoryId,
          type,
        },
      })
    } else {
      dispatch({
        type: 'ADD_TRANSACTION',
        transaction: {
          name: name.trim(),
          amount: parseFloat(amount),
          type,
          categoryId,
          date,
          monthKey: state.currentMonthKey,
          status: 'confirmed',
        },
      })
    }
    onClose()
  }

  return (
    <Modal open={open} onClose={onClose} title={editTransaction ? 'Edit Transaction' : 'Add Transaction'}>
      <FormGroup label="Name / Description">
        <FormInput
          type="text"
          placeholder="e.g. Whole Foods"
          value={name}
          onChange={e => setName(e.target.value)}
        />
      </FormGroup>
      <div className="grid grid-cols-2 gap-4">
        <FormGroup label="Amount ($)">
          <FormInput
            type="number"
            placeholder="0.00"
            step="0.01"
            value={amount}
            onChange={e => setAmount(e.target.value)}
          />
        </FormGroup>
        <FormGroup label="Date">
          <FormInput
            type="date"
            value={date}
            onChange={e => setDate(e.target.value)}
          />
        </FormGroup>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <FormGroup label="Type">
          <FormSelect value={type} onChange={e => setType(e.target.value as 'expense' | 'income')}>
            <option value="expense">Expense</option>
            <option value="income">Income</option>
          </FormSelect>
        </FormGroup>
        <FormGroup label="Category">
          <FormSelect value={categoryId} onChange={e => setCategoryId(Number(e.target.value))}>
            {month?.categories.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </FormSelect>
        </FormGroup>
      </div>
      <div className="flex gap-2.5 mt-6">
        <Button variant="secondary" onClick={onClose} className="flex-1 !py-3">
          Cancel
        </Button>
        <Button onClick={handleSave} className="flex-1 !py-3">
          {editTransaction ? 'Save Changes' : 'Add Transaction'}
        </Button>
      </div>
    </Modal>
  )
}
