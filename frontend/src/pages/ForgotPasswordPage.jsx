import { useState } from 'react'
import { Link } from 'react-router-dom'
import AuthLayout from '../components/AuthLayout'

function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (event) => {
    event.preventDefault()
    setSubmitted(true)
  }

  return (
    <AuthLayout title="Reset password" subtitle="Secure recovery for your account">
      {submitted ? (
        <div className="alert alert-success">
          If an account exists for <strong>{email}</strong>, a reset link will be sent shortly.
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">Email address</label>
            <input
              type="email"
              className="form-control"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </div>
          <button className="btn btn-primary w-100">Send reset instructions</button>
        </form>
      )}
      <div className="mt-3 text-center">
        <Link to="/login">Return to login</Link>
      </div>
    </AuthLayout>
  )
}

export default ForgotPasswordPage
