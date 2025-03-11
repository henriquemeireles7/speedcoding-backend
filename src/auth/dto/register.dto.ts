import {
  IsNotEmpty,
  IsString,
  MinLength,
  MaxLength,
  IsEmail,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * Data Transfer Object for user registration
 * Contains validation rules for username, email, and password
 */
export class RegisterDto {
  @ApiProperty({
    description: 'Username for the account',
    example: 'johndoe',
    minLength: 3,
    maxLength: 50,
  })
  @IsNotEmpty({ message: 'Username is required' })
  @IsString({ message: 'Username must be a string' })
  @MinLength(3, { message: 'Username must be at least 3 characters long' })
  @MaxLength(50, { message: 'Username must be at most 50 characters long' })
  username: string;

  @ApiProperty({
    description: 'Email address for the account',
    example: 'john.doe@example.com',
  })
  @IsNotEmpty({ message: 'Email is required' })
  @IsEmail({}, { message: 'Invalid email format' })
  @MaxLength(255, { message: 'Email must be at most 255 characters long' })
  email: string;

  @ApiProperty({
    description: 'Password for the account',
    example: 'securePassword123',
    minLength: 6,
  })
  @IsNotEmpty({ message: 'Password is required' })
  @IsString({ message: 'Password must be a string' })
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  password: string;
}
