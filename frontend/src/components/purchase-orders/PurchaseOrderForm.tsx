import * as React from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Plus, Trash2, IndianRupee } from 'lucide-react';
import { PurchaseOrder, PurchaseOrderLineItem } from '../../types/purchaseOrder';
import { calculatePOTotals } from '../../services/purchaseOrderService';
import { Dialog } from '../ui/dialog';
import { Input } from '../ui/input';
import { Select } from '../ui/select';
import { Button } from '../ui/button';

// Form validation schema
const lineItemSchema = z.object({
  productName: z.string().min(1, 'Product name is required'),
  quantity: z.number({ coerce: true }).min(1, 'Quantity must be at least 1'),
  unitPrice: z.number({ coerce: true }).min(0.01, 'Price must be greater than 0'),
  discount: z.number({ coerce: true }).min(0, 'Discount cannot be negative').max(100, 'Discount cannot exceed 100%'),
  tax: z.number({ coerce: true }).min(0, 'GST cannot be negative').max(100, 'GST cannot exceed 100%'),
});

const poFormSchema = z.object({
  supplierId: z.string().min(1, 'Supplier selection is required'),
  rfqId: z.string().optional(),
  quotationId: z.string().optional(),
  deliveryAddress: z.string().min(5, 'Delivery address must be at least 5 characters'),
  expectedDeliveryDate: z.string().min(1, 'Expected delivery date is required'),
  priority: z.enum(['low', 'medium', 'high', 'urgent'] as const),
  paymentTerms: z.string().min(1, 'Payment terms are required'),
  shippingCost: z.number({ coerce: true }).min(0, 'Shipping cost cannot be negative'),
  notes: z.string().optional(),
  lineItems: z.array(lineItemSchema).min(1, 'At least one line item is required'),
});

type POFormValues = z.infer<typeof poFormSchema>;

interface PurchaseOrderFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: POFormValues, submitType: 'draft' | 'pending_approval') => void;
  initialData?: PurchaseOrder | null;
}

export function PurchaseOrderForm({
  isOpen,
  onClose,
  onSubmit,
  initialData,
}: PurchaseOrderFormProps) {
  const suppliers = [
    { value: 'VEN0001', label: 'Apex IT Solutions' },
    { value: 'VEN0002', label: 'National Office Stationers' },
    { value: 'VEN0003', label: 'Swift Cargo Carriers' },
    { value: 'VEN0004', label: 'Pioneer Chemicals' },
    { value: 'VEN0005', label: 'Vanguard Legal Associates' },
  ];

  const defaultValues: Partial<POFormValues> = React.useMemo(() => {
    if (initialData) {
      return {
        supplierId: initialData.supplierId,
        rfqId: initialData.rfqId || '',
        quotationId: initialData.quotationId || '',
        deliveryAddress: initialData.deliveryAddress,
        expectedDeliveryDate: initialData.expectedDeliveryDate,
        priority: initialData.priority,
        paymentTerms: initialData.paymentTerms,
        shippingCost: initialData.shippingCost,
        notes: initialData.notes || '',
        lineItems: initialData.lineItems.map((item) => ({
          productName: item.productName,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          discount: item.discount,
          tax: item.tax,
        })),
      };
    }

    return {
      supplierId: '',
      rfqId: '',
      quotationId: '',
      deliveryAddress: '',
      expectedDeliveryDate: '',
      priority: 'medium',
      paymentTerms: 'Net 30',
      shippingCost: 0,
      notes: '',
      lineItems: [{ productName: '', quantity: 1, unitPrice: 0, discount: 0, tax: 18 }],
    };
  }, [initialData]);

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<POFormValues>({
    resolver: zodResolver(poFormSchema),
    defaultValues,
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'lineItems',
  });

  // Reset form values on open or initialData change
  React.useEffect(() => {
    reset(defaultValues);
  }, [initialData, reset, defaultValues]);

  const watchLineItems = watch('lineItems') || [];
  const watchShipping = watch('shippingCost') || 0;
  const watchSupplierId = watch('supplierId');

  // Dynamically compute totals
  const totals = React.useMemo(() => {
    return calculatePOTotals(
      watchLineItems.map((item) => ({
        id: '', // dummy ID
        productName: item.productName || '',
        quantity: Number(item.quantity) || 0,
        unitPrice: Number(item.unitPrice) || 0,
        discount: Number(item.discount) || 0,
        tax: Number(item.tax) || 0,
      })),
      Number(watchShipping) || 0
    );
  }, [watchLineItems, watchShipping]);

  const handleFormSubmit = (data: POFormValues, submitType: 'draft' | 'pending_approval') => {
    onSubmit(data, submitType);
    reset();
  };

  const getSupplierName = (id: string) => {
    const s = suppliers.find((v) => v.value === id);
    return s ? s.label : '';
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? `Edit Purchase Order - ${initialData.poNumber}` : 'Create Purchase Order'}
      description="Fill in procurement details below"
      size="xl"
      footer={
        <div className="flex justify-end gap-2 w-full">
          <Button variant="outline" size="sm" onClick={onClose} className="dark:border-slate-800 dark:text-slate-350 dark:hover:bg-slate-800">
            Cancel
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={handleSubmit((data) => handleFormSubmit(data, 'draft'))}
            className="dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
          >
            Save Draft
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleSubmit((data) => handleFormSubmit(data, 'pending_approval'))}
          >
            Submit for Approval
          </Button>
        </div>
      }
    >
      <form className="space-y-6 text-slate-700 dark:text-slate-300">
        {/* Core details */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Select
              label="Supplier"
              options={suppliers}
              placeholder="Select supplier..."
              error={errors.supplierId?.message}
              {...register('supplierId')}
              onChange={(e) => {
                const val = e.target.value;
                setValue('supplierId', val);
              }}
              className="dark:bg-slate-850 dark:border-slate-800 dark:text-slate-100"
            />
          </div>
          <div>
            <Input
              label="RFQ Reference (Optional)"
              placeholder="e.g. RFQ-2026-001"
              error={errors.rfqId?.message}
              {...register('rfqId')}
              className="dark:bg-slate-850 dark:border-slate-800 dark:text-slate-100"
            />
          </div>
          <div>
            <Input
              label="Quotation Reference (Optional)"
              placeholder="e.g. QT0001"
              error={errors.quotationId?.message}
              {...register('quotationId')}
              className="dark:bg-slate-850 dark:border-slate-800 dark:text-slate-100"
            />
          </div>
        </div>

        {/* Priority & Delivery details */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Select
              label="Priority"
              options={[
                { value: 'low', label: 'Low' },
                { value: 'medium', label: 'Medium' },
                { value: 'high', label: 'High' },
                { value: 'urgent', label: 'Urgent' },
              ]}
              error={errors.priority?.message}
              {...register('priority')}
              className="dark:bg-slate-850 dark:border-slate-800 dark:text-slate-100"
            />
          </div>
          <div>
            <Input
              label="Expected Delivery Date"
              type="date"
              error={errors.expectedDeliveryDate?.message}
              {...register('expectedDeliveryDate')}
              className="dark:bg-slate-850 dark:border-slate-800 dark:text-slate-100"
            />
          </div>
          <div>
            <Input
              label="Payment Terms"
              placeholder="e.g. Net 30, COD"
              error={errors.paymentTerms?.message}
              {...register('paymentTerms')}
              className="dark:bg-slate-850 dark:border-slate-800 dark:text-slate-100"
            />
          </div>
        </div>

        {/* Shipping Cost & Address */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Input
              label="Shipping Cost (INR)"
              type="number"
              error={errors.shippingCost?.message}
              {...register('shippingCost', { valueAsNumber: true })}
              className="dark:bg-slate-850 dark:border-slate-800 dark:text-slate-100"
            />
          </div>
          <div className="md:col-span-2">
            <Input
              label="Delivery Address"
              placeholder="Full destination warehouse or corporate address..."
              error={errors.deliveryAddress?.message}
              {...register('deliveryAddress')}
              className="dark:bg-slate-850 dark:border-slate-800 dark:text-slate-100"
            />
          </div>
        </div>

        {/* Line Items Title */}
        <div className="border-t border-slate-200 dark:border-slate-800 pt-4 flex justify-between items-center">
          <h4 className="text-sm font-semibold text-slate-850 dark:text-slate-200 uppercase tracking-wide">
            Product Line Items ({fields.length})
          </h4>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => append({ productName: '', quantity: 1, unitPrice: 0, discount: 0, tax: 18 })}
            className="text-xs font-semibold gap-1.5 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            <Plus className="h-3.5 w-3.5" />
            Add Item
          </Button>
        </div>

        {errors.lineItems && (
          <p className="text-xs text-red-600 font-semibold">{errors.lineItems.message || (errors.lineItems as any).root?.message}</p>
        )}

        {/* Form Line Items Fields */}
        <div className="space-y-3 max-h-[30vh] overflow-y-auto pr-1">
          {fields.map((field, index) => (
            <div
              key={field.id}
              className="grid grid-cols-1 md:grid-cols-12 gap-2.5 items-end bg-slate-50/55 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-xl p-3 relative"
            >
              {/* Product Name */}
              <div className="md:col-span-4">
                <Input
                  label={index === 0 ? 'Product Name' : undefined}
                  placeholder="Enter product or service name..."
                  error={errors.lineItems?.[index]?.productName?.message}
                  {...register(`lineItems.${index}.productName` as const)}
                  className="dark:bg-slate-850 dark:border-slate-800 dark:text-slate-100"
                />
              </div>

              {/* Quantity */}
              <div className="md:col-span-2">
                <Input
                  label={index === 0 ? 'Qty' : undefined}
                  type="number"
                  error={errors.lineItems?.[index]?.quantity?.message}
                  {...register(`lineItems.${index}.quantity` as const, { valueAsNumber: true })}
                  className="dark:bg-slate-850 dark:border-slate-800 dark:text-slate-100"
                />
              </div>

              {/* Unit Price */}
              <div className="md:col-span-2">
                <Input
                  label={index === 0 ? 'Unit Price' : undefined}
                  type="number"
                  step="0.01"
                  error={errors.lineItems?.[index]?.unitPrice?.message}
                  {...register(`lineItems.${index}.unitPrice` as const, { valueAsNumber: true })}
                  className="dark:bg-slate-850 dark:border-slate-800 dark:text-slate-100"
                />
              </div>

              {/* Discount */}
              <div className="md:col-span-1.5 md:col-span-2">
                <Input
                  label={index === 0 ? 'Disc %' : undefined}
                  type="number"
                  error={errors.lineItems?.[index]?.discount?.message}
                  {...register(`lineItems.${index}.discount` as const, { valueAsNumber: true })}
                  className="dark:bg-slate-850 dark:border-slate-800 dark:text-slate-100"
                />
              </div>

              {/* Tax */}
              <div className="md:col-span-1.5 md:col-span-1">
                <Input
                  label={index === 0 ? 'GST %' : undefined}
                  type="number"
                  error={errors.lineItems?.[index]?.tax?.message}
                  {...register(`lineItems.${index}.tax` as const, { valueAsNumber: true })}
                  className="dark:bg-slate-850 dark:border-slate-800 dark:text-slate-100"
                />
              </div>

              {/* Actions */}
              <div className="md:col-span-1 flex justify-center pb-2">
                {fields.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => remove(index)}
                    className="text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/20 p-1.5 h-8 w-8 rounded-full"
                    title="Delete row"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Summary display inside form */}
        <div className="border-t border-slate-200 dark:border-slate-800 pt-4 flex flex-col md:flex-row md:justify-between gap-4">
          <div className="flex-1">
            <Input
              label="Notes & Special Instructions"
              placeholder="Write any terms or shipping notes..."
              error={errors.notes?.message}
              {...register('notes')}
              className="dark:bg-slate-850 dark:border-slate-800 dark:text-slate-100"
            />
          </div>
          <div className="w-full md:w-80 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 space-y-1.5 text-xs text-slate-650">
            <div className="flex justify-between">
              <span className="text-slate-400">Subtotal:</span>
              <span className="font-semibold text-slate-805 dark:text-slate-300 font-mono">
                {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(totals.subtotal)}
              </span>
            </div>
            <div className="flex justify-between text-rose-600 dark:text-rose-400">
              <span>Discounts:</span>
              <span className="font-mono">
                -{new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(totals.discountTotal)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">GST/Tax:</span>
              <span className="font-semibold text-slate-805 dark:text-slate-300 font-mono">
                {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(totals.taxTotal)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Shipping:</span>
              <span className="font-semibold text-slate-805 dark:text-slate-300 font-mono">
                {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(watchShipping || 0)}
              </span>
            </div>
            <div className="border-t border-slate-200 dark:border-slate-800 pt-2 mt-1.5 flex justify-between text-sm font-bold text-slate-900 dark:text-slate-100">
              <span>Grand Total:</span>
              <span className="font-mono">
                {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(totals.grandTotal)}
              </span>
            </div>
          </div>
        </div>
      </form>
    </Dialog>
  );
}
