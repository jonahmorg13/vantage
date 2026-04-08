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
  | { type: 'UPDATE_MONTH_INCOME'; monthKey: string; takeHomePay: number }
  | { type: 'LOCK_MONTH'; monthKey: string }
  // Category actions (per-month)
  | { type: 'ADD_CATEGORY'; monthKey: string; category: Category }
  | { type: 'UPDATE_CATEGORY'; monthKey: string; id: number; updates: Partial<Category> }
  | { type: 'DELETE_CATEGORY'; monthKey: string; id: number }
  // Transaction actions
  | { type: 'ADD_TRANSACTION'; transaction: Transaction }
  | { type: 'UPDATE_TRANSACTION'; id: number; updates: Partial<Transaction> }
  | { type: 'DELETE_TRANSACTION'; id: number }
  | { type: 'CONFIRM_TRANSACTION'; id: number }
  | { type: 'DISMISS_TRANSACTION'; id: number }
  // Recurring transaction actions
  | { type: 'ADD_RECURRING'; recurring: RecurringTransaction }
  | { type: 'UPDATE_RECURRING'; id: number; updates: Partial<RecurringTransaction> }
  | { type: 'DELETE_RECURRING'; id: number }
  // Settings actions
  | { type: 'UPDATE_SETTINGS'; defaultTakeHomePay?: number; currencySymbol?: string }
  | { type: 'ADD_TEMPLATE'; template: CategoryTemplate }
  | { type: 'UPDATE_TEMPLATE'; id: number; updates: Partial<CategoryTemplate> }
  | { type: 'DELETE_TEMPLATE'; id: number }
  | { type: 'REPLACE_TEMPLATES'; templates: CategoryTemplate[] }
  // Account actions
  | { type: 'ADD_ACCOUNT'; account: Account }
  | { type: 'UPDATE_ACCOUNT'; id: number; updates: Partial<Account> }
  | { type: 'DELETE_ACCOUNT'; id: number }
  // Bulk
  | { type: 'LOAD_STATE'; state: AppState }
  | { type: 'SET_MONTH_DATA'; month: MonthBudget; transactions: Transaction[] }
  | { type: 'SET_ACCOUNTS'; accounts: Account[] }
  | { type: 'SET_RECURRING'; recurringTransactions: RecurringTransaction[] }
  | { type: 'SET_SETTINGS'; settings: AppState['settings'] }

export function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_MONTH':
      return { ...state, currentMonthKey: action.monthKey }

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

    case 'ADD_CATEGORY':
      return {
        ...state,
        monthBudgets: state.monthBudgets.map((m) =>
          m.monthKey === action.monthKey
            ? { ...m, categories: [...m.categories, action.category], updatedAt: nowISO() }
            : m
        ),
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

    case 'ADD_TRANSACTION':
      return {
        ...state,
        transactions: [...state.transactions, action.transaction],
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

    case 'ADD_RECURRING':
      return {
        ...state,
        recurringTransactions: [...state.recurringTransactions, action.recurring],
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

    case 'ADD_TEMPLATE':
      return {
        ...state,
        settings: {
          ...state.settings,
          categoryTemplates: [...state.settings.categoryTemplates, action.template],
        },
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

    case 'REPLACE_TEMPLATES':
      return {
        ...state,
        settings: { ...state.settings, categoryTemplates: action.templates },
      }

    case 'ADD_ACCOUNT':
      return {
        ...state,
        accounts: [...state.accounts, action.account],
      }

    case 'UPDATE_ACCOUNT':
      return {
        ...state,
        accounts: state.accounts.map((a) =>
          a.id === action.id ? { ...a, ...action.updates, updatedAt: nowISO() } : a
        ),
      }

    case 'DELETE_ACCOUNT': {
      if (state.accounts.find((a) => a.id === action.id)?.isDefault) return state
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
    }

    case 'LOAD_STATE':
      return action.state

    case 'SET_MONTH_DATA': {
      const existing = state.monthBudgets.find((m) => m.monthKey === action.month.monthKey)
      return {
        ...state,
        monthBudgets: existing
          ? state.monthBudgets.map((m) => m.monthKey === action.month.monthKey ? action.month : m)
          : [...state.monthBudgets, action.month],
        transactions: [
          ...state.transactions.filter((t) => t.monthKey !== action.month.monthKey),
          ...action.transactions,
        ],
      }
    }

    case 'SET_ACCOUNTS':
      return { ...state, accounts: action.accounts }

    case 'SET_RECURRING':
      return { ...state, recurringTransactions: action.recurringTransactions }

    case 'SET_SETTINGS':
      return { ...state, settings: action.settings }

    default:
      return state
  }
}
