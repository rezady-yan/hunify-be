import { Elysia } from "elysia";
import { cors } from "@elysiajs/cors";
import { authRoutes } from "./auth/auth.routes";
import { propertiesRoutes } from "./properties/properties.routes";
import { unitsRoutes } from "./units/units.routes";
import { tenantsRoutes } from "./tenants/tenants.routes";
import { paymentsRoutes } from "./payments/payments.routes";
import { overviewRoutes } from "./overview/overview.routes";
import jwt from "@elysiajs/jwt";
import { swagger } from "@elysiajs/swagger";
import { authMiddleware } from "./middleware/auth.middleware";

const app = new Elysia()
  .use(
    cors({
      // Allow requests from local/dev frontends. You can tighten this to a list later.
      origin: true,
      methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization"],
    }),
  )
  .use(
    swagger({
      documentation: {
        info: {
          title: "Hunify API Documentation",
          version: "1.0.0",
          description: "API documentation for Hunify Backend",
        },
        tags: [
          { name: "Auth", description: "Authentication endpoints" },
          { name: "Properties", description: "Property management endpoints" },
          { name: "Units", description: "Unit management endpoints" },
          { name: "Tenants", description: "Tenant management endpoints" },
          { name: "Payments", description: "Payment management endpoints" },
          {
            name: "Overview",
            description: "Dashboard and reporting endpoints",
          },
          { name: "General", description: "General endpoints" },
        ],
        components: {
          securitySchemes: {
            bearerAuth: {
              type: "http",
              scheme: "bearer",
              bearerFormat: "JWT",
            },
          },
        },
      },
    }),
  )
  .use(
    jwt({
      name: "jwt",
      secret: process.env.JWT_SECRET as string,
      exp: "7d",
    }),
  )
  .get(
    "/",
    () => ({
      success: true,
      message: "Welcome to Hunify API",
      version: "1.0.0",
    }),
    {
      detail: {
        tags: ["General"],
        summary: "Welcome endpoint",
        description: "Get API welcome message and version",
      },
    },
  )
  .use(authRoutes)
  .group("/properties", (app) =>
    app.derive(authMiddleware).use(propertiesRoutes),
  )
  .group("/units", (app) => app.derive(authMiddleware).use(unitsRoutes))
  .group("/tenants", (app) => app.derive(authMiddleware).use(tenantsRoutes))
  .group("/payments", (app) => app.derive(authMiddleware).use(paymentsRoutes))
  .group("/overview", (app) => app.derive(authMiddleware).use(overviewRoutes))
  .listen(3000);

console.log(
  `🦊 Hunify API is running at ${app.server?.hostname}:${app.server?.port}`,
);
