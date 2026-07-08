function PageHeader({ title, subtitle, actions }) {
  return (
    <div className="d-flex flex-column flex-lg-row justify-content-between align-items-lg-center gap-3 mb-4">
      <div>
        <h3 className="fw-bold mb-1">{title}</h3>
        {subtitle ? <p className="text-muted mb-0">{subtitle}</p> : null}
      </div>
      {actions ? <div>{actions}</div> : null}
    </div>
  )
}

export default PageHeader
