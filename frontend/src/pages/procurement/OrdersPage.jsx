import PageShell from '../../components/ui/PageShell'
import DataTable from '../../components/ui/DataTable'
import StatusBadge from '../../components/ui/StatusBadge'
import SearchBar from '../../components/ui/SearchBar'
import FilterBar from '../../components/ui/FilterBar'
import { PrimaryButton, SecondaryButton } from '../../components/ui/Buttons'

function OrdersPage() {
  const rows = []

  return (
    <PageShell
      breadcrumbItems={[{ label: 'Home', href: '/procurement/dashboard' }, { label: 'Orders' }]}
      title="Purchase Orders"
      subtitle="Track approved orders and supplier commitments."
      actions={<><SecondaryButton className="me-2">Export</SecondaryButton><PrimaryButton>New order</PrimaryButton></>}
    >
      <div className="card shadow-sm border-0">
        <div className="card-body">
          <div className="d-flex flex-column flex-lg-row justify-content-between align-items-lg-center gap-3 mb-3">
            <h5 className="fw-semibold mb-0">Order register</h5>
            <FilterBar>
              <SearchBar placeholder="Search orders" />
              <SecondaryButton>Filters</SecondaryButton>
            </FilterBar>
          </div>
          <DataTable
            columns={[
              { key: 'reference', label: 'Reference' },
              { key: 'supplier', label: 'Supplier' },
              { key: 'amount', label: 'Amount' },
              { key: 'status', label: 'Status', render: (row) => <StatusBadge status={row.status} /> },
            ]}
            rows={rows}
            emptyMessage="No purchase orders available yet."
          />
        </div>
      </div>
    </PageShell>
  )
}

export default OrdersPage
