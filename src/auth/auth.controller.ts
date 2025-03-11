import {
  Body,
  Controller,
  Post,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import {
  LoginDto,
  RegisterDto,
  RefreshTokenDto,
  TokensDto,
  VerifyEmailDto,
  ResendVerificationDto,
  RequestPasswordResetDto,
  ResetPasswordDto,
} from './dto';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';

/**
 * Authentication Controller
 * Handles authentication-related endpoints
 */
@ApiTags('auth')
@Controller('auth')
@UseGuards(ThrottlerGuard)
export class AuthController {
  constructor(private authService: AuthService) {}

  /**
   * Register a new user
   * @param registerDto Registration data
   * @returns Access and refresh tokens
   */
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'User registered successfully',
    type: TokensDto,
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Username or email already exists',
  })
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @Throttle({ default: { limit: 5, ttl: 60 } }) // Stricter rate limit for registration
  async register(@Body() registerDto: RegisterDto): Promise<TokensDto> {
    return this.authService.register(registerDto);
  }

  /**
   * Login endpoint
   * @param loginDto Login credentials
   * @returns Access and refresh tokens
   */
  @ApiOperation({ summary: 'Authenticate a user' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'User authenticated successfully',
    type: TokensDto,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Invalid credentials',
  })
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 5, ttl: 60 } }) // Stricter rate limit for login
  async login(@Body() loginDto: LoginDto): Promise<TokensDto> {
    return this.authService.login(loginDto);
  }

  /**
   * Refresh access token using a valid refresh token
   * @param refreshTokenDto Refresh token
   * @returns New access and refresh tokens
   */
  @ApiOperation({ summary: 'Refresh access token' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Token refreshed successfully',
    type: TokensDto,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Invalid refresh token',
  })
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(@Body() refreshTokenDto: RefreshTokenDto): Promise<TokensDto> {
    return this.authService.refreshTokens(refreshTokenDto);
  }

  /**
   * Logout a user by revoking their refresh token
   * @param refreshTokenDto Refresh token
   */
  @ApiOperation({ summary: 'Logout a user' })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'User logged out successfully',
  })
  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  async logout(@Body() refreshTokenDto: RefreshTokenDto): Promise<void> {
    await this.authService.logout(refreshTokenDto.refreshToken);
  }

  /**
   * Verify a user's email address
   * @param verifyEmailDto Verification data
   */
  @ApiOperation({ summary: 'Verify email address' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Email verified successfully',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid or expired verification token',
  })
  @Post('verify-email')
  @HttpCode(HttpStatus.OK)
  async verifyEmail(@Body() verifyEmailDto: VerifyEmailDto): Promise<void> {
    await this.authService.verifyEmail(verifyEmailDto);
  }

  /**
   * Resend verification email
   * @param resendVerificationDto Email to resend verification to
   */
  @ApiOperation({ summary: 'Resend verification email' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Verification email sent successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'User not found',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Email is already verified',
  })
  @Post('resend-verification')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 3, ttl: 60 } }) // Prevent abuse
  async resendVerification(
    @Body() resendVerificationDto: ResendVerificationDto,
  ): Promise<void> {
    await this.authService.resendVerificationEmail(resendVerificationDto);
  }

  /**
   * Request password reset
   * @param requestPasswordResetDto Email for password reset
   */
  @ApiOperation({ summary: 'Request password reset' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Password reset email sent successfully',
  })
  @Post('request-password-reset')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 3, ttl: 60 } }) // Prevent abuse
  async requestPasswordReset(
    @Body() requestPasswordResetDto: RequestPasswordResetDto,
  ): Promise<void> {
    await this.authService.requestPasswordReset(requestPasswordResetDto);
  }

  /**
   * Reset password
   * @param resetPasswordDto Reset password data
   */
  @ApiOperation({ summary: 'Reset password' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Password reset successfully',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid or expired reset token',
  })
  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  async resetPassword(
    @Body() resetPasswordDto: ResetPasswordDto,
  ): Promise<void> {
    await this.authService.resetPassword(resetPasswordDto);
  }
}
