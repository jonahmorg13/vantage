import { createContext, useContext, useReducer, useEffect, useState, useCallback, type ReactNode } from 'react'
import type { AppState } from '../types'
import { appReducer, type AppAction } from './appReducer'
import { getCurrentMonthKey } from '../utils/format'

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
}

interface AppContextValue {
  state: AppState
  dispatch: React.Dispatch<AppAction>
  isHydrating: boolean
  resetState: () => void
}

const AppContext = createContext<AppContextValue | null>(null)

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, emptyState)
  const [isHydrating, setIsHydrating] = useState(true)

  const resetState = useCallback(() => {
    dispatch({ type: 'LOAD_STATE', state: emptyState })
  }, [])

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
