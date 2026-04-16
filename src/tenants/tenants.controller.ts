import { Context } from "elysia";
import { TenantsService } from "./tenants.service";
import {
  validateCreateTenantInput,
  validateCreateTenancyInput,
  validateEditTenantInput,
  validateEditTenancyInput,
  validateEndTenancyInput,
  validateUploadDocumentInput,
  ValidationError,
} from "./tenants.validation";
import {
  CreateTenantRequest,
  CreateTenancyRequest,
  EditTenantRequest,
  EditTenancyRequest,
  EndTenancyRequest,
  UploadDocumentRequest,
  GetTenantsQuery,
  ApiResponse,
} from "./tenants.types";

const tenantsService = new TenantsService();

interface AuthContext extends Context {
  user?: {
    userId: string;
    username: string;
    email: string;
    role: string;
  };
}

export class TenantsController {
  /**
   * Create tenant
   */
  async createTenant(context: AuthContext): Promise<ApiResponse> {
    try {
      const body = context.body as CreateTenantRequest;
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
          errors: { auth: "Only owner can create tenant" },
        };
      }

      validateCreateTenantInput(body);

      const tenant = await tenantsService.createTenant(userId, body);

      context.set.status = 201;
      return {
        success: true,
        message: "Tenant created successfully",
        data: {
          tenant: {
            id: tenant.id,
            fullName: tenant.fullName,
            phoneNumber: tenant.phoneNumber,
            email: tenant.email,
            identityNumber: tenant.identityNumber,
            address: tenant.address,
            emergencyContactName: tenant.emergencyContactName,
            emergencyContactPhone: tenant.emergencyContactPhone,
            notes: tenant.notes,
            createdAt: tenant.createdAt?.toISOString(),
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

      console.error("Create tenant error:", error);
      context.set.status = 500;
      return {
        success: false,
        message: (error as Error).message || "Internal server error",
        errors: { server: "Something went wrong" },
      };
    }
  }

  /**
   * Create tenancy
   */
  async createTenancy(context: AuthContext): Promise<ApiResponse> {
    try {
      const body = context.body as CreateTenancyRequest;
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
          errors: { auth: "Only owner can create tenancy" },
        };
      }

      validateCreateTenancyInput(body);

      const tenancy = await tenantsService.createTenancy(userId, body);

      context.set.status = 201;
      return {
        success: true,
        message: "Tenancy created successfully",
        data: {
          tenancy: {
            id: tenancy.id,
            tenantId: tenancy.tenantId,
            unitId: tenancy.unitId,
            propertyId: tenancy.propertyId,
            startDate: tenancy.startDate?.toString(),
            endDate: tenancy.endDate?.toString() || null,
            billingCycle: tenancy.billingCycle,
            billingAnchorDay: tenancy.billingAnchorDay,
            rentPrice: tenancy.rentPrice,
            status: tenancy.status,
            createdAt: tenancy.createdAt?.toISOString(),
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

      console.error("Create tenancy error:", error);
      context.set.status = 500;
      return {
        success: false,
        message: (error as Error).message || "Internal server error",
        errors: { server: "Something went wrong" },
      };
    }
  }

  /**
   * Get tenancies
   */
  async getTenancies(context: AuthContext): Promise<ApiResponse> {
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

      const query = context.query as GetTenantsQuery;
      const result = await tenantsService.getTenancies(userId, query);

      context.set.status = 200;
      return {
        success: true,
        message: "Tenancies retrieved successfully",
        data: result,
      };
    } catch (error) {
      console.error("Get tenancies error:", error);
      context.set.status = 500;
      return {
        success: false,
        message: (error as Error).message || "Internal server error",
        errors: { server: "Something went wrong" },
      };
    }
  }

  /**
   * Get tenancy detail
   */
  async getTenancy(context: AuthContext): Promise<ApiResponse> {
    try {
      const userId = context.user?.userId;
      const { id } = context.params as { id: string };

      if (!userId) {
        context.set.status = 401;
        return {
          success: false,
          message: "Unauthorized",
          errors: { auth: "User not authenticated" },
        };
      }

      const tenancy = await tenantsService.getTenancy(userId, id);

      context.set.status = 200;
      return {
        success: true,
        message: "Tenancy retrieved successfully",
        data: {
          tenant: {
            id: tenancy.tenant.id,
            fullName: tenancy.tenant.fullName,
            phoneNumber: tenancy.tenant.phoneNumber,
            email: tenancy.tenant.email,
            identityNumber: tenancy.tenant.identityNumber,
            address: tenancy.tenant.address,
            emergencyContactName: tenancy.tenant.emergencyContactName,
            emergencyContactPhone: tenancy.tenant.emergencyContactPhone,
            notes: tenancy.tenant.notes,
          },
          tenancy: {
            id: tenancy.tenancy.id,
            propertyId: tenancy.tenancy.propertyId,
            propertyName: tenancy.tenancy.propertyName,
            unitId: tenancy.tenancy.unitId,
            unitName: tenancy.tenancy.unitName,
            startDate: tenancy.tenancy.startDate?.toString(),
            endDate: tenancy.tenancy.endDate?.toString() || null,
            billingCycle: tenancy.tenancy.billingCycle,
            billingAnchorDay: tenancy.tenancy.billingAnchorDay,
            rentPrice: tenancy.tenancy.rentPrice,
            status: tenancy.tenancy.status,
            createdAt: tenancy.tenancy.createdAt?.toISOString(),
            updatedAt: tenancy.tenancy.updatedAt?.toISOString(),
          },
          documents: tenancy.documents.map((doc) => ({
            id: doc.id,
            type: doc.type,
            url: doc.url,
            uploadedAt: doc.uploadedAt?.toISOString(),
          })),
        },
      };
    } catch (error) {
      console.error("Get tenancy error:", error);
      context.set.status = 500;
      return {
        success: false,
        message: (error as Error).message || "Internal server error",
        errors: { server: "Something went wrong" },
      };
    }
  }

  /**
   * Edit tenant
   */
  async editTenant(context: AuthContext): Promise<ApiResponse> {
    try {
      const body = context.body as EditTenantRequest;
      const userId = context.user?.userId;
      const { id } = context.params as { id: string };
      console.log("id", id);

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
          errors: { auth: "Only owner can edit tenant" },
        };
      }

      validateEditTenantInput(body);

      const tenant = await tenantsService.editTenant(userId, id, body);

      context.set.status = 200;
      return {
        success: true,
        message: "Tenant updated successfully",
        data: {
          tenant: {
            id: tenant.id,
            fullName: tenant.fullName,
            phoneNumber: tenant.phoneNumber,
            email: tenant.email,
            identityNumber: tenant.identityNumber,
            address: tenant.address,
            emergencyContactName: tenant.emergencyContactName,
            emergencyContactPhone: tenant.emergencyContactPhone,
            notes: tenant.notes,
            updatedAt: tenant.updatedAt?.toISOString(),
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

      console.error("Edit tenant error:", error);
      context.set.status = 500;
      return {
        success: false,
        message: (error as Error).message || "Internal server error",
        errors: { server: "Something went wrong" },
      };
    }
  }

  /**
   * Edit tenancy
   */
  async editTenancy(context: AuthContext): Promise<ApiResponse> {
    try {
      const body = context.body as EditTenancyRequest;
      const userId = context.user?.userId;
      const { id } = context.params as { id: string };

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
          errors: { auth: "Only owner can edit tenancy" },
        };
      }

      validateEditTenancyInput(body);

      const tenancy = await tenantsService.editTenancy(userId, id, body);

      context.set.status = 200;
      return {
        success: true,
        message: "Tenancy updated successfully",
        data: {
          tenancy: {
            id: tenancy.id,
            unitId: tenancy.unitId,
            startDate: tenancy.startDate?.toString() || null,
            billingCycle: tenancy.billingCycle,
            billingAnchorDay: tenancy.billingAnchorDay,
            rentPrice: tenancy.rentPrice,
            endDate: tenancy.endDate?.toString() || null,
            updatedAt: tenancy.updatedAt?.toISOString(),
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

      console.error("Edit tenancy error:", error);
      context.set.status = 500;
      return {
        success: false,
        message: (error as Error).message || "Internal server error",
        errors: { server: "Something went wrong" },
      };
    }
  }

  /**
   * End tenancy
   */
  async endTenancy(context: AuthContext): Promise<ApiResponse> {
    try {
      const body = context.body as EndTenancyRequest;
      const userId = context.user?.userId;
      const { id } = context.params as { id: string };

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
          errors: { auth: "Only owner can end tenancy" },
        };
      }

      validateEndTenancyInput(body);

      const tenancy = await tenantsService.endTenancy(userId, id, body);

      context.set.status = 200;
      return {
        success: true,
        message: "Tenancy ended successfully",
        data: {
          tenancy: {
            id: tenancy.id,
            status: tenancy.status,
            endDate: tenancy.endDate?.toString(),
            updatedAt: tenancy.updatedAt?.toISOString(),
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

      console.error("End tenancy error:", error);
      context.set.status = 500;
      return {
        success: false,
        message: (error as Error).message || "Internal server error",
        errors: { server: "Something went wrong" },
      };
    }
  }

  /**
   * Upload document
   */
  async uploadDocument(context: AuthContext): Promise<ApiResponse> {
    try {
      const body = context.body as UploadDocumentRequest & { url: string };
      const userId = context.user?.userId;
      const { id } = context.params as { id: string };

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
          errors: { auth: "Only owner can upload document" },
        };
      }

      validateUploadDocumentInput(body);

      if (!body.url) {
        context.set.status = 400;
        return {
          success: false,
          message: "Validation failed",
          errors: { url: "Document URL is required" },
        };
      }

      const document = await tenantsService.uploadDocument(userId, id, body);

      context.set.status = 201;
      return {
        success: true,
        message: "Document uploaded successfully",
        data: {
          document: {
            id: document.id,
            type: document.type,
            url: document.url,
            uploadedAt: document.uploadedAt?.toISOString(),
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

      console.error("Upload document error:", error);
      context.set.status = 500;
      return {
        success: false,
        message: (error as Error).message || "Internal server error",
        errors: { server: "Something went wrong" },
      };
    }
  }

  /**
   * Delete document
   */
  async deleteDocument(context: AuthContext): Promise<ApiResponse> {
    try {
      const userId = context.user?.userId;
      const { tenancyId, documentId } = context.params as {
        tenancyId: string;
        documentId: string;
      };

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
          errors: { auth: "Only owner can delete document" },
        };
      }

      await tenantsService.deleteDocument(userId, tenancyId, documentId);

      context.set.status = 200;
      return {
        success: true,
        message: "Document deleted successfully",
      };
    } catch (error) {
      console.error("Delete document error:", error);
      context.set.status = 500;
      return {
        success: false,
        message: (error as Error).message || "Internal server error",
        errors: { server: "Something went wrong" },
      };
    }
  }
}
