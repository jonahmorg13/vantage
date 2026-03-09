import { createContext, useContext, useMemo, type ReactNode } from 'react'
import { useAppContext } from '../context/AppContext'
import { createRepositories } from './index'
import type { Repositories } from './types'

const RepositoryContext = createContext<Repositories | null>(null)

export function RepositoryProvider({ children }: { children: ReactNode }) {
  const { dispatch } = useAppContext()
  const repos = useMemo(() => createRepositories(dispatch), [dispatch])

  return <RepositoryContext.Provider value={repos}>{children}</RepositoryContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useRepositories(): Repositories {
  const ctx = useContext(RepositoryContext)
  if (!ctx) throw new Error('useRepositories must be used within RepositoryProvider')
  return ctx
}
