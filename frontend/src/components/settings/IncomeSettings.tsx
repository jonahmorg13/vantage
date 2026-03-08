import { useAppContext } from '../../context/AppContext'
import { Panel } from '../ui/Panel'
import { FormGroup, FormInput } from '../ui/Modal'

export function IncomeSettings() {
  const { state, dispatch } = useAppContext()

  return (
    <Panel title="Default Income & Tax">
      <div className="p-6">
        <div className="grid grid-cols-2 gap-5 max-w-lg">
          <FormGroup label="Default Gross Income">
            <FormInput
              type="number"
              step="0.01"
              value={state.settings.defaultGrossIncome}
              onChange={e => dispatch({
                type: 'UPDATE_SETTINGS',
                defaultGrossIncome: parseFloat(e.target.value) || 0,
              })}
            />
          </FormGroup>
          <FormGroup label="Default Tax Rate">
            <FormInput
              type="number"
              step="0.001"
              min="0"
              max="1"
              value={state.settings.defaultTaxRate}
              onChange={e => dispatch({
                type: 'UPDATE_SETTINGS',
                defaultTaxRate: parseFloat(e.target.value) || 0,
              })}
            />
          </FormGroup>
        </div>
        <p className="text-xs text-text3 mt-4">
          These values are used as defaults when creating new months. Changes here do not affect existing months.
        </p>
      </div>
    </Panel>
  )
}
