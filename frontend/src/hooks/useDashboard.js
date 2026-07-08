/**
 * useDashboard.js
 *
 * Fetches the unified /api/dashboard/ payload and caches it for the session
 * so that DashboardLayout (sidebar) and DashboardPage (stats/activities)
 * share one network request.
 *
 * Auth state comes exclusively from AuthContext via useAuth().
 * Never reads localStorage directly.
 */

import { useState, useEffect, useCallback, useRef } from 'react'
import { useAuth } from '../context/AuthContext'
import { getDashboard } from '../services/dashboardService'

// ── Module-level cache ────────────────────────────────────────────────────
// Shared across all instances within the same user session.
// Busted automatically when the user changes or when refresh() is called.

const _cache = {
  role:    null,
  data:    null,
  promise: null,
}

function _clearCache() {
  _cache.role    = null
  _cache.data    = null
  _cache.promise = null
}

// ── Hook ──────────────────────────────────────────────────────────────────

export default function useDashboard() {
  const { role, isAuthenticated } = useAuth()

  const [data, setData]       = useState(_cache.role === role ? _cache.data : null)
  const [loading, setLoading] = useState(!(_cache.role === role && _cache.data))
  const [error, setError]     = useState(null)

  const prevRole = useRef(role)
  if (prevRole.current !== role) {
    _clearCache()
    prevRole.current = role
  }

  const load = useCallback(async (force = false) => {
    // Do nothing if not authenticated yet
    if (!isAuthenticated || !role) return

    // Serve from cache if available and not forced
    if (!force && _cache.role === role && _cache.data) {
      setData(_cache.data)
      setLoading(false)
      return
    }

    // If a request is already in-flight, wait for it
    if (!force && _cache.promise) {
      setLoading(true)
      try {
        const result = await _cache.promise
        setData(result)
        setError(null)
      } catch (err) {
        setError(err?.response?.data?.detail || 'Failed to load dashboard data.')
      } finally {
        setLoading(false)
      }
      return
    }

    setLoading(true)
    setError(null)

    _cache.promise = getDashboard()
    try {
      const result = await _cache.promise
      _cache.role = role
      _cache.data = result
      setData(result)
    } catch (err) {
      _clearCache()
      setError(err?.response?.data?.detail || 'Failed to load dashboard data.')
    } finally {
      _cache.promise = null
      setLoading(false)
    }
  }, [role, isAuthenticated])

  const refresh = useCallback(() => {
    _clearCache()
    load(true)
  }, [load])

  useEffect(() => {
    load()
  }, [load])

  return {
    sidebar:      data?.sidebar       ?? [],
    quickActions: data?.quick_actions ?? [],
    stats:        data?.stats         ?? [],
    activities:   data?.activities    ?? [],
    loading,
    error,
    refresh,
  }
}
