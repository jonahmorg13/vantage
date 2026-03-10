import { tokenStorage } from '../../services/tokenStorage'
import { refreshAccessToken } from '../../services/authService'

const BASE_URL = import.meta.env.VITE_API_URL ?? ''

export class ApiError extends Error {
  status: number
  code: string | undefined

  constructor(status: number, message: string, code?: string) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
  }
}

export class ApiClient {
  private getToken(): string | null {
    return tokenStorage.getAccessToken()
  }

  private buildHeaders(token: string | null): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }
    return headers
  }

  private async request<T>(method: string, path: string, body?: unknown): Promise<T> {
    const token = this.getToken()
    const res = await fetch(`${BASE_URL}${path}`, {
      method,
      headers: this.buildHeaders(token),
      body: body !== undefined ? JSON.stringify(body) : undefined,
    })

    if (res.status === 401) {
      // Attempt token refresh
      try {
        const tokens = await refreshAccessToken()
        const email = tokenStorage.getUserEmail()
        const remember = localStorage.getItem('auth-remember') === 'true'
        tokenStorage.setTokens(tokens.accessToken, tokens.refreshToken, email ?? '', remember)

        // Retry original request with new token
        const retryRes = await fetch(`${BASE_URL}${path}`, {
          method,
          headers: this.buildHeaders(tokens.accessToken),
          body: body !== undefined ? JSON.stringify(body) : undefined,
        })

        if (retryRes.status === 401) {
          tokenStorage.clear()
          window.location.href = '/login'
          throw new ApiError(401, 'Session expired')
        }

        if (!retryRes.ok) {
          return this.handleErrorResponse(retryRes)
        }

        if (retryRes.status === 204) return undefined as T
        return retryRes.json() as Promise<T>
      } catch (err) {
        if (err instanceof ApiError) throw err
        tokenStorage.clear()
        window.location.href = '/login'
        throw new ApiError(401, 'Session expired')
      }
    }

    if (!res.ok) {
      return this.handleErrorResponse(res)
    }

    if (res.status === 204) return undefined as T
    return res.json() as Promise<T>
  }

  private async handleErrorResponse(res: Response): Promise<never> {
    let message = res.statusText
    let code: string | undefined
    try {
      const err = await res.json()
      message = err.message ?? message
      code = err.code
    } catch {
      // ignore parse errors
    }
    throw new ApiError(res.status, message, code)
  }

  get<T>(path: string): Promise<T> {
    return this.request<T>('GET', path)
  }

  post<T>(path: string, body?: unknown): Promise<T> {
    return this.request<T>('POST', path, body)
  }

  put<T>(path: string, body?: unknown): Promise<T> {
    return this.request<T>('PUT', path, body)
  }

  delete<T = void>(path: string): Promise<T> {
    return this.request<T>('DELETE', path)
  }
}
