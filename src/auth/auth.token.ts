export interface JWTPayload {
  userId: string;
  username: string;
  email: string;
}

export const getTokenExpiration = (): Date => {
  const expiresIn = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds
  return new Date(Date.now() + expiresIn);
};
