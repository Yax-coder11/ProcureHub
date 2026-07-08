import PageShell from '../../components/ui/PageShell'
import DataTable from '../../components/ui/DataTable'
import StatusBadge from '../../components/ui/StatusBadge'
import SearchBar from '../../components/ui/SearchBar'
import FilterBar from '../../components/ui/FilterBar'
import { PrimaryButton, SecondaryButton } from '../../components/ui/Buttons'

function VendorOrdersPage() {
  const rows = []

  return (
    <PageShell
      breadcrumbItems={[{ label: 'Home', href: '/vendor/dashboard' }, { label: 'Orders' }]}
      title="Vendor Orders"
      subtitle="Track shipment commitments and order progress."
      actions={<><SecondaryButton className="me-2">Export</SecondaryButton><PrimaryButton>Update status</PrimaryButton></>}
    >
      <div className="card shadow-sm border-0">
        <div className="card-body">
          <div className="d-flex flex-column flex-lg-row justify-content-between align-items-lg-center gap-3 mb-3">
            <h5 className="fw-semibold mb-0">Incoming orders</h5>
            <FilterBar>
              <SearchBar placeholder="Search orders" />
              <SecondaryButton>Filters</SecondaryButton>
            </FilterBar>
          </div>
          <DataTable
            columns={[
              { key: 'reference', label: 'Reference' },
              { key: 'customer', label: 'Customer' },
              { key: 'amount', label: 'Amount' },
              { key: 'status', label: 'Status', render: (row) => <StatusBadge status={row.status} /> },
            ]}
            rows={rows}
            emptyMessage="No vendor orders available yet."
          />
        </div>
      </div>
    </PageShell>
  )
}

export default VendorOrdersPage
