import {
  CreateInvoiceRequest,
  EditInvoiceRequest,
  RecordPaymentRequest,
  UploadPaymentProofRequest,
  InvoiceType,
  PaymentMethod,
} from "./payments.types";

export class ValidationError extends Error {
  field: string;

  constructor(field: string, message: string) {
    super(message);
    this.field = field;
    this.name = "ValidationError";
  }
}

// Validasi Create Invoice
export function validateCreateInvoiceInput(data: CreateInvoiceRequest): void {
  // Tenancy ID (required)
  if (!data.tenancyId || data.tenancyId.trim() === "") {
    throw new ValidationError("tenancyId", "Tenancy ID wajib diisi");
  }

  // Invoice Type (required)
  if (!data.invoiceType || data.invoiceType.trim() === "") {
    throw new ValidationError("invoiceType", "Tipe invoice wajib diisi");
  }

  const validInvoiceTypes: InvoiceType[] = [
    "RENT",
    "PENALTY",
    "ELECTRICITY",
    "WATER",
    "OTHER",
  ];
  if (!validInvoiceTypes.includes(data.invoiceType as InvoiceType)) {
    throw new ValidationError(
      "invoiceType",
      "Tipe invoice harus salah satu dari: RENT, PENALTY, ELECTRICITY, WATER, OTHER",
    );
  }

  // Amount (required)
  if (!data.amount || data.amount.trim() === "") {
    throw new ValidationError("amount", "Jumlah tagihan wajib diisi");
  }

  const amountNum = parseFloat(data.amount);
  if (isNaN(amountNum) || amountNum <= 0) {
    throw new ValidationError(
      "amount",
      "Jumlah tagihan harus berupa angka positif",
    );
  }

  // Due Date (required)
  if (!data.dueDate || data.dueDate.trim() === "") {
    throw new ValidationError("dueDate", "Tanggal jatuh tempo wajib diisi");
  }

  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(data.dueDate)) {
    throw new ValidationError(
      "dueDate",
      "Format tanggal jatuh tempo harus YYYY-MM-DD",
    );
  }

  const dueDate = new Date(data.dueDate);
  if (isNaN(dueDate.getTime())) {
    throw new ValidationError("dueDate", "Tanggal jatuh tempo tidak valid");
  }

  // Billing Period Start (optional)
  if (data.billingPeriodStart) {
    if (!dateRegex.test(data.billingPeriodStart)) {
      throw new ValidationError(
        "billingPeriodStart",
        "Format tanggal periode tagihan harus YYYY-MM-DD",
      );
    }

    const periodStart = new Date(data.billingPeriodStart);
    if (isNaN(periodStart.getTime())) {
      throw new ValidationError(
        "billingPeriodStart",
        "Tanggal periode tagihan tidak valid",
      );
    }
  }

  // Billing Period End (optional)
  if (data.billingPeriodEnd) {
    if (!dateRegex.test(data.billingPeriodEnd)) {
      throw new ValidationError(
        "billingPeriodEnd",
        "Format tanggal akhir periode tagihan harus YYYY-MM-DD",
      );
    }

    const periodEnd = new Date(data.billingPeriodEnd);
    if (isNaN(periodEnd.getTime())) {
      throw new ValidationError(
        "billingPeriodEnd",
        "Tanggal akhir periode tagihan tidak valid",
      );
    }

    // Validasi periode end harus setelah start
    if (data.billingPeriodStart) {
      const periodStart = new Date(data.billingPeriodStart);
      if (periodEnd <= periodStart) {
        throw new ValidationError(
          "billingPeriodEnd",
          "Tanggal akhir periode harus setelah tanggal mulai periode",
        );
      }
    }
  }

  // Notes (optional)
  if (data.notes && data.notes.length > 500) {
    throw new ValidationError("notes", "Catatan maksimal 500 karakter");
  }
}

// Validasi Edit Invoice
export function validateEditInvoiceInput(data: EditInvoiceRequest): void {
  // Minimal satu field harus diisi
  if (
    !data.amount &&
    !data.dueDate &&
    !data.billingPeriodStart &&
    !data.billingPeriodEnd &&
    !data.notes
  ) {
    throw new ValidationError("general", "Minimal satu field harus diisi");
  }

  // Amount
  if (data.amount) {
    const amountNum = parseFloat(data.amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      throw new ValidationError(
        "amount",
        "Jumlah tagihan harus berupa angka positif",
      );
    }
  }

  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

  // Due Date
  if (data.dueDate) {
    if (!dateRegex.test(data.dueDate)) {
      throw new ValidationError(
        "dueDate",
        "Format tanggal jatuh tempo harus YYYY-MM-DD",
      );
    }

    const dueDate = new Date(data.dueDate);
    if (isNaN(dueDate.getTime())) {
      throw new ValidationError("dueDate", "Tanggal jatuh tempo tidak valid");
    }
  }

  // Billing Period Start
  if (data.billingPeriodStart) {
    if (!dateRegex.test(data.billingPeriodStart)) {
      throw new ValidationError(
        "billingPeriodStart",
        "Format tanggal periode tagihan harus YYYY-MM-DD",
      );
    }

    const periodStart = new Date(data.billingPeriodStart);
    if (isNaN(periodStart.getTime())) {
      throw new ValidationError(
        "billingPeriodStart",
        "Tanggal periode tagihan tidak valid",
      );
    }
  }

  // Billing Period End
  if (data.billingPeriodEnd) {
    if (!dateRegex.test(data.billingPeriodEnd)) {
      throw new ValidationError(
        "billingPeriodEnd",
        "Format tanggal akhir periode tagihan harus YYYY-MM-DD",
      );
    }

    const periodEnd = new Date(data.billingPeriodEnd);
    if (isNaN(periodEnd.getTime())) {
      throw new ValidationError(
        "billingPeriodEnd",
        "Tanggal akhir periode tagihan tidak valid",
      );
    }
  }

  // Notes
  if (data.notes && data.notes.length > 500) {
    throw new ValidationError("notes", "Catatan maksimal 500 karakter");
  }
}

// Validasi Record Payment
export function validateRecordPaymentInput(data: RecordPaymentRequest): void {
  // Amount (required)
  if (!data.amount || data.amount.trim() === "") {
    throw new ValidationError("amount", "Jumlah pembayaran wajib diisi");
  }

  const amountNum = parseFloat(data.amount);
  if (isNaN(amountNum) || amountNum <= 0) {
    throw new ValidationError(
      "amount",
      "Jumlah pembayaran harus berupa angka positif",
    );
  }

  // Payment Date (required)
  if (!data.paymentDate || data.paymentDate.trim() === "") {
    throw new ValidationError("paymentDate", "Tanggal pembayaran wajib diisi");
  }

  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(data.paymentDate)) {
    throw new ValidationError(
      "paymentDate",
      "Format tanggal pembayaran harus YYYY-MM-DD",
    );
  }

  const paymentDate = new Date(data.paymentDate);
  if (isNaN(paymentDate.getTime())) {
    throw new ValidationError("paymentDate", "Tanggal pembayaran tidak valid");
  }

  // Payment Method (required)
  if (!data.paymentMethod || data.paymentMethod.trim() === "") {
    throw new ValidationError("paymentMethod", "Metode pembayaran wajib diisi");
  }

  const validPaymentMethods: PaymentMethod[] = [
    "CASH",
    "BANK_TRANSFER",
    "E_WALLET",
    "CHECK",
    "OTHER",
  ];
  if (!validPaymentMethods.includes(data.paymentMethod as PaymentMethod)) {
    throw new ValidationError(
      "paymentMethod",
      "Metode pembayaran harus salah satu dari: CASH, BANK_TRANSFER, E_WALLET, CHECK, OTHER",
    );
  }

  // Notes (optional)
  if (data.notes && data.notes.length > 500) {
    throw new ValidationError("notes", "Catatan maksimal 500 karakter");
  }
}

// Validasi Upload Payment Proof
export function validateUploadPaymentProofInput(
  data: UploadPaymentProofRequest,
): void {
  // URL (required)
  if (!data.url || data.url.trim() === "") {
    throw new ValidationError("url", "URL file wajib diisi");
  }

  // File Type (required)
  if (!data.fileType || data.fileType.trim() === "") {
    throw new ValidationError("fileType", "Tipe file wajib diisi");
  }

  const validFileTypes = ["JPG", "PNG", "PDF"];
  if (!validFileTypes.includes(data.fileType)) {
    throw new ValidationError(
      "fileType",
      "Tipe file harus salah satu dari: JPG, PNG, PDF",
    );
  }
}
