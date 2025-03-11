import { IsEmail, IsNotEmpty } from 'class-validator';

/**
 * Data Transfer Object for resending verification email
 */
export class ResendVerificationDto {
  @IsNotEmpty({ message: 'Email is required' })
  @IsEmail({}, { message: 'Invalid email format' })
  email: string;
}
