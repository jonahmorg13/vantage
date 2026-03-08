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
  type: 'expense' | 'income'
  categoryId: number
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
  dayOfMonth: number
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface MonthBudget {
  monthKey: string
  grossIncome: number
  taxRate: number
  categories: Category[]
  isLocked: boolean
  createdAt: string
  updatedAt: string
}

export interface AppSettings {
  defaultGrossIncome: number
  defaultTaxRate: number
  categoryTemplates: CategoryTemplate[]
}

export interface AppState {
  settings: AppSettings
  monthBudgets: MonthBudget[]
  transactions: Transaction[]
  recurringTransactions: RecurringTransaction[]
  currentMonthKey: string
  nextIds: {
    category: number
    categoryTemplate: number
    transaction: number
    recurringTransaction: number
  }
}
