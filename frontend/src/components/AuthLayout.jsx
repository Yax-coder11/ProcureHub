import { Link } from 'react-router-dom'

function AuthLayout({ title, subtitle, children }) {
  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light px-3 py-5">
      <div className="card shadow-sm border-0" style={{ maxWidth: '480px', width: '100%' }}>
        <div className="card-body p-4 p-md-5">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <h2 className="fw-bold mb-1">ProcureHub</h2>
              <p className="text-muted mb-0">{subtitle}</p>
            </div>
            <Link to="/" className="btn btn-outline-secondary btn-sm">Home</Link>
          </div>
          <h3 className="fw-semibold mb-3">{title}</h3>
          {children}
        </div>
      </div>
    </div>
  )
}

export default AuthLayout
