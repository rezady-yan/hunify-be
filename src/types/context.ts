import { Context } from "elysia";

export interface AuthUser {
  userId: string;
  username: string;
  email: string;
  role: string;
}

export interface AuthContext extends Context {
  user?: AuthUser;
}
