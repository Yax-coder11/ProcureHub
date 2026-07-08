/**
 * storage.js — Centralized storage utility.
 *
 * THIS IS THE ONLY FILE that may read from or write to localStorage.
 * No other file in the project may call localStorage directly.
 *
 * All keys are namespaced under STORAGE_PREFIX to avoid collisions
 * with any other scripts that might run on the same origin.
 */

const STORAGE_PREFIX = 'procurehub_'

const KEYS = {
  ACCESS_TOKEN:  `${STORAGE_PREFIX}access_token`,
  REFRESH_TOKEN: `${STORAGE_PREFIX}refresh_token`,
  USER:          `${STORAGE_PREFIX}user`,
}

// ── Write ────────────────────────────────────────────────────────────────

/**
 * Persist both JWT tokens. Call this immediately after a successful login
 * or token refresh — before any navigation or state update.
 */
export function saveTokens({ accessToken, refreshToken }) {
  if (accessToken)  localStorage.setItem(KEYS.ACCESS_TOKEN,  accessToken)
  if (refreshToken) localStorage.setItem(KEYS.REFRESH_TOKEN, refreshToken)
}

/**
 * Persist the user profile object returned by the login API.
 */
export function saveUser(user) {
  if (user) {
    localStorage.setItem(KEYS.USER, JSON.stringify(user))
  }
}

// ── Read ─────────────────────────────────────────────────────────────────

export function getAccessToken() {
  return localStorage.getItem(KEYS.ACCESS_TOKEN) || null
}

export function getRefreshToken() {
  return localStorage.getItem(KEYS.REFRESH_TOKEN) || null
}

export function getUser() {
  try {
    const raw = localStorage.getItem(KEYS.USER)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

// ── Delete ───────────────────────────────────────────────────────────────

/**
 * Wipe all auth data from storage. Call on logout or when a refresh fails.
 */
export function clearAuth() {
  localStorage.removeItem(KEYS.ACCESS_TOKEN)
  localStorage.removeItem(KEYS.REFRESH_TOKEN)
  localStorage.removeItem(KEYS.USER)
}

// ── Hydration helper ─────────────────────────────────────────────────────

/**
 * Read the initial auth state from storage in one call.
 * Used by AuthContext to hydrate on page load / hard refresh.
 */
export function hydrateAuth() {
  return {
    accessToken:  getAccessToken(),
    refreshToken: getRefreshToken(),
    user:         getUser(),
  }
}
