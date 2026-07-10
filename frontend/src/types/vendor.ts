export type VendorStatus = 'active' | 'inactive' | 'pending';

export interface Vendor {
  id: string; // Auto-generated code, e.g. VEN0001
  vendorName: string;
  businessName: string;
  category: string;
  gstNumber: string;
  contactPerson: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  status: VendorStatus;
  registrationDate: string; // ISO date format (YYYY-MM-DD)
  notes?: string;
}

export interface VendorActivityLog {
  id: string;
  vendorId: string;
  action: 'create' | 'update' | 'archive' | 'status_change';
  detail: string;
  performedBy: string;
  createdAt: string;
}

export interface VendorCategory {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
}
