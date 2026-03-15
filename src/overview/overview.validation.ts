import {
  GetDashboardSummaryQuery,
  GetRecentActivityQuery,
  GetAvailableUnitsQuery,
  GetOverduePaymentsQuery,
  GetRevenueReportQuery,
  GetOccupancyReportQuery,
  GetTenantReportQuery,
  GetVacancyReportQuery,
  GetOutstandingPaymentReportQuery,
  GetPropertyPerformanceQuery,
} from "./overview.types";

export class ValidationError extends Error {
  field: string;

  constructor(field: string, message: string) {
    super(message);
    this.field = field;
    this.name = "ValidationError";
  }
}

// Dashboard Summary Validation
export function validateGetDashboardSummaryQuery(
  data: GetDashboardSummaryQuery,
): void {
  // propertyId is optional
}

// Recent Activity Validation
export function validateGetRecentActivityQuery(
  data: GetRecentActivityQuery,
): void {
  if (data.limit) {
    const limit = parseInt(data.limit);
    if (isNaN(limit) || limit <= 0 || limit > 100) {
      throw new ValidationError(
        "limit",
        "Limit harus angka positif antara 1-100",
      );
    }
  }
}

// Available Units Validation
export function validateGetAvailableUnitsQuery(
  data: GetAvailableUnitsQuery,
): void {
  if (data.limit) {
    const limit = parseInt(data.limit);
    if (isNaN(limit) || limit <= 0 || limit > 100) {
      throw new ValidationError(
        "limit",
        "Limit harus angka positif antara 1-100",
      );
    }
  }
}

// Overdue Payments Validation
export function validateGetOverduePaymentsQuery(
  data: GetOverduePaymentsQuery,
): void {
  if (data.limit) {
    const limit = parseInt(data.limit);
    if (isNaN(limit) || limit <= 0 || limit > 100) {
      throw new ValidationError(
        "limit",
        "Limit harus angka positif antara 1-100",
      );
    }
  }

  if (data.daysOverdue) {
    const days = parseInt(data.daysOverdue);
    if (isNaN(days) || days < 0) {
      throw new ValidationError(
        "daysOverdue",
        "Days overdue harus angka positif",
      );
    }
  }
}

// Revenue Report Validation
export function validateGetRevenueReportQuery(
  data: GetRevenueReportQuery,
): void {
  // Start date (required)
  if (!data.startDate || data.startDate.trim() === "") {
    throw new ValidationError("startDate", "Start date wajib diisi");
  }

  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(data.startDate)) {
    throw new ValidationError(
      "startDate",
      "Format start date harus YYYY-MM-DD",
    );
  }

  const startDate = new Date(data.startDate);
  if (isNaN(startDate.getTime())) {
    throw new ValidationError("startDate", "Start date tidak valid");
  }

  // End date (required)
  if (!data.endDate || data.endDate.trim() === "") {
    throw new ValidationError("endDate", "End date wajib diisi");
  }

  if (!dateRegex.test(data.endDate)) {
    throw new ValidationError("endDate", "Format end date harus YYYY-MM-DD");
  }

  const endDate = new Date(data.endDate);
  if (isNaN(endDate.getTime())) {
    throw new ValidationError("endDate", "End date tidak valid");
  }

  if (endDate < startDate) {
    throw new ValidationError(
      "endDate",
      "End date tidak boleh lebih kecil dari start date",
    );
  }

  // Group by (optional)
  if (data.groupBy) {
    const validGroupBy = ["MONTH", "PROPERTY", "UNIT"];
    if (!validGroupBy.includes(data.groupBy)) {
      throw new ValidationError(
        "groupBy",
        "Group by harus salah satu dari: MONTH, PROPERTY, UNIT",
      );
    }
  }

  // Page & Limit
  if (data.page) {
    const page = parseInt(data.page);
    if (isNaN(page) || page <= 0) {
      throw new ValidationError("page", "Page harus angka positif");
    }
  }

  if (data.limit) {
    const limit = parseInt(data.limit);
    if (isNaN(limit) || limit <= 0 || limit > 100) {
      throw new ValidationError(
        "limit",
        "Limit harus angka positif antara 1-100",
      );
    }
  }
}

// Occupancy Report Validation
export function validateGetOccupancyReportQuery(
  data: GetOccupancyReportQuery,
): void {
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

  if (data.startDate) {
    if (!dateRegex.test(data.startDate)) {
      throw new ValidationError(
        "startDate",
        "Format start date harus YYYY-MM-DD",
      );
    }

    const startDate = new Date(data.startDate);
    if (isNaN(startDate.getTime())) {
      throw new ValidationError("startDate", "Start date tidak valid");
    }
  }

  if (data.endDate) {
    if (!dateRegex.test(data.endDate)) {
      throw new ValidationError("endDate", "Format end date harus YYYY-MM-DD");
    }

    const endDate = new Date(data.endDate);
    if (isNaN(endDate.getTime())) {
      throw new ValidationError("endDate", "End date tidak valid");
    }
  }

  if (data.startDate && data.endDate) {
    const startDate = new Date(data.startDate);
    const endDate = new Date(data.endDate);
    if (endDate < startDate) {
      throw new ValidationError(
        "endDate",
        "End date tidak boleh lebih kecil dari start date",
      );
    }
  }
}

// Tenant Report Validation
export function validateGetTenantReportQuery(data: GetTenantReportQuery): void {
  if (data.status) {
    const validStatus = ["ACTIVE", "EXPIRED"];
    if (!validStatus.includes(data.status)) {
      throw new ValidationError(
        "status",
        "Status harus salah satu dari: ACTIVE, EXPIRED",
      );
    }
  }

  if (data.page) {
    const page = parseInt(data.page);
    if (isNaN(page) || page <= 0) {
      throw new ValidationError("page", "Page harus angka positif");
    }
  }

  if (data.limit) {
    const limit = parseInt(data.limit);
    if (isNaN(limit) || limit <= 0 || limit > 100) {
      throw new ValidationError(
        "limit",
        "Limit harus angka positif antara 1-100",
      );
    }
  }
}

// Vacancy Report Validation
export function validateGetVacancyReportQuery(
  data: GetVacancyReportQuery,
): void {
  if (data.vacantDays) {
    const days = parseInt(data.vacantDays);
    if (isNaN(days) || days < 0) {
      throw new ValidationError(
        "vacantDays",
        "Vacant days harus angka positif",
      );
    }
  }

  if (data.page) {
    const page = parseInt(data.page);
    if (isNaN(page) || page <= 0) {
      throw new ValidationError("page", "Page harus angka positif");
    }
  }

  if (data.limit) {
    const limit = parseInt(data.limit);
    if (isNaN(limit) || limit <= 0 || limit > 100) {
      throw new ValidationError(
        "limit",
        "Limit harus angka positif antara 1-100",
      );
    }
  }
}

// Outstanding Payment Report Validation
export function validateGetOutstandingPaymentReportQuery(
  data: GetOutstandingPaymentReportQuery,
): void {
  if (data.status) {
    const validStatus = ["UNPAID", "OVERDUE", "ALL"];
    if (!validStatus.includes(data.status)) {
      throw new ValidationError(
        "status",
        "Status harus salah satu dari: UNPAID, OVERDUE, ALL",
      );
    }
  }

  if (data.page) {
    const page = parseInt(data.page);
    if (isNaN(page) || page <= 0) {
      throw new ValidationError("page", "Page harus angka positif");
    }
  }

  if (data.limit) {
    const limit = parseInt(data.limit);
    if (isNaN(limit) || limit <= 0 || limit > 100) {
      throw new ValidationError(
        "limit",
        "Limit harus angka positif antara 1-100",
      );
    }
  }
}

// Property Performance Validation
export function validateGetPropertyPerformanceQuery(
  data: GetPropertyPerformanceQuery,
): void {
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

  if (data.startDate) {
    if (!dateRegex.test(data.startDate)) {
      throw new ValidationError(
        "startDate",
        "Format start date harus YYYY-MM-DD",
      );
    }

    const startDate = new Date(data.startDate);
    if (isNaN(startDate.getTime())) {
      throw new ValidationError("startDate", "Start date tidak valid");
    }
  }

  if (data.endDate) {
    if (!dateRegex.test(data.endDate)) {
      throw new ValidationError("endDate", "Format end date harus YYYY-MM-DD");
    }

    const endDate = new Date(data.endDate);
    if (isNaN(endDate.getTime())) {
      throw new ValidationError("endDate", "End date tidak valid");
    }
  }

  if (data.startDate && data.endDate) {
    const startDate = new Date(data.startDate);
    const endDate = new Date(data.endDate);
    if (endDate < startDate) {
      throw new ValidationError(
        "endDate",
        "End date tidak boleh lebih kecil dari start date",
      );
    }
  }
}
