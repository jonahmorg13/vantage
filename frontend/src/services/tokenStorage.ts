const KEYS = {
  accessToken: 'auth-token',
  refreshToken: 'auth-refresh-token',
  userEmail: 'auth-user-email',
  remember: 'auth-remember',
} as const

function getStorage(): Storage {
  return localStorage.getItem(KEYS.remember) === 'true' ? localStorage : sessionStorage
}

export const tokenStorage = {
  setTokens(accessToken: string, refreshToken: string, email: string, remember: boolean) {
    localStorage.setItem(KEYS.remember, String(remember))
    const storage = remember ? localStorage : sessionStorage
    storage.setItem(KEYS.accessToken, accessToken)
    storage.setItem(KEYS.refreshToken, refreshToken)
    storage.setItem(KEYS.userEmail, email)
  },

  getAccessToken(): string | null {
    return getStorage().getItem(KEYS.accessToken)
  },

  getRefreshToken(): string | null {
    return getStorage().getItem(KEYS.refreshToken)
  },

  getUserEmail(): string | null {
    return getStorage().getItem(KEYS.userEmail)
  },

  clear() {
    for (const key of Object.values(KEYS)) {
      localStorage.removeItem(key)
      sessionStorage.removeItem(key)
    }
  },
}
