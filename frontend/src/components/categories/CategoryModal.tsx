import { useState, useEffect } from 'react'
import { useAppContext } from '../../context/AppContext'
import { Modal, FormGroup, FormInput } from '../ui/Modal'
import { Button } from '../ui/Button'
import type { Category } from '../../types'

interface CategoryModalProps {
  open: boolean
  onClose: () => void
  editCategory?: Category | null
}

export function CategoryModal({ open, onClose, editCategory }: CategoryModalProps) {
  const { state, dispatch } = useAppContext()
  const [name, setName] = useState('')
  const [budgetAmount, setBudgetAmount] = useState('')
  const [spendLimit, setSpendLimit] = useState('')
  const [color, setColor] = useState('#7c6dfa')

  useEffect(() => {
    if (open) {
      if (editCategory) {
        setName(editCategory.name)
        setBudgetAmount(editCategory.budgetAmount.toString())
        setSpendLimit(editCategory.spendLimit > 0 ? editCategory.spendLimit.toString() : '')
        setColor(editCategory.color)
      } else {
        setName('')
        setBudgetAmount('')
        setSpendLimit('')
        setColor('#' + Math.floor(Math.random() * 0xffffff).toString(16).padStart(6, '0'))
      }
    }
  }, [open, editCategory])

  function handleSave() {
    if (!name.trim()) return

    if (editCategory) {
      dispatch({
        type: 'UPDATE_CATEGORY',
        monthKey: state.currentMonthKey,
        id: editCategory.id,
        updates: {
          name: name.trim(),
          budgetAmount: parseFloat(budgetAmount) || 0,
          spendLimit: parseFloat(spendLimit) || 0,
          color,
        },
      })
    } else {
      dispatch({
        type: 'ADD_CATEGORY',
        monthKey: state.currentMonthKey,
        category: {
          name: name.trim(),
          budgetAmount: parseFloat(budgetAmount) || 0,
          spendLimit: parseFloat(spendLimit) || 0,
          color,
          sortOrder: 999,
        },
      })
    }
    onClose()
  }

  return (
    <Modal open={open} onClose={onClose} title={editCategory ? 'Edit Category' : 'Add Category'}>
      <FormGroup label="Category Name">
        <FormInput
          type="text"
          placeholder="e.g. Groceries"
          value={name}
          onChange={e => setName(e.target.value)}
        />
      </FormGroup>
      <div className="grid grid-cols-2 gap-4">
        <FormGroup label="Budget Amount ($)">
          <FormInput
            type="number"
            placeholder="300.00"
            step="0.01"
            value={budgetAmount}
            onChange={e => setBudgetAmount(e.target.value)}
          />
        </FormGroup>
        <FormGroup label="Spend Limit ($)">
          <FormInput
            type="number"
            placeholder="Same as budget"
            step="0.01"
            value={spendLimit}
            onChange={e => setSpendLimit(e.target.value)}
          />
        </FormGroup>
      </div>
      <FormGroup label="Color">
        <FormInput
          type="color"
          value={color}
          onChange={e => setColor(e.target.value)}
          className="!h-[42px] cursor-pointer"
        />
      </FormGroup>
      <div className="flex gap-2.5 mt-6">
        <Button variant="secondary" onClick={onClose} className="flex-1 !py-3">
          Cancel
        </Button>
        <Button onClick={handleSave} className="flex-1 !py-3">
          {editCategory ? 'Save Changes' : 'Save Category'}
        </Button>
      </div>
    </Modal>
  )
}
