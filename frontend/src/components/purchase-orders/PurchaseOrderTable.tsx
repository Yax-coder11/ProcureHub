import * as React from 'react';
import {
  MoreVertical,
  Eye,
  Edit2,
  CheckCircle,
  Download,
  Printer,
  Copy,
  Truck,
  Trash2,
  XCircle,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ArrowUpDown,
  SlidersHorizontal,
} from 'lucide-react';
import { PurchaseOrder } from '../../types/purchaseOrder';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';

interface PurchaseOrderTableProps {
  data: PurchaseOrder[];
  isLoading: boolean;
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  onSortChange: (field: string) => void;
  onViewDetails: (po: PurchaseOrder) => void;
  onEdit: (po: PurchaseOrder) => void;
  onDelete: (po: PurchaseOrder) => void;
  onApprove: (po: PurchaseOrder) => void;
  onCancel: (po: PurchaseOrder) => void;
  onDuplicate: (po: PurchaseOrder) => void;
  onTrackDelivery: (po: PurchaseOrder) => void;
  onDownloadPDF: (po: PurchaseOrder) => void;
  onPrint: (po: PurchaseOrder) => void;
  selectedRows: string[];
  setSelectedRows: (ids: string[]) => void;
  onBulkAction: (action: string, ids: string[]) => void;
}

export function PurchaseOrderTable({
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
  onApprove,
  onCancel,
  onDuplicate,
  onTrackDelivery,
  onDownloadPDF,
  onPrint,
  selectedRows,
  setSelectedRows,
  onBulkAction,
}: PurchaseOrderTableProps) {
  const [activeActionsRowId, setActiveActionsRowId] = React.useState<string | null>(null);
  const [showColumnDropdown, setShowColumnDropdown] = React.useState(false);

  // Column visibility state
  const [visibleColumns, setVisibleColumns] = React.useState({
    poNumber: true,
    supplier: true,
    rfq: true,
    quotation: true,
    orderDate: true,
    expectedDelivery: true,
    amount: true,
    priority: true,
    status: true,
    paymentStatus: true,
  });

  const dropdownRef = React.useRef<HTMLDivElement>(null);

  // Close actions dropdown on click outside
  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setActiveActionsRowId(null);
        setShowColumnDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const totalPages = Math.ceil(total / pageSize);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
  };

  const getAvatarBg = (name: string) => {
    const colors = [
      'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300',
      'bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300',
      'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300',
      'bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-300',
      'bg-teal-100 text-teal-700 dark:bg-teal-950 dark:text-teal-300',
    ];
    let sum = 0;
    for (let i = 0; i < name.length; i++) sum += name.charCodeAt(i);
    return colors[sum % colors.length];
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'draft':
        return 'default';
      case 'pending_approval':
        return 'warning';
      case 'approved':
        return 'success';
      case 'sent':
        return 'info';
      case 'partially_delivered':
        return 'warning';
      case 'delivered':
        return 'success';
      case 'cancelled':
      case 'rejected':
        return 'danger';
      default:
        return 'default';
    }
  };

  const getPriorityBadgeVariant = (priority: string) => {
    switch (priority) {
      case 'low':
        return 'default';
      case 'medium':
        return 'info';
      case 'high':
        return 'warning';
      case 'urgent':
        return 'danger';
      default:
        return 'default';
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedRows(data.map((row) => row.id));
    } else {
      setSelectedRows([]);
    }
  };

  const handleSelectRow = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedRows([...selectedRows, id]);
    } else {
      setSelectedRows(selectedRows.filter((rid) => rid !== id));
    }
  };

  return (
    <div className="space-y-4" ref={dropdownRef}>
      {/* Bulk actions and Column Selector controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          {selectedRows.length > 0 && (
            <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-1 text-xs">
              <span className="font-semibold text-brand-600 dark:text-brand-400">{selectedRows.length} selected</span>
              <div className="h-4 w-px bg-slate-200 dark:bg-slate-800 mx-1" />
              <button
                onClick={() => onBulkAction('approve', selectedRows)}
                className="hover:text-emerald-600 font-medium px-1"
                title="Approve selected"
              >
                Approve
              </button>
              <button
                onClick={() => onBulkAction('cancel', selectedRows)}
                className="hover:text-rose-600 font-medium px-1"
                title="Cancel selected"
              >
                Cancel
              </button>
              <button
                onClick={() => onBulkAction('delete', selectedRows)}
                className="hover:text-rose-700 font-medium px-1"
                title="Delete selected"
              >
                Delete
              </button>
            </div>
          )}
        </div>

        {/* Column visibility dropdown button */}
        <div className="relative self-end sm:self-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowColumnDropdown(!showColumnDropdown)}
            className="text-xs gap-1.5 dark:border-slate-800 dark:text-slate-350 dark:hover:bg-slate-800"
          >
            <SlidersHorizontal className="h-3.5 w-3.5" />
            Columns
          </Button>

          {showColumnDropdown && (
            <div className="absolute right-0 mt-1.5 w-44 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-lg p-2.5 z-40 space-y-1.5">
              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block px-1">Toggle Columns</span>
              {Object.keys(visibleColumns).map((col) => (
                <label
                  key={col}
                  className="flex items-center space-x-2 text-xs hover:bg-slate-50 dark:hover:bg-slate-850 px-2 py-1 rounded-md cursor-pointer text-slate-705 dark:text-slate-300"
                >
                  <input
                    type="checkbox"
                    checked={visibleColumns[col as keyof typeof visibleColumns]}
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

      {/* Main Table Grid Container */}
      <div className="border border-slate-250 dark:border-slate-800 rounded-xl overflow-hidden bg-white dark:bg-slate-900 shadow-sm transition-all duration-300">
        <div className="overflow-x-auto relative min-h-[250px]">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 dark:bg-slate-950/60 border-b border-slate-200 dark:border-slate-850 text-slate-500 dark:text-slate-400 sticky top-0 z-10 backdrop-blur-sm">
                {/* Select All Checkbox */}
                <th className="p-4 w-12 text-center">
                  <input
                    type="checkbox"
                    checked={data.length > 0 && selectedRows.length === data.length}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="rounded text-brand-600 focus:ring-brand-500 h-4 w-4 border-slate-300"
                    title="Select All"
                  />
                </th>
                {visibleColumns.poNumber && (
                  <th className="p-4 cursor-pointer select-none" onClick={() => onSortChange('poNumber')}>
                    <div className="flex items-center gap-1">
                      PO Number
                      <ArrowUpDown className="h-3.5 w-3.5 opacity-60" />
                    </div>
                  </th>
                )}
                {visibleColumns.supplier && (
                  <th className="p-4 cursor-pointer select-none" onClick={() => onSortChange('supplierName')}>
                    <div className="flex items-center gap-1">
                      Supplier
                      <ArrowUpDown className="h-3.5 w-3.5 opacity-60" />
                    </div>
                  </th>
                )}
                {visibleColumns.rfq && <th className="p-4">RFQ</th>}
                {visibleColumns.quotation && <th className="p-4">Quotation</th>}
                {visibleColumns.orderDate && (
                  <th className="p-4 cursor-pointer select-none" onClick={() => onSortChange('orderDate')}>
                    <div className="flex items-center gap-1">
                      Order Date
                      <ArrowUpDown className="h-3.5 w-3.5 opacity-60" />
                    </div>
                  </th>
                )}
                {visibleColumns.expectedDelivery && (
                  <th className="p-4 cursor-pointer select-none" onClick={() => onSortChange('expectedDeliveryDate')}>
                    <div className="flex items-center gap-1">
                      Expected Delivery
                      <ArrowUpDown className="h-3.5 w-3.5 opacity-60" />
                    </div>
                  </th>
                )}
                {visibleColumns.amount && (
                  <th className="p-4 cursor-pointer select-none text-right" onClick={() => onSortChange('grandTotal')}>
                    <div className="flex items-center gap-1 justify-end">
                      Total Amount
                      <ArrowUpDown className="h-3.5 w-3.5 opacity-60" />
                    </div>
                  </th>
                )}
                {visibleColumns.priority && <th className="p-4">Priority</th>}
                {visibleColumns.status && <th className="p-4">Status</th>}
                {visibleColumns.paymentStatus && <th className="p-4">Payment Status</th>}
                <th className="p-4 text-center">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, idx) => (
                  <tr key={idx} className="animate-pulse">
                    <td className="p-4"><div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-4 mx-auto" /></td>
                    {visibleColumns.poNumber && <td className="p-4"><div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-20" /></td>}
                    {visibleColumns.supplier && (
                      <td className="p-4">
                        <div className="flex items-center space-x-2">
                          <div className="h-6 w-6 bg-slate-200 dark:bg-slate-800 rounded-full" />
                          <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-28" />
                        </div>
                      </td>
                    )}
                    {visibleColumns.rfq && <td className="p-4"><div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-16" /></td>}
                    {visibleColumns.quotation && <td className="p-4"><div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-16" /></td>}
                    {visibleColumns.orderDate && <td className="p-4"><div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-20" /></td>}
                    {visibleColumns.expectedDelivery && <td className="p-4"><div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-20" /></td>}
                    {visibleColumns.amount && <td className="p-4"><div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-16 ml-auto" /></td>}
                    {visibleColumns.priority && <td className="p-4"><div className="h-5 bg-slate-200 dark:bg-slate-800 rounded w-14" /></td>}
                    {visibleColumns.status && <td className="p-4"><div className="h-5 bg-slate-200 dark:bg-slate-800 rounded w-16" /></td>}
                    {visibleColumns.paymentStatus && <td className="p-4"><div className="h-5 bg-slate-200 dark:bg-slate-800 rounded w-16" /></td>}
                    <td className="p-4"><div className="h-6 bg-slate-200 dark:bg-slate-800 rounded w-8 mx-auto" /></td>
                  </tr>
                ))
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan={12} className="text-center py-10">
                    <p className="text-slate-400 dark:text-slate-500 font-medium">No matching purchase orders found.</p>
                  </td>
                </tr>
              ) : (
                data.map((row, idx) => {
                  const isChecked = selectedRows.includes(row.id);
                  const showMenu = activeActionsRowId === row.id;

                  return (
                    <tr
                      key={row.id}
                      className={`hover:bg-slate-50/50 dark:hover:bg-slate-850/10 transition-colors duration-200 ${
                        idx % 2 === 0 ? '' : 'bg-slate-50/20 dark:bg-slate-900/10'
                      }`}
                    >
                      {/* Checkbox */}
                      <td className="p-4 text-center">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => handleSelectRow(row.id, e.target.checked)}
                          className="rounded text-brand-600 focus:ring-brand-500 h-4 w-4 border-slate-300"
                        />
                      </td>

                      {/* PO Number */}
                      {visibleColumns.poNumber && (
                        <td
                          className="p-4 font-mono font-semibold text-slate-900 dark:text-slate-100 hover:text-brand-600 cursor-pointer"
                          onClick={() => onViewDetails(row)}
                        >
                          {row.poNumber}
                        </td>
                      )}

                      {/* Supplier */}
                      {visibleColumns.supplier && (
                        <td className="p-4">
                          <div className="flex items-center space-x-2.5">
                            <div
                              className={`h-7 w-7 rounded-full flex items-center justify-center text-[10px] font-bold shadow-sm ${getAvatarBg(
                                row.supplierName
                              )}`}
                            >
                              {getInitials(row.supplierName)}
                            </div>
                            <span className="font-semibold text-slate-800 dark:text-slate-350">{row.supplierName}</span>
                          </div>
                        </td>
                      )}

                      {/* RFQ */}
                      {visibleColumns.rfq && (
                        <td className="p-4 font-mono text-slate-500 dark:text-slate-450 uppercase">{row.rfqId || '—'}</td>
                      )}

                      {/* Quotation */}
                      {visibleColumns.quotation && (
                        <td className="p-4 font-mono text-slate-500 dark:text-slate-450 uppercase">{row.quotationId || '—'}</td>
                      )}

                      {/* Order Date */}
                      {visibleColumns.orderDate && (
                        <td className="p-4 text-slate-600 dark:text-slate-400">{row.orderDate}</td>
                      )}

                      {/* Expected Delivery */}
                      {visibleColumns.expectedDelivery && (
                        <td className="p-4 text-slate-600 dark:text-slate-400">{row.expectedDeliveryDate}</td>
                      )}

                      {/* Amount */}
                      {visibleColumns.amount && (
                        <td className="p-4 text-right font-mono font-bold text-slate-850 dark:text-slate-200">
                          {formatCurrency(row.grandTotal)}
                        </td>
                      )}

                      {/* Priority */}
                      {visibleColumns.priority && (
                        <td className="p-4">
                          <Badge variant={getPriorityBadgeVariant(row.priority)} className="capitalize">
                            {row.priority}
                          </Badge>
                        </td>
                      )}

                      {/* Status */}
                      {visibleColumns.status && (
                        <td className="p-4">
                          <Badge variant={getStatusBadgeVariant(row.status)} className="capitalize">
                            {row.status.replace('_', ' ')}
                          </Badge>
                        </td>
                      )}

                      {/* Payment Status */}
                      {visibleColumns.paymentStatus && (
                        <td className="p-4">
                          <Badge
                            variant={row.paymentStatus === 'paid' ? 'success' : row.paymentStatus === 'partially_paid' ? 'warning' : 'default'}
                            className="capitalize"
                          >
                            {row.paymentStatus.replace('_', ' ')}
                          </Badge>
                        </td>
                      )}

                      {/* Actions Menu */}
                      <td className="p-4 text-center relative">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 rounded-full dark:hover:bg-slate-800"
                          onClick={() => setActiveActionsRowId(activeActionsRowId === row.id ? null : row.id)}
                        >
                          <MoreVertical className="h-4 w-4 text-slate-500" />
                        </Button>

                        {showMenu && (
                          <div className="absolute right-4 mt-1 w-44 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-lg p-1.5 z-30 text-left space-y-0.5 animate-slide-in">
                            <button
                              onClick={() => {
                                onViewDetails(row);
                                setActiveActionsRowId(null);
                              }}
                              className="flex items-center w-full px-2.5 py-1.5 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-850 rounded-lg"
                            >
                              <Eye className="h-3.5 w-3.5 mr-2 text-slate-400" />
                              View Detail
                            </button>
                            <button
                              onClick={() => {
                                onEdit(row);
                                setActiveActionsRowId(null);
                              }}
                              className="flex items-center w-full px-2.5 py-1.5 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-850 rounded-lg"
                            >
                              <Edit2 className="h-3.5 w-3.5 mr-2 text-slate-400" />
                              Edit
                            </button>
                            {row.status === 'pending_approval' && (
                              <button
                                onClick={() => {
                                  onApprove(row);
                                  setActiveActionsRowId(null);
                                }}
                                className="flex items-center w-full px-2.5 py-1.5 text-xs text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 rounded-lg"
                              >
                                <CheckCircle className="h-3.5 w-3.5 mr-2 text-emerald-500" />
                                Approve
                              </button>
                            )}
                            <button
                              onClick={() => {
                                onDownloadPDF(row);
                                setActiveActionsRowId(null);
                              }}
                              className="flex items-center w-full px-2.5 py-1.5 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-850 rounded-lg"
                            >
                              <Download className="h-3.5 w-3.5 mr-2 text-slate-400" />
                              Download PDF
                            </button>
                            <button
                              onClick={() => {
                                onPrint(row);
                                setActiveActionsRowId(null);
                              }}
                              className="flex items-center w-full px-2.5 py-1.5 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-850 rounded-lg"
                            >
                              <Printer className="h-3.5 w-3.5 mr-2 text-slate-400" />
                              Print
                            </button>
                            <button
                              onClick={() => {
                                onDuplicate(row);
                                setActiveActionsRowId(null);
                              }}
                              className="flex items-center w-full px-2.5 py-1.5 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-850 rounded-lg"
                            >
                              <Copy className="h-3.5 w-3.5 mr-2 text-slate-400" />
                              Duplicate
                            </button>
                            {(row.status === 'approved' || row.status === 'sent' || row.status === 'partially_delivered') && (
                              <button
                                onClick={() => {
                                  onTrackDelivery(row);
                                  setActiveActionsRowId(null);
                                }}
                                className="flex items-center w-full px-2.5 py-1.5 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-850 rounded-lg"
                              >
                                <Truck className="h-3.5 w-3.5 mr-2 text-slate-400" />
                                Track Delivery
                              </button>
                            )}
                            {row.status !== 'cancelled' && row.status !== 'delivered' && (
                              <button
                                onClick={() => {
                                  onCancel(row);
                                  setActiveActionsRowId(null);
                                }}
                                className="flex items-center w-full px-2.5 py-1.5 text-xs text-rose-600 dark:text-rose-450 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-lg"
                              >
                                <XCircle className="h-3.5 w-3.5 mr-2 text-rose-500" />
                                Cancel
                              </button>
                            )}
                            <button
                              onClick={() => {
                                onDelete(row);
                                setActiveActionsRowId(null);
                              }}
                              className="flex items-center w-full px-2.5 py-1.5 text-xs text-rose-700 dark:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-lg"
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

        {/* Table Pagination Controls */}
        <div className="px-4 py-3 border-t border-slate-200 dark:border-slate-805 bg-slate-50/50 dark:bg-slate-950/20 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-slate-500 dark:text-slate-400">
          <div className="flex items-center space-x-2.5">
            <span className="text-xs">Rows per page:</span>
            <select
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              className="h-8 border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-md px-1 py-0.5 text-xs focus:ring-brand-500 focus:border-brand-500 text-slate-800 dark:text-slate-300"
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
              className="h-8 w-8 p-0 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800"
              disabled={page === 1}
              onClick={() => onPageChange(1)}
            >
              <ChevronsLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-8 w-8 p-0 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800"
              disabled={page === 1}
              onClick={() => onPageChange(page - 1)}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-xs font-semibold px-2 text-slate-700 dark:text-slate-300">
              Page {page} of {totalPages || 1}
            </span>
            <Button
              variant="outline"
              size="sm"
              className="h-8 w-8 p-0 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800"
              disabled={page === totalPages || totalPages === 0}
              onClick={() => onPageChange(page + 1)}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-8 w-8 p-0 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800"
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
