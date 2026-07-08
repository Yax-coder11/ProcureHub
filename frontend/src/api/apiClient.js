/**
 * apiClient.js — The ONE and ONLY Axios instance for the entire project.
 *
 * RULES:
 *   1. Every API call in the project must import this instance.
 *   2. No other file may create an axios instance or call fetch().
 *   3. No page or component may manually attach Authorization headers.
 *
 * REQUEST INTERCEPTOR:
 *   Reads the access token from storage and attaches it automatically
 *   to every outgoing request as  Authorization: Bearer <token>.
 *
 * RESPONSE INTERCEPTOR:
 *   On 401 — silently refreshes the access token using the refresh token,
 *   then retries the original request exactly once.
 *   On refresh failure — clears all auth data and redirects to /login.
 */

import axios from 'axios'
import {
  getAccessToken,
  getRefreshToken,
  saveTokens,
  clearAuth,
} from '../utils/storage'

// ── Instance ─────────────────────────────────────────────────────────────

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// ── Request interceptor ───────────────────────────────────────────────────
// Attach JWT access token to every request automatically.
// No component or service ever needs to touch headers.

apiClient.interceptors.request.use(
  (config) => {
    const token = getAccessToken()
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// ── Response interceptor ──────────────────────────────────────────────────
// Handle 401 with silent token refresh + request retry.
// Serialize concurrent refresh attempts so we only call /token/refresh/ once.

let _isRefreshing = false
let _refreshQueue = []   // pending requests waiting for a new token

function _processQueue(error, newToken = null) {
  _refreshQueue.forEach((pending) => {
    error ? pending.reject(error) : pending.resolve(newToken)
  })
  _refreshQueue = []
}

/**
 * Force-redirect to login and wipe auth state.
 * Uses window.location so it works outside React's component tree.
 * The AuthContext will pick up the cleared storage on next mount.
 */
function _forceLogout() {
  clearAuth()
  // Notify AuthContext listeners that auth has been wiped.
  // We dispatch a custom event instead of importing AuthContext to avoid
  // circular dependencies (apiClient ← authService ← AuthContext ← apiClient).
  window.dispatchEvent(new Event('auth:logout'))
  window.location.replace('/login')
}

apiClient.interceptors.response.use(
  // 2xx — pass through unchanged
  (response) => response,

  async (error) => {
    const originalRequest = error.config

    const is401           = error.response?.status === 401
    const alreadyRetried  = originalRequest._retry === true
    const isRefreshUrl    = originalRequest.url?.includes('/auth/token/refresh/')
    const isLoginUrl      = originalRequest.url?.includes('/auth/login/')

    // Do not attempt refresh for login/refresh endpoints or already-retried requests.
    if (!is401 || alreadyRetried || isRefreshUrl || isLoginUrl) {
      return Promise.reject(error)
    }

    const refreshToken = getRefreshToken()
    if (!refreshToken) {
      _forceLogout()
      return Promise.reject(error)
    }

    // Queue concurrent requests while a refresh is in-flight.
    if (_isRefreshing) {
      return new Promise((resolve, reject) => {
        _refreshQueue.push({ resolve, reject })
      }).then((newToken) => {
        originalRequest.headers.Authorization = `Bearer ${newToken}`
        originalRequest._retry = true
        return apiClient(originalRequest)
      }).catch((err) => Promise.reject(err))
    }

    // === Start the refresh flow ===
    originalRequest._retry = true
    _isRefreshing = true

    try {
      // Use a plain axios call (not apiClient) to avoid triggering this
      // interceptor again, which would cause infinite recursion.
      const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api'
      const { data } = await axios.post(
        `${baseURL}/auth/token/refresh/`,
        { refresh: refreshToken },
        { headers: { 'Content-Type': 'application/json' } }
      )

      const newAccessToken  = data.access
      // When ROTATE_REFRESH_TOKENS=True, Django returns a new refresh token too.
      const newRefreshToken = data.refresh || null

      // Persist via the storage utility — the only place allowed to write to storage.
      saveTokens({
        accessToken:  newAccessToken,
        ...(newRefreshToken ? { refreshToken: newRefreshToken } : {}),
      })

      // Notify AuthContext about the new token so in-memory state stays in sync.
      window.dispatchEvent(new CustomEvent('auth:tokenRefreshed', {
        detail: { accessToken: newAccessToken },
      }))

      // Release all queued requests with the new token.
      _processQueue(null, newAccessToken)

      // Retry the original request.
      originalRequest.headers.Authorization = `Bearer ${newAccessToken}`
      return apiClient(originalRequest)

    } catch (refreshError) {
      // Refresh failed — session is unrecoverable.
      _processQueue(refreshError, null)
      _forceLogout()
      return Promise.reject(refreshError)
    } finally {
      _isRefreshing = false
    }
  }
)

export default apiClient
