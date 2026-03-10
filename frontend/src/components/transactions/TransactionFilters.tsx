import { useCurrentMonth } from '../../hooks/useMonthBudget'
import { FormInput, FormSelect } from '../ui/Modal'

interface TransactionFiltersProps {
  search: string
  onSearchChange: (v: string) => void
  categoryFilter: number | undefined
  onCategoryFilterChange: (v: number | undefined) => void
  typeFilter: 'expense' | 'income' | undefined
  onTypeFilterChange: (v: 'expense' | 'income' | undefined) => void
}

export function TransactionFilters({
  search,
  onSearchChange,
  categoryFilter,
  onCategoryFilterChange,
  typeFilter,
  onTypeFilterChange,
}: TransactionFiltersProps) {
  const month = useCurrentMonth()

  return (
    <div className="flex gap-3 sm:gap-4 px-4 sm:px-6 py-4 sm:py-5 border-b border-border flex-wrap">
      <FormInput
        type="text"
        placeholder="Search transactions..."
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        className="!w-full sm:!w-64"
      />
      <FormSelect
        value={categoryFilter ?? ''}
        onChange={(e) =>
          onCategoryFilterChange(e.target.value ? Number(e.target.value) : undefined)
        }
        className="!w-[calc(50%-6px)] sm:!w-52"
      >
        <option value="">All Budget Items</option>
        {month?.categories.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name}
          </option>
        ))}
      </FormSelect>
      <FormSelect
        value={typeFilter ?? ''}
        onChange={(e) =>
          onTypeFilterChange((e.target.value as 'expense' | 'income' | undefined) || undefined)
        }
        className="!w-[calc(50%-6px)] sm:!w-40"
      >
        <option value="">All Types</option>
        <option value="expense">Expenses</option>
        <option value="income">Income</option>
      </FormSelect>
    </div>
  )
}
