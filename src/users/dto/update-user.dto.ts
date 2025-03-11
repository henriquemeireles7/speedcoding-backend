import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsOptional,
  IsString,
  MaxLength,
  IsUrl,
  IsObject,
  IsArray,
  ValidateNested,
  ArrayMaxSize,
  IsEnum,
} from 'class-validator';
import { Type } from 'class-transformer';

/**
 * Social media platform enum
 */
export enum SocialMediaPlatform {
  GITHUB = 'github',
  TWITTER = 'twitter',
  LINKEDIN = 'linkedin',
  INSTAGRAM = 'instagram',
  FACEBOOK = 'facebook',
  YOUTUBE = 'youtube',
  TWITCH = 'twitch',
  DISCORD = 'discord',
  OTHER = 'other',
}

/**
 * Social media link DTO
 */
export class SocialMediaLinkDto {
  @ApiPropertyOptional({
    description: 'Social media platform',
    enum: SocialMediaPlatform,
  })
  @IsEnum(SocialMediaPlatform)
  platform: SocialMediaPlatform;

  @ApiPropertyOptional({
    description: 'Social media URL',
    example: 'https://github.com/username',
  })
  @IsUrl()
  url: string;

  @ApiPropertyOptional({
    description: 'Display text for the link',
    example: 'My GitHub Profile',
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  displayText?: string;
}

/**
 * Data Transfer Object for updating a user
 */
export class UpdateUserDto {
  @ApiPropertyOptional({
    description: 'Display name',
    example: 'John Doe',
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  displayName?: string;

  @ApiPropertyOptional({
    description: 'User biography',
    example: 'Full-stack developer with 5 years of experience',
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  bio?: string;

  @ApiPropertyOptional({
    description: 'Avatar URL',
    example: '/uploads/avatars/user-123.jpg',
  })
  @IsOptional()
  @IsString()
  avatarUrl?: string;

  @ApiPropertyOptional({
    description: 'User preferences',
    example: { theme: 'dark', notifications: true },
  })
  @IsOptional()
  @IsObject()
  preferences?: Record<string, any>;

  @ApiPropertyOptional({
    description: 'User location',
    example: 'San Francisco, CA',
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  location?: string;

  @ApiPropertyOptional({
    description: 'User website',
    example: 'https://johndoe.com',
  })
  @IsOptional()
  @IsUrl()
  website?: string;

  @ApiPropertyOptional({
    description: 'Social media links',
    type: [SocialMediaLinkDto],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SocialMediaLinkDto)
  @ArrayMaxSize(10)
  socialLinks?: SocialMediaLinkDto[];

  @ApiPropertyOptional({
    description: 'User skills',
    example: ['JavaScript', 'React', 'Node.js'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @ArrayMaxSize(20)
  skills?: string[];
}
