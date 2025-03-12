import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * Data Transfer Object for social login user data
 */
export class SocialUserDto {
  @ApiProperty({
    description: 'Email address from the OAuth provider',
    example: 'john.doe@example.com',
  })
  email: string;

  @ApiPropertyOptional({
    description: 'First name from the OAuth provider',
    example: 'John',
  })
  firstName?: string;

  @ApiPropertyOptional({
    description: 'Last name from the OAuth provider',
    example: 'Doe',
  })
  lastName?: string;

  @ApiPropertyOptional({
    description: 'Profile picture URL from the OAuth provider',
    example: 'https://lh3.googleusercontent.com/a/photo.jpg',
  })
  picture?: string | null;

  @ApiProperty({
    description: 'Access token from the OAuth provider',
    example: 'ya29.a0AfH6SMBx7...',
  })
  accessToken: string;

  @ApiProperty({
    description: 'OAuth provider name',
    example: 'google',
    enum: ['google', 'github'],
  })
  provider: string;

  @ApiProperty({
    description: 'User ID from the OAuth provider',
    example: '123456789',
  })
  providerId: string;

  @ApiPropertyOptional({
    description: 'Username from the OAuth provider (mainly for GitHub)',
    example: 'johndoe',
  })
  username?: string;
}
