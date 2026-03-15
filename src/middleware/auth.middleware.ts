/**
 * JWT Authentication Middleware
 * Validates Bearer token and extracts user information
 */
export const authMiddleware = async ({ headers, jwt, set }: any) => {
  const authorization = headers.authorization;

  if (!authorization || !authorization.startsWith("Bearer ")) {
    set.status = 401;
    throw new Error("Unauthorized - No token provided");
  }

  const token = authorization.substring(7);

  try {
    const payload = await jwt.verify(token);
    if (!payload) {
      set.status = 401;
      throw new Error("Unauthorized - Invalid token");
    }

    return {
      user: {
        userId: payload.userId,
        username: payload.username,
        email: payload.email,
        role: payload.role,
      },
    };
  } catch (error) {
    set.status = 401;
    throw new Error("Unauthorized - Token verification failed");
  }
};
