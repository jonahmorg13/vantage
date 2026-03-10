import { useState } from 'react'
import { useAppContext } from '../../context/AppContext'
import { useRepositories } from '../../repositories/RepositoryContext'
import { Panel } from '../ui/Panel'
import { Button } from '../ui/Button'
import { Modal, FormGroup, FormInput } from '../ui/Modal'
import { formatMonthDisplay } from '../../utils/format'
import { useCurrency } from '../../hooks/useCurrency'
import type { CategoryTemplate } from '../../types'

export function CategoryTemplates() {
  const format = useCurrency()
  const { state } = useAppContext()
  const { settings: settingsRepo } = useRepositories()
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<CategoryTemplate | null>(null)
  const [copyModalOpen, setCopyModalOpen] = useState(false)
  const [selectedMonthKey, setSelectedMonthKey] = useState('')

  const [name, setName] = useState('')
  const [budget, setBudget] = useState('')
  const [limit, setLimit] = useState('')
  const [color, setColor] = useState('#7c6dfa')
  const [submitted, setSubmitted] = useState(false)

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
      setColor(
        '#' +
          Math.floor(Math.random() * 0xffffff)
            .toString(16)
            .padStart(6, '0')
      )
    }
    setSubmitted(false)
    setModalOpen(true)
  }

  const nameError = !name.trim() ? 'Name is required' : ''

  function handleSave() {
    setSubmitted(true)
    if (nameError) return
    if (editing) {
      settingsRepo.updateTemplate(editing.id, {
        name: name.trim(),
        defaultBudgetAmount: parseFloat(budget) || 0,
        defaultSpendLimit: parseFloat(limit) || 0,
        color,
      })
    } else {
      settingsRepo.createTemplate({
        name: name.trim(),
        defaultBudgetAmount: parseFloat(budget) || 0,
        defaultSpendLimit: parseFloat(limit) || 0,
        color,
        sortOrder: state.settings.categoryTemplates.length,
      })
    }
    setModalOpen(false)
  }

  function openCopyModal() {
    const sorted = [...state.monthBudgets].sort((a, b) => b.monthKey.localeCompare(a.monthKey))
    setSelectedMonthKey(sorted[0]?.monthKey ?? '')
    setCopyModalOpen(true)
  }

  function handleCopyFromMonth() {
    const month = state.monthBudgets.find((m) => m.monthKey === selectedMonthKey)
    if (!month) return
    settingsRepo.replaceTemplates(
      month.categories.map((c, i) => ({
        name: c.name,
        color: c.color,
        defaultBudgetAmount: c.budgetAmount,
        defaultSpendLimit: c.spendLimit,
        sortOrder: i,
      }))
    )
    setCopyModalOpen(false)
  }

  const sortedMonths = [...state.monthBudgets].sort((a, b) => b.monthKey.localeCompare(a.monthKey))
  const previewMonth = state.monthBudgets.find((m) => m.monthKey === selectedMonthKey)

  return (
    <>
      <Panel
        title="Budget Templates"
        action={
          <div className="flex gap-2">
            {state.monthBudgets.length > 0 && (
              <Button variant="secondary" onClick={openCopyModal}>
                Copy from Month
              </Button>
            )}
            <Button onClick={() => openModal()}>+ Add Template</Button>
          </div>
        }
      >
        <div className="overflow-auto">
          <p className="text-xs text-text3 px-6 py-4">
            These templates are used when starting a new month. Changes here only affect future
            months or months you haven't visited before.
          </p>

          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="px-6 py-3 text-left text-xs text-text3 tracking-[0.12em] uppercase border-b border-border">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs text-text3 tracking-[0.12em] uppercase border-b border-border">
                  Default Budget
                </th>
                <th className="px-6 py-3 text-left text-xs text-text3 tracking-[0.12em] uppercase border-b border-border">
                  Default Limit
                </th>
                <th className="px-6 py-3 border-b border-border"></th>
              </tr>
            </thead>
            <tbody>
              {state.settings.categoryTemplates.map((t) => (
                <tr key={t.id} className="hover:bg-accent/[0.04]">
                  <td className="px-6 py-3 text-sm border-b border-white/[0.03]">
                    <div className="flex items-center gap-2.5">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ background: t.color }} />
                      {t.name}
                    </div>
                  </td>
                  <td className="px-6 py-3 text-sm text-text2 border-b border-white/[0.03]">
                    {format(t.defaultBudgetAmount)}
                  </td>
                  <td className="px-6 py-3 text-sm text-text2 border-b border-white/[0.03]">
                    {t.defaultSpendLimit > 0 ? format(t.defaultSpendLimit) : '—'}
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
                        onClick={() => settingsRepo.deleteTemplate(t.id)}
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

      {/* Edit / Add template modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Edit Budget Template' : 'Add Budget Template'}
      >
        <FormGroup label="Name" error={submitted ? nameError : ''}>
          <FormInput
            type="text"
            placeholder="e.g. Groceries"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </FormGroup>
        <div className="grid grid-cols-2 gap-4">
          <FormGroup label="Default Budget ($)">
            <FormInput
              type="number"
              placeholder="300.00"
              step="0.01"
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
            />
          </FormGroup>
          <FormGroup label="Default Spend Limit ($)">
            <FormInput
              type="number"
              placeholder="Same as budget"
              step="0.01"
              value={limit}
              onChange={(e) => setLimit(e.target.value)}
            />
          </FormGroup>
        </div>
        <FormGroup label="Color">
          <FormInput
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            className="!h-[42px] cursor-pointer"
          />
        </FormGroup>
        <div className="flex gap-3 mt-6">
          <Button variant="secondary" onClick={() => setModalOpen(false)} className="flex-1 !py-3">
            Cancel
          </Button>
          <Button onClick={handleSave} className="flex-1 !py-3">
            {editing ? 'Save Changes' : 'Add Template'}
          </Button>
        </div>
      </Modal>

      {/* Copy from month modal */}
      <Modal open={copyModalOpen} onClose={() => setCopyModalOpen(false)} title="Copy from Month">
        <p className="text-sm text-text3 mb-5">
          Replace all current budget templates with the items from a past month.
        </p>
        <FormGroup label="Month">
          <select
            value={selectedMonthKey}
            onChange={(e) => setSelectedMonthKey(e.target.value)}
            className="w-full bg-surface2 border border-border text-text text-sm pl-4 pr-10 py-2.5 rounded-lg focus:outline-none focus:border-accent appearance-none"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23888' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'right 14px center',
            }}
          >
            {sortedMonths.map((m) => (
              <option key={m.monthKey} value={m.monthKey}>
                {formatMonthDisplay(m.monthKey)}
              </option>
            ))}
          </select>
        </FormGroup>

        {/* Preview */}
        {previewMonth && previewMonth.categories.length > 0 && (
          <div className="mt-4">
            <div className="text-xs text-text3 uppercase tracking-[0.1em] mb-2">
              Preview — {previewMonth.categories.length} items
            </div>
            <div className="flex flex-col gap-1.5 max-h-52 overflow-y-auto">
              {previewMonth.categories.map((c) => (
                <div
                  key={c.id}
                  className="flex items-center gap-3 bg-surface2 rounded-lg px-3 py-2 text-sm"
                >
                  <div className="w-2 h-2 rounded-full shrink-0" style={{ background: c.color }} />
                  <span className="text-text2 flex-1">{c.name}</span>
                  <span className="text-text3 font-mono text-xs">{format(c.budgetAmount)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex gap-3 mt-6">
          <Button
            variant="secondary"
            onClick={() => setCopyModalOpen(false)}
            className="flex-1 !py-3"
          >
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={handleCopyFromMonth}
            className="flex-1 !py-3"
            disabled={!selectedMonthKey}
          >
            Replace Templates
          </Button>
        </div>
      </Modal>
    </>
  )
}
