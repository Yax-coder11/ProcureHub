export type InvoiceStatus = 'pending_payment' | 'paid' | 'cancelled';

export interface InvoiceActivity {
  id: string;
  timestamp: string;
  action: string;
  details: string;
}

export interface Invoice {
  id: string; // Invoice ID (number), e.g. INV-2026-0001
  invoiceNumber: string;
  purchaseOrderId: string; // PO Number reference
  purchaseOrderNumber: string;
  amount: number;
  dueDate: string; // YYYY-MM-DD
  status: InvoiceStatus;
  createdAt: string; // YYYY-MM-DD
  paymentDate?: string; // YYYY-MM-DD
  notes?: string;
  activityLog: InvoiceActivity[];
}
