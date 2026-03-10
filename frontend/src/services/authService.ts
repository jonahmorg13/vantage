import { tokenStorage } from './tokenStorage'

const BASE_URL = import.meta.env.VITE_API_URL ?? ''

interface AuthTokensResponse {
  accessToken: string
  refreshToken: string
}

interface AuthErrorResponse {
  message: string
  errors?: string[]
}

export class AuthError extends Error {
  status: number
  errors: string[]

  constructor(status: number, message: string, errors: string[] = []) {
    super(message)
    this.name = 'AuthError'
    this.status = status
    this.errors = errors
  }
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let message = res.statusText
    let errors: string[] = []
    try {
      const err: AuthErrorResponse = await res.json()
      message = err.message ?? message
      errors = err.errors ?? []
    } catch {
      // ignore parse errors
    }
    throw new AuthError(res.status, message, errors)
  }
  return res.json() as Promise<T>
}

export const authService = {
  async login(email: string, password: string): Promise<AuthTokensResponse> {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })
    return handleResponse<AuthTokensResponse>(res)
  },

  async register(email: string, password: string): Promise<AuthTokensResponse> {
    const res = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })
    return handleResponse<AuthTokensResponse>(res)
  },

  async logout(refreshToken: string): Promise<void> {
    await fetch(`${BASE_URL}/auth/logout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    }).catch(() => {
      // fire-and-forget
    })
  },

  async refresh(refreshToken: string): Promise<AuthTokensResponse> {
    const res = await fetch(`${BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    })
    return handleResponse<AuthTokensResponse>(res)
  },
}

// Shared refresh promise for deduplication (used by ApiClient)
let refreshPromise: Promise<AuthTokensResponse> | null = null

export async function refreshAccessToken(): Promise<AuthTokensResponse> {
  if (refreshPromise) return refreshPromise

  const refreshToken = tokenStorage.getRefreshToken()
  if (!refreshToken) {
    throw new AuthError(401, 'No refresh token')
  }

  refreshPromise = authService.refresh(refreshToken).finally(() => {
    refreshPromise = null
  })

  return refreshPromise
}
