export type TenancyStatus = "ACTIVE" | "ENDED";
export type BillingCycle = "DAILY" | "WEEKLY" | "MONTHLY" | "YEARLY";
export type DocumentType = "KTP" | "PASSPORT" | "CONTRACT";

export interface CreateTenantRequest {
  fullName: string;
  phoneNumber: string;
  email?: string;
  identityNumber?: string;
  address?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  notes?: string;
}

export interface CreateTenancyRequest {
  tenantId: string;
  propertyId: string;
  unitId: string;
  startDate: string;
  endDate?: string;
  billingCycle: BillingCycle;
  billingAnchorDay?: number;
  rentPrice: string;
}

export interface EditTenantRequest {
  fullName?: string;
  phoneNumber?: string;
  email?: string;
  address?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  notes?: string;
  identityNumber?: string;
}

export interface EditTenancyRequest {
  billingCycle?: BillingCycle;
  billingAnchorDay?: number;
  rentPrice?: string;
  endDate?: string;
  unitId?: string;
  startDate?: string;
}

export interface EndTenancyRequest {
  endDate?: string;
}

export interface UploadDocumentRequest {
  type: DocumentType;
}

export interface GetTenantsQuery {
  propertyId?: string;
  status?: TenancyStatus;
  search?: string;
  page?: string;
  limit?: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  errors?: any;
}

export interface Tenant {
  id: string;
  fullName: string;
  phoneNumber: string;
  email?: string | null;
  identityNumber?: string | null;
  address?: string | null;
  emergencyContactName?: string | null;
  emergencyContactPhone?: string | null;
  notes?: string | null;
  createdBy: string;
  createdAt: Date | null;
  updatedAt: Date | null;
}

export interface Tenancy {
  id: string;
  tenantId: string;
  propertyId: string;
  unitId: string;
  startDate: string;
  endDate?: string | null;
  billingCycle: BillingCycle;
  billingAnchorDay?: number | null;
  rentPrice: string;
  status: TenancyStatus;
  createdAt: Date | null;
  updatedAt: Date | null;
}

export interface TenantDocument {
  id: string;
  tenancyId: string;
  type: DocumentType;
  url: string;
  uploadedBy: string;
  uploadedAt: Date | null;
}

export interface TenantListItem {
  id: string;
  tenantId: string;
  fullName: string;
  phoneNumber: string;
  propertyName: string | null;
  unitName: string;
  billingCycle: BillingCycle;
  startDate: string;
  endDate: string | null;
  status: TenancyStatus;
  createdAt: string;
}

export interface TenantDetail {
  tenant: Tenant;
  tenancy: Tenancy & {
    propertyName: string;
    unitName: string;
  };
  documents: TenantDocument[];
}

// View All: Tenancy with property & unit names
export interface TenancyWithNames extends Tenancy {
  propertyName: string;
  unitName: string;
}

// View All: Tenant with all related data
export interface ViewAllTenant {
  tenant: Tenant;
  tenancies: TenancyWithNames[];
  documents: TenantDocument[];
}

// View All Response: Multiple tenants
export interface ViewAllResponse {
  tenants: ViewAllTenant[];
}
