import { Quotation, QuotationStatus, QuotationLineItem } from '../types/quotation';

const LOCAL_STORAGE_KEY = 'procurehub_quotations';

const INITIAL_QUOTATIONS: Quotation[] = [
  {
    id: 'QT0001',
    rfqId: 'RFQ-2026-003',
    customerName: 'National Stationery Mart',
    lineItems: [
      { id: '1', productName: 'Ergonomic Office Chairs', quantity: 10, unitPrice: 4500, discount: 10, tax: 18, total: 47790 },
      { id: '2', productName: 'Executive Desks', quantity: 5, unitPrice: 8500, discount: 5, tax: 18, total: 47643 },
    ],
    subtotal: 87500,
    discountTotal: 6625,
    taxTotal: 14558,
    grandTotal: 95433,
    notes: 'Includes 1-year standard warranty on hardware items.',
    validityDate: '2026-09-01',
    status: 'accepted',
    submittedDate: '2026-02-15',
  },
  {
    id: 'QT0002',
    rfqId: 'RFQ-2026-012',
    customerName: 'Swift Logistics Group Inc.',
    lineItems: [
      { id: '1', productName: 'Warehouse Storage Racks', quantity: 20, unitPrice: 3200, discount: 0, tax: 18, total: 75520 },
    ],
    subtotal: 64000,
    discountTotal: 0,
    taxTotal: 11520,
    grandTotal: 75520,
    notes: 'Delivery and installation included in pricing.',
    validityDate: '2026-08-30',
    status: 'submitted',
    submittedDate: '2026-05-22',
  },
  {
    id: 'QT0003',
    rfqId: 'RFQ-2026-001',
    customerName: 'Apex Systems Private Limited',
    lineItems: [
      { id: '1', productName: 'Developer Laptops (Core i7)', quantity: 8, unitPrice: 75000, discount: 8, tax: 18, total: 651360 },
    ],
    subtotal: 600000,
    discountTotal: 48000,
    taxTotal: 99360,
    grandTotal: 651360,
    notes: 'Draft proposal, awaiting final pricing confirm from manufacturer.',
    validityDate: '2026-08-15',
    status: 'draft',
  },
];

// Helper to calculate totals for a list of items
export function calculateQuotationTotals(items: Omit<QuotationLineItem, 'total'>[]): {
  lineItems: QuotationLineItem[];
  subtotal: number;
  discountTotal: number;
  taxTotal: number;
  grandTotal: number;
} {
  let subtotal = 0;
  let discountTotal = 0;
  let taxTotal = 0;
  let grandTotal = 0;

  const lineItems: QuotationLineItem[] = items.map((item) => {
    const rawTotal = item.quantity * item.unitPrice;
    const discountAmount = rawTotal * (item.discount / 100);
    const afterDiscount = rawTotal - discountAmount;
    const taxAmount = afterDiscount * (item.tax / 100);
    const lineTotal = afterDiscount + taxAmount;

    subtotal += rawTotal;
    discountTotal += discountAmount;
    taxTotal += taxAmount;
    grandTotal += lineTotal;

    return {
      ...item,
      total: Math.round(lineTotal * 100) / 100,
    };
  });

  return {
    lineItems,
    subtotal: Math.round(subtotal * 100) / 100,
    discountTotal: Math.round(discountTotal * 100) / 100,
    taxTotal: Math.round(taxTotal * 100) / 100,
    grandTotal: Math.round(grandTotal * 100) / 100,
  };
}

const delay = (ms = 300) => new Promise((resolve) => setTimeout(resolve, ms));

function getStoredQuotations(): Quotation[] {
  const data = localStorage.getItem(LOCAL_STORAGE_KEY);
  if (!data) {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(INITIAL_QUOTATIONS));
    return INITIAL_QUOTATIONS;
  }
  return JSON.parse(data);
}

function saveStoredQuotations(quotes: Quotation[]) {
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(quotes));
}

export const quotationService = {
  getQuotations: async (params: {
    search?: string;
    status?: string;
    rfq?: string;
    customer?: string;
    page?: number;
    pageSize?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }) => {
    await delay(300);
    const quotes = getStoredQuotations();
    const {
      search,
      status,
      rfq,
      customer,
      page = 1,
      pageSize = 5,
      sortBy = 'submittedDate',
      sortOrder = 'desc',
    } = params;

    let filtered = quotes.filter((q) => {
      // Search matches ID, RFQ ID, Customer, or Product Name
      if (search) {
        const term = search.toLowerCase();
        const matchesProduct = q.lineItems.some((item) =>
          item.productName.toLowerCase().includes(term)
        );
        const matchesSearch =
          q.id.toLowerCase().includes(term) ||
          q.rfqId.toLowerCase().includes(term) ||
          q.customerName.toLowerCase().includes(term) ||
          matchesProduct;
        if (!matchesSearch) return false;
      }

      // Filter by status
      if (status && status !== 'all') {
        if (q.status !== status) return false;
      }

      // Filter by RFQ
      if (rfq && rfq !== 'all') {
        if (q.rfqId !== rfq) return false;
      }

      // Filter by Customer
      if (customer && customer !== 'all') {
        if (q.customerName !== customer) return false;
      }

      return true;
    });

    // Sorting
    filtered.sort((a: any, b: any) => {
      const valA = a[sortBy] ? a[sortBy].toString().toLowerCase() : '';
      const valB = b[sortBy] ? b[sortBy].toString().toLowerCase() : '';

      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    const totalCount = filtered.length;
    const startIdx = (page - 1) * pageSize;
    const endIdx = startIdx + pageSize;
    const paginated = filtered.slice(startIdx, endIdx);

    return {
      results: paginated,
      count: totalCount,
      page,
      pageSize,
      pages: Math.max(1, Math.ceil(totalCount / pageSize)),
    };
  },

  getQuotationById: async (id: string): Promise<Quotation | null> => {
    await delay(150);
    const quotes = getStoredQuotations();
    return quotes.find((q) => q.id === id) || null;
  },

  createQuotation: async (data: Omit<Quotation, 'id' | 'subtotal' | 'discountTotal' | 'taxTotal' | 'grandTotal' | 'submittedDate'> & { isSubmit?: boolean }): Promise<Quotation> => {
    await delay(400);
    const quotes = getStoredQuotations();

    // Auto-generate ID: QT0004 etc
    let maxId = 0;
    quotes.forEach((q) => {
      const num = parseInt(q.id.substring(2));
      if (!isNaN(num) && num > maxId) maxId = num;
    });
    const nextId = `QT${String(maxId + 1).padStart(4, '0')}`;

    const calculated = calculateQuotationTotals(data.lineItems);

    const newQuotation: Quotation = {
      id: nextId,
      rfqId: data.rfqId,
      customerName: data.customerName,
      lineItems: calculated.lineItems,
      subtotal: calculated.subtotal,
      discountTotal: calculated.discountTotal,
      taxTotal: calculated.taxTotal,
      grandTotal: calculated.grandTotal,
      notes: data.notes,
      validityDate: data.validityDate,
      status: data.isSubmit ? 'submitted' : data.status,
      submittedDate: data.isSubmit ? new Date().toISOString().split('T')[0] : undefined,
    };

    quotes.unshift(newQuotation);
    saveStoredQuotations(quotes);
    return newQuotation;
  },

  updateQuotation: async (id: string, data: Partial<Quotation> & { isSubmit?: boolean }): Promise<Quotation> => {
    await delay(400);
    const quotes = getStoredQuotations();
    const idx = quotes.findIndex((q) => q.id === id);
    if (idx === -1) throw new Error(`Quotation ${id} not found.`);

    const oldQuote = quotes[idx];
    const lineItemsToCalc = data.lineItems || oldQuote.lineItems;
    const calculated = calculateQuotationTotals(lineItemsToCalc);

    const updatedQuote: Quotation = {
      ...oldQuote,
      ...data,
      lineItems: calculated.lineItems,
      subtotal: calculated.subtotal,
      discountTotal: calculated.discountTotal,
      taxTotal: calculated.taxTotal,
      grandTotal: calculated.grandTotal,
      id, // Lock ID
      status: data.isSubmit ? 'submitted' : (data.status || oldQuote.status),
      submittedDate: data.isSubmit ? new Date().toISOString().split('T')[0] : oldQuote.submittedDate,
    };

    quotes[idx] = updatedQuote;
    saveStoredQuotations(quotes);
    return updatedQuote;
  },

  deleteQuotation: async (id: string): Promise<boolean> => {
    await delay(400);
    const quotes = getStoredQuotations();
    const filtered = quotes.filter((q) => q.id !== id);
    if (filtered.length === quotes.length) return false;
    saveStoredQuotations(filtered);
    return true;
  },

  duplicateQuotation: async (id: string): Promise<Quotation> => {
    await delay(300);
    const quotes = getStoredQuotations();
    const source = quotes.find((q) => q.id === id);
    if (!source) throw new Error(`Quotation ${id} not found.`);

    let maxId = 0;
    quotes.forEach((q) => {
      const num = parseInt(q.id.substring(2));
      if (!isNaN(num) && num > maxId) maxId = num;
    });
    const nextId = `QT${String(maxId + 1).padStart(4, '0')}`;

    const duplicate: Quotation = {
      ...source,
      id: nextId,
      status: 'draft',
      submittedDate: undefined,
      customerName: `${source.customerName} (Copy)`,
    };

    quotes.unshift(duplicate);
    saveStoredQuotations(quotes);
    return duplicate;
  },

  submitQuotation: async (id: string): Promise<Quotation> => {
    await delay(300);
    return quotationService.updateQuotation(id, { isSubmit: true });
  },

  getStats: async () => {
    await delay(100);
    const quotes = getStoredQuotations();
    return {
      total: quotes.length,
      draft: quotes.filter((q) => q.status === 'draft').length,
      submitted: quotes.filter((q) => q.status === 'submitted').length,
      accepted: quotes.filter((q) => q.status === 'accepted').length,
      rejected: quotes.filter((q) => q.status === 'rejected').length,
    };
  },

  exportToCSV: (quotations: Quotation[]): string => {
    const headers = [
      'Quotation ID',
      'RFQ ID',
      'Customer',
      'Subtotal',
      'Discount Total',
      'Tax Total',
      'Grand Total',
      'Valid Until',
      'Status',
      'Submitted Date',
    ];

    const rows = quotations.map((q) => [
      q.id,
      q.rfqId,
      `"${q.customerName.replace(/"/g, '""')}"`,
      q.subtotal,
      q.discountTotal,
      q.taxTotal,
      q.grandTotal,
      q.validityDate,
      q.status.toUpperCase(),
      q.submittedDate || 'N/A',
    ]);

    return [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
  },

  downloadPDF: (quotation: Quotation) => {
    // Generate a beautiful mock plain text / HTML content block and prompt download
    const title = `PROCUREHUB QUOTATION - ${quotation.id}`;
    
    const lines = [
      '==================================================',
      `                 ${title}`,
      '==================================================',
      `Quotation Reference : ${quotation.id}`,
      `Associated RFQ      : ${quotation.rfqId}`,
      `Issued To           : ${quotation.customerName}`,
      `Submission Date     : ${quotation.submittedDate || 'DRAFT'}`,
      `Validity Date       : ${quotation.validityDate}`,
      `Status              : ${quotation.status.toUpperCase()}`,
      '--------------------------------------------------',
      'Line Items Details:',
      '--------------------------------------------------',
    ];

    quotation.lineItems.forEach((item, index) => {
      lines.push(
        `${index + 1}. ${item.productName}`,
        `   Qty: ${item.quantity} | Price: ₹${item.unitPrice} | Disc: ${item.discount}% | Tax: ${item.tax}%`,
        `   Total: ₹${item.total}`
      );
    });

    lines.push(
      '--------------------------------------------------',
      `Subtotal       : ₹${quotation.subtotal}`,
      `Discounts (-)  : ₹${quotation.discountTotal}`,
      `Taxes (+)      : ₹${quotation.taxTotal}`,
      '--------------------------------------------------',
      `GRAND TOTAL    : ₹${quotation.grandTotal}`,
      '==================================================',
      `Remarks/Notes  : ${quotation.notes || 'None'}`,
      '==================================================',
      'Generated by ProcureHub ERP Portal.'
    );

    const rawText = lines.join('\n');
    const blob = new Blob([rawText], { type: 'text/plain;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `quotation_${quotation.id}.pdf`); // Downloads text summary with .pdf extension
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  },
};
