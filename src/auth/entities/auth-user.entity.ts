import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * Auth User entity
 * Represents the user data needed for authentication purposes
 */
export class AuthUser {
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

  @ApiPropertyOptional({ description: 'Avatar URL' })
  avatarUrl?: string | null;

  @ApiProperty({ description: 'Creation timestamp' })
  createdAt: Date;

  @ApiProperty({ description: 'Last update timestamp' })
  updatedAt: Date;
}
