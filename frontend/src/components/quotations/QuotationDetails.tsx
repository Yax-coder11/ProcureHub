import { Landmark, Calendar, Mail, FileText, Download, Building2 } from 'lucide-react';
import { Quotation } from '../../types/quotation';
import { quotationService } from '../../services/quotationService';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';

interface QuotationDetailsProps {
  quotation: Quotation;
}

export function QuotationDetails({ quotation }: QuotationDetailsProps) {
  let statusVariant: 'success' | 'warning' | 'danger' | 'default' | 'info' = 'default';
  if (quotation.status === 'accepted') statusVariant = 'success';
  if (quotation.status === 'submitted') statusVariant = 'info';
  if (quotation.status === 'draft') statusVariant = 'default';
  if (quotation.status === 'rejected') statusVariant = 'danger';
  if (quotation.status === 'expired') statusVariant = 'warning';

  return (
    <div className="space-y-6">
      {/* Top Banner Card */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-slate-50 border border-slate-200 rounded-xl">
        <div className="flex items-start space-x-3.5">
          <div className="p-3 bg-white rounded-lg border border-slate-200 text-slate-500 shadow-sm flex-shrink-0">
            <FileText className="h-6 w-6 text-brand-600" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-base font-semibold text-slate-900">Quotation Proposal</h3>
              <Badge variant={statusVariant} className="capitalize">
                {quotation.status}
              </Badge>
            </div>
            <p className="text-xs text-slate-500 font-mono mt-0.5">{quotation.id}</p>
            <p className="text-xs text-slate-400 font-normal mt-1">
              Associated RFQ: <span className="font-semibold font-mono uppercase text-slate-700">{quotation.rfqId}</span>
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-2 items-start sm:items-end">
          <div className="flex items-center text-xs text-slate-500 bg-white border border-slate-200 px-3 py-1.5 rounded-lg shadow-sm">
            <Calendar className="h-4 w-4 mr-1.5 text-slate-400" />
            Valid Until: <span className="font-semibold text-slate-700 ml-1">{quotation.validityDate}</span>
          </div>
          <Button
            size="sm"
            variant="outline"
            className="text-xs font-semibold gap-1"
            onClick={() => quotationService.downloadPDF(quotation)}
          >
            <Download className="h-3.5 w-3.5" />
            Download PDF
          </Button>
        </div>
      </div>

      {/* Corporate Metadata */}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="border border-slate-200 rounded-xl p-5 space-y-4">
          <h4 className="text-sm font-semibold text-slate-800 flex items-center border-b border-slate-100 pb-2">
            <Building2 className="h-4 w-4 mr-2 text-slate-500" />
            Customer Entity
          </h4>
          <div className="space-y-2 text-xs text-slate-650">
            <div className="flex items-center">
              <span className="w-20 text-slate-400 font-medium">Name:</span>
              <span className="font-semibold text-slate-800">{quotation.customerName}</span>
            </div>
            <div className="flex items-center">
              <span className="w-20 text-slate-400 font-medium">Bidding Site:</span>
              <span className="text-slate-700 font-medium">ProcureHub ERP System</span>
            </div>
          </div>
        </div>

        <div className="border border-slate-200 rounded-xl p-5 space-y-4">
          <h4 className="text-sm font-semibold text-slate-800 flex items-center border-b border-slate-100 pb-2">
            <Landmark className="h-4 w-4 mr-2 text-slate-500" />
            Submission Audit
          </h4>
          <div className="space-y-2 text-xs text-slate-650">
            <div className="flex items-center">
              <span className="w-24 text-slate-400 font-medium">Submitted On:</span>
              <span className="font-semibold text-slate-800">{quotation.submittedDate || 'Not Submitted'}</span>
            </div>
            <div className="flex items-center">
              <span className="w-24 text-slate-400 font-medium">Quotation Validity:</span>
              <span className="text-slate-700 font-medium">Fixed pricing guaranteed</span>
            </div>
          </div>
        </div>
      </div>

      {/* Items Table */}
      <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
        <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/50">
          <h4 className="text-sm font-semibold text-slate-800">Quoted Line Items</h4>
        </div>
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-150 bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-450">
              <th className="px-5 py-3">Description</th>
              <th className="px-5 py-3 text-center">Qty</th>
              <th className="px-5 py-3 text-right">Unit Price</th>
              <th className="px-5 py-3 text-center">Discount %</th>
              <th className="px-5 py-3 text-center">Tax %</th>
              <th className="px-5 py-3 text-right pr-6">Total (₹)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs text-slate-650">
            {quotation.lineItems.map((item) => (
              <tr key={item.id}>
                <td className="px-5 py-3.5 font-medium text-slate-850">{item.productName}</td>
                <td className="px-5 py-3.5 text-center font-semibold">{item.quantity}</td>
                <td className="px-5 py-3.5 text-right font-mono">₹{item.unitPrice.toLocaleString('en-IN')}</td>
                <td className="px-5 py-3.5 text-center text-rose-600 font-semibold">{item.discount}%</td>
                <td className="px-5 py-3.5 text-center text-emerald-600 font-semibold">{item.tax}%</td>
                <td className="px-5 py-3.5 text-right pr-6 font-semibold font-mono text-slate-850">
                  ₹{item.total.toLocaleString('en-IN')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Bottom Summary Column Block */}
      <div className="flex flex-col md:flex-row md:justify-between gap-6 border-t border-slate-200 pt-6">
        {/* Notes/Terms block */}
        <div className="flex-1 space-y-2 text-xs">
          <h5 className="font-semibold text-slate-800">Special Notes & Quotation Conditions</h5>
          <p className="text-slate-600 bg-slate-50 border border-slate-200 rounded-lg p-3 leading-relaxed font-normal">
            {quotation.notes || 'No custom notes or special billing instructions attached.'}
          </p>
        </div>

        {/* Calculation items */}
        <div className="w-full md:w-72 space-y-2 text-xs px-2">
          <div className="flex justify-between text-slate-500">
            <span>Subtotal:</span>
            <span className="font-mono">₹{quotation.subtotal.toLocaleString('en-IN')}</span>
          </div>
          <div className="flex justify-between text-rose-650 font-medium">
            <span>Total Discounts:</span>
            <span className="font-mono">₹{quotation.discountTotal.toLocaleString('en-IN')}</span>
          </div>
          <div className="flex justify-between text-emerald-650 font-medium">
            <span>Taxes & GST (Included):</span>
            <span className="font-mono">₹{quotation.taxTotal.toLocaleString('en-IN')}</span>
          </div>
          <div className="flex justify-between border-t border-slate-350 pt-2 text-sm font-bold text-slate-900 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
            <span>Grand Total:</span>
            <span className="font-mono">₹{quotation.grandTotal.toLocaleString('en-IN')}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
