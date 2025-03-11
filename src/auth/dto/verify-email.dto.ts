import { IsNotEmpty, IsString } from 'class-validator';

/**
 * Data Transfer Object for email verification
 */
export class VerifyEmailDto {
  @IsNotEmpty({ message: 'Token is required' })
  @IsString({ message: 'Token must be a string' })
  token: string;
}
