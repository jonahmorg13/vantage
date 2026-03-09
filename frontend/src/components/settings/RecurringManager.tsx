import { useState } from 'react'
import { useAppContext } from '../../context/AppContext'
import { useRepositories } from '../../repositories/RepositoryContext'
import { Panel } from '../ui/Panel'
import { Button } from '../ui/Button'
import { Modal, FormGroup, FormInput, FormSelect } from '../ui/Modal'
import { useCurrency } from '../../hooks/useCurrency'
import type { RecurringTransaction } from '../../types'

export function RecurringManager() {
  const format = useCurrency()
  const { state } = useAppContext()
  const { recurring: recurringRepo } = useRepositories()
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<RecurringTransaction | null>(null)

  const [name, setName] = useState('')
  const [amount, setAmount] = useState('')
  const [type, setType] = useState<'expense' | 'income'>('expense')
  const [categoryId, setCategoryId] = useState<number>(0)
  const [dayOfMonth, setDayOfMonth] = useState('1')

  const templates = state.settings.categoryTemplates

  function openModal(recurring?: RecurringTransaction) {
    if (recurring) {
      setEditing(recurring)
      setName(recurring.name)
      setAmount(recurring.amount.toString())
      setType(recurring.type)
      setCategoryId(recurring.categoryId)
      setDayOfMonth(recurring.dayOfMonth.toString())
    } else {
      setEditing(null)
      setName('')
      setAmount('')
      setType('expense')
      setCategoryId(templates[0]?.id ?? 0)
      setDayOfMonth('1')
    }
    setModalOpen(true)
  }

  function handleSave() {
    if (!name.trim() || !parseFloat(amount)) return

    if (editing) {
      recurringRepo.update(editing.id, {
        name: name.trim(),
        amount: parseFloat(amount),
        type,
        categoryId,
        dayOfMonth: parseInt(dayOfMonth) || 1,
      })
    } else {
      recurringRepo.create({
        name: name.trim(),
        amount: parseFloat(amount),
        type,
        categoryId,
        dayOfMonth: parseInt(dayOfMonth) || 1,
        isActive: true,
      })
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
                  <th className="px-6 py-3 text-left text-xs text-text3 tracking-[0.12em] uppercase border-b border-border">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs text-text3 tracking-[0.12em] uppercase border-b border-border">
                    Day
                  </th>
                  <th className="px-6 py-3 text-left text-xs text-text3 tracking-[0.12em] uppercase border-b border-border">
                    Active
                  </th>
                  <th className="px-6 py-3 border-b border-border"></th>
                </tr>
              </thead>
              <tbody>
                {state.recurringTransactions.map((r) => (
                  <tr key={r.id} className="hover:bg-accent/[0.04]">
                    <td className="px-6 py-3 text-sm border-b border-white/[0.03]">{r.name}</td>
                    <td
                      className={`px-6 py-3 text-sm border-b border-white/[0.03] ${r.type === 'income' ? 'text-accent3' : 'text-accent2'}`}
                    >
                      {r.type === 'income' ? '+' : ''}
                      {format(r.amount)}
                    </td>
                    <td className="px-6 py-3 text-sm text-text2 border-b border-white/[0.03] capitalize">
                      {r.type}
                    </td>
                    <td className="px-6 py-3 text-sm text-text2 border-b border-white/[0.03]">
                      {r.dayOfMonth}
                    </td>
                    <td className="px-6 py-3 border-b border-white/[0.03]">
                      <button
                        onClick={() => recurringRepo.update(r.id, { isActive: !r.isActive })}
                        className={`text-xs px-2.5 py-1 rounded border cursor-pointer transition-colors ${
                          r.isActive
                            ? 'text-accent3 bg-accent3/10 border-accent3/30'
                            : 'text-text3 bg-surface3 border-border'
                        }`}
                      >
                        {r.isActive ? 'ON' : 'OFF'}
                      </button>
                    </td>
                    <td className="px-6 py-3 border-b border-white/[0.03]">
                      <div className="flex gap-1.5">
                        <button
                          onClick={() => openModal(r)}
                          className="bg-transparent border-none text-text3 cursor-pointer text-sm p-1.5 px-2 rounded transition-all hover:bg-accent/15 hover:text-accent leading-none"
                        >
                          ✎
                        </button>
                        <button
                          onClick={() => recurringRepo.delete(r.id)}
                          className="bg-transparent border-none text-text3 cursor-pointer text-lg p-1 px-2 rounded transition-all hover:bg-danger/15 hover:text-danger leading-none"
                        >
                          ×
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </Panel>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Edit Recurring' : 'Add Recurring'}
      >
        <FormGroup label="Name / Description">
          <FormInput
            type="text"
            placeholder="e.g. Roth IRA"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </FormGroup>
        <div className="grid grid-cols-2 gap-4">
          <FormGroup label="Amount ($)">
            <FormInput
              type="number"
              placeholder="0.00"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </FormGroup>
          <FormGroup label="Day of Month">
            <FormInput
              type="number"
              min="1"
              max="31"
              value={dayOfMonth}
              onChange={(e) => setDayOfMonth(e.target.value)}
            />
          </FormGroup>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <FormGroup label="Type">
            <FormSelect
              value={type}
              onChange={(e) => setType(e.target.value as 'expense' | 'income')}
            >
              <option value="expense">Expense</option>
              <option value="income">Income</option>
            </FormSelect>
          </FormGroup>
          <FormGroup label="Category (Template)">
            <FormSelect value={categoryId} onChange={(e) => setCategoryId(Number(e.target.value))}>
              {templates.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </FormSelect>
          </FormGroup>
        </div>
        <div className="flex gap-3 mt-6">
          <Button variant="secondary" onClick={() => setModalOpen(false)} className="flex-1 !py-3">
            Cancel
          </Button>
          <Button onClick={handleSave} className="flex-1 !py-3">
            {editing ? 'Save Changes' : 'Add Recurring'}
          </Button>
        </div>
      </Modal>
    </>
  )
}
