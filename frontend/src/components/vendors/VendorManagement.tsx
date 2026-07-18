import * as React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Download, Search, RefreshCw } from 'lucide-react';
import { vendorService, DEFAULT_CATEGORIES } from '../../services/vendorService';
import { Vendor, VendorStatus } from '../../types/vendor';
import { useToast } from '../ui/toast';
// @ts-ignore
import { useAuth } from '../../context/AuthContext';

import { VendorDashboardCards } from './VendorDashboardCards';
import { VendorTable } from './VendorTable';
import { VendorForm } from './VendorForm';
import { VendorDetails } from './VendorDetails';

import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Select } from '../ui/select';
import { Drawer } from '../ui/drawer';
import { Dialog } from '../ui/dialog';

export default function VendorManagement() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const currentUser = user?.username || 'Unknown User';

  // --- States ---
  const [searchTerm, setSearchTerm] = React.useState('');
  const [debouncedSearch, setDebouncedSearch] = React.useState('');
  const [categoryFilter, setCategoryFilter] = React.useState('all');
  const [statusFilter, setStatusFilter] = React.useState('all');
  
  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(5);
  const [sortBy, setSortBy] = React.useState('registrationDate');
  const [sortOrder, setSortOrder] = React.useState<'asc' | 'desc'>('desc');

  // Modals & Drawers
  const [isAddOpen, setIsAddOpen] = React.useState(false);
  const [isEditOpen, setIsEditOpen] = React.useState(false);
  const [selectedVendorForEdit, setSelectedVendorForEdit] = React.useState<Vendor | null>(null);

  const [isDetailsOpen, setIsDetailsOpen] = React.useState(false);
  const [selectedVendorForDetails, setSelectedVendorForDetails] = React.useState<Vendor | null>(null);

  const [isDeleteOpen, setIsDeleteOpen] = React.useState(false);
  const [selectedVendorForDelete, setSelectedVendorForDelete] = React.useState<Vendor | null>(null);

  // Debounce search term to avoid spamming calls
  React.useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPage(1); // Reset page to 1 when search term changes
    }, 250);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  // Reset page to 1 when filters change
  React.useEffect(() => {
    setPage(1);
  }, [categoryFilter, statusFilter, pageSize]);

  // --- React Query Fetches ---
  
  // 1. Fetch statistics
  const { data: stats, isLoading: isStatsLoading } = useQuery({
    queryKey: ['vendorStats'],
    queryFn: () => vendorService.getStats(),
  });

  // 2. Fetch paginated list
  const { data: listData, isLoading: isListLoading } = useQuery({
    queryKey: [
      'vendors',
      debouncedSearch,
      categoryFilter,
      statusFilter,
      page,
      pageSize,
      sortBy,
      sortOrder,
    ],
    queryFn: () =>
      vendorService.getVendors({
        search: debouncedSearch,
        category: categoryFilter,
        status: statusFilter,
        page,
        pageSize,
        sortBy,
        sortOrder,
      }),
  });

  // --- Mutations ---

  // 1. Create Vendor
  const createMutation = useMutation({
    mutationFn: (newVendor: Omit<Vendor, 'id' | 'registrationDate'>) =>
      vendorService.createVendor(newVendor, currentUser),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendors'] });
      queryClient.invalidateQueries({ queryKey: ['vendorStats'] });
      toast({
        title: 'Vendor Created',
        description: 'New vendor record has been successfully added to the registry.',
        variant: 'success',
      });
      setIsAddOpen(false);
    },
    onError: (error: any) => {
      toast({
        title: 'Error Creating Vendor',
        description: error.message || 'Something went wrong. Please check fields.',
        variant: 'destructive',
      });
    },
  });

  // 2. Update Vendor
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Vendor> }) =>
      vendorService.updateVendor(id, data, currentUser),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendors'] });
      queryClient.invalidateQueries({ queryKey: ['vendorStats'] });
      toast({
        title: 'Vendor Updated',
        description: 'Vendor record details have been updated successfully.',
        variant: 'success',
      });
      setIsEditOpen(false);
      setSelectedVendorForEdit(null);
    },
    onError: (error: any) => {
      toast({
        title: 'Error Updating Vendor',
        description: error.message || 'Failed to update vendor record.',
        variant: 'destructive',
      });
    },
  });

  // 3. Delete Vendor
  const deleteMutation = useMutation({
    mutationFn: (id: string) => vendorService.deleteVendor(id, currentUser),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendors'] });
      queryClient.invalidateQueries({ queryKey: ['vendorStats'] });
      toast({
        title: 'Vendor Deleted',
        description: 'Vendor has been removed from the directory.',
        variant: 'success',
      });
      setIsDeleteOpen(false);
      setSelectedVendorForDelete(null);
    },
    onError: (error: any) => {
      toast({
        title: 'Error Deleting Vendor',
        description: error.message || 'Failed to delete vendor record.',
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
      const res = await vendorService.getVendors({
        search: debouncedSearch,
        category: categoryFilter,
        status: statusFilter,
        pageSize: 1000, // Export all matching
        sortBy,
        sortOrder,
      });
      
      const csvContent = vendorService.exportToCSV(res.results);
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `procurehub_vendors_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast({
        title: 'Export Successful',
        description: 'The CSV file has been generated and downloaded.',
        variant: 'success',
      });
    } catch (error: any) {
      toast({
        title: 'Export Failed',
        description: error.message || 'Failed to export CSV file.',
        variant: 'destructive',
      });
    }
  };

  const categoryOptions = [
    { value: 'all', label: 'All Categories' },
    ...DEFAULT_CATEGORIES.map((cat) => ({ value: cat.name, label: cat.name })),
  ];

  const statusOptions = [
    { value: 'all', label: 'All Statuses' },
    { value: 'active', label: 'Active' },
    { value: 'pending', label: 'Pending' },
    { value: 'inactive', label: 'Inactive' },
  ];

  return (
    <div className="space-y-6">
      {/* Header Panel */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Vendor Management</h1>
          <p className="text-sm text-slate-500 font-normal">
            Create, update, and manage your organization's verified vendors and service providers.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" className="text-slate-600 gap-1.5" onClick={handleExportCSV}>
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
          <Button variant="primary" className="gap-1.5" onClick={() => setIsAddOpen(true)}>
            <Plus className="h-4 w-4" />
            Add Vendor
          </Button>
        </div>
      </div>

      {/* Dashboard Stats */}
      <VendorDashboardCards stats={stats} isLoading={isStatsLoading} />

      {/* Search & Filters Card */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:max-w-md">
          <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search by Name, GSTIN, Contact..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 h-10 w-full"
          />
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
          <Select
            options={categoryOptions}
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full sm:w-48"
          />
          <Select
            options={statusOptions}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full sm:w-40"
          />
        </div>
      </div>

      {/* Main Vendor List Table */}
      <VendorTable
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
        onView={(vendor) => {
          setSelectedVendorForDetails(vendor);
          setIsDetailsOpen(true);
        }}
        onEdit={(vendor) => {
          setSelectedVendorForEdit(vendor);
          setIsEditOpen(true);
        }}
        onDelete={(vendor) => {
          setSelectedVendorForDelete(vendor);
          setIsDeleteOpen(true);
        }}
      />

      {/* 1. Add Vendor Drawer */}
      <Drawer
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        title="Add Vendor"
        description="Register a new vendor record in the system."
      >
        <VendorForm
          onCancel={() => setIsAddOpen(false)}
          onSubmit={(values) => createMutation.mutate(values)}
          isLoading={createMutation.isPending}
        />
      </Drawer>

      {/* 2. Edit Vendor Drawer */}
      <Drawer
        isOpen={isEditOpen}
        onClose={() => {
          setIsEditOpen(false);
          setSelectedVendorForEdit(null);
        }}
        title="Edit Vendor"
        description={`Update record details for ${selectedVendorForEdit?.vendorName}.`}
      >
        {selectedVendorForEdit && (
          <VendorForm
            initialData={selectedVendorForEdit}
            onCancel={() => {
              setIsEditOpen(false);
              setSelectedVendorForEdit(null);
            }}
            onSubmit={(values) =>
              updateMutation.mutate({ id: selectedVendorForEdit.id, data: values })
            }
            isLoading={updateMutation.isPending}
          />
        )}
      </Drawer>

      {/* 3. Vendor Details Modal */}
      <Dialog
        isOpen={isDetailsOpen}
        onClose={() => {
          setIsDetailsOpen(false);
          setSelectedVendorForDetails(null);
        }}
        title="Vendor Profile Details"
        description="Detailed registry information and audit logs."
        size="lg"
      >
        {selectedVendorForDetails && <VendorDetails vendor={selectedVendorForDetails} />}
      </Dialog>

      {/* 4. Delete Confirmation Dialog */}
      <Dialog
        isOpen={isDeleteOpen}
        onClose={() => {
          setIsDeleteOpen(false);
          setSelectedVendorForDelete(null);
        }}
        title="Delete Vendor Record"
        description="Are you absolutely sure you want to delete this vendor?"
        footer={
          <>
            <Button
              variant="outline"
              onClick={() => {
                setIsDeleteOpen(false);
                setSelectedVendorForDelete(null);
              }}
              disabled={deleteMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (selectedVendorForDelete) {
                  deleteMutation.mutate(selectedVendorForDelete.id);
                }
              }}
              isLoading={deleteMutation.isPending}
            >
              Delete Vendor
            </Button>
          </>
        }
      >
        <div className="space-y-2">
          <p className="text-sm text-slate-600 font-normal">
            This action will delete the vendor record <span className="font-semibold text-slate-900">"{selectedVendorForDelete?.vendorName}"</span> ({selectedVendorForDelete?.id}) from the directory.
          </p>
          <p className="text-xs text-red-500 font-semibold bg-red-50 border border-red-100 p-3 rounded-lg">
            WARNING: This operation cannot be undone. Associated transactional history will remain, but the vendor entry will be removed from future selection lists.
          </p>
        </div>
      </Dialog>
    </div>
  );
}
