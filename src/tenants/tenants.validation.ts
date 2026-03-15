import {
  CreateTenantRequest,
  CreateTenancyRequest,
  EditTenantRequest,
  EditTenancyRequest,
  EndTenancyRequest,
  UploadDocumentRequest,
  BillingCycle,
  DocumentType,
} from "./tenants.types";

export class ValidationError extends Error {
  field: string;

  constructor(field: string, message: string) {
    super(message);
    this.field = field;
    this.name = "ValidationError";
  }
}

// Validasi Create Tenant
export function validateCreateTenantInput(data: CreateTenantRequest): void {
  // Full Name (required)
  if (!data.fullName || data.fullName.trim() === "") {
    throw new ValidationError("fullName", "Nama lengkap wajib diisi");
  }

  if (data.fullName.length > 100) {
    throw new ValidationError("fullName", "Nama lengkap maksimal 100 karakter");
  }

  // Phone Number (required)
  if (!data.phoneNumber || data.phoneNumber.trim() === "") {
    throw new ValidationError("phoneNumber", "Nomor telepon wajib diisi");
  }

  // Validasi format nomor telepon Indonesia (08xxx atau +62xxx)
  const phoneRegex = /^(\+62|62|0)[0-9]{9,13}$/;
  if (!phoneRegex.test(data.phoneNumber.replace(/[\s-]/g, ""))) {
    throw new ValidationError(
      "phoneNumber",
      "Format nomor telepon tidak valid",
    );
  }

  // Email (optional)
  if (data.email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      throw new ValidationError("email", "Format email tidak valid");
    }
  }

  // Identity Number (optional)
  if (data.identityNumber && data.identityNumber.length > 20) {
    throw new ValidationError(
      "identityNumber",
      "Nomor identitas maksimal 20 karakter",
    );
  }

  // Address (optional)
  if (data.address && data.address.length > 500) {
    throw new ValidationError("address", "Alamat maksimal 500 karakter");
  }

  // Emergency Contact Name (optional)
  if (data.emergencyContactName && data.emergencyContactName.length > 100) {
    throw new ValidationError(
      "emergencyContactName",
      "Nama kontak darurat maksimal 100 karakter",
    );
  }

  // Emergency Contact Phone (optional)
  if (
    data.emergencyContactPhone &&
    !phoneRegex.test(data.emergencyContactPhone.replace(/[\s-]/g, ""))
  ) {
    throw new ValidationError(
      "emergencyContactPhone",
      "Format nomor kontak darurat tidak valid",
    );
  }

  // Notes (optional)
  if (data.notes && data.notes.length > 1000) {
    throw new ValidationError("notes", "Catatan maksimal 1000 karakter");
  }
}

// Validasi Create Tenancy
export function validateCreateTenancyInput(data: CreateTenancyRequest): void {
  // Tenant ID (required)
  if (!data.tenantId || data.tenantId.trim() === "") {
    throw new ValidationError("tenantId", "Tenant ID wajib diisi");
  }

  // Property ID (required)
  if (!data.propertyId || data.propertyId.trim() === "") {
    throw new ValidationError("propertyId", "Property ID wajib diisi");
  }

  // Unit ID (required)
  if (!data.unitId || data.unitId.trim() === "") {
    throw new ValidationError("unitId", "Unit ID wajib diisi");
  }

  // Start Date (required)
  if (!data.startDate || data.startDate.trim() === "") {
    throw new ValidationError("startDate", "Tanggal mulai wajib diisi");
  }

  // Validasi format tanggal (YYYY-MM-DD)
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(data.startDate)) {
    throw new ValidationError(
      "startDate",
      "Format tanggal mulai harus YYYY-MM-DD",
    );
  }

  const startDate = new Date(data.startDate);
  if (isNaN(startDate.getTime())) {
    throw new ValidationError("startDate", "Tanggal mulai tidak valid");
  }

  // End Date (optional)
  if (data.endDate) {
    if (!dateRegex.test(data.endDate)) {
      throw new ValidationError(
        "endDate",
        "Format tanggal selesai harus YYYY-MM-DD",
      );
    }

    const endDate = new Date(data.endDate);
    if (isNaN(endDate.getTime())) {
      throw new ValidationError("endDate", "Tanggal selesai tidak valid");
    }

    // Validasi endDate harus setelah startDate
    if (endDate <= startDate) {
      throw new ValidationError(
        "endDate",
        "Tanggal selesai harus setelah tanggal mulai",
      );
    }
  }

  // Billing Cycle (required)
  if (!data.billingCycle || data.billingCycle.trim() === "") {
    throw new ValidationError("billingCycle", "Siklus billing wajib diisi");
  }

  const validBillingCycles: BillingCycle[] = [
    "DAILY",
    "WEEKLY",
    "MONTHLY",
    "YEARLY",
  ];
  if (!validBillingCycles.includes(data.billingCycle as BillingCycle)) {
    throw new ValidationError(
      "billingCycle",
      "Siklus billing harus salah satu dari: DAILY, WEEKLY, MONTHLY, YEARLY",
    );
  }

  // Billing Anchor Day (optional)
  if (data.billingAnchorDay !== undefined) {
    if (data.billingAnchorDay < 1 || data.billingAnchorDay > 31) {
      throw new ValidationError(
        "billingAnchorDay",
        "Hari billing anchor harus antara 1-31",
      );
    }
  }

  // Rent Price (required)
  if (!data.rentPrice || data.rentPrice.trim() === "") {
    throw new ValidationError("rentPrice", "Harga sewa wajib diisi");
  }

  const priceNum = parseFloat(data.rentPrice);
  if (isNaN(priceNum) || priceNum < 0) {
    throw new ValidationError(
      "rentPrice",
      "Harga sewa harus berupa angka positif",
    );
  }
}

// Validasi Edit Tenant
export function validateEditTenantInput(data: EditTenantRequest): void {
  // Minimal satu field harus diisi
  if (
    !data.phoneNumber &&
    !data.email &&
    !data.address &&
    !data.emergencyContactName &&
    !data.emergencyContactPhone &&
    !data.notes
  ) {
    throw new ValidationError("general", "Minimal satu field harus diisi");
  }

  // Phone Number
  if (data.phoneNumber) {
    const phoneRegex = /^(\+62|62|0)[0-9]{9,13}$/;
    if (!phoneRegex.test(data.phoneNumber.replace(/[\s-]/g, ""))) {
      throw new ValidationError(
        "phoneNumber",
        "Format nomor telepon tidak valid",
      );
    }
  }

  // Email
  if (data.email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      throw new ValidationError("email", "Format email tidak valid");
    }
  }

  // Address
  if (data.address && data.address.length > 500) {
    throw new ValidationError("address", "Alamat maksimal 500 karakter");
  }

  // Emergency Contact Name
  if (data.emergencyContactName && data.emergencyContactName.length > 100) {
    throw new ValidationError(
      "emergencyContactName",
      "Nama kontak darurat maksimal 100 karakter",
    );
  }

  // Emergency Contact Phone
  if (data.emergencyContactPhone) {
    const phoneRegex = /^(\+62|62|0)[0-9]{9,13}$/;
    if (!phoneRegex.test(data.emergencyContactPhone.replace(/[\s-]/g, ""))) {
      throw new ValidationError(
        "emergencyContactPhone",
        "Format nomor kontak darurat tidak valid",
      );
    }
  }

  // Notes
  if (data.notes && data.notes.length > 1000) {
    throw new ValidationError("notes", "Catatan maksimal 1000 karakter");
  }
}

// Validasi Edit Tenancy
export function validateEditTenancyInput(data: EditTenancyRequest): void {
  // Minimal satu field harus diisi
  if (
    !data.billingCycle &&
    data.billingAnchorDay === undefined &&
    !data.rentPrice &&
    !data.endDate
  ) {
    throw new ValidationError("general", "Minimal satu field harus diisi");
  }

  // Billing Cycle
  if (data.billingCycle) {
    const validBillingCycles: BillingCycle[] = [
      "DAILY",
      "WEEKLY",
      "MONTHLY",
      "YEARLY",
    ];
    if (!validBillingCycles.includes(data.billingCycle as BillingCycle)) {
      throw new ValidationError(
        "billingCycle",
        "Siklus billing harus salah satu dari: DAILY, WEEKLY, MONTHLY, YEARLY",
      );
    }
  }

  // Billing Anchor Day
  if (data.billingAnchorDay !== undefined) {
    if (data.billingAnchorDay < 1 || data.billingAnchorDay > 31) {
      throw new ValidationError(
        "billingAnchorDay",
        "Hari billing anchor harus antara 1-31",
      );
    }
  }

  // Rent Price
  if (data.rentPrice) {
    const priceNum = parseFloat(data.rentPrice);
    if (isNaN(priceNum) || priceNum < 0) {
      throw new ValidationError(
        "rentPrice",
        "Harga sewa harus berupa angka positif",
      );
    }
  }

  // End Date
  if (data.endDate) {
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(data.endDate)) {
      throw new ValidationError(
        "endDate",
        "Format tanggal selesai harus YYYY-MM-DD",
      );
    }

    const endDate = new Date(data.endDate);
    if (isNaN(endDate.getTime())) {
      throw new ValidationError("endDate", "Tanggal selesai tidak valid");
    }
  }
}

// Validasi End Tenancy
export function validateEndTenancyInput(data: EndTenancyRequest): void {
  if (data.endDate) {
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(data.endDate)) {
      throw new ValidationError(
        "endDate",
        "Format tanggal selesai harus YYYY-MM-DD",
      );
    }

    const endDate = new Date(data.endDate);
    if (isNaN(endDate.getTime())) {
      throw new ValidationError("endDate", "Tanggal selesai tidak valid");
    }
  }
}

// Validasi Upload Document
export function validateUploadDocumentInput(data: UploadDocumentRequest): void {
  if (!data.type || data.type.trim() === "") {
    throw new ValidationError("type", "Tipe dokumen wajib diisi");
  }

  const validTypes: DocumentType[] = ["KTP", "PASSPORT", "CONTRACT"];
  if (!validTypes.includes(data.type as DocumentType)) {
    throw new ValidationError(
      "type",
      "Tipe dokumen harus salah satu dari: KTP, PASSPORT, CONTRACT",
    );
  }
}
