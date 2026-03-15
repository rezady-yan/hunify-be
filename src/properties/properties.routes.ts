import { Elysia, Context } from "elysia";
import { PropertiesController } from "./properties.controller";
import { propertiesSwaggerSchemas } from "./properties.swagger";

const propertiesController = new PropertiesController();

export const propertiesRoutes = new Elysia()
  .post(
    "/",
    (context) => propertiesController.addProperty(context as Context),
    propertiesSwaggerSchemas.addProperty,
  )
  .get(
    "/",
    (context) => propertiesController.getProperties(context as Context),
    propertiesSwaggerSchemas.getProperties,
  )
  .get(
    "/:id",
    (context) => propertiesController.getProperty(context as Context),
    propertiesSwaggerSchemas.getProperty,
  )
  .put(
    "/:id",
    (context) => propertiesController.editProperty(context as Context),
    propertiesSwaggerSchemas.editProperty,
  )
  .delete(
    "/:id",
    (context) => propertiesController.deleteProperty(context as Context),
    propertiesSwaggerSchemas.deleteProperty,
  );
