import * as React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Download, Search } from 'lucide-react';
import { quotationService } from '../../services/quotationService';
import { Quotation, QuotationStatus } from '../../types/quotation';
import { useToast } from '../ui/toast';

import { QuotationDashboardCards } from './QuotationDashboardCards';
import { QuotationTable } from './QuotationTable';
import { QuotationForm } from './QuotationForm';
import { QuotationDetails } from './QuotationDetails';

import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Select } from '../ui/select';
import { Drawer } from '../ui/drawer';
import { Dialog } from '../ui/dialog';

export default function QuotationManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // --- States ---
  const [searchTerm, setSearchTerm] = React.useState('');
  const [debouncedSearch, setDebouncedSearch] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState('all');
  const [rfqFilter, setRfqFilter] = React.useState('all');
  const [customerFilter, setCustomerFilter] = React.useState('all');

  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(5);
  const [sortBy, setSortBy] = React.useState('id');
  const [sortOrder, setSortOrder] = React.useState<'asc' | 'desc'>('desc');

  // Modals & Drawers
  const [isAddOpen, setIsAddOpen] = React.useState(false);
  const [isEditOpen, setIsEditOpen] = React.useState(false);
  const [selectedQuotationForEdit, setSelectedQuotationForEdit] = React.useState<Quotation | null>(null);

  const [isDetailsOpen, setIsDetailsOpen] = React.useState(false);
  const [selectedQuotationForDetails, setSelectedQuotationForDetails] = React.useState<Quotation | null>(null);

  const [isDeleteOpen, setIsDeleteOpen] = React.useState(false);
  const [selectedQuotationForDelete, setSelectedQuotationForDelete] = React.useState<Quotation | null>(null);

  // Debounce search input
  React.useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPage(1);
    }, 250);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  // Reset page on filter changes
  React.useEffect(() => {
    setPage(1);
  }, [statusFilter, rfqFilter, customerFilter, pageSize]);

  // --- TanStack Query Fetching ---

  // 1. Stats
  const { data: stats, isLoading: isStatsLoading } = useQuery({
    queryKey: ['quotationStats'],
    queryFn: () => quotationService.getStats(),
  });

  // 2. Paginated List
  const { data: listData, isLoading: isListLoading } = useQuery({
    queryKey: [
      'quotations',
      debouncedSearch,
      statusFilter,
      rfqFilter,
      customerFilter,
      page,
      pageSize,
      sortBy,
      sortOrder,
    ],
    queryFn: () =>
      quotationService.getQuotations({
        search: debouncedSearch,
        status: statusFilter,
        rfq: rfqFilter,
        customer: customerFilter,
        page,
        pageSize,
        sortBy,
        sortOrder,
      }),
  });

  // --- Mutations ---

  // 1. Create
  const createMutation = useMutation({
    mutationFn: (newQuote: any) => quotationService.createQuotation(newQuote),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quotations'] });
      queryClient.invalidateQueries({ queryKey: ['quotationStats'] });
      toast({
        title: 'Proposal Saved',
        description: 'Quotation proposal has been generated successfully.',
        variant: 'success',
      });
      setIsAddOpen(false);
    },
    onError: (err: any) => {
      toast({
        title: 'Error Saving Quotation',
        description: err.message || 'Check form fields and try again.',
        variant: 'destructive',
      });
    },
  });

  // 2. Update
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      quotationService.updateQuotation(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quotations'] });
      queryClient.invalidateQueries({ queryKey: ['quotationStats'] });
      toast({
        title: 'Proposal Updated',
        description: 'Quotation details have been updated successfully.',
        variant: 'success',
      });
      setIsEditOpen(false);
      setSelectedQuotationForEdit(null);
    },
    onError: (err: any) => {
      toast({
        title: 'Error Updating Quotation',
        description: err.message || 'Failed to update quotation.',
        variant: 'destructive',
      });
    },
  });

  // 3. Delete
  const deleteMutation = useMutation({
    mutationFn: (id: string) => quotationService.deleteQuotation(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quotations'] });
      queryClient.invalidateQueries({ queryKey: ['quotationStats'] });
      toast({
        title: 'Quotation Deleted',
        description: 'Quotation proposal has been removed from directory.',
        variant: 'success',
      });
      setIsDeleteOpen(false);
      setSelectedQuotationForDelete(null);
    },
    onError: (err: any) => {
      toast({
        title: 'Delete Failed',
        description: err.message || 'Failed to remove quotation.',
        variant: 'destructive',
      });
    },
  });

  // 4. Duplicate
  const duplicateMutation = useMutation({
    mutationFn: (id: string) => quotationService.duplicateQuotation(id),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['quotations'] });
      queryClient.invalidateQueries({ queryKey: ['quotationStats'] });
      toast({
        title: 'Quotation Duplicated',
        description: `New draft quotation generated successfully with ID ${data.id}.`,
        variant: 'success',
      });
    },
    onError: (err: any) => {
      toast({
        title: 'Duplication Failed',
        description: err.message || 'Failed to duplicate quotation.',
        variant: 'destructive',
      });
    },
  });

  // 5. Submit
  const submitMutation = useMutation({
    mutationFn: (id: string) => quotationService.submitQuotation(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quotations'] });
      queryClient.invalidateQueries({ queryKey: ['quotationStats'] });
      toast({
        title: 'Proposal Submitted',
        description: 'Your bid quotation has been submitted to procurement.',
        variant: 'success',
      });
    },
    onError: (err: any) => {
      toast({
        title: 'Submit Failed',
        description: err.message || 'Failed to submit quotation.',
        variant: 'destructive',
      });
    },
  });

  // --- Handlers ---

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const handleExportCSV = async () => {
    try {
      const res = await quotationService.getQuotations({
        search: debouncedSearch,
        status: statusFilter,
        rfq: rfqFilter,
        customer: customerFilter,
        pageSize: 1000,
        sortBy,
        sortOrder,
      });

      const csvContent = quotationService.exportToCSV(res.results);
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `procurehub_quotations_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast({
        title: 'Export Complete',
        description: 'CSV file download completed successfully.',
        variant: 'success',
      });
    } catch (err: any) {
      toast({
        title: 'Export Failed',
        description: err.message || 'Failed to export CSV.',
        variant: 'destructive',
      });
    }
  };

  const statusOptions = [
    { value: 'all', label: 'All Statuses' },
    { value: 'draft', label: 'Draft' },
    { value: 'submitted', label: 'Submitted' },
    { value: 'accepted', label: 'Accepted' },
    { value: 'rejected', label: 'Rejected' },
    { value: 'expired', label: 'Expired' },
  ];

  const rfqOptions = [
    { value: 'all', label: 'All RFQs' },
    { value: 'RFQ-2026-001', label: 'RFQ-2026-001' },
    { value: 'RFQ-2026-003', label: 'RFQ-2026-003' },
    { value: 'RFQ-2026-005', label: 'RFQ-2026-005' },
    { value: 'RFQ-2026-008', label: 'RFQ-2026-008' },
    { value: 'RFQ-2026-012', label: 'RFQ-2026-012' },
  ];

  const customerOptions = [
    { value: 'all', label: 'All Customers' },
    { value: 'National Stationery Mart', label: 'National Stationery Mart' },
    { value: 'Swift Logistics Group Inc.', label: 'Swift Logistics Group Inc.' },
    { value: 'Apex Systems Private Limited', label: 'Apex Systems Private Limited' },
  ];

  return (
    <div className="space-y-6">
      {/* Header Panel */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Quotations Directory</h1>
          <p className="text-sm text-slate-500 font-normal">
            Raise bids, manage itemized pricing sheets, duplicate configurations, and submit quotes to active customer RFQs.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" className="text-slate-650 gap-1.5" onClick={handleExportCSV}>
            Export CSV
          </Button>
          <Button variant="primary" className="gap-1.5" onClick={() => setIsAddOpen(true)}>
            <Plus className="h-4 w-4" />
            New Quotation
          </Button>
        </div>
      </div>

      {/* Stats Summary Cards */}
      <QuotationDashboardCards stats={stats} isLoading={isStatsLoading} />

      {/* Filters Search Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:max-w-md">
          <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search by ID, RFQ ID, Customer, Product..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 h-10 w-full"
          />
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
          <Select
            options={rfqOptions}
            value={rfqFilter}
            onChange={(e) => setRfqFilter(e.target.value)}
            className="w-full sm:w-36"
          />
          <Select
            options={customerOptions}
            value={customerFilter}
            onChange={(e) => setCustomerFilter(e.target.value)}
            className="w-full sm:w-44"
          />
          <Select
            options={statusOptions}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full sm:w-36"
          />
        </div>
      </div>

      {/* Main Quotation List Table */}
      <QuotationTable
        data={listData?.results || []}
        isLoading={isListLoading}
        page={page}
        pageSize={pageSize}
        totalPages={listData?.pages || 1}
        totalCount={listData?.count || 0}
        sortBy={sortBy}
        sortOrder={sortOrder}
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
        onSort={handleSort}
        onView={(quote) => {
          setSelectedQuotationForDetails(quote);
          setIsDetailsOpen(true);
        }}
        onEdit={(quote) => {
          setSelectedQuotationForEdit(quote);
          setIsEditOpen(true);
        }}
        onDelete={(quote) => {
          setSelectedQuotationForDelete(quote);
          setIsDeleteOpen(true);
        }}
        onSubmit={(quote) => submitMutation.mutate(quote.id)}
        onDuplicate={(quote) => duplicateMutation.mutate(quote.id)}
        onDownloadPDF={(quote) => quotationService.downloadPDF(quote)}
      />

      {/* Drawers & Dialogs */}

      {/* 1. Add Quotation Drawer */}
      <Drawer
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        title="Create Quotation"
        description="Draft a pricing proposal in response to an active customer RFQ."
        size="lg"
      >
        <QuotationForm
          onCancel={() => setIsAddOpen(false)}
          onSubmit={(values) => createMutation.mutate(values)}
          isLoading={createMutation.isPending}
        />
      </Drawer>

      {/* 2. Edit Quotation Drawer */}
      <Drawer
        isOpen={isEditOpen}
        onClose={() => {
          setIsEditOpen(false);
          setSelectedQuotationForEdit(null);
        }}
        title="Edit Quotation Proposal"
        description={`Update itemized pricing lines and settings for ${selectedQuotationForEdit?.id}.`}
        size="lg"
      >
        {selectedQuotationForEdit && (
          <QuotationForm
            initialData={selectedQuotationForEdit}
            onCancel={() => {
              setIsEditOpen(false);
              setSelectedQuotationForEdit(null);
            }}
            onSubmit={(values) =>
              updateMutation.mutate({ id: selectedQuotationForEdit.id, data: values })
            }
            isLoading={updateMutation.isPending}
          />
        )}
      </Drawer>

      {/* 3. Detailed Profile Modal Overlay */}
      <Dialog
        isOpen={isDetailsOpen}
        onClose={() => {
          setIsDetailsOpen(false);
          setSelectedQuotationForDetails(null);
        }}
        title={`Quotation Proposal Overview - ${selectedQuotationForDetails?.id}`}
        description="Itemized pricing list breakdown, taxes, discount factors, and terms."
        size="lg"
      >
        {selectedQuotationForDetails && <QuotationDetails quotation={selectedQuotationForDetails} />}
      </Dialog>

      {/* 4. Delete Confirmation Dialog Overlay */}
      <Dialog
        isOpen={isDeleteOpen}
        onClose={() => {
          setIsDeleteOpen(false);
          setSelectedQuotationForDelete(null);
        }}
        title="Delete Quotation Proposal"
        description="Are you sure you want to permanently delete this quotation?"
        footer={
          <>
            <Button
              variant="outline"
              onClick={() => {
                setIsDeleteOpen(false);
                setSelectedQuotationForDelete(null);
              }}
              disabled={deleteMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (selectedQuotationForDelete) {
                  deleteMutation.mutate(selectedQuotationForDelete.id);
                }
              }}
              isLoading={deleteMutation.isPending}
            >
              Delete Quotation
            </Button>
          </>
        }
      >
        <div className="space-y-2">
          <p className="text-sm text-slate-650 font-normal">
            This action will delete the quotation proposal <span className="font-semibold text-slate-900">"{selectedQuotationForDelete?.id}"</span> raised for customer <span className="font-semibold text-slate-900">"{selectedQuotationForDelete?.customerName}"</span>.
          </p>
          <p className="text-xs text-red-500 font-semibold bg-red-50 border border-red-100 p-3 rounded-lg">
            WARNING: This operation will remove the quotation record completely. Buyer organizations will no longer be able to compare or accept this bid proposal.
          </p>
        </div>
      </Dialog>
    </div>
  );
}
