import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { SocialMediaLinkDto } from '../dto/update-user.dto';

/**
 * User entity
 */
export class User {
  @ApiProperty({ description: 'Unique identifier' })
  id: string;

  @ApiProperty({ description: 'Username' })
  username: string;

  @ApiProperty({ description: 'Email address' })
  email: string;

  @ApiProperty({ description: 'Password hash' })
  passwordHash: string;

  @ApiProperty({ description: 'Whether email is verified' })
  isEmailVerified: boolean;

  @ApiPropertyOptional({ description: 'Email verification token' })
  verificationToken?: string | null;

  @ApiPropertyOptional({ description: 'Email verification token expiry' })
  verificationTokenExpiry?: Date | null;

  @ApiPropertyOptional({ description: 'Password reset token' })
  resetToken?: string | null;

  @ApiPropertyOptional({ description: 'Password reset token expiry' })
  resetTokenExpiry?: Date | null;

  @ApiPropertyOptional({ description: 'Display name' })
  displayName?: string | null;

  @ApiPropertyOptional({ description: 'User biography' })
  bio?: string | null;

  @ApiPropertyOptional({ description: 'Avatar URL' })
  avatarUrl?: string | null;

  @ApiPropertyOptional({ description: 'User preferences', type: 'object' })
  preferences?: Record<string, any> | null;

  @ApiPropertyOptional({ description: 'User location' })
  location?: string | null;

  @ApiPropertyOptional({ description: 'User website' })
  website?: string | null;

  @ApiPropertyOptional({
    description: 'Social media links',
    type: [SocialMediaLinkDto],
  })
  socialLinks?: SocialMediaLinkDto[] | null;

  @ApiPropertyOptional({ description: 'User skills', type: [String] })
  skills?: string[] | null;

  @ApiProperty({ description: 'Creation timestamp' })
  createdAt: Date;

  @ApiProperty({ description: 'Last update timestamp' })
  updatedAt: Date;
}
