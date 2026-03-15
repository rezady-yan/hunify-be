import { t } from "elysia";

export const overviewSwaggerSchemas = {
  getDashboardSummary: {
    detail: {
      tags: ["Overview"],
      summary: "Get dashboard summary",
      description: "Get main dashboard metrics and KPIs (Owner only)",
      security: [{ bearerAuth: [] }],
    },
    query: t.Optional(
      t.Object({
        propertyId: t.Optional(
          t.String({
            description: "Filter by property (optional, all if not provided)",
          }),
        ),
      }),
    ),
  },

  getRecentActivity: {
    detail: {
      tags: ["Overview"],
      summary: "Get recent activity",
      description:
        "Get latest activities (new tenants, payments, invoices) (Owner only)",
      security: [{ bearerAuth: [] }],
    },
    query: t.Optional(
      t.Object({
        limit: t.Optional(
          t.String({
            description: "Number of activities (default: 10, max: 100)",
            examples: ["10"],
          }),
        ),
        propertyId: t.Optional(t.String({ description: "Filter by property" })),
      }),
    ),
  },

  getAvailableUnits: {
    detail: {
      tags: ["Overview"],
      summary: "Get available units widget",
      description: "Get list of vacant units available for rent (Owner only)",
      security: [{ bearerAuth: [] }],
    },
    query: t.Optional(
      t.Object({
        propertyId: t.Optional(t.String({ description: "Filter by property" })),
        limit: t.Optional(
          t.String({ description: "Limit results (default: 5, max: 100)" }),
        ),
      }),
    ),
  },

  getOverduePayments: {
    detail: {
      tags: ["Overview"],
      summary: "Get overdue payments widget",
      description: "Get list of overdue invoices for follow-up (Owner only)",
      security: [{ bearerAuth: [] }],
    },
    query: t.Optional(
      t.Object({
        propertyId: t.Optional(t.String({ description: "Filter by property" })),
        limit: t.Optional(
          t.String({ description: "Limit results (default: 5, max: 100)" }),
        ),
        daysOverdue: t.Optional(
          t.String({
            description: "Filter by minimum days overdue",
            examples: ["7"],
          }),
        ),
      }),
    ),
  },

  getRevenueReport: {
    detail: {
      tags: ["Overview"],
      summary: "Get revenue report",
      description:
        "Get detailed revenue report (monthly, by property, by unit) (Owner only)",
      security: [{ bearerAuth: [] }],
    },
    query: t.Object({
      startDate: t.String({
        description: "Start date (YYYY-MM-DD)",
        examples: ["2026-01-01"],
      }),
      endDate: t.String({
        description: "End date (YYYY-MM-DD)",
        examples: ["2026-02-28"],
      }),
      propertyId: t.Optional(t.String({ description: "Filter by property" })),
      groupBy: t.Optional(
        t.String({
          description: "Group by (MONTH, PROPERTY, UNIT)",
          examples: ["MONTH"],
        }),
      ),
      page: t.Optional(t.String({ description: "Page number (default: 1)" })),
      limit: t.Optional(
        t.String({ description: "Items per page (default: 20, max: 100)" }),
      ),
    }),
  },

  getOccupancyReport: {
    detail: {
      tags: ["Overview"],
      summary: "Get occupancy report",
      description: "Get occupancy metrics and trends by property (Owner only)",
      security: [{ bearerAuth: [] }],
    },
    query: t.Optional(
      t.Object({
        startDate: t.Optional(
          t.String({
            description: "Start date (YYYY-MM-DD)",
            examples: ["2026-01-01"],
          }),
        ),
        endDate: t.Optional(
          t.String({
            description: "End date (YYYY-MM-DD)",
            examples: ["2026-02-28"],
          }),
        ),
        propertyId: t.Optional(t.String({ description: "Filter by property" })),
      }),
    ),
  },

  getTenantReport: {
    detail: {
      tags: ["Overview"],
      summary: "Get tenant report",
      description: "Get list of active and expired tenants (Owner only)",
      security: [{ bearerAuth: [] }],
    },
    query: t.Optional(
      t.Object({
        status: t.Optional(
          t.String({
            description: "Filter by status (ACTIVE, EXPIRED)",
            examples: ["ACTIVE"],
          }),
        ),
        propertyId: t.Optional(t.String({ description: "Filter by property" })),
        search: t.Optional(t.String({ description: "Search by tenant name" })),
        page: t.Optional(t.String({ description: "Page number (default: 1)" })),
        limit: t.Optional(
          t.String({ description: "Items per page (default: 20, max: 100)" }),
        ),
      }),
    ),
  },

  getVacancyReport: {
    detail: {
      tags: ["Overview"],
      summary: "Get vacancy report",
      description:
        "Get list of vacant units for marketing strategy (Owner only)",
      security: [{ bearerAuth: [] }],
    },
    query: t.Optional(
      t.Object({
        propertyId: t.Optional(t.String({ description: "Filter by property" })),
        vacantDays: t.Optional(
          t.String({
            description: "Filter by minimum days vacant",
            examples: ["30"],
          }),
        ),
        page: t.Optional(t.String({ description: "Page number (default: 1)" })),
        limit: t.Optional(
          t.String({ description: "Items per page (default: 20, max: 100)" }),
        ),
      }),
    ),
  },

  getOutstandingPaymentReport: {
    detail: {
      tags: ["Overview"],
      summary: "Get outstanding payment report",
      description:
        "Get detailed report of unpaid and overdue invoices (Owner only)",
      security: [{ bearerAuth: [] }],
    },
    query: t.Optional(
      t.Object({
        propertyId: t.Optional(t.String({ description: "Filter by property" })),
        status: t.Optional(
          t.String({
            description: "Filter by status (UNPAID, OVERDUE, ALL)",
            examples: ["OVERDUE"],
          }),
        ),
        page: t.Optional(t.String({ description: "Page number (default: 1)" })),
        limit: t.Optional(
          t.String({ description: "Items per page (default: 20, max: 100)" }),
        ),
      }),
    ),
  },

  getPropertyPerformance: {
    detail: {
      tags: ["Overview"],
      summary: "Get property performance report",
      description: "Get performance metrics for each property (Owner only)",
      security: [{ bearerAuth: [] }],
    },
    query: t.Optional(
      t.Object({
        startDate: t.Optional(
          t.String({
            description: "Start date (YYYY-MM-DD)",
            examples: ["2026-01-01"],
          }),
        ),
        endDate: t.Optional(
          t.String({
            description: "End date (YYYY-MM-DD)",
            examples: ["2026-02-28"],
          }),
        ),
      }),
    ),
  },
};
