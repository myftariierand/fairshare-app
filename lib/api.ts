// lib/api.ts
import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios'
import { tokenStorage } from './token-storage'

const baseURL = process.env.EXPO_PUBLIC_API_URL
const headers = { 'x-client': 'mobile' }

export const api = axios.create({ baseURL, headers, timeout: 10_000 })

// Separate instance with no interceptors, so a failing refresh can't trigger another refresh
const refreshClient = axios.create({ baseURL, headers, timeout: 10_000 })

// The auth context registers this so the API layer can force a logout without importing React
let onAuthFailure: (() => void) | null = null
export function setAuthFailureHandler(fn: (() => void) | null) {
  onAuthFailure = fn
}

type RetryableConfig = InternalAxiosRequestConfig & { _retry?: boolean }

// Single-flight: concurrent 401s share one refresh request
let refreshPromise: Promise<string> | null = null

async function refreshAccessToken(): Promise<string> {
  const refreshToken = await tokenStorage.getRefresh()
  if (!refreshToken) throw new Error('No refresh token')

  const { data } = await refreshClient.post<{ accessToken: string; refreshToken?: string }>(
    '/auth/refresh',
    { refreshToken }
  )

  // If the backend rotates refresh tokens, the new one is saved; otherwise the old one stays
  await tokenStorage.set({ accessToken: data.accessToken, refreshToken: data.refreshToken })
  return data.accessToken
}

// Attach the access token
api.interceptors.request.use(async config => {
  const token = await tokenStorage.getAccess()
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Refresh on 401 and retry once
api.interceptors.response.use(
  response => response,
  async (error: AxiosError) => {
    const original = error.config as RetryableConfig | undefined
    const status = error.response?.status

    const isAuthRoute =
      original?.url?.includes('/auth/login') || original?.url?.includes('/auth/refresh')

    if (status !== 401 || !original || original._retry || isAuthRoute) {
      return Promise.reject(error)
    }

    original._retry = true

    try {
      refreshPromise ??= refreshAccessToken().finally(() => {
        refreshPromise = null
      })
      const newToken = await refreshPromise
      original.headers.Authorization = `Bearer ${newToken}`
      return api(original)
    } catch (refreshError) {
      // Only log out if the server actually rejected the refresh token.
      // A network error or a 5xx shouldn't kick the user out.
      const refreshStatus = axios.isAxiosError(refreshError)
        ? refreshError.response?.status
        : undefined
      const rejected =
        refreshStatus === 401 || refreshStatus === 403 || !(await tokenStorage.getRefresh())

      if (rejected) {
        await tokenStorage.clear()
        onAuthFailure?.()
      }
      return Promise.reject(refreshError)
    }
  }
)
