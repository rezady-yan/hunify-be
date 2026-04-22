import { Elysia, Context } from "elysia";
import { UnitsController } from "./units.controller";
import { unitsSwaggerSchemas } from "./units.swagger";

const unitsController = new UnitsController();

export const unitsRoutes = new Elysia()
  .post(
    "/",
    (context) => unitsController.createUnit(context as Context),
    unitsSwaggerSchemas.createUnit,
  )
  .post(
    "/bulk",
    (context) => unitsController.bulkCreateUnits(context as Context),
    unitsSwaggerSchemas.bulkCreateUnits,
  )
  .get(
    "/",
    (context: AuthContext) => unitsController.getUnits(context),
    unitsSwaggerSchemas.getUnits,
  )
  .get(
    "/:id",
    (context) => unitsController.getUnit(context as Context),
    unitsSwaggerSchemas.getUnit,
  )
  .put(
    "/:id",
    (context) => unitsController.editUnit(context as Context),
    unitsSwaggerSchemas.editUnit,
  )
  .delete(
    "/:id",
    (context) => unitsController.deleteUnit(context as Context),
    unitsSwaggerSchemas.deleteUnit,
  )
  .post(
    "/:id/assign-tenant",
    (context) => unitsController.assignTenant(context as Context),
    unitsSwaggerSchemas.assignTenant,
  )
  .delete(
    "/:id/unassign-tenant",
    (context) => unitsController.unassignTenant(context as Context),
    unitsSwaggerSchemas.unassignTenant,
  )
  .patch(
    "/:id/status",
    (context) => unitsController.updateStatus(context as Context),
    unitsSwaggerSchemas.updateStatus,
  );
