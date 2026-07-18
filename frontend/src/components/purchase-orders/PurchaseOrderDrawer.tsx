import * as React from 'react';
import { PurchaseOrder } from '../../types/purchaseOrder';
import { Drawer } from '../ui/drawer';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import {
  Building2,
  Calendar,
  CreditCard,
  FileText,
  MapPin,
  Paperclip,
  ShieldCheck,
  Truck,
  Activity,
  History,
  Download,
} from 'lucide-react';

interface PurchaseOrderDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  purchaseOrder: PurchaseOrder | null;
  onDownloadPDF?: (po: PurchaseOrder) => void;
}

export function PurchaseOrderDrawer({
  isOpen,
  onClose,
  purchaseOrder,
  onDownloadPDF,
}: PurchaseOrderDrawerProps) {
  if (!purchaseOrder) return null;

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
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

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title={`Purchase Order: ${purchaseOrder.poNumber}`}
      description="Details of raised procurement order"
      size="lg"
      footer={
        <div className="flex justify-between w-full">
          <Button variant="outline" size="sm" onClick={onClose} className="dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800">
            Close
          </Button>
          <div className="flex space-x-2">
            {onDownloadPDF && (
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800"
                onClick={() => onDownloadPDF(purchaseOrder)}
              >
                <Download className="h-4 w-4" />
                Download PDF
              </Button>
            )}
          </div>
        </div>
      }
    >
      <div className="space-y-6 text-slate-700 dark:text-slate-350 pb-8">
        {/* Quick summary banner */}
        <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 flex flex-wrap justify-between items-center gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">Status</span>
              <Badge variant={getStatusBadgeVariant(purchaseOrder.status)} className="capitalize">
                {purchaseOrder.status.replace('_', ' ')}
              </Badge>
              <span className="text-sm font-semibold text-slate-500 dark:text-slate-400 ml-2">Priority</span>
              <Badge variant={getPriorityBadgeVariant(purchaseOrder.priority)} className="capitalize">
                {purchaseOrder.priority}
              </Badge>
            </div>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
              Order Date: <span className="font-semibold text-slate-700 dark:text-slate-300">{purchaseOrder.orderDate}</span>
            </p>
          </div>
          <div className="text-right">
            <span className="text-xs text-slate-400 dark:text-slate-500 block uppercase tracking-wider font-semibold">Total Amount</span>
            <span className="text-2xl font-bold text-slate-900 dark:text-slate-100 font-mono">
              {formatCurrency(purchaseOrder.grandTotal)}
            </span>
          </div>
        </div>

        {/* Corporate Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="border border-slate-200 dark:border-slate-800 rounded-xl p-4 space-y-3 bg-white dark:bg-slate-900">
            <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-200 flex items-center border-b border-slate-100 dark:border-slate-800 pb-2">
              <Building2 className="h-4 w-4 mr-2 text-slate-400" />
              Supplier Information
            </h4>
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Name:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-300">{purchaseOrder.supplierName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Supplier ID:</span>
                <span className="font-mono text-slate-700 dark:text-slate-300">{purchaseOrder.supplierId}</span>
              </div>
              {purchaseOrder.rfqId && (
                <div className="flex justify-between">
                  <span className="text-slate-400">RFQ ID:</span>
                  <span className="font-mono text-slate-700 dark:text-slate-300">{purchaseOrder.rfqId}</span>
                </div>
              )}
              {purchaseOrder.quotationId && (
                <div className="flex justify-between">
                  <span className="text-slate-400">Quotation ID:</span>
                  <span className="font-mono text-slate-700 dark:text-slate-300">{purchaseOrder.quotationId}</span>
                </div>
              )}
            </div>
          </div>

          <div className="border border-slate-200 dark:border-slate-800 rounded-xl p-4 space-y-3 bg-white dark:bg-slate-900">
            <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-200 flex items-center border-b border-slate-100 dark:border-slate-800 pb-2">
              <Truck className="h-4 w-4 mr-2 text-slate-400" />
              Shipping & Expected Delivery
            </h4>
            <div className="space-y-1.5 text-xs">
              <div className="flex items-start justify-between">
                <span className="text-slate-400 flex-shrink-0">Address:</span>
                <span className="text-slate-750 dark:text-slate-300 font-medium text-right max-w-[180px] truncate-3-lines">
                  {purchaseOrder.deliveryAddress}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Expected Delivery:</span>
                <span className="font-semibold text-slate-850 dark:text-slate-300 flex items-center gap-1">
                  <Calendar className="h-3 w-3 text-slate-400" />
                  {purchaseOrder.expectedDeliveryDate}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Shipping Cost:</span>
                <span className="font-mono text-slate-700 dark:text-slate-300">{formatCurrency(purchaseOrder.shippingCost)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Terms and Status */}
        <div className="border border-slate-200 dark:border-slate-800 rounded-xl p-4 space-y-3 bg-white dark:bg-slate-900">
          <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-200 flex items-center border-b border-slate-100 dark:border-slate-800 pb-2">
            <CreditCard className="h-4 w-4 mr-2 text-slate-400" />
            Payment Terms & Status
          </h4>
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-slate-400 block mb-1">Payment Method / Terms</span>
              <span className="font-semibold text-slate-800 dark:text-slate-300 bg-slate-100 dark:bg-slate-850 px-2 py-1 rounded-md">
                {purchaseOrder.paymentTerms}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block mb-1">Payment Status</span>
              <Badge variant={purchaseOrder.paymentStatus === 'paid' ? 'success' : purchaseOrder.paymentStatus === 'partially_paid' ? 'warning' : 'default'} className="capitalize">
                {purchaseOrder.paymentStatus}
              </Badge>
            </div>
          </div>
        </div>

        {/* Ordered items Table */}
        <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-white dark:bg-slate-900">
          <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/20">
            <h4 className="text-xs font-bold text-slate-800 dark:text-slate-300 uppercase tracking-wider">Ordered Items</h4>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-950/40 border-b border-slate-250 dark:border-slate-800 text-slate-500 dark:text-slate-400">
                  <th className="p-3">Product Name</th>
                  <th className="p-3 text-right">Qty</th>
                  <th className="p-3 text-right">Unit Price</th>
                  <th className="p-3 text-right">Disc %</th>
                  <th className="p-3 text-right">GST %</th>
                  <th className="p-3 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {purchaseOrder.lineItems.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/30 dark:hover:bg-slate-850/20 text-slate-700 dark:text-slate-350">
                    <td className="p-3 font-semibold">{item.productName}</td>
                    <td className="p-3 text-right font-mono">{item.quantity}</td>
                    <td className="p-3 text-right font-mono">{formatCurrency(item.unitPrice)}</td>
                    <td className="p-3 text-right font-mono">{item.discount}%</td>
                    <td className="p-3 text-right font-mono">{item.tax}%</td>
                    <td className="p-3 text-right font-mono font-semibold">{formatCurrency(item.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* GST/Tax Breakdown and Summary */}
        <div className="flex justify-end">
          <div className="w-full md:w-80 border border-slate-200 dark:border-slate-800 rounded-xl p-4 bg-slate-50/40 dark:bg-slate-900/40 space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-400">Subtotal:</span>
              <span className="font-semibold text-slate-800 dark:text-slate-300">{formatCurrency(purchaseOrder.subtotal)}</span>
            </div>
            <div className="flex justify-between text-rose-600 dark:text-rose-400">
              <span>Discount Total:</span>
              <span>-{formatCurrency(purchaseOrder.discountTotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">GST/Tax Total:</span>
              <span className="font-semibold text-slate-800 dark:text-slate-300">{formatCurrency(purchaseOrder.taxTotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Shipping Cost:</span>
              <span className="font-semibold text-slate-800 dark:text-slate-300">{formatCurrency(purchaseOrder.shippingCost)}</span>
            </div>
            <div className="border-t border-slate-200 dark:border-slate-800 pt-2 mt-1 flex justify-between text-sm font-bold text-slate-900 dark:text-slate-100">
              <span>Grand Total:</span>
              <span className="font-mono">{formatCurrency(purchaseOrder.grandTotal)}</span>
            </div>
          </div>
        </div>

        {/* Timeline & History */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
          {/* Approval History / Timeline */}
          <div className="border border-slate-200 dark:border-slate-800 rounded-xl p-4 bg-white dark:bg-slate-900 space-y-3">
            <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-200 flex items-center border-b border-slate-100 dark:border-slate-800 pb-2">
              <History className="h-4 w-4 mr-2 text-slate-400" />
              Approval Timeline
            </h4>
            <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
              {purchaseOrder.timeline.map((event) => (
                <div key={event.id} className="relative text-xs">
                  <span className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-brand-500 border border-white dark:border-slate-900" />
                  <div className="flex justify-between text-[10px] text-slate-400 mb-0.5">
                    <span>{new Date(event.date).toLocaleDateString()} {new Date(event.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    <span className="font-semibold text-slate-500">{event.user}</span>
                  </div>
                  <h5 className="font-semibold text-slate-805 dark:text-slate-350">{event.action}</h5>
                  {event.notes && <p className="text-slate-400 dark:text-slate-500 mt-0.5 text-[11px] italic">{event.notes}</p>}
                </div>
              ))}
            </div>
          </div>

          {/* Activity Log */}
          <div className="border border-slate-200 dark:border-slate-800 rounded-xl p-4 bg-white dark:bg-slate-900 space-y-3">
            <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-200 flex items-center border-b border-slate-100 dark:border-slate-800 pb-2">
              <Activity className="h-4 w-4 mr-2 text-slate-400" />
              Activity Log
            </h4>
            <div className="space-y-3 text-xs max-h-48 overflow-y-auto pr-1">
              {purchaseOrder.activityLog.map((log) => (
                <div key={log.id} className="flex gap-2 items-start text-xs border-b border-slate-50 dark:border-slate-850 pb-2">
                  <span className="text-[10px] text-slate-400 flex-shrink-0 font-mono mt-0.5">
                    {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  <div>
                    <span className="font-semibold text-slate-800 dark:text-slate-300">{log.action}:</span>{' '}
                    <span className="text-slate-500 dark:text-slate-450">{log.details}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Attachments */}
        <div className="border border-slate-200 dark:border-slate-800 rounded-xl p-4 bg-white dark:bg-slate-900 space-y-3">
          <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-200 flex items-center border-b border-slate-100 dark:border-slate-800 pb-2">
            <Paperclip className="h-4 w-4 mr-2 text-slate-400" />
            Attachments ({purchaseOrder.attachments.length})
          </h4>
          {purchaseOrder.attachments.length === 0 ? (
            <p className="text-xs text-slate-400 italic">No attachments uploaded for this Purchase Order.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
              {purchaseOrder.attachments.map((file) => (
                <div
                  key={file.id}
                  className="flex items-center justify-between border border-slate-200 dark:border-slate-800 rounded-lg p-2.5 hover:bg-slate-50 dark:hover:bg-slate-850/20"
                >
                  <div className="flex items-center space-x-2.5">
                    <FileText className="h-5 w-5 text-brand-500" />
                    <div>
                      <p className="font-semibold text-slate-800 dark:text-slate-300 truncate max-w-[180px]">{file.name}</p>
                      <p className="text-[10px] text-slate-400">{file.size} • {file.type}</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" className="h-7 w-7 p-0 rounded-full" title="Download">
                    <Download className="h-3.5 w-3.5 text-slate-500" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Drawer>
  );
}
