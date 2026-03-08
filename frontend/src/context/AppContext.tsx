import { createContext, useContext, useReducer, useEffect, type ReactNode } from 'react'
import type { AppState } from '../types'
import { appReducer, type AppAction } from './appReducer'
import { getCurrentMonthKey } from '../utils/format'

const STORAGE_KEY = 'budget-app-state'

const defaultState: AppState = {
  settings: {
    defaultGrossIncome: 5416.66,
    defaultTaxRate: 0.358,
    categoryTemplates: [
      { id: 1, name: 'Rent/Housing', color: '#7c6dfa', defaultBudgetAmount: 0, defaultSpendLimit: 0, sortOrder: 0 },
      { id: 2, name: 'Vehicle/Transportation', color: '#fa6d8e', defaultBudgetAmount: 200, defaultSpendLimit: 250, sortOrder: 1 },
      { id: 3, name: 'Gas', color: '#6dfab0', defaultBudgetAmount: 97, defaultSpendLimit: 120, sortOrder: 2 },
      { id: 4, name: 'Groceries', color: '#fac86d', defaultBudgetAmount: 370, defaultSpendLimit: 400, sortOrder: 3 },
      { id: 5, name: 'Eating Out', color: '#6db8fa', defaultBudgetAmount: 300, defaultSpendLimit: 300, sortOrder: 4 },
      { id: 6, name: 'Utilities', color: '#fa9d6d', defaultBudgetAmount: 0, defaultSpendLimit: 0, sortOrder: 5 },
      { id: 7, name: 'Savings', color: '#b06dfa', defaultBudgetAmount: 1825, defaultSpendLimit: 1825, sortOrder: 6 },
      { id: 8, name: 'Fun/Entertainment', color: '#fa6dc8', defaultBudgetAmount: 300, defaultSpendLimit: 350, sortOrder: 7 },
      { id: 9, name: 'Debt', color: '#6dfaed', defaultBudgetAmount: 0, defaultSpendLimit: 0, sortOrder: 8 },
      { id: 10, name: 'Taxes', color: '#faed6d', defaultBudgetAmount: 799.60, defaultSpendLimit: 800, sortOrder: 9 },
      { id: 11, name: 'Deductions', color: '#6d9ffa', defaultBudgetAmount: 1140.22, defaultSpendLimit: 1200, sortOrder: 10 },
      { id: 12, name: 'Miscellaneous', color: '#fa6d6d', defaultBudgetAmount: 300, defaultSpendLimit: 350, sortOrder: 11 },
      { id: 13, name: 'Subscriptions', color: '#9dfa6d', defaultBudgetAmount: 100, defaultSpendLimit: 120, sortOrder: 12 },
    ],
  },
  monthBudgets: [],
  transactions: [],
  recurringTransactions: [],
  currentMonthKey: getCurrentMonthKey(),
  nextIds: {
    category: 100,
    categoryTemplate: 14,
    transaction: 100,
    recurringTransaction: 1,
  },
}

function loadState(): AppState {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      return JSON.parse(stored) as AppState
    }
  } catch {
    // ignore parse errors
  }
  return defaultState
}

function saveState(state: AppState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    // ignore storage errors
  }
}

interface AppContextValue {
  state: AppState
  dispatch: React.Dispatch<AppAction>
}

const AppContext = createContext<AppContextValue | null>(null)

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, null, loadState)

  // Persist on every state change
  useEffect(() => {
    saveState(state)
  }, [state])

  // Initialize current month if it doesn't exist
  useEffect(() => {
    const monthExists = state.monthBudgets.some(m => m.monthKey === state.currentMonthKey)
    if (!monthExists) {
      dispatch({ type: 'INIT_MONTH', monthKey: state.currentMonthKey })
    }
  }, [state.currentMonthKey, state.monthBudgets])

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  )
}

export function useAppContext(): AppContextValue {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useAppContext must be used within AppProvider')
  return ctx
}
