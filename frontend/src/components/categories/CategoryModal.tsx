import { useState, useEffect } from 'react'
import { useAppContext } from '../../context/AppContext'
import { useRepositories } from '../../repositories/RepositoryContext'
import { Modal, FormGroup, FormInput, MoneyInput } from '../ui/Modal'
import { Button } from '../ui/Button'
import { useToast } from '../ui/Toast'
import type { Category } from '../../types'

const CATEGORY_COLORS = [
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

interface CategoryModalProps {
  open: boolean
  onClose: () => void
  editCategory?: Category | null
}

export function CategoryModal({ open, onClose, editCategory }: CategoryModalProps) {
  const { state } = useAppContext()
  const { categories: categoryRepo } = useRepositories()
  const { showToast } = useToast()
  const [name, setName] = useState('')
  const [budgetAmount, setBudgetAmount] = useState('')
  const [spendLimit, setSpendLimit] = useState('')
  const [color, setColor] = useState('#7c6dfa')
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    if (open) {
      setSubmitted(false)
      if (editCategory) {
        setName(editCategory.name)
        setBudgetAmount(editCategory.budgetAmount.toString())
        setSpendLimit(editCategory.spendLimit > 0 ? editCategory.spendLimit.toString() : '')
        setColor(editCategory.color)
      } else {
        setName('')
        setBudgetAmount('')
        setSpendLimit('')
        setColor(CATEGORY_COLORS[Math.floor(Math.random() * CATEGORY_COLORS.length)])
      }
    }
  }, [open, editCategory])

  const nameError = !name.trim() ? 'Name is required' : ''

  function handleSave() {
    setSubmitted(true)
    if (nameError) return

    try {
      if (editCategory) {
        categoryRepo.update(state.currentMonthKey, editCategory.id, {
          name: name.trim(),
          budgetAmount: parseFloat(budgetAmount) || 0,
          spendLimit: parseFloat(spendLimit) || 0,
          color,
        })
        showToast('Budget item updated')
      } else {
        categoryRepo.create(state.currentMonthKey, {
          name: name.trim(),
          budgetAmount: parseFloat(budgetAmount) || 0,
          spendLimit: parseFloat(spendLimit) || 0,
          color,
          sortOrder: 999,
        })
        showToast('Budget item added')
      }
      onClose()
    } catch {
      showToast('Failed to save budget item', 'error')
    }
  }

  return (
    <Modal open={open} onClose={onClose} title={editCategory ? 'Edit Budget Item' : 'Add Budget Item'}>
      <form onSubmit={(e) => { e.preventDefault(); handleSave() }}>
        <FormGroup label="Name" error={submitted ? nameError : ''}>
          <FormInput
            type="text"
            placeholder="e.g. Groceries"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </FormGroup>
        <div className="grid grid-cols-2 gap-4">
          <FormGroup label="Budget Amount ($)">
            <MoneyInput value={budgetAmount} onChange={setBudgetAmount} placeholder="300.00" />
          </FormGroup>
          <FormGroup label="Spend Limit ($)">
            <MoneyInput value={spendLimit} onChange={setSpendLimit} placeholder="Same as budget" />
          </FormGroup>
        </div>
        <FormGroup label="Color">
          <div className="flex gap-2 flex-wrap">
            {CATEGORY_COLORS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                className="w-7 h-7 rounded-full border-2 transition-all duration-150"
                style={{
                  background: c,
                  borderColor: color === c ? '#fff' : 'transparent',
                  outline: color === c ? `2px solid ${c}` : 'none',
                }}
              />
            ))}
          </div>
        </FormGroup>
        <div className="flex gap-2.5 mt-6">
          <Button variant="secondary" type="button" onClick={onClose} className="flex-1 !py-3">
            Cancel
          </Button>
          <Button type="submit" className="flex-1 !py-3">
            {editCategory ? 'Save Changes' : 'Add Item'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
