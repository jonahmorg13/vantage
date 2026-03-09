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
    return localStorage.getItem('auth-token')
  }

  private async request<T>(method: string, path: string, body?: unknown): Promise<T> {
    const token = this.getToken()
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }

    const res = await fetch(`${BASE_URL}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    })

    if (!res.ok) {
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

    if (res.status === 204) return undefined as T
    return res.json() as Promise<T>
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
