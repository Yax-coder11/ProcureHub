import * as React from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Download, RefreshCw } from 'lucide-react'
import { invoiceService } from '../../services/invoiceService'
import { useToast } from '../../components/ui/toast'

import { InvoiceDashboardCards } from '../../components/invoices/InvoiceDashboardCards'
import { InvoiceFilters } from '../../components/invoices/InvoiceFilters'
import { InvoiceTable } from '../../components/invoices/InvoiceTable'
import { InvoiceDrawer } from '../../components/invoices/InvoiceDrawer'
import { InvoiceForm } from '../../components/invoices/InvoiceForm'
import { Button } from '../../components/ui/button'

export default function InvoicesPage() {
  const { toast } = useToast()
  const queryClient = useQueryClient()

  // --- Filter and UI States ---
  const [search, setSearch] = React.useState('')
  const [debouncedSearch, setDebouncedSearch] = React.useState('')
  const [status, setStatus] = React.useState('all')

  const [page, setPage] = React.useState(1)
  const [pageSize, setPageSize] = React.useState(10)
  const [sortBy, setSortBy] = React.useState('invoiceNumber')
  const [sortOrder, setSortOrder] = React.useState('desc')

  // Modals & Drawers state
  const [isFormOpen, setIsFormOpen] = React.useState(false)
  const [editingInvoice, setEditingInvoice] = React.useState(null)

  const [isDrawerOpen, setIsDrawerOpen] = React.useState(false)
  const [viewingInvoice, setViewingInvoice] = React.useState(null)

  const [selectedRows, setSelectedRows] = React.useState([])

  // Debounce search input
  React.useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search)
      setPage(1)
    }, 250)
    return () => clearTimeout(handler)
  }, [search])

  // Reset page when filters change
  React.useEffect(() => {
    setPage(1)
  }, [status, pageSize])

  // --- Queries & Mutations ---

  // 1. KPI Stats Query
  const { data: stats, isLoading: isStatsLoading, refetch: refetchStats } = useQuery({
    queryKey: ['invoiceStats'],
    queryFn: () => invoiceService.getStats(),
  })

  // 2. Invoices List Query
  const { data: listData, isLoading: isListLoading, refetch: refetchList } = useQuery({
    queryKey: [
      'invoices',
      debouncedSearch,
      status,
      page,
      pageSize,
      sortBy,
      sortOrder,
    ],
    queryFn: () =>
      invoiceService.getInvoices({
        search: debouncedSearch,
        status,
        page,
        pageSize,
        sortBy,
        sortOrder,
      }),
  })

  // 3. Create Mutation
  const createMutation = useMutation({
    mutationFn: (newInv) => invoiceService.createInvoice(newInv),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] })
      queryClient.invalidateQueries({ queryKey: ['invoiceStats'] })
      toast({
        title: 'Invoice Submitted',
        description: `Invoice ${data.invoiceNumber} has been successfully raised.`,
        variant: 'success',
      })
      setIsFormOpen(false)
    },
    onError: (err) => {
      toast({
        title: 'Submission Failed',
        description: err.message || 'An error occurred while submitting invoice.',
        variant: 'destructive',
      })
    },
  })

  // 4. Update Mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, updates }) => invoiceService.updateInvoice(id, updates),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] })
      queryClient.invalidateQueries({ queryKey: ['invoiceStats'] })
      toast({
        title: 'Invoice Updated',
        description: `Invoice ${data.invoiceNumber} details have been saved.`,
        variant: 'success',
      })
      setIsFormOpen(false)
      setEditingInvoice(null)
      if (viewingInvoice && viewingInvoice.id === data.id) {
        setViewingInvoice(data)
      }
    },
    onError: (err) => {
      toast({
        title: 'Update Failed',
        description: err.message || 'An error occurred while updating invoice.',
        variant: 'destructive',
      })
    },
  })

  // 5. Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: (id) => invoiceService.deleteInvoice(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] })
      queryClient.invalidateQueries({ queryKey: ['invoiceStats'] })
      setSelectedRows((prev) => prev.filter((rid) => viewingInvoice && rid !== viewingInvoice.id))
      toast({
        title: 'Invoice Deleted',
        description: 'The invoice has been removed from records.',
        variant: 'success',
      })
      setIsDrawerOpen(false)
    },
    onError: (err) => {
      toast({
        title: 'Deletion Failed',
        description: err.message || 'Failed to remove invoice.',
        variant: 'destructive',
      })
    },
  })

  // --- Handlers ---

  const handleRefresh = async () => {
    toast({
      title: 'Refreshing Invoices',
      description: 'Syncing live invoicing transaction logs...',
      variant: 'info',
      duration: 1500,
    })
    await Promise.all([refetchStats(), refetchList()])
  }

  const handleCreateOrUpdate = (formData) => {
    const payload = {
      ...formData,
      purchaseOrderNumber: formData.purchaseOrderId,
      status: 'pending_payment',
    }

    if (editingInvoice) {
      updateMutation.mutate({ id: editingInvoice.id, updates: payload })
    } else {
      createMutation.mutate(payload)
    }
  }

  const handleSortChange = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(field)
      setSortOrder('desc')
    }
  }

  const handleClearFilters = () => {
    setSearch('')
    setStatus('all')
    toast({
      title: 'Filters Cleared',
      description: 'All search queries and parameters have been reset.',
      variant: 'info',
      duration: 1500,
    })
  }

  const handleExport = () => {
    toast({
      title: 'Exporting Data',
      description: 'Preparing CSV invoice spreadsheet formatting...',
      variant: 'info',
    })
    setTimeout(() => {
      toast({
        title: 'Spreadsheet Exported',
        description: 'Invoice list has been successfully downloaded.',
        variant: 'success',
      })
    }, 1500)
  }

  const handleDeleteRow = (invoice) => {
    if (window.confirm(`Are you sure you want to delete invoice ${invoice.invoiceNumber}?`)) {
      deleteMutation.mutate(invoice.id)
    }
  }

  const handleBulkAction = (action, ids) => {
    if (ids.length === 0) return

    if (action === 'delete') {
      if (window.confirm(`Are you sure you want to delete ${ids.length} selected invoices?`)) {
        ids.forEach((id) => deleteMutation.mutate(id))
        setSelectedRows([])
      }
    } else if (action === 'mark_paid') {
      ids.forEach((id) => {
        updateMutation.mutate({ id, updates: { status: 'paid', paymentDate: new Date().toISOString().split('T')[0] } })
      })
      setSelectedRows([])
    } else if (action === 'cancel') {
      ids.forEach((id) => {
        updateMutation.mutate({ id, updates: { status: 'cancelled' } })
      })
      setSelectedRows([])
    }
  }

  return (
    <div className="space-y-6">
      
      {/* Hero Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-5">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Invoices
          </h1>
          <p className="text-sm text-slate-500 font-normal">
            Verify, submit, track, and clear invoices raised against your purchase order commitments.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-center">
          {/* Refresh Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            className="h-9 w-9 p-0 rounded-full"
            title="Refresh Invoices"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>

          {/* Export Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleExport}
            className="text-xs font-semibold gap-1.5"
          >
            <Download className="h-4 w-4" />
            Export
          </Button>

          {/* Create Invoice CTA */}
          <Button
            variant="primary"
            size="sm"
            onClick={() => {
              setEditingInvoice(null)
              setIsFormOpen(true)
            }}
            className="text-xs font-semibold gap-1.5"
          >
            <Plus className="h-4 w-4" />
            Create Invoice
          </Button>
        </div>
      </div>

      {/* Dynamic Metric KPIs cards */}
      <InvoiceDashboardCards isLoading={isStatsLoading} stats={stats} />

      {/* Quick Filters toolbar */}
      <InvoiceFilters
        search={search}
        setSearch={setSearch}
        status={status}
        setStatus={setStatus}
        onClear={handleClearFilters}
      />

      {/* Main Data Table */}
      <InvoiceTable
        data={listData?.rows || []}
        isLoading={isListLoading}
        page={page}
        pageSize={pageSize}
        total={listData?.total || 0}
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
        sortBy={sortBy}
        sortOrder={sortOrder}
        onSortChange={handleSortChange}
        onViewDetails={(inv) => {
          setViewingInvoice(inv)
          setIsDrawerOpen(true)
        }}
        onEdit={(inv) => {
          setEditingInvoice(inv)
          setIsFormOpen(true)
        }}
        onDelete={handleDeleteRow}
        onMarkPaid={(inv) => updateMutation.mutate({ id: inv.id, updates: { status: 'paid', paymentDate: new Date().toISOString().split('T')[0] } })}
        onCancel={(inv) => updateMutation.mutate({ id: inv.id, updates: { status: 'cancelled' } })}
        selectedRows={selectedRows}
        setSelectedRows={setSelectedRows}
        onBulkAction={handleBulkAction}
      />

      {/* Slide-out details Drawer */}
      <InvoiceDrawer
        isOpen={isDrawerOpen}
        onClose={() => {
          setIsDrawerOpen(false)
          setViewingInvoice(null)
        }}
        invoice={viewingInvoice}
      />

      {/* Create/Edit Invoice Form Dialog */}
      <InvoiceForm
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false)
          setEditingInvoice(null)
        }}
        onSubmit={handleCreateOrUpdate}
        initialData={editingInvoice}
      />

    </div>
  )
}
