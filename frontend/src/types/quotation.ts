export type QuotationStatus = 'draft' | 'submitted' | 'accepted' | 'rejected' | 'expired';

export interface QuotationLineItem {
  id: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  discount: number; // Percentage (e.g. 10 for 10%)
  tax: number; // Percentage (e.g. 18 for 18% GST)
  total: number; // (Qty * UnitPrice * (1 - Disc/100)) * (1 + Tax/100)
}

export interface Quotation {
  id: string; // Auto-generated, e.g. QT0001
  rfqId: string; // Associated RFQ ID, e.g. RFQ-2026-001
  customerName: string; // Sourcing Organization
  lineItems: QuotationLineItem[];
  subtotal: number; // Sum of Qty * UnitPrice
  discountTotal: number; // Sum of discounts
  taxTotal: number; // Sum of taxes
  grandTotal: number; // Subtotal - Discounts + Taxes
  notes?: string;
  validityDate: string; // YYYY-MM-DD
  status: QuotationStatus;
  submittedDate?: string; // YYYY-MM-DD
}
