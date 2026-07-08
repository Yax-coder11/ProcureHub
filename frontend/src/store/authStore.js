/**
 * DEPRECATED — do not import this file in new code.
 *
 * Auth state is now managed by AuthContext.
 * Use:  import { useAuth } from '../context/AuthContext'
 * Or:   import useAuth from '../hooks/useAuth'
 *
 * This stub is kept to prevent import errors in any file that was
 * not yet migrated. It provides a no-op shim that reads from storage
 * so legacy code doesn't crash, but new code must NOT use this.
 */
import { getAccessToken, getRefreshToken, getUser, saveTokens, saveUser, clearAuth } from '../utils/storage'

export const authStore = {
  get state() {
    return {
      accessToken:  getAccessToken(),
      refreshToken: getRefreshToken(),
      user:         getUser(),
    }
  },
  setAuth({ accessToken, refreshToken, user: userObj }) {
    saveTokens({ accessToken, refreshToken })
    if (userObj) saveUser(userObj)
  },
  clearAuth() {
    clearAuth()
  },
  subscribe() { return () => {} },
  emit() {},
  getSnapshot() {
    return {
      ...this.state,
      setAuth:   this.setAuth.bind(this),
      clearAuth: this.clearAuth.bind(this),
    }
  },
}

/** @deprecated Use useAuth() from AuthContext instead */
export default function useAuthStore(selector = (s) => s) {
  // This hook is not reactive in the new architecture.
  // It returns a snapshot of the current storage state.
  // Components using this will not re-render on auth changes.
  // Migrate to useAuth() from AuthContext.
  const snapshot = authStore.getSnapshot()
  return selector(snapshot)
}
