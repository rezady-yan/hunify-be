import { t } from "elysia";

export const propertiesSwaggerSchemas = {
  addProperty: {
    detail: {
      tags: ["Properties"],
      summary: "Add new property",
      description: "Create a new property (Owner/Admin only)",
      security: [{ bearerAuth: [] }],
    },
    body: t.Object({
      name: t.String({
        minLength: 3,
        maxLength: 150,
        description: "Property name (3-150 characters)",
        examples: ["Kos Melati"],
      }),
      address: t.String({
        minLength: 5,
        maxLength: 500,
        description: "Property address",
        examples: ["Jl. Sudirman No. 123, Jakarta Selatan"],
      }),
      typeProperties: t.String({
        maxLength: 50,
        description: "Property type (e.g., indekos, apartemen, rumah)",
        examples: ["indekos"],
      }),
      city: t.Optional(
        t.String({
          maxLength: 100,
          description: "City name",
          examples: ["Jakarta"],
        }),
      ),
      province: t.Optional(
        t.String({
          maxLength: 100,
          description: "Province name",
          examples: ["DKI Jakarta"],
        }),
      ),
      postalCode: t.Optional(
        t.String({
          maxLength: 20,
          description: "Postal code",
          examples: ["12190"],
        }),
      ),
      country: t.Optional(
        t.String({
          maxLength: 100,
          description: "Country name",
          default: "Indonesia",
          examples: ["Indonesia"],
        }),
      ),
      totalFloors: t.Optional(
        t.String({
          description: "Total floors",
          examples: ["3"],
        }),
      ),
      totalUnits: t.Optional(
        t.String({
          description: "Total units/rooms",
          examples: ["12"],
        }),
      ),
      description: t.Optional(
        t.String({
          maxLength: 1000,
          description: "Property description",
          examples: ["Kos nyaman dekat kampus dengan fasilitas lengkap"],
        }),
      ),
      thumbnailUrl: t.Optional(
        t.String({
          maxLength: 500,
          description: "Property thumbnail URL",
          examples: ["https://example.com/images/property.jpg"],
        }),
      ),
    }),
    response: {
      200: t.Object({
        success: t.Boolean(),
        message: t.String(),
        data: t.Object({
          property: t.Object({
            id: t.String(),
            name: t.String(),
            address: t.String(),
            typeProperties: t.String(),
            city: t.Nullable(t.String()),
            province: t.Nullable(t.String()),
            postalCode: t.Nullable(t.String()),
            country: t.Nullable(t.String()),
            totalFloors: t.Nullable(t.String()),
            totalUnits: t.Nullable(t.String()),
            description: t.Nullable(t.String()),
            thumbnailUrl: t.Nullable(t.String()),
            createdAt: t.String(),
          }),
        }),
      }),
      400: t.Object({
        success: t.Boolean(),
        message: t.String(),
        errors: t.Optional(t.Any()),
      }),
      401: t.Object({
        success: t.Boolean(),
        message: t.String(),
        errors: t.Optional(t.Any()),
      }),
      403: t.Object({
        success: t.Boolean(),
        message: t.String(),
        errors: t.Optional(t.Any()),
      }),
    },
  },

  editProperty: {
    detail: {
      tags: ["Properties"],
      summary: "Edit property",
      description: "Update existing property (Owner/Admin only)",
      security: [{ bearerAuth: [] }],
    },
    params: t.Object({
      id: t.String({
        description: "Property ID",
      }),
    }),
    body: t.Object({
      name: t.Optional(
        t.String({
          minLength: 3,
          maxLength: 150,
          description: "Property name",
        }),
      ),
      address: t.Optional(
        t.String({
          minLength: 5,
          maxLength: 500,
          description: "Property address",
        }),
      ),
      typeProperties: t.Optional(
        t.String({
          maxLength: 50,
          description: "Property type",
        }),
      ),
      city: t.Optional(
        t.String({
          maxLength: 100,
          description: "City name",
        }),
      ),
      province: t.Optional(
        t.String({
          maxLength: 100,
          description: "Province name",
        }),
      ),
      postalCode: t.Optional(
        t.String({
          maxLength: 20,
          description: "Postal code",
        }),
      ),
      country: t.Optional(
        t.String({
          maxLength: 100,
          description: "Country name",
        }),
      ),
      totalFloors: t.Optional(
        t.String({
          description: "Total floors",
        }),
      ),
      totalUnits: t.Optional(
        t.String({
          description: "Total units/rooms",
        }),
      ),
      description: t.Optional(
        t.String({
          maxLength: 1000,
          description: "Property description",
        }),
      ),
      thumbnailUrl: t.Optional(
        t.String({
          maxLength: 500,
          description: "Property thumbnail URL",
        }),
      ),
    }),
    response: {
      200: t.Object({
        success: t.Boolean(),
        message: t.String(),
        data: t.Object({
          property: t.Object({
            id: t.String(),
            name: t.String(),
            address: t.String(),
            typeProperties: t.String(),
            city: t.Nullable(t.String()),
            province: t.Nullable(t.String()),
            postalCode: t.Nullable(t.String()),
            country: t.Nullable(t.String()),
            totalFloors: t.Nullable(t.String()),
            totalUnits: t.Nullable(t.String()),
            description: t.Nullable(t.String()),
            thumbnailUrl: t.Nullable(t.String()),
            updatedAt: t.String(),
          }),
        }),
      }),
      400: t.Object({
        success: t.Boolean(),
        message: t.String(),
        errors: t.Optional(t.Any()),
      }),
      401: t.Object({
        success: t.Boolean(),
        message: t.String(),
        errors: t.Optional(t.Any()),
      }),
      403: t.Object({
        success: t.Boolean(),
        message: t.String(),
        errors: t.Optional(t.Any()),
      }),
      404: t.Object({
        success: t.Boolean(),
        message: t.String(),
        errors: t.Optional(t.Any()),
      }),
    },
  },

  deleteProperty: {
    detail: {
      tags: ["Properties"],
      summary: "Delete property",
      description: "Soft delete property (Owner/Admin only)",
      security: [{ bearerAuth: [] }],
    },
    params: t.Object({
      id: t.String({
        description: "Property ID",
      }),
    }),
    response: {
      200: t.Object({
        success: t.Boolean(),
        message: t.String(),
      }),
      401: t.Object({
        success: t.Boolean(),
        message: t.String(),
        errors: t.Optional(t.Any()),
      }),
      403: t.Object({
        success: t.Boolean(),
        message: t.String(),
        errors: t.Optional(t.Any()),
      }),
      404: t.Object({
        success: t.Boolean(),
        message: t.String(),
        errors: t.Optional(t.Any()),
      }),
    },
  },

  getProperty: {
    detail: {
      tags: ["Properties"],
      summary: "Get property detail",
      description: "Get single property by ID",
      security: [{ bearerAuth: [] }],
    },
    params: t.Object({
      id: t.String({
        description: "Property ID",
      }),
    }),
    response: {
      200: t.Object({
        success: t.Boolean(),
        message: t.String(),
        data: t.Object({
          property: t.Object({
            id: t.String(),
            name: t.String(),
            address: t.String(),
            typeProperties: t.String(),
            city: t.Nullable(t.String()),
            province: t.Nullable(t.String()),
            postalCode: t.Nullable(t.String()),
            country: t.Nullable(t.String()),
            totalFloors: t.Nullable(t.String()),
            totalUnits: t.Nullable(t.String()),
            description: t.Nullable(t.String()),
            thumbnailUrl: t.Nullable(t.String()),
            createdAt: t.String(),
            updatedAt: t.String(),
          }),
        }),
      }),
      401: t.Object({
        success: t.Boolean(),
        message: t.String(),
        errors: t.Optional(t.Any()),
      }),
      404: t.Object({
        success: t.Boolean(),
        message: t.String(),
        errors: t.Optional(t.Any()),
      }),
    },
  },

  getProperties: {
    detail: {
      tags: ["Properties"],
      summary: "Get all properties",
      description: "Get all properties owned by current user",
      security: [{ bearerAuth: [] }],
    },
    response: {
      200: t.Object({
        success: t.Boolean(),
        message: t.String(),
        data: t.Object({
          properties: t.Array(
            t.Object({
              id: t.String(),
              name: t.String(),
              address: t.String(),
              typeProperties: t.String(),
              city: t.Nullable(t.String()),
              province: t.Nullable(t.String()),
              postalCode: t.Nullable(t.String()),
              country: t.Nullable(t.String()),
              totalFloors: t.Nullable(t.String()),
              totalUnits: t.Nullable(t.String()),
              description: t.Nullable(t.String()),
              thumbnailUrl: t.Nullable(t.String()),
              createdAt: t.String(),
              updatedAt: t.String(),
            }),
          ),
          total: t.Number(),
        }),
      }),
      401: t.Object({
        success: t.Boolean(),
        message: t.String(),
        errors: t.Optional(t.Any()),
      }),
    },
  },
};
