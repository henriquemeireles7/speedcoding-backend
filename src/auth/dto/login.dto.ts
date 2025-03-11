import { IsNotEmpty, IsString, MinLength } from 'class-validator';

/**
 * Data Transfer Object for user login
 * Contains validation rules for username and password
 */
export class LoginDto {
  @IsNotEmpty({ message: 'Username is required' })
  @IsString({ message: 'Username must be a string' })
  username: string;

  @IsNotEmpty({ message: 'Password is required' })
  @IsString({ message: 'Password must be a string' })
  @MinLength(4, { message: 'Password must be at least 4 characters long' })
  password: string;
}
