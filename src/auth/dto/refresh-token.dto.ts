import { IsNotEmpty, IsString } from 'class-validator';

/**
 * Data Transfer Object for refresh token requests
 */
export class RefreshTokenDto {
  @IsNotEmpty({ message: 'Refresh token is required' })
  @IsString({ message: 'Refresh token must be a string' })
  refreshToken: string;
}
