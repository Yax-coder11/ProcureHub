import PageShell from './PageShell'

/**
 * ComingSoon — generic placeholder for pages not yet built.
 * Uses the same PageShell wrapper so it looks like a real page.
 */
function ComingSoon({ title, subtitle }) {
  return (
    <PageShell title={title} subtitle={subtitle}>
      <div className="card shadow-sm border-0">
        <div className="card-body text-center py-5">
          <i className="bi bi-tools text-muted" style={{ fontSize: '2.5rem' }} />
          <h5 className="mt-3 mb-1 fw-semibold">Coming Soon</h5>
          <p className="text-muted mb-0">This module is under construction. Check back soon.</p>
        </div>
      </div>
    </PageShell>
  )
}

export default ComingSoon
