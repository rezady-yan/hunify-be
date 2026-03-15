import { Context } from "elysia";
import { AuthService } from "./auth.service";
import {
  validateRegisterInput,
  validateLoginInput,
  ValidationError,
} from "./auth.validation";
import { RegisterRequest, LoginRequest, ApiResponse } from "./auth.types";

const authService = new AuthService();

export class AuthController {
  async register(context: Context): Promise<ApiResponse> {
    try {
      const body = context.body as RegisterRequest;

      // Validasi input
      validateRegisterInput(body);

      // Cek username sudah terpakai
      const usernameExists = await authService.checkUsernameExists(
        body.username,
      );
      if (usernameExists) {
        context.set.status = 400;
        return {
          success: false,
          message: "Registration failed",
          errors: {
            username: "Username already exists",
          },
        };
      }

      // Cek email sudah terpakai
      const emailExists = await authService.checkEmailExists(body.email);
      if (emailExists) {
        context.set.status = 400;
        return {
          success: false,
          message: "Registration failed",
          errors: {
            email: "Email already exists",
          },
        };
      }

      // Register user
      const user = await authService.register(body);

      // Return success response
      context.set.status = 201;
      return {
        success: true,
        message: "User registered successfully",
        data: {
          user: {
            id: user.id,
            username: user.username,
            email: user.email,
            createdAt: user.createdAt,
          },
        },
      };
    } catch (error) {
      // Handle validation error
      if (error instanceof ValidationError) {
        context.set.status = 400;
        return {
          success: false,
          message: "Validation failed",
          errors: {
            [error.field]: error.message,
          },
        };
      }

      // Handle other errors
      console.error("Register error:", error);
      context.set.status = 500;
      return {
        success: false,
        message: "Internal server error",
        errors: {
          server: "Something went wrong",
        },
      };
    }
  }

  async login(context: Context): Promise<ApiResponse> {
    try {
      const body = context.body as LoginRequest;

      // Validasi input
      validateLoginInput(body);

      // Attempt login
      const authResponse = await authService.login(body, context.jwt.sign);
      console.log("authResponse:", authResponse);

      if (!authResponse) {
        // Invalid credentials
        context.set.status = 401;
        return {
          success: false,
          message: "Invalid credentials",
          errors: {
            credentials: "Email/username or password is incorrect",
          },
        };
      }

      // Login successful
      context.set.status = 200;
      console.log("Login successful, preparing response...");
      return {
        success: true,
        message: "Login successful",
        data: {
          token: authResponse.token,
          user: {
            id: authResponse.user.id,
            username: authResponse.user.username,
            email: authResponse.user.email,
            role: authResponse.user.role || "owner",
            createdAt: authResponse.user.createdAt.toString(),
          },
          expiresAt: authResponse.expiresAt.toString(),
        },
      };
    } catch (error) {
      console.log("Login error detail:", error);
      // Handle validation error
      if (error instanceof ValidationError) {
        context.set.status = 400;
        return {
          success: false,
          message: "Validation failed",
          errors: {
            [error.field]: error.message,
          },
        };
      }

      // Handle other errors
      console.error("Login error:", error);
      context.set.status = 500;
      return {
        success: false,
        message: "Internal server error",
        errors: {
          server: "Something went wrong",
        },
      };
    }
  }
}
