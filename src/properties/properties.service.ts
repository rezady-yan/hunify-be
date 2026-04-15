import { db } from "../db";
import { properties } from "../db/schema";
import { eq, and, isNull } from "drizzle-orm";
import {
  AddPropertyRequest,
  EditPropertyRequest,
  Property,
} from "./properties.types";

export class PropertiesService {
  /**
   * Menambahkan property baru
   */
  async addProperty(
    ownerId: string,
    data: AddPropertyRequest,
  ): Promise<Property> {
    const [property] = await db
      .insert(properties)
      .values({
        ownerId: ownerId,
        ...data,
        country: data.country || "Indonesia",
        totalFloors: data.totalFloors || "1",
        totalUnits: data.totalUnits || "0",
      })
      .returning();

    return property;
  }

  /**
   * Mengupdate property yang sudah ada
   */
  async editProperty(
    propertyId: string,
    ownerId: string,
    data: EditPropertyRequest,
  ): Promise<Property | null> {
    // Build update data dynamically
    const updateData: any = {
      updatedAt: new Date(),
    };

    if (data.name !== undefined) updateData.name = data.name;
    if (data.address !== undefined) updateData.address = data.address;
    if (data.typeProperties !== undefined)
      updateData.typeProperties = data.typeProperties;
    if (data.city !== undefined) updateData.city = data.city;
    if (data.province !== undefined) updateData.province = data.province;
    if (data.postalCode !== undefined) updateData.postalCode = data.postalCode;
    if (data.country !== undefined) updateData.country = data.country;
    if (data.totalFloors !== undefined)
      updateData.totalFloors = data.totalFloors;
    if (data.totalUnits !== undefined) updateData.totalUnits = data.totalUnits;
    if (data.description !== undefined)
      updateData.description = data.description;
    if (data.thumbnailUrl !== undefined)
      updateData.thumbnailUrl = data.thumbnailUrl;

    const [property] = await db
      .update(properties)
      .set(updateData)
      .where(
        and(
          eq(properties.id, propertyId),
          eq(properties.ownerId, ownerId),
          isNull(properties.deletedAt),
        ),
      )
      .returning();

    return property || null;
  }

  /**
   * Soft delete property
   */
  async deleteProperty(propertyId: string, ownerId: string): Promise<boolean> {
    const [property] = await db
      .update(properties)
      .set({
        deletedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(properties.id, propertyId),
          eq(properties.ownerId, ownerId),
          isNull(properties.deletedAt),
        ),
      )
      .returning();

    return !!property;
  }

  /**
   * Mendapatkan property berdasarkan ID
   */
  async getPropertyById(
    propertyId: string,
    ownerId: string,
  ): Promise<Property | null> {
    const [property] = await db
      .select()
      .from(properties)
      .where(
        and(
          eq(properties.id, propertyId),
          eq(properties.ownerId, ownerId),
          isNull(properties.deletedAt),
        ),
      )
      .limit(1);

    return property || null;
  }

  /**
   * Mendapatkan semua properties milik owner
   */
  async getPropertiesByOwner(ownerId: string): Promise<Property[]> {
    const propertiesList = await db
      .select()
      .from(properties)
      .where(and(eq(properties.ownerId, ownerId), isNull(properties.deletedAt)))
      .orderBy(properties.createdAt);

    return propertiesList;
  }
}
