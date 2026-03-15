import { t } from "elysia";

export const paymentsSwaggerSchemas = {
  createInvoice: {
    detail: {
      tags: ["Payments"],
      summary: "Create invoice manually",
      description:
        "Create manual invoice for rent, penalty, utilities, etc (Owner only)",
      security: [{ bearerAuth: [] }],
    },
    body: t.Object({
      tenancyId: t.String({
        description: "Tenancy ID",
      }),
      invoiceType: t.String({
        description: "Invoice type (RENT, PENALTY, ELECTRICITY, WATER, OTHER)",
        examples: ["RENT"],
      }),
      amount: t.String({
        description: "Invoice amount",
        examples: ["1500000"],
      }),
      dueDate: t.String({
        description: "Payment due date (YYYY-MM-DD)",
        examples: ["2026-03-23"],
      }),
      billingPeriodStart: t.Optional(
        t.String({
          description: "Billing period start (YYYY-MM-DD)",
          examples: ["2026-02-01"],
        }),
      ),
      billingPeriodEnd: t.Optional(
        t.String({
          description: "Billing period end (YYYY-MM-DD)",
          examples: ["2026-02-28"],
        }),
      ),
      notes: t.Optional(
        t.String({
          maxLength: 500,
          description: "Additional notes",
        }),
      ),
    }),
  },

  getInvoices: {
    detail: {
      tags: ["Payments"],
      summary: "Get all invoices",
      description:
        "Get list of invoices with filters and pagination (Owner only)",
      security: [{ bearerAuth: [] }],
    },
    query: t.Optional(
      t.Object({
        propertyId: t.Optional(t.String({ description: "Filter by property" })),
        unitId: t.Optional(t.String({ description: "Filter by unit" })),
        tenantId: t.Optional(t.String({ description: "Filter by tenant" })),
        status: t.Optional(
          t.String({
            description: "Filter by status (UNPAID, PAID, OVERDUE)",
          }),
        ),
        invoiceType: t.Optional(
          t.String({
            description:
              "Filter by type (RENT, PENALTY, ELECTRICITY, WATER, OTHER)",
          }),
        ),
        billingPeriod: t.Optional(
          t.String({
            description: "Filter by billing period (YYYY-MM)",
          }),
        ),
        search: t.Optional(
          t.String({ description: "Search by tenant name or invoice number" }),
        ),
        page: t.Optional(t.String({ description: "Page number (default: 1)" })),
        limit: t.Optional(
          t.String({ description: "Items per page (default: 10)" }),
        ),
        sortBy: t.Optional(
          t.String({
            description: "Sort by (createdAt, dueDate, amount)",
          }),
        ),
        sortOrder: t.Optional(
          t.String({
            description: "Sort order (ASC, DESC)",
          }),
        ),
      }),
    ),
  },

  getInvoice: {
    detail: {
      tags: ["Payments"],
      summary: "Get invoice detail",
      description:
        "Get complete invoice information with payment history (Owner only)",
      security: [{ bearerAuth: [] }],
    },
    params: t.Object({
      id: t.String({ description: "Invoice ID" }),
    }),
  },

  editInvoice: {
    detail: {
      tags: ["Payments"],
      summary: "Edit invoice (UNPAID only)",
      description: "Edit invoice details before payment (Owner only)",
      security: [{ bearerAuth: [] }],
    },
    params: t.Object({
      id: t.String({ description: "Invoice ID" }),
    }),
    body: t.Object({
      amount: t.Optional(t.String()),
      dueDate: t.Optional(t.String()),
      billingPeriodStart: t.Optional(t.String()),
      billingPeriodEnd: t.Optional(t.String()),
      notes: t.Optional(t.String({ maxLength: 500 })),
    }),
  },

  deleteInvoice: {
    detail: {
      tags: ["Payments"],
      summary: "Delete invoice (UNPAID only)",
      description: "Delete unpaid invoice (Owner only)",
      security: [{ bearerAuth: [] }],
    },
    params: t.Object({
      id: t.String({ description: "Invoice ID" }),
    }),
  },

  recordPayment: {
    detail: {
      tags: ["Payments"],
      summary: "Record payment for invoice",
      description: "Record payment received from tenant (Owner only)",
      security: [{ bearerAuth: [] }],
    },
    params: t.Object({
      invoiceId: t.String({ description: "Invoice ID" }),
    }),
    body: t.Object({
      amount: t.String({
        description: "Payment amount",
        examples: ["1500000"],
      }),
      paymentDate: t.String({
        description: "Payment date (YYYY-MM-DD)",
        examples: ["2026-02-23"],
      }),
      paymentMethod: t.String({
        description:
          "Payment method (CASH, BANK_TRANSFER, E_WALLET, CHECK, OTHER)",
        examples: ["BANK_TRANSFER"],
      }),
      notes: t.Optional(
        t.String({
          maxLength: 500,
          description: "Payment notes",
        }),
      ),
    }),
  },

  uploadPaymentProof: {
    detail: {
      tags: ["Payments"],
      summary: "Upload payment proof",
      description:
        "Upload proof of payment (JPG, PNG, PDF) for payment (Owner only)",
      security: [{ bearerAuth: [] }],
    },
    params: t.Object({
      paymentId: t.String({ description: "Payment ID" }),
    }),
    body: t.Object({
      url: t.String({
        description: "Document URL from uploaded file",
        examples: ["https://example.com/proofs/payment.jpg"],
      }),
      fileType: t.String({
        description: "File type (JPG, PNG, PDF)",
        examples: ["JPG"],
      }),
    }),
  },

  deletePaymentProof: {
    detail: {
      tags: ["Payments"],
      summary: "Delete payment proof",
      description: "Delete uploaded proof of payment (Owner only)",
      security: [{ bearerAuth: [] }],
    },
    params: t.Object({
      paymentId: t.String({ description: "Payment ID" }),
    }),
  },

  getPaymentSummary: {
    detail: {
      tags: ["Payments"],
      summary: "Get payment summary",
      description: "Get monthly payment summary for dashboard (Owner only)",
      security: [{ bearerAuth: [] }],
    },
    query: t.Optional(
      t.Object({
        propertyId: t.Optional(t.String({ description: "Filter by property" })),
        month: t.Optional(
          t.String({
            description: "Month (YYYY-MM), defaults to current month",
            examples: ["2026-02"],
          }),
        ),
      }),
    ),
  },

  getTransactionHistory: {
    detail: {
      tags: ["Payments"],
      summary: "Get transaction history",
      description: "Get all payment transactions history (Owner only)",
      security: [{ bearerAuth: [] }],
    },
    query: t.Optional(
      t.Object({
        propertyId: t.Optional(t.String({ description: "Filter by property" })),
        startDate: t.Optional(
          t.String({ description: "Start date (YYYY-MM-DD)" }),
        ),
        endDate: t.Optional(t.String({ description: "End date (YYYY-MM-DD)" })),
        page: t.Optional(t.String({ description: "Page number (default: 1)" })),
        limit: t.Optional(
          t.String({ description: "Items per page (default: 20)" }),
        ),
      }),
    ),
  },

  getOverdueInvoices: {
    detail: {
      tags: ["Payments"],
      summary: "Get overdue invoices",
      description: "Get list of overdue invoices (Owner only)",
      security: [{ bearerAuth: [] }],
    },
    query: t.Optional(
      t.Object({
        propertyId: t.Optional(t.String({ description: "Filter by property" })),
        daysOverdue: t.Optional(
          t.String({
            description: "Filter by days overdue (e.g., 30 = 30+ days)",
            examples: ["30"],
          }),
        ),
        page: t.Optional(t.String({ description: "Page number (default: 1)" })),
        limit: t.Optional(
          t.String({ description: "Items per page (default: 10)" }),
        ),
      }),
    ),
  },
};
