import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import useDashboard from '../hooks/useDashboard'
import PageShell from '../components/ui/PageShell'
import StatCard from '../components/ui/StatCard'
import DataTable from '../components/ui/DataTable'
import StatusBadge from '../components/ui/StatusBadge'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import { PrimaryButton, SecondaryButton } from '../components/ui/Buttons'

// ---------------------------------------------------------------------------
// Formatters
// ---------------------------------------------------------------------------

const DATE_KEYS  = new Set(['created_at', 'updated_at', 'submitted_at', 'due_date', 'deadline'])
const MONEY_KEYS = new Set(['total_amount', 'total_price', 'amount', 'unit_price'])

function fmtDate(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
  })
}

function fmtCurrency(val) {
  if (val === null || val === undefined) return '—'
  return new Intl.NumberFormat('en-US', {
    style: 'currency', currency: 'USD', minimumFractionDigits: 0,
  }).format(val)
}

function renderCell(col, row) {
  const val = row[col.key]
  if (col.key === 'status')      return <StatusBadge status={val} />
  if (DATE_KEYS.has(col.key))    return fmtDate(val)
  if (MONEY_KEYS.has(col.key))   return fmtCurrency(val)
  if (val === null || val === undefined || val === '') return '—'
  return val
}

// ---------------------------------------------------------------------------
// Role metadata — page titles only. All data comes from the API.
// ---------------------------------------------------------------------------

const ROLE_META = {
  admin: {
    title:    'Administration',
    subtitle: 'System-wide overview. All counts are live from the database.',
  },
  procurement_officer: {
    title:    'Procurement Operations',
    subtitle: 'Manage vendors, RFQs, quotations, and purchase orders.',
  },
  manager: {
    title:    'Management Overview',
    subtitle: 'Review and approve purchase orders raised by procurement.',
  },
  vendor: {
    title:    'Vendor Workspace',
    subtitle: 'Track your assigned RFQs, quotations, orders, and invoices.',
  },
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function StatsGrid({ stats }) {
  if (!stats?.length) return null
  const colClass = stats.length <= 3
    ? 'col-sm-6 col-xl-4'
    : `col-sm-6 col-xl-${Math.max(2, Math.floor(12 / Math.min(stats.length, 6)))}`
  return (
    <div className="row g-4 mb-4">
      {stats.map((stat) => (
        <div key={stat.key} className={colClass}>
          <StatCard
            title={stat.title}
            value={stat.value}
            detail={stat.detail}
            icon={<i className={`bi ${stat.icon}`} />}
            tone={stat.tone}
          />
        </div>
      ))}
    </div>
  )
}

function QuickActions({ actions }) {
  const navigate = useNavigate()
  if (!actions?.length) return null
  return (
    <div className="card shadow-sm border-0 mb-4">
      <div className="card-body">
        <h6 className="fw-semibold text-uppercase text-muted mb-3"
            style={{ fontSize: '0.72rem', letterSpacing: '0.05em' }}>
          Quick Actions
        </h6>
        <div className="d-flex flex-wrap gap-2">
          {actions.map((action) =>
            action.tone === 'primary' ? (
              <PrimaryButton key={action.label} onClick={() => navigate(action.path)}>
                {action.label}
              </PrimaryButton>
            ) : (
              <SecondaryButton key={action.label} onClick={() => navigate(action.path)}>
                {action.label}
              </SecondaryButton>
            )
          )}
        </div>
      </div>
    </div>
  )
}

function ActivitySection({ section, columns, rows }) {
  const enriched = columns.map((col) => ({
    ...col,
    render: (row) => renderCell(col, row),
  }))
  return (
    <div className="mb-4">
      <h6 className="fw-semibold text-muted text-uppercase mb-3"
          style={{ fontSize: '0.72rem', letterSpacing: '0.05em' }}>
        {section}
      </h6>
      <DataTable
        columns={enriched}
        rows={rows}
        emptyMessage={`No ${section.toLowerCase()} found.`}
      />
    </div>
  )
}

function ErrorBanner({ message, onRetry }) {
  return (
    <div className="alert alert-danger d-flex align-items-center justify-content-between" role="alert">
      <span>{message}</span>
      <button className="btn btn-sm btn-outline-danger ms-3" onClick={onRetry}>
        Retry
      </button>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------

function DashboardPage() {
  const { user, role }                                      = useAuth()
  const { stats, quickActions, activities, loading, error, refresh } = useDashboard()

  if (!user) return null

  const meta = ROLE_META[role] ?? { title: 'Dashboard', subtitle: '' }
  const greeting = user.first_name
    ? `Welcome back, ${user.first_name}.`
    : `Welcome back, ${user.username}.`

  return (
    <PageShell
      breadcrumbItems={[{ label: 'Home', href: '/' }, { label: meta.title }]}
      title={meta.title}
      subtitle={`${greeting} ${meta.subtitle}`}
    >
      {loading ? (
        <LoadingSpinner label="Loading dashboard…" />
      ) : error ? (
        <ErrorBanner message={error} onRetry={refresh} />
      ) : (
        <>
          <StatsGrid stats={stats} />
          <QuickActions actions={quickActions} />

          <div className="card shadow-sm border-0">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h5 className="fw-semibold mb-0">Recent Activity</h5>
                <button
                  className="btn btn-sm btn-outline-secondary d-flex align-items-center gap-1"
                  onClick={refresh}
                  title="Refresh dashboard"
                >
                  <i className="bi bi-arrow-clockwise" />
                  Refresh
                </button>
              </div>

              {activities.length === 0 ? (
                <div className="text-center text-muted py-5">
                  <i className="bi bi-inbox" style={{ fontSize: '2rem' }} />
                  <p className="mt-2 mb-0">No activity to show yet.</p>
                </div>
              ) : (
                activities.map((section) => (
                  <ActivitySection
                    key={section.section}
                    section={section.section}
                    columns={section.columns}
                    rows={section.rows}
                  />
                ))
              )}
            </div>
          </div>
        </>
      )}
    </PageShell>
  )
}

export default DashboardPage
