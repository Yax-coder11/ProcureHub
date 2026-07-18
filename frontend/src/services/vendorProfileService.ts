import { invoiceService } from './invoiceService';
import { purchaseOrderService } from './purchaseOrderService';
import { quotationService } from './quotationService';

const PROFILE_STORAGE_KEY = 'procurehub_vendor_profile';

export interface VendorDocument {
  name: string;
  status: 'verified' | 'pending' | 'rejected' | 'uploaded';
  uploadDate: string;
}

export interface VendorProfile {
  company: {
    companyName: string;
    legalBusinessName: string;
    vendorId: string;
    businessType: string;
    gstNumber: string;
    panNumber: string;
    taxRegistrationNumber: string;
    website: string;
    email: string;
    phone: string;
    alternatePhone: string;
    description: string;
    logoUrl?: string;
  };
  contact: {
    primaryContact: string;
    jobTitle: string;
    email: string;
    phone: string;
    mobile: string;
  };
  address: {
    addressLine1: string;
    addressLine2: string;
    city: string;
    state: string;
    country: string;
    postalCode: string;
  };
  bank: {
    bankName: string;
    accountHolder: string;
    accountNumber: string;
    ifscSwift: string;
    branch: string;
    upiId?: string;
    verified: boolean;
  };
  documents: {
    gstCertificate: VendorDocument | null;
    panCard: VendorDocument | null;
    businessRegistration: VendorDocument | null;
    msmeCertificate: VendorDocument | null;
    isoCertificate: VendorDocument | null;
    cancelledCheque: VendorDocument | null;
    companyLogo: VendorDocument | null;
  };
  recentActivity: Array<{
    id: string;
    action: string;
    detail: string;
    createdAt: string;
  }>;
  preferences: {
    emailNotifications: boolean;
    smsNotifications: boolean;
    orderUpdates: boolean;
    quotationUpdates: boolean;
    invoiceUpdates: boolean;
    marketingEmails: boolean;
  };
  security: {
    twoFactorEnabled: boolean;
    lastLogin: string;
    recentDevices: string[];
  };
}

const INITIAL_PROFILE: VendorProfile = {
  company: {
    companyName: 'Apex IT Solutions',
    legalBusinessName: 'Apex Systems Private Limited',
    vendorId: 'VEN0001',
    businessType: 'Private Limited',
    gstNumber: '27AAAAA1111A1Z1',
    panNumber: 'AAAAA1111A',
    taxRegistrationNumber: 'TRN998877665',
    website: 'https://apexsystems.com',
    email: 'contact@apexsystems.com',
    phone: '+91 98765 43210',
    alternatePhone: '+91 98765 43211',
    description: 'Leading provider of enterprise IT infrastructure and hardware assets including server provisioning, systems integration, and corporate workstation lifecycle management.',
    logoUrl: '',
  },
  contact: {
    primaryContact: 'Rahul Sharma',
    jobTitle: 'Director of Sourcing',
    email: 'rahul@apexsystems.com',
    phone: '+91 98765 43210',
    mobile: '+91 99999 88888',
  },
  address: {
    addressLine1: '404, Tech Park',
    addressLine2: 'Phase 3, Hinjewadi',
    city: 'Pune',
    state: 'Maharashtra',
    country: 'India',
    postalCode: '411057',
  },
  bank: {
    bankName: 'HDFC Bank',
    accountHolder: 'Apex Systems Private Limited',
    accountNumber: '50100223344556',
    ifscSwift: 'HDFC0000104',
    branch: 'Hinjewadi Phase 3 Branch',
    upiId: 'apexsystems@hdfc',
    verified: true,
  },
  documents: {
    gstCertificate: { name: 'gst_certificate_2026.pdf', status: 'verified', uploadDate: '2026-01-16' },
    panCard: { name: 'pan_card_copy.pdf', status: 'verified', uploadDate: '2026-01-16' },
    businessRegistration: { name: 'incorporation_certificate.pdf', status: 'verified', uploadDate: '2026-01-16' },
    msmeCertificate: { name: 'msme_registration.pdf', status: 'verified', uploadDate: '2026-01-20' },
    isoCertificate: null,
    cancelledCheque: { name: 'cancelled_cheque.pdf', status: 'verified', uploadDate: '2026-01-18' },
    companyLogo: { name: 'apex_logo_square.png', status: 'verified', uploadDate: '2026-01-15' },
  },
  recentActivity: [
    { id: 'act-1', action: 'Profile Updated', detail: 'Primary contact details revised by Rahul Sharma', createdAt: '2026-07-10T14:22:00Z' },
    { id: 'act-2', action: 'GST Verified', detail: 'GST Certificate verified automatically by tax registry check', createdAt: '2026-06-18T10:15:00Z' },
    { id: 'act-3', action: 'Bank Verified', detail: 'Bank account verified successfully for HDFC Bank', createdAt: '2026-06-15T09:30:00Z' },
    { id: 'act-4', action: 'Document Uploaded', detail: 'MSME Certificate uploaded to registry', createdAt: '2026-01-20T11:45:00Z' },
    { id: 'act-5', action: 'Password Changed', detail: 'Portal password updated successfully', createdAt: '2026-01-15T10:00:00Z' },
  ],
  preferences: {
    emailNotifications: true,
    smsNotifications: false,
    orderUpdates: true,
    quotationUpdates: true,
    invoiceUpdates: true,
    marketingEmails: false,
  },
  security: {
    twoFactorEnabled: false,
    lastLogin: new Date().toISOString(),
    recentDevices: ['Chrome on Windows 11 (Current)', 'Safari on iPhone 15 Pro'],
  },
};

const delay = (ms = 400) => new Promise((resolve) => setTimeout(resolve, ms));

function getStoredProfile(): VendorProfile {
  const data = localStorage.getItem(PROFILE_STORAGE_KEY);
  if (!data) {
    localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(INITIAL_PROFILE));
    return INITIAL_PROFILE;
  }
  return JSON.parse(data);
}

function saveStoredProfile(profile: VendorProfile) {
  localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profile));
}

export const vendorProfileService = {
  getProfile: async (): Promise<VendorProfile> => {
    await delay(300);
    return getStoredProfile();
  },

  updateProfile: async (data: Partial<VendorProfile>): Promise<VendorProfile> => {
    await delay(500);
    const profile = getStoredProfile();

    // Deep merge changes
    if (data.company) profile.company = { ...profile.company, ...data.company };
    if (data.contact) profile.contact = { ...profile.contact, ...data.contact };
    if (data.address) profile.address = { ...profile.address, ...data.address };
    if (data.bank) profile.bank = { ...profile.bank, ...data.bank };
    if (data.preferences) profile.preferences = { ...profile.preferences, ...data.preferences };
    if (data.security) profile.security = { ...profile.security, ...data.security };

    // Record an activity log
    const activityId = `act-${Date.now()}`;
    profile.recentActivity.unshift({
      id: activityId,
      action: 'Profile Updated',
      detail: 'Company information updated in settings',
      createdAt: new Date().toISOString(),
    });

    // Keep logs size reasonable
    if (profile.recentActivity.length > 20) {
      profile.recentActivity = profile.recentActivity.slice(0, 20);
    }

    saveStoredProfile(profile);
    return profile;
  },

  verifyBank: async (): Promise<VendorProfile> => {
    await delay(800);
    const profile = getStoredProfile();
    profile.bank.verified = true;

    profile.recentActivity.unshift({
      id: `act-${Date.now()}`,
      action: 'Bank Verified',
      detail: `Bank account verified successfully for ${profile.bank.bankName}`,
      createdAt: new Date().toISOString(),
    });

    saveStoredProfile(profile);
    return profile;
  },

  uploadDocument: async (docType: keyof VendorProfile['documents'], fileName: string): Promise<VendorProfile> => {
    await delay(600);
    const profile = getStoredProfile();
    
    profile.documents[docType] = {
      name: fileName,
      status: 'uploaded',
      uploadDate: new Date().toISOString().split('T')[0],
    };

    let readableName = docType.replace(/([A-Z])/g, ' $1');
    readableName = readableName.charAt(0).toUpperCase() + readableName.slice(1);

    profile.recentActivity.unshift({
      id: `act-${Date.now()}`,
      action: 'Document Uploaded',
      detail: `${readableName} file "${fileName}" was successfully uploaded`,
      createdAt: new Date().toISOString(),
    });

    saveStoredProfile(profile);
    return profile;
  },

  deleteDocument: async (docType: keyof VendorProfile['documents']): Promise<VendorProfile> => {
    await delay(400);
    const profile = getStoredProfile();
    const oldDoc = profile.documents[docType];

    profile.documents[docType] = null;

    let readableName = docType.replace(/([A-Z])/g, ' $1');
    readableName = readableName.charAt(0).toUpperCase() + readableName.slice(1);

    profile.recentActivity.unshift({
      id: `act-${Date.now()}`,
      action: 'Document Deleted',
      detail: `${readableName} file "${oldDoc?.name || ''}" was removed`,
      createdAt: new Date().toISOString(),
    });

    saveStoredProfile(profile);
    return profile;
  },

  changePassword: async (oldPass: string, newPass: string): Promise<boolean> => {
    await delay(600);
    const profile = getStoredProfile();
    
    profile.recentActivity.unshift({
      id: `act-${Date.now()}`,
      action: 'Password Changed',
      detail: 'Account credentials were successfully updated',
      createdAt: new Date().toISOString(),
    });
    
    saveStoredProfile(profile);
    return true;
  },

  getKPIs: async () => {
    await delay(200);

    const activeRFQs = 2; // Simulating active RFQs assigned to vendor
    
    // Purchase orders stats
    let activePOs = 0;
    try {
      const pos = localStorage.getItem('procurehub_purchase_orders');
      if (pos) {
        const parsed = JSON.parse(pos);
        activePOs = parsed.filter((po: any) => po.supplierId === 'VEN0001').length;
      } else {
        activePOs = 2; 
      }
    } catch {
      activePOs = 2;
    }

    // Invoices stats
    let outstandingInvoices = 0;
    try {
      const invs = localStorage.getItem('procurehub_invoices');
      if (invs) {
        const parsed = JSON.parse(invs);
        outstandingInvoices = parsed.filter((inv: any) => inv.status === 'unpaid' || inv.status === 'pending').length;
      } else {
        outstandingInvoices = 1;
      }
    } catch {
      outstandingInvoices = 1;
    }

    // Quotation count
    let submittedQuotations = 0;
    try {
      const qts = localStorage.getItem('procurehub_quotations');
      if (qts) {
        const parsed = JSON.parse(qts);
        submittedQuotations = parsed.filter((qt: any) => qt.status === 'submitted' || qt.status === 'accepted').length;
      } else {
        submittedQuotations = 3;
      }
    } catch {
      submittedQuotations = 3;
    }

    return {
      activeRFQs,
      submittedQuotations,
      activePOs,
      outstandingInvoices,
    };
  },
};
