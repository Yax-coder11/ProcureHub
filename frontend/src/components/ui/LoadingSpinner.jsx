function LoadingSpinner({ label = 'Loading…' }) {
  return (
    <div className="d-flex justify-content-center align-items-center py-5">
      <div className="spinner-border text-primary me-3" role="status" />
      <span className="text-muted">{label}</span>
    </div>
  )
}

export default LoadingSpinner
