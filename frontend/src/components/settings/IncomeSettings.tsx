import { useState, useEffect } from 'react'
import { useAppContext } from '../../context/AppContext'
import { useRepositories } from '../../repositories/RepositoryContext'
import { Panel } from '../ui/Panel'
import { Button } from '../ui/Button'
import { FormGroup, MoneyInput } from '../ui/Modal'

export function IncomeSettings() {
  const { state } = useAppContext()
  const { settings: settingsRepo } = useRepositories()
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
  }

  return (
    <Panel title="Default Monthly Budget">
      <div className="p-6">
        <FormGroup label="Default Monthly Budget">
          <div className="flex items-center gap-3 max-w-xs">
            <MoneyInput value={value} onChange={setValue} onKeyDown={(e) => { if (e.key === 'Enter' && value !== savedValue) handleSave() }} />
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
