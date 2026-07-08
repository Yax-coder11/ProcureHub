import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import AuthLayout from '../components/AuthLayout'
import { useAuth } from '../context/AuthContext'
import { register } from '../services/authService'
import { getDashboardPath } from '../utils/roleRoutes'

function SignupPage() {
  const navigate      = useNavigate()
  const { login }     = useAuth()

  const [form, setForm] = useState({
    username:         '',
    email:            '',
    password:         '',
    password_confirm: '',
    first_name:       '',
    last_name:        '',
    role:             'vendor',
  })
  const [error, setError]     = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setLoading(true)

    // Basic client-side check — server also validates
    if (form.password.length < 8) {
      setError('Password must be at least 8 characters long.')
      setLoading(false)
      return
    }

    if (form.password !== form.password_confirm) {
      setError('Passwords do not match.')
      setLoading(false)
      return
    }

    try {
      // Step 1: Register the account
      await register(form)

      // Step 2: Log in using AuthContext.login() which handles all token storage
      const user = await login(form.username, form.password)
      navigate(getDashboardPath(user?.role), { replace: true })
    } catch (err) {
      const detail = err.response?.data
      if (!detail) {
        setError('Unable to create your account. Please try again.')
        return
      }
      // Flatten all DRF field errors and non_field_errors into a single message
      const messages = Object.entries(detail)
        .flatMap(([key, val]) => {
          const msgs = Array.isArray(val) ? val : [val]
          // Prefix field name for context, skip for non_field_errors
          return msgs.map(m =>
            key === 'non_field_errors' ? String(m) : `${key}: ${String(m)}`
          )
        })
      setError(messages.join(' · ') || 'Unable to create your account.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout title="Create account" subtitle="Join ProcureHub as a team member">
      <form onSubmit={handleSubmit} className="needs-validation" noValidate>
        {error && <div className="alert alert-danger py-2">{error}</div>}

        <div className="row g-3">
          <div className="col-md-6">
            <label className="form-label fw-medium">First name</label>
            <input className="form-control" name="first_name" value={form.first_name} onChange={handleChange} />
          </div>
          <div className="col-md-6">
            <label className="form-label fw-medium">Last name</label>
            <input className="form-control" name="last_name" value={form.last_name} onChange={handleChange} />
          </div>
          <div className="col-12">
            <label className="form-label fw-medium">Username</label>
            <input
              className="form-control"
              name="username"
              value={form.username}
              onChange={handleChange}
              autoComplete="username"
              required
            />
          </div>
          <div className="col-12">
            <label className="form-label fw-medium">Email</label>
            <input
              type="email"
              className="form-control"
              name="email"
              value={form.email}
              onChange={handleChange}
              autoComplete="email"
              required
            />
          </div>
          <div className="col-12">
            <label className="form-label fw-medium">Role</label>
            <select className="form-select" name="role" value={form.role} onChange={handleChange}>
              <option value="vendor">Vendor</option>
              <option value="manager">Manager</option>
              <option value="procurement_officer">Procurement Officer</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <div className="col-12">
            <label className="form-label fw-medium">Password</label>
            <input
              type="password"
              className="form-control"
              name="password"
              value={form.password}
              onChange={handleChange}
              autoComplete="new-password"
              required
            />
          </div>
          <div className="col-12">
            <label className="form-label fw-medium">Confirm password</label>
            <input
              type="password"
              className="form-control"
              name="password_confirm"
              value={form.password_confirm}
              onChange={handleChange}
              autoComplete="new-password"
              required
            />
          </div>
        </div>

        <button className="btn btn-primary w-100 mt-4" type="submit" disabled={loading}>
          {loading ? (
            <>
              <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true" />
              Creating account…
            </>
          ) : (
            'Create account'
          )}
        </button>
      </form>

      <p className="mt-3 mb-0 text-center small">
        Already have an account? <Link to="/login">Sign in</Link>
      </p>
    </AuthLayout>
  )
}

export default SignupPage
