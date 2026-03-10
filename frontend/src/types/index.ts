export interface Category {
  id: number
  name: string
  color: string
  budgetAmount: number
  spendLimit: number
  sortOrder: number
}

export interface CategoryTemplate {
  id: number
  name: string
  color: string
  defaultBudgetAmount: number
  defaultSpendLimit: number
  sortOrder: number
}

export interface Transaction {
  id: number
  name: string
  amount: number
  type: 'expense' | 'income' | 'transfer'
  categoryId?: number
  accountId?: number // account money goes INTO (for expense/income) or FROM (for transfer)
  toAccountId?: number // transfer destination account
  date: string
  monthKey: string
  recurringId?: number
  status: 'confirmed' | 'pending'
  createdAt: string
  updatedAt: string
}

export interface RecurringTransaction {
  id: number
  name: string
  amount: number
  type: 'expense' | 'income'
  categoryId: number
  accountId?: number
  dayOfMonth: number
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface Account {
  id: number
  name: string
  color: string
  accountType: 'checking' | 'savings' | 'brokerage' | '401k' | 'ira' | 'roth_ira' | 'hsa' | 'other'
  initialBalance: number
  isDefault?: boolean
  createdAt: string
  updatedAt: string
}

export interface MonthBudget {
  monthKey: string
  takeHomePay: number
  categories: Category[]
  isLocked: boolean
  createdAt: string
  updatedAt: string
}

export interface AppSettings {
  defaultTakeHomePay: number
  currencySymbol: string
  categoryTemplates: CategoryTemplate[]
}

export interface AppState {
  settings: AppSettings
  monthBudgets: MonthBudget[]
  transactions: Transaction[]
  recurringTransactions: RecurringTransaction[]
  accounts: Account[]
  currentMonthKey: string
  nextIds: {
    category: number
    categoryTemplate: number
    transaction: number
    recurringTransaction: number
    account: number
  }
}
