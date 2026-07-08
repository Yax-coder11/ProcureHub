import PageShell from '../../components/ui/PageShell'
import DataTable from '../../components/ui/DataTable'
import StatusBadge from '../../components/ui/StatusBadge'
import SearchBar from '../../components/ui/SearchBar'
import FilterBar from '../../components/ui/FilterBar'
import { PrimaryButton, SecondaryButton } from '../../components/ui/Buttons'

function ApprovalsPage() {
  const rows = []

  return (
    <PageShell
      breadcrumbItems={[{ label: 'Home', href: '/manager/dashboard' }, { label: 'Approvals' }]}
      title="Approval Queue"
      subtitle="Review pending items and route them to the right workflow."
      actions={<><SecondaryButton className="me-2">Bulk action</SecondaryButton><PrimaryButton>Approve all</PrimaryButton></>}
    >
      <div className="card shadow-sm border-0">
        <div className="card-body">
          <div className="d-flex flex-column flex-lg-row justify-content-between align-items-lg-center gap-3 mb-3">
            <h5 className="fw-semibold mb-0">Pending items</h5>
            <FilterBar>
              <SearchBar placeholder="Search approvals" />
              <SecondaryButton>Filters</SecondaryButton>
            </FilterBar>
          </div>
          <DataTable
            columns={[
              { key: 'request', label: 'Request' },
              { key: 'owner', label: 'Owner' },
              { key: 'status', label: 'Status', render: (row) => <StatusBadge status={row.status} /> },
            ]}
            rows={rows}
            emptyMessage="No approvals pending."
          />
        </div>
      </div>
    </PageShell>
  )
}

export default ApprovalsPage
