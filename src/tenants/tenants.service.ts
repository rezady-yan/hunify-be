import { db } from "../db";
import {
  tenants,
  tenancies,
  tenantDocuments,
  properties,
  units,
  users,
} from "../db/schema";
import {
  CreateTenantRequest,
  CreateTenancyRequest,
  EditTenantRequest,
  EditTenancyRequest,
  EndTenancyRequest,
  UploadDocumentRequest,
  Tenant,
  Tenancy,
  TenantDocument,
  TenantListItem,
  TenantDetail,
  GetTenantsQuery,
} from "./tenants.types";
import { eq, and, ilike, or, sql, desc } from "drizzle-orm";

export class TenantsService {
  /**
   * Membuat tenant baru
   */
  async createTenant(
    ownerId: string,
    propertyId: string,
    data: CreateTenantRequest,
  ): Promise<Tenant> {
    // Verifikasi bahwa property milik owner
    const property = await db
      .select()
      .from(properties)
      .where(
        and(eq(properties.id, propertyId), eq(properties.ownerId, ownerId)),
      )
      .limit(1);

    if (!property || property.length === 0) {
      throw new Error("Property not found or access denied");
    }

    // Cek duplikasi phone number dalam property
    const existingTenant = await db
      .select()
      .from(tenants)
      .where(
        and(
          eq(tenants.propertyId, propertyId),
          eq(tenants.phoneNumber, data.phoneNumber),
        ),
      )
      .limit(1);

    if (existingTenant && existingTenant.length > 0) {
      throw new Error(
        "Tenant with this phone number already exists in this property",
      );
    }

    // Insert tenant
    const result = await db
      .insert(tenants)
      .values({
        propertyId,
        fullName: data.fullName,
        phoneNumber: data.phoneNumber,
        email: data.email || null,
        identityNumber: data.identityNumber || null,
        address: data.address || null,
        emergencyContactName: data.emergencyContactName || null,
        emergencyContactPhone: data.emergencyContactPhone || null,
        notes: data.notes || null,
        createdBy: ownerId,
      })
      .returning();

    return result[0] as Tenant;
  }

  /**
   * Membuat tenancy (assign tenant ke unit)
   */
  async createTenancy(
    ownerId: string,
    data: CreateTenancyRequest,
  ): Promise<Tenancy> {
    // Verifikasi property ownership
    const property = await db
      .select()
      .from(properties)
      .where(
        and(
          eq(properties.id, data.propertyId),
          eq(properties.ownerId, ownerId),
        ),
      )
      .limit(1);

    if (!property || property.length === 0) {
      throw new Error("Property not found or access denied");
    }

    // Verifikasi tenant exists dan milik property yang sama
    const tenant = await db
      .select()
      .from(tenants)
      .where(
        and(
          eq(tenants.id, data.tenantId),
          eq(tenants.propertyId, data.propertyId),
        ),
      )
      .limit(1);

    if (!tenant || tenant.length === 0) {
      throw new Error("Tenant not found in this property");
    }

    // Verifikasi unit exists dan milik property yang sama
    const unit = await db
      .select()
      .from(units)
      .where(
        and(eq(units.id, data.unitId), eq(units.propertyId, data.propertyId)),
      )
      .limit(1);

    if (!unit || unit.length === 0) {
      throw new Error("Unit not found in this property");
    }

    // Cek apakah unit sudah occupied
    if (unit[0].status === "OCCUPIED") {
      throw new Error("Unit is already occupied");
    }

    // Cek apakah unit sudah memiliki active tenancy
    const activeTenancy = await db
      .select()
      .from(tenancies)
      .where(
        and(eq(tenancies.unitId, data.unitId), eq(tenancies.status, "ACTIVE")),
      )
      .limit(1);

    if (activeTenancy && activeTenancy.length > 0) {
      throw new Error("Unit already has an active tenancy");
    }

    // Insert tenancy
    const result = await db
      .insert(tenancies)
      .values({
        tenantId: data.tenantId,
        propertyId: data.propertyId,
        unitId: data.unitId,
        startDate: data.startDate,
        endDate: data.endDate || null,
        billingCycle: data.billingCycle,
        billingAnchorDay: data.billingAnchorDay || null,
        rentPrice: data.rentPrice,
        status: "ACTIVE",
      })
      .returning();

    // Update unit status menjadi OCCUPIED
    await db
      .update(units)
      .set({
        status: "OCCUPIED",
        updatedAt: new Date(),
      })
      .where(eq(units.id, data.unitId));

    return result[0] as Tenancy;
  }

  /**
   * Get list tenancies dengan filters
   */
  async getTenancies(
    ownerId: string,
    filters: GetTenantsQuery,
  ): Promise<{
    tenancies: TenantListItem[];
    pagination: { page: number; limit: number; total: number };
  }> {
    const page = parseInt(filters.page || "1");
    const limit = parseInt(filters.limit || "10");
    const offset = (page - 1) * limit;

    // Build WHERE conditions
    const conditions = [];

    // Filter by owner's properties
    conditions.push(eq(properties.ownerId, ownerId));

    // Filter by property
    if (filters.propertyId) {
      conditions.push(eq(tenancies.propertyId, filters.propertyId));
    }

    // Filter by status
    if (filters.status) {
      conditions.push(eq(tenancies.status, filters.status));
    }

    // Search by tenant name
    if (filters.search) {
      conditions.push(ilike(tenants.fullName, `%${filters.search}%`));
    }

    // Query tenancies
    const result = await db
      .select({
        id: tenancies.id,
        tenantId: tenants.id,
        fullName: tenants.fullName,
        phoneNumber: tenants.phoneNumber,
        propertyName: properties.name,
        unitName: units.unitName,
        billingCycle: tenancies.billingCycle,
        startDate: tenancies.startDate,
        endDate: tenancies.endDate,
        status: tenancies.status,
        createdAt: tenancies.createdAt,
      })
      .from(tenancies)
      .innerJoin(tenants, eq(tenancies.tenantId, tenants.id))
      .innerJoin(properties, eq(tenancies.propertyId, properties.id))
      .innerJoin(units, eq(tenancies.unitId, units.id))
      .where(and(...conditions))
      .orderBy(desc(tenancies.createdAt))
      .limit(limit)
      .offset(offset);

    // Count total
    const countResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(tenancies)
      .innerJoin(tenants, eq(tenancies.tenantId, tenants.id))
      .innerJoin(properties, eq(tenancies.propertyId, properties.id))
      .innerJoin(units, eq(tenancies.unitId, units.id))
      .where(and(...conditions));

    const total = Number(countResult[0]?.count || 0);

    return {
      tenancies: result.map((r) => ({
        ...r,
        startDate: r.startDate?.toString() || "",
        endDate: r.endDate?.toString() || null,
        createdAt: r.createdAt?.toISOString() || "",
      })) as TenantListItem[],
      pagination: {
        page,
        limit,
        total,
      },
    };
  }

  /**
   * Get detail tenancy
   */
  async getTenancy(ownerId: string, tenancyId: string): Promise<TenantDetail> {
    // Query tenancy dengan joins
    const result = await db
      .select({
        tenancy: tenancies,
        tenant: tenants,
        property: properties,
        unit: units,
      })
      .from(tenancies)
      .innerJoin(tenants, eq(tenancies.tenantId, tenants.id))
      .innerJoin(properties, eq(tenancies.propertyId, properties.id))
      .innerJoin(units, eq(tenancies.unitId, units.id))
      .where(and(eq(tenancies.id, tenancyId), eq(properties.ownerId, ownerId)))
      .limit(1);

    if (!result || result.length === 0) {
      throw new Error("Tenancy not found or access denied");
    }

    // Query documents
    const docs = await db
      .select()
      .from(tenantDocuments)
      .where(eq(tenantDocuments.tenancyId, tenancyId));

    const data = result[0];

    return {
      tenant: data.tenant,
      tenancy: {
        ...data.tenancy,
        propertyName: data.property.name,
        unitName: data.unit.unitName,
      },
      documents: docs as TenantDocument[],
    };
  }

  /**
   * Edit tenant
   */
  async editTenant(
    ownerId: string,
    tenantId: string,
    data: EditTenantRequest,
  ): Promise<Tenant> {
    // Verifikasi tenant exists dan owner punya akses
    const existingTenant = await db
      .select({
        tenant: tenants,
        property: properties,
      })
      .from(tenants)
      .innerJoin(properties, eq(tenants.propertyId, properties.id))
      .where(and(eq(tenants.id, tenantId), eq(properties.ownerId, ownerId)))
      .limit(1);

    if (!existingTenant || existingTenant.length === 0) {
      throw new Error("Tenant not found or access denied");
    }

    // Update tenant
    const result = await db
      .update(tenants)
      .set({
        phoneNumber: data.phoneNumber,
        email: data.email,
        address: data.address,
        emergencyContactName: data.emergencyContactName,
        emergencyContactPhone: data.emergencyContactPhone,
        notes: data.notes,
        updatedAt: new Date(),
      })
      .where(eq(tenants.id, tenantId))
      .returning();

    return result[0] as Tenant;
  }

  /**
   * Edit tenancy
   */
  async editTenancy(
    ownerId: string,
    tenancyId: string,
    data: EditTenancyRequest,
  ): Promise<Tenancy> {
    // Verifikasi tenancy exists dan owner punya akses
    const existingTenancy = await db
      .select({
        tenancy: tenancies,
        property: properties,
      })
      .from(tenancies)
      .innerJoin(properties, eq(tenancies.propertyId, properties.id))
      .where(and(eq(tenancies.id, tenancyId), eq(properties.ownerId, ownerId)))
      .limit(1);

    if (!existingTenancy || existingTenancy.length === 0) {
      throw new Error("Tenancy not found or access denied");
    }

    // Update tenancy
    const result = await db
      .update(tenancies)
      .set({
        billingCycle: data.billingCycle,
        billingAnchorDay: data.billingAnchorDay,
        rentPrice: data.rentPrice,
        endDate: data.endDate,
        updatedAt: new Date(),
      })
      .where(eq(tenancies.id, tenancyId))
      .returning();

    return result[0] as Tenancy;
  }

  /**
   * End tenancy
   */
  async endTenancy(
    ownerId: string,
    tenancyId: string,
    data: EndTenancyRequest,
  ): Promise<Tenancy> {
    // Verifikasi tenancy exists dan owner punya akses
    const existingTenancy = await db
      .select({
        tenancy: tenancies,
        property: properties,
      })
      .from(tenancies)
      .innerJoin(properties, eq(tenancies.propertyId, properties.id))
      .where(and(eq(tenancies.id, tenancyId), eq(properties.ownerId, ownerId)))
      .limit(1);

    if (!existingTenancy || existingTenancy.length === 0) {
      throw new Error("Tenancy not found or access denied");
    }

    const tenancy = existingTenancy[0].tenancy;

    // Cek apakah tenancy sudah ended
    if (tenancy.status === "ENDED") {
      throw new Error("Tenancy is already ended");
    }

    const endDate = data.endDate || new Date().toISOString().split("T")[0];

    // Update tenancy status
    const result = await db
      .update(tenancies)
      .set({
        status: "ENDED",
        endDate,
        updatedAt: new Date(),
      })
      .where(eq(tenancies.id, tenancyId))
      .returning();

    // Update unit status menjadi VACANT
    await db
      .update(units)
      .set({
        status: "VACANT",
        updatedAt: new Date(),
      })
      .where(eq(units.id, tenancy.unitId));

    return result[0] as Tenancy;
  }

  /**
   * Upload document
   */
  async uploadDocument(
    ownerId: string,
    tenancyId: string,
    data: UploadDocumentRequest & { url: string },
  ): Promise<TenantDocument> {
    // Verifikasi tenancy exists dan owner punya akses
    const existingTenancy = await db
      .select({
        tenancy: tenancies,
        property: properties,
      })
      .from(tenancies)
      .innerJoin(properties, eq(tenancies.propertyId, properties.id))
      .where(and(eq(tenancies.id, tenancyId), eq(properties.ownerId, ownerId)))
      .limit(1);

    if (!existingTenancy || existingTenancy.length === 0) {
      throw new Error("Tenancy not found or access denied");
    }

    // Insert document
    const result = await db
      .insert(tenantDocuments)
      .values({
        tenancyId,
        type: data.type,
        url: data.url,
        uploadedBy: ownerId,
      })
      .returning();

    return result[0] as TenantDocument;
  }

  /**
   * Delete document
   */
  async deleteDocument(
    ownerId: string,
    tenancyId: string,
    documentId: string,
  ): Promise<void> {
    // Verifikasi document exists dan owner punya akses
    const existingDoc = await db
      .select({
        document: tenantDocuments,
        tenancy: tenancies,
        property: properties,
      })
      .from(tenantDocuments)
      .innerJoin(tenancies, eq(tenantDocuments.tenancyId, tenancies.id))
      .innerJoin(properties, eq(tenancies.propertyId, properties.id))
      .where(
        and(
          eq(tenantDocuments.id, documentId),
          eq(tenantDocuments.tenancyId, tenancyId),
          eq(properties.ownerId, ownerId),
        ),
      )
      .limit(1);

    if (!existingDoc || existingDoc.length === 0) {
      throw new Error("Document not found or access denied");
    }

    // Delete document
    await db.delete(tenantDocuments).where(eq(tenantDocuments.id, documentId));
  }
}
