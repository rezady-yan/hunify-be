import { AddPropertyRequest, EditPropertyRequest } from "./properties.types";

export class ValidationError extends Error {
  field: string;

  constructor(field: string, message: string) {
    super(message);
    this.field = field;
    this.name = "ValidationError";
  }
}

export function validateAddPropertyInput(data: AddPropertyRequest): void {
  // Validasi nama property (required)
  if (!data.name || data.name.trim() === "") {
    throw new ValidationError("name", "Nama property wajib diisi");
  }

  if (data.name.length < 3) {
    throw new ValidationError(
      "name",
      "Nama property minimal 3 karakter",
    );
  }

  if (data.name.length > 150) {
    throw new ValidationError(
      "name",
      "Nama property maksimal 150 karakter",
    );
  }

  // Validasi alamat (required)
  if (!data.address || data.address.trim() === "") {
    throw new ValidationError("address", "Alamat property wajib diisi");
  }

  if (data.address.length < 5) {
    throw new ValidationError(
      "address",
      "Alamat property minimal 5 karakter",
    );
  }

  if (data.address.length > 500) {
    throw new ValidationError(
      "address",
      "Alamat property maksimal 500 karakter",
    );
  }

  // Validasi typeProperties (required)
  if (!data.typeProperties || data.typeProperties.trim() === "") {
    throw new ValidationError("typeProperties", "Tipe property wajib diisi");
  }

  if (data.typeProperties.length > 50) {
    throw new ValidationError(
      "typeProperties",
      "Tipe property maksimal 50 karakter",
    );
  }

  // Validasi optional fields
  if (data.city && data.city.length > 100) {
    throw new ValidationError("city", "Nama kota maksimal 100 karakter");
  }

  if (data.province && data.province.length > 100) {
    throw new ValidationError("province", "Nama provinsi maksimal 100 karakter");
  }

  if (data.postalCode && data.postalCode.length > 20) {
    throw new ValidationError("postalCode", "Kode pos maksimal 20 karakter");
  }

  if (data.country && data.country.length > 100) {
    throw new ValidationError("country", "Nama negara maksimal 100 karakter");
  }

  if (data.description && data.description.length > 1000) {
    throw new ValidationError(
      "description",
      "Deskripsi maksimal 1000 karakter",
    );
  }

  if (data.thumbnailUrl && data.thumbnailUrl.length > 500) {
    throw new ValidationError(
      "thumbnailUrl",
      "URL thumbnail maksimal 500 karakter",
    );
  }

  // Validasi totalFloors dan totalUnits (harus angka jika diisi)
  if (data.totalFloors) {
    const floors = parseInt(data.totalFloors);
    if (isNaN(floors) || floors < 1) {
      throw new ValidationError(
        "totalFloors",
        "Jumlah lantai harus berupa angka positif",
      );
    }
  }

  if (data.totalUnits) {
    const units = parseInt(data.totalUnits);
    if (isNaN(units) || units < 0) {
      throw new ValidationError(
        "totalUnits",
        "Jumlah unit harus berupa angka positif atau 0",
      );
    }
  }
}

export function validateEditPropertyInput(data: EditPropertyRequest): void {
  // Untuk edit, semua field optional, tapi jika ada harus valid

  if (data.name !== undefined) {
    if (data.name.trim() === "") {
      throw new ValidationError("name", "Nama property tidak boleh kosong");
    }

    if (data.name.length < 3) {
      throw new ValidationError(
        "name",
        "Nama property minimal 3 karakter",
      );
    }

    if (data.name.length > 150) {
      throw new ValidationError(
        "name",
        "Nama property maksimal 150 karakter",
      );
    }
  }

  if (data.address !== undefined) {
    if (data.address.trim() === "") {
      throw new ValidationError("address", "Alamat tidak boleh kosong");
    }

    if (data.address.length < 5) {
      throw new ValidationError(
        "address",
        "Alamat minimal 5 karakter",
      );
    }

    if (data.address.length > 500) {
      throw new ValidationError(
        "address",
        "Alamat maksimal 500 karakter",
      );
    }
  }

  if (data.typeProperties !== undefined) {
    if (data.typeProperties.trim() === "") {
      throw new ValidationError("typeProperties", "Tipe property tidak boleh kosong");
    }

    if (data.typeProperties.length > 50) {
      throw new ValidationError(
        "typeProperties",
        "Tipe property maksimal 50 karakter",
      );
    }
  }

  if (data.city && data.city.length > 100) {
    throw new ValidationError("city", "Nama kota maksimal 100 karakter");
  }

  if (data.province && data.province.length > 100) {
    throw new ValidationError("province", "Nama provinsi maksimal 100 karakter");
  }

  if (data.postalCode && data.postalCode.length > 20) {
    throw new ValidationError("postalCode", "Kode pos maksimal 20 karakter");
  }

  if (data.country && data.country.length > 100) {
    throw new ValidationError("country", "Nama negara maksimal 100 karakter");
  }

  if (data.description && data.description.length > 1000) {
    throw new ValidationError(
      "description",
      "Deskripsi maksimal 1000 karakter",
    );
  }

  if (data.thumbnailUrl && data.thumbnailUrl.length > 500) {
    throw new ValidationError(
      "thumbnailUrl",
      "URL thumbnail maksimal 500 karakter",
    );
  }

  if (data.totalFloors) {
    const floors = parseInt(data.totalFloors);
    if (isNaN(floors) || floors < 1) {
      throw new ValidationError(
        "totalFloors",
        "Jumlah lantai harus berupa angka positif",
      );
    }
  }

  if (data.totalUnits) {
    const units = parseInt(data.totalUnits);
    if (isNaN(units) || units < 0) {
      throw new ValidationError(
        "totalUnits",
        "Jumlah unit harus berupa angka positif atau 0",
      );
    }
  }
}
