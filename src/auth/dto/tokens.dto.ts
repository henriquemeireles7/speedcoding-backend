/**
 * Data Transfer Object for token responses
 * Contains both access and refresh tokens
 */
export class TokensDto {
  accessToken: string;
  refreshToken: string;
}
