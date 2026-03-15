import { Context, Elysia } from "elysia";
import { AuthController } from "./auth.controller";
import { authSwaggerSchemas } from "./auth.swagger";

const authController = new AuthController();

export const authRoutes = new Elysia({ prefix: "/auth" })
  .post(
    "/register",
    (context) => authController.register(context as Context),
    authSwaggerSchemas.register,
  )
  .post(
    "/login",
    (context) => authController.login(context as Context),
    authSwaggerSchemas.login,
  );
