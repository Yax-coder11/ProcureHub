/**
 * authService.js — Centralized authentication service.
 *
 * ALL authentication API calls must go through this service.
 * No page or component may call auth endpoints directly.
 *
 * This service uses apiClient for authenticated requests and plain
 * axios (via apiClient without auth) for public endpoints.
 */

import apiClient from '../api/apiClient'
import { saveTokens, saveUser, clearAuth, getRefreshToken } from '../utils/storage'

// ── Login ─────────────────────────────────────────────────────────────────

/**
 * Authenticate the user.
 *
 * Stores tokens and user data in storage BEFORE returning,
 * so that any subsequent API call (e.g. from AuthContext or a hook)
 * will have a valid token immediately — no race condition.
 *
 * @param {string} username
 * @param {string} password
 * @returns {{ accessToken, refreshToken, user }}
 */
export async function login(username, password) {
  const response = await apiClient.post('/auth/login/', { username, password })
  const { access, refresh, user } = response.data

  // Write to storage FIRST — before returning to the caller.
  // The Axios interceptor reads from storage, so this guarantees
  // any follow-up request after login will have a valid token.
  saveTokens({ accessToken: access, refreshToken: refresh })
  saveUser(user)

  return { accessToken: access, refreshToken: refresh, user }
}

// ── Logout ────────────────────────────────────────────────────────────────

/**
 * Blacklist the refresh token on the server then wipe local storage.
 * Safe to call even if the server request fails — local auth is always cleared.
 */
export async function logout() {
  const refreshToken = getRefreshToken()
  try {
    if (refreshToken) {
      await apiClient.post('/auth/logout/', { refresh: refreshToken })
    }
  } catch {
    // Server-side blacklist failure is non-fatal. Local logout proceeds.
  } finally {
    clearAuth()
  }
}

// ── Registration ──────────────────────────────────────────────────────────

/**
 * Register a new user account.
 * Does NOT log the user in — the caller must call login() afterwards.
 *
 * @param {object} data  { username, email, password, password_confirm, first_name, last_name, role }
 */
export async function register(data) {
  const response = await apiClient.post('/auth/register/', data)
  return response.data
}

// ── Token refresh ─────────────────────────────────────────────────────────

/**
 * Explicitly refresh the access token.
 * Note: the apiClient response interceptor does this automatically on 401.
 * This function is provided for use cases that need manual refresh (e.g., on app focus).
 *
 * @returns {string} new access token
 */
export async function refreshAccessToken() {
  const refreshToken = getRefreshToken()
  if (!refreshToken) throw new Error('No refresh token available.')
  const response = await apiClient.post('/auth/token/refresh/', { refresh: refreshToken })
  const newAccessToken = response.data.access
  saveTokens({ accessToken: newAccessToken })
  return newAccessToken
}

// ── Profile ───────────────────────────────────────────────────────────────

/**
 * Fetch the authenticated user's profile from the server.
 */
export async function getProfile() {
  const response = await apiClient.get('/auth/profile/')
  return response.data
}

/**
 * Update the authenticated user's profile.
 * @param {object} data  Partial user fields to update.
 */
export async function updateProfile(data) {
  const response = await apiClient.patch('/auth/profile/', data)
  return response.data
}

// ── Password change ───────────────────────────────────────────────────────

/**
 * Change the authenticated user's password.
 *
 * @param {object} data  { old_password, new_password, new_password_confirm }
 */
export async function changePassword(data) {
  const response = await apiClient.post('/auth/password-change/', data)
  return response.data
}
