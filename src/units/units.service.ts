import { db } from "../db";
import { units, properties, tenants } from "../db/schema";
import {
  CreateUnitRequest,
  BulkCreateUnitRequest,
  EditUnitRequest,
  AssignTenantRequest,
  UnitStatus,
  Unit,
  UnitListItem,
  UnitFilters,
} from "./units.types";
import { eq, and, isNull, ilike, or, sql } from "drizzle-orm";

export class UnitsService {
  /**
   * Membuat unit baru
   */
  async createUnit(ownerId: string, data: CreateUnitRequest): Promise<Unit> {
    // Verifikasi bahwa property milik owner
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

    // Cek duplikasi unit name dalam property
    const existingUnit = await db
      .select()
      .from(units)
      .where(
        and(
          eq(units.propertyId, data.propertyId),
          eq(units.unitName, data.unitName),
        ),
      )
      .limit(1);

    if (existingUnit && existingUnit.length > 0) {
      throw new Error("Unit name already exists in this property");
    }

    // Insert unit
    const result = await db
      .insert(units)
      .values({
        propertyId: data.propertyId,
        unitName: data.unitName,
        price: data.price,
        floor: data.floor || null,
        description: data.description || null,
        status: "VACANT",
      })
      .returning();

    return result[0] as Unit;
  }

  /**
   * Bulk create units
   */
  async bulkCreateUnits(
    ownerId: string,
    data: BulkCreateUnitRequest,
  ): Promise<{ created: number; units: string[] }> {
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

    const startNum = data.startNumber || 1;
    const createdUnits: string[] = [];
    const unitsToInsert = [];

    for (let i = 0; i < data.totalUnits; i++) {
      const unitNumber = (startNum + i).toString().padStart(2, "0");
      const unitName = `${data.prefix}${unitNumber}`;

      // Cek duplikasi
      const existing = await db
        .select()
        .from(units)
        .where(
          and(
            eq(units.propertyId, data.propertyId),
            eq(units.unitName, unitName),
          ),
        )
        .limit(1);

      if (existing && existing.length > 0) {
        continue; // Skip duplicate
      }

      unitsToInsert.push({
        propertyId: data.propertyId,
        unitName: unitName,
        price: data.price,
        status: "VACANT" as UnitStatus,
      });

      createdUnits.push(unitName);
    }

    if (unitsToInsert.length > 0) {
      await db.insert(units).values(unitsToInsert);
    }

    return {
      created: unitsToInsert.length,
      units: createdUnits,
    };
  }

  /**
   * Get list units dengan filter
   */
  async getUnits(
    ownerId: string,
    filters: UnitFilters,
  ): Promise<{ units: UnitListItem[]; total: number }> {
    const page = filters.page || 1;
    const limit = filters.limit || 10;
    const offset = (page - 1) * limit;

    // Build where conditions
    const conditions = [];

    // Filter by owner's properties only
    const ownerProperties = await db
      .select({ id: properties.id })
      .from(properties)
      .where(eq(properties.ownerId, ownerId));

    const propertyIds = ownerProperties.map((p) => p.id);

    if (propertyIds.length === 0) {
      return { units: [], total: 0 };
    }

    // Filter by specific property
    if (filters.propertyId) {
      conditions.push(eq(units.propertyId, filters.propertyId));
    } else {
      // Filter only owner's properties
      conditions.push(
        or(...propertyIds.map((id) => eq(units.propertyId, id)))!,
      );
    }

    // Filter by status
    if (filters.status) {
      conditions.push(eq(units.status, filters.status));
    }

    // Search by unit name
    if (filters.search) {
      conditions.push(ilike(units.unitName, `%${filters.search}%`));
    }

    // Get units with property and tenant info
    const unitsData = await db
      .select({
        id: units.id,
        propertyId: units.propertyId,
        unitName: units.unitName,
        price: units.price,
        floor: units.floor,
        description: units.description,
        status: units.status,
        createdAt: units.createdAt,
        updatedAt: units.updatedAt,
        propertyName: properties.name,
      })
      .from(units)
      .leftJoin(properties, eq(units.propertyId, properties.id))
      .where(and(...conditions))
      .limit(limit)
      .offset(offset);

    // Get total count
    const totalResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(units)
      .where(and(...conditions));

    const total = Number(totalResult[0]?.count || 0);

    return {
      units: unitsData as UnitListItem[],
      total,
    };
  }

  /**
   * Get single unit by ID
   */
  async getUnitById(
    ownerId: string,
    unitId: string,
  ): Promise<UnitListItem | null> {
    const result = await db
      .select({
        id: units.id,
        propertyId: units.propertyId,
        unitName: units.unitName,
        price: units.price,
        floor: units.floor,
        description: units.description,
        status: units.status,
        createdAt: units.createdAt,
        updatedAt: units.updatedAt,
        propertyName: properties.name,
      })
      .from(units)
      .leftJoin(properties, eq(units.propertyId, properties.id))
      .where(and(eq(units.id, unitId), eq(properties.ownerId, ownerId)))
      .limit(1);

    return result.length > 0 ? (result[0] as UnitListItem) : null;
  }

  /**
   * Edit unit
   */
  async editUnit(
    ownerId: string,
    unitId: string,
    data: EditUnitRequest,
  ): Promise<Unit | null> {
    // Verifikasi ownership
    const unit = await this.getUnitById(ownerId, unitId);
    if (!unit) {
      return null;
    }

    // Cek duplikasi jika unit name diubah
    if (data.unitName) {
      const existing = await db
        .select()
        .from(units)
        .where(
          and(
            eq(units.propertyId, unit.propertyId),
            eq(units.unitName, data.unitName),
          ),
        )
        .limit(1);

      if (existing && existing.length > 0 && existing[0].id !== unitId) {
        throw new Error("Unit name already exists in this property");
      }
    }

    // Update unit
    const updateData: any = {
      updatedAt: new Date(),
    };

    if (data.unitName !== undefined) updateData.unitName = data.unitName;
    if (data.price !== undefined) updateData.price = data.price;
    if (data.floor !== undefined) updateData.floor = data.floor || null;
    if (data.description !== undefined)
      updateData.description = data.description || null;

    const result = await db
      .update(units)
      .set(updateData)
      .where(eq(units.id, unitId))
      .returning();

    return result.length > 0 ? (result[0] as Unit) : null;
  }

  /**
   * Delete unit
   */
  async deleteUnit(ownerId: string, unitId: string): Promise<boolean> {
    // Verifikasi ownership
    const unit = await this.getUnitById(ownerId, unitId);
    if (!unit) {
      return false;
    }

    // Cek apakah unit masih occupied
    if (unit.status === "OCCUPIED") {
      throw new Error("Cannot delete occupied unit");
    }

    // Delete unit
    await db.delete(units).where(eq(units.id, unitId));

    return true;
  }

  /**
   * Assign tenant to unit
   */
  async assignTenant(
    ownerId: string,
    unitId: string,
    data: AssignTenantRequest,
  ): Promise<Unit | null> {
    // Verifikasi ownership
    const unit = await this.getUnitById(ownerId, unitId);
    if (!unit) {
      return null;
    }

    // Cek apakah unit sudah occupied
    if (unit.status === "OCCUPIED") {
      throw new Error("Unit is already occupied");
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

    // Update unit
    const result = await db
      .update(units)
      .set({
        status: "OCCUPIED",
        updatedAt: new Date(),
      })
      .where(eq(units.id, unitId))
      .returning();

    return result.length > 0 ? (result[0] as Unit) : null;
  }

  /**
   * Unassign tenant from unit
   */
  async unassignTenant(ownerId: string, unitId: string): Promise<Unit | null> {
    // Verifikasi ownership
    const unit = await this.getUnitById(ownerId, unitId);
    if (!unit) {
      return null;
    }

    // Update unit
    const result = await db
      .update(units)
      .set({
        status: "VACANT",
        updatedAt: new Date(),
      })
      .where(eq(units.id, unitId))
      .returning();

    return result.length > 0 ? (result[0] as Unit) : null;
  }

  /**
   * Update unit status
   */
  async updateStatus(
    ownerId: string,
    unitId: string,
    status: UnitStatus,
  ): Promise<Unit | null> {
    // Verifikasi ownership
    const unit = await this.getUnitById(ownerId, unitId);
    if (!unit) {
      return null;
    }

    // Update unit
    const result = await db
      .update(units)
      .set({
        status: status,
        updatedAt: new Date(),
      })
      .where(eq(units.id, unitId))
      .returning();

    return result.length > 0 ? (result[0] as Unit) : null;
  }
}
