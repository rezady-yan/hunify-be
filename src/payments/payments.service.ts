import { db } from "../db";
import {
  invoices,
  payments,
  paymentProofs,
  tenancies,
  tenants,
  properties,
  units,
} from "../db/schema";
import {
  CreateInvoiceRequest,
  EditInvoiceRequest,
  RecordPaymentRequest,
  UploadPaymentProofRequest,
  Invoice,
  Payment,
  InvoiceListItem,
  InvoiceDetail,
  PaymentSummary,
  TransactionItem,
  OverdueInvoiceItem,
  GetInvoicesQuery,
  GetPaymentSummaryQuery,
  GetTransactionHistoryQuery,
  GetOverdueInvoicesQuery,
} from "./payments.types";
import {
  eq,
  and,
  gte,
  lte,
  ilike,
  or,
  sql,
  desc,
  asc,
  isNull,
} from "drizzle-orm";

export class PaymentsService {
  /**
   * Generate invoice number
   */
  private async generateInvoiceNumber(): Promise<string> {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");

    // Get count of invoices this month
    const startOfMonth = new Date(year, today.getMonth(), 1);
    const endOfMonth = new Date(year, today.getMonth() + 1, 0, 23, 59, 59, 999);

    const count = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(invoices)
      .where(
        and(
          gte(invoices.createdAt, startOfMonth),
          lte(invoices.createdAt, endOfMonth),
        ),
      );

    const sequence = String(Number(count[0]?.count || 0) + 1).padStart(4, "0");
    return `INV-${year}${month}-${sequence}`;
  }

  /**
   * Update invoice status based on due date (UNPAID -> OVERDUE)
   */
  private async updateOverdueInvoices(): Promise<void> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    await db
      .update(invoices)
      .set({
        status: "OVERDUE",
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(invoices.status, "UNPAID"),
          sql`${invoices.dueDate} < ${today.toISOString().split("T")[0]}`,
        ),
      );
  }

  /**
   * Create invoice manually
   */
  async createInvoice(
    ownerId: string,
    data: CreateInvoiceRequest,
  ): Promise<
    Invoice & { tenantName: string; propertyName: string; unitName: string }
  > {
    // Verifikasi tenancy exists dan owner punya akses
    const tenancyData = await db
      .select({
        tenancy: tenancies,
        property: properties,
        unit: units,
        tenant: tenants,
      })
      .from(tenancies)
      .innerJoin(properties, eq(tenancies.propertyId, properties.id))
      .innerJoin(units, eq(tenancies.unitId, units.id))
      .innerJoin(tenants, eq(tenancies.tenantId, tenants.id))
      .where(
        and(eq(tenancies.id, data.tenancyId), eq(properties.ownerId, ownerId)),
      )
      .limit(1);

    if (!tenancyData || tenancyData.length === 0) {
      throw new Error("Tenancy not found or access denied");
    }

    const { tenancy, property, unit, tenant } = tenancyData[0];

    // Generate invoice number
    const invoiceNumber = await this.generateInvoiceNumber();

    // Insert invoice
    const result = await db
      .insert(invoices)
      .values({
        invoiceNumber,
        propertyId: tenancy.propertyId,
        unitId: tenancy.unitId,
        tenancyId: tenancy.id,
        tenantId: tenancy.tenantId,
        invoiceType: data.invoiceType,
        amount: data.amount,
        dueDate: data.dueDate,
        billingPeriodStart: data.billingPeriodStart || null,
        billingPeriodEnd: data.billingPeriodEnd || null,
        status: "UNPAID",
        notes: data.notes || null,
        createdBy: ownerId,
      })
      .returning();

    return {
      ...result[0],
      tenantName: tenant.fullName,
      propertyName: property.name,
      unitName: unit.unitName,
    } as Invoice & {
      tenantName: string;
      propertyName: string;
      unitName: string;
    };
  }

  /**
   * Get invoices with filters
   */
  async getInvoices(
    ownerId: string,
    filters: GetInvoicesQuery,
  ): Promise<{
    invoices: InvoiceListItem[];
    pagination: { page: number; limit: number; total: number };
    summary: {
      totalInvoices: number;
      totalUnpaid: string;
      totalPaid: string;
      totalOverdue: string;
    };
  }> {
    // Update overdue invoices first
    await this.updateOverdueInvoices();

    const page = parseInt(filters.page || "1");
    const limit = parseInt(filters.limit || "10");
    const offset = (page - 1) * limit;

    // Build WHERE conditions
    const conditions = [eq(properties.ownerId, ownerId)];

    if (filters.propertyId) {
      conditions.push(eq(invoices.propertyId, filters.propertyId));
    }

    if (filters.unitId) {
      conditions.push(eq(invoices.unitId, filters.unitId));
    }

    if (filters.tenantId) {
      conditions.push(eq(invoices.tenantId, filters.tenantId));
    }

    if (filters.status) {
      conditions.push(eq(invoices.status, filters.status));
    }

    if (filters.invoiceType) {
      conditions.push(eq(invoices.invoiceType, filters.invoiceType));
    }

    if (filters.billingPeriod) {
      const [year, month] = filters.billingPeriod.split("-");
      const startDate = `${year}-${month}-01`;
      const endDate = new Date(parseInt(year), parseInt(month), 0)
        .toISOString()
        .split("T")[0];
      conditions.push(
        and(
          gte(invoices.billingPeriodStart, startDate),
          lte(invoices.billingPeriodEnd, endDate),
        )!,
      );
    }

    if (filters.search) {
      conditions.push(
        or(
          ilike(tenants.fullName, `%${filters.search}%`),
          ilike(invoices.invoiceNumber, `%${filters.search}%`),
        )!,
      );
    }

    // Sorting
    const sortBy = filters.sortBy || "createdAt";
    const sortOrder = filters.sortOrder || "DESC";
    const sortColumn =
      sortBy === "dueDate"
        ? invoices.dueDate
        : sortBy === "amount"
          ? invoices.amount
          : invoices.createdAt;
    const orderFn = sortOrder === "ASC" ? asc : desc;

    // Query invoices
    const result = await db
      .select({
        id: invoices.id,
        invoiceNumber: invoices.invoiceNumber,
        tenantName: tenants.fullName,
        propertyName: properties.name,
        unitName: units.unitName,
        billingPeriodStart: invoices.billingPeriodStart,
        billingPeriodEnd: invoices.billingPeriodEnd,
        dueDate: invoices.dueDate,
        amount: invoices.amount,
        invoiceType: invoices.invoiceType,
        status: invoices.status,
        createdAt: invoices.createdAt,
      })
      .from(invoices)
      .innerJoin(tenants, eq(invoices.tenantId, tenants.id))
      .innerJoin(properties, eq(invoices.propertyId, properties.id))
      .innerJoin(units, eq(invoices.unitId, units.id))
      .where(and(...conditions))
      .orderBy(orderFn(sortColumn))
      .limit(limit)
      .offset(offset);

    // Count total
    const countResult = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(invoices)
      .innerJoin(tenants, eq(invoices.tenantId, tenants.id))
      .innerJoin(properties, eq(invoices.propertyId, properties.id))
      .innerJoin(units, eq(invoices.unitId, units.id))
      .where(and(...conditions));

    const total = Number(countResult[0]?.count || 0);

    // Calculate summary
    const summaryResult = await db
      .select({
        status: invoices.status,
        total: sql<string>`sum(${invoices.amount})`,
        count: sql<number>`count(*)::int`,
      })
      .from(invoices)
      .innerJoin(properties, eq(invoices.propertyId, properties.id))
      .where(eq(properties.ownerId, ownerId))
      .groupBy(invoices.status);

    const summary = {
      totalInvoices: summaryResult.reduce((acc, r) => acc + (r.count || 0), 0),
      totalUnpaid:
        summaryResult.find((r) => r.status === "UNPAID")?.total || "0",
      totalPaid: summaryResult.find((r) => r.status === "PAID")?.total || "0",
      totalOverdue:
        summaryResult.find((r) => r.status === "OVERDUE")?.total || "0",
    };

    return {
      invoices: result.map((r) => ({
        ...r,
        billingPeriod:
          r.billingPeriodStart && r.billingPeriodEnd
            ? `${r.billingPeriodStart} - ${r.billingPeriodEnd}`
            : "-",
        dueDate: r.dueDate?.toString() || "",
        amount: r.amount || "0",
        createdAt: r.createdAt?.toISOString() || "",
      })) as InvoiceListItem[],
      pagination: {
        page,
        limit,
        total,
      },
      summary,
    };
  }

  /**
   * Get invoice detail
   */
  async getInvoice(ownerId: string, invoiceId: string): Promise<InvoiceDetail> {
    // Update overdue status
    await this.updateOverdueInvoices();

    // Query invoice with joins
    const result = await db
      .select({
        invoice: invoices,
        tenant: tenants,
        property: properties,
        unit: units,
      })
      .from(invoices)
      .innerJoin(tenants, eq(invoices.tenantId, tenants.id))
      .innerJoin(properties, eq(invoices.propertyId, properties.id))
      .innerJoin(units, eq(invoices.unitId, units.id))
      .where(and(eq(invoices.id, invoiceId), eq(properties.ownerId, ownerId)))
      .limit(1);

    if (!result || result.length === 0) {
      throw new Error("Invoice not found or access denied");
    }

    const data = result[0];

    // Query payment
    const paymentData = await db
      .select()
      .from(payments)
      .where(eq(payments.invoiceId, invoiceId))
      .limit(1);

    return {
      invoice: {
        ...data.invoice,
        tenantName: data.tenant.fullName,
        propertyName: data.property.name,
        unitName: data.unit.unitName,
      },
      payment: paymentData.length > 0 ? (paymentData[0] as Payment) : null,
    };
  }

  /**
   * Edit invoice (UNPAID only)
   */
  async editInvoice(
    ownerId: string,
    invoiceId: string,
    data: EditInvoiceRequest,
  ): Promise<Invoice> {
    // Verifikasi invoice exists, UNPAID, dan owner punya akses
    const existingInvoice = await db
      .select({
        invoice: invoices,
        property: properties,
      })
      .from(invoices)
      .innerJoin(properties, eq(invoices.propertyId, properties.id))
      .where(and(eq(invoices.id, invoiceId), eq(properties.ownerId, ownerId)))
      .limit(1);

    if (!existingInvoice || existingInvoice.length === 0) {
      throw new Error("Invoice not found or access denied");
    }

    if (existingInvoice[0].invoice.status !== "UNPAID") {
      throw new Error("Only UNPAID invoices can be edited");
    }

    // Update invoice
    const result = await db
      .update(invoices)
      .set({
        amount: data.amount,
        dueDate: data.dueDate,
        billingPeriodStart: data.billingPeriodStart,
        billingPeriodEnd: data.billingPeriodEnd,
        notes: data.notes,
        updatedAt: new Date(),
      })
      .where(eq(invoices.id, invoiceId))
      .returning();

    return result[0] as Invoice;
  }

  /**
   * Delete invoice (UNPAID only)
   */
  async deleteInvoice(ownerId: string, invoiceId: string): Promise<void> {
    // Verifikasi invoice exists, UNPAID, dan owner punya akses
    const existingInvoice = await db
      .select({
        invoice: invoices,
        property: properties,
      })
      .from(invoices)
      .innerJoin(properties, eq(invoices.propertyId, properties.id))
      .where(and(eq(invoices.id, invoiceId), eq(properties.ownerId, ownerId)))
      .limit(1);

    if (!existingInvoice || existingInvoice.length === 0) {
      throw new Error("Invoice not found or access denied");
    }

    if (existingInvoice[0].invoice.status !== "UNPAID") {
      throw new Error("Only UNPAID invoices can be deleted");
    }

    // Delete invoice
    await db.delete(invoices).where(eq(invoices.id, invoiceId));
  }

  /**
   * Record payment
   */
  async recordPayment(
    ownerId: string,
    invoiceId: string,
    data: RecordPaymentRequest,
  ): Promise<{ payment: Payment; invoice: Invoice }> {
    // Verifikasi invoice exists dan owner punya akses
    const existingInvoice = await db
      .select({
        invoice: invoices,
        property: properties,
      })
      .from(invoices)
      .innerJoin(properties, eq(invoices.propertyId, properties.id))
      .where(and(eq(invoices.id, invoiceId), eq(properties.ownerId, ownerId)))
      .limit(1);

    if (!existingInvoice || existingInvoice.length === 0) {
      throw new Error("Invoice not found or access denied");
    }

    const invoice = existingInvoice[0].invoice;

    if (invoice.status === "PAID") {
      throw new Error("Invoice is already paid");
    }

    // Record payment
    const paymentResult = await db
      .insert(payments)
      .values({
        invoiceId,
        amount: data.amount,
        paymentDate: data.paymentDate,
        paymentMethod: data.paymentMethod,
        notes: data.notes || null,
        recordedBy: ownerId,
      })
      .returning();

    // Update invoice status to PAID
    const invoiceResult = await db
      .update(invoices)
      .set({
        status: "PAID",
        updatedAt: new Date(),
      })
      .where(eq(invoices.id, invoiceId))
      .returning();

    return {
      payment: paymentResult[0] as Payment,
      invoice: invoiceResult[0] as Invoice,
    };
  }

  /**
   * Upload payment proof
   */
  async uploadPaymentProof(
    ownerId: string,
    paymentId: string,
    data: UploadPaymentProofRequest,
  ): Promise<Payment> {
    // Verifikasi payment exists dan owner punya akses
    const existingPayment = await db
      .select({
        payment: payments,
        invoice: invoices,
        property: properties,
      })
      .from(payments)
      .innerJoin(invoices, eq(payments.invoiceId, invoices.id))
      .innerJoin(properties, eq(invoices.propertyId, properties.id))
      .where(and(eq(payments.id, paymentId), eq(properties.ownerId, ownerId)))
      .limit(1);

    if (!existingPayment || existingPayment.length === 0) {
      throw new Error("Payment not found or access denied");
    }

    // Update payment with proof URL
    const result = await db
      .update(payments)
      .set({
        proofUrl: data.url,
        updatedAt: new Date(),
      })
      .where(eq(payments.id, paymentId))
      .returning();

    // Insert to payment_proofs table
    await db.insert(paymentProofs).values({
      paymentId,
      fileUrl: data.url,
      fileType: data.fileType,
      uploadedBy: ownerId,
    });

    return result[0] as Payment;
  }

  /**
   * Delete payment proof
   */
  async deletePaymentProof(ownerId: string, paymentId: string): Promise<void> {
    // Verifikasi payment exists dan owner punya akses
    const existingPayment = await db
      .select({
        payment: payments,
        invoice: invoices,
        property: properties,
      })
      .from(payments)
      .innerJoin(invoices, eq(payments.invoiceId, invoices.id))
      .innerJoin(properties, eq(invoices.propertyId, properties.id))
      .where(and(eq(payments.id, paymentId), eq(properties.ownerId, ownerId)))
      .limit(1);

    if (!existingPayment || existingPayment.length === 0) {
      throw new Error("Payment not found or access denied");
    }

    // Delete proof URL from payment
    await db
      .update(payments)
      .set({
        proofUrl: null,
        updatedAt: new Date(),
      })
      .where(eq(payments.id, paymentId));

    // Delete from payment_proofs table
    await db
      .delete(paymentProofs)
      .where(eq(paymentProofs.paymentId, paymentId));
  }

  /**
   * Get payment summary for dashboard
   */
  async getPaymentSummary(
    ownerId: string,
    filters: GetPaymentSummaryQuery,
  ): Promise<PaymentSummary> {
    // Update overdue invoices
    await this.updateOverdueInvoices();

    // Determine month
    const month = filters.month || new Date().toISOString().slice(0, 7);
    const [year, monthNum] = month.split("-");
    const startDate = `${year}-${monthNum}-01`;
    const endDate = new Date(parseInt(year), parseInt(monthNum), 0)
      .toISOString()
      .split("T")[0];

    // Build conditions
    const conditions = [eq(properties.ownerId, ownerId)];

    if (filters.propertyId) {
      conditions.push(eq(invoices.propertyId, filters.propertyId));
    }

    // Add date filter for current month
    conditions.push(
      and(
        gte(invoices.createdAt, new Date(startDate)),
        lte(invoices.createdAt, new Date(endDate + "T23:59:59")),
      )!,
    );

    // Get summary by status
    const summaryResult = await db
      .select({
        status: invoices.status,
        total: sql<string>`COALESCE(sum(${invoices.amount}), 0)`,
        count: sql<number>`count(*)::int`,
      })
      .from(invoices)
      .innerJoin(properties, eq(invoices.propertyId, properties.id))
      .where(and(...conditions))
      .groupBy(invoices.status);

    const totalRevenue = summaryResult.reduce(
      (acc, r) => acc + parseFloat(r.total || "0"),
      0,
    );
    const totalPaid = parseFloat(
      summaryResult.find((r) => r.status === "PAID")?.total || "0",
    );
    const totalUnpaid = parseFloat(
      summaryResult.find((r) => r.status === "UNPAID")?.total || "0",
    );
    const totalOverdue = parseFloat(
      summaryResult.find((r) => r.status === "OVERDUE")?.total || "0",
    );

    const collectionRate =
      totalRevenue > 0 ? (totalPaid / totalRevenue) * 100 : 0;

    return {
      totalRevenue: totalRevenue.toFixed(2),
      totalPaid: totalPaid.toFixed(2),
      totalUnpaid: totalUnpaid.toFixed(2),
      totalOverdue: totalOverdue.toFixed(2),
      collectionRate: Math.round(collectionRate * 100) / 100,
      invoiceCount: {
        total: summaryResult.reduce((acc, r) => acc + (r.count || 0), 0),
        paid: summaryResult.find((r) => r.status === "PAID")?.count || 0,
        unpaid: summaryResult.find((r) => r.status === "UNPAID")?.count || 0,
        overdue: summaryResult.find((r) => r.status === "OVERDUE")?.count || 0,
      },
    };
  }

  /**
   * Get transaction history
   */
  async getTransactionHistory(
    ownerId: string,
    filters: GetTransactionHistoryQuery,
  ): Promise<{
    transactions: TransactionItem[];
    pagination: { page: number; limit: number; total: number };
  }> {
    const page = parseInt(filters.page || "1");
    const limit = parseInt(filters.limit || "20");
    const offset = (page - 1) * limit;

    // Build conditions
    const conditions = [eq(properties.ownerId, ownerId)];

    if (filters.propertyId) {
      conditions.push(eq(invoices.propertyId, filters.propertyId));
    }

    if (filters.startDate) {
      conditions.push(gte(payments.paymentDate, filters.startDate));
    }

    if (filters.endDate) {
      conditions.push(lte(payments.paymentDate, filters.endDate));
    }

    // Query transactions
    const result = await db
      .select({
        id: payments.id,
        invoiceNumber: invoices.invoiceNumber,
        tenantName: tenants.fullName,
        propertyName: properties.name,
        unitName: units.unitName,
        amount: payments.amount,
        paymentMethod: payments.paymentMethod,
        paymentDate: payments.paymentDate,
        invoiceType: invoices.invoiceType,
      })
      .from(payments)
      .innerJoin(invoices, eq(payments.invoiceId, invoices.id))
      .innerJoin(tenants, eq(invoices.tenantId, tenants.id))
      .innerJoin(properties, eq(invoices.propertyId, properties.id))
      .innerJoin(units, eq(invoices.unitId, units.id))
      .where(and(...conditions))
      .orderBy(desc(payments.paymentDate))
      .limit(limit)
      .offset(offset);

    // Count total
    const countResult = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(payments)
      .innerJoin(invoices, eq(payments.invoiceId, invoices.id))
      .innerJoin(properties, eq(invoices.propertyId, properties.id))
      .where(and(...conditions));

    const total = Number(countResult[0]?.count || 0);

    return {
      transactions: result.map((r) => ({
        ...r,
        transactionType: r.invoiceType,
        amount: r.amount || "0",
        paymentMethod: r.paymentMethod || "CASH",
        transactionDate: r.paymentDate?.toString() || "",
      })) as TransactionItem[],
      pagination: {
        page,
        limit,
        total,
      },
    };
  }

  /**
   * Get overdue invoices
   */
  async getOverdueInvoices(
    ownerId: string,
    filters: GetOverdueInvoicesQuery,
  ): Promise<{
    invoices: OverdueInvoiceItem[];
    pagination: { page: number; limit: number; total: number };
    totalOverdueAmount: string;
  }> {
    // Update overdue invoices
    await this.updateOverdueInvoices();

    const page = parseInt(filters.page || "1");
    const limit = parseInt(filters.limit || "10");
    const offset = (page - 1) * limit;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Build conditions
    const conditions = [
      eq(properties.ownerId, ownerId),
      eq(invoices.status, "OVERDUE"),
    ];

    if (filters.propertyId) {
      conditions.push(eq(invoices.propertyId, filters.propertyId));
    }

    if (filters.daysOverdue) {
      const daysAgo = new Date(today);
      daysAgo.setDate(daysAgo.getDate() - parseInt(filters.daysOverdue));
      conditions.push(
        lte(invoices.dueDate, daysAgo.toISOString().split("T")[0]),
      );
    }

    // Query overdue invoices
    const result = await db
      .select({
        id: invoices.id,
        invoiceNumber: invoices.invoiceNumber,
        tenantName: tenants.fullName,
        propertyName: properties.name,
        unitName: units.unitName,
        amount: invoices.amount,
        dueDate: invoices.dueDate,
        createdAt: invoices.createdAt,
      })
      .from(invoices)
      .innerJoin(tenants, eq(invoices.tenantId, tenants.id))
      .innerJoin(properties, eq(invoices.propertyId, properties.id))
      .innerJoin(units, eq(invoices.unitId, units.id))
      .where(and(...conditions))
      .orderBy(asc(invoices.dueDate))
      .limit(limit)
      .offset(offset);

    // Calculate days overdue
    const invoicesWithDays = result.map((inv) => {
      const dueDate = new Date(inv.dueDate);
      const diffTime = today.getTime() - dueDate.getTime();
      const daysOverdue = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      return {
        ...inv,
        daysOverdue,
        amount: inv.amount || "0",
        dueDate: inv.dueDate?.toString() || "",
        createdAt: inv.createdAt?.toISOString() || "",
      };
    });

    // Count total
    const countResult = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(invoices)
      .innerJoin(properties, eq(invoices.propertyId, properties.id))
      .where(and(...conditions));

    const total = Number(countResult[0]?.count || 0);

    // Calculate total overdue amount
    const amountResult = await db
      .select({ total: sql<string>`COALESCE(sum(${invoices.amount}), 0)` })
      .from(invoices)
      .innerJoin(properties, eq(invoices.propertyId, properties.id))
      .where(and(...conditions));

    const totalOverdueAmount = amountResult[0]?.total || "0";

    return {
      invoices: invoicesWithDays as OverdueInvoiceItem[],
      pagination: {
        page,
        limit,
        total,
      },
      totalOverdueAmount,
    };
  }
}
