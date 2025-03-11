import {
  Body,
  Controller,
  Post,
  HttpCode,
  HttpStatus,
  UseGuards,
  Get,
  Req,
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
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { Request } from 'express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { UserResponseDto } from '../users/dto/user-response.dto';

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
  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({
    status: 201,
    description: 'User registered successfully',
    type: TokensDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 409, description: 'Email or username already exists' })
  @Throttle({ default: { limit: 5, ttl: 60 } }) // Stricter rate limit for registration
  async register(@Body() registerDto: RegisterDto): Promise<TokensDto> {
    return this.authService.register(registerDto);
  }

  /**
   * Login endpoint
   * @param loginDto Login credentials
   * @returns Access and refresh tokens
   */
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login with email and password' })
  @ApiResponse({
    status: 200,
    description: 'Login successful',
    type: TokensDto,
  })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  @Throttle({ default: { limit: 5, ttl: 60 } }) // Stricter rate limit for login
  async login(@Body() loginDto: LoginDto): Promise<TokensDto> {
    return this.authService.login(loginDto);
  }

  /**
   * Refresh access token using a valid refresh token
   * @param refreshTokenDto Refresh token
   * @returns New access and refresh tokens
   */
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refresh access token' })
  @ApiResponse({
    status: 200,
    description: 'Token refreshed successfully',
    type: TokensDto,
  })
  @ApiResponse({ status: 401, description: 'Invalid refresh token' })
  async refresh(@Body() refreshTokenDto: RefreshTokenDto): Promise<TokensDto> {
    return this.authService.refreshTokens(refreshTokenDto);
  }

  /**
   * Logout a user by revoking their refresh token
   * @param refreshTokenDto Refresh token
   */
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Logout user' })
  @ApiResponse({ status: 200, description: 'Logout successful' })
  async logout(@Body() refreshTokenDto: RefreshTokenDto): Promise<void> {
    await this.authService.logout(refreshTokenDto.refreshToken);
  }

  /**
   * Verify a user's email address
   * @param verifyEmailDto Verification data
   */
  @Post('verify-email')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify email address' })
  @ApiResponse({ status: 200, description: 'Email verified successfully' })
  @ApiResponse({
    status: 400,
    description: 'Invalid or expired verification token',
  })
  async verifyEmail(@Body() verifyEmailDto: VerifyEmailDto): Promise<void> {
    await this.authService.verifyEmail(verifyEmailDto);
  }

  /**
   * Resend verification email
   * @param resendVerificationDto Email to resend verification to
   */
  @Post('resend-verification')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Resend verification email' })
  @ApiResponse({
    status: 200,
    description: 'Verification email sent successfully',
  })
  @ApiResponse({ status: 404, description: 'User not found' })
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
  @Post('request-password-reset')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Request password reset' })
  @ApiResponse({
    status: 200,
    description: 'Password reset email sent successfully',
  })
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
  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reset password' })
  @ApiResponse({ status: 200, description: 'Password reset successfully' })
  @ApiResponse({ status: 400, description: 'Invalid or expired reset token' })
  async resetPassword(
    @Body() resetPasswordDto: ResetPasswordDto,
  ): Promise<void> {
    await this.authService.resetPassword(resetPasswordDto);
  }

  /**
   * Get authenticated user profile
   * @returns User profile data
   */
  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get authenticated user profile' })
  @ApiResponse({
    status: 200,
    description: 'Profile retrieved successfully',
    type: UserResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @HttpCode(HttpStatus.OK)
  async getProfile(@Req() req: Request & { user: { sub: string } }) {
    return await this.authService.getProfile(req.user.sub);
  }
}
