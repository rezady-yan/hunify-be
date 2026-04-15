import { t } from "elysia";

const unitStatusSchema = t.Union([
  t.Literal("VACANT"),
  t.Literal("OCCUPIED"),
  t.Literal("MAINTENANCE"),
  t.Literal("RESERVED"),
]);

export const unitsSwaggerSchemas = {
  createUnit: {
    detail: {
      tags: ["Units"],
      summary: "Create new unit",
      description: "Create a new unit in a property (Owner only)",
      security: [{ bearerAuth: [] }],
    },
    body: t.Object({
      propertyId: t.String({
        description: "Property ID",
        examples: ["uuid"],
      }),
      unitName: t.String({
        maxLength: 100,
        description: "Unit name or number",
        examples: ["A01", "Room 101"],
      }),
      price: t.String({
        description: "Monthly rent price",
        examples: ["1500000"],
      }),
      floor: t.Optional(
        t.String({
          maxLength: 20,
          description: "Floor location",
          examples: ["1", "Ground"],
        }),
      ),
      description: t.Optional(
        t.String({
          maxLength: 1000,
          description: "Unit description",
          examples: ["Kamar ukuran 3x4 meter dengan AC"],
        }),
      ),
      status: t.Optional(
        unitStatusSchema,
      ),
    }),
    response: {
      201: t.Object({
        success: t.Boolean(),
        message: t.String(),
        data: t.Object({
          unit: t.Object({
            id: t.String(),
            propertyId: t.String(),
            unitName: t.String(),
            price: t.String(),
            floor: t.Nullable(t.String()),
            description: t.Nullable(t.String()),
            status: t.String(),
            createdAt: t.String(),
          }),
        }),
      }),
    },
  },

  bulkCreateUnits: {
    detail: {
      tags: ["Units"],
      summary: "Bulk create units",
      description: "Create multiple units at once (Owner only)",
      security: [{ bearerAuth: [] }],
    },
    body: t.Object({
      propertyId: t.String({
        description: "Property ID",
      }),
      prefix: t.String({
        maxLength: 10,
        description: "Unit name prefix",
        examples: ["A", "Room"],
      }),
      totalUnits: t.Number({
        minimum: 1,
        maximum: 1000,
        description: "Number of units to create",
        examples: [10],
      }),
      price: t.String({
        description: "Monthly rent price for all units",
        examples: ["1500000"],
      }),
      startNumber: t.Optional(
        t.Number({
          minimum: 1,
          description: "Starting number (default: 1)",
          examples: [1],
        }),
      ),
    }),
    response: {
      201: t.Object({
        success: t.Boolean(),
        message: t.String(),
        data: t.Object({
          created: t.Number(),
          units: t.Array(t.String()),
        }),
      }),
    },
  },

  getUnits: {
    detail: {
      tags: ["Units"],
      summary: "Get all units",
      description: "Get list of units with filters",
      security: [{ bearerAuth: [] }],
    },
    query: t.Optional(
      t.Object({
        propertyId: t.Optional(t.String({ description: "Filter by property" })),
        status: t.Optional(
          t.String({
            description:
              "Filter by status (VACANT, OCCUPIED, MAINTENANCE, RESERVED)",
          }),
        ),
        search: t.Optional(t.String({ description: "Search by unit name" })),
        page: t.Optional(t.String({ description: "Page number" })),
        limit: t.Optional(t.String({ description: "Items per page" })),
      }),
    ),
    response: {
      200: t.Object({
        success: t.Boolean(),
        message: t.String(),
        data: t.Object({
          units: t.Array(
            t.Object({
              id: t.String(),
              propertyId: t.String(),
              propertyName: t.Nullable(t.String()),
              unitName: t.String(),
              price: t.String(),
              floor: t.Nullable(t.String()),
              description: t.Nullable(t.String()),
              status: t.String(),
              createdAt: t.String(),
              updatedAt: t.String(),
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

  getUnit: {
    detail: {
      tags: ["Units"],
      summary: "Get unit detail",
      description: "Get single unit by ID",
      security: [{ bearerAuth: [] }],
    },
    params: t.Object({
      id: t.String({ description: "Unit ID" }),
    }),
    response: {
      200: t.Object({
        success: t.Boolean(),
        message: t.String(),
        data: t.Object({
          unit: t.Object({
            id: t.String(),
            propertyId: t.String(),
            propertyName: t.Nullable(t.String()),
            unitName: t.String(),
            price: t.String(),
            floor: t.Nullable(t.String()),
            description: t.Nullable(t.String()),
            status: t.String(),
            createdAt: t.String(),
            updatedAt: t.String(),
          }),
        }),
      }),
    },
  },

  editUnit: {
    detail: {
      tags: ["Units"],
      summary: "Edit unit",
      description: "Update unit information (Owner only)",
      security: [{ bearerAuth: [] }],
    },
    params: t.Object({
      id: t.String({ description: "Unit ID" }),
    }),
    body: t.Object({
      unitName: t.Optional(t.String({ maxLength: 100 })),
      price: t.Optional(t.String()),
      floor: t.Optional(t.String({ maxLength: 20 })),
      description: t.Optional(t.String({ maxLength: 1000 })),
      status: t.Optional(
        unitStatusSchema,
      ),
    }),
    response: {
      200: t.Object({
        success: t.Boolean(),
        message: t.String(),
        data: t.Object({
          unit: t.Object({
            id: t.String(),
            propertyId: t.String(),
            unitName: t.String(),
            price: t.String(),
            floor: t.Nullable(t.String()),
            description: t.Nullable(t.String()),
            status: t.String(),
            updatedAt: t.String(),
          }),
        }),
      }),
    },
  },

  deleteUnit: {
    detail: {
      tags: ["Units"],
      summary: "Delete unit",
      description: "Delete unit (Owner only, cannot delete occupied unit)",
      security: [{ bearerAuth: [] }],
    },
    params: t.Object({
      id: t.String({ description: "Unit ID" }),
    }),
    response: {
      200: t.Object({
        success: t.Boolean(),
        message: t.String(),
      }),
    },
  },

  assignTenant: {
    detail: {
      tags: ["Units"],
      summary: "Assign tenant to unit",
      description: "Assign a tenant to unit (Owner only)",
      security: [{ bearerAuth: [] }],
    },
    params: t.Object({
      id: t.String({ description: "Unit ID" }),
    }),
    body: t.Object({
      tenantId: t.String({ description: "Tenant user ID" }),
      contractEndDate: t.String({
        description: "Contract end date (YYYY-MM-DD)",
        examples: ["2027-12-31"],
      }),
    }),
    response: {
      200: t.Object({
        success: t.Boolean(),
        message: t.String(),
        data: t.Object({
          unit: t.Object({
            id: t.String(),
            status: t.String(),
            tenantId: t.Nullable(t.String()),
          }),
        }),
      }),
    },
  },

  unassignTenant: {
    detail: {
      tags: ["Units"],
      summary: "Unassign tenant from unit",
      description: "Remove tenant from unit (Owner only)",
      security: [{ bearerAuth: [] }],
    },
    params: t.Object({
      id: t.String({ description: "Unit ID" }),
    }),
    response: {
      200: t.Object({
        success: t.Boolean(),
        message: t.String(),
        data: t.Object({
          unit: t.Object({
            id: t.String(),
            status: t.String(),
            tenantId: t.Nullable(t.String()),
          }),
        }),
      }),
    },
  },

  updateStatus: {
    detail: {
      tags: ["Units"],
      summary: "Update unit status",
      description: "Change unit status (Owner only)",
      security: [{ bearerAuth: [] }],
    },
    params: t.Object({
      id: t.String({ description: "Unit ID" }),
    }),
    body: t.Object({
      status: t.String({
        description: "New status (VACANT, OCCUPIED, MAINTENANCE, RESERVED)",
        examples: ["MAINTENANCE"],
      }),
    }),
    response: {
      200: t.Object({
        success: t.Boolean(),
        message: t.String(),
        data: t.Object({
          unit: t.Object({
            id: t.String(),
            status: t.String(),
            updatedAt: t.String(),
          }),
        }),
      }),
    },
  },
};
