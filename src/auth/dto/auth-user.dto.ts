import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { SocialMediaLinkDto } from '../../users/dto/update-user.dto';
import { AuthUser } from '../entities/auth-user.entity';

/**
 * Data Transfer Object for auth user response
 * Used for returning user data in authentication-related API responses
 */
export class AuthUserDto {
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

  @ApiPropertyOptional({
    description: 'Display name for the user',
    example: 'John Doe',
  })
  displayName?: string | null;

  @ApiPropertyOptional({
    description: 'User biography',
    example: 'Software developer passionate about coding challenges',
  })
  bio?: string | null;

  @ApiPropertyOptional({
    description: 'URL to user avatar image',
    example: 'https://example.com/avatars/johndoe.jpg',
  })
  avatarUrl?: string | null;

  @ApiPropertyOptional({
    description: 'User location',
    example: 'San Francisco, CA',
  })
  location?: string | null;

  @ApiPropertyOptional({
    description: 'User website',
    example: 'https://johndoe.com',
  })
  website?: string | null;

  @ApiPropertyOptional({
    description: 'Social media links',
    example: [
      { platform: 'github', url: 'https://github.com/johndoe' },
      { platform: 'twitter', url: 'https://twitter.com/johndoe' },
    ],
    type: [SocialMediaLinkDto],
  })
  socialLinks?: SocialMediaLinkDto[] | null;

  @ApiPropertyOptional({
    description: 'User skills',
    example: ['JavaScript', 'TypeScript', 'React', 'Node.js'],
  })
  skills?: string[] | null;

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

  /**
   * Static factory method to create an AuthUserDto from an AuthUser entity
   * @param authUser AuthUser entity
   * @returns AuthUserDto
   */
  static fromEntity(authUser: AuthUser): AuthUserDto {
    const dto = new AuthUserDto();
    dto.id = authUser.id;
    dto.username = authUser.username;
    dto.email = authUser.email;
    dto.isEmailVerified = authUser.isEmailVerified;
    dto.displayName = authUser.displayName as string | null;
    dto.bio = authUser.bio as string | null;
    dto.avatarUrl = authUser.avatarUrl as string | null;
    dto.location = authUser.location as string | null;
    dto.website = authUser.website as string | null;
    dto.socialLinks = authUser.socialLinks as SocialMediaLinkDto[] | null;
    dto.skills = authUser.skills as string[] | null;
    dto.createdAt = authUser.createdAt;
    dto.updatedAt = authUser.updatedAt;
    return dto;
  }
}
