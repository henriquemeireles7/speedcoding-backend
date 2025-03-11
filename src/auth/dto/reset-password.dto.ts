import { IsString, MinLength, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * Data Transfer Object for password reset
 */
export class ResetPasswordDto {
  @ApiProperty({
    description: 'Reset token received via email',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsString()
  @IsNotEmpty()
  token: string;

  @ApiProperty({
    description: 'New password',
    example: 'newSecurePassword123',
    minLength: 8,
  })
  @IsString()
  @MinLength(8)
  newPassword: string;
}
