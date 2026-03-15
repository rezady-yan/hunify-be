// Dashboard Metrics Types
export interface DashboardMetrics {
  totalProperties: number;
  totalUnits: number;
  availableUnits: number;
  occupancyRate: number;
  revenueThisMonth: string;
  outstandingPayment: string;
}

export interface DashboardSummary {
  metrics: DashboardMetrics;
  summary: {
    occupiedUnits: number;
    vacantUnits: number;
    paidInvoices: number;
    unpaidInvoices: number;
    overdueInvoices: number;
    activeTenantsCount: number;
  };
}

// Recent Activity Types
export type ActivityType =
  | "TENANT_CREATED"
  | "PAYMENT_RECORDED"
  | "INVOICE_CREATED"
  | "TENANCY_ENDED";

export interface Activity {
  id: string;
  type: ActivityType;
  title: string;
  description: string;
  icon: string;
  color: string;
  timestamp: string;
  relatedId: string | null;
}

export interface RecentActivityResponse {
  activities: Activity[];
}

// Available Units Widget Types
export interface AvailableUnit {
  id: string;
  propertyId: string;
  propertyName: string;
  unitId: string;
  unitName: string;
  unitType: string;
  status: string;
  price: string | null;
  lastTenancyEndDate: string | null;
  createdAt: string;
}

export interface AvailableUnitsResponse {
  units: AvailableUnit[];
  totalAvailable: number;
  pagination?: {
    page: number;
    limit: number;
    totalPages: number;
    totalItems: number;
  };
}

// Overdue Payments Widget Types
export interface OverdueInvoice {
  id: string;
  invoiceNumber: string;
  tenantName: string;
  propertyName: string;
  unitName: string;
  amount: string;
  dueDate: string;
  daysOverdue: number;
  status: string;
}

export interface OverduePaymentsResponse {
  invoices: OverdueInvoice[];
  totalOverdueAmount: string;
  totalCount: number;
  pagination?: {
    page: number;
    limit: number;
    totalPages: number;
    totalItems: number;
  };
}

// Revenue Report Types
export interface RevenueReportItem {
  period: string;
  totalRevenue: string;
  totalInvoices: number;
  paidInvoices: number;
  collectionRate: number;
  details: RevenueDetail[] | null;
}

export interface RevenueDetail {
  name: string;
  revenue: string;
  invoiceCount: number;
}

export interface RevenueReportResponse {
  report: RevenueReportItem[];
  summary: {
    totalRevenue: string;
    totalInvoices: number;
    averageCollectionRate: number;
    period: {
      startDate: string;
      endDate: string;
    };
  };
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Occupancy Report Types
export interface OccupancySummary {
  totalUnits: number;
  occupiedUnits: number;
  vacantUnits: number;
  occupancyRate: number;
  vacancyRate: number;
}

export interface PropertyOccupancy {
  propertyId: string;
  propertyName: string;
  totalUnits: number;
  occupiedUnits: number;
  vacantUnits: number;
  occupancyRate: number;
}

export interface OccupancyTimeline {
  date: string;
  occupancyRate: number;
  occupiedUnits: number;
  vacantUnits: number;
}

export interface OccupancyReportResponse {
  summary: OccupancySummary;
  byProperty: PropertyOccupancy[];
  timeline: OccupancyTimeline[] | null;
}

// Tenant Report Types
export interface TenantReportItem {
  id: string;
  tenantId: string;
  tenantName: string;
  phoneNumber: string;
  propertyName: string;
  unitName: string;
  startDate: string;
  endDate: string | null;
  status: string;
  rentPrice: string;
  billingCycle: string;
}

export interface TenantReportResponse {
  tenants: TenantReportItem[];
  summary: {
    totalTenants: number;
    activeTenants: number;
    expiredTenants: number;
  };
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Vacancy Report Types
export interface VacancyReportItem {
  id: string;
  propertyId: string;
  propertyName: string;
  unitId: string;
  unitName: string;
  unitType: string;
  price: string | null;
  lastOccupancyEndDate: string | null;
  daysSinceVacant: number;
  status: string;
}

export interface VacancyReportResponse {
  units: VacancyReportItem[];
  summary: {
    totalVacantUnits: number;
    averageDaysVacant: number;
    unitsVacantOver30Days: number;
    unitsVacantOver60Days: number;
  };
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Outstanding Payment Report Types
export interface OutstandingInvoiceItem {
  id: string;
  invoiceNumber: string;
  tenantName: string;
  propertyName: string;
  unitName: string;
  amount: string;
  dueDate: string;
  status: string;
  daysOverdue: number | null;
  createdAt: string;
}

export interface OutstandingPaymentReportResponse {
  invoices: OutstandingInvoiceItem[];
  summary: {
    totalInvoices: number;
    totalAmount: string;
    unpaidCount: number;
    unpaidAmount: string;
    overdueCount: number;
    overdueAmount: string;
    averageDaysOverdue: number;
  };
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Property Performance Types
export interface PropertyMetricsNew {
  id: string;
  name: string;
  metrics: {
    totalUnits: number;
    occupiedUnits: number;
    vacantUnits: number;
    occupancyRate: number;
  };
  financials: {
    revenueCollected: string;
    outstanding: string;
  };
  invoiceStats: {
    paidInvoices: number;
    unpaidInvoices: number;
    overdueInvoices: number;
  };
  activeTenants: number;
}

export interface PropertyPerformanceResponse {
  data: PropertyMetricsNew[];
  page: number;
  limit: number;
  totalPages: number;
  totalItems: number;
}

// Query Types
export interface GetDashboardSummaryQuery {
  propertyId?: string;
}

export interface GetRecentActivityQuery {
  limit?: string;
  propertyId?: string;
}

export interface GetAvailableUnitsQuery {
  propertyId?: string;
  limit?: string;
  page?: string;
}

export interface GetOverduePaymentsQuery {
  propertyId?: string;
  limit?: string;
  page?: string;
  daysOverdue?: string;
}

export interface GetRevenueReportQuery {
  startDate: string;
  endDate: string;
  propertyId?: string;
  groupBy?: "MONTH" | "PROPERTY" | "UNIT";
  page?: string;
  limit?: string;
}

export interface GetOccupancyReportQuery {
  startDate?: string;
  endDate?: string;
  propertyId?: string;
}

export interface GetTenantReportQuery {
  status?: "ACTIVE" | "EXPIRED";
  propertyId?: string;
  search?: string;
  page?: string;
  limit?: string;
}

export interface GetVacancyReportQuery {
  propertyId?: string;
  vacantDays?: string;
  page?: string;
  limit?: string;
}

export interface GetOutstandingPaymentReportQuery {
  propertyId?: string;
  status?: "UNPAID" | "OVERDUE" | "ALL";
  page?: string;
  limit?: string;
}

export interface GetPropertyPerformanceQuery {
  startDate?: string;
  endDate?: string;
  propertyId?: string;
  page?: number;
  limit?: number;
}
