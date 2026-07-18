import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Vendor, VendorStatus } from '../../types/vendor';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Select } from '../ui/select';
import { DEFAULT_CATEGORIES } from '../../services/vendorService';

// Indian GSTIN regex validation
const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
// Simple phone validation
const phoneRegex = /^\+?[0-9\s-]{10,15}$/;

const vendorSchema = z.object({
  vendorName: z.string().min(2, 'Vendor name must be at least 2 characters.'),
  businessName: z.string().min(2, 'Business name must be at least 2 characters.'),
  category: z.string().min(1, 'Category is required.'),
  gstNumber: z.string().toUpperCase().regex(gstRegex, 'Invalid GSTIN format (e.g. 27AAAAA1111A1Z1).'),
  contactPerson: z.string().min(2, 'Contact person must be at least 2 characters.'),
  phone: z.string().regex(phoneRegex, 'Invalid phone number format (10-15 digits).'),
  email: z.string().email('Invalid email address.'),
  address: z.string().min(5, 'Address must be at least 5 characters.'),
  city: z.string().min(2, 'City is required.'),
  state: z.string().min(2, 'State is required.'),
  pincode: z.string().min(6, 'Pincode must be at least 6 characters.').max(8, 'Pincode cannot exceed 8 characters.'),
  status: z.enum(['active', 'inactive', 'pending'] as const, {
    required_error: 'Status is required.',
  }),
  notes: z.string().optional(),
});

type VendorFormValues = z.infer<typeof vendorSchema>;

interface VendorFormProps {
  initialData?: Vendor;
  onSubmit: (data: VendorFormValues) => void;
  isLoading?: boolean;
  onCancel: () => void;
}

export function VendorForm({ initialData, onSubmit, isLoading, onCancel }: VendorFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<VendorFormValues>({
    resolver: zodResolver(vendorSchema),
    defaultValues: initialData
      ? {
          vendorName: initialData.vendorName,
          businessName: initialData.businessName,
          category: initialData.category,
          gstNumber: initialData.gstNumber,
          contactPerson: initialData.contactPerson,
          phone: initialData.phone,
          email: initialData.email,
          address: initialData.address,
          city: initialData.city,
          state: initialData.state,
          pincode: initialData.pincode,
          status: initialData.status,
          notes: initialData.notes || '',
        }
      : {
          vendorName: '',
          businessName: '',
          category: '',
          gstNumber: '',
          contactPerson: '',
          phone: '',
          email: '',
          address: '',
          city: '',
          state: '',
          pincode: '',
          status: 'pending',
          notes: '',
        },
  });

  const categoryOptions = DEFAULT_CATEGORIES.map((cat) => ({
    value: cat.name,
    label: cat.name,
  }));

  const statusOptions: { value: VendorStatus; label: string }[] = [
    { value: 'active', label: 'Active' },
    { value: 'pending', label: 'Pending' },
    { value: 'inactive', label: 'Inactive' },
  ];

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        {/* Vendor Name */}
        <Input
          label="Vendor Name *"
          placeholder="e.g. Acme IT Solutions"
          error={errors.vendorName?.message}
          {...register('vendorName')}
        />

        {/* Business Name */}
        <Input
          label="Business Name (Legal Entity) *"
          placeholder="e.g. Acme Systems Pvt Ltd"
          error={errors.businessName?.message}
          {...register('businessName')}
        />

        {/* Category */}
        <Select
          label="Vendor Category *"
          placeholder="Select a category"
          options={categoryOptions}
          error={errors.category?.message}
          {...register('category')}
        />

        {/* GST Number */}
        <Input
          label="GST Number (GSTIN) *"
          placeholder="e.g. 27AAAAA1111A1Z1"
          error={errors.gstNumber?.message}
          className="uppercase"
          {...register('gstNumber')}
        />

        {/* Contact Person */}
        <Input
          label="Contact Person *"
          placeholder="e.g. John Doe"
          error={errors.contactPerson?.message}
          {...register('contactPerson')}
        />

        {/* Email */}
        <Input
          label="Email Address *"
          type="email"
          placeholder="e.g. vendor@example.com"
          error={errors.email?.message}
          {...register('email')}
        />

        {/* Phone */}
        <Input
          label="Phone Number *"
          placeholder="e.g. +91 98765 43210"
          error={errors.phone?.message}
          {...register('phone')}
        />

        {/* Status */}
        <Select
          label="Status *"
          options={statusOptions}
          error={errors.status?.message}
          {...register('status')}
        />

        {/* Address */}
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Street Address *
          </label>
          <textarea
            placeholder="e.g. Plot 12, Industrial Area, Sector 5"
            rows={2}
            className={`flex w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 disabled:cursor-not-allowed disabled:opacity-50 ${
              errors.address ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''
            }`}
            {...register('address')}
          />
          {errors.address && <p className="mt-1 text-xs text-red-600">{errors.address.message}</p>}
        </div>

        {/* City */}
        <Input
          label="City *"
          placeholder="e.g. Mumbai"
          error={errors.city?.message}
          {...register('city')}
        />

        {/* State */}
        <Input
          label="State *"
          placeholder="e.g. Maharashtra"
          error={errors.state?.message}
          {...register('state')}
        />

        {/* Pincode */}
        <Input
          label="Pincode *"
          placeholder="e.g. 400001"
          error={errors.pincode?.message}
          {...register('pincode')}
        />

        {/* Notes */}
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Notes / Remarks
          </label>
          <textarea
            placeholder="e.g. Main supplier of steel sheets, terms net-30."
            rows={3}
            className="flex w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 disabled:cursor-not-allowed disabled:opacity-50"
            {...register('notes')}
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-end space-x-2 pt-4 border-t border-slate-100">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
          Cancel
        </Button>
        <Button type="submit" variant="primary" isLoading={isLoading}>
          {initialData ? 'Update Vendor' : 'Add Vendor'}
        </Button>
      </div>
    </form>
  );
}
