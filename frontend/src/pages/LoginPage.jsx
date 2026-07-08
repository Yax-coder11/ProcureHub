import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import AuthLayout from '../components/AuthLayout'
import { useAuth } from '../context/AuthContext'
import { getDashboardPath } from '../utils/roleRoutes'

function LoginPage() {
  const navigate   = useNavigate()
  const location   = useLocation()
  const { login }  = useAuth()

  const [form, setForm]     = useState({ username: '', password: '' })
  const [error, setError]   = useState('')
  const [loading, setLoading] = useState(false)

  // If the user was redirected here from a protected page, send them back there after login.
  const intendedPath = location.state?.from?.pathname || null

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setLoading(true)

    if (form.password.length < 8) {
      setError('Password must be at least 8 characters long.')
      setLoading(false)
      return
    }

    try {
      /**
       * useAuth().login() internally calls authService.login(), which:
       *   1. Calls POST /api/auth/login/
       *   2. Writes tokens to localStorage (via storage.js) BEFORE returning
       *   3. Updates AuthContext state
       *
       * By the time navigate() is called below, the token is ALREADY in
       * localStorage. The Axios interceptor will find it immediately.
       * This eliminates the race condition that caused the 401 on dashboard load.
       */
      const user = await login(form.username, form.password)
      const destination = intendedPath || getDashboardPath(user?.role)
      navigate(destination, { replace: true })
    } catch (err) {
      const detail = err.response?.data
      const message =
        detail?.detail ||
        detail?.non_field_errors?.[0] ||
        'Unable to sign in. Please check your credentials.'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout title="Sign in" subtitle="Access your ProcureHub workspace">
      <form onSubmit={handleSubmit} className="needs-validation" noValidate>
        {error && <div className="alert alert-danger py-2">{error}</div>}

        <div className="mb-3">
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

        <div className="mb-3">
          <label className="form-label fw-medium">Password</label>
          <input
            type="password"
            className="form-control"
            name="password"
            value={form.password}
            onChange={handleChange}
            autoComplete="current-password"
            required
          />
        </div>

        <button className="btn btn-primary w-100" type="submit" disabled={loading}>
          {loading ? (
            <>
              <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true" />
              Signing in…
            </>
          ) : (
            'Login'
          )}
        </button>
      </form>

      <div className="d-flex justify-content-between mt-3 small">
        <Link to="/forgot-password">Forgot password?</Link>
        <Link to="/signup">Create account</Link>
      </div>
    </AuthLayout>
  )
}

export default LoginPage
