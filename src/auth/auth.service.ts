import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { MailService } from '../mail/mail.service';
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
import { SocialUserDto } from './dto/social-user.dto';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { Prisma } from '@prisma/client';
import { UsersService } from '../users/users.service';
import { ConfigService } from '@nestjs/config';

/**
 * Authentication Service
 * Handles user authentication and JWT token generation
 */
@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private usersService: UsersService,
    private jwtService: JwtService,
    private mailService: MailService,
    private configService: ConfigService,
  ) {}

  /**
   * Register a new user
   * @param registerDto Registration data
   * @returns Access and refresh tokens
   */
  async register(registerDto: RegisterDto): Promise<TokensDto> {
    const { username, email, password } = registerDto;

    // Check if user already exists
    const existingUserByEmail = await this.usersService.findByEmail(email);
    if (existingUserByEmail) {
      throw new ConflictException('Email already in use');
    }

    const existingUserByUsername =
      await this.usersService.findByUsername(username);
    if (existingUserByUsername) {
      throw new ConflictException('Username already in use');
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Generate verification token
    const verificationToken = uuidv4();
    const verificationTokenExpiry = new Date();
    verificationTokenExpiry.setHours(verificationTokenExpiry.getHours() + 24); // 24 hours

    // Create user and refresh token in a transaction
    const result = await this.prisma.$transaction(async (prisma) => {
      // Create user
      const user = await prisma.user.create({
        data: {
          username,
          email,
          passwordHash,
          verificationToken,
          verificationTokenExpiry,
        },
      });

      // Generate tokens
      const tokens = this.generateTokens(user.id, user.username, user.email);

      // Create refresh token in database
      await this.storeRefreshToken(prisma, tokens.refreshToken, user.id);

      return { user, tokens };
    });

    // Send verification email
    await this.mailService.sendVerificationEmail(
      email,
      username,
      verificationToken,
    );

    return result.tokens;
  }

  /**
   * Verify a user's email address
   * @param verifyEmailDto Verification data
   */
  async verifyEmail(verifyEmailDto: VerifyEmailDto): Promise<void> {
    const { token } = verifyEmailDto;

    const user = await this.prisma.user.findFirst({
      where: {
        verificationToken: token,
        verificationTokenExpiry: {
          gte: new Date(),
        },
      },
    });

    if (!user) {
      throw new BadRequestException('Invalid or expired verification token');
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        isEmailVerified: true,
        verificationToken: null,
        verificationTokenExpiry: null,
      },
    });
  }

  /**
   * Resend verification email
   * @param resendVerificationDto Email to resend verification to
   */
  async resendVerificationEmail(
    resendVerificationDto: ResendVerificationDto,
  ): Promise<void> {
    const { email } = resendVerificationDto;

    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.isEmailVerified) {
      throw new BadRequestException('Email already verified');
    }

    // Generate new verification token
    const verificationToken = uuidv4();
    const verificationTokenExpiry = new Date();
    verificationTokenExpiry.setHours(verificationTokenExpiry.getHours() + 24); // 24 hours

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        verificationToken,
        verificationTokenExpiry,
      },
    });

    // Send verification email
    await this.mailService.sendVerificationEmail(
      user.email,
      user.username,
      verificationToken,
    );
  }

  /**
   * Request password reset
   * @param requestPasswordResetDto Email to send password reset to
   */
  async requestPasswordReset(
    requestPasswordResetDto: RequestPasswordResetDto,
  ): Promise<void> {
    const { email } = requestPasswordResetDto;

    const user = await this.usersService.findByEmail(email);
    if (!user) {
      // Don't reveal if user exists or not
      return;
    }

    // Generate password reset token
    const resetToken = uuidv4();
    const resetTokenExpiry = new Date();
    resetTokenExpiry.setHours(resetTokenExpiry.getHours() + 1); // 1 hour

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken,
        resetTokenExpiry,
      },
    });

    // Send password reset email
    await this.mailService.sendPasswordResetEmail(
      user.email,
      user.username,
      resetToken,
    );
  }

  /**
   * Reset password
   * @param resetPasswordDto Password reset data
   */
  async resetPassword(resetPasswordDto: ResetPasswordDto): Promise<void> {
    const { token, newPassword } = resetPasswordDto;

    const user = await this.prisma.user.findFirst({
      where: {
        resetToken: token,
        resetTokenExpiry: {
          gte: new Date(),
        },
      },
    });

    if (!user) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    // Hash new password
    const passwordHash = await bcrypt.hash(newPassword, 10);

    // Update user and revoke all refresh tokens
    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: user.id },
        data: {
          passwordHash,
          resetToken: null,
          resetTokenExpiry: null,
        },
      }),
      this.prisma.refreshToken.updateMany({
        where: { userId: user.id },
        data: { isRevoked: true },
      }),
    ]);
  }

  /**
   * Login user
   * @param loginDto Login credentials
   * @returns Access and refresh tokens
   */
  async login(loginDto: LoginDto): Promise<TokensDto> {
    const { email, password } = loginDto;

    // Find user by email
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Generate tokens
    const tokens = this.generateTokens(user.id, user.username, user.email);

    // Store refresh token
    await this.prisma.$transaction(async (prisma) => {
      await this.storeRefreshToken(prisma, tokens.refreshToken, user.id);
    });

    return tokens;
  }

  /**
   * Refresh access token using refresh token
   * @param refreshTokenDto Refresh token
   * @returns New access and refresh tokens
   */
  async refreshTokens(refreshTokenDto: RefreshTokenDto): Promise<TokensDto> {
    const { refreshToken } = refreshTokenDto;

    // Find refresh token in database
    const storedToken = await this.prisma.refreshToken.findFirst({
      where: {
        token: refreshToken,
        isRevoked: false,
        expiresAt: {
          gte: new Date(),
        },
      },
      include: {
        user: true,
      },
    });

    if (!storedToken) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const { user } = storedToken;

    // Revoke old refresh token
    await this.prisma.refreshToken.update({
      where: { id: storedToken.id },
      data: { isRevoked: true },
    });

    // Generate new tokens
    const tokens = this.generateTokens(user.id, user.username, user.email);

    // Store new refresh token
    await this.prisma.$transaction(async (prisma) => {
      await this.storeRefreshToken(prisma, tokens.refreshToken, user.id);
    });

    return tokens;
  }

  /**
   * Logout user by revoking refresh token
   * @param refreshToken Refresh token to revoke
   */
  async logout(refreshToken: string): Promise<void> {
    await this.prisma.refreshToken.updateMany({
      where: {
        token: refreshToken,
      },
      data: {
        isRevoked: true,
      },
    });
  }

  /**
   * Generate JWT tokens
   * @param userId User ID
   * @param username Username
   * @param email Email
   * @returns Access and refresh tokens
   */
  private generateTokens(
    userId: string,
    username: string,
    email: string,
  ): TokensDto {
    const payload = { sub: userId, username, email };

    const accessToken = this.jwtService.sign(payload);

    // Generate refresh token with longer expiry
    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      expiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRES_IN', '7d'),
    });

    return {
      accessToken,
      refreshToken,
    };
  }

  /**
   * Store refresh token in database
   * @param prisma Prisma transaction client
   * @param refreshToken Refresh token
   * @param userId User ID
   */
  private async storeRefreshToken(
    prisma: Prisma.TransactionClient,
    refreshToken: string,
    userId: string,
  ): Promise<void> {
    // Calculate expiry date (7 days from now)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId,
        expiresAt,
      },
    });
  }

  /**
   * Get user profile
   * @param userId User ID
   * @returns User profile
   */
  async getProfile(userId: string) {
    const user = await this.usersService.findById(userId);
    return this.usersService.mapToDto(user);
  }

  /**
   * Handle social login (Google, GitHub)
   * @param socialUser User data from OAuth provider
   * @returns Access and refresh tokens
   */
  async socialLogin(socialUser: SocialUserDto): Promise<TokensDto> {
    const { email, provider, providerId, firstName, lastName, picture, username } = socialUser;

    // Check if user exists by provider and providerId
    let user = await this.prisma.user.findFirst({
      where: {
        socialConnections: {
          some: {
            provider,
            providerId,
          },
        },
      },
    });

    // If user doesn't exist, check by email
    if (!user) {
      user = await this.prisma.user.findUnique({
        where: { email },
      });
    }

    // Generate a display name from first and last name
    const displayName = [firstName, lastName].filter(Boolean).join(' ');

    // Generate a username if not provided
    const generatedUsername = username || this.generateUsername(email, firstName, lastName);

    if (user) {
      // User exists, update social connection if needed
      const existingConnection = await this.prisma.socialConnection.findFirst({
        where: {
          userId: user.id,
          provider,
          providerId,
        },
      });

      if (!existingConnection) {
        // Add new social connection
        await this.prisma.socialConnection.create({
          data: {
            provider,
            providerId,
            userId: user.id,
          },
        });
      }

      // Update user profile with social data if needed
      if (!user.avatarUrl && picture) {
        await this.prisma.user.update({
          where: { id: user.id },
          data: {
            avatarUrl: picture,
            displayName: user.displayName || displayName,
          },
        });
      }
    } else {
      // Create new user with social data
      // Generate a random password for the user
      const randomPassword = uuidv4();
      const passwordHash = await bcrypt.hash(randomPassword, 10);

      // Create user and social connection in a transaction
      const result = await this.prisma.$transaction(async (prisma) => {
        // Check if username is already taken
        const existingUserByUsername = await prisma.user.findUnique({
          where: { username: generatedUsername },
        });

        // If username is taken, append a random string
        const finalUsername = existingUserByUsername
          ? `${generatedUsername}-${Math.random().toString(36).substring(2, 8)}`
          : generatedUsername;

        // Create user
        const newUser = await prisma.user.create({
          data: {
            email,
            username: finalUsername,
            passwordHash,
            isEmailVerified: true, // Social login users are considered verified
            displayName: displayName || finalUsername,
            avatarUrl: picture,
          },
        });

        // Create social connection
        await prisma.socialConnection.create({
          data: {
            provider,
            providerId,
            userId: newUser.id,
          },
        });

        return newUser;
      });

      user = result;
    }

    // Generate tokens
    const tokens = this.generateTokens(user.id, user.username, user.email);

    // Store refresh token
    await this.prisma.$transaction(async (prisma) => {
      await this.storeRefreshToken(prisma, tokens.refreshToken, user.id);
    });

    return tokens;
  }

  /**
   * Generate a username from email or name
   * @param email User email
   * @param firstName User first name
   * @param lastName User last name
   * @returns Generated username
   */
  private generateUsername(email: string, firstName?: string, lastName?: string): string {
    if (firstName && lastName) {
      // Use first name and last name initial
      return `${firstName.toLowerCase()}${lastName.charAt(0).toLowerCase()}`;
    } else if (firstName) {
      // Use first name
      return firstName.toLowerCase();
    } else {
      // Use email prefix
      return email.split('@')[0];
    }
  }
}
