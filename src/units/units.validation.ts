import {
  CreateUnitRequest,
  BulkCreateUnitRequest,
  EditUnitRequest,
  AssignTenantRequest,
  UpdateStatusRequest,
  unitStatusValues,
} from "./units.types";

export class ValidationError extends Error {
  field: string;

  constructor(field: string, message: string) {
    super(message);
    this.field = field;
    this.name = "ValidationError";
  }
}

export function validateCreateUnitInput(data: CreateUnitRequest): void {
  // Validasi propertyId (required)
  if (!data.propertyId || data.propertyId.trim() === "") {
    throw new ValidationError("propertyId", "Property ID wajib diisi");
  }

  // Validasi unitName (required)
  if (!data.unitName || data.unitName.trim() === "") {
    throw new ValidationError("unitName", "Nama unit wajib diisi");
  }

  if (data.unitName.length > 100) {
    throw new ValidationError("unitName", "Nama unit maksimal 100 karakter");
  }

  // Validasi price (required)
  if (!data.price || data.price.trim() === "") {
    throw new ValidationError("price", "Harga sewa wajib diisi");
  }

  const priceNum = parseFloat(data.price);
  if (isNaN(priceNum) || priceNum < 0) {
    throw new ValidationError("price", "Harga sewa harus berupa angka positif");
  }

  // Validasi optional fields
  if (data.floor && data.floor.length > 20) {
    throw new ValidationError("floor", "Lantai maksimal 20 karakter");
  }

  if (data.description && data.description.length > 1000) {
    throw new ValidationError(
      "description",
      "Deskripsi maksimal 1000 karakter",
    );
  }

  if (data.status !== undefined && !unitStatusValues.includes(data.status)) {
    throw new ValidationError(
      "status",
      `Status harus salah satu dari: ${unitStatusValues.join(", ")}`,
    );
  }
}

export function validateBulkCreateUnitInput(data: BulkCreateUnitRequest): void {
  // Validasi propertyId (required)
  if (!data.propertyId || data.propertyId.trim() === "") {
    throw new ValidationError("propertyId", "Property ID wajib diisi");
  }

  // Validasi prefix (required)
  if (!data.prefix || data.prefix.trim() === "") {
    throw new ValidationError("prefix", "Prefix unit wajib diisi");
  }

  if (data.prefix.length > 10) {
    throw new ValidationError("prefix", "Prefix maksimal 10 karakter");
  }

  // Validasi totalUnits (required)
  if (!data.totalUnits || data.totalUnits < 1) {
    throw new ValidationError("totalUnits", "Jumlah unit minimal 1");
  }

  if (data.totalUnits > 1000) {
    throw new ValidationError("totalUnits", "Jumlah unit maksimal 1000");
  }

  // Validasi price (required)
  if (!data.price || data.price.trim() === "") {
    throw new ValidationError("price", "Harga sewa wajib diisi");
  }

  const priceNum = parseFloat(data.price);
  if (isNaN(priceNum) || priceNum < 0) {
    throw new ValidationError("price", "Harga sewa harus berupa angka positif");
  }

  // Validasi startNumber (optional)
  if (data.startNumber !== undefined && data.startNumber < 1) {
    throw new ValidationError("startNumber", "Nomor awal minimal 1");
  }
}

export function validateEditUnitInput(data: EditUnitRequest): void {
  // Semua field optional, tapi jika ada harus valid

  if (data.unitName !== undefined) {
    if (data.unitName.trim() === "") {
      throw new ValidationError("unitName", "Nama unit tidak boleh kosong");
    }

    if (data.unitName.length > 100) {
      throw new ValidationError("unitName", "Nama unit maksimal 100 karakter");
    }
  }

  if (data.price !== undefined) {
    if (data.price.trim() === "") {
      throw new ValidationError("price", "Harga tidak boleh kosong");
    }

    const priceNum = parseFloat(data.price);
    if (isNaN(priceNum) || priceNum < 0) {
      throw new ValidationError(
        "price",
        "Harga sewa harus berupa angka positif",
      );
    }
  }

  if (data.floor && data.floor.length > 20) {
    throw new ValidationError("floor", "Lantai maksimal 20 karakter");
  }

  if (data.description && data.description.length > 1000) {
    throw new ValidationError(
      "description",
      "Deskripsi maksimal 1000 karakter",
    );
  }

  if (data.status !== undefined && !unitStatusValues.includes(data.status)) {
    throw new ValidationError(
      "status",
      `Status harus salah satu dari: ${unitStatusValues.join(", ")}`,
    );
  }
}

export function validateAssignTenantInput(data: AssignTenantRequest): void {
  // Validasi tenantId (required)
  if (!data.tenantId || data.tenantId.trim() === "") {
    throw new ValidationError("tenantId", "Tenant ID wajib diisi");
  }
}

export function validateUpdateStatusInput(data: UpdateStatusRequest): void {
  const validStatuses = ["VACANT", "OCCUPIED", "MAINTENANCE", "RESERVED"];

  if (!data.status || !validStatuses.includes(data.status)) {
    throw new ValidationError(
      "status",
      `Status harus salah satu dari: ${validStatuses.join(", ")}`,
    );
  }
}
