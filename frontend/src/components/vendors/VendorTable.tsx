import * as React from 'react';
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  createColumnHelper,
} from '@tanstack/react-table';
import { Eye, Edit, Trash2, ArrowUpDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { Vendor } from '../../types/vendor';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Skeleton } from '../ui/skeleton';

interface VendorTableProps {
  data: Vendor[];
  isLoading: boolean;
  page: number;
  pageSize: number;
  totalPages: number;
  totalCount: number;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  onSort: (field: string) => void;
  onView: (vendor: Vendor) => void;
  onEdit: (vendor: Vendor) => void;
  onDelete: (vendor: Vendor) => void;
}

const columnHelper = createColumnHelper<Vendor>();

export function VendorTable({
  data,
  isLoading,
  page,
  pageSize,
  totalPages,
  totalCount,
  sortBy,
  sortOrder,
  onPageChange,
  onPageSizeChange,
  onSort,
  onView,
  onEdit,
  onDelete,
}: VendorTableProps) {
  // Define columns
  const columns = React.useMemo(
    () => [
      columnHelper.accessor('id', {
        header: () => (
          <button
            onClick={() => onSort('id')}
            className="flex items-center gap-1 hover:text-slate-900 transition-colors text-slate-500 font-semibold"
          >
            ID
            <ArrowUpDown className="h-3 w-3" />
          </button>
        ),
        cell: (info) => <span className="font-mono text-slate-600 font-medium">{info.getValue()}</span>,
      }),
      columnHelper.accessor('vendorName', {
        header: () => (
          <button
            onClick={() => onSort('vendorName')}
            className="flex items-center gap-1 hover:text-slate-900 transition-colors text-slate-500 font-semibold"
          >
            Vendor Name
            <ArrowUpDown className="h-3 w-3" />
          </button>
        ),
        cell: (info) => (
          <div>
            <div className="font-semibold text-slate-950">{info.getValue()}</div>
            <div className="text-xs text-slate-400 font-normal">{info.row.original.businessName}</div>
          </div>
        ),
      }),
      columnHelper.accessor('category', {
        header: () => <span className="text-slate-500 font-semibold">Category</span>,
        cell: (info) => <span className="text-slate-600">{info.getValue()}</span>,
      }),
      columnHelper.accessor('gstNumber', {
        header: () => <span className="text-slate-500 font-semibold">GSTIN</span>,
        cell: (info) => <span className="font-mono text-slate-600 uppercase">{info.getValue()}</span>,
      }),
      columnHelper.accessor('contactPerson', {
        header: () => <span className="text-slate-500 font-semibold">Contact Person</span>,
        cell: (info) => (
          <div>
            <div className="font-medium text-slate-900">{info.getValue()}</div>
            <div className="text-xs text-slate-400 font-normal">{info.row.original.email}</div>
          </div>
        ),
      }),
      columnHelper.accessor('phone', {
        header: () => <span className="text-slate-500 font-semibold">Phone</span>,
        cell: (info) => <span className="text-slate-600 font-mono text-xs">{info.getValue()}</span>,
      }),
      columnHelper.accessor('status', {
        header: () => (
          <button
            onClick={() => onSort('status')}
            className="flex items-center gap-1 hover:text-slate-900 transition-colors text-slate-500 font-semibold"
          >
            Status
            <ArrowUpDown className="h-3 w-3" />
          </button>
        ),
        cell: (info) => {
          const status = info.getValue();
          let variant: 'success' | 'warning' | 'danger' | 'default' = 'default';
          if (status === 'active') variant = 'success';
          if (status === 'pending') variant = 'warning';
          if (status === 'inactive') variant = 'danger';

          return (
            <Badge variant={variant} className="capitalize">
              {status}
            </Badge>
          );
        },
      }),
      columnHelper.accessor('registrationDate', {
        header: () => (
          <button
            onClick={() => onSort('registrationDate')}
            className="flex items-center gap-1 hover:text-slate-900 transition-colors text-slate-500 font-semibold"
          >
            Reg. Date
            <ArrowUpDown className="h-3 w-3" />
          </button>
        ),
        cell: (info) => <span className="text-slate-600">{info.getValue()}</span>,
      }),
      columnHelper.display({
        id: 'actions',
        header: () => <span className="text-slate-500 font-semibold text-right block pr-4">Actions</span>,
        cell: (info) => (
          <div className="flex items-center justify-end space-x-1 pr-2">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 rounded-full"
              onClick={() => onView(info.row.original)}
              title="View Details"
            >
              <Eye className="h-4 w-4 text-slate-500" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 rounded-full"
              onClick={() => onEdit(info.row.original)}
              title="Edit Vendor"
            >
              <Edit className="h-4 w-4 text-slate-500" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 rounded-full hover:bg-red-50 hover:text-red-600"
              onClick={() => onDelete(info.row.original)}
              title="Delete Vendor"
            >
              <Trash2 className="h-4 w-4 text-red-500" />
            </Button>
          </div>
        ),
      }),
    ],
    [onSort, onView, onEdit, onDelete]
  );

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="flex flex-col space-y-4">
      <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
        <table className="w-full text-left border-collapse">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id} className="border-b border-slate-100 bg-slate-50">
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500 align-middle"
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="divide-y divide-slate-100">
            {isLoading ? (
              // Loading Skeletons
              Array.from({ length: pageSize }).map((_, rIdx) => (
                <tr key={rIdx}>
                  {columns.map((_, cIdx) => (
                    <td key={cIdx} className="px-6 py-4">
                      <Skeleton className="h-5 w-full max-w-[120px]" />
                    </td>
                  ))}
                </tr>
              ))
            ) : data.length === 0 ? (
              // Empty State
              <tr>
                <td colSpan={columns.length} className="px-6 py-12 text-center">
                  <div className="flex flex-col items-center justify-center space-y-2">
                    <span className="p-3 bg-slate-50 border border-slate-200 rounded-full text-slate-400">
                      <ArrowUpDown className="h-6 w-6 animate-pulse" />
                    </span>
                    <h3 className="text-sm font-semibold text-slate-800">No Vendors Found</h3>
                    <p className="text-xs text-slate-400 max-w-sm">
                      We couldn't find any vendor listings matching your query. Adjust your search or filter settings, or add a new vendor to get started.
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              // Data Rows
              table.getRowModel().rows.map((row) => (
                <tr key={row.id} className="hover:bg-slate-50/70 transition-colors">
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-6 py-4 align-middle text-sm text-slate-600">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination controls */}
      {!isLoading && data.length > 0 && (
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between px-1">
          {/* Entries per page select */}
          <div className="flex items-center space-x-2 text-xs text-slate-500">
            <span>Show</span>
            <select
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              className="rounded-md border border-slate-350 bg-white px-2.5 py-1 text-slate-700 outline-none focus:ring-1 focus:ring-brand-500 focus:border-brand-500"
            >
              {[5, 10, 20, 50].map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
            <span>entries</span>
            <span className="pl-4 font-normal">
              Showing {Math.min(totalCount, (page - 1) * pageSize + 1)} to{' '}
              {Math.min(totalCount, page * pageSize)} of {totalCount} entries
            </span>
          </div>

          {/* Page buttons */}
          <div className="flex items-center space-x-1">
            <Button
              variant="outline"
              size="sm"
              disabled={page === 1}
              onClick={() => onPageChange(page - 1)}
              className="h-8 px-2"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Prev
            </Button>
            {Array.from({ length: totalPages }).map((_, idx) => {
              const pNum = idx + 1;
              return (
                <Button
                  key={pNum}
                  variant={page === pNum ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => onPageChange(pNum)}
                  className="h-8 w-8 p-0"
                >
                  {pNum}
                </Button>
              );
            })}
            <Button
              variant="outline"
              size="sm"
              disabled={page === totalPages}
              onClick={() => onPageChange(page + 1)}
              className="h-8 px-2"
            >
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
