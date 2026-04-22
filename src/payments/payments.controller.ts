import { PaymentsService } from "./payments.service";
import { AuthContext } from "../types/context";
import {
  validateCreateInvoiceInput,
  validateEditInvoiceInput,
  validateRecordPaymentInput,
  validateUploadPaymentProofInput,
  ValidationError,
} from "./payments.validation";
import {
  CreateInvoiceRequest,
  EditInvoiceRequest,
  RecordPaymentRequest,
  UploadPaymentProofRequest,
  GetInvoicesQuery,
  GetPaymentSummaryQuery,
  GetTransactionHistoryQuery,
  GetOverdueInvoicesQuery,
} from "./payments.types";

export class PaymentsController {
  private paymentsService: PaymentsService;

  constructor() {
    this.paymentsService = new PaymentsService();
  }

  /**
   * Create invoice manually
   */
  async createInvoice(context: AuthContext) {
    try {
      const body = context.body as CreateInvoiceRequest;
      const userId = context.user?.userId;
      const userRole = context.user?.role;

      if (!userId || !userRole) {
        context.set.status = 401;
        return {
          success: false,
          message: "Unauthorized",
        };
      }

      // Validate role
      if (userRole !== "owner") {
        context.set.status = 403;
        return {
          success: false,
          message: "Only property owner can create invoices",
        };
      }

      // Validate input
      validateCreateInvoiceInput(body);

      const invoice = await this.paymentsService.createInvoice(userId, body);

      context.set.status = 201;
      return {
        success: true,
        message: "Invoice created successfully",
        data: invoice,
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
        if (
          error.message === "Tenancy not found or access denied" ||
          error.message === "Invoice not found or access denied"
        ) {
          context.set.status = 404;
          return {
            success: false,
            message: error.message,
          };
        }

        context.set.status = 500;
        return {
          success: false,
          message: error.message,
        };
      }

      context.set.status = 500;
      return {
        success: false,
        message: "Failed to create invoice",
      };
    }
  }

  /**
   * Get invoices with filters
   */
  async getInvoices(context: AuthContext) {
    try {
      const query = context.query as GetInvoicesQuery;
      const userId = context.user?.userId;
      const userRole = context.user?.role;

      if (!userId || !userRole) {
        context.set.status = 401;
        return {
          success: false,
          message: "Unauthorized",
        };
      }

      // Validate role
      if (userRole !== "owner") {
        context.set.status = 403;
        return {
          success: false,
          message: "Only property owner can access invoices",
        };
      }

      const result = await this.paymentsService.getInvoices(userId, query);

      return {
        success: true,
        message: "Invoices retrieved successfully",
        data: result.invoices,
        pagination: result.pagination,
        summary: result.summary,
      };
    } catch (error) {
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
        message: "Failed to get invoices",
      };
    }
  }

  /**
   * Get invoice detail
   */
  async getInvoice(context: AuthContext) {
    try {
      const invoiceId = context.params.id as string;
      const userId = context.user?.userId;
      const userRole = context.user?.role;

      if (!userId || !userRole) {
        context.set.status = 401;
        return {
          success: false,
          message: "Unauthorized",
        };
      }

      // Validate role
      if (userRole !== "owner") {
        context.set.status = 403;
        return {
          success: false,
          message: "Only property owner can access invoice",
        };
      }

      const result = await this.paymentsService.getInvoice(userId, invoiceId);

      return {
        success: true,
        message: "Invoice retrieved successfully",
        data: result,
      };
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === "Invoice not found or access denied") {
          context.set.status = 404;
          return {
            success: false,
            message: error.message,
          };
        }

        context.set.status = 500;
        return {
          success: false,
          message: error.message,
        };
      }

      context.set.status = 500;
      return {
        success: false,
        message: "Failed to get invoice",
      };
    }
  }

  /**
   * Edit invoice (UNPAID only)
   */
  async editInvoice(context: AuthContext) {
    try {
      const invoiceId = context.params.id as string;
      const body = context.body as EditInvoiceRequest;
      const userId = context.user?.userId;
      const userRole = context.user?.role;

      if (!userId || !userRole) {
        context.set.status = 401;
        return {
          success: false,
          message: "Unauthorized",
        };
      }

      // Validate role
      if (userRole !== "owner") {
        context.set.status = 403;
        return {
          success: false,
          message: "Only property owner can edit invoices",
        };
      }

      // Validate input
      validateEditInvoiceInput(body);

      const invoice = await this.paymentsService.editInvoice(
        userId,
        invoiceId,
        body,
      );

      return {
        success: true,
        message: "Invoice updated successfully",
        data: invoice,
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
        if (
          error.message === "Invoice not found or access denied" ||
          error.message === "Only UNPAID invoices can be edited"
        ) {
          context.set.status = 404;
          return {
            success: false,
            message: error.message,
          };
        }

        context.set.status = 500;
        return {
          success: false,
          message: error.message,
        };
      }

      context.set.status = 500;
      return {
        success: false,
        message: "Failed to edit invoice",
      };
    }
  }

  /**
   * Delete invoice (UNPAID only)
   */
  async deleteInvoice(context: AuthContext) {
    try {
      const invoiceId = context.params.id as string;
      const userId = context.user?.userId;
      const userRole = context.user?.role;

      if (!userId || !userRole) {
        context.set.status = 401;
        return {
          success: false,
          message: "Unauthorized",
        };
      }

      // Validate role
      if (userRole !== "owner") {
        context.set.status = 403;
        return {
          success: false,
          message: "Only property owner can delete invoices",
        };
      }

      await this.paymentsService.deleteInvoice(userId, invoiceId);

      return {
        success: true,
        message: "Invoice deleted successfully",
      };
    } catch (error) {
      if (error instanceof Error) {
        if (
          error.message === "Invoice not found or access denied" ||
          error.message === "Only UNPAID invoices can be deleted"
        ) {
          context.set.status = 404;
          return {
            success: false,
            message: error.message,
          };
        }

        context.set.status = 500;
        return {
          success: false,
          message: error.message,
        };
      }

      context.set.status = 500;
      return {
        success: false,
        message: "Failed to delete invoice",
      };
    }
  }

  /**
   * Record payment
   */
  async recordPayment(context: AuthContext) {
    try {
      const invoiceId = context.params.invoiceId as string;
      const body = context.body as RecordPaymentRequest;
      const userId = context.user?.userId;
      const userRole = context.user?.role;

      if (!userId || !userRole) {
        context.set.status = 401;
        return {
          success: false,
          message: "Unauthorized",
        };
      }

      // Validate role
      if (userRole !== "owner") {
        context.set.status = 403;
        return {
          success: false,
          message: "Only property owner can record payments",
        };
      }

      // Validate input
      validateRecordPaymentInput(body);

      const result = await this.paymentsService.recordPayment(
        userId,
        invoiceId,
        body,
      );

      context.set.status = 201;
      return {
        success: true,
        message: "Payment recorded successfully",
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
        if (
          error.message === "Invoice not found or access denied" ||
          error.message === "Invoice is already paid"
        ) {
          context.set.status = 404;
          return {
            success: false,
            message: error.message,
          };
        }

        context.set.status = 500;
        return {
          success: false,
          message: error.message,
        };
      }

      context.set.status = 500;
      return {
        success: false,
        message: "Failed to record payment",
      };
    }
  }

  /**
   * Upload payment proof
   */
  async uploadPaymentProof(context: AuthContext) {
    try {
      const paymentId = context.params.paymentId as string;
      const body = context.body as UploadPaymentProofRequest;
      const userId = context.user?.userId;
      const userRole = context.user?.role;

      if (!userId || !userRole) {
        context.set.status = 401;
        return {
          success: false,
          message: "Unauthorized",
        };
      }

      // Validate role
      if (userRole !== "owner") {
        context.set.status = 403;
        return {
          success: false,
          message: "Only property owner can upload payment proof",
        };
      }

      // Validate input
      validateUploadPaymentProofInput(body);

      const payment = await this.paymentsService.uploadPaymentProof(
        userId,
        paymentId,
        body,
      );

      return {
        success: true,
        message: "Payment proof uploaded successfully",
        data: payment,
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
        if (error.message === "Payment not found or access denied") {
          context.set.status = 404;
          return {
            success: false,
            message: error.message,
          };
        }

        context.set.status = 500;
        return {
          success: false,
          message: error.message,
        };
      }

      context.set.status = 500;
      return {
        success: false,
        message: "Failed to upload payment proof",
      };
    }
  }

  /**
   * Delete payment proof
   */
  async deletePaymentProof(context: AuthContext) {
    try {
      const paymentId = context.params.paymentId as string;
      const userId = context.user?.userId;
      const userRole = context.user?.role;

      if (!userId || !userRole) {
        context.set.status = 401;
        return {
          success: false,
          message: "Unauthorized",
        };
      }

      // Validate role
      if (userRole !== "owner") {
        context.set.status = 403;
        return {
          success: false,
          message: "Only property owner can delete payment proof",
        };
      }

      await this.paymentsService.deletePaymentProof(userId, paymentId);

      return {
        success: true,
        message: "Payment proof deleted successfully",
      };
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === "Payment not found or access denied") {
          context.set.status = 404;
          return {
            success: false,
            message: error.message,
          };
        }

        context.set.status = 500;
        return {
          success: false,
          message: error.message,
        };
      }

      context.set.status = 500;
      return {
        success: false,
        message: "Failed to delete payment proof",
      };
    }
  }

  /**
   * Get payment summary for dashboard
   */
  async getPaymentSummary(context: AuthContext) {
    try {
      const query = context.query as GetPaymentSummaryQuery;
      const userId = context.user?.userId;
      const userRole = context.user?.role;

      if (!userId || !userRole) {
        context.set.status = 401;
        return {
          success: false,
          message: "Unauthorized",
        };
      }

      // Validate role
      if (userRole !== "owner") {
        context.set.status = 403;
        return {
          success: false,
          message: "Only property owner can access payment summary",
        };
      }

      const summary = await this.paymentsService.getPaymentSummary(
        userId,
        query,
      );

      return {
        success: true,
        message: "Payment summary retrieved successfully",
        data: summary,
      };
    } catch (error) {
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
        message: "Failed to get payment summary",
      };
    }
  }

  /**
   * Get transaction history
   */
  async getTransactionHistory(context: AuthContext) {
    try {
      const query = context.query as GetTransactionHistoryQuery;
      const userId = context.user?.userId;
      const userRole = context.user?.role;

      if (!userId || !userRole) {
        context.set.status = 401;
        return {
          success: false,
          message: "Unauthorized",
        };
      }

      // Validate role
      if (userRole !== "owner") {
        context.set.status = 403;
        return {
          success: false,
          message: "Only property owner can access transaction history",
        };
      }

      const result = await this.paymentsService.getTransactionHistory(
        userId,
        query,
      );

      return {
        success: true,
        message: "Transaction history retrieved successfully",
        data: result.transactions,
        pagination: result.pagination,
      };
    } catch (error) {
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
        message: "Failed to get transaction history",
      };
    }
  }

  /**
   * Get overdue invoices
   */
  async getOverdueInvoices(context: AuthContext) {
    try {
      const query = context.query as GetOverdueInvoicesQuery;
      const userId = context.user?.userId;
      const userRole = context.user?.role;

      if (!userId || !userRole) {
        context.set.status = 401;
        return {
          success: false,
          message: "Unauthorized",
        };
      }

      // Validate role
      if (userRole !== "owner") {
        context.set.status = 403;
        return {
          success: false,
          message: "Only property owner can access overdue invoices",
        };
      }

      const result = await this.paymentsService.getOverdueInvoices(
        userId,
        query,
      );

      return {
        success: true,
        message: "Overdue invoices retrieved successfully",
        data: result.invoices,
        pagination: result.pagination,
        totalOverdueAmount: result.totalOverdueAmount,
      };
    } catch (error) {
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
        message: "Failed to get overdue invoices",
      };
    }
  }
}
