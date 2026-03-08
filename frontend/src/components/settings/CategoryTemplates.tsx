import { useState } from 'react'
import { useAppContext } from '../../context/AppContext'
import { Panel } from '../ui/Panel'
import { Button } from '../ui/Button'
import { Modal, FormGroup, FormInput } from '../ui/Modal'
import { formatCurrency } from '../../utils/format'
import type { CategoryTemplate } from '../../types'

export function CategoryTemplates() {
  const { state, dispatch } = useAppContext()
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<CategoryTemplate | null>(null)

  const [name, setName] = useState('')
  const [budget, setBudget] = useState('')
  const [limit, setLimit] = useState('')
  const [color, setColor] = useState('#7c6dfa')

  function openModal(template?: CategoryTemplate) {
    if (template) {
      setEditing(template)
      setName(template.name)
      setBudget(template.defaultBudgetAmount.toString())
      setLimit(template.defaultSpendLimit > 0 ? template.defaultSpendLimit.toString() : '')
      setColor(template.color)
    } else {
      setEditing(null)
      setName('')
      setBudget('')
      setLimit('')
      setColor('#' + Math.floor(Math.random() * 0xffffff).toString(16).padStart(6, '0'))
    }
    setModalOpen(true)
  }

  function handleSave() {
    if (!name.trim()) return

    if (editing) {
      dispatch({
        type: 'UPDATE_TEMPLATE',
        id: editing.id,
        updates: {
          name: name.trim(),
          defaultBudgetAmount: parseFloat(budget) || 0,
          defaultSpendLimit: parseFloat(limit) || 0,
          color,
        },
      })
    } else {
      dispatch({
        type: 'ADD_TEMPLATE',
        template: {
          name: name.trim(),
          defaultBudgetAmount: parseFloat(budget) || 0,
          defaultSpendLimit: parseFloat(limit) || 0,
          color,
          sortOrder: state.settings.categoryTemplates.length,
        },
      })
    }
    setModalOpen(false)
  }

  return (
    <>
      <Panel
        title="Category Templates"
        action={<Button onClick={() => openModal()}>+ Add Template</Button>}
      >
        <div>
          <p className="text-xs text-text3 px-6 py-4">
            These templates are used when creating new months. Changes here only affect future months, not existing ones.
          </p>
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="px-6 py-3 text-left text-xs text-text3 tracking-[0.12em] uppercase border-b border-border">Name</th>
                <th className="px-6 py-3 text-left text-xs text-text3 tracking-[0.12em] uppercase border-b border-border">Default Budget</th>
                <th className="px-6 py-3 text-left text-xs text-text3 tracking-[0.12em] uppercase border-b border-border">Default Limit</th>
                <th className="px-6 py-3 border-b border-border"></th>
              </tr>
            </thead>
            <tbody>
              {state.settings.categoryTemplates.map(t => (
                <tr key={t.id} className="hover:bg-accent/[0.04]">
                  <td className="px-6 py-3 text-sm border-b border-white/[0.03]">
                    <div className="flex items-center gap-2.5">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ background: t.color }} />
                      {t.name}
                    </div>
                  </td>
                  <td className="px-6 py-3 text-sm text-text2 border-b border-white/[0.03]">
                    {formatCurrency(t.defaultBudgetAmount)}
                  </td>
                  <td className="px-6 py-3 text-sm text-text2 border-b border-white/[0.03]">
                    {t.defaultSpendLimit > 0 ? formatCurrency(t.defaultSpendLimit) : '—'}
                  </td>
                  <td className="px-6 py-3 border-b border-white/[0.03]">
                    <div className="flex gap-1.5">
                      <button
                        onClick={() => openModal(t)}
                        className="bg-transparent border-none text-text3 cursor-pointer text-sm p-1.5 px-2 rounded transition-all hover:bg-accent/15 hover:text-accent leading-none"
                      >
                        ✎
                      </button>
                      <button
                        onClick={() => dispatch({ type: 'DELETE_TEMPLATE', id: t.id })}
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
        </div>
      </Panel>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Template' : 'Add Template'}>
        <FormGroup label="Category Name">
          <FormInput type="text" placeholder="e.g. Groceries" value={name} onChange={e => setName(e.target.value)} />
        </FormGroup>
        <div className="grid grid-cols-2 gap-4">
          <FormGroup label="Default Budget ($)">
            <FormInput type="number" placeholder="300.00" step="0.01" value={budget} onChange={e => setBudget(e.target.value)} />
          </FormGroup>
          <FormGroup label="Default Spend Limit ($)">
            <FormInput type="number" placeholder="Same as budget" step="0.01" value={limit} onChange={e => setLimit(e.target.value)} />
          </FormGroup>
        </div>
        <FormGroup label="Color">
          <FormInput type="color" value={color} onChange={e => setColor(e.target.value)} className="!h-[42px] cursor-pointer" />
        </FormGroup>
        <div className="flex gap-3 mt-6">
          <Button variant="secondary" onClick={() => setModalOpen(false)} className="flex-1 !py-3">Cancel</Button>
          <Button onClick={handleSave} className="flex-1 !py-3">{editing ? 'Save Changes' : 'Add Template'}</Button>
        </div>
      </Modal>
    </>
  )
}
