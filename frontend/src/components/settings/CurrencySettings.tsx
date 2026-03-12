import { useState, useEffect } from 'react'
import { useAppContext } from '../../context/AppContext'
import { useRepositories } from '../../repositories/RepositoryContext'
import { useToast } from '../ui/Toast'
import { Panel } from '../ui/Panel'
import { FormGroup, FormInput } from '../ui/Modal'
import { Button } from '../ui/Button'

const COMMON_SYMBOLS = ['$', '€', '£', '¥', '₹', '₩', '₪', 'Fr', 'kr']

export function CurrencySettings() {
  const { state } = useAppContext()
  const { settings: settingsRepo } = useRepositories()
  const { showToast } = useToast()
  const [symbol, setSymbol] = useState(state.settings.currencySymbol ?? '$')

  useEffect(() => {
    setSymbol(state.settings.currencySymbol ?? '$')
  }, [state.settings.currencySymbol])

  const hasChanged = symbol !== (state.settings.currencySymbol ?? '$')

  function save() {
    settingsRepo.updateCurrencySymbol(symbol.trim() || '$')
    showToast('Currency symbol updated')
  }

  return (
    <Panel title="Currency">
      <div className="p-6">
        <div className="max-w-xs">
          <FormGroup label="Currency Symbol">
            <div className="flex gap-2">
              <FormInput
                type="text"
                value={symbol}
                onChange={(e) => setSymbol(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter' && hasChanged) save() }}
                maxLength={4}
                className="w-20 text-center"
              />
              {hasChanged && (
                <Button onClick={save} className="flex-1">
                  Save
                </Button>
              )}
            </div>
          </FormGroup>
          <div className="flex flex-wrap gap-2 mt-2">
            {COMMON_SYMBOLS.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setSymbol(s)}
                className={`px-3 py-1.5 rounded-lg text-sm font-mono border transition-all duration-150 ${
                  symbol === s
                    ? 'bg-accent/15 border-accent text-accent'
                    : 'bg-surface2 border-border text-text2 hover:border-accent/50'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
        <p className="text-xs text-text3 mt-4">
          Displayed in front of all monetary values throughout the app.
        </p>
      </div>
    </Panel>
  )
}
