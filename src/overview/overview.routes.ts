import { Elysia } from "elysia";
import { OverviewController } from "./overview.controller";
import { overviewSwaggerSchemas } from "./overview.swagger";

const overviewController = new OverviewController();

export const overviewRoutes = new Elysia()
  .get(
    "/summary",
    (context: any) => overviewController.getDashboardSummary(context),
    overviewSwaggerSchemas.getDashboardSummary,
  )
  .get(
    "/recent-activity",
    (context: any) => overviewController.getRecentActivity(context),
    overviewSwaggerSchemas.getRecentActivity,
  )
  .get(
    "/available-units",
    (context: any) => overviewController.getAvailableUnits(context),
    overviewSwaggerSchemas.getAvailableUnits,
  )
  .get(
    "/overdue-payments",
    (context: any) => overviewController.getOverduePayments(context),
    overviewSwaggerSchemas.getOverduePayments,
  )
  .get(
    "/reports/revenue",
    (context: any) => overviewController.getRevenueReport(context),
    overviewSwaggerSchemas.getRevenueReport,
  )
  .get(
    "/reports/occupancy",
    (context: any) => overviewController.getOccupancyReport(context),
    overviewSwaggerSchemas.getOccupancyReport,
  )
  .get(
    "/reports/tenant",
    (context: any) => overviewController.getTenantReport(context),
    overviewSwaggerSchemas.getTenantReport,
  )
  .get(
    "/reports/vacancy",
    (context: any) => overviewController.getVacancyReport(context),
    overviewSwaggerSchemas.getVacancyReport,
  )
  .get(
    "/reports/outstanding-payment",
    (context: any) => overviewController.getOutstandingPaymentReport(context),
    overviewSwaggerSchemas.getOutstandingPaymentReport,
  )
  .get(
    "/reports/property-performance",
    (context: any) => overviewController.getPropertyPerformance(context),
    overviewSwaggerSchemas.getPropertyPerformance,
  );
