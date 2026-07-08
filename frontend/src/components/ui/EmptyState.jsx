function EmptyState({ title, description, action }) {
  return (
    <div className="card shadow-sm border-0">
      <div className="card-body text-center py-5">
        <h5 className="fw-semibold">{title}</h5>
        <p className="text-muted mb-3">{description}</p>
        {action}
      </div>
    </div>
  )
}

export default EmptyState
