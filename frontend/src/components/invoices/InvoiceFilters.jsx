import * as React from 'react';
import { Search, X } from 'lucide-react';
import { Input } from '../ui/input';
import { Select } from '../ui/select';
import { Button } from '../ui/button';

export function InvoiceFilters({
  search,
  setSearch,
  status,
  setStatus,
  onClear,
}) {
  const statusOptions = [
    { value: 'all', label: 'All Statuses' },
    { value: 'pending_payment', label: 'Pending Payment' },
    { value: 'paid', label: 'Paid' },
    { value: 'cancelled', label: 'Cancelled' },
  ];

  const hasActiveFilters = search || status !== 'all';

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4 transition-all duration-300">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold text-slate-800">Search & Filters</h4>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClear}
            className="text-xs text-rose-600 hover:bg-rose-50 font-semibold h-8 px-2.5 flex items-center gap-1.5"
          >
            <X className="h-3.5 w-3.5" />
            Clear Filters
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Search */}
        <div className="md:col-span-2 relative">
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search Invoice#, PO#, payment details..."
            className="pl-9"
          />
          <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
        </div>

        {/* Status */}
        <div>
          <Select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            options={statusOptions}
          />
        </div>
      </div>
    </div>
  );
}
