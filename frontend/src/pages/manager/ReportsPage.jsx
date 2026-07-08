import PageShell from '../../components/ui/PageShell'
import StatCard from '../../components/ui/StatCard'
import { PrimaryButton, SecondaryButton } from '../../components/ui/Buttons'

function ReportsPage() {
  return (
    <PageShell
      breadcrumbItems={[{ label: 'Home', href: '/manager/dashboard' }, { label: 'Reports' }]}
      title="Performance Reports"
      subtitle="Review operational health and business insights."
      actions={<><SecondaryButton className="me-2">Schedule</SecondaryButton><PrimaryButton>Run report</PrimaryButton></>}
    >
      <div className="row g-4">
        <div className="col-md-4">
          <StatCard title="Spend trend" value="12.4%" detail="Quarter-over-quarter" icon="📊" tone="primary" />
        </div>
        <div className="col-md-4">
          <StatCard title="Approval cycle" value="3.2d" detail="Average lead time" icon="⏱" tone="warning" />
        </div>
        <div className="col-md-4">
          <StatCard title="Supplier health" value="91%" detail="On-time rate" icon="✓" tone="success" />
        </div>
      </div>
    </PageShell>
  )
}

export default ReportsPage
