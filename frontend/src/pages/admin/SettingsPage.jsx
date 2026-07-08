import PageShell from '../../components/ui/PageShell'
import { PrimaryButton, SecondaryButton } from '../../components/ui/Buttons'

function SettingsPage() {
  return (
    <PageShell
      breadcrumbItems={[{ label: 'Home', href: '/admin/dashboard' }, { label: 'Settings' }]}
      title="Platform Settings"
      subtitle="Configure system defaults and operational preferences."
      actions={<><SecondaryButton className="me-2">Reset</SecondaryButton><PrimaryButton>Save</PrimaryButton></>}
    >
      <div className="row g-4">
        <div className="col-lg-6">
          <div className="card shadow-sm border-0">
            <div className="card-body">
              <h5 className="fw-semibold mb-3">Workflow defaults</h5>
              <p className="text-muted">Approval thresholds, reminder cadence, and routing preferences are configured here.</p>
            </div>
          </div>
        </div>
        <div className="col-lg-6">
          <div className="card shadow-sm border-0">
            <div className="card-body">
              <h5 className="fw-semibold mb-3">Security policies</h5>
              <p className="text-muted">Session settings, password policy, and audit logging can be managed centrally.</p>
            </div>
          </div>
        </div>
      </div>
    </PageShell>
  )
}

export default SettingsPage
