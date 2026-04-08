import type {
  Transaction,
  Account,
  Category,
  CategoryTemplate,
  MonthBudget,
  RecurringTransaction,
} from '../types'

export interface TransactionFilters {
  monthKey?: string
  categoryId?: number
  type?: 'expense' | 'income' | 'transfer'
  status?: 'confirmed' | 'pending'
  search?: string
  dateFrom?: string
  dateTo?: string
}

export interface ITransactionRepository {
  getAll(filters?: TransactionFilters): Promise<Transaction[]>
  create(data: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>): Promise<Transaction>
  update(id: number, data: Partial<Transaction>): Promise<Transaction>
  delete(id: number): Promise<void>
  confirm(id: number): Promise<void>
  dismiss(id: number): Promise<void>
}

export interface IMonthRepository {
  get(monthKey: string): Promise<MonthBudget | null>
  init(monthKey: string): Promise<MonthBudget>
  updateIncome(monthKey: string, takeHomePay: number): Promise<void>
  lock(monthKey: string): Promise<void>
}

export interface ICategoryRepository {
  create(monthKey: string, data: Omit<Category, 'id'>): Promise<Category>
  update(monthKey: string, id: number, data: Partial<Category>): Promise<void>
  delete(monthKey: string, id: number): Promise<void>
}

export interface IAccountRepository {
  create(data: Omit<Account, 'id' | 'createdAt' | 'updatedAt'>): Promise<Account>
  update(id: number, data: Partial<Account>): Promise<void>
  delete(id: number): Promise<void>
}

export interface IRecurringRepository {
  create(
    data: Omit<RecurringTransaction, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<RecurringTransaction>
  update(id: number, data: Partial<RecurringTransaction>): Promise<void>
  delete(id: number): Promise<void>
}

export interface ISettingsRepository {
  updateIncome(takeHomePay: number): Promise<void>
  updateCurrencySymbol(symbol: string): Promise<void>
  createTemplate(data: Omit<CategoryTemplate, 'id'>): Promise<CategoryTemplate>
  updateTemplate(id: number, data: Partial<CategoryTemplate>): Promise<void>
  deleteTemplate(id: number): Promise<void>
  replaceTemplates(templates: Omit<CategoryTemplate, 'id'>[]): Promise<void>
}

export interface Repositories {
  transactions: ITransactionRepository
  months: IMonthRepository
  categories: ICategoryRepository
  accounts: IAccountRepository
  recurring: IRecurringRepository
  settings: ISettingsRepository
  apiClient: import('./api/ApiClient').ApiClient
}
