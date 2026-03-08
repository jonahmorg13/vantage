import { IncomeSettings } from '../components/settings/IncomeSettings'
import { CategoryTemplates } from '../components/settings/CategoryTemplates'
import { RecurringManager } from '../components/settings/RecurringManager'

export function SettingsPage() {
  return (
    <div>
      <h1 className="font-sans text-2xl font-bold tracking-tight text-text mb-8">Settings</h1>
      <div className="flex flex-col gap-8">
        <IncomeSettings />
        <CategoryTemplates />
        <RecurringManager />
      </div>
    </div>
  )
}
