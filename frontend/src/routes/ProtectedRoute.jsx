/**
 * ProtectedRoute.jsx — Authentication and role-based access guard.
 *
 * Replaces both the old ProtectedRoute and RoleBasedRoute components.
 * Uses AuthContext as the single source of truth — never reads localStorage directly.
 *
 * Behaviour:
 *   isLoading      → render nothing (wait for hydration to complete)
 *   !isAuthenticated → redirect to /login
 *   allowedRoles provided but role not in list → redirect to role's home dashboard
 *   otherwise → render <Outlet />
 *
 * Usage:
 *   // Require authentication only
 *   <Route element={<ProtectedRoute />}>
 *
 *   // Require authentication AND a specific role
 *   <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
 */

import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getDashboardPath } from '../utils/roleRoutes'
import LoadingSpinner from '../components/ui/LoadingSpinner'

function ProtectedRoute({ allowedRoles }) {
  const { isAuthenticated, isLoading, role } = useAuth()
  const location = useLocation()

  // While AuthContext is hydrating from storage, render nothing.
  // This prevents a flash-to-login for users who are already authenticated.
  if (isLoading) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center">
        <LoadingSpinner label="Loading…" />
      </div>
    )
  }

  // Not logged in — redirect to login, preserving the attempted path so
  // we can redirect back after login if needed.
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // Logged in but wrong role — redirect to this user's own dashboard.
  if (allowedRoles && !allowedRoles.includes(role)) {
    return <Navigate to={getDashboardPath(role)} replace />
  }

  return <Outlet />
}

export default ProtectedRoute
