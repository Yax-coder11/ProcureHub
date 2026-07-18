import * as React from 'react';
import { useForm, useFieldArray, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Plus, Trash2, Calculator } from 'lucide-react';
import { Quotation, QuotationLineItem } from '../../types/quotation';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Select } from '../ui/select';

const lineItemSchema = z.object({
  productName: z.string().min(2, 'Product name is required.'),
  quantity: z.preprocess(
    (val) => Number(val),
    z.number().min(1, 'Quantity must be at least 1.')
  ),
  unitPrice: z.preprocess(
    (val) => Number(val),
    z.number().min(0.01, 'Unit price must be greater than 0.')
  ),
  discount: z.preprocess(
    (val) => (val === '' ? 0 : Number(val)),
    z.number().min(0).max(100, 'Discount percentage cannot exceed 100%.')
  ),
  tax: z.preprocess(
    (val) => (val === '' ? 0 : Number(val)),
    z.number().min(0).max(100, 'Tax percentage cannot exceed 100%.')
  ),
});

const quotationSchema = z.object({
  rfqId: z.string().min(1, 'RFQ ID is required.'),
  customerName: z.string().min(2, 'Customer name is required.'),
  lineItems: z.array(lineItemSchema).min(1, 'At least one line item is required.'),
  notes: z.string().optional(),
  validityDate: z.string().min(1, 'Validity date is required.'),
});

type QuotationFormValues = z.infer<typeof quotationSchema>;

interface QuotationFormProps {
  initialData?: Quotation;
  onSubmit: (data: QuotationFormValues & { isSubmit: boolean; status: 'draft' | 'submitted' }) => void;
  isLoading?: boolean;
  onCancel: () => void;
}

export function QuotationForm({ initialData, onSubmit, isLoading, onCancel }: QuotationFormProps) {
  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors },
  } = useForm<QuotationFormValues>({
    resolver: zodResolver(quotationSchema),
    defaultValues: initialData
      ? {
          rfqId: initialData.rfqId,
          customerName: initialData.customerName,
          lineItems: initialData.lineItems,
          notes: initialData.notes || '',
          validityDate: initialData.validityDate,
        }
      : {
          rfqId: '',
          customerName: '',
          lineItems: [{ productName: '', quantity: 1, unitPrice: 0, discount: 0, tax: 18 }],
          notes: '',
          validityDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days from now
        },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'lineItems',
  });

  // Watch line items to perform live totals calculation
  const watchedLineItems = useWatch({
    control,
    name: 'lineItems',
  });

  // Auto-fill customer details based on RFQ selection (Simulating workflow lookup)
  const handleRfqChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedRfq = e.target.value;
    setValue('rfqId', selectedRfq);
    
    // Autofill customers based on mockup data
    if (selectedRfq === 'RFQ-2026-001') setValue('customerName', 'Apex Systems Private Limited');
    else if (selectedRfq === 'RFQ-2026-003') setValue('customerName', 'National Stationery Mart');
    else if (selectedRfq === 'RFQ-2026-005') setValue('customerName', 'Global Logistics Group');
    else if (selectedRfq === 'RFQ-2026-008') setValue('customerName', 'Apex IT Solutions');
    else if (selectedRfq === 'RFQ-2026-012') setValue('customerName', 'Swift Cargo Carriers');
  };

  const totals = React.useMemo(() => {
    let subtotal = 0;
    let discountTotal = 0;
    let taxTotal = 0;
    let grandTotal = 0;

    (watchedLineItems || []).forEach((item) => {
      if (!item) return;
      const qty = Number(item.quantity) || 0;
      const price = Number(item.unitPrice) || 0;
      const disc = Number(item.discount) || 0;
      const tax = Number(item.tax) || 0;

      const rawTotal = qty * price;
      const discountAmount = rawTotal * (disc / 100);
      const afterDiscount = rawTotal - discountAmount;
      const taxAmount = afterDiscount * (tax / 100);
      const lineTotal = afterDiscount + taxAmount;

      subtotal += rawTotal;
      discountTotal += discountAmount;
      taxTotal += taxAmount;
      grandTotal += lineTotal;
    });

    return {
      subtotal: Math.round(subtotal * 100) / 100,
      discountTotal: Math.round(discountTotal * 100) / 100,
      taxTotal: Math.round(taxTotal * 100) / 100,
      grandTotal: Math.round(grandTotal * 100) / 100,
    };
  }, [watchedLineItems]);

  const onSaveDraft = () => {
    handleSubmit((values) => onSubmit({ ...values, status: 'draft', isSubmit: false }))();
  };

  const onSaveSubmit = () => {
    handleSubmit((values) => onSubmit({ ...values, status: 'submitted', isSubmit: true }))();
  };

  const rfqOptions = [
    { value: 'RFQ-2026-001', label: 'RFQ-2026-001 (Laptop Sourcing - Q3)' },
    { value: 'RFQ-2026-003', label: 'RFQ-2026-003 (Office Furniture Upgrade)' },
    { value: 'RFQ-2026-005', label: 'RFQ-2026-005 (Server Rack Cabling)' },
    { value: 'RFQ-2026-008', label: 'RFQ-2026-008 (Industrial Safety Helmets)' },
    { value: 'RFQ-2026-012', label: 'RFQ-2026-012 (Corporate Catering Services)' },
  ];

  return (
    <form className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        {/* RFQ Selection */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Assigned RFQ *
          </label>
          <select
            className={`flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 ${
              errors.rfqId ? 'border-red-500 focus:ring-red-500' : ''
            }`}
            onChange={handleRfqChange}
            value={watchedLineItems ? undefined : initialData?.rfqId}
            {...register('rfqId')}
          >
            <option value="">Select an assigned RFQ</option>
            {rfqOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          {errors.rfqId && <p className="mt-1 text-xs text-red-650">{errors.rfqId.message}</p>}
        </div>

        {/* Customer Name */}
        <Input
          label="Customer Organization *"
          placeholder="Acme Sourcing Agency"
          error={errors.customerName?.message}
          {...register('customerName')}
        />

        {/* Validity Date */}
        <Input
          label="Validity Date (Valid Until) *"
          type="date"
          error={errors.validityDate?.message}
          {...register('validityDate')}
        />
      </div>

      {/* Line Items Section */}
      <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50">
        <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-4">
          <h4 className="text-sm font-semibold text-slate-800 flex items-center">
            <Calculator className="h-4 w-4 mr-1.5 text-brand-600" />
            Pricing Line Items
          </h4>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-8 text-xs font-semibold gap-1 border-slate-300"
            onClick={() => append({ productName: '', quantity: 1, unitPrice: 0, discount: 0, tax: 18 })}
          >
            <Plus className="h-3 w-3" />
            Add Item
          </Button>
        </div>

        {errors.lineItems?.message && (
          <p className="mb-3 text-xs text-red-600 font-medium">{errors.lineItems.message}</p>
        )}

        <div className="space-y-3">
          {fields.map((field, index) => {
            const lineQty = watchedLineItems?.[index]?.quantity || 0;
            const linePrice = watchedLineItems?.[index]?.unitPrice || 0;
            const lineDisc = watchedLineItems?.[index]?.discount || 0;
            const lineTax = watchedLineItems?.[index]?.tax || 0;
            const lineTotal = Math.round((lineQty * linePrice * (1 - lineDisc / 100)) * (1 + lineTax / 100) * 100) / 100;

            return (
              <div key={field.id} className="grid gap-2 items-start bg-white border border-slate-200 p-3 rounded-lg shadow-sm sm:grid-cols-12">
                {/* Product Name */}
                <div className="sm:col-span-4">
                  <Input
                    placeholder="Product / Service Description"
                    error={errors.lineItems?.[index]?.productName?.message}
                    {...register(`lineItems.${index}.productName` as const)}
                  />
                </div>

                {/* Quantity */}
                <div className="sm:col-span-2">
                  <Input
                    type="number"
                    placeholder="Qty"
                    error={errors.lineItems?.[index]?.quantity?.message}
                    {...register(`lineItems.${index}.quantity` as const)}
                  />
                </div>

                {/* Unit Price */}
                <div className="sm:col-span-2">
                  <Input
                    type="number"
                    placeholder="Price (₹)"
                    error={errors.lineItems?.[index]?.unitPrice?.message}
                    {...register(`lineItems.${index}.unitPrice` as const)}
                  />
                </div>

                {/* Discount % */}
                <div className="sm:col-span-1">
                  <Input
                    type="number"
                    placeholder="Disc%"
                    error={errors.lineItems?.[index]?.discount?.message}
                    {...register(`lineItems.${index}.discount` as const)}
                  />
                </div>

                {/* Tax % */}
                <div className="sm:col-span-1">
                  <Input
                    type="number"
                    placeholder="Tax%"
                    error={errors.lineItems?.[index]?.tax?.message}
                    {...register(`lineItems.${index}.tax` as const)}
                  />
                </div>

                {/* Line Total Display */}
                <div className="sm:col-span-1 text-right self-center pr-2">
                  <span className="text-xs font-semibold font-mono text-slate-800">
                    ₹{lineTotal.toLocaleString('en-IN')}
                  </span>
                </div>

                {/* Delete button */}
                <div className="sm:col-span-1 text-right">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-9 w-9 p-0 hover:bg-red-50 text-red-500 rounded-lg"
                    disabled={fields.length === 1}
                    onClick={() => remove(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Calculation Summaries */}
        <div className="mt-4 border-t border-slate-200 pt-4 flex flex-col items-end space-y-2 px-2 text-xs">
          <div className="flex justify-between w-64 text-slate-500">
            <span>Subtotal:</span>
            <span className="font-mono">₹{totals.subtotal.toLocaleString('en-IN')}</span>
          </div>
          <div className="flex justify-between w-64 text-rose-600">
            <span>Discounts (-):</span>
            <span className="font-mono">₹{totals.discountTotal.toLocaleString('en-IN')}</span>
          </div>
          <div className="flex justify-between w-64 text-emerald-600">
            <span>Taxes/GST (+):</span>
            <span className="font-mono">₹{totals.taxTotal.toLocaleString('en-IN')}</span>
          </div>
          <div className="flex justify-between w-64 border-t border-slate-300 pt-2 text-sm font-bold text-slate-900">
            <span>Grand Total:</span>
            <span className="font-mono">₹{totals.grandTotal.toLocaleString('en-IN')}</span>
          </div>
        </div>
      </div>

      {/* Notes / Terms */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Special Notes / Terms & Conditions
        </label>
        <textarea
          placeholder="e.g. Terms Net-30, lead time 15 days from PO confirmation..."
          rows={3}
          className="flex w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
          {...register('notes')}
        />
      </div>

      {/* Footer Submit Buttons */}
      <div className="flex items-center justify-end space-x-2 pt-4 border-t border-slate-100">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
          Cancel
        </Button>
        <Button type="button" variant="secondary" onClick={onSaveDraft} isLoading={isLoading}>
          Save Draft
        </Button>
        <Button type="button" variant="primary" onClick={onSaveSubmit} isLoading={isLoading}>
          Submit Proposal
        </Button>
      </div>
    </form>
  );
}
