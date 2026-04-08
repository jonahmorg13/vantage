import { createContext, useContext, useEffect, useRef, useMemo, type ReactNode } from 'react'
import { useAppContext } from '../context/AppContext'
import { useAuth } from '../context/AuthContext'
import { createRepositories } from './index'
import type { Repositories } from './types'
import type { AppAction } from '../context/appReducer'
import type { Account, RecurringTransaction, Transaction, MonthBudget } from '../types'

const RepositoryContext = createContext<Repositories | null>(null)

/**
 * In API mode, fetches all data from the backend and populates local state.
 * The frontend never generates data — backend is the sole source of truth.
 */
function DataHydrator({ repos, dispatch }: { repos: Repositories; dispatch: React.Dispatch<AppAction> }) {
  const { state } = useAppContext()
  const hydratedRef = useRef(false)
  const initingMonthsRef = useRef<Set<string>>(new Set())
  const client = repos.apiClient

  // On mount: fetch settings, accounts, recurring from API
  useEffect(() => {
    if (hydratedRef.current) return
    hydratedRef.current = true

    async function hydrate() {
      try {
        const [settings, accounts, recurring] = await Promise.all([
          client.get<{ defaultTakeHomePay: number; currencySymbol: string; categoryTemplates: [] }>('/api/settings'),
          client.get<Account[]>('/api/accounts'),
          client.get<RecurringTransaction[]>('/api/recurring'),
        ])

        dispatch({
          type: 'SET_SETTINGS',
          settings: {
            defaultTakeHomePay: settings.defaultTakeHomePay,
            currencySymbol: settings.currencySymbol,
            categoryTemplates: settings.categoryTemplates,
          },
        })
        dispatch({ type: 'SET_ACCOUNTS', accounts })
        dispatch({ type: 'SET_RECURRING', recurringTransactions: recurring })
      } catch {
        // Auth may have expired — ApiClient handles redirect to login
      }
    }

    hydrate()
  }, [client, dispatch])

  // When current month changes: fetch month + transactions from API
  useEffect(() => {
    const monthKey = state.currentMonthKey
    const monthExists = state.monthBudgets.some((m) => m.monthKey === monthKey)
    if (monthExists || initingMonthsRef.current.has(monthKey)) return

    initingMonthsRef.current.add(monthKey)

    async function loadMonth() {
      try {
        // Init is idempotent — creates the month or returns existing
        const month = await client.post<MonthBudget>(`/api/months/${monthKey}/init`)
        const transactions = await client.get<Transaction[]>(`/api/transactions?monthKey=${monthKey}`)
        dispatch({ type: 'SET_MONTH_DATA', month, transactions })
      } catch {
        // Month may not exist yet if user has no data
      } finally {
        initingMonthsRef.current.delete(monthKey)
      }
    }

    loadMonth()
  }, [state.currentMonthKey, state.monthBudgets, client, dispatch])

  return null
}

export function RepositoryProvider({ children }: { children: ReactNode }) {
  const { dispatch } = useAppContext()
  const { user } = useAuth()
  const repos = useMemo(() => createRepositories(dispatch), [dispatch])

  return (
    <RepositoryContext.Provider value={repos}>
      {user && <DataHydrator repos={repos} dispatch={dispatch} />}
      {children}
    </RepositoryContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useRepositories(): Repositories {
  const ctx = useContext(RepositoryContext)
  if (!ctx) throw new Error('useRepositories must be used within RepositoryProvider')
  return ctx
}
