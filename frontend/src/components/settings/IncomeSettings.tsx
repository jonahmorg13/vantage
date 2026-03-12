import { useState, useEffect } from 'react'
import { useAppContext } from '../../context/AppContext'
import { useRepositories } from '../../repositories/RepositoryContext'
import { useToast } from '../ui/Toast'
import { Panel } from '../ui/Panel'
import { Button } from '../ui/Button'
import { FormGroup, MoneyInput } from '../ui/Modal'

export function IncomeSettings() {
  const { state } = useAppContext()
  const { settings: settingsRepo } = useRepositories()
  const { showToast } = useToast()
  const currencySymbol = state.settings.currencySymbol ?? '$'
  const initial = state.settings.defaultTakeHomePay.toFixed(2)
  const [value, setValue] = useState(initial)
  const [savedValue, setSavedValue] = useState(initial)

  useEffect(() => {
    const v = state.settings.defaultTakeHomePay.toFixed(2)
    setValue(v)
    setSavedValue(v)
  }, [state.settings.defaultTakeHomePay])

  function handleSave() {
    settingsRepo.updateIncome(parseFloat(value) || 0)
    setSavedValue(value)
    showToast('Default monthly budget saved')
  }

  return (
    <Panel title="Default Monthly Budget">
      <div className="p-6">
        <FormGroup label="Default Monthly Budget">
          <div className="flex items-center gap-3 max-w-xs">
            <div className="relative flex-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-text3 font-mono pointer-events-none">
                {currencySymbol}
              </span>
              <MoneyInput value={value} onChange={setValue} onKeyDown={(e) => { if (e.key === 'Enter' && value !== savedValue) handleSave() }} className="pl-8" />
            </div>
            {value !== savedValue && <Button onClick={handleSave}>Save</Button>}
          </div>
        </FormGroup>
        <p className="text-xs text-text3 mt-1">
          Used as the default monthly budget when starting new months. Changes here do not affect
          existing months.
        </p>
      </div>
    </Panel>
  )
}
