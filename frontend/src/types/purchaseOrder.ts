export type PurchaseOrderPriority = 'low' | 'medium' | 'high' | 'urgent';

export type PurchaseOrderStatus =
  | 'draft'
  | 'pending_approval'
  | 'approved'
  | 'sent'
  | 'partially_delivered'
  | 'delivered'
  | 'cancelled'
  | 'rejected';

export type PurchaseOrderPaymentStatus = 'paid' | 'unpaid' | 'partially_paid';

export interface PurchaseOrderLineItem {
  id: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  discount: number; // percentage, e.g. 5 for 5%
  tax: number; // GST/tax percentage, e.g. 18 for 18%
  total: number;
}

export interface PurchaseOrderTimelineEvent {
  id: string;
  date: string; // ISO DateTime
  action: string;
  user: string;
  notes?: string;
}

export interface PurchaseOrderActivity {
  id: string;
  timestamp: string; // ISO DateTime
  action: string;
  details: string;
}

export interface PurchaseOrderAttachment {
  id: string;
  name: string;
  size: string; // e.g. "1.2 MB"
  type: string; // e.g. "PDF", "DOCX"
  url: string;
}

export interface PurchaseOrder {
  id: string; // PO Number/ID, e.g. PO-2026-0001
  poNumber: string; // Unique string
  supplierId: string; // Reference to vendor
  supplierName: string; // Cached vendor name
  rfqId?: string; // Optional RFQ reference
  quotationId?: string; // Optional Quotation reference
  orderDate: string; // YYYY-MM-DD
  expectedDeliveryDate: string; // YYYY-MM-DD
  priority: PurchaseOrderPriority;
  status: PurchaseOrderStatus;
  paymentStatus: PurchaseOrderPaymentStatus;
  lineItems: PurchaseOrderLineItem[];
  subtotal: number;
  discountTotal: number;
  taxTotal: number;
  shippingCost: number;
  grandTotal: number;
  deliveryAddress: string;
  paymentTerms: string; // e.g., "Net 30", "Net 45", "COD"
  notes?: string;
  timeline: PurchaseOrderTimelineEvent[];
  activityLog: PurchaseOrderActivity[];
  attachments: PurchaseOrderAttachment[];
}
