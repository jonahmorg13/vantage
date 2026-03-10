import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import { tokenStorage } from '../services/tokenStorage'
import { authService, AuthError } from '../services/authService'
import { useAppContext } from './AppContext'

interface User {
  email: string
}

interface AuthContextValue {
  user: User | null
  isLoading: boolean
  login: (email: string, password: string, rememberMe: boolean) => Promise<void>
  register: (email: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const { resetState } = useAppContext()

  useEffect(() => {
    const token = tokenStorage.getAccessToken()
    const email = tokenStorage.getUserEmail()
    if (token && email) {
      setUser({ email })
    }
    setIsLoading(false)
  }, [])

  const login = useCallback(async (email: string, password: string, rememberMe: boolean) => {
    resetState()
    const tokens = await authService.login(email, password)
    tokenStorage.setTokens(tokens.accessToken, tokens.refreshToken, email, rememberMe)
    setUser({ email })
  }, [resetState])

  const register = useCallback(async (email: string, password: string) => {
    resetState()
    const tokens = await authService.register(email, password)
    tokenStorage.setTokens(tokens.accessToken, tokens.refreshToken, email, true)
    setUser({ email })
  }, [resetState])

  const logout = useCallback(() => {
    const refreshToken = tokenStorage.getRefreshToken()
    if (refreshToken) {
      authService.logout(refreshToken)
    }
    tokenStorage.clear()
    resetState()
    setUser(null)
  }, [resetState])

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

export { AuthError }
