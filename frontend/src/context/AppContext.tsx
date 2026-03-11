import { createContext, useContext, useReducer, useEffect, useState, useCallback, type ReactNode } from 'react'
import type { AppState } from '../types'
import { appReducer, type AppAction } from './appReducer'
import { getCurrentMonthKey } from '../utils/format'

const STORAGE_KEY = 'budget-app-state'
const isApiMode = (import.meta.env.VITE_DATA_SOURCE ?? 'api') !== 'local'

const emptyState: AppState = {
  settings: {
    defaultTakeHomePay: 0,
    currencySymbol: '$',
    categoryTemplates: [],
  },
  monthBudgets: [],
  transactions: [],
  recurringTransactions: [],
  accounts: [],
  currentMonthKey: getCurrentMonthKey(),
  nextIds: {
    category: 100,
    categoryTemplate: 16,
    transaction: 100,
    recurringTransaction: 1,
    account: 2,
  },
}

const defaultState: AppState = {
  settings: {
    defaultTakeHomePay: 0,
    currencySymbol: '$',
    categoryTemplates: [
      { id: 1,  name: 'Housing',         color: '#7c6dfa', defaultBudgetAmount: 0, sortOrder: 0  },
      { id: 2,  name: 'Utilities',        color: '#6db8fa', defaultBudgetAmount: 0, sortOrder: 1  },
      { id: 3,  name: 'Groceries',        color: '#6dfab0', defaultBudgetAmount: 0, sortOrder: 2  },
      { id: 4,  name: 'Transportation',   color: '#fa9d6d', defaultBudgetAmount: 0, sortOrder: 3  },
      { id: 5,  name: 'Gas',              color: '#fa6d8e', defaultBudgetAmount: 0, sortOrder: 4  },
      { id: 6,  name: 'Health & Medical', color: '#6dfaed', defaultBudgetAmount: 0, sortOrder: 5  },
      { id: 7,  name: 'Dining Out',       color: '#fac86d', defaultBudgetAmount: 0, sortOrder: 6  },
      { id: 8,  name: 'Entertainment',    color: '#b06dfa', defaultBudgetAmount: 0, sortOrder: 7  },
      { id: 9,  name: 'Shopping',         color: '#fa6dc8', defaultBudgetAmount: 0, sortOrder: 8  },
      { id: 10, name: 'Subscriptions',    color: '#9dfa6d', defaultBudgetAmount: 0, sortOrder: 9  },
      { id: 11, name: 'Personal Care',    color: '#faed6d', defaultBudgetAmount: 0, sortOrder: 10 },
      { id: 12, name: 'Savings',          color: '#7c6dfa', defaultBudgetAmount: 0, sortOrder: 11 },
      { id: 13, name: 'Investments',      color: '#6dfab0', defaultBudgetAmount: 0, sortOrder: 12 },
      { id: 14, name: 'Debt',             color: '#fa6d6d', defaultBudgetAmount: 0, sortOrder: 13 },
      { id: 15, name: 'Miscellaneous',    color: '#fa9d6d', defaultBudgetAmount: 0, sortOrder: 14 },
    ],
  },
  monthBudgets: [],
  transactions: [],
  recurringTransactions: [],
  accounts: [
    {
      id: 1,
      name: 'Checking',
      color: '#7c6dfa',
      accountType: 'checking',
      initialBalance: 0,
      isDefault: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ],
  currentMonthKey: getCurrentMonthKey(),
  nextIds: {
    category: 100,
    categoryTemplate: 16,
    transaction: 100,
    recurringTransaction: 1,
    account: 2,
  },
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function migrateState(raw: any): AppState {
  // Migrate settings: defaultGrossIncome → defaultTakeHomePay
  const settings = raw.settings ?? {}
  if (settings.defaultGrossIncome !== undefined && settings.defaultTakeHomePay === undefined) {
    const gross = settings.defaultGrossIncome
    const tax = settings.defaultTaxRate ?? 0
    settings.defaultTakeHomePay = gross * (1 - tax)
  }
  delete settings.defaultTaxRate
  delete settings.defaultGrossIncome
  if (settings.currencySymbol === undefined) {
    settings.currencySymbol = '$'
  }

  // Migrate monthBudgets: grossIncome → takeHomePay, remove taxRate
  const monthBudgets = (raw.monthBudgets ?? []).map((m: any) => {
    if (m.grossIncome !== undefined && m.takeHomePay === undefined) {
      const gross = m.grossIncome
      const tax = m.taxRate ?? 0
      m.takeHomePay = gross * (1 - tax)
    }
    delete m.grossIncome
    delete m.taxRate
    return m
  })

  // Migrate investmentAccounts → accounts
  let accounts = raw.accounts ?? raw.investmentAccounts ?? []

  // Migrate: ensure a default checking account exists
  if (!accounts.some((a: any) => a.isDefault)) {
    const firstChecking = accounts.find((a: any) => a.accountType === 'checking')
    if (firstChecking) {
      accounts = accounts.map((a: any) => a === firstChecking ? { ...a, isDefault: true } : a)
    }
  }

  // Migrate transactions: type 'investment' → 'expense', investmentAccountId → accountId
  const transactions = (raw.transactions ?? []).map((t: any) => {
    if (t.type === 'investment') {
      t = { ...t, type: 'expense' }
      if (t.investmentAccountId !== undefined) {
        t = { ...t, accountId: t.investmentAccountId }
      }
    }
    delete t.investmentAccountId
    return t
  })

  const nextIds = {
    ...(raw.nextIds ?? {}),
    account: raw.nextIds?.account ?? raw.nextIds?.investmentAccount ?? 1,
  }
  delete nextIds.investmentAccount
  delete nextIds.investmentContribution

  return {
    ...raw,
    settings,
    monthBudgets,
    accounts,
    transactions,
    nextIds,
  } as AppState
}

function loadState(): AppState {
  // In API mode, start with empty state — data comes from the backend
  if (isApiMode) return emptyState

  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      return migrateState(JSON.parse(stored))
    }
  } catch {
    // ignore parse errors
  }
  return defaultState
}

function saveState(state: AppState) {
  // In API mode, don't persist to localStorage
  if (isApiMode) return

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    // ignore storage errors
  }
}

interface AppContextValue {
  state: AppState
  dispatch: React.Dispatch<AppAction>
  isHydrating: boolean
  resetState: () => void
}

const AppContext = createContext<AppContextValue | null>(null)

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, null, loadState)
  const [isHydrating, setIsHydrating] = useState(true)

  const resetState = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY)
    dispatch({ type: 'LOAD_STATE', state: isApiMode ? emptyState : defaultState })
  }, [])

  // Persist on every state change (local mode only)
  useEffect(() => {
    saveState(state)
  }, [state])

  // Initialize current month if it doesn't exist (local mode only)
  // In API mode, DataHydrator in RepositoryContext handles this
  useEffect(() => {
    if (isApiMode) return
    const monthExists = state.monthBudgets.some((m) => m.monthKey === state.currentMonthKey)
    if (!monthExists) {
      dispatch({ type: 'INIT_MONTH', monthKey: state.currentMonthKey })
    }
  }, [state.currentMonthKey, state.monthBudgets])

  // Mark hydration complete after first render
  useEffect(() => {
    setIsHydrating(false)
  }, [])

  return <AppContext.Provider value={{ state, dispatch, isHydrating, resetState }}>{children}</AppContext.Provider>
}

export function useAppContext(): AppContextValue {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useAppContext must be used within AppProvider')
  return ctx
}
