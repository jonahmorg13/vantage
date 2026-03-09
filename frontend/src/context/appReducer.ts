import type {
  AppState,
  Category,
  MonthBudget,
  Transaction,
  RecurringTransaction,
  CategoryTemplate,
  Account,
} from '../types'
import { nowISO } from '../utils/format'

export type AppAction =
  | { type: 'SET_MONTH'; monthKey: string }
  | { type: 'INIT_MONTH'; monthKey: string }
  | { type: 'UPDATE_MONTH_INCOME'; monthKey: string; takeHomePay: number }
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
  | {
      type: 'ADD_RECURRING'
      recurring: Omit<RecurringTransaction, 'id' | 'createdAt' | 'updatedAt'>
    }
  | { type: 'UPDATE_RECURRING'; id: number; updates: Partial<RecurringTransaction> }
  | { type: 'DELETE_RECURRING'; id: number }
  // Settings actions
  | { type: 'UPDATE_SETTINGS'; defaultTakeHomePay?: number; currencySymbol?: string }
  | { type: 'ADD_TEMPLATE'; template: Omit<CategoryTemplate, 'id'> }
  | { type: 'UPDATE_TEMPLATE'; id: number; updates: Partial<CategoryTemplate> }
  | { type: 'DELETE_TEMPLATE'; id: number }
  | { type: 'REPLACE_TEMPLATES'; templates: Omit<CategoryTemplate, 'id'>[] }
  // Account actions
  | { type: 'ADD_ACCOUNT'; account: Omit<Account, 'id' | 'createdAt' | 'updatedAt'> }
  | { type: 'UPDATE_ACCOUNT'; id: number; updates: Partial<Account> }
  | { type: 'DELETE_ACCOUNT'; id: number }
  // Bulk
  | { type: 'LOAD_STATE'; state: AppState }

export function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_MONTH':
      return { ...state, currentMonthKey: action.monthKey }

    case 'INIT_MONTH': {
      const existing = state.monthBudgets.find((m) => m.monthKey === action.monthKey)
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
        takeHomePay: state.settings.defaultTakeHomePay,
        categories,
        isLocked: false,
        createdAt: now,
        updatedAt: now,
      }

      // Generate pending transactions from recurring
      const pendingTxs: Transaction[] = state.recurringTransactions
        .filter((r) => r.isActive)
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
        monthBudgets: state.monthBudgets.map((m) =>
          m.monthKey === action.monthKey
            ? { ...m, takeHomePay: action.takeHomePay, updatedAt: nowISO() }
            : m
        ),
      }

    case 'LOCK_MONTH':
      return {
        ...state,
        monthBudgets: state.monthBudgets.map((m) =>
          m.monthKey === action.monthKey ? { ...m, isLocked: true, updatedAt: nowISO() } : m
        ),
      }

    case 'ADD_CATEGORY': {
      const newId = state.nextIds.category
      return {
        ...state,
        monthBudgets: state.monthBudgets.map((m) =>
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
        monthBudgets: state.monthBudgets.map((m) =>
          m.monthKey === action.monthKey
            ? {
                ...m,
                categories: m.categories.map((c) =>
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
        monthBudgets: state.monthBudgets.map((m) =>
          m.monthKey === action.monthKey
            ? {
                ...m,
                categories: m.categories.filter((c) => c.id !== action.id),
                updatedAt: nowISO(),
              }
            : m
        ),
        transactions: state.transactions.filter(
          (t) => !(t.monthKey === action.monthKey && t.categoryId === action.id)
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
        transactions: state.transactions.map((t) =>
          t.id === action.id ? { ...t, ...action.updates, updatedAt: nowISO() } : t
        ),
      }

    case 'DELETE_TRANSACTION':
      return {
        ...state,
        transactions: state.transactions.filter((t) => t.id !== action.id),
      }

    case 'CONFIRM_TRANSACTION':
      return {
        ...state,
        transactions: state.transactions.map((t) =>
          t.id === action.id ? { ...t, status: 'confirmed' as const, updatedAt: nowISO() } : t
        ),
      }

    case 'DISMISS_TRANSACTION':
      return {
        ...state,
        transactions: state.transactions.filter((t) => t.id !== action.id),
      }

    case 'ADD_RECURRING': {
      const newId = state.nextIds.recurringTransaction
      const now = nowISO()
      const newRecurring: RecurringTransaction = {
        ...action.recurring,
        id: newId,
        createdAt: now,
        updatedAt: now,
      }

      // If active, generate a pending transaction for the current month immediately
      const pendingTx: Transaction | null = newRecurring.isActive
        ? {
            id: state.nextIds.transaction,
            name: newRecurring.name,
            amount: newRecurring.amount,
            type: newRecurring.type,
            categoryId: newRecurring.categoryId,
            date: `${state.currentMonthKey}-${String(newRecurring.dayOfMonth).padStart(2, '0')}`,
            monthKey: state.currentMonthKey,
            recurringId: newId,
            status: 'pending' as const,
            createdAt: now,
            updatedAt: now,
          }
        : null

      return {
        ...state,
        recurringTransactions: [...state.recurringTransactions, newRecurring],
        transactions: pendingTx ? [...state.transactions, pendingTx] : state.transactions,
        nextIds: {
          ...state.nextIds,
          recurringTransaction: newId + 1,
          transaction: pendingTx ? state.nextIds.transaction + 1 : state.nextIds.transaction,
        },
      }
    }

    case 'UPDATE_RECURRING':
      return {
        ...state,
        recurringTransactions: state.recurringTransactions.map((r) =>
          r.id === action.id ? { ...r, ...action.updates, updatedAt: nowISO() } : r
        ),
      }

    case 'DELETE_RECURRING':
      return {
        ...state,
        recurringTransactions: state.recurringTransactions.filter((r) => r.id !== action.id),
      }

    case 'UPDATE_SETTINGS':
      return {
        ...state,
        settings: {
          ...state.settings,
          ...(action.defaultTakeHomePay !== undefined && {
            defaultTakeHomePay: action.defaultTakeHomePay,
          }),
          ...(action.currencySymbol !== undefined && { currencySymbol: action.currencySymbol }),
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
          categoryTemplates: state.settings.categoryTemplates.map((t) =>
            t.id === action.id ? { ...t, ...action.updates } : t
          ),
        },
      }

    case 'DELETE_TEMPLATE':
      return {
        ...state,
        settings: {
          ...state.settings,
          categoryTemplates: state.settings.categoryTemplates.filter((t) => t.id !== action.id),
        },
      }

    case 'REPLACE_TEMPLATES': {
      const startId = state.nextIds.categoryTemplate
      const newTemplates = action.templates.map((t, i) => ({ ...t, id: startId + i }))
      return {
        ...state,
        settings: { ...state.settings, categoryTemplates: newTemplates },
        nextIds: { ...state.nextIds, categoryTemplate: startId + newTemplates.length },
      }
    }

    case 'ADD_ACCOUNT': {
      const newId = state.nextIds.account
      const now = nowISO()
      return {
        ...state,
        accounts: [
          ...state.accounts,
          { ...action.account, id: newId, createdAt: now, updatedAt: now },
        ],
        nextIds: { ...state.nextIds, account: newId + 1 },
      }
    }

    case 'UPDATE_ACCOUNT':
      return {
        ...state,
        accounts: state.accounts.map((a) =>
          a.id === action.id ? { ...a, ...action.updates, updatedAt: nowISO() } : a
        ),
      }

    case 'DELETE_ACCOUNT':
      return {
        ...state,
        accounts: state.accounts.filter((a) => a.id !== action.id),
        // Nullify account references on transactions when account is deleted
        transactions: state.transactions.map((t) => {
          const updates: Partial<Transaction> = {}
          if (t.accountId === action.id) updates.accountId = undefined
          if (t.toAccountId === action.id) updates.toAccountId = undefined
          return Object.keys(updates).length > 0 ? { ...t, ...updates } : t
        }),
      }

    case 'LOAD_STATE':
      return action.state

    default:
      return state
  }
}
