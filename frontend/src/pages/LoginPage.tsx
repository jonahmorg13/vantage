import { useState, type FormEvent } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth, AuthError } from '../context/AuthContext'
import { Button } from '../components/ui/Button'
import { Checkbox } from '../components/ui/Checkbox'

export function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as { from?: Location })?.from?.pathname ?? '/'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      await login(email, password, rememberMe)
      navigate(from, { replace: true })
    } catch (err) {
      if (err instanceof AuthError) {
        setError(err.message)
      } else {
        setError('An unexpected error occurred')
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-lg font-mono font-semibold text-text tracking-wide">Sign in</h2>

      {error && <div className="text-danger text-sm font-mono">{error}</div>}

      <div>
        <label className="block text-xs text-text3 uppercase tracking-wider mb-1.5 font-mono">
          Email
        </label>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-3 py-2 rounded-lg bg-surface2 border border-border text-text text-sm font-mono focus:outline-none focus:border-accent transition-colors"
          autoComplete="email"
        />
      </div>

      <div>
        <label className="block text-xs text-text3 uppercase tracking-wider mb-1.5 font-mono">
          Password
        </label>
        <input
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-3 py-2 rounded-lg bg-surface2 border border-border text-text text-sm font-mono focus:outline-none focus:border-accent transition-colors"
          autoComplete="current-password"
        />
      </div>

      <div className="flex items-center gap-2">
        <Checkbox checked={rememberMe} onChange={() => setRememberMe(!rememberMe)} />
        <span className="text-sm text-text2 font-mono">Remember me</span>
      </div>

      <Button type="submit" disabled={submitting} className="w-full">
        {submitting ? 'Signing in...' : 'Sign in'}
      </Button>

      <p className="text-center text-sm text-text3 font-mono">
        Don&apos;t have an account?{' '}
        <Link to="/register" className="text-accent hover:underline">
          Create account
        </Link>
      </p>
    </form>
  )
}
