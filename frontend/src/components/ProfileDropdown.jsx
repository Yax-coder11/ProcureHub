import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function ProfileDropdown() {
  const navigate          = useNavigate()
  const { user, logout }  = useAuth()
  const [open, setOpen]   = useState(false)

  const handleLogout = async () => {
    setOpen(false)
    await logout()     // authService.logout() clears storage + blacklists token
    navigate('/login', { replace: true })
  }

  const displayName = user?.first_name || user?.username || 'Account'
  const roleLabel   = user?.role?.replace(/_/g, ' ') ?? ''

  return (
    <div className="dropdown">
      <button
        className="btn btn-outline-secondary btn-sm dropdown-toggle"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        type="button"
      >
        {displayName}
      </button>

      {open && (
        <>
          {/* Backdrop — click anywhere outside to close */}
          <div
            className="position-fixed top-0 start-0 w-100 h-100"
            style={{ zIndex: 999 }}
            onClick={() => setOpen(false)}
          />
          <ul
            className="dropdown-menu show mt-2 position-absolute"
            style={{ right: 0, left: 'auto', minWidth: '180px', zIndex: 1000 }}
          >
            <li className="px-3 py-2">
              <div className="fw-semibold small">{user?.username}</div>
              <div className="text-muted small text-capitalize">{roleLabel}</div>
              {user?.email && (
                <div className="text-muted" style={{ fontSize: '0.7rem' }}>{user.email}</div>
              )}
            </li>
            <li><hr className="dropdown-divider" /></li>
            <li>
              <button className="dropdown-item text-danger" onClick={handleLogout}>
                <i className="bi bi-box-arrow-right me-2" />
                Logout
              </button>
            </li>
          </ul>
        </>
      )}
    </div>
  )
}

export default ProfileDropdown
