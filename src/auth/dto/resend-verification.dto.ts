import { IsEmail, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * Data Transfer Object for resending verification email
 */
export class ResendVerificationDto {
  @ApiProperty({
    description: 'Email address to resend verification to',
    example: 'john.doe@example.com',
  })
  @IsNotEmpty({ message: 'Email is required' })
  @IsEmail({}, { message: 'Invalid email format' })
  email: string;
}
