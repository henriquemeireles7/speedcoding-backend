import { IsOptional, IsString, MaxLength, IsObject } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * Data Transfer Object for updating a user's profile
 */
export class UpdateUserDto {
  @ApiProperty({
    description: 'Display name for the user',
    example: 'John Doe',
    required: false,
  })
  @IsOptional()
  @IsString()
  displayName?: string;

  @ApiProperty({
    description: 'User biography',
    example: 'Software developer passionate about coding challenges',
    required: false,
    maxLength: 500,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  bio?: string;

  @ApiProperty({
    description: 'URL to user avatar image',
    example: 'https://example.com/avatars/johndoe.jpg',
    required: false,
  })
  @IsOptional()
  @IsString()
  avatarUrl?: string;

  @ApiProperty({
    description: 'User preferences',
    example: { theme: 'dark', notifications: true },
    required: false,
  })
  @IsOptional()
  @IsObject()
  preferences?: Record<string, any>;
}
