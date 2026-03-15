import { t } from "elysia";

export const authSwaggerSchemas = {
  register: {
    detail: {
      tags: ["Auth"],
      summary: "Register new user",
      description: "Create a new user account with username, email, and password",
    },
    body: t.Object({
      username: t.String({
        minLength: 3,
        maxLength: 50,
        description: "Unique username (3-50 characters, alphanumeric and underscore only)",
        examples: ["johndoe123"],
      }),
      email: t.String({
        format: "email",
        description: "Valid email address",
        examples: ["john@example.com"],
      }),
      password: t.String({
        minLength: 8,
        description: "Password (minimum 8 characters)",
        examples: ["SecurePass123"],
      }),
    }),
    response: {
      200: t.Object({
        success: t.Boolean(),
        message: t.String(),
        data: t.Object({
          token: t.String(),
          user: t.Object({
            id: t.String(),
            username: t.String(),
            email: t.String(),
            role: t.String(),
            createdAt: t.String(),
          }),
          expiresAt: t.String(),
        }),
      }),
      400: t.Object({
        success: t.Boolean(),
        message: t.String(),
        errors: t.Optional(t.Any()),
      }),
    },
  },

  login: {
    detail: {
      tags: ["Auth"],
      summary: "Login user",
      description: "Authenticate user with email/username and password",
    },
    body: t.Object({
      identifier: t.String({
        description: "Email or username",
        examples: ["johndoe123", "john@example.com"],
      }),
      password: t.String({
        description: "User password",
        examples: ["SecurePass123"],
      }),
    }),
    response: {
      200: t.Object({
        success: t.Boolean(),
        message: t.String(),
        data: t.Object({
          token: t.String(),
          user: t.Object({
            id: t.String(),
            username: t.String(),
            email: t.String(),
            role: t.String(),
            createdAt: t.String(),
          }),
          expiresAt: t.String(),
        }),
      }),
      400: t.Object({
        success: t.Boolean(),
        message: t.String(),
        errors: t.Optional(t.Any()),
      }),
      401: t.Object({
        success: t.Boolean(),
        message: t.String(),
      }),
    },
  },
};
