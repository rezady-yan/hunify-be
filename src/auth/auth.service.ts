import { hashPassword, comparePassword } from "./auth.password";
import {
  RegisterRequest,
  User,
  LoginRequest,
  AuthResponse,
} from "./auth.types";
import { getTokenExpiration } from "./auth.token";
import { db } from "../db";
import { users, userCredentials, sessions } from "../db/schema";
import { eq, or } from "drizzle-orm";
import { Context } from "elysia";

export class AuthService {
  async checkUsernameExists(username: string): Promise<boolean> {
    const result = await db
      .select()
      .from(users)
      .where(eq(users.username, username))
      .limit(1);

    return result.length > 0;
  }

  async checkEmailExists(email: string): Promise<boolean> {
    const result = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    return result.length > 0;
  }

  async register(data: RegisterRequest): Promise<User> {
    // Hash password
    const hashedPassword = await hashPassword(data.password);

    // Insert user
    const [newUser] = await db
      .insert(users)
      .values({
        username: data.username,
        email: data.email,
      })
      .returning();

    // Insert credentials
    await db.insert(userCredentials).values({
      userId: newUser.id,
      password: hashedPassword,
    });

    // Return user without password
    return {
      id: newUser.id,
      username: newUser.username,
      email: newUser.email,
      createdAt: newUser.createdAt!,
    };
  }

  async login(
    data: LoginRequest,
    jwtSign: (payload: Context<any>) => Promise<string>,
  ): Promise<AuthResponse | null> {
    // Find user by email or username
    const [user] = await db
      .select()
      .from(users)
      .where(
        or(
          eq(users.email, data.identifier),
          eq(users.username, data.identifier),
        ),
      )
      .limit(1);

    if (!user) {
      return null; // User not found
    }

    // Get user credentials
    const [credential] = await db
      .select()
      .from(userCredentials)
      .where(eq(userCredentials.userId, user.id))
      .limit(1);

    if (!credential) {
      return null; // Credentials not found
    }

    // Compare password
    const isPasswordValid = await comparePassword(
      data.password,
      credential.password,
    );

    if (!isPasswordValid) {
      return null; // Invalid password
    }

    // Generate JWT token using @elysiajs/jwt
    const token = await jwtSign({
      userId: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
    });

    // Create session
    const expiresAt = getTokenExpiration();
    await db.insert(sessions).values({
      userId: user.id,
      token: token,
      expiresAt: expiresAt,
    });

    // Return auth response
    return {
      token: token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        createdAt: user.createdAt!,
        role: user.role,
      },
      expiresAt: expiresAt,
    };
  }
}
