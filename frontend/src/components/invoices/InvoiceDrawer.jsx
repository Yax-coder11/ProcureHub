import * as React from 'react';
import { Drawer } from '../ui/drawer';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import {
  Calendar,
  CreditCard,
  FileText,
  ShieldCheck,
  History,
  Download,
} from 'lucide-react';

export function InvoiceDrawer({ isOpen, onClose, invoice }) {
  if (!invoice) return null;

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
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

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title={`Invoice Details: ${invoice.invoiceNumber}`}
      description="Billing transaction details"
      size="md"
      footer={
        <div className="flex justify-between w-full">
          <Button variant="outline" size="sm" onClick={onClose}>
            Close
          </Button>
          <Button variant="outline" size="sm" className="gap-1.5" onClick={() => alert('Downloading PDF Invoice...')}>
            <Download className="h-4 w-4" />
            Download PDF
          </Button>
        </div>
      }
    >
      <div className="space-y-6 text-slate-700 pb-8">
        {/* Banner Summary */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 flex flex-wrap justify-between items-center gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-slate-500">Status</span>
              <Badge variant={getStatusBadgeVariant(invoice.status)} className="capitalize">
                {invoice.status.replace('_', ' ')}
              </Badge>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Issued On: <span className="font-semibold text-slate-700">{invoice.createdAt}</span>
            </p>
          </div>
          <div className="text-right">
            <span className="text-xs text-slate-400 block uppercase tracking-wider font-semibold">Invoice Amount</span>
            <span className="text-2xl font-bold text-slate-900 font-mono">
              {formatCurrency(invoice.amount)}
            </span>
          </div>
        </div>

        {/* Association Metadata */}
        <div className="border border-slate-200 rounded-xl p-4 space-y-3 bg-white">
          <h4 className="text-sm font-semibold text-slate-900 flex items-center border-b border-slate-100 pb-2">
            <FileText className="h-4 w-4 mr-2 text-slate-400" />
            Sourcing References
          </h4>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-400">Associated Purchase Order:</span>
              <span className="font-mono font-semibold text-slate-805">{invoice.purchaseOrderNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Payment Due Date:</span>
              <span className="font-semibold text-slate-805 flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5 text-slate-400" />
                {invoice.dueDate}
              </span>
            </div>
            {invoice.paymentDate && (
              <div className="flex justify-between text-emerald-600">
                <span>Cleared On:</span>
                <span className="font-semibold flex items-center gap-1">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  {invoice.paymentDate}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Special notes */}
        <div className="border border-slate-200 rounded-xl p-4 bg-white space-y-2">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Invoice Notes</h4>
          <p className="text-xs text-slate-650 leading-relaxed italic">
            {invoice.notes || 'No special notes or terms added.'}
          </p>
        </div>

        {/* Activity logs */}
        <div className="border border-slate-200 rounded-xl p-4 bg-white space-y-3">
          <h4 className="text-sm font-semibold text-slate-900 flex items-center border-b border-slate-100 pb-2">
            <History className="h-4 w-4 mr-2 text-slate-400" />
            Audit Action Trail
          </h4>
          <div className="space-y-3 text-xs max-h-48 overflow-y-auto">
            {invoice.activityLog.map((log) => (
              <div key={log.id} className="flex gap-2 items-start text-xs border-b border-slate-50 pb-2">
                <span className="text-[10px] text-slate-400 flex-shrink-0 font-mono mt-0.5">
                  {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
                <div>
                  <span className="font-semibold text-slate-800">{log.action}:</span>{' '}
                  <span className="text-slate-550">{log.details}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Drawer>
  );
}
