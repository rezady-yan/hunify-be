import { Context } from "elysia";
import { UnitsService } from "./units.service";
import {
  validateCreateUnitInput,
  validateBulkCreateUnitInput,
  validateEditUnitInput,
  validateAssignTenantInput,
  validateUpdateStatusInput,
  ValidationError,
} from "./units.validation";
import {
  CreateUnitRequest,
  BulkCreateUnitRequest,
  EditUnitRequest,
  AssignTenantRequest,
  UpdateStatusRequest,
  ApiResponse,
  UnitFilters,
} from "./units.types";

const unitsService = new UnitsService();

export class UnitsController {
  /**
   * Create unit
   */
  async createUnit(context: Context): Promise<ApiResponse> {
    try {
      const body = context.body as CreateUnitRequest;
      const userId = context.user?.userId;

      if (!userId) {
        context.set.status = 401;
        return {
          success: false,
          message: "Unauthorized",
          errors: { auth: "User not authenticated" },
        };
      }

      const userRole = context.user?.role;
      if (userRole !== "owner") {
        context.set.status = 403;
        return {
          success: false,
          message: "Forbidden",
          errors: { auth: "Only owner can create unit" },
        };
      }

      validateCreateUnitInput(body);

      const unit = await unitsService.createUnit(userId, body);

      context.set.status = 201;
      return {
        success: true,
        message: "Unit created successfully",
        data: {
          unit: {
            id: unit.id,
            propertyId: unit.propertyId,
            unitName: unit.unitName,
            price: unit.price,
            floor: unit.floor,
            description: unit.description,
            status: unit.status,
            createdAt: unit.createdAt?.toString(),
          },
        },
      };
    } catch (error) {
      if (error instanceof ValidationError) {
        context.set.status = 400;
        return {
          success: false,
          message: "Validation failed",
          errors: { [error.field]: error.message },
        };
      }

      console.error("Create unit error:", error);
      context.set.status = 500;
      return {
        success: false,
        message: (error as Error).message || "Internal server error",
        errors: { server: "Something went wrong" },
      };
    }
  }

  /**
   * Bulk create units
   */
  async bulkCreateUnits(context: Context): Promise<ApiResponse> {
    try {
      const body = context.body as BulkCreateUnitRequest;
      const userId = context.user?.userId;

      if (!userId) {
        context.set.status = 401;
        return {
          success: false,
          message: "Unauthorized",
          errors: { auth: "User not authenticated" },
        };
      }

      const userRole = context.user?.role;
      if (userRole !== "owner") {
        context.set.status = 403;
        return {
          success: false,
          message: "Forbidden",
          errors: { auth: "Only owner can create units" },
        };
      }

      validateBulkCreateUnitInput(body);

      const result = await unitsService.bulkCreateUnits(userId, body);

      context.set.status = 201;
      return {
        success: true,
        message: `${result.created} units created successfully`,
        data: result,
      };
    } catch (error) {
      if (error instanceof ValidationError) {
        context.set.status = 400;
        return {
          success: false,
          message: "Validation failed",
          errors: { [error.field]: error.message },
        };
      }

      console.error("Bulk create units error:", error);
      context.set.status = 500;
      return {
        success: false,
        message: (error as Error).message || "Internal server error",
        errors: { server: "Something went wrong" },
      };
    }
  }

  /**
   * Get list units
   */
  async getUnits(context: Context): Promise<ApiResponse> {
    try {
      const userId = context.user?.userId;

      if (!userId) {
        context.set.status = 401;
        return {
          success: false,
          message: "Unauthorized",
          errors: { auth: "User not authenticated" },
        };
      }

      const filters: UnitFilters = {
        propertyId: context.query.propertyId as string,
        status: context.query.status as any,
        search: context.query.search as string,
        page: context.query.page ? parseInt(context.query.page as string) : 1,
        limit: context.query.limit
          ? parseInt(context.query.limit as string)
          : 10,
      };

      const result = await unitsService.getUnits(userId, filters);

      context.set.status = 200;
      return {
        success: true,
        message: "Units retrieved successfully",
        data: {
          units: result.units.map((unit) => ({
            id: unit.id,
            propertyId: unit.propertyId,
            propertyName: unit.propertyName,
            unitName: unit.unitName,
            price: unit.price,
            floor: unit.floor,
            description: unit.description,
            status: unit.status,
            tenantId: unit.tenantId,
            tenantName: unit.tenantName,
            createdAt: unit.createdAt?.toString(),
            updatedAt: unit.updatedAt?.toString(),
          })),
          pagination: {
            page: filters.page,
            limit: filters.limit,
            total: result.total,
          },
        },
      };
    } catch (error) {
      console.error("Get units error:", error);
      context.set.status = 500;
      return {
        success: false,
        message: "Internal server error",
        errors: { server: "Something went wrong" },
      };
    }
  }

  /**
   * Get unit detail
   */
  async getUnit(context: Context): Promise<ApiResponse> {
    try {
      const userId = context.user?.userId;
      const unitId = context.params.id;

      if (!userId) {
        context.set.status = 401;
        return {
          success: false,
          message: "Unauthorized",
          errors: { auth: "User not authenticated" },
        };
      }

      const unit = await unitsService.getUnitById(userId, unitId);

      if (!unit) {
        context.set.status = 404;
        return {
          success: false,
          message: "Unit not found",
          errors: { unit: "Unit not found or access denied" },
        };
      }

      context.set.status = 200;
      return {
        success: true,
        message: "Unit retrieved successfully",
        data: {
          unit: {
            id: unit.id,
            propertyId: unit.propertyId,
            propertyName: unit.propertyName,
            unitName: unit.unitName,
            price: unit.price,
            floor: unit.floor,
            description: unit.description,
            status: unit.status,
            tenantId: unit.tenantId,
            tenantName: unit.tenantName,
            createdAt: unit.createdAt?.toString(),
            updatedAt: unit.updatedAt?.toString(),
          },
        },
      };
    } catch (error) {
      console.error("Get unit error:", error);
      context.set.status = 500;
      return {
        success: false,
        message: "Internal server error",
        errors: { server: "Something went wrong" },
      };
    }
  }

  /**
   * Edit unit
   */
  async editUnit(context: Context): Promise<ApiResponse> {
    try {
      const body = context.body as EditUnitRequest;
      const userId = context.user?.userId;
      const unitId = context.params.id;

      if (!userId) {
        context.set.status = 401;
        return {
          success: false,
          message: "Unauthorized",
          errors: { auth: "User not authenticated" },
        };
      }

      const userRole = context.user?.role;
      if (userRole !== "owner") {
        context.set.status = 403;
        return {
          success: false,
          message: "Forbidden",
          errors: { auth: "Only owner can edit unit" },
        };
      }

      validateEditUnitInput(body);

      const unit = await unitsService.editUnit(userId, unitId, body);

      if (!unit) {
        context.set.status = 404;
        return {
          success: false,
          message: "Unit not found",
          errors: { unit: "Unit not found or access denied" },
        };
      }

      context.set.status = 200;
      return {
        success: true,
        message: "Unit updated successfully",
        data: {
          unit: {
            id: unit.id,
            propertyId: unit.propertyId,
            unitName: unit.unitName,
            price: unit.price,
            floor: unit.floor,
            description: unit.description,
            status: unit.status,
            updatedAt: unit.updatedAt?.toString(),
          },
        },
      };
    } catch (error) {
      if (error instanceof ValidationError) {
        context.set.status = 400;
        return {
          success: false,
          message: "Validation failed",
          errors: { [error.field]: error.message },
        };
      }

      console.error("Edit unit error:", error);
      context.set.status = 500;
      return {
        success: false,
        message: (error as Error).message || "Internal server error",
        errors: { server: "Something went wrong" },
      };
    }
  }

  /**
   * Delete unit
   */
  async deleteUnit(context: Context): Promise<ApiResponse> {
    try {
      const userId = context.user?.userId;
      const unitId = context.params.id;

      if (!userId) {
        context.set.status = 401;
        return {
          success: false,
          message: "Unauthorized",
          errors: { auth: "User not authenticated" },
        };
      }

      const userRole = context.user?.role;
      if (userRole !== "owner") {
        context.set.status = 403;
        return {
          success: false,
          message: "Forbidden",
          errors: { auth: "Only owner can delete unit" },
        };
      }

      const deleted = await unitsService.deleteUnit(userId, unitId);

      if (!deleted) {
        context.set.status = 404;
        return {
          success: false,
          message: "Unit not found",
          errors: { unit: "Unit not found or access denied" },
        };
      }

      context.set.status = 200;
      return {
        success: true,
        message: "Unit deleted successfully",
      };
    } catch (error) {
      console.error("Delete unit error:", error);
      context.set.status = 500;
      return {
        success: false,
        message: (error as Error).message || "Internal server error",
        errors: { server: "Something went wrong" },
      };
    }
  }

  /**
   * Assign tenant to unit
   */
  async assignTenant(context: Context): Promise<ApiResponse> {
    try {
      const body = context.body as AssignTenantRequest;
      const userId = context.user?.userId;
      const unitId = context.params.id;

      if (!userId) {
        context.set.status = 401;
        return {
          success: false,
          message: "Unauthorized",
          errors: { auth: "User not authenticated" },
        };
      }

      const userRole = context.user?.role;
      if (userRole !== "owner") {
        context.set.status = 403;
        return {
          success: false,
          message: "Forbidden",
          errors: { auth: "Only owner can assign tenant" },
        };
      }

      validateAssignTenantInput(body);

      const unit = await unitsService.assignTenant(userId, unitId, body);

      if (!unit) {
        context.set.status = 404;
        return {
          success: false,
          message: "Unit not found",
          errors: { unit: "Unit not found or access denied" },
        };
      }

      context.set.status = 200;
      return {
        success: true,
        message: "Tenant assigned successfully",
        data: {
          unit: {
            id: unit.id,
            status: unit.status,
            tenantId: unit.tenantId,
          },
        },
      };
    } catch (error) {
      if (error instanceof ValidationError) {
        context.set.status = 400;
        return {
          success: false,
          message: "Validation failed",
          errors: { [error.field]: error.message },
        };
      }

      console.error("Assign tenant error:", error);
      context.set.status = 500;
      return {
        success: false,
        message: (error as Error).message || "Internal server error",
        errors: { server: "Something went wrong" },
      };
    }
  }

  /**
   * Unassign tenant from unit
   */
  async unassignTenant(context: Context): Promise<ApiResponse> {
    try {
      const userId = context.user?.userId;
      const unitId = context.params.id;

      if (!userId) {
        context.set.status = 401;
        return {
          success: false,
          message: "Unauthorized",
          errors: { auth: "User not authenticated" },
        };
      }

      const userRole = context.user?.role;
      if (userRole !== "owner") {
        context.set.status = 403;
        return {
          success: false,
          message: "Forbidden",
          errors: { auth: "Only owner can unassign tenant" },
        };
      }

      const unit = await unitsService.unassignTenant(userId, unitId);

      if (!unit) {
        context.set.status = 404;
        return {
          success: false,
          message: "Unit not found",
          errors: { unit: "Unit not found or access denied" },
        };
      }

      context.set.status = 200;
      return {
        success: true,
        message: "Tenant unassigned successfully",
        data: {
          unit: {
            id: unit.id,
            status: unit.status,
            tenantId: unit.tenantId,
          },
        },
      };
    } catch (error) {
      console.error("Unassign tenant error:", error);
      context.set.status = 500;
      return {
        success: false,
        message: (error as Error).message || "Internal server error",
        errors: { server: "Something went wrong" },
      };
    }
  }

  /**
   * Update unit status
   */
  async updateStatus(context: Context): Promise<ApiResponse> {
    try {
      const body = context.body as UpdateStatusRequest;
      const userId = context.user?.userId;
      const unitId = context.params.id;

      if (!userId) {
        context.set.status = 401;
        return {
          success: false,
          message: "Unauthorized",
          errors: { auth: "User not authenticated" },
        };
      }

      const userRole = context.user?.role;
      if (userRole !== "owner") {
        context.set.status = 403;
        return {
          success: false,
          message: "Forbidden",
          errors: { auth: "Only owner can update status" },
        };
      }

      validateUpdateStatusInput(body);

      const unit = await unitsService.updateStatus(userId, unitId, body.status);

      if (!unit) {
        context.set.status = 404;
        return {
          success: false,
          message: "Unit not found",
          errors: { unit: "Unit not found or access denied" },
        };
      }

      context.set.status = 200;
      return {
        success: true,
        message: "Unit status updated successfully",
        data: {
          unit: {
            id: unit.id,
            status: unit.status,
            updatedAt: unit.updatedAt?.toString(),
          },
        },
      };
    } catch (error) {
      if (error instanceof ValidationError) {
        context.set.status = 400;
        return {
          success: false,
          message: "Validation failed",
          errors: { [error.field]: error.message },
        };
      }

      console.error("Update status error:", error);
      context.set.status = 500;
      return {
        success: false,
        message: "Internal server error",
        errors: { server: "Something went wrong" },
      };
    }
  }
}
