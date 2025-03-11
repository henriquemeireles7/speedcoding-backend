import { IsNotEmpty, IsString, MinLength, IsEmail } from 'class-validator';

/**
 * Data Transfer Object for user login
 * Contains validation rules for email and password
 */
export class LoginDto {
  @IsNotEmpty({ message: 'Email is required' })
  @IsEmail({}, { message: 'Invalid email format' })
  email: string;

  @IsNotEmpty({ message: 'Password is required' })
  @IsString({ message: 'Password must be a string' })
  @MinLength(4, { message: 'Password must be at least 4 characters long' })
  password: string;
}
