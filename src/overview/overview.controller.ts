import { OverviewService } from "./overview.service";
import { AuthContext } from "../types/context";
import {
  validateGetDashboardSummaryQuery,
  validateGetRecentActivityQuery,
  validateGetAvailableUnitsQuery,
  validateGetOverduePaymentsQuery,
  validateGetRevenueReportQuery,
  validateGetOccupancyReportQuery,
  validateGetTenantReportQuery,
  validateGetVacancyReportQuery,
  validateGetOutstandingPaymentReportQuery,
  validateGetPropertyPerformanceQuery,
  ValidationError,
} from "./overview.validation";
import {
  GetDashboardSummaryQuery,
  GetRecentActivityQuery,
  GetAvailableUnitsQuery,
  GetOverduePaymentsQuery,
  GetRevenueReportQuery,
  GetOccupancyReportQuery,
  GetTenantReportQuery,
  GetVacancyReportQuery,
  GetOutstandingPaymentReportQuery,
  GetPropertyPerformanceQuery,
} from "./overview.types";

export class OverviewController {
  private overviewService: OverviewService;

  constructor() {
    this.overviewService = new OverviewService();
  }

  /**
   * Get dashboard summary
   */
  async getDashboardSummary(context: AuthContext) {
    try {
      const query = context.query as GetDashboardSummaryQuery;
      const userId = context.user?.userId;
      const userRole = context.user?.role;

      if (!userId || !userRole) {
        context.set.status = 401;
        return {
          success: false,
          message: "Unauthorized",
        };
      }

      if (userRole !== "owner") {
        context.set.status = 403;
        return {
          success: false,
          message: "Only property owner can access dashboard",
        };
      }

      validateGetDashboardSummaryQuery(query);

      const summary = await this.overviewService.getDashboardSummary(
        userId,
        query,
      );

      return {
        success: true,
        message: "Dashboard summary retrieved successfully",
        data: summary,
      };
    } catch (error) {
      if (error instanceof ValidationError) {
        context.set.status = 400;
        return {
          success: false,
          message: error.message,
        };
      }

      if (error instanceof Error) {
        context.set.status = 500;
        return {
          success: false,
          message: error.message,
        };
      }

      context.set.status = 500;
      return {
        success: false,
        message: "Failed to get dashboard summary",
      };
    }
  }

  /**
   * Get recent activity
   */
  async getRecentActivity(context: AuthContext) {
    try {
      const query = context.query as GetRecentActivityQuery;
      const userId = context.user?.userId;
      const userRole = context.user?.role;

      if (!userId || !userRole) {
        context.set.status = 401;
        return {
          success: false,
          message: "Unauthorized",
        };
      }

      if (userRole !== "owner") {
        context.set.status = 403;
        return {
          success: false,
          message: "Only property owner can access activity",
        };
      }

      validateGetRecentActivityQuery(query);

      const result = await this.overviewService.getRecentActivity(
        userId,
        query,
      );

      return {
        success: true,
        message: "Recent activity retrieved successfully",
        data: result,
      };
    } catch (error) {
      if (error instanceof ValidationError) {
        context.set.status = 400;
        return {
          success: false,
          message: error.message,
        };
      }

      if (error instanceof Error) {
        context.set.status = 500;
        return {
          success: false,
          message: error.message,
        };
      }

      context.set.status = 500;
      return {
        success: false,
        message: "Failed to get recent activity",
      };
    }
  }

  /**
   * Get available units
   */
  async getAvailableUnits(context: AuthContext) {
    try {
      const query = context.query as GetAvailableUnitsQuery;
      const userId = context.user?.userId;
      const userRole = context.user?.role;

      if (!userId || !userRole) {
        context.set.status = 401;
        return {
          success: false,
          message: "Unauthorized",
        };
      }

      if (userRole !== "owner") {
        context.set.status = 403;
        return {
          success: false,
          message: "Only property owner can access units",
        };
      }

      validateGetAvailableUnitsQuery(query);

      const result = await this.overviewService.getAvailableUnits(
        userId,
        query,
      );

      return {
        success: true,
        message: "Available units retrieved successfully",
        data: result,
      };
    } catch (error) {
      if (error instanceof ValidationError) {
        context.set.status = 400;
        return {
          success: false,
          message: error.message,
        };
      }

      if (error instanceof Error) {
        context.set.status = 500;
        return {
          success: false,
          message: error.message,
        };
      }

      context.set.status = 500;
      return {
        success: false,
        message: "Failed to get available units",
      };
    }
  }

  /**
   * Get overdue payments
   */
  async getOverduePayments(context: AuthContext) {
    try {
      const query = context.query as GetOverduePaymentsQuery;
      const userId = context.user?.userId;
      const userRole = context.user?.role;

      if (!userId || !userRole) {
        context.set.status = 401;
        return {
          success: false,
          message: "Unauthorized",
        };
      }

      if (userRole !== "owner") {
        context.set.status = 403;
        return {
          success: false,
          message: "Only property owner can access overdue payments",
        };
      }

      validateGetOverduePaymentsQuery(query);

      const result = await this.overviewService.getOverduePayments(
        userId,
        query,
      );

      return {
        success: true,
        message: "Overdue payments retrieved successfully",
        data: result,
      };
    } catch (error) {
      if (error instanceof ValidationError) {
        context.set.status = 400;
        return {
          success: false,
          message: error.message,
        };
      }

      if (error instanceof Error) {
        context.set.status = 500;
        return {
          success: false,
          message: error.message,
        };
      }

      context.set.status = 500;
      return {
        success: false,
        message: "Failed to get overdue payments",
      };
    }
  }

  /**
   * Get revenue report
   */
  async getRevenueReport(context: AuthContext) {
    try {
      const query = context.query as GetRevenueReportQuery;
      const userId = context.user?.userId;
      const userRole = context.user?.role;

      if (!userId || !userRole) {
        context.set.status = 401;
        return {
          success: false,
          message: "Unauthorized",
        };
      }

      if (userRole !== "owner") {
        context.set.status = 403;
        return {
          success: false,
          message: "Only property owner can access reports",
        };
      }

      validateGetRevenueReportQuery(query);

      const result = await this.overviewService.getRevenueReport(userId, query);

      return {
        success: true,
        message: "Revenue report retrieved successfully",
        data: result,
      };
    } catch (error) {
      if (error instanceof ValidationError) {
        context.set.status = 400;
        return {
          success: false,
          message: error.message,
        };
      }

      if (error instanceof Error) {
        context.set.status = 500;
        return {
          success: false,
          message: error.message,
        };
      }

      context.set.status = 500;
      return {
        success: false,
        message: "Failed to get revenue report",
      };
    }
  }

  /**
   * Get occupancy report
   */
  async getOccupancyReport(context: AuthContext) {
    try {
      const query = context.query as GetOccupancyReportQuery;
      const userId = context.user?.userId;
      const userRole = context.user?.role;

      if (!userId || !userRole) {
        context.set.status = 401;
        return {
          success: false,
          message: "Unauthorized",
        };
      }

      if (userRole !== "owner") {
        context.set.status = 403;
        return {
          success: false,
          message: "Only property owner can access reports",
        };
      }

      validateGetOccupancyReportQuery(query);

      const result = await this.overviewService.getOccupancyReport(
        userId,
        query,
      );

      return {
        success: true,
        message: "Occupancy report retrieved successfully",
        data: result,
      };
    } catch (error) {
      if (error instanceof ValidationError) {
        context.set.status = 400;
        return {
          success: false,
          message: error.message,
        };
      }

      if (error instanceof Error) {
        context.set.status = 500;
        return {
          success: false,
          message: error.message,
        };
      }

      context.set.status = 500;
      return {
        success: false,
        message: "Failed to get occupancy report",
      };
    }
  }

  /**
   * Get tenant report
   */
  async getTenantReport(context: AuthContext) {
    try {
      const query = context.query as GetTenantReportQuery;
      const userId = context.user?.userId;
      const userRole = context.user?.role;

      if (!userId || !userRole) {
        context.set.status = 401;
        return {
          success: false,
          message: "Unauthorized",
        };
      }

      if (userRole !== "owner") {
        context.set.status = 403;
        return {
          success: false,
          message: "Only property owner can access reports",
        };
      }

      validateGetTenantReportQuery(query);

      const result = await this.overviewService.getTenantReport(userId, query);

      return {
        success: true,
        message: "Tenant report retrieved successfully",
        data: result,
      };
    } catch (error) {
      if (error instanceof ValidationError) {
        context.set.status = 400;
        return {
          success: false,
          message: error.message,
        };
      }

      if (error instanceof Error) {
        context.set.status = 500;
        return {
          success: false,
          message: error.message,
        };
      }

      context.set.status = 500;
      return {
        success: false,
        message: "Failed to get tenant report",
      };
    }
  }

  /**
   * Get vacancy report
   */
  async getVacancyReport(context: AuthContext) {
    try {
      const query = context.query as GetVacancyReportQuery;
      const userId = context.user?.userId;
      const userRole = context.user?.role;

      if (!userId || !userRole) {
        context.set.status = 401;
        return {
          success: false,
          message: "Unauthorized",
        };
      }

      if (userRole !== "owner") {
        context.set.status = 403;
        return {
          success: false,
          message: "Only property owner can access reports",
        };
      }

      validateGetVacancyReportQuery(query);

      const result = await this.overviewService.getVacancyReport(userId, query);

      return {
        success: true,
        message: "Vacancy report retrieved successfully",
        data: result,
      };
    } catch (error) {
      if (error instanceof ValidationError) {
        context.set.status = 400;
        return {
          success: false,
          message: error.message,
        };
      }

      if (error instanceof Error) {
        context.set.status = 500;
        return {
          success: false,
          message: error.message,
        };
      }

      context.set.status = 500;
      return {
        success: false,
        message: "Failed to get vacancy report",
      };
    }
  }

  /**
   * Get outstanding payment report
   */
  async getOutstandingPaymentReport(context: AuthContext) {
    try {
      const query = context.query as GetOutstandingPaymentReportQuery;
      const userId = context.user?.userId;
      const userRole = context.user?.role;

      if (!userId || !userRole) {
        context.set.status = 401;
        return {
          success: false,
          message: "Unauthorized",
        };
      }

      if (userRole !== "owner") {
        context.set.status = 403;
        return {
          success: false,
          message: "Only property owner can access reports",
        };
      }

      validateGetOutstandingPaymentReportQuery(query);

      const result = await this.overviewService.getOutstandingPaymentReport(
        userId,
        query,
      );

      return {
        success: true,
        message: "Outstanding payment report retrieved successfully",
        data: result,
      };
    } catch (error) {
      if (error instanceof ValidationError) {
        context.set.status = 400;
        return {
          success: false,
          message: error.message,
        };
      }

      if (error instanceof Error) {
        context.set.status = 500;
        return {
          success: false,
          message: error.message,
        };
      }

      context.set.status = 500;
      return {
        success: false,
        message: "Failed to get outstanding payment report",
      };
    }
  }

  /**
   * Get property performance
   */
  async getPropertyPerformance(context: AuthContext) {
    try {
      const query = context.query as GetPropertyPerformanceQuery;
      const userId = context.user?.userId;
      const userRole = context.user?.role;

      if (!userId || !userRole) {
        context.set.status = 401;
        return {
          success: false,
          message: "Unauthorized",
        };
      }

      if (userRole !== "owner") {
        context.set.status = 403;
        return {
          success: false,
          message: "Only property owner can access reports",
        };
      }

      validateGetPropertyPerformanceQuery(query);

      const result = await this.overviewService.getPropertyPerformance(
        userId,
        query,
      );

      return {
        success: true,
        message: "Property performance retrieved successfully",
        data: result,
      };
    } catch (error) {
      if (error instanceof ValidationError) {
        context.set.status = 400;
        return {
          success: false,
          message: error.message,
        };
      }

      if (error instanceof Error) {
        context.set.status = 500;
        return {
          success: false,
          message: error.message,
        };
      }

      context.set.status = 500;
      return {
        success: false,
        message: "Failed to get property performance",
      };
    }
  }
}
