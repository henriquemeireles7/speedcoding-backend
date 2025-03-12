/**
 * JWT payload interface for access tokens
 */
export interface JwtPayload {
  sub: string; // User ID
  username: string; // Username
  email: string; // Email address
  iat?: number; // Issued at timestamp
  exp?: number; // Expiration timestamp
}

/**
 * JWT payload interface for refresh tokens
 */
export interface RefreshTokenPayload {
  sub: string; // User ID
  tokenId: string; // Unique token ID
  exp: number; // Expiration timestamp
  iat?: number; // Issued at timestamp
}
