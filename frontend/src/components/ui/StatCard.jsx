/**
 * StatCard
 *
 * Reusable statistics card used across all role dashboards.
 *
 * Props:
 *   title  – stat label                           (string)
 *   value  – primary number or text               (string | number)
 *   detail – secondary descriptive line           (string, optional)
 *   icon   – Bootstrap Icon node or emoji string  (ReactNode | string)
 *   tone   – Bootstrap color name                 (string, default "primary")
 */
function StatCard({ title, value, detail, icon, tone = 'primary' }) {
  return (
    <div className="card shadow-sm border-0 h-100">
      <div className="card-body">
        <div className="d-flex justify-content-between align-items-start">
          <div className="flex-grow-1 me-3">
            <div className="text-muted small fw-medium">{title}</div>
            <div className="fs-3 fw-bold mt-1 text-dark">{value ?? '—'}</div>
            {detail ? (
              <div className="text-muted small mt-1">{detail}</div>
            ) : null}
          </div>
          <div
            className={`rounded-circle bg-${tone} bg-opacity-10 d-flex align-items-center justify-content-center flex-shrink-0`}
            style={{ width: '48px', height: '48px', fontSize: '1.25rem' }}
          >
            <span className={`text-${tone}`}>{icon}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default StatCard
