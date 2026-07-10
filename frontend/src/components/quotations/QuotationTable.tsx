import * as React from 'react';
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  createColumnHelper,
} from '@tanstack/react-table';
import { Eye, Edit, Trash2, ArrowUpDown, ChevronLeft, ChevronRight, Copy, Send, Download } from 'lucide-react';
import { Quotation } from '../../types/quotation';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Skeleton } from '../ui/skeleton';

interface QuotationTableProps {
  data: Quotation[];
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
  onView: (quote: Quotation) => void;
  onEdit: (quote: Quotation) => void;
  onDelete: (quote: Quotation) => void;
  onSubmit: (quote: Quotation) => void;
  onDuplicate: (quote: Quotation) => void;
  onDownloadPDF: (quote: Quotation) => void;
}

const columnHelper = createColumnHelper<Quotation>();

export function QuotationTable({
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
  onSubmit,
  onDuplicate,
  onDownloadPDF,
}: QuotationTableProps) {
  const columns = React.useMemo(
    () => [
      columnHelper.accessor('id', {
        header: () => (
          <button
            onClick={() => onSort('id')}
            className="flex items-center gap-1 hover:text-slate-900 transition-colors text-slate-500 font-semibold"
          >
            Quotation ID
            <ArrowUpDown className="h-3 w-3" />
          </button>
        ),
        cell: (info) => <span className="font-mono text-slate-600 font-medium">{info.getValue()}</span>,
      }),
      columnHelper.accessor('rfqId', {
        header: () => (
          <button
            onClick={() => onSort('rfqId')}
            className="flex items-center gap-1 hover:text-slate-900 transition-colors text-slate-500 font-semibold"
          >
            RFQ ID
            <ArrowUpDown className="h-3 w-3" />
          </button>
        ),
        cell: (info) => <span className="font-mono text-slate-600 font-semibold uppercase">{info.getValue()}</span>,
      }),
      columnHelper.accessor('customerName', {
        header: () => (
          <button
            onClick={() => onSort('customerName')}
            className="flex items-center gap-1 hover:text-slate-900 transition-colors text-slate-500 font-semibold"
          >
            Customer
            <ArrowUpDown className="h-3 w-3" />
          </button>
        ),
        cell: (info) => <span className="font-medium text-slate-900">{info.getValue()}</span>,
      }),
      columnHelper.accessor('grandTotal', {
        header: () => (
          <button
            onClick={() => onSort('grandTotal')}
            className="flex items-center gap-1 hover:text-slate-900 transition-colors text-slate-500 font-semibold"
          >
            Total Amount
            <ArrowUpDown className="h-3 w-3" />
          </button>
        ),
        cell: (info) => <span className="font-semibold text-slate-950 font-mono">₹{info.getValue().toLocaleString('en-IN')}</span>,
      }),
      columnHelper.accessor('validityDate', {
        header: () => (
          <button
            onClick={() => onSort('validityDate')}
            className="flex items-center gap-1 hover:text-slate-900 transition-colors text-slate-500 font-semibold"
          >
            Valid Until
            <ArrowUpDown className="h-3 w-3" />
          </button>
        ),
        cell: (info) => <span className="text-slate-600">{info.getValue()}</span>,
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
          let variant: 'success' | 'warning' | 'danger' | 'default' | 'info' = 'default';
          if (status === 'accepted') variant = 'success';
          if (status === 'submitted') variant = 'info';
          if (status === 'draft') variant = 'default';
          if (status === 'rejected') variant = 'danger';
          if (status === 'expired') variant = 'warning';

          return (
            <Badge variant={variant} className="capitalize">
              {status}
            </Badge>
          );
        },
      }),
      columnHelper.accessor('submittedDate', {
        header: () => (
          <button
            onClick={() => onSort('submittedDate')}
            className="flex items-center gap-1 hover:text-slate-900 transition-colors text-slate-500 font-semibold"
          >
            Submitted Date
            <ArrowUpDown className="h-3 w-3" />
          </button>
        ),
        cell: (info) => <span className="text-slate-600">{info.getValue() || 'N/A'}</span>,
      }),
      columnHelper.display({
        id: 'actions',
        header: () => <span className="text-slate-500 font-semibold text-right block pr-4">Actions</span>,
        cell: (info) => {
          const row = info.row.original;
          return (
            <div className="flex items-center justify-end space-x-1 pr-1">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 rounded-full"
                onClick={() => onView(row)}
                title="View Details"
              >
                <Eye className="h-4 w-4 text-slate-500" />
              </Button>
              {row.status === 'draft' && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 rounded-full"
                  onClick={() => onEdit(row)}
                  title="Edit Proposal"
                >
                  <Edit className="h-4 w-4 text-slate-500" />
                </Button>
              )}
              {row.status === 'draft' && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 rounded-full hover:bg-amber-50 hover:text-amber-600"
                  onClick={() => onSubmit(row)}
                  title="Submit Quotation"
                >
                  <Send className="h-4 w-4 text-amber-500" />
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 rounded-full hover:bg-blue-50 hover:text-blue-600"
                onClick={() => onDuplicate(row)}
                title="Duplicate Proposal"
              >
                <Copy className="h-4 w-4 text-blue-500" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 rounded-full hover:bg-slate-100 hover:text-brand-600"
                onClick={() => onDownloadPDF(row)}
                title="Download PDF"
              >
                <Download className="h-4 w-4 text-slate-500" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 rounded-full hover:bg-red-50 hover:text-red-600"
                onClick={() => onDelete(row)}
                title="Delete Quotation"
              >
                <Trash2 className="h-4 w-4 text-red-500" />
              </Button>
            </div>
          );
        },
      }),
    ],
    [onSort, onView, onEdit, onSubmit, onDuplicate, onDownloadPDF, onDelete]
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
              <tr>
                <td colSpan={columns.length} className="px-6 py-12 text-center">
                  <div className="flex flex-col items-center justify-center space-y-2">
                    <span className="p-3 bg-slate-50 border border-slate-200 rounded-full text-slate-400">
                      <ArrowUpDown className="h-6 w-6 animate-pulse" />
                    </span>
                    <h3 className="text-sm font-semibold text-slate-800">No Quotations Found</h3>
                    <p className="text-xs text-slate-400 max-w-sm">
                      We couldn't find any quotations matching your query. Adjust your search filters or draft a new proposal to get started.
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row) => (
                <tr key={row.id} className="hover:bg-slate-50/70 transition-colors">
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-6 py-4 align-middle text-sm text-slate-650">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {!isLoading && data.length > 0 && (
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between px-1">
          <div className="flex items-center space-x-2 text-xs text-slate-500">
            <span>Show</span>
            <select
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              className="rounded-md border border-slate-350 bg-white px-2.5 py-1 text-slate-700 outline-none focus:ring-1 focus:ring-brand-500"
            >
              {[5, 10, 20].map((size) => (
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
