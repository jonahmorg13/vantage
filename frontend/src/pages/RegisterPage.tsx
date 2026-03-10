import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth, AuthError } from '../context/AuthContext'
import { Button } from '../components/ui/Button'

export function RegisterPage() {
  const { register } = useAuth()
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')

    if (password.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    setSubmitting(true)
    try {
      await register(email, password)
      navigate('/', { replace: true })
    } catch (err) {
      if (err instanceof AuthError) {
        setError(err.errors.length > 0 ? err.errors.join('. ') : err.message)
      } else {
        setError('An unexpected error occurred')
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-lg font-mono font-semibold text-text tracking-wide">Create account</h2>

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
          autoComplete="new-password"
        />
      </div>

      <div>
        <label className="block text-xs text-text3 uppercase tracking-wider mb-1.5 font-mono">
          Confirm Password
        </label>
        <input
          type="password"
          required
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="w-full px-3 py-2 rounded-lg bg-surface2 border border-border text-text text-sm font-mono focus:outline-none focus:border-accent transition-colors"
          autoComplete="new-password"
        />
      </div>

      <Button type="submit" disabled={submitting} className="w-full">
        {submitting ? 'Creating account...' : 'Create account'}
      </Button>

      <p className="text-center text-sm text-text3 font-mono">
        Already have an account?{' '}
        <Link to="/login" className="text-accent hover:underline">
          Sign in
        </Link>
      </p>
    </form>
  )
}
