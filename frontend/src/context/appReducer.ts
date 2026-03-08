import type { AppState, Category, MonthBudget, Transaction, RecurringTransaction, CategoryTemplate } from '../types'
import { nowISO } from '../utils/format'

export type AppAction =
  | { type: 'SET_MONTH'; monthKey: string }
  | { type: 'INIT_MONTH'; monthKey: string }
  | { type: 'UPDATE_MONTH_INCOME'; monthKey: string; grossIncome: number }
  | { type: 'UPDATE_MONTH_TAX_RATE'; monthKey: string; taxRate: number }
  | { type: 'LOCK_MONTH'; monthKey: string }
  // Category actions (per-month)
  | { type: 'ADD_CATEGORY'; monthKey: string; category: Omit<Category, 'id'> }
  | { type: 'UPDATE_CATEGORY'; monthKey: string; id: number; updates: Partial<Category> }
  | { type: 'DELETE_CATEGORY'; monthKey: string; id: number }
  // Transaction actions
  | { type: 'ADD_TRANSACTION'; transaction: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'> }
  | { type: 'UPDATE_TRANSACTION'; id: number; updates: Partial<Transaction> }
  | { type: 'DELETE_TRANSACTION'; id: number }
  | { type: 'CONFIRM_TRANSACTION'; id: number }
  | { type: 'DISMISS_TRANSACTION'; id: number }
  // Recurring transaction actions
  | { type: 'ADD_RECURRING'; recurring: Omit<RecurringTransaction, 'id' | 'createdAt' | 'updatedAt'> }
  | { type: 'UPDATE_RECURRING'; id: number; updates: Partial<RecurringTransaction> }
  | { type: 'DELETE_RECURRING'; id: number }
  // Settings actions
  | { type: 'UPDATE_SETTINGS'; defaultGrossIncome?: number; defaultTaxRate?: number }
  | { type: 'ADD_TEMPLATE'; template: Omit<CategoryTemplate, 'id'> }
  | { type: 'UPDATE_TEMPLATE'; id: number; updates: Partial<CategoryTemplate> }
  | { type: 'DELETE_TEMPLATE'; id: number }
  // Bulk
  | { type: 'LOAD_STATE'; state: AppState }

export function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_MONTH':
      return { ...state, currentMonthKey: action.monthKey }

    case 'INIT_MONTH': {
      const existing = state.monthBudgets.find(m => m.monthKey === action.monthKey)
      if (existing) return state

      const now = nowISO()
      const categories: Category[] = state.settings.categoryTemplates.map((t, i) => ({
        id: state.nextIds.category + i,
        name: t.name,
        color: t.color,
        budgetAmount: t.defaultBudgetAmount,
        spendLimit: t.defaultSpendLimit,
        sortOrder: t.sortOrder,
      }))

      const newMonth: MonthBudget = {
        monthKey: action.monthKey,
        grossIncome: state.settings.defaultGrossIncome,
        taxRate: state.settings.defaultTaxRate,
        categories,
        isLocked: false,
        createdAt: now,
        updatedAt: now,
      }

      // Generate pending transactions from recurring
      const pendingTxs: Transaction[] = state.recurringTransactions
        .filter(r => r.isActive)
        .map((r, i) => ({
          id: state.nextIds.transaction + i,
          name: r.name,
          amount: r.amount,
          type: r.type,
          categoryId: r.categoryId,
          date: `${action.monthKey}-${String(r.dayOfMonth).padStart(2, '0')}`,
          monthKey: action.monthKey,
          recurringId: r.id,
          status: 'pending' as const,
          createdAt: now,
          updatedAt: now,
        }))

      return {
        ...state,
        monthBudgets: [...state.monthBudgets, newMonth],
        transactions: [...state.transactions, ...pendingTxs],
        nextIds: {
          ...state.nextIds,
          category: state.nextIds.category + categories.length,
          transaction: state.nextIds.transaction + pendingTxs.length,
        },
      }
    }

    case 'UPDATE_MONTH_INCOME':
      return {
        ...state,
        monthBudgets: state.monthBudgets.map(m =>
          m.monthKey === action.monthKey
            ? { ...m, grossIncome: action.grossIncome, updatedAt: nowISO() }
            : m
        ),
      }

    case 'UPDATE_MONTH_TAX_RATE':
      return {
        ...state,
        monthBudgets: state.monthBudgets.map(m =>
          m.monthKey === action.monthKey
            ? { ...m, taxRate: action.taxRate, updatedAt: nowISO() }
            : m
        ),
      }

    case 'LOCK_MONTH':
      return {
        ...state,
        monthBudgets: state.monthBudgets.map(m =>
          m.monthKey === action.monthKey
            ? { ...m, isLocked: true, updatedAt: nowISO() }
            : m
        ),
      }

    case 'ADD_CATEGORY': {
      const newId = state.nextIds.category
      return {
        ...state,
        monthBudgets: state.monthBudgets.map(m =>
          m.monthKey === action.monthKey
            ? {
                ...m,
                categories: [...m.categories, { ...action.category, id: newId }],
                updatedAt: nowISO(),
              }
            : m
        ),
        nextIds: { ...state.nextIds, category: newId + 1 },
      }
    }

    case 'UPDATE_CATEGORY':
      return {
        ...state,
        monthBudgets: state.monthBudgets.map(m =>
          m.monthKey === action.monthKey
            ? {
                ...m,
                categories: m.categories.map(c =>
                  c.id === action.id ? { ...c, ...action.updates } : c
                ),
                updatedAt: nowISO(),
              }
            : m
        ),
      }

    case 'DELETE_CATEGORY':
      return {
        ...state,
        monthBudgets: state.monthBudgets.map(m =>
          m.monthKey === action.monthKey
            ? {
                ...m,
                categories: m.categories.filter(c => c.id !== action.id),
                updatedAt: nowISO(),
              }
            : m
        ),
        transactions: state.transactions.filter(
          t => !(t.monthKey === action.monthKey && t.categoryId === action.id)
        ),
      }

    case 'ADD_TRANSACTION': {
      const newId = state.nextIds.transaction
      const now = nowISO()
      return {
        ...state,
        transactions: [
          ...state.transactions,
          { ...action.transaction, id: newId, createdAt: now, updatedAt: now },
        ],
        nextIds: { ...state.nextIds, transaction: newId + 1 },
      }
    }

    case 'UPDATE_TRANSACTION':
      return {
        ...state,
        transactions: state.transactions.map(t =>
          t.id === action.id ? { ...t, ...action.updates, updatedAt: nowISO() } : t
        ),
      }

    case 'DELETE_TRANSACTION':
      return {
        ...state,
        transactions: state.transactions.filter(t => t.id !== action.id),
      }

    case 'CONFIRM_TRANSACTION':
      return {
        ...state,
        transactions: state.transactions.map(t =>
          t.id === action.id ? { ...t, status: 'confirmed' as const, updatedAt: nowISO() } : t
        ),
      }

    case 'DISMISS_TRANSACTION':
      return {
        ...state,
        transactions: state.transactions.filter(t => t.id !== action.id),
      }

    case 'ADD_RECURRING': {
      const newId = state.nextIds.recurringTransaction
      const now = nowISO()
      return {
        ...state,
        recurringTransactions: [
          ...state.recurringTransactions,
          { ...action.recurring, id: newId, createdAt: now, updatedAt: now },
        ],
        nextIds: { ...state.nextIds, recurringTransaction: newId + 1 },
      }
    }

    case 'UPDATE_RECURRING':
      return {
        ...state,
        recurringTransactions: state.recurringTransactions.map(r =>
          r.id === action.id ? { ...r, ...action.updates, updatedAt: nowISO() } : r
        ),
      }

    case 'DELETE_RECURRING':
      return {
        ...state,
        recurringTransactions: state.recurringTransactions.filter(r => r.id !== action.id),
      }

    case 'UPDATE_SETTINGS':
      return {
        ...state,
        settings: {
          ...state.settings,
          ...(action.defaultGrossIncome !== undefined && { defaultGrossIncome: action.defaultGrossIncome }),
          ...(action.defaultTaxRate !== undefined && { defaultTaxRate: action.defaultTaxRate }),
        },
      }

    case 'ADD_TEMPLATE': {
      const newId = state.nextIds.categoryTemplate
      return {
        ...state,
        settings: {
          ...state.settings,
          categoryTemplates: [
            ...state.settings.categoryTemplates,
            { ...action.template, id: newId },
          ],
        },
        nextIds: { ...state.nextIds, categoryTemplate: newId + 1 },
      }
    }

    case 'UPDATE_TEMPLATE':
      return {
        ...state,
        settings: {
          ...state.settings,
          categoryTemplates: state.settings.categoryTemplates.map(t =>
            t.id === action.id ? { ...t, ...action.updates } : t
          ),
        },
      }

    case 'DELETE_TEMPLATE':
      return {
        ...state,
        settings: {
          ...state.settings,
          categoryTemplates: state.settings.categoryTemplates.filter(t => t.id !== action.id),
        },
      }

    case 'LOAD_STATE':
      return action.state

    default:
      return state
  }
}
