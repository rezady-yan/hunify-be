import { Context } from "elysia";
import { PropertiesService } from "./properties.service";
import {
  validateAddPropertyInput,
  validateEditPropertyInput,
  ValidationError,
} from "./properties.validation";
import {
  AddPropertyRequest,
  EditPropertyRequest,
  ApiResponse,
} from "./properties.types";

const propertiesService = new PropertiesService();

export class PropertiesController {
  /**
   * Menambahkan property baru
   */
  async addProperty(context: Context): Promise<ApiResponse> {
    try {
      const body = context.body as AddPropertyRequest;
      const userId = context.user?.userId; // dari JWT middleware

      // Validasi authorization
      if (!userId) {
        context.set.status = 401;
        return {
          success: false,
          message: "Unauthorized",
          errors: {
            auth: "User not authenticated",
          },
        };
      }

      // Validasi role (hanya owner atau admin)
      const userRole = context.user?.role;
      if (userRole !== "owner") {
        context.set.status = 403;
        return {
          success: false,
          message: "Forbidden",
          errors: {
            auth: "Only owner or admin can create property",
          },
        };
      }
      // Validasi input
      validateAddPropertyInput(body);

      // Tambah property
      const property = await propertiesService.addProperty(userId, body);

      // Return success response
      context.set.status = 200;
      return {
        success: true,
        message: "Property berhasil ditambahkan",
        data: {
          property: {
            id: property.id,
            name: property.name,
            address: property.address,
            city: property.city,
            province: property.province,
            postalCode: property.postalCode,
            country: property.country,
            totalFloors: property.totalFloors,
            totalUnits: property.totalUnits,
            description: property.description,
            thumbnailUrl: property.thumbnailUrl,
            typeProperties: property.typeProperties,
            createdAt: property.createdAt?.toString(),
          },
        },
      };
    } catch (error) {
      // Handle validation error
      if (error instanceof ValidationError) {
        context.set.status = 400;
        return {
          success: false,
          message: "Validation failed",
          errors: {
            [error.field]: error.message,
          },
        };
      }

      // Handle other errors
      console.error("Add property error:", error);
      context.set.status = 500;
      return {
        success: false,
        message: "Internal server error",
        errors: {
          server: "Something went wrong",
        },
      };
    }
  }

  /**
   * Mengedit property yang sudah ada
   */
  async editProperty(context: Context): Promise<ApiResponse> {
    try {
      const body = context.body as EditPropertyRequest;
      const userId = context.user?.userId;
      const propertyId = context.params.id;

      // Validasi authorization
      if (!userId) {
        context.set.status = 401;
        return {
          success: false,
          message: "Unauthorized",
          errors: {
            auth: "User not authenticated",
          },
        };
      }

      // Validasi role
      const userRole = context.user?.role;
      if (userRole !== "owner" && userRole !== "admin") {
        context.set.status = 403;
        return {
          success: false,
          message: "Forbidden",
          errors: {
            auth: "Only owner or admin can edit property",
          },
        };
      }

      // Validasi input
      validateEditPropertyInput(body);

      // Update property
      const property = await propertiesService.editProperty(
        propertyId,
        userId,
        body,
      );

      if (!property) {
        context.set.status = 404;
        return {
          success: false,
          message: "Property not found",
          errors: {
            property: "Property not found or you don't have access",
          },
        };
      }

      // Return success response
      context.set.status = 200;
      return {
        success: true,
        message: "Property berhasil diupdate",
        data: {
          property: {
            id: property.id,
            name: property.name,
            address: property.address,
            city: property.city,
            province: property.province,
            postalCode: property.postalCode,
            country: property.country,
            totalFloors: property.totalFloors,
            totalUnits: property.totalUnits,
            description: property.description,
            thumbnailUrl: property.thumbnailUrl,
            typeProperties: property.typeProperties,
            updatedAt: property.updatedAt?.toString(),
          },
        },
      };
    } catch (error) {
      // Handle validation error
      if (error instanceof ValidationError) {
        context.set.status = 400;
        return {
          success: false,
          message: "Validation failed",
          errors: {
            [error.field]: error.message,
          },
        };
      }

      // Handle other errors
      console.error("Edit property error:", error);
      context.set.status = 500;
      return {
        success: false,
        message: "Internal server error",
        errors: {
          server: "Something went wrong",
        },
      };
    }
  }

  /**
   * Menghapus property (soft delete)
   */
  async deleteProperty(context: Context): Promise<ApiResponse> {
    try {
      const userId = context.user?.userId;
      const propertyId = context.params.id;

      // Validasi authorization
      if (!userId) {
        context.set.status = 401;
        return {
          success: false,
          message: "Unauthorized",
          errors: {
            auth: "User not authenticated",
          },
        };
      }

      // Validasi role
      const userRole = context.user?.role;
      if (userRole !== "owner" && userRole !== "admin") {
        context.set.status = 403;
        return {
          success: false,
          message: "Forbidden",
          errors: {
            auth: "Only owner or admin can delete property",
          },
        };
      }

      // Delete property
      const deleted = await propertiesService.deleteProperty(
        propertyId,
        userId,
      );

      if (!deleted) {
        context.set.status = 404;
        return {
          success: false,
          message: "Property not found",
          errors: {
            property: "Property not found or you don't have access",
          },
        };
      }

      // Return success response
      context.set.status = 200;
      return {
        success: true,
        message: "Property berhasil dihapus",
      };
    } catch (error) {
      // Handle other errors
      console.error("Delete property error:", error);
      context.set.status = 500;
      return {
        success: false,
        message: "Internal server error",
        errors: {
          server: "Something went wrong",
        },
      };
    }
  }

  /**
   * Mendapatkan detail property
   */
  async getProperty(context: Context): Promise<ApiResponse> {
    try {
      const userId = context.user?.userId;
      const propertyId = context.params.id;

      // Validasi authorization
      if (!userId) {
        context.set.status = 401;
        return {
          success: false,
          message: "Unauthorized",
          errors: {
            auth: "User not authenticated",
          },
        };
      }

      // Get property
      const property = await propertiesService.getPropertyById(
        propertyId,
        userId,
      );

      if (!property) {
        context.set.status = 404;
        return {
          success: false,
          message: "Property not found",
          errors: {
            property: "Property not found or you don't have access",
          },
        };
      }

      // Return success response
      context.set.status = 200;
      return {
        success: true,
        message: "Property retrieved successfully",
        data: {
          property: {
            id: property.id,
            name: property.name,
            address: property.address,
            city: property.city,
            province: property.province,
            postalCode: property.postalCode,
            country: property.country,
            totalFloors: property.totalFloors,
            totalUnits: property.totalUnits,
            description: property.description,
            thumbnailUrl: property.thumbnailUrl,
            typeProperties: property.typeProperties,
            createdAt: property.createdAt?.toString(),
            updatedAt: property.updatedAt?.toString(),
          },
        },
      };
    } catch (error) {
      // Handle other errors
      console.error("Get property error:", error);
      context.set.status = 500;
      return {
        success: false,
        message: "Internal server error",
        errors: {
          server: "Something went wrong",
        },
      };
    }
  }

  /**
   * Mendapatkan semua properties milik user
   */
  async getProperties(context: Context): Promise<ApiResponse> {
    try {
      const userId = context.user?.userId;

      // Validasi authorization
      if (!userId) {
        context.set.status = 401;
        return {
          success: false,
          message: "Unauthorized",
          errors: {
            auth: "User not authenticated",
          },
        };
      }

      // Get properties
      const propertiesList =
        await propertiesService.getPropertiesByOwner(userId);

      // Return success response
      context.set.status = 200;
      return {
        success: true,
        message: "Properties retrieved successfully",
        data: {
          properties: propertiesList.map((property) => ({
            ...property,
            ownerId: undefined, // hide ownerId
            createdAt: property.createdAt?.toString(),
            updatedAt: property.updatedAt?.toString(),
          })),
          total: propertiesList.length,
        },
      };
    } catch (error) {
      // Handle other errors
      console.error("Get properties error:", error);
      context.set.status = 500;
      return {
        success: false,
        message: "Internal server error",
        errors: {
          server: "Something went wrong",
        },
      };
    }
  }
}
