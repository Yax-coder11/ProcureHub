import { Vendor, VendorStatus, VendorActivityLog, VendorCategory } from '../types/vendor';

const LOCAL_STORAGE_KEY = 'procurehub_vendors';
const LOGS_STORAGE_KEY = 'procurehub_vendor_logs';

export const DEFAULT_CATEGORIES: VendorCategory[] = [
  { id: 'cat-1', name: 'IT & Hardware', description: 'Computers, servers, and networking hardware', isActive: true },
  { id: 'cat-2', name: 'Office Supplies', description: 'Stationery, furniture, and kitchen supplies', isActive: true },
  { id: 'cat-3', name: 'Logistics & Shipping', description: 'Courier, trucking, and delivery services', isActive: true },
  { id: 'cat-4', name: 'Raw Materials', description: 'Raw metals, plastic polymers, chemicals', isActive: true },
  { id: 'cat-5', name: 'Consulting & Legal', description: 'Professional consulting and legal advisors', isActive: true },
];

const INITIAL_VENDORS: Vendor[] = [
  {
    id: 'VEN0001',
    vendorName: 'Apex IT Solutions',
    businessName: 'Apex Systems Private Limited',
    category: 'IT & Hardware',
    gstNumber: '27AAAAA1111A1Z1',
    contactPerson: 'Rahul Sharma',
    phone: '+91 98765 43210',
    email: 'contact@apexsystems.com',
    address: '404, Tech Park, Phase 3, Hinjewadi',
    city: 'Pune',
    state: 'Maharashtra',
    pincode: '411057',
    status: 'active',
    registrationDate: '2026-01-15',
    notes: 'Primary vendor for laptop procurement and IT assets.'
  },
  {
    id: 'VEN0002',
    vendorName: 'National Office Stationers',
    businessName: 'National Stationery Mart',
    category: 'Office Supplies',
    gstNumber: '07BBBBB2222B2Z2',
    contactPerson: 'Amit Verma',
    phone: '+91 99887 76655',
    email: 'sales@nationalstationery.in',
    address: '12, Connaught Place, Block E',
    city: 'New Delhi',
    state: 'Delhi',
    pincode: '110001',
    status: 'active',
    registrationDate: '2026-02-10',
    notes: 'Handles regular supply of printing paper and stationery items.'
  },
  {
    id: 'VEN0003',
    vendorName: 'Swift Cargo Carriers',
    businessName: 'Swift Logistics Group Inc.',
    category: 'Logistics & Shipping',
    gstNumber: '29CCCCC3333C3Z3',
    contactPerson: 'Sandra Dsouza',
    phone: '+91 88990 01122',
    email: 'partner@swiftcargo.com',
    address: '88, Port Trust Road, Harbour Area',
    city: 'Bengaluru',
    state: 'Karnataka',
    pincode: '560001',
    status: 'pending',
    registrationDate: '2026-05-20',
    notes: 'Pending background check and registration audit.'
  },
  {
    id: 'VEN0004',
    vendorName: 'Pioneer Chemicals',
    businessName: 'Pioneer Chemical Industries',
    category: 'Raw Materials',
    gstNumber: '24DDDDD4444D4Z4',
    contactPerson: 'Vikas Patel',
    phone: '+91 77665 54433',
    email: 'info@pioneerchems.com',
    address: 'Plot 1205, GIDC Industrial Estate',
    city: 'Anand',
    state: 'Gujarat',
    pincode: '388001',
    status: 'inactive',
    registrationDate: '2025-11-05',
    notes: 'Account suspended temporarily due to quality standard failures.'
  },
  {
    id: 'VEN0005',
    vendorName: 'Vanguard Legal Associates',
    businessName: 'Vanguard Partners LLP',
    category: 'Consulting & Legal',
    gstNumber: '19EEEEE5555E5Z5',
    contactPerson: 'Anjali Sen',
    phone: '+91 90011 22334',
    email: 'corporate@vanguardlegal.com',
    address: '5A, Park Street, Corporate Chambers',
    city: 'Kolkata',
    state: 'West Bengal',
    pincode: '700016',
    status: 'active',
    registrationDate: '2026-04-01',
    notes: 'Legal consultancy for patent filings and compliance reviews.'
  }
];

// Helper to simulate network latency
const delay = (ms = 400) => new Promise((resolve) => setTimeout(resolve, ms));

function getStoredVendors(): Vendor[] {
  const data = localStorage.getItem(LOCAL_STORAGE_KEY);
  if (!data) {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(INITIAL_VENDORS));
    return INITIAL_VENDORS;
  }
  return JSON.parse(data);
}

function saveStoredVendors(vendors: Vendor[]) {
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(vendors));
}

function getStoredLogs(): VendorActivityLog[] {
  const data = localStorage.getItem(LOGS_STORAGE_KEY);
  if (!data) {
    // Seed initial logs for our default vendors
    const initialLogs: VendorActivityLog[] = INITIAL_VENDORS.map((v) => ({
      id: `LOG-${v.id}`,
      vendorId: v.id,
      action: 'create',
      detail: `Vendor account created for ${v.vendorName} under category ${v.category}`,
      performedBy: 'System Seeder',
      createdAt: new Date(v.registrationDate).toISOString(),
    }));
    localStorage.setItem(LOGS_STORAGE_KEY, JSON.stringify(initialLogs));
    return initialLogs;
  }
  return JSON.parse(data);
}

function saveStoredLogs(logs: VendorActivityLog[]) {
  localStorage.setItem(LOGS_STORAGE_KEY, JSON.stringify(logs));
}

function logActivity(vendorId: string, action: VendorActivityLog['action'], detail: string, performedBy: string) {
  const logs = getStoredLogs();
  const newLog: VendorActivityLog = {
    id: `LOG${Date.now()}${Math.floor(Math.random() * 1000)}`,
    vendorId,
    action,
    detail,
    performedBy,
    createdAt: new Date().toISOString()
  };
  logs.unshift(newLog);
  saveStoredLogs(logs);
}

export const vendorService = {
  // Query multiple vendors with filtering, search, sorting and pagination
  getVendors: async (params: {
    search?: string;
    category?: string;
    status?: string;
    page?: number;
    pageSize?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }) => {
    await delay(300);
    const vendors = getStoredVendors();
    const { search, category, status, page = 1, pageSize = 5, sortBy = 'registrationDate', sortOrder = 'desc' } = params;

    // 1. Filtering
    let filtered = vendors.filter((v) => {
      // Search matches vendor name, business name, contact, gst, email, phone
      if (search) {
        const term = search.toLowerCase();
        const matchesSearch =
          v.vendorName.toLowerCase().includes(term) ||
          v.businessName.toLowerCase().includes(term) ||
          v.contactPerson.toLowerCase().includes(term) ||
          v.email.toLowerCase().includes(term) ||
          v.phone.toLowerCase().includes(term) ||
          v.gstNumber.toLowerCase().includes(term) ||
          v.id.toLowerCase().includes(term);
        if (!matchesSearch) return false;
      }

      // Filter by category
      if (category && category !== 'all') {
        if (v.category !== category) return false;
      }

      // Filter by status
      if (status && status !== 'all') {
        if (v.status !== status) return false;
      }

      return true;
    });

    // 2. Sorting
    filtered.sort((a: any, b: any) => {
      const valA = a[sortBy] ? a[sortBy].toString().toLowerCase() : '';
      const valB = b[sortBy] ? b[sortBy].toString().toLowerCase() : '';

      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    // 3. Pagination
    const totalCount = filtered.length;
    const startIdx = (page - 1) * pageSize;
    const endIdx = startIdx + pageSize;
    const paginated = filtered.slice(startIdx, endIdx);

    return {
      results: paginated,
      count: totalCount,
      page,
      pageSize,
      pages: Math.max(1, Math.ceil(totalCount / pageSize))
    };
  },

  getVendorById: async (id: string): Promise<Vendor | null> => {
    await delay(150);
    const vendors = getStoredVendors();
    const found = vendors.find((v) => v.id === id);
    return found || null;
  },

  createVendor: async (data: Omit<Vendor, 'id' | 'registrationDate'>, performedBy: string): Promise<Vendor> => {
    await delay(400);
    const vendors = getStoredVendors();
    
    // Auto-generate vendor ID (e.g. VEN0006)
    const activeVens = vendors.filter((v) => v.id.startsWith('VEN'));
    let maxId = 0;
    activeVens.forEach((v) => {
      const num = parseInt(v.id.substring(3));
      if (!isNaN(num) && num > maxId) maxId = num;
    });
    const nextIdStr = `VEN${String(maxId + 1).padStart(4, '0')}`;

    const newVendor: Vendor = {
      ...data,
      id: nextIdStr,
      registrationDate: new Date().toISOString().split('T')[0]
    };

    vendors.unshift(newVendor);
    saveStoredVendors(vendors);
    logActivity(nextIdStr, 'create', `Created vendor ${newVendor.vendorName} (${newVendor.businessName})`, performedBy);

    return newVendor;
  },

  updateVendor: async (id: string, data: Partial<Vendor>, performedBy: string): Promise<Vendor> => {
    await delay(400);
    const vendors = getStoredVendors();
    const idx = vendors.findIndex((v) => v.id === id);
    if (idx === -1) throw new Error(`Vendor ${id} not found.`);

    const oldVendor = vendors[idx];
    const updatedVendor: Vendor = {
      ...oldVendor,
      ...data,
      id // Prevent altering ID
    };

    vendors[idx] = updatedVendor;
    saveStoredVendors(vendors);

    // Document changes
    const changes: string[] = [];
    Object.keys(data).forEach((key) => {
      const k = key as keyof Vendor;
      if (data[k] !== oldVendor[k]) {
        changes.push(`${k}: from "${oldVendor[k]}" to "${data[k]}"`);
      }
    });

    const detail = changes.length > 0 
      ? `Updated vendor: ${changes.join(', ')}` 
      : 'Updated vendor details (no fields changed)';
      
    logActivity(id, 'update', detail, performedBy);

    return updatedVendor;
  },

  deleteVendor: async (id: string, performedBy: string): Promise<boolean> => {
    await delay(400);
    const vendors = getStoredVendors();
    const filtered = vendors.filter((v) => v.id !== id);
    
    if (filtered.length === vendors.length) {
      return false;
    }
    
    saveStoredVendors(filtered);
    logActivity(id, 'archive', `Deleted/removed vendor record from registry`, performedBy);
    return true;
  },

  getStats: async () => {
    await delay(100);
    const vendors = getStoredVendors();
    return {
      total: vendors.length,
      active: vendors.filter((v) => v.status === 'active').length,
      pending: vendors.filter((v) => v.status === 'pending').length,
      inactive: vendors.filter((v) => v.status === 'inactive').length,
    };
  },

  getActivityLogs: async (vendorId: string): Promise<VendorActivityLog[]> => {
    await delay(100);
    const logs = getStoredLogs();
    return logs.filter((log) => log.vendorId === vendorId);
  },

  getCategories: async (): Promise<VendorCategory[]> => {
    await delay(100);
    return DEFAULT_CATEGORIES;
  },

  // Generates CSV raw string
  exportToCSV: (vendors: Vendor[]): string => {
    const headers = [
      'Vendor ID',
      'Vendor Name',
      'Business Name',
      'Category',
      'GST Number',
      'Contact Person',
      'Phone',
      'Email',
      'Address',
      'City',
      'State',
      'Pincode',
      'Status',
      'Registration Date'
    ];

    const rows = vendors.map((v) => [
      v.id,
      `"${v.vendorName.replace(/"/g, '""')}"`,
      `"${v.businessName.replace(/"/g, '""')}"`,
      v.category,
      v.gstNumber,
      v.contactPerson,
      v.phone,
      v.email,
      `"${v.address.replace(/"/g, '""')}"`,
      v.city,
      v.state,
      v.pincode,
      v.status.toUpperCase(),
      v.registrationDate
    ]);

    return [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
  }
};
