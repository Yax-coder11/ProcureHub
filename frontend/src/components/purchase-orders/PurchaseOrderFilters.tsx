import * as React from 'react';
import { Search, X, Calendar } from 'lucide-react';
import { Input } from '../ui/input';
import { Select } from '../ui/select';
import { Button } from '../ui/button';

interface PurchaseOrderFiltersProps {
  search: string;
  setSearch: (val: string) => void;
  status: string;
  setStatus: (val: string) => void;
  supplier: string;
  setSupplier: (val: string) => void;
  priority: string;
  setPriority: (val: string) => void;
  startDate: string;
  setStartDate: (val: string) => void;
  endDate: string;
  setEndDate: (val: string) => void;
  onClear: () => void;
}

export function PurchaseOrderFilters({
  search,
  setSearch,
  status,
  setStatus,
  supplier,
  setSupplier,
  priority,
  setPriority,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  onClear,
}: PurchaseOrderFiltersProps) {
  const statusOptions = [
    { value: 'all', label: 'All Statuses' },
    { value: 'draft', label: 'Draft' },
    { value: 'pending_approval', label: 'Pending Approval' },
    { value: 'approved', label: 'Approved' },
    { value: 'sent', label: 'Sent' },
    { value: 'partially_delivered', label: 'Partially Delivered' },
    { value: 'delivered', label: 'Delivered' },
    { value: 'cancelled', label: 'Cancelled' },
  ];

  const priorityOptions = [
    { value: 'all', label: 'All Priorities' },
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' },
    { value: 'urgent', label: 'Urgent' },
  ];

  const supplierOptions = [
    { value: 'all', label: 'All Suppliers' },
    { value: 'VEN0001', label: 'Apex IT Solutions' },
    { value: 'VEN0002', label: 'National Office Stationers' },
    { value: 'VEN0003', label: 'Swift Cargo Carriers' },
    { value: 'VEN0004', label: 'Pioneer Chemicals' },
    { value: 'VEN0005', label: 'Vanguard Legal Associates' },
  ];

  const hasActiveFilters =
    search ||
    status !== 'all' ||
    supplier !== 'all' ||
    priority !== 'all' ||
    startDate ||
    endDate;

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-4 transition-all duration-300">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200">Search & Filters</h4>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClear}
            className="text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/20 font-semibold h-8 px-2.5 flex items-center gap-1.5"
          >
            <X className="h-3.5 w-3.5" />
            Clear Filters
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        {/* Search */}
        <div className="lg:col-span-2 relative">
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search PO#, supplier, delivery address..."
            className="pl-9 dark:bg-slate-850 dark:border-slate-850 dark:text-slate-100"
          />
          <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
        </div>

        {/* Status */}
        <div>
          <Select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            options={statusOptions}
            className="dark:bg-slate-850 dark:border-slate-855 dark:text-slate-100"
          />
        </div>

        {/* Supplier */}
        <div>
          <Select
            value={supplier}
            onChange={(e) => setSupplier(e.target.value)}
            options={supplierOptions}
            className="dark:bg-slate-850 dark:border-slate-855 dark:text-slate-100"
          />
        </div>

        {/* Priority */}
        <div>
          <Select
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            options={priorityOptions}
            className="dark:bg-slate-850 dark:border-slate-855 dark:text-slate-100"
          />
        </div>

        {/* Date Ranges */}
        <div className="grid grid-cols-2 gap-2 md:col-span-2 lg:col-span-1">
          <div className="relative">
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="flex h-10 w-full rounded-md border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900 px-2 py-1.5 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
              title="Start Order Date"
            />
          </div>
          <div className="relative">
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="flex h-10 w-full rounded-md border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900 px-2 py-1.5 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
              title="End Order Date"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
