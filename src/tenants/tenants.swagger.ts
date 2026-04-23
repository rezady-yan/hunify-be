import { t } from "elysia";

export const tenantsSwaggerSchemas = {
  createTenant: {
    detail: {
      tags: ["Tenants"],
      summary: "Create new tenant",
      description: "Create a new tenant profile (Owner only)",
      security: [{ bearerAuth: [] }],
    },
    body: t.Object({
      fullName: t.String({
        maxLength: 100,
        description: "Tenant full name",
        examples: ["John Doe"],
      }),
      phoneNumber: t.String({
        description: "Phone number",
        examples: ["08123456789"],
      }),
      email: t.Optional(
        t.String({
          format: "email",
          description: "Email address",
          examples: ["john@example.com"],
        }),
      ),
      identityNumber: t.Optional(
        t.String({
          maxLength: 20,
          description: "KTP or Passport number",
          examples: ["1234567890123456"],
        }),
      ),
      address: t.Optional(
        t.String({
          maxLength: 500,
          description: "Residential address",
        }),
      ),
      emergencyContactName: t.Optional(
        t.String({
          maxLength: 100,
          description: "Emergency contact name",
        }),
      ),
      emergencyContactPhone: t.Optional(
        t.String({
          description: "Emergency contact phone",
        }),
      ),
      notes: t.Optional(
        t.String({
          maxLength: 1000,
          description: "Additional notes",
        }),
      ),
    }),
    response: {
      201: t.Object({
        success: t.Boolean(),
        message: t.String(),
        data: t.Object({
          tenant: t.Object({
            id: t.String(),
            fullName: t.String(),
            phoneNumber: t.String(),
            email: t.Nullable(t.String()),
            identityNumber: t.Nullable(t.String()),
            address: t.Nullable(t.String()),
            emergencyContactName: t.Nullable(t.String()),
            emergencyContactPhone: t.Nullable(t.String()),
            notes: t.Nullable(t.String()),
            createdAt: t.String(),
          }),
        }),
      }),
    },
  },

  createTenancy: {
    detail: {
      tags: ["Tenants"],
      summary: "Create tenancy (Assign tenant to unit)",
      description:
        "Assign tenant to unit with billing configuration (Owner only)",
      security: [{ bearerAuth: [] }],
    },
    body: t.Object({
      tenantId: t.String({
        description: "Tenant ID",
      }),
      propertyId: t.String({
        description: "Property ID",
      }),
      unitId: t.String({
        description: "Unit ID",
      }),
      startDate: t.String({
        description: "Tenancy start date (YYYY-MM-DD)",
        examples: ["2026-02-23"],
      }),
      endDate: t.Nullable(
        t.String({
          description: "Tenancy end date (YYYY-MM-DD), optional for permanent",
          examples: ["2027-02-23"],
        }),
      ),
      billingCycle: t.String({
        description: "Billing cycle (DAILY, WEEKLY, MONTHLY, YEARLY)",
        examples: ["MONTHLY"],
      }),
      billingAnchorDay: t.Optional(
        t.Number({
          minimum: 1,
          maximum: 31,
          description: "Billing anchor day for monthly/yearly cycles",
          examples: [1],
        }),
      ),
      rentPrice: t.String({
        description: "Rent price per billing cycle",
        examples: ["1500000"],
      }),
    }),
    response: {
      201: t.Object({
        success: t.Boolean(),
        message: t.String(),
        data: t.Object({
          tenancy: t.Object({
            id: t.String(),
            tenantId: t.String(),
            unitId: t.String(),
            propertyId: t.String(),
            startDate: t.String(),
            endDate: t.Nullable(t.String()),
            billingCycle: t.String(),
            billingAnchorDay: t.Nullable(t.Number()),
            rentPrice: t.String(),
            status: t.String(),
            createdAt: t.String(),
          }),
        }),
      }),
    },
  },

  getTenancies: {
    detail: {
      tags: ["Tenants"],
      summary: "Get all tenancies",
      description: "Get list of tenancies with filters (pagination supported)",
      security: [{ bearerAuth: [] }],
    },
    query: t.Optional(
      t.Object({
        propertyId: t.Optional(t.String({ description: "Filter by property" })),
        status: t.Optional(
          t.String({
            description: "Filter by tenancy status (ACTIVE, ENDED)",
          }),
        ),
        search: t.Optional(t.String({ description: "Search by tenant name" })),
        page: t.Optional(t.String({ description: "Page number (default: 1)" })),
        limit: t.Optional(
          t.String({ description: "Items per page (default: 10)" }),
        ),
      }),
    ),
    response: {
      200: t.Object({
        success: t.Boolean(),
        message: t.String(),
        data: t.Object({
          tenancies: t.Array(
            t.Object({
              id: t.String(),
              tenantId: t.String(),
              fullName: t.String(),
              phoneNumber: t.String(),
              propertyName: t.Nullable(t.String()),
              unitName: t.String(),
              billingCycle: t.String(),
              startDate: t.String(),
              endDate: t.Nullable(t.String()),
              status: t.String(),
              createdAt: t.String(),
            }),
          ),
          pagination: t.Object({
            page: t.Number(),
            limit: t.Number(),
            total: t.Number(),
          }),
        }),
      }),
    },
  },

  getTenancy: {
    detail: {
      tags: ["Tenants"],
      summary: "Get tenancy detail",
      description: "Get complete tenant and tenancy information with documents",
      security: [{ bearerAuth: [] }],
    },
    params: t.Object({
      id: t.String({ description: "Tenancy ID" }),
    }),
    response: {
      200: t.Object({
        success: t.Boolean(),
        message: t.String(),
        data: t.Object({
          tenant: t.Object({
            id: t.String(),
            fullName: t.String(),
            phoneNumber: t.String(),
            email: t.Nullable(t.String()),
            identityNumber: t.Nullable(t.String()),
            address: t.Nullable(t.String()),
            emergencyContactName: t.Nullable(t.String()),
            emergencyContactPhone: t.Nullable(t.String()),
            notes: t.Nullable(t.String()),
          }),
          tenancy: t.Object({
            id: t.String(),
            propertyId: t.String(),
            propertyName: t.String(),
            unitId: t.String(),
            unitName: t.String(),
            startDate: t.String(),
            endDate: t.Nullable(t.String()),
            billingCycle: t.String(),
            billingAnchorDay: t.Nullable(t.Number()),
            rentPrice: t.String(),
            status: t.String(),
            createdAt: t.String(),
            updatedAt: t.String(),
          }),
          documents: t.Array(
            t.Object({
              id: t.String(),
              type: t.String(),
              url: t.String(),
              uploadedAt: t.String(),
            }),
          ),
        }),
      }),
    },
  },

  editTenant: {
    detail: {
      tags: ["Tenants"],
      summary: "Edit tenant information",
      description: "Update tenant details (Owner only)",
      security: [{ bearerAuth: [] }],
    },
    params: t.Object({
      id: t.String({ description: "Tenant ID" }),
    }),
    body: t.Object({
      phoneNumber: t.Optional(t.String()),
      email: t.Optional(t.String({ format: "email" })),
      address: t.Optional(t.String({ maxLength: 500 })),
      emergencyContactName: t.Optional(t.String({ maxLength: 100 })),
      emergencyContactPhone: t.Optional(t.String()),
      notes: t.Optional(t.String({ maxLength: 1000 })),
      fullName: t.Optional(t.String({ maxLength: 50 })),
      identityNumber: t.Optional(t.String({ maxLength: 20 })),
    }),
    response: {
      200: t.Object({
        success: t.Boolean(),
        message: t.String(),
        data: t.Object({
          tenant: t.Object({
            id: t.String(),
            fullName: t.String(),
            phoneNumber: t.String(),
            email: t.Nullable(t.String()),
            address: t.Nullable(t.String()),
            identityNumber: t.Nullable(t.String()),
            updatedAt: t.String(),
          }),
        }),
      }),
    },
  },

  editTenancy: {
    detail: {
      tags: ["Tenants"],
      summary: "Edit tenancy information",
      description:
        "Update billing cycle, rent price, or end date. Can also move tenant to different unit (Owner only)",
      security: [{ bearerAuth: [] }],
    },
    params: t.Object({
      id: t.String({ description: "Tenancy ID" }),
    }),
    body: t.Object({
      billingCycle: t.Optional(
        t.String({
          description: "Billing cycle (DAILY, WEEKLY, MONTHLY, YEARLY)",
        }),
      ),
      billingAnchorDay: t.Optional(
        t.Number({
          minimum: 1,
          maximum: 31,
        }),
      ),
      rentPrice: t.Optional(t.String()),
      endDate: t.Optional(
        t.String({
          description: "Update end date (YYYY-MM-DD)",
        }),
      ),
      unitId: t.Optional(
        t.String({
          description: "Change to different unit (pindah unit)",
        }),
      ),
      startDate: t.Optional(
        t.String({
          description:
            "Change start date when moving to different unit (YYYY-MM-DD)",
        }),
      ),
    }),
    response: {
      200: t.Object({
        success: t.Boolean(),
        message: t.String(),
        data: t.Object({
          tenancy: t.Object({
            id: t.String(),
            unitId: t.String(),
            startDate: t.Nullable(t.String()),
            billingCycle: t.String(),
            billingAnchorDay: t.Nullable(t.Number()),
            rentPrice: t.String(),
            endDate: t.Nullable(t.String()),
            updatedAt: t.String(),
          }),
        }),
      }),
    },
  },

  endTenancy: {
    detail: {
      tags: ["Tenants"],
      summary: "End tenancy",
      description:
        "End tenant occupancy, update tenancy status to ENDED, and unit status to VACANT (Owner only)",
      security: [{ bearerAuth: [] }],
    },
    params: t.Object({
      id: t.String({ description: "Tenancy ID" }),
    }),
    body: t.Object({
      endDate: t.Optional(
        t.String({
          description: "End date (YYYY-MM-DD), defaults to today",
          examples: ["2026-02-23"],
        }),
      ),
    }),
    response: {
      200: t.Object({
        success: t.Boolean(),
        message: t.String(),
        data: t.Object({
          tenancy: t.Object({
            id: t.String(),
            status: t.String(),
            endDate: t.String(),
            updatedAt: t.String(),
          }),
        }),
      }),
    },
  },

  uploadDocument: {
    detail: {
      tags: ["Tenants"],
      summary: "Upload tenant document",
      description:
        "Upload KTP, Passport, or Contract document for tenancy (Owner only)",
      security: [{ bearerAuth: [] }],
    },
    params: t.Object({
      id: t.String({ description: "Tenancy ID" }),
    }),
    body: t.Object({
      type: t.String({
        description: "Document type (KTP, PASSPORT, CONTRACT)",
        examples: ["KTP"],
      }),
      url: t.String({
        description: "Document URL from uploaded file",
        examples: ["https://example.com/documents/ktp.jpg"],
      }),
    }),
    response: {
      201: t.Object({
        success: t.Boolean(),
        message: t.String(),
        data: t.Object({
          document: t.Object({
            id: t.String(),
            type: t.String(),
            url: t.String(),
            uploadedAt: t.String(),
          }),
        }),
      }),
    },
  },

  deleteDocument: {
    detail: {
      tags: ["Tenants"],
      summary: "Delete tenant document",
      description: "Delete uploaded document (Owner only)",
      security: [{ bearerAuth: [] }],
    },
    params: t.Object({
      tenancyId: t.String({ description: "Tenancy ID" }),
      documentId: t.String({ description: "Document ID" }),
    }),
    response: {
      200: t.Object({
        success: t.Boolean(),
        message: t.String(),
      }),
    },
  },
  getViewAll: {
    detail: {
      tags: ["Tenants"],
      summary: "Get all tenants with tenancies and documents",
      description: "Retrieve all tenants with their tenancies and documents",
      security: [{ bearerAuth: [] }],
    },
    response: {
      200: t.Object({
        success: t.Boolean(),
        message: t.String(),
        data: t.Optional(
          t.Object({
            tenants: t.Array(
              t.Object({
                tenant: t.Object({
                  id: t.String(),
                  fullName: t.String(),
                  phoneNumber: t.String(),
                  email: t.Nullable(t.String()),
                  identityNumber: t.Nullable(t.String()),
                  address: t.Nullable(t.String()),
                  emergencyContactName: t.Nullable(t.String()),
                  emergencyContactPhone: t.Nullable(t.String()),
                  notes: t.Nullable(t.String()),
                  createdBy: t.String(),
                  createdAt: t.String(),
                  updatedAt: t.String(),
                }),
                tenancies: t.Array(
                  t.Object({
                    id: t.String(),
                    tenantId: t.String(),
                    propertyId: t.String(),
                    unitId: t.String(),
                    startDate: t.String(),
                    endDate: t.Nullable(t.String()),
                    billingCycle: t.String(),
                    billingAnchorDay: t.Optional(t.Number()),
                    rentPrice: t.String(),
                    status: t.String(),
                    createdAt: t.String(),
                    updatedAt: t.String(),
                    propertyName: t.String(),
                    unitName: t.String(),
                  }),
                ),
                documents: t.Array(
                  t.Object({
                    id: t.String(),
                    tenancyId: t.String(),
                    type: t.String(),
                    url: t.String(),
                    uploadedBy: t.String(),
                    uploadedAt: t.String(),
                  }),
                ),
              }),
            ),
          }),
        ),
      }),
    },
  },
  getViewAllTenant: {
    detail: {
      tags: ["Tenants"],
      summary: "Get single tenant with tenancies and documents",
      description:
        "Retrieve a single tenant with their tenancies and documents",
      security: [{ bearerAuth: [] }],
    },
    params: t.Object({
      id: t.String({ description: "Tenant ID" }),
    }),
    response: {
      200: t.Object({
        success: t.Boolean(),
        message: t.String(),
        data: t.Optional(
          t.Object({
            tenant: t.Object({
              id: t.String(),
              fullName: t.String(),
              phoneNumber: t.String(),
              email: t.Nullable(t.String()),
              identityNumber: t.Nullable(t.String()),
              address: t.Nullable(t.String()),
              emergencyContactName: t.Nullable(t.String()),
              emergencyContactPhone: t.Nullable(t.String()),
              notes: t.Nullable(t.String()),
              createdBy: t.String(),
              createdAt: t.String(),
              updatedAt: t.String(),
            }),
            tenancies: t.Array(
              t.Object({
                id: t.String(),
                tenantId: t.String(),
                propertyId: t.String(),
                unitId: t.String(),
                startDate: t.String(),
                endDate: t.Optional(t.String()),
                billingCycle: t.String(),
                billingAnchorDay: t.Optional(t.Number()),
                rentPrice: t.String(),
                status: t.String(),
                createdAt: t.String(),
                updatedAt: t.String(),
                propertyName: t.String(),
                unitName: t.String(),
              }),
            ),
            documents: t.Array(
              t.Object({
                id: t.String(),
                tenancyId: t.String(),
                type: t.String(),
                url: t.String(),
                uploadedBy: t.String(),
                uploadedAt: t.String(),
              }),
            ),
          }),
        ),
      }),
    },
  },
};
