export type UnitStatus = "VACANT" | "OCCUPIED" | "MAINTENANCE" | "RESERVED";

export interface CreateUnitRequest {
  propertyId: string;
  unitName: string;
  price: string;
  floor?: string;
  description?: string;
}

export interface BulkCreateUnitRequest {
  propertyId: string;
  prefix: string;
  totalUnits: number;
  price: string;
  startNumber?: number;
}

export interface EditUnitRequest {
  unitName?: string;
  price?: string;
  floor?: string;
  description?: string;
}

export interface AssignTenantRequest {
  tenantId: string;
}

export interface UpdateStatusRequest {
  status: UnitStatus;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  errors?: any;
}

export interface Unit {
  id: string;
  propertyId: string;
  unitName: string;
  price: string;
  floor?: string | null;
  description?: string | null;
  status: UnitStatus;
  tenantId?: string | null;
  createdAt: Date | null;
  updatedAt: Date | null;
}

export interface UnitListItem extends Unit {
  propertyName?: string;
  tenantName?: string;
}

export interface UnitFilters {
  propertyId?: string;
  status?: UnitStatus;
  search?: string;
  page?: number;
  limit?: number;
}
