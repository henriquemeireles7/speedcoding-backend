import { IsNotEmpty, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * Data Transfer Object for user login
 * Contains validation rules for username and password
 */
export class LoginDto {
  @ApiProperty({
    description: 'Username for authentication',
    example: 'johndoe',
  })
  @IsNotEmpty({ message: 'Username is required' })
  @IsString({ message: 'Username must be a string' })
  username: string;

  @ApiProperty({
    description: 'Password for authentication',
    example: 'securePassword123',
    minLength: 4,
  })
  @IsNotEmpty({ message: 'Password is required' })
  @IsString({ message: 'Password must be a string' })
  @MinLength(4, { message: 'Password must be at least 4 characters long' })
  password: string;
}
