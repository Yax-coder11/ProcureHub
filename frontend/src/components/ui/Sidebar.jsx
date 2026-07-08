import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

/**
 * Sidebar — fully dynamic, data-driven.
 *
 * Props:
 *   user       – current user object from AuthContext
 *   menuItems  – Array<{ label: string, icon: string, path: string }>
 *                Populated from /api/dashboard/ response (sidebar field).
 *
 * Auth state (logout) comes from AuthContext. No direct localStorage access.
 */
function Sidebar({ user, menuItems = [] }) {
  const navigate      = useNavigate()
  const { logout }    = useAuth()

  const handleLogout = async () => {
    await logout()
    navigate('/login', { replace: true })
  }

  const roleLabel = user?.role
    ? user.role.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
    : 'User'

  return (
    <aside
      className="d-flex flex-column bg-dark text-white flex-shrink-0"
      style={{ width: '260px', minHeight: '100vh' }}
    >
      {/* Brand */}
      <div className="p-4 border-bottom border-secondary">
        <h5 className="mb-0 fw-bold text-white">ProcureHub</h5>
        <div className="text-white-50 small mt-1">{roleLabel}</div>
      </div>

      {/* Navigation */}
      <nav className="flex-grow-1 p-3" style={{ overflowY: 'auto' }}>
        {menuItems.length === 0
          ? Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="rounded px-3 py-2 mb-2 bg-secondary bg-opacity-25"
                style={{ height: '36px' }}
              />
            ))
          : menuItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `d-flex align-items-center gap-2 text-decoration-none rounded px-3 py-2 mb-1 ${
                    isActive ? 'bg-primary text-white' : 'text-white-50'
                  }`
                }
              >
                <i className={`bi ${item.icon}`} style={{ fontSize: '1rem', width: '1.1rem' }} />
                <span className="small fw-medium">{item.label}</span>
              </NavLink>
            ))}
      </nav>

      {/* Logout */}
      <div className="p-3 border-top border-secondary">
        <button
          className="btn btn-outline-danger btn-sm w-100 d-flex align-items-center justify-content-center gap-2"
          onClick={handleLogout}
          type="button"
        >
          <i className="bi bi-box-arrow-right" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  )
}

export default Sidebar
