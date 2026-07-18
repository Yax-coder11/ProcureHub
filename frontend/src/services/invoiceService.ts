import { Invoice } from '../types/invoice';

const LOCAL_STORAGE_KEY = 'procurehub_invoices';

const INITIAL_INVOICES: Invoice[] = [
  {
    id: 'INV-2026-0001',
    invoiceNumber: 'INV-2026-0001',
    purchaseOrderId: 'PO-2026-0004',
    purchaseOrderNumber: 'PO-2026-0004',
    amount: 53100,
    dueDate: '2026-06-10',
    status: 'paid',
    createdAt: '2026-05-12',
    paymentDate: '2026-06-08',
    notes: 'Payment received via bank transfer. Cleared by accounts.',
    activityLog: [
      { id: '1', timestamp: '2026-05-12T14:00:00Z', action: 'Create', details: 'Invoice INV-2026-0001 generated against PO-2026-0004.' },
      { id: '2', timestamp: '2026-06-08T17:30:00Z', action: 'Payment', details: 'Marked as Paid. Transaction code: TXN998877.' },
    ]
  },
  {
    id: 'INV-2026-0002',
    invoiceNumber: 'INV-2026-0002',
    purchaseOrderId: 'PO-2026-0003',
    purchaseOrderNumber: 'PO-2026-0003',
    amount: 429800,
    dueDate: '2026-07-15',
    status: 'pending_payment',
    createdAt: '2026-06-21',
    notes: 'COD terms. Bill submitted to accounts for clearance.',
    activityLog: [
      { id: '1', timestamp: '2026-06-21T10:00:00Z', action: 'Create', details: 'Invoice INV-2026-0002 generated against PO-2026-0003.' }
    ]
  },
  {
    id: 'INV-2026-0003',
    invoiceNumber: 'INV-2026-0003',
    purchaseOrderId: 'PO-2026-0002',
    purchaseOrderNumber: 'PO-2026-0002',
    amount: 93725,
    dueDate: '2026-07-20',
    status: 'pending_payment',
    createdAt: '2026-06-19',
    notes: 'Awaiting delivery receipt checklist confirmation.',
    activityLog: [
      { id: '1', timestamp: '2026-06-19T11:15:00Z', action: 'Create', details: 'Invoice INV-2026-0003 generated against PO-2026-0002.' }
    ]
  },
  {
    id: 'INV-2026-0004',
    invoiceNumber: 'INV-2026-0004',
    purchaseOrderId: 'PO-2026-0005',
    purchaseOrderNumber: 'PO-2026-0005',
    amount: 68460,
    dueDate: '2026-06-15',
    status: 'cancelled',
    createdAt: '2026-06-02',
    notes: 'Order cancelled due to hardware changes. VOID invoice.',
    activityLog: [
      { id: '1', timestamp: '2026-06-02T09:00:00Z', action: 'Create', details: 'Invoice INV-2026-0004 generated.' },
      { id: '2', timestamp: '2026-06-03T15:30:00Z', action: 'Cancel', details: 'Status marked as Cancelled due to PO cancellation.' }
    ]
  }
];

const delay = (ms = 200) => new Promise((resolve) => setTimeout(resolve, ms));

function getStoredInvoices(): Invoice[] {
  const data = localStorage.getItem(LOCAL_STORAGE_KEY);
  if (!data) {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(INITIAL_INVOICES));
    return INITIAL_INVOICES;
  }
  return JSON.parse(data);
}

function saveStoredInvoices(invoices: Invoice[]) {
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(invoices));
}

export const invoiceService = {
  async getInvoices(params: {
    search?: string;
    status?: string;
    page?: number;
    pageSize?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<{ rows: Invoice[]; total: number }> {
    await delay();
    let list = getStoredInvoices();

    const {
      search = '',
      status = 'all',
      page = 1,
      pageSize = 10,
      sortBy = 'id',
      sortOrder = 'desc',
    } = params;

    // Search filter
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (inv) =>
          inv.invoiceNumber.toLowerCase().includes(q) ||
          inv.purchaseOrderNumber.toLowerCase().includes(q) ||
          (inv.notes && inv.notes.toLowerCase().includes(q))
      );
    }

    // Status filter
    if (status !== 'all') {
      list = list.filter((inv) => inv.status === status);
    }

    // Sorting
    list.sort((a, b) => {
      let valA: any = a[sortBy as keyof Invoice] || '';
      let valB: any = b[sortBy as keyof Invoice] || '';

      if (typeof valA === 'string') valA = valA.toLowerCase();
      if (typeof valB === 'string') valB = valB.toLowerCase();

      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
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

  async getInvoiceById(id: string): Promise<Invoice | undefined> {
    await delay(50);
    const list = getStoredInvoices();
    return list.find((inv) => inv.id === id);
  },

  async createInvoice(invoice: Omit<Invoice, 'id' | 'invoiceNumber' | 'createdAt' | 'activityLog'>): Promise<Invoice> {
    await delay();
    const list = getStoredInvoices();

    const invSeq = (list.length + 1).toString().padStart(4, '0');
    const invoiceNumber = `INV-2026-${invSeq}`;

    const now = new Date().toISOString().split('T')[0];
    const newInvoice: Invoice = {
      ...invoice,
      id: invoiceNumber,
      invoiceNumber,
      createdAt: now,
      activityLog: [
        { id: `a-${Date.now()}`, timestamp: new Date().toISOString(), action: 'Create', details: `Invoice ${invoiceNumber} created against PO ${invoice.purchaseOrderNumber}.` }
      ]
    };

    list.unshift(newInvoice);
    saveStoredInvoices(list);
    return newInvoice;
  },

  async updateInvoice(id: string, updates: Partial<Invoice>): Promise<Invoice> {
    await delay();
    const list = getStoredInvoices();
    const index = list.findIndex((inv) => inv.id === id);
    if (index === -1) {
      throw new Error('Invoice not found');
    }

    const current = list[index];
    const updatedInvoice: Invoice = {
      ...current,
      ...updates,
      activityLog: [
        ...current.activityLog,
        {
          id: `a-${Date.now()}`,
          timestamp: new Date().toISOString(),
          action: 'Update',
          details: 'Invoice details modified.'
        }
      ]
    };

    list[index] = updatedInvoice;
    saveStoredInvoices(list);
    return updatedInvoice;
  },

  async deleteInvoice(id: string): Promise<boolean> {
    await delay();
    let list = getStoredInvoices();
    const exists = list.some((inv) => inv.id === id);
    if (!exists) return false;

    list = list.filter((inv) => inv.id !== id);
    saveStoredInvoices(list);
    return true;
  },

  async getStats(): Promise<{
    totalCount: number;
    pendingCount: number;
    paidCount: number;
    cancelledCount: number;
    totalAmount: number;
  }> {
    await delay(100);
    const list = getStoredInvoices();

    const totalCount = list.length;
    const pendingCount = list.filter((inv) => inv.status === 'pending_payment').length;
    const paidCount = list.filter((inv) => inv.status === 'paid').length;
    const cancelledCount = list.filter((inv) => inv.status === 'cancelled').length;
    const totalAmount = list.reduce((sum, inv) => sum + (inv.status !== 'cancelled' ? inv.amount : 0), 0);

    return {
      totalCount,
      pendingCount,
      paidCount,
      cancelledCount,
      totalAmount,
    };
  }
};
