import { useState } from 'react'
import PageShell from '../../components/ui/PageShell'
import DataTable from '../../components/ui/DataTable'
import StatusBadge from '../../components/ui/StatusBadge'
import SearchBar from '../../components/ui/SearchBar'
import FilterBar from '../../components/ui/FilterBar'
import { PrimaryButton, SecondaryButton } from '../../components/ui/Buttons'

const initialRows = [
  { id: '1', reference: 'RFQ-2026-001', title: 'Laptop Sourcing - Q3', officer: 'Rahul Sharma', deadline: '2026-08-15', status: 'assigned' },
  { id: '2', reference: 'RFQ-2026-003', title: 'Office Furniture Upgrade', officer: 'Amit Verma', deadline: '2026-08-20', status: 'quoted' },
  { id: '3', reference: 'RFQ-2026-005', title: 'Server Rack Cabling', officer: 'Rahul Sharma', deadline: '2026-07-05', status: 'closed' },
  { id: '4', reference: 'RFQ-2026-008', title: 'Industrial Safety Helmets', officer: 'Vikas Patel', deadline: '2026-09-01', status: 'assigned' },
  { id: '5', reference: 'RFQ-2026-012', title: 'Corporate Catering Services', officer: 'Sandra Dsouza', deadline: '2026-08-10', status: 'quoted' },
]

export default function RfqsPage() {
  const [rows] = useState(initialRows)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  // Handle client-side search and filtering
  const filteredRows = rows.filter((row) => {
    const matchesSearch =
      row.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      row.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
      row.officer.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === 'all' || row.status === statusFilter

    return matchesSearch && matchesStatus
  })

  return (
    <PageShell
      breadcrumbItems={[{ label: 'Home', href: '/vendor/dashboard' }, { label: 'Assigned RFQs' }]}
      title="Assigned RFQs"
      subtitle="Review requests assigned to your organization, and submit bid quotations."
      actions={
        <>
          <SecondaryButton className="me-2" onClick={() => alert('Exporting RFQ list...')}>
            Export List
          </SecondaryButton>
        </>
      }
    >
      <div className="card shadow-sm border-0">
        <div className="card-body">
          {/* Search and Filters */}
          <div className="d-flex flex-column flex-lg-row justify-content-between align-items-lg-center gap-3 mb-3">
            <h5 className="fw-semibold mb-0">RFQ Registry</h5>
            <FilterBar>
              <SearchBar
                placeholder="Search by Title, Ref, Officer"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <select
                className="form-select select-field"
                style={{ width: '160px', height: '40px' }}
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Statuses</option>
                <option value="assigned">Assigned</option>
                <option value="quoted">Quoted</option>
                <option value="closed">Closed</option>
              </select>
            </FilterBar>
          </div>

          {/* Data Table */}
          <DataTable
            columns={[
              { key: 'reference', label: 'Reference Code' },
              { key: 'title', label: 'RFQ Title' },
              { key: 'officer', label: 'Sourcing Officer' },
              { key: 'deadline', label: 'Deadline Date' },
              { key: 'status', label: 'Workflow Status', render: (row) => <StatusBadge status={row.status} /> },
              {
                key: 'actions',
                label: 'Actions',
                render: (row) => (
                  <div className="d-flex gap-1 justify-content-end">
                    <SecondaryButton
                      size="sm"
                      onClick={() => alert(`Viewing details for ${row.reference}`)}
                    >
                      View Details
                    </SecondaryButton>
                    {row.status === 'assigned' && (
                      <PrimaryButton
                        size="sm"
                        onClick={() => alert(`Opening bidding sheet for ${row.reference}`)}
                      >
                        Submit Quotation
                      </PrimaryButton>
                    )}
                  </div>
                ),
              },
            ]}
            rows={filteredRows}
            emptyMessage="No assigned RFQs match your filters."
          />
        </div>
      </div>
    </PageShell>
  )
}
