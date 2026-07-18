import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Dialog } from '../ui/dialog';
import { Input } from '../ui/input';
import { Select } from '../ui/select';
import { Button } from '../ui/button';

// Form validation schema
const invoiceFormSchema = z.object({
  purchaseOrderId: z.string().min(1, 'Purchase Order selection is required'),
  dueDate: z.string().min(1, 'Due date is required'),
  amount: z.number({ coerce: true }).min(1, 'Amount must be greater than 0'),
  notes: z.string().optional(),
});

export function InvoiceForm({ isOpen, onClose, onSubmit, initialData }) {
  const purchaseOrders = [
    { value: 'PO-2026-0002', label: 'PO-2026-0002 (National Office Stationers - ₹93,725)' },
    { value: 'PO-2026-0003', label: 'PO-2026-0003 (Swift Cargo Carriers - ₹4,29,800)' },
    { value: 'PO-2026-0004', label: 'PO-2026-0004 (Vanguard Legal Associates - ₹53,100)' },
  ];

  const defaultValues = React.useMemo(() => {
    if (initialData) {
      return {
        purchaseOrderId: initialData.purchaseOrderId,
        dueDate: initialData.dueDate,
        amount: initialData.amount,
        notes: initialData.notes || '',
      };
    }
    return {
      purchaseOrderId: '',
      dueDate: '',
      amount: 0,
      notes: '',
    };
  }, [initialData]);

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(invoiceFormSchema),
    defaultValues,
  });

  React.useEffect(() => {
    reset(defaultValues);
  }, [initialData, reset, defaultValues]);

  const handleFormSubmit = (data) => {
    onSubmit(data);
    reset();
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? `Edit Invoice - ${initialData.invoiceNumber}` : 'Create Invoice'}
      description="Submit billing details against a Purchase Order"
      size="md"
      footer={
        <div className="flex justify-end gap-2 w-full">
          <Button variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" size="sm" onClick={handleSubmit(handleFormSubmit)}>
            Submit Invoice
          </Button>
        </div>
      }
    >
      <form className="space-y-4 text-slate-700">
        <div>
          <Select
            label="Associated Purchase Order"
            options={purchaseOrders}
            placeholder="Select purchase order..."
            error={errors.purchaseOrderId?.message}
            {...register('purchaseOrderId')}
            onChange={(e) => {
              const val = e.target.value;
              setValue('purchaseOrderId', val);
              // Auto-fill amount based on chosen PO
              if (val === 'PO-2026-0002') setValue('amount', 93725);
              if (val === 'PO-2026-0003') setValue('amount', 429800);
              if (val === 'PO-2026-0004') setValue('amount', 53100);
            }}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Input
              label="Invoice Amount (INR)"
              type="number"
              error={errors.amount?.message}
              {...register('amount', { valueAsNumber: true })}
            />
          </div>
          <div>
            <Input
              label="Payment Due Date"
              type="date"
              error={errors.dueDate?.message}
              {...register('dueDate')}
            />
          </div>
        </div>

        <div>
          <Input
            label="Notes & Terms"
            placeholder="e.g. Bank wire transfer details or COD comments..."
            error={errors.notes?.message}
            {...register('notes')}
          />
        </div>
      </form>
    </Dialog>
  );
}
