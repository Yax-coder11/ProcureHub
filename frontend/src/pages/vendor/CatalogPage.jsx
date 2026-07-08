import PageShell from '../../components/ui/PageShell'
import DataTable from '../../components/ui/DataTable'
import StatusBadge from '../../components/ui/StatusBadge'
import SearchBar from '../../components/ui/SearchBar'
import FilterBar from '../../components/ui/FilterBar'
import { PrimaryButton, SecondaryButton } from '../../components/ui/Buttons'

function CatalogPage() {
  const rows = []

  return (
    <PageShell
      breadcrumbItems={[{ label: 'Home', href: '/vendor/dashboard' }, { label: 'Catalog' }]}
      title="Supplier Catalog"
      subtitle="Maintain items, price lists, and availability."
      actions={<><SecondaryButton className="me-2">Import</SecondaryButton><PrimaryButton>New item</PrimaryButton></>}
    >
      <div className="card shadow-sm border-0">
        <div className="card-body">
          <div className="d-flex flex-column flex-lg-row justify-content-between align-items-lg-center gap-3 mb-3">
            <h5 className="fw-semibold mb-0">Catalog entries</h5>
            <FilterBar>
              <SearchBar placeholder="Search catalog" />
              <SecondaryButton>Filters</SecondaryButton>
            </FilterBar>
          </div>
          <DataTable
            columns={[
              { key: 'sku', label: 'SKU' },
              { key: 'description', label: 'Description' },
              { key: 'price', label: 'Price' },
              { key: 'status', label: 'Status', render: (row) => <StatusBadge status={row.status} /> },
            ]}
            rows={rows}
            emptyMessage="No catalog items available yet."
          />
        </div>
      </div>
    </PageShell>
  )
}

export default CatalogPage
