/**
 * AuthContext.jsx — Global authentication context.
 *
 * This is the SINGLE source of truth for authentication state in React.
 * Every component that needs to know if a user is logged in, what their
 * role is, or how to log out — consumes this context.
 *
 * Provides:
 *   user          – user object { id, username, email, role, ... } | null
 *   role          – string | null   shortcut for user?.role
 *   isAuthenticated – boolean
 *   isLoading     – boolean  (true only during the initial hydration check)
 *   login(username, password) → Promise<void>
 *   logout()      → Promise<void>
 *   updateUser(partialUser)  – update in-memory user without a server round-trip
 *
 * Architecture notes:
 *   - Hydrates from storage on first mount so a hard refresh keeps the user logged in.
 *   - Listens for 'auth:logout' and 'auth:tokenRefreshed' events dispatched by apiClient
 *     so the React tree stays in sync with changes that happen outside of React
 *     (e.g., a background token refresh or a forced logout after a failed refresh).
 *   - Does NOT call the backend on every mount — hydration is synchronous from storage.
 *   - login() writes tokens to storage BEFORE updating React state, which means any
 *     API call triggered by a state-driven navigation will always have a valid token.
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useReducer,
} from 'react'
import { login as apiLogin, logout as apiLogout } from '../services/authService'
import { hydrateAuth, saveUser, getAccessToken } from '../utils/storage'

// ── State shape ──────────────────────────────────────────────────────────

const initialState = {
  user:            null,
  accessToken:     null,
  isAuthenticated: false,
  isLoading:       true,   // true until hydration from storage is complete
}

// ── Reducer ───────────────────────────────────────────────────────────────

function authReducer(state, action) {
  switch (action.type) {
    case 'HYDRATE':
      return {
        ...state,
        user:            action.payload.user,
        accessToken:     action.payload.accessToken,
        isAuthenticated: !!action.payload.accessToken && !!action.payload.user,
        isLoading:       false,
      }
    case 'LOGIN':
      return {
        ...state,
        user:            action.payload.user,
        accessToken:     action.payload.accessToken,
        isAuthenticated: true,
        isLoading:       false,
      }
    case 'LOGOUT':
      return {
        ...state,
        user:            null,
        accessToken:     null,
        isAuthenticated: false,
        isLoading:       false,
      }
    case 'TOKEN_REFRESHED':
      return {
        ...state,
        accessToken: action.payload.accessToken,
      }
    case 'UPDATE_USER':
      return {
        ...state,
        user: { ...state.user, ...action.payload },
      }
    default:
      return state
  }
}

// ── Context ───────────────────────────────────────────────────────────────

const AuthContext = createContext(null)

// ── Provider ──────────────────────────────────────────────────────────────

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initialState)

  // ── Hydrate from storage on mount ────────────────────────────────────
  // This runs synchronously-ish (synchronous storage read, then one state update)
  // so the app never flashes the login screen for already-authenticated users.
  useEffect(() => {
    const { accessToken, user } = hydrateAuth()
    dispatch({ type: 'HYDRATE', payload: { accessToken, user } })
  }, [])

  // ── Listen for out-of-band auth events from apiClient ────────────────
  // apiClient dispatches these events when it refreshes a token or forces
  // a logout — both of which happen outside of React's call stack.
  useEffect(() => {
    function onLogout() {
      dispatch({ type: 'LOGOUT' })
    }

    function onTokenRefreshed(event) {
      dispatch({
        type: 'TOKEN_REFRESHED',
        payload: { accessToken: event.detail.accessToken },
      })
    }

    window.addEventListener('auth:logout', onLogout)
    window.addEventListener('auth:tokenRefreshed', onTokenRefreshed)
    return () => {
      window.removeEventListener('auth:logout', onLogout)
      window.removeEventListener('auth:tokenRefreshed', onTokenRefreshed)
    }
  }, [])

  // ── Login ────────────────────────────────────────────────────────────
  /**
   * Authenticate the user.
   *
   * CRITICAL ORDERING:
   *   1. apiLogin() writes tokens to localStorage via saveTokens() BEFORE returning.
   *   2. We dispatch LOGIN to React state.
   *   3. Only then does the caller navigate to the dashboard.
   *
   * This ordering ensures that by the time React renders the dashboard and
   * fires any API call, the token is ALREADY in storage and the Axios
   * request interceptor will attach it correctly. No race condition.
   */
  const login = useCallback(async (username, password) => {
    // authService.login() writes to storage first, then returns the data
    const { accessToken, refreshToken, user } = await apiLogin(username, password)

    // Update React state AFTER storage is confirmed written
    dispatch({ type: 'LOGIN', payload: { accessToken, refreshToken, user } })

    return user  // let the caller use role for navigation
  }, [])

  // ── Logout ───────────────────────────────────────────────────────────
  const logout = useCallback(async () => {
    await apiLogout()          // clears storage, blacklists refresh token
    dispatch({ type: 'LOGOUT' })
  }, [])

  // ── Update user in memory ────────────────────────────────────────────
  const updateUser = useCallback((partialUser) => {
    const updated = { ...state.user, ...partialUser }
    saveUser(updated)
    dispatch({ type: 'UPDATE_USER', payload: partialUser })
  }, [state.user])

  const value = {
    user:            state.user,
    role:            state.user?.role ?? null,
    isAuthenticated: state.isAuthenticated,
    isLoading:       state.isLoading,
    login,
    logout,
    updateUser,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// ── Consumer hook ─────────────────────────────────────────────────────────

/**
 * useAuth — consume the global auth context.
 *
 * Usage:
 *   const { user, role, isAuthenticated, login, logout } = useAuth()
 *
 * Throws if used outside of <AuthProvider>.
 */
export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used inside <AuthProvider>.')
  }
  return context
}

export default AuthContext
