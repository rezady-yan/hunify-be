import { Elysia } from "elysia";
import { PaymentsController } from "./payments.controller";
import { paymentsSwaggerSchemas } from "./payments.swagger";

const paymentsController = new PaymentsController();

export const paymentsRoutes = new Elysia()
  .post(
    "/invoices",
    (context: any) => paymentsController.createInvoice(context),
    paymentsSwaggerSchemas.createInvoice,
  )
  .get(
    "/invoices",
    (context: any) => paymentsController.getInvoices(context),
    paymentsSwaggerSchemas.getInvoices,
  )
  .get(
    "/invoices/:id",
    (context: any) => paymentsController.getInvoice(context),
    paymentsSwaggerSchemas.getInvoice,
  )
  .put(
    "/invoices/:id",
    (context: any) => paymentsController.editInvoice(context),
    paymentsSwaggerSchemas.editInvoice,
  )
  .delete(
    "/invoices/:id",
    (context: any) => paymentsController.deleteInvoice(context),
    paymentsSwaggerSchemas.deleteInvoice,
  )
  .post(
    "/invoices/:invoiceId/payments",
    (context: any) => paymentsController.recordPayment(context),
    paymentsSwaggerSchemas.recordPayment,
  )
  .post(
    "/payments/:paymentId/proof",
    (context: any) => paymentsController.uploadPaymentProof(context),
    paymentsSwaggerSchemas.uploadPaymentProof,
  )
  .delete(
    "/payments/:paymentId/proof",
    (context: any) => paymentsController.deletePaymentProof(context),
    paymentsSwaggerSchemas.deletePaymentProof,
  )
  .get(
    "/summary",
    (context: any) => paymentsController.getPaymentSummary(context),
    paymentsSwaggerSchemas.getPaymentSummary,
  )
  .get(
    "/transactions",
    (context: any) => paymentsController.getTransactionHistory(context),
    paymentsSwaggerSchemas.getTransactionHistory,
  )
  .get(
    "/overdue",
    (context: any) => paymentsController.getOverdueInvoices(context),
    paymentsSwaggerSchemas.getOverdueInvoices,
  );
