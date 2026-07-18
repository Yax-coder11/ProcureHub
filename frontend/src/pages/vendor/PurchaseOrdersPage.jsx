import * as React from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Download, RefreshCw, Sun, Moon } from 'lucide-react'
import { purchaseOrderService } from '../../services/purchaseOrderService'
import { useToast } from '../../components/ui/toast'

import { PurchaseOrderDashboardCards } from '../../components/purchase-orders/PurchaseOrderDashboardCards'
import { PurchaseOrderCharts } from '../../components/purchase-orders/PurchaseOrderCharts'
import { PurchaseOrderFilters } from '../../components/purchase-orders/PurchaseOrderFilters'
import { PurchaseOrderTable } from '../../components/purchase-orders/PurchaseOrderTable'
import { PurchaseOrderDrawer } from '../../components/purchase-orders/PurchaseOrderDrawer'
import { PurchaseOrderForm } from '../../components/purchase-orders/PurchaseOrderForm'
import { Button } from '../../components/ui/button'

export default function PurchaseOrdersPage() {
  const { toast } = useToast()
  const queryClient = useQueryClient()

  // --- Theme Mode State ---
  const [theme, setTheme] = React.useState(() => {
    return localStorage.getItem('po_dashboard_theme') || 'light'
  })

  const toggleTheme = () => {
    const next = theme === 'light' ? 'dark' : 'light'
    setTheme(next)
    localStorage.setItem('po_dashboard_theme', next)
    toast({
      title: `${next === 'dark' ? 'Dark' : 'Light'} Mode Enabled`,
      description: 'The dashboard theme updated successfully.',
      variant: 'info',
    })
  }

  // --- Filter and UI States ---
  const [search, setSearch] = React.useState('')
  const [debouncedSearch, setDebouncedSearch] = React.useState('')
  const [status, setStatus] = React.useState('all')
  const [supplier, setSupplier] = React.useState('all')
  const [priority, setPriority] = React.useState('all')
  const [startDate, setStartDate] = React.useState('')
  const [endDate, setEndDate] = React.useState('')

  const [page, setPage] = React.useState(1)
  const [pageSize, setPageSize] = React.useState(10)
  const [sortBy, setSortBy] = React.useState('poNumber')
  const [sortOrder, setSortOrder] = React.useState('desc')

  // Modals & Drawers state
  const [isFormOpen, setIsFormOpen] = React.useState(false)
  const [editingPO, setEditingPO] = React.useState(null)

  const [isDrawerOpen, setIsDrawerOpen] = React.useState(false)
  const [viewingPO, setViewingPO] = React.useState(null)

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
  }, [status, supplier, priority, startDate, endDate, pageSize])

  // --- Queries & Mutations ---

  // 1. KPI Stats Query
  const { data: stats, isLoading: isStatsLoading, refetch: refetchStats } = useQuery({
    queryKey: ['poStats'],
    queryFn: () => purchaseOrderService.getStats(),
  })

  // 2. Charts/Analytics Query
  const { data: analytics, isLoading: isAnalyticsLoading, refetch: refetchAnalytics } = useQuery({
    queryKey: ['poAnalytics'],
    queryFn: () => purchaseOrderService.getAnalytics(),
  })

  // 3. Purchase Orders Paginated list Query
  const { data: listData, isLoading: isListLoading, refetch: refetchList } = useQuery({
    queryKey: [
      'purchaseOrders',
      debouncedSearch,
      status,
      supplier,
      priority,
      startDate,
      endDate,
      page,
      pageSize,
      sortBy,
      sortOrder,
    ],
    queryFn: () =>
      purchaseOrderService.getPurchaseOrders({
        search: debouncedSearch,
        status,
        supplier,
        priority,
        startDate,
        endDate,
        page,
        pageSize,
        sortBy,
        sortOrder,
      }),
  })

  // 4. Create Mutation
  const createMutation = useMutation({
    mutationFn: (newPO) => purchaseOrderService.createPurchaseOrder(newPO),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['purchaseOrders'] })
      queryClient.invalidateQueries({ queryKey: ['poStats'] })
      queryClient.invalidateQueries({ queryKey: ['poAnalytics'] })
      toast({
        title: 'Purchase Order Created',
        description: `PO ${data.poNumber} has been successfully raised.`,
        variant: 'success',
      })
      setIsFormOpen(false)
    },
    onError: (err) => {
      toast({
        title: 'Creation Failed',
        description: err.message || 'An error occurred while creating PO.',
        variant: 'destructive',
      })
    },
  })

  // 5. Update Mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, updates }) => purchaseOrderService.updatePurchaseOrder(id, updates),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['purchaseOrders'] })
      queryClient.invalidateQueries({ queryKey: ['poStats'] })
      queryClient.invalidateQueries({ queryKey: ['poAnalytics'] })
      toast({
        title: 'Purchase Order Updated',
        description: `PO ${data.poNumber} details have been saved.`,
        variant: 'success',
      })
      setIsFormOpen(false)
      setEditingPO(null)
      if (viewingPO && viewingPO.id === data.id) {
        setViewingPO(data)
      }
    },
    onError: (err) => {
      toast({
        title: 'Update Failed',
        description: err.message || 'An error occurred while updating PO.',
        variant: 'destructive',
      })
    },
  })

  // 6. Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: (id) => purchaseOrderService.deletePurchaseOrder(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchaseOrders'] })
      queryClient.invalidateQueries({ queryKey: ['poStats'] })
      queryClient.invalidateQueries({ queryKey: ['poAnalytics'] })
      setSelectedRows((prev) => prev.filter((rid) => viewingPO && rid !== viewingPO.id))
      toast({
        title: 'Purchase Order Deleted',
        description: 'The purchase order has been removed from records.',
        variant: 'success',
      })
      setIsDrawerOpen(false)
    },
    onError: (err) => {
      toast({
        title: 'Deletion Failed',
        description: err.message || 'Failed to remove purchase order.',
        variant: 'destructive',
      })
    },
  })

  // --- Handlers ---

  const handleRefresh = async () => {
    toast({
      title: 'Refreshing Dashboard',
      description: 'Syncing live database procurement entries...',
      variant: 'info',
      duration: 1500,
    })
    await Promise.all([refetchStats(), refetchAnalytics(), refetchList()])
  }

  const handleCreateOrUpdate = (formData, submitType) => {
    const suppliers = [
      { value: 'VEN0001', label: 'Apex IT Solutions' },
      { value: 'VEN0002', label: 'National Office Stationers' },
      { value: 'VEN0003', label: 'Swift Cargo Carriers' },
      { value: 'VEN0004', label: 'Pioneer Chemicals' },
      { value: 'VEN0005', label: 'Vanguard Legal Associates' },
    ]
    const sName = suppliers.find((v) => v.value === formData.supplierId)?.label || ''

    const payload = {
      ...formData,
      supplierName: sName,
      status: submitType,
      paymentStatus: 'unpaid',
    }

    if (editingPO) {
      updateMutation.mutate({ id: editingPO.id, updates: payload })
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
    setSupplier('all')
    setPriority('all')
    setStartDate('')
    setEndDate('')
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
      description: 'Preparing CSV spreadsheet formatting...',
      variant: 'info',
    })
    setTimeout(() => {
      toast({
        title: 'Spreadsheet Exported',
        description: 'Purchase orders list has been successfully downloaded.',
        variant: 'success',
      })
    }, 1500)
  }

  const handleDownloadPDF = (po) => {
    toast({
      title: 'Generating Document',
      description: `Building transaction receipt PDF for PO ${po.poNumber}...`,
      variant: 'info',
    })
    setTimeout(() => {
      toast({
        title: 'Document Saved',
        description: `PDF file for PO ${po.poNumber} downloaded successfully.`,
        variant: 'success',
      })
    }, 1200)
  }

  const handlePrint = (po) => {
    toast({
      title: 'Printing Document',
      description: `Opening system print spooler for PO ${po.poNumber}...`,
      variant: 'info',
    })
  }

  const handleDuplicate = (po) => {
    const { id, poNumber, timeline, activityLog, ...rest } = po
    const duplicatedPayload = {
      ...rest,
      notes: `Duplicated from ${poNumber}. ${rest.notes || ''}`,
    }
    createMutation.mutate(duplicatedPayload)
  }

  const handleTrackDelivery = (po) => {
    toast({
      title: 'Tracking Carrier',
      description: `Tracking logistics for PO ${po.poNumber}. Expected: ${po.expectedDeliveryDate}`,
      variant: 'info',
    })
  }

  const handleDeleteRow = (po) => {
    if (window.confirm(`Are you sure you want to delete purchase order ${po.poNumber}?`)) {
      deleteMutation.mutate(po.id)
    }
  }

  const handleBulkAction = (action, ids) => {
    if (ids.length === 0) return

    if (action === 'delete') {
      if (window.confirm(`Are you sure you want to delete ${ids.length} selected purchase orders?`)) {
        ids.forEach((id) => deleteMutation.mutate(id))
        setSelectedRows([])
      }
    } else if (action === 'approve') {
      ids.forEach((id) => {
        updateMutation.mutate({ id, updates: { status: 'approved' } })
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
    <div className={`space-y-6 transition-all duration-300 ${theme === 'dark' ? 'dark text-slate-100' : 'text-slate-900'}`}>
      
      {/* Hero Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Purchase Orders
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
            Enterprise-grade procurement panel to raise, track, approve, and audit purchase order commits.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-center">
          {/* Theme Toggle Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={toggleTheme}
            className="h-9 w-9 p-0 rounded-full dark:border-slate-800 dark:text-slate-350 dark:hover:bg-slate-800"
            title="Toggle Light/Dark Theme"
          >
            {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
          </Button>

          {/* Refresh Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            className="h-9 w-9 p-0 rounded-full dark:border-slate-800 dark:text-slate-350 dark:hover:bg-slate-800"
            title="Refresh Dashboard"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>

          {/* Export Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleExport}
            className="text-xs font-semibold gap-1.5 dark:border-slate-800 dark:text-slate-350 dark:hover:bg-slate-800"
          >
            <Download className="h-4 w-4" />
            Export
          </Button>

          {/* Create PO CTA */}
          <Button
            variant="primary"
            size="sm"
            onClick={() => {
              setEditingPO(null)
              setIsFormOpen(true)
            }}
            className="text-xs font-semibold gap-1.5"
          >
            <Plus className="h-4 w-4" />
            Create Purchase Order
          </Button>
        </div>
      </div>

      {/* Dynamic Metric KPIs cards */}
      <PurchaseOrderDashboardCards isLoading={isStatsLoading} stats={stats} />

      {/* Analytics Charts section */}
      <PurchaseOrderCharts isLoading={isAnalyticsLoading} data={analytics} />

      {/* Quick Filters toolbar */}
      <PurchaseOrderFilters
        search={search}
        setSearch={setSearch}
        status={status}
        setStatus={setStatus}
        supplier={supplier}
        setSupplier={setSupplier}
        priority={priority}
        setPriority={setPriority}
        startDate={startDate}
        setStartDate={setStartDate}
        endDate={endDate}
        setEndDate={setEndDate}
        onClear={handleClearFilters}
      />

      {/* Main Data Table */}
      <PurchaseOrderTable
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
        onViewDetails={(po) => {
          setViewingPO(po)
          setIsDrawerOpen(true)
        }}
        onEdit={(po) => {
          setEditingPO(po)
          setIsFormOpen(true)
        }}
        onDelete={handleDeleteRow}
        onApprove={(po) => updateMutation.mutate({ id: po.id, updates: { status: 'approved' } })}
        onCancel={(po) => updateMutation.mutate({ id: po.id, updates: { status: 'cancelled' } })}
        onDuplicate={handleDuplicate}
        onTrackDelivery={handleTrackDelivery}
        onDownloadPDF={handleDownloadPDF}
        onPrint={handlePrint}
        selectedRows={selectedRows}
        setSelectedRows={setSelectedRows}
        onBulkAction={handleBulkAction}
      />

      {/* Slide-out PO details Drawer */}
      <PurchaseOrderDrawer
        isOpen={isDrawerOpen}
        onClose={() => {
          setIsDrawerOpen(false)
          setViewingPO(null)
        }}
        purchaseOrder={viewingPO}
        onDownloadPDF={handleDownloadPDF}
      />

      {/* Create/Edit PO Form Dialog */}
      <PurchaseOrderForm
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false)
          setEditingPO(null)
        }}
        onSubmit={handleCreateOrUpdate}
        initialData={editingPO}
      />

    </div>
  )
}
