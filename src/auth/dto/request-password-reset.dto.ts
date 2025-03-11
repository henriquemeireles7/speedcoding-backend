import { IsEmail, IsNotEmpty } from 'class-validator';

/**
 * Data Transfer Object for requesting password reset
 */
export class RequestPasswordResetDto {
  @IsNotEmpty({ message: 'Email is required' })
  @IsEmail({}, { message: 'Invalid email format' })
  email: string;
}
