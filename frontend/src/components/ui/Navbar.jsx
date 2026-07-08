import { useAuth } from '../../context/AuthContext'
import ProfileDropdown from '../ProfileDropdown'

/**
 * Navbar — top application bar.
 * Reads user data from AuthContext. No props required — the layout
 * no longer needs to pass user down as a prop.
 */
function Navbar() {
  const { user } = useAuth()

  return (
    <header className="bg-white border-bottom px-4 py-3 d-flex align-items-center justify-content-between">
      <div>
        <h5 className="mb-0 fw-semibold">
          {user?.first_name
            ? `${user.first_name}${user.last_name ? ` ${user.last_name}` : ''}`
            : user?.username || 'User'}
        </h5>
        <div className="text-muted small">Enterprise workspace</div>
      </div>
      <div className="d-flex align-items-center gap-3">
        {user?.email && (
          <div className="text-muted small d-none d-md-block">{user.email}</div>
        )}
        <ProfileDropdown />
      </div>
    </header>
  )
}

export default Navbar
