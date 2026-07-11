import * as React from 'react';
import {
  MoreVertical,
  Eye,
  Edit2,
  CheckCircle,
  XCircle,
  Trash2,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ArrowUpDown,
  SlidersHorizontal,
} from 'lucide-react';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';

export function InvoiceTable({
  data,
  isLoading,
  page,
  pageSize,
  total,
  onPageChange,
  onPageSizeChange,
  sortBy,
  sortOrder,
  onSortChange,
  onViewDetails,
  onEdit,
  onDelete,
  onMarkPaid,
  onCancel,
  selectedRows,
  setSelectedRows,
  onBulkAction,
}) {
  const [activeActionsRowId, setActiveActionsRowId] = React.useState(null);
  const [showColumnDropdown, setShowColumnDropdown] = React.useState(false);

  // Column visibility state
  const [visibleColumns, setVisibleColumns] = React.useState({
    invoiceNumber: true,
    purchaseOrderNumber: true,
    amount: true,
    dueDate: true,
    createdAt: true,
    status: true,
  });

  const dropdownRef = React.useRef(null);

  React.useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setActiveActionsRowId(null);
        setShowColumnDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const totalPages = Math.ceil(total / pageSize);

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  const getStatusBadgeVariant = (status) => {
    switch (status) {
      case 'paid':
        return 'success';
      case 'pending_payment':
        return 'warning';
      case 'cancelled':
        return 'danger';
      default:
        return 'default';
    }
  };

  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedRows(data.map((row) => row.id));
    } else {
      setSelectedRows([]);
    }
  };

  const handleSelectRow = (id, checked) => {
    if (checked) {
      setSelectedRows([...selectedRows, id]);
    } else {
      setSelectedRows(selectedRows.filter((rid) => rid !== id));
    }
  };

  return (
    <div className="space-y-4" ref={dropdownRef}>
      {/* Bulk actions and Column Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          {selectedRows.length > 0 && (
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1 text-xs">
              <span className="font-semibold text-brand-600">{selectedRows.length} selected</span>
              <div className="h-4 w-px bg-slate-200 mx-1" />
              <button
                onClick={() => onBulkAction('mark_paid', selectedRows)}
                className="hover:text-emerald-600 font-medium px-1"
                title="Mark Paid"
              >
                Mark Paid
              </button>
              <button
                onClick={() => onBulkAction('cancel', selectedRows)}
                className="hover:text-rose-600 font-medium px-1"
                title="Cancel Selected"
              >
                Cancel
              </button>
              <button
                onClick={() => onBulkAction('delete', selectedRows)}
                className="hover:text-rose-700 font-medium px-1"
                title="Delete Selected"
              >
                Delete
              </button>
            </div>
          )}
        </div>

        <div className="relative self-end sm:self-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowColumnDropdown(!showColumnDropdown)}
            className="text-xs gap-1.5"
          >
            <SlidersHorizontal className="h-3.5 w-3.5" />
            Columns
          </Button>

          {showColumnDropdown && (
            <div className="absolute right-0 mt-1.5 w-44 bg-white border border-slate-200 rounded-xl shadow-lg p-2.5 z-40 space-y-1.5">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block px-1">Toggle Columns</span>
              {Object.keys(visibleColumns).map((col) => (
                <label
                  key={col}
                  className="flex items-center space-x-2 text-xs hover:bg-slate-50 px-2 py-1 rounded-md cursor-pointer text-slate-700"
                >
                  <input
                    type="checkbox"
                    checked={visibleColumns[col]}
                    onChange={(e) =>
                      setVisibleColumns({ ...visibleColumns, [col]: e.target.checked })
                    }
                    className="rounded text-brand-600 focus:ring-brand-500 h-3.5 w-3.5 border-slate-300"
                  />
                  <span className="capitalize">{col.replace(/([A-Z])/g, ' $1')}</span>
                </label>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Main Table Grid */}
      <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-sm transition-all duration-300">
        <div className="overflow-x-auto relative min-h-[200px]">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 sticky top-0 z-10 backdrop-blur-sm">
                <th className="p-4 w-12 text-center">
                  <input
                    type="checkbox"
                    checked={data.length > 0 && selectedRows.length === data.length}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="rounded text-brand-600 focus:ring-brand-500 h-4 w-4 border-slate-300"
                    title="Select All"
                  />
                </th>
                {visibleColumns.invoiceNumber && (
                  <th className="p-4 cursor-pointer select-none" onClick={() => onSortChange('invoiceNumber')}>
                    <div className="flex items-center gap-1">
                      Invoice Number
                      <ArrowUpDown className="h-3.5 w-3.5 opacity-60" />
                    </div>
                  </th>
                )}
                {visibleColumns.purchaseOrderNumber && (
                  <th className="p-4 cursor-pointer select-none" onClick={() => onSortChange('purchaseOrderNumber')}>
                    <div className="flex items-center gap-1">
                      Purchase Order
                      <ArrowUpDown className="h-3.5 w-3.5 opacity-60" />
                    </div>
                  </th>
                )}
                {visibleColumns.amount && (
                  <th className="p-4 cursor-pointer select-none text-right" onClick={() => onSortChange('amount')}>
                    <div className="flex items-center gap-1 justify-end">
                      Total Amount
                      <ArrowUpDown className="h-3.5 w-3.5 opacity-60" />
                    </div>
                  </th>
                )}
                {visibleColumns.createdAt && (
                  <th className="p-4 cursor-pointer select-none" onClick={() => onSortChange('createdAt')}>
                    <div className="flex items-center gap-1">
                      Created Date
                      <ArrowUpDown className="h-3.5 w-3.5 opacity-60" />
                    </div>
                  </th>
                )}
                {visibleColumns.dueDate && (
                  <th className="p-4 cursor-pointer select-none" onClick={() => onSortChange('dueDate')}>
                    <div className="flex items-center gap-1">
                      Due Date
                      <ArrowUpDown className="h-3.5 w-3.5 opacity-60" />
                    </div>
                  </th>
                )}
                {visibleColumns.status && <th className="p-4">Status</th>}
                <th className="p-4 text-center">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                Array.from({ length: 4 }).map((_, idx) => (
                  <tr key={idx} className="animate-pulse">
                    <td className="p-4"><div className="h-4 bg-slate-200 rounded w-4 mx-auto" /></td>
                    {visibleColumns.invoiceNumber && <td className="p-4"><div className="h-4 bg-slate-200 rounded w-20" /></td>}
                    {visibleColumns.purchaseOrderNumber && <td className="p-4"><div className="h-4 bg-slate-200 rounded w-20" /></td>}
                    {visibleColumns.amount && <td className="p-4"><div className="h-4 bg-slate-200 rounded w-16 ml-auto" /></td>}
                    {visibleColumns.createdAt && <td className="p-4"><div className="h-4 bg-slate-200 rounded w-20" /></td>}
                    {visibleColumns.dueDate && <td className="p-4"><div className="h-4 bg-slate-200 rounded w-20" /></td>}
                    {visibleColumns.status && <td className="p-4"><div className="h-5 bg-slate-200 rounded w-16" /></td>}
                    <td className="p-4"><div className="h-6 bg-slate-200 rounded w-8 mx-auto" /></td>
                  </tr>
                ))
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-10">
                    <p className="text-slate-400 font-medium">No invoices found.</p>
                  </td>
                </tr>
              ) : (
                data.map((row, idx) => {
                  const isChecked = selectedRows.includes(row.id);
                  const showMenu = activeActionsRowId === row.id;

                  return (
                    <tr
                      key={row.id}
                      className={`hover:bg-slate-50/50 transition-colors duration-200 ${
                        idx % 2 === 0 ? '' : 'bg-slate-50/20'
                      }`}
                    >
                      <td className="p-4 text-center">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => handleSelectRow(row.id, e.target.checked)}
                          className="rounded text-brand-600 focus:ring-brand-500 h-4 w-4 border-slate-300"
                        />
                      </td>

                      {visibleColumns.invoiceNumber && (
                        <td
                          className="p-4 font-mono font-semibold text-slate-900 hover:text-brand-600 cursor-pointer"
                          onClick={() => onViewDetails(row)}
                        >
                          {row.invoiceNumber}
                        </td>
                      )}

                      {visibleColumns.purchaseOrderNumber && (
                        <td className="p-4 font-mono text-slate-700">{row.purchaseOrderNumber}</td>
                      )}

                      {visibleColumns.amount && (
                        <td className="p-4 text-right font-mono font-bold text-slate-800">
                          {formatCurrency(row.amount)}
                        </td>
                      )}

                      {visibleColumns.createdAt && <td className="p-4 text-slate-600">{row.createdAt}</td>}
                      {visibleColumns.dueDate && <td className="p-4 text-slate-600">{row.dueDate}</td>}

                      {visibleColumns.status && (
                        <td className="p-4">
                          <Badge variant={getStatusBadgeVariant(row.status)} className="capitalize">
                            {row.status.replace('_', ' ')}
                          </Badge>
                        </td>
                      )}

                      <td className="p-4 text-center relative">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 rounded-full"
                          onClick={() => setActiveActionsRowId(activeActionsRowId === row.id ? null : row.id)}
                        >
                          <MoreVertical className="h-4 w-4 text-slate-500" />
                        </Button>

                        {showMenu && (
                          <div className="absolute right-4 mt-1 w-44 bg-white border border-slate-200 rounded-xl shadow-lg p-1.5 z-30 text-left space-y-0.5 animate-slide-in">
                            <button
                              onClick={() => {
                                onViewDetails(row);
                                setActiveActionsRowId(null);
                              }}
                              className="flex items-center w-full px-2.5 py-1.5 text-xs text-slate-700 hover:bg-slate-50 rounded-lg"
                            >
                              <Eye className="h-3.5 w-3.5 mr-2 text-slate-400" />
                              View Detail
                            </button>
                            <button
                              onClick={() => {
                                onEdit(row);
                                setActiveActionsRowId(null);
                              }}
                              className="flex items-center w-full px-2.5 py-1.5 text-xs text-slate-700 hover:bg-slate-50 rounded-lg"
                            >
                              <Edit2 className="h-3.5 w-3.5 mr-2 text-slate-400" />
                              Edit Notes
                            </button>
                            {row.status === 'pending_payment' && (
                              <>
                                <button
                                  onClick={() => {
                                    onMarkPaid(row);
                                    setActiveActionsRowId(null);
                                  }}
                                  className="flex items-center w-full px-2.5 py-1.5 text-xs text-emerald-650 hover:bg-emerald-50 rounded-lg"
                                >
                                  <CheckCircle className="h-3.5 w-3.5 mr-2 text-emerald-500" />
                                  Mark as Paid
                                </button>
                                <button
                                  onClick={() => {
                                    onCancel(row);
                                    setActiveActionsRowId(null);
                                  }}
                                  className="flex items-center w-full px-2.5 py-1.5 text-xs text-rose-600 hover:bg-rose-50 rounded-lg"
                                >
                                  <XCircle className="h-3.5 w-3.5 mr-2 text-rose-500" />
                                  Cancel Invoice
                                </button>
                              </>
                            )}
                            <button
                              onClick={() => {
                                onDelete(row);
                                setActiveActionsRowId(null);
                              }}
                              className="flex items-center w-full px-2.5 py-1.5 text-xs text-rose-700 hover:bg-rose-50 rounded-lg"
                            >
                              <Trash2 className="h-3.5 w-3.5 mr-2 text-rose-500" />
                              Delete
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        <div className="px-4 py-3 border-t border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-slate-500">
          <div className="flex items-center space-x-2.5">
            <span className="text-xs">Rows per page:</span>
            <select
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              className="h-8 border border-slate-300 bg-white rounded-md px-1 py-0.5 text-xs focus:ring-brand-500 focus:border-brand-500 text-slate-800"
              title="Rows per page selection"
            >
              {[5, 10, 20, 50].map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
            <span className="text-xs">
              Showing {total === 0 ? 0 : (page - 1) * pageSize + 1} to{' '}
              {Math.min(page * pageSize, total)} of {total} results
            </span>
          </div>

          <div className="flex items-center space-x-1.5 self-center sm:self-auto">
            <Button
              variant="outline"
              size="sm"
              className="h-8 w-8 p-0"
              disabled={page === 1}
              onClick={() => onPageChange(1)}
            >
              <ChevronsLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-8 w-8 p-0"
              disabled={page === 1}
              onClick={() => onPageChange(page - 1)}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-xs font-semibold px-2 text-slate-700">
              Page {page} of {totalPages || 1}
            </span>
            <Button
              variant="outline"
              size="sm"
              className="h-8 w-8 p-0"
              disabled={page === totalPages || totalPages === 0}
              onClick={() => onPageChange(page + 1)}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-8 w-8 p-0"
              disabled={page === totalPages || totalPages === 0}
              onClick={() => onPageChange(totalPages)}
            >
              <ChevronsRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
