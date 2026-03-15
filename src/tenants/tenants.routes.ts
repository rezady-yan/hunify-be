import { Elysia } from "elysia";
import { TenantsController } from "./tenants.controller";
import { tenantsSwaggerSchemas } from "./tenants.swagger";

const tenantsController = new TenantsController();

export const tenantsRoutes = new Elysia()
  .post(
    "/",
    (context: any) => tenantsController.createTenant(context),
    tenantsSwaggerSchemas.createTenant,
  )
  .post(
    "/tenancy",
    (context: any) => tenantsController.createTenancy(context),
    tenantsSwaggerSchemas.createTenancy,
  )
  .get(
    "/",
    (context: any) => tenantsController.getTenancies(context),
    tenantsSwaggerSchemas.getTenancies,
  )
  .get(
    "/:id",
    (context: any) => tenantsController.getTenancy(context),
    tenantsSwaggerSchemas.getTenancy,
  )
  .put(
    "/tenant/:id",
    (context: any) => tenantsController.editTenant(context),
    tenantsSwaggerSchemas.editTenant,
  )
  .put(
    "/:id",
    (context: any) => tenantsController.editTenancy(context),
    tenantsSwaggerSchemas.editTenancy,
  )
  .post(
    "/:id/end",
    (context: any) => tenantsController.endTenancy(context),
    tenantsSwaggerSchemas.endTenancy,
  )
  .post(
    "/:id/documents",
    (context: any) => tenantsController.uploadDocument(context),
    tenantsSwaggerSchemas.uploadDocument,
  )
  .delete(
    "/:tenancyId/documents/:documentId",
    (context: any) => tenantsController.deleteDocument(context),
    tenantsSwaggerSchemas.deleteDocument,
  );
