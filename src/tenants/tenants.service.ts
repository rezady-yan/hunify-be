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
    data: CreateTenantRequest,
  ): Promise<Tenant> {
    // Insert tenant
    const result = await db
      .insert(tenants)
      .values({
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

    // Verifikasi tenant exists
    const tenant = await db
      .select()
      .from(tenants)
      .where(eq(tenants.id, data.tenantId))
      .limit(1);

    if (!tenant || tenant.length === 0) {
      throw new Error("Tenant not found");
    }

    // Verifikasi tenant hanya bisa di 1 property - cek apakah tenant sudah punya active tenancy di property lain
    const existingTenancy = await db
      .select()
      .from(tenancies)
      .where(
        and(
          eq(tenancies.tenantId, data.tenantId),
          eq(tenancies.status, "ACTIVE"),
          // Exclude current property if updating
        ),
      )
      .limit(1);

    if (existingTenancy && existingTenancy.length > 0) {
      throw new Error("Tenant already has an active tenancy in another property");
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
    // Verifikasi tenant exists dan owner adalah yang create tenant
    const tenant = await db
      .select()
      .from(tenants)
      .where(eq(tenants.id, tenantId))
      .limit(1);

    if (!tenant || tenant.length === 0) {
      throw new Error("Tenant not found");
    }

    if (tenant[0].createdBy !== ownerId) {
      throw new Error("Access denied");
    }

    // Update tenant
    const result = await db
      .update(tenants)
      .set({
        fullName: data.fullName,
        phoneNumber: data.phoneNumber,
        email: data.email,
        identityNumber: data.identityNumber,
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

    const currentTenancy = existingTenancy[0].tenancy;
    const updateData: any = {
      billingCycle: data.billingCycle || currentTenancy.billingCycle,
      billingAnchorDay: data.billingAnchorDay !== undefined ? data.billingAnchorDay : currentTenancy.billingAnchorDay,
      rentPrice: data.rentPrice || currentTenancy.rentPrice,
      endDate: data.endDate !== undefined ? data.endDate : currentTenancy.endDate,
      updatedAt: new Date(),
    };

    // Jika ada perubahan unit (pindah unit)
    if (data.unitId && data.unitId !== currentTenancy.unitId) {
      // Verify unit baru exists dan milik property yang sama
      const newUnit = await db
        .select()
        .from(units)
        .where(
          and(
            eq(units.id, data.unitId),
            eq(units.propertyId, currentTenancy.propertyId),
          ),
        )
        .limit(1);

      if (!newUnit || newUnit.length === 0) {
        throw new Error("Unit not found in this property");
      }

      // Verify unit baru tidak occupied
      if (newUnit[0].status === "OCCUPIED") {
        throw new Error("New unit is already occupied");
      }

      // Verify unit baru tidak punya active tenancy
      const newUnitActiveTenancy = await db
        .select()
        .from(tenancies)
        .where(
          and(eq(tenancies.unitId, data.unitId), eq(tenancies.status, "ACTIVE")),
        )
        .limit(1);

      if (newUnitActiveTenancy && newUnitActiveTenancy.length > 0) {
        throw new Error("New unit already has an active tenancy");
      }

      // Update unit lama status ke VACANT
      await db
        .update(units)
        .set({
          status: "VACANT",
          updatedAt: new Date(),
        })
        .where(eq(units.id, currentTenancy.unitId));

      // Update unit baru status ke OCCUPIED
      await db
        .update(units)
        .set({
          status: "OCCUPIED",
          updatedAt: new Date(),
        })
        .where(eq(units.id, data.unitId));

      // Add unitId ke update data
      updateData.unitId = data.unitId;

      // Jika ada startDate baru, update juga
      if (data.startDate) {
        updateData.startDate = data.startDate;
      }
    }

    // Update tenancy
    const result = await db
      .update(tenancies)
      .set(updateData)
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

  /**
   * Get all tenants with their tenancies and documents (raw SQL)
   */
  async getViewAll(ownerId: string): Promise<any[]> {
    const result = await db.execute(sql`
      SELECT 
        t.id,
        t.full_name,
        t.phone_number,
        t.email,
        t.identity_number,
        t.address,
        t.emergency_contact_name,
        t.emergency_contact_phone,
        t.notes,
        t.created_by,
        t.created_at as tenant_created_at,
        t.updated_at as tenant_updated_at,
        
        ten.id as tenancy_id,
        ten.tenant_id,
        ten.property_id,
        p.name as property_name,
        ten.unit_id,
        u.unit_name,
        ten.start_date,
        ten.end_date,
        ten.billing_cycle,
        ten.billing_anchor_day,
        ten.rent_price,
        ten.status as tenancy_status,
        ten.created_at as tenancy_created_at,
        ten.updated_at as tenancy_updated_at,
        
        td.id as document_id,
        td.type as document_type,
        td.url as document_url,
        td.uploaded_by,
        td.uploaded_at
      FROM tenants t
      LEFT JOIN tenancies ten ON t.id = ten.tenant_id
      LEFT JOIN properties p ON ten.property_id = p.id
      LEFT JOIN units u ON ten.unit_id = u.id
      LEFT JOIN tenant_documents td ON ten.id = td.tenancy_id
      WHERE t.created_by = ${ownerId}
      ORDER BY t.created_at DESC, ten.start_date DESC
    `);

    // Group results by tenant and tenancy
    const tenantMap = new Map();
    const tenancyMap = new Map();

    for (const row of result) {
      const tenantId = row.id as string;
      
      if (!tenantMap.has(tenantId)) {
        tenantMap.set(tenantId, {
          id: row.id,
          fullName: row.full_name,
          phoneNumber: row.phone_number,
          email: row.email,
          identityNumber: row.identity_number,
          address: row.address,
          emergencyContactName: row.emergency_contact_name,
          emergencyContactPhone: row.emergency_contact_phone,
          notes: row.notes,
          createdBy: row.created_by,
          createdAt: row.tenant_created_at,
          updatedAt: row.tenant_updated_at,
        });
        tenancyMap.set(tenantId, new Map());
      }

      // Add tenancy if exists
      if (row.tenancy_id) {
        const tenancyMap_ = tenancyMap.get(tenantId);
        if (!tenancyMap_.has(row.tenancy_id)) {
          tenancyMap_.set(row.tenancy_id, {
            id: row.tenancy_id,
            tenantId: row.tenant_id,
            propertyId: row.property_id,
            unitId: row.unit_id,
            startDate: row.start_date,
            endDate: row.end_date,
            billingCycle: row.billing_cycle,
            billingAnchorDay: row.billing_anchor_day,
            rentPrice: row.rent_price,
            status: row.tenancy_status,
            createdAt: row.tenancy_created_at,
            updatedAt: row.tenancy_updated_at,
            propertyName: row.property_name,
            unitName: row.unit_name,
          });
        }
      }
    }

    // Build final response
    const viewAllTenants = Array.from(tenantMap.entries()).map(([tenantId, tenant]) => {
      const tenancies = Array.from(tenancyMap.get(tenantId)!.values());
      const documents = result
        .filter(row => row.tenant_id === tenantId && row.document_id)
        .map(row => ({
          id: row.document_id,
          tenancyId: row.tenancy_id,
          type: row.document_type,
          url: row.document_url,
          uploadedBy: row.uploaded_by,
          uploadedAt: row.uploaded_at,
        }))
        .filter((doc, index, arr) => arr.findIndex(d => d.id === doc.id) === index); // Remove duplicates

      return {
        tenant,
        tenancies,
        documents,
      };
    });

    return viewAllTenants;
  }

  /**
   * Get single tenant with their tenancies and documents (raw SQL)
   */
  async getViewAllTenant(ownerId: string, tenantId: string): Promise<any> {
    const result = await db.execute(sql`
      SELECT 
        t.id as tenant_id,
        t.full_name,
        t.phone_number,
        t.email,
        t.identity_number,
        t.address,
        t.emergency_contact_name,
        t.emergency_contact_phone,
        t.notes,
        t.created_by,
        t.created_at as tenant_created_at,
        t.updated_at as tenant_updated_at,
        
        ten.id as tenancy_id,
        ten.tenant_id,
        ten.property_id,
        p.name as property_name,
        ten.unit_id,
        u.unit_name,
        ten.start_date,
        ten.end_date,
        ten.billing_cycle,
        ten.billing_anchor_day,
        ten.rent_price,
        ten.status as tenancy_status,
        ten.created_at as tenancy_created_at,
        ten.updated_at as tenancy_updated_at,
        
        td.id as document_id,
        td.type as document_type,
        td.url as document_url,
        td.uploaded_by,
        td.uploaded_at
      FROM tenants t
      LEFT JOIN tenancies ten ON t.id = ten.tenant_id
      LEFT JOIN properties p ON ten.property_id = p.id
      LEFT JOIN units u ON ten.unit_id = u.id
      LEFT JOIN tenant_documents td ON ten.id = td.tenancy_id
      WHERE t.id = ${tenantId} AND t.created_by = ${ownerId}
      ORDER BY ten.start_date DESC
    `);

    if (!result || result.length === 0) {
      throw new Error('Tenant not found');
    }

    const firstRow = result[0];
    const tenant = {
      id: firstRow.tenant_id,
      fullName: firstRow.full_name,
      phoneNumber: firstRow.phone_number,
      email: firstRow.email,
      identityNumber: firstRow.identity_number,
      address: firstRow.address,
      emergencyContactName: firstRow.emergency_contact_name,
      emergencyContactPhone: firstRow.emergency_contact_phone,
      notes: firstRow.notes,
      createdBy: firstRow.created_by,
      createdAt: firstRow.tenant_created_at,
      updatedAt: firstRow.tenant_updated_at,
    };

    // Group tenancies and documents
    const tenancyMap = new Map();
    for (const row of result) {
      if (row.tenancy_id && !tenancyMap.has(row.tenancy_id)) {
        tenancyMap.set(row.tenancy_id, {
          id: row.tenancy_id,
          tenantId: row.tenant_id,
          propertyId: row.property_id,
          unitId: row.unit_id,
          startDate: row.start_date,
          endDate: row.end_date,
          billingCycle: row.billing_cycle,
          billingAnchorDay: row.billing_anchor_day,
          rentPrice: row.rent_price,
          status: row.tenancy_status,
          createdAt: row.tenancy_created_at,
          updatedAt: row.tenancy_updated_at,
          propertyName: row.property_name,
          unitName: row.unit_name,
        });
      }
    }

    const tenancies = Array.from(tenancyMap.values());
    const documents = result
      .filter(row => row.document_id)
      .map(row => ({
        id: row.document_id,
        tenancyId: row.tenancy_id,
        type: row.document_type,
        url: row.document_url,
        uploadedBy: row.uploaded_by,
        uploadedAt: row.uploaded_at,
      }))
      .filter((doc, index, arr) => arr.findIndex(d => d.id === doc.id) === index); // Remove duplicates

    return {
      tenant,
      tenancies,
      documents,
    };
  }
}
