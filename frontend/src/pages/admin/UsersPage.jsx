import PageShell from '../../components/ui/PageShell'
import DataTable from '../../components/ui/DataTable'
import StatusBadge from '../../components/ui/StatusBadge'
import SearchBar from '../../components/ui/SearchBar'
import FilterBar from '../../components/ui/FilterBar'
import { PrimaryButton, SecondaryButton } from '../../components/ui/Buttons'

function UsersPage() {
  const rows = []

  return (
    <PageShell
      breadcrumbItems={[{ label: 'Home', href: '/admin/dashboard' }, { label: 'Users' }]}
      title="User Administration"
      subtitle="Manage users and permissions across the platform."
      actions={<><SecondaryButton className="me-2">Export</SecondaryButton><PrimaryButton>New user</PrimaryButton></>}
    >
      <div className="card shadow-sm border-0">
        <div className="card-body">
          <div className="d-flex flex-column flex-lg-row justify-content-between align-items-lg-center gap-3 mb-3">
            <h5 className="fw-semibold mb-0">User directory</h5>
            <FilterBar>
              <SearchBar placeholder="Search users" />
              <SecondaryButton>Filters</SecondaryButton>
            </FilterBar>
          </div>
          <DataTable
            columns={[
              { key: 'name', label: 'Name' },
              { key: 'email', label: 'Email' },
              { key: 'role', label: 'Role' },
              { key: 'status', label: 'Status', render: (row) => <StatusBadge status={row.status} /> },
            ]}
            rows={rows}
            emptyMessage="No users available yet."
          />
        </div>
      </div>
    </PageShell>
  )
}

export default UsersPage
