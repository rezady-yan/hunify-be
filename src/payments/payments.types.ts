export type InvoiceStatus = "UNPAID" | "PAID" | "OVERDUE";
export type InvoiceType =
  | "RENT"
  | "PENALTY"
  | "ELECTRICITY"
  | "WATER"
  | "OTHER";
export type PaymentMethod =
  | "CASH"
  | "BANK_TRANSFER"
  | "E_WALLET"
  | "CHECK"
  | "OTHER";

export interface CreateInvoiceRequest {
  tenancyId: string;
  invoiceType: InvoiceType;
  amount: string;
  dueDate: string;
  billingPeriodStart?: string;
  billingPeriodEnd?: string;
  notes?: string;
}

export interface EditInvoiceRequest {
  amount?: string;
  dueDate?: string;
  billingPeriodStart?: string;
  billingPeriodEnd?: string;
  notes?: string;
}

export interface RecordPaymentRequest {
  amount: string;
  paymentDate: string;
  paymentMethod: PaymentMethod;
  notes?: string;
}

export interface UploadPaymentProofRequest {
  url: string;
  fileType: "JPG" | "PNG" | "PDF";
}

export interface GetInvoicesQuery {
  propertyId?: string;
  unitId?: string;
  tenantId?: string;
  status?: InvoiceStatus;
  invoiceType?: InvoiceType;
  billingPeriod?: string;
  search?: string;
  page?: string;
  limit?: string;
  sortBy?: "createdAt" | "dueDate" | "amount";
  sortOrder?: "ASC" | "DESC";
}

export interface GetPaymentSummaryQuery {
  propertyId?: string;
  month?: string;
}

export interface GetTransactionHistoryQuery {
  propertyId?: string;
  startDate?: string;
  endDate?: string;
  page?: string;
  limit?: string;
}

export interface GetOverdueInvoicesQuery {
  propertyId?: string;
  daysOverdue?: string;
  page?: string;
  limit?: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  errors?: any;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  propertyId: string;
  unitId: string;
  tenancyId: string;
  tenantId: string;
  invoiceType: InvoiceType;
  amount: string;
  dueDate: string;
  billingPeriodStart?: string | null;
  billingPeriodEnd?: string | null;
  status: InvoiceStatus;
  notes?: string | null;
  createdBy: string;
  createdAt: Date | null;
  updatedAt: Date | null;
}

export interface Payment {
  id: string;
  invoiceId: string;
  amount: string;
  paymentDate: string;
  paymentMethod: PaymentMethod;
  notes?: string | null;
  proofUrl?: string | null;
  recordedBy: string;
  recordedAt: Date | null;
  updatedAt: Date | null;
}

export interface PaymentProof {
  id: string;
  paymentId: string;
  fileUrl: string;
  fileType: string;
  uploadedBy: string;
  uploadedAt: Date | null;
}

export interface InvoiceListItem {
  id: string;
  invoiceNumber: string;
  tenantName: string;
  propertyName: string;
  unitName: string;
  billingPeriod: string;
  dueDate: string;
  amount: string;
  invoiceType: InvoiceType;
  status: InvoiceStatus;
  createdAt: string;
}

export interface InvoiceDetail {
  invoice: Invoice & {
    tenantName: string;
    propertyName: string;
    unitName: string;
  };
  payment: Payment | null;
}

export interface PaymentSummary {
  totalRevenue: string;
  totalPaid: string;
  totalUnpaid: string;
  totalOverdue: string;
  collectionRate: number;
  invoiceCount: {
    total: number;
    paid: number;
    unpaid: number;
    overdue: number;
  };
}

export interface TransactionItem {
  id: string;
  invoiceNumber: string;
  tenantName: string;
  propertyName: string;
  unitName: string;
  transactionType: string;
  amount: string;
  paymentMethod: string;
  transactionDate: string;
}

export interface OverdueInvoiceItem {
  id: string;
  invoiceNumber: string;
  tenantName: string;
  propertyName: string;
  unitName: string;
  amount: string;
  dueDate: string;
  daysOverdue: number;
  createdAt: string;
}
