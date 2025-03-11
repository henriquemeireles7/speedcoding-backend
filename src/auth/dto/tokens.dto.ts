import { ApiProperty } from '@nestjs/swagger';

/**
 * Data Transfer Object for token responses
 * Contains both access and refresh tokens
 */
export class TokensDto {
  @ApiProperty({
    description: 'JWT access token for authentication',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  accessToken: string;

  @ApiProperty({
    description: 'Refresh token for obtaining new access tokens',
    example: 'a1b2c3d4-e5f6-g7h8-i9j0-k1l2m3n4o5p6',
  })
  refreshToken: string;
}
