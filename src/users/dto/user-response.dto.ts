import { ApiProperty } from '@nestjs/swagger';

/**
 * Data Transfer Object for user response
 * Used for returning user data in API responses
 */
export class UserResponseDto {
  @ApiProperty({
    description: 'Unique identifier for the user',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'Username of the user',
    example: 'johndoe',
  })
  username: string;

  @ApiProperty({
    description: 'Email address of the user',
    example: 'john.doe@example.com',
  })
  email: string;

  @ApiProperty({
    description: 'Whether the user has verified their email',
    example: true,
  })
  isEmailVerified: boolean;

  @ApiProperty({
    description: 'Display name for the user',
    example: 'John Doe',
    required: false,
  })
  displayName?: string;

  @ApiProperty({
    description: 'User biography',
    example: 'Software developer passionate about coding challenges',
    required: false,
  })
  bio?: string;

  @ApiProperty({
    description: 'URL to user avatar image',
    example: 'https://example.com/avatars/johndoe.jpg',
    required: false,
  })
  avatarUrl?: string;

  @ApiProperty({
    description: 'User preferences',
    example: { theme: 'dark', notifications: true },
    required: false,
  })
  preferences?: Record<string, any>;

  @ApiProperty({
    description: 'Date when the user was created',
    example: '2023-01-01T00:00:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Date when the user was last updated',
    example: '2023-01-01T00:00:00.000Z',
  })
  updatedAt: Date;
}
