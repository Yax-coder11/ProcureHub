import { PurchaseOrder, PurchaseOrderLineItem } from '../types/purchaseOrder';

const LOCAL_STORAGE_KEY = 'procurehub_purchase_orders';

const INITIAL_PURCHASE_ORDERS: PurchaseOrder[] = [
  {
    id: 'PO-2026-0001',
    poNumber: 'PO-2026-0001',
    supplierId: 'VEN0001',
    supplierName: 'Apex IT Solutions',
    rfqId: 'RFQ-2026-003',
    quotationId: 'QT0001',
    orderDate: '2026-06-15',
    expectedDeliveryDate: '2026-07-20',
    priority: 'high',
    status: 'draft',
    paymentStatus: 'unpaid',
    lineItems: [
      { id: '1', productName: 'Developer Laptops (Core i7)', quantity: 2, unitPrice: 75000, discount: 5, tax: 18, total: 166725 },
      { id: '2', productName: 'External Monitors 27"', quantity: 4, unitPrice: 15000, discount: 0, tax: 18, total: 70800 },
    ],
    subtotal: 210000,
    discountTotal: 7500,
    taxTotal: 34225,
    shippingCost: 1500,
    grandTotal: 238225,
    deliveryAddress: '404, Tech Park, Phase 3, Hinjewadi, Pune - 411057',
    paymentTerms: 'Net 30',
    notes: 'Please ensure all laptops are pre-loaded with corporate OS image.',
    timeline: [
      { id: 't1', date: '2026-06-15T09:30:00Z', action: 'PO Created', user: 'Rahul Sharma', notes: 'Draft PO created from Quotation QT0001' }
    ],
    activityLog: [
      { id: 'a1', timestamp: '2026-06-15T09:30:00Z', action: 'Create', details: 'Purchase Order draft PO-2026-0001 initialized.' }
    ],
    attachments: [
      { id: 'att1', name: 'quotation_proposal_QT0001.pdf', size: '420 KB', type: 'PDF', url: '#' }
    ]
  },
  {
    id: 'PO-2026-0002',
    poNumber: 'PO-2026-0002',
    supplierId: 'VEN0002',
    supplierName: 'National Office Stationers',
    rfqId: 'RFQ-2026-012',
    quotationId: 'QT0002',
    orderDate: '2026-06-18',
    expectedDeliveryDate: '2026-07-05',
    priority: 'medium',
    status: 'pending_approval',
    paymentStatus: 'unpaid',
    lineItems: [
      { id: '1', productName: 'Executive Desks', quantity: 5, unitPrice: 8500, discount: 10, tax: 18, total: 45135 },
      { id: '2', productName: 'Ergonomic Office Chairs', quantity: 10, unitPrice: 4500, discount: 10, tax: 18, total: 47790 },
    ],
    subtotal: 87500,
    discountTotal: 8750,
    taxTotal: 14175,
    shippingCost: 800,
    grandTotal: 93725,
    deliveryAddress: '12, Connaught Place, Block E, New Delhi - 110001',
    paymentTerms: 'Net 45',
    notes: 'Standard office layout deployment. Call before delivery.',
    timeline: [
      { id: 't1', date: '2026-06-18T10:15:00Z', action: 'PO Created', user: 'Amit Verma', notes: 'PO raised for approval' },
      { id: 't2', date: '2026-06-18T11:00:00Z', action: 'Submitted for Approval', user: 'Amit Verma', notes: 'Sent to manager for approval' }
    ],
    activityLog: [
      { id: 'a1', timestamp: '2026-06-18T10:15:00Z', action: 'Create', details: 'Purchase Order PO-2026-0002 initialized.' },
      { id: 'a2', timestamp: '2026-06-18T11:00:00Z', action: 'Status Update', details: 'Status changed to pending_approval.' }
    ],
    attachments: [
      { id: 'att1', name: 'office_layouts_approved.pdf', size: '1.2 MB', type: 'PDF', url: '#' }
    ]
  },
  {
    id: 'PO-2026-0003',
    poNumber: 'PO-2026-0003',
    supplierId: 'VEN0003',
    supplierName: 'Swift Cargo Carriers',
    orderDate: '2026-06-20',
    expectedDeliveryDate: '2026-07-15',
    priority: 'urgent',
    status: 'approved',
    paymentStatus: 'partially_paid',
    lineItems: [
      { id: '1', productName: 'Logistics Containers (Medium)', quantity: 3, unitPrice: 120000, discount: 0, tax: 18, total: 424800 },
    ],
    subtotal: 360000,
    discountTotal: 0,
    taxTotal: 64800,
    shippingCost: 5000,
    grandTotal: 429800,
    deliveryAddress: '88, Port Trust Road, Harbour Area, Bengaluru - 560001',
    paymentTerms: 'COD',
    notes: 'Urgent warehouse deployment needed. Priority delivery.',
    timeline: [
      { id: 't1', date: '2026-06-20T08:00:00Z', action: 'PO Created', user: 'Sandra Dsouza', notes: 'Urgent demand raised' },
      { id: 't2', date: '2026-06-20T09:30:00Z', action: 'Approved by Manager', user: 'Manager User', notes: 'Approved for urgent deployment' }
    ],
    activityLog: [
      { id: 'a1', timestamp: '2026-06-20T08:00:00Z', action: 'Create', details: 'PO-2026-0003 created.' },
      { id: 'a2', timestamp: '2026-06-20T09:30:00Z', action: 'Approve', details: 'PO approved by Manager.' }
    ],
    attachments: [
      { id: 'att1', name: 'delivery_clearance_customs.pdf', size: '890 KB', type: 'PDF', url: '#' }
    ]
  },
  {
    id: 'PO-2026-0004',
    poNumber: 'PO-2026-0004',
    supplierId: 'VEN0005',
    supplierName: 'Vanguard Legal Associates',
    orderDate: '2026-05-10',
    expectedDeliveryDate: '2026-06-10',
    priority: 'low',
    status: 'delivered',
    paymentStatus: 'paid',
    lineItems: [
      { id: '1', productName: 'Compliance Audit Service', quantity: 1, unitPrice: 45000, discount: 0, tax: 18, total: 53100 },
    ],
    subtotal: 45000,
    discountTotal: 0,
    taxTotal: 8100,
    shippingCost: 0,
    grandTotal: 53100,
    deliveryAddress: '5A, Park Street, Corporate Chambers, Kolkata - 700016',
    paymentTerms: 'Net 30',
    notes: 'Quarterly compliance filings and corporate audits.',
    timeline: [
      { id: 't1', date: '2026-05-10T14:00:00Z', action: 'PO Created', user: 'Anjali Sen', notes: 'Quarterly compliance service' },
      { id: 't2', date: '2026-05-10T16:00:00Z', action: 'Approved by Manager', user: 'Manager User', notes: 'Budget cleared' },
      { id: 't3', date: '2026-06-08T17:00:00Z', action: 'Fulfilled & Delivered', user: 'Anjali Sen', notes: 'Compliance review completed' }
    ],
    activityLog: [
      { id: 'a1', timestamp: '2026-05-10T14:00:00Z', action: 'Create', details: 'PO-2026-0004 created.' },
      { id: 'a2', timestamp: '2026-06-08T17:00:00Z', action: 'Deliver', details: 'PO marked as delivered.' }
    ],
    attachments: [
      { id: 'att1', name: 'compliance_report_Q2.pdf', size: '2.1 MB', type: 'PDF', url: '#' }
    ]
  },
  {
    id: 'PO-2026-0005',
    poNumber: 'PO-2026-0005',
    supplierId: 'VEN0001',
    supplierName: 'Apex IT Solutions',
    orderDate: '2026-06-01',
    expectedDeliveryDate: '2026-06-15',
    priority: 'medium',
    status: 'cancelled',
    paymentStatus: 'unpaid',
    lineItems: [
      { id: '1', productName: 'Server Upgrade Components', quantity: 5, unitPrice: 12000, discount: 5, tax: 18, total: 67260 },
    ],
    subtotal: 60000,
    discountTotal: 3000,
    taxTotal: 10260,
    shippingCost: 1200,
    grandTotal: 68460,
    deliveryAddress: '404, Tech Park, Phase 3, Hinjewadi, Pune - 411057',
    paymentTerms: 'Net 30',
    notes: 'Cancelled due to specification changes in hardware requirements.',
    timeline: [
      { id: 't1', date: '2026-06-01T11:00:00Z', action: 'PO Created', user: 'Rahul Sharma' },
      { id: 't2', date: '2026-06-03T15:00:00Z', action: 'PO Cancelled', user: 'Manager User', notes: 'Cancelled by customer' }
    ],
    activityLog: [
      { id: 'a1', timestamp: '2026-06-01T11:00:00Z', action: 'Create', details: 'PO-2026-0005 created.' },
      { id: 'a2', timestamp: '2026-06-03T15:00:00Z', action: 'Cancel', details: 'PO cancelled.' }
    ],
    attachments: []
  }
];

const delay = (ms = 300) => new Promise((resolve) => setTimeout(resolve, ms));

function getStoredPurchaseOrders(): PurchaseOrder[] {
  const data = localStorage.getItem(LOCAL_STORAGE_KEY);
  if (!data) {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(INITIAL_PURCHASE_ORDERS));
    return INITIAL_PURCHASE_ORDERS;
  }
  return JSON.parse(data);
}

function saveStoredPurchaseOrders(pos: PurchaseOrder[]) {
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(pos));
}

export function calculatePOTotals(items: Omit<PurchaseOrderLineItem, 'total'>[], shippingCost = 0): {
  lineItems: PurchaseOrderLineItem[];
  subtotal: number;
  discountTotal: number;
  taxTotal: number;
  grandTotal: number;
} {
  let subtotal = 0;
  let discountTotal = 0;
  let taxTotal = 0;

  const lineItems: PurchaseOrderLineItem[] = items.map((item) => {
    const rawTotal = item.quantity * item.unitPrice;
    const discountAmount = rawTotal * (item.discount / 100);
    const afterDiscount = rawTotal - discountAmount;
    const taxAmount = afterDiscount * (item.tax / 100);
    const lineTotal = afterDiscount + taxAmount;

    subtotal += rawTotal;
    discountTotal += discountAmount;
    taxTotal += taxAmount;

    return {
      ...item,
      total: Math.round(lineTotal * 100) / 100,
    };
  });

  const grandTotal = subtotal - discountTotal + taxTotal + shippingCost;

  return {
    lineItems,
    subtotal: Math.round(subtotal * 100) / 100,
    discountTotal: Math.round(discountTotal * 100) / 100,
    taxTotal: Math.round(taxTotal * 100) / 100,
    grandTotal: Math.round(grandTotal * 100) / 100,
  };
}

export const purchaseOrderService = {
  async getPurchaseOrders(params: {
    search?: string;
    status?: string;
    supplier?: string;
    priority?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    pageSize?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<{ rows: PurchaseOrder[]; total: number }> {
    await delay();
    let list = getStoredPurchaseOrders();

    const {
      search = '',
      status = 'all',
      supplier = 'all',
      priority = 'all',
      startDate = '',
      endDate = '',
      page = 1,
      pageSize = 10,
      sortBy = 'id',
      sortOrder = 'desc',
    } = params;

    // Filter
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (po) =>
          po.poNumber.toLowerCase().includes(q) ||
          po.supplierName.toLowerCase().includes(q) ||
          po.deliveryAddress.toLowerCase().includes(q) ||
          (po.notes && po.notes.toLowerCase().includes(q))
      );
    }

    if (status !== 'all') {
      list = list.filter((po) => po.status === status);
    }

    if (supplier !== 'all') {
      list = list.filter((po) => po.supplierId === supplier);
    }

    if (priority !== 'all') {
      list = list.filter((po) => po.priority === priority);
    }

    if (startDate) {
      list = list.filter((po) => po.orderDate >= startDate);
    }

    if (endDate) {
      list = list.filter((po) => po.orderDate <= endDate);
    }

    // Sort
    list.sort((a, b) => {
      let fieldA: any = a[sortBy as keyof PurchaseOrder] || '';
      let fieldB: any = b[sortBy as keyof PurchaseOrder] || '';

      if (typeof fieldA === 'string') fieldA = fieldA.toLowerCase();
      if (typeof fieldB === 'string') fieldB = fieldB.toLowerCase();

      if (fieldA < fieldB) return sortOrder === 'asc' ? -1 : 1;
      if (fieldA > fieldB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    const total = list.length;
    const startIndex = (page - 1) * pageSize;
    const paginatedRows = list.slice(startIndex, startIndex + pageSize);

    return {
      rows: paginatedRows,
      total,
    };
  },

  async getPurchaseOrderById(id: string): Promise<PurchaseOrder | undefined> {
    await delay(100);
    const list = getStoredPurchaseOrders();
    return list.find((po) => po.id === id);
  },

  async createPurchaseOrder(po: Omit<PurchaseOrder, 'id' | 'poNumber' | 'subtotal' | 'discountTotal' | 'taxTotal' | 'grandTotal' | 'timeline' | 'activityLog'>): Promise<PurchaseOrder> {
    await delay();
    const list = getStoredPurchaseOrders();

    const poSeq = (list.length + 1).toString().padStart(4, '0');
    const poNumber = `PO-2026-${poSeq}`;

    const calculated = calculatePOTotals(po.lineItems, po.shippingCost);

    const now = new Date().toISOString();
    const newPO: PurchaseOrder = {
      ...po,
      ...calculated,
      id: poNumber,
      poNumber,
      timeline: [
        { id: `t-${Date.now()}`, date: now, action: 'PO Created', user: 'Vendor Portal', notes: 'Purchase order generated' }
      ],
      activityLog: [
        { id: `a-${Date.now()}`, timestamp: now, action: 'Create', details: `Purchase Order ${poNumber} created.` }
      ],
    };

    list.unshift(newPO);
    saveStoredPurchaseOrders(list);
    return newPO;
  },

  async updatePurchaseOrder(id: string, updates: Partial<PurchaseOrder>): Promise<PurchaseOrder> {
    await delay();
    const list = getStoredPurchaseOrders();
    const index = list.findIndex((po) => po.id === id);
    if (index === -1) {
      throw new Error('Purchase Order not found');
    }

    const current = list[index];
    let updatedItems = updates.lineItems || current.lineItems;
    let shipping = updates.shippingCost !== undefined ? updates.shippingCost : current.shippingCost;

    const calculated = calculatePOTotals(updatedItems, shipping);

    const now = new Date().toISOString();
    const activity = {
      id: `a-${Date.now()}`,
      timestamp: now,
      action: 'Update',
      details: 'Purchase Order details updated.'
    };

    const timelineEvent = {
      id: `t-${Date.now()}`,
      date: now,
      action: updates.status && updates.status !== current.status ? `Status changed to ${updates.status}` : 'PO Details Updated',
      user: 'Vendor Portal',
      notes: updates.notes || ''
    };

    const updatedPO: PurchaseOrder = {
      ...current,
      ...updates,
      ...calculated,
      timeline: [...current.timeline, timelineEvent],
      activityLog: [...current.activityLog, activity],
    };

    list[index] = updatedPO;
    saveStoredPurchaseOrders(list);
    return updatedPO;
  },

  async deletePurchaseOrder(id: string): Promise<boolean> {
    await delay();
    let list = getStoredPurchaseOrders();
    const exists = list.some((po) => po.id === id);
    if (!exists) return false;

    list = list.filter((po) => po.id !== id);
    saveStoredPurchaseOrders(list);
    return true;
  },

  async getStats(): Promise<{
    totalCount: number;
    totalCountTrend: number;
    pendingCount: number;
    pendingCountTrend: number;
    approvedCount: number;
    approvedCountTrend: number;
    deliveredCount: number;
    deliveredCountTrend: number;
    totalValue: number;
    totalValueTrend: number;
  }> {
    await delay(150);
    const list = getStoredPurchaseOrders();

    const totalCount = list.length;
    const pendingCount = list.filter((po) => po.status === 'pending_approval' || po.status === 'draft').length;
    const approvedCount = list.filter((po) => po.status === 'approved' || po.status === 'sent').length;
    const deliveredCount = list.filter((po) => po.status === 'delivered' || po.status === 'partially_delivered').length;
    const totalValue = list.reduce((sum, po) => sum + (po.status !== 'cancelled' ? po.grandTotal : 0), 0);

    return {
      totalCount,
      totalCountTrend: 12.5,
      pendingCount,
      pendingCountTrend: -8.3,
      approvedCount,
      approvedCountTrend: 15.2,
      deliveredCount,
      deliveredCountTrend: 22.4,
      totalValue,
      totalValueTrend: 18.9,
    };
  },

  async getAnalytics(): Promise<{
    monthlyPO: { name: string; value: number }[];
    statusDonut: { name: string; value: number; color: string }[];
    valueTrend: { date: string; amount: number }[];
  }> {
    await delay(200);
    const list = getStoredPurchaseOrders();

    // 1. Monthly PO counts (mocking June & July based on orderDates)
    const juneCount = list.filter((po) => po.orderDate.startsWith('2026-06')).length;
    const mayCount = list.filter((po) => po.orderDate.startsWith('2026-05')).length;

    const monthlyPO = [
      { name: 'Apr 26', value: 2 },
      { name: 'May 26', value: mayCount || 3 },
      { name: 'Jun 26', value: juneCount || 4 },
      { name: 'Jul 26', value: 1 },
    ];

    // 2. Status counts
    const draft = list.filter((po) => po.status === 'draft').length;
    const pending = list.filter((po) => po.status === 'pending_approval').length;
    const approved = list.filter((po) => po.status === 'approved' || po.status === 'sent').length;
    const delivered = list.filter((po) => po.status === 'delivered' || po.status === 'partially_delivered').length;
    const cancelled = list.filter((po) => po.status === 'cancelled').length;

    const statusDonut = [
      { name: 'Draft', value: draft, color: '#94a3b8' }, // slate-400
      { name: 'Pending Approval', value: pending, color: '#f59e0b' }, // amber-500
      { name: 'Approved', value: approved, color: '#3b82f6' }, // blue-500
      { name: 'Delivered', value: delivered, color: '#10b981' }, // emerald-500
      { name: 'Cancelled', value: cancelled, color: '#ef4444' }, // red-500
    ].filter((s) => s.value > 0);

    // 3. Purchase Value trend
    // Sorting list by date to show incremental totals
    const sorted = [...list]
      .filter((po) => po.status !== 'cancelled')
      .sort((a, b) => a.orderDate.localeCompare(b.orderDate));

    const valueTrend = sorted.map((po) => ({
      date: new Date(po.orderDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      amount: po.grandTotal,
    }));

    return {
      monthlyPO,
      statusDonut,
      valueTrend,
    };
  },
};
