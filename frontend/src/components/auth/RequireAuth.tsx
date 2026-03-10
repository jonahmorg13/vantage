import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

const isApiMode = (import.meta.env.VITE_DATA_SOURCE ?? 'local') === 'api'

export function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth()
  const location = useLocation()

  if (!isApiMode) return children

  if (isLoading) return null

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return children
}
