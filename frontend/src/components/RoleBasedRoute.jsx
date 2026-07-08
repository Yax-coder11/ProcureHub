/**
 * DEPRECATED — RoleBasedRoute has been merged into ProtectedRoute.
 *
 * The new ProtectedRoute (src/routes/ProtectedRoute.jsx) accepts an
 * optional `allowedRoles` prop that handles both authentication and
 * role checks in a single component.
 *
 * This file is kept to avoid import errors. It re-exports ProtectedRoute.
 */
export { default } from '../routes/ProtectedRoute'
