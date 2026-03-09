import { useState, useEffect } from 'react'
import { useAppContext } from '../../context/AppContext'
import { useRepositories } from '../../repositories/RepositoryContext'
import { Panel } from '../ui/Panel'
import { FormGroup, MoneyInput } from '../ui/Modal'

export function IncomeSettings() {
  const { state } = useAppContext()
  const { settings: settingsRepo } = useRepositories()
  const [value, setValue] = useState(state.settings.defaultTakeHomePay.toFixed(2))

  useEffect(() => {
    setValue(state.settings.defaultTakeHomePay.toFixed(2))
  }, [state.settings.defaultTakeHomePay])

  return (
    <Panel title="Default Income">
      <div className="p-6">
        <div className="max-w-xs">
          <FormGroup label="Default Take-Home Pay">
            <MoneyInput
              value={value}
              onChange={setValue}
              onBlur={() => settingsRepo.updateIncome(parseFloat(value) || 0)}
            />
          </FormGroup>
        </div>
        <p className="text-xs text-text3 mt-4">
          Used as the default monthly take-home pay when starting new months. Changes here do not
          affect existing months.
        </p>
      </div>
    </Panel>
  )
}
