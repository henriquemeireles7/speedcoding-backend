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
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { addDays, addHours } from 'date-fns';
import { User, Prisma } from '@prisma/client';

/**
 * Authentication Service
 * Handles user authentication and JWT token generation
 */
@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private mailService: MailService,
  ) {}

  /**
   * Register a new user
   * @param registerDto Registration data
   * @returns Access and refresh tokens
   */
  async register(registerDto: RegisterDto): Promise<TokensDto> {
    const { username, email, password } = registerDto;

    // Check if username already exists
    const existingUser = await this.prisma.user.findFirst({
      where: {
        OR: [{ username }, { email }],
      },
    });

    if (existingUser) {
      if (existingUser.username === username) {
        throw new ConflictException('Username already exists');
      }
      if (existingUser.email === email) {
        throw new ConflictException('Email already exists');
      }
    }

    // Hash the password
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Generate verification token
    const verificationToken = uuidv4();
    const verificationTokenExpiry = addDays(new Date(), 1); // 24 hours

    // Create the user in a transaction with a refresh token
    const result = await this.prisma.$transaction<{
      user: User;
      tokens: TokensDto;
    }>(async (prisma: Prisma.TransactionClient) => {
      // Create the user
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
      const tokens = this.generateTokens(user.id, user.username);

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

    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.isEmailVerified) {
      throw new BadRequestException('Email is already verified');
    }

    // Generate new verification token
    const verificationToken = uuidv4();
    const verificationTokenExpiry = addDays(new Date(), 1); // 24 hours

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
   * @param requestPasswordResetDto Email for password reset
   */
  async requestPasswordReset(
    requestPasswordResetDto: RequestPasswordResetDto,
  ): Promise<void> {
    const { email } = requestPasswordResetDto;

    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      // Don't reveal that the user doesn't exist for security reasons
      return;
    }

    // Generate reset token
    const resetToken = uuidv4();
    const resetTokenExpiry = addHours(new Date(), 1); // 1 hour

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken,
        resetTokenExpiry,
      },
    });

    // Send password reset email
    await this.mailService.sendPasswordResetEmail(user.email, resetToken);
  }

  /**
   * Reset password
   * @param resetPasswordDto Reset password data
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

    // Hash the new password
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(newPassword, saltRounds);

    // Update user and revoke all refresh tokens in a transaction
    await this.prisma.$transaction(async (prisma: Prisma.TransactionClient) => {
      // Update user
      await prisma.user.update({
        where: { id: user.id },
        data: {
          passwordHash,
          resetToken: null,
          resetTokenExpiry: null,
        },
      });

      // Revoke all refresh tokens for security
      await prisma.refreshToken.updateMany({
        where: { userId: user.id },
        data: { isRevoked: true },
      });
    });
  }

  /**
   * Authenticate a user and generate tokens
   * @param loginDto Login credentials
   * @returns Access and refresh tokens
   */
  async login(loginDto: LoginDto): Promise<TokensDto> {
    const { username, password } = loginDto;

    // Find the user by username
    const user = await this.prisma.user.findUnique({
      where: { username },
    });

    // If user doesn't exist or password doesn't match, throw an error
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Compare the provided password with the stored hash
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Generate tokens
    const tokens = this.generateTokens(user.id, user.username);

    // Store refresh token in database
    await this.storeRefreshToken(this.prisma, tokens.refreshToken, user.id);

    return tokens;
  }

  /**
   * Refresh access token using a valid refresh token
   * @param refreshTokenDto Refresh token
   * @returns New access and refresh tokens
   */
  async refreshTokens(refreshTokenDto: RefreshTokenDto): Promise<TokensDto> {
    const { refreshToken } = refreshTokenDto;

    // Find the refresh token in the database
    const storedToken = (await this.prisma.refreshToken.findUnique({
      where: { token: refreshToken },
      include: { user: true },
    })) as Prisma.RefreshTokenGetPayload<{ include: { user: true } }> | null;

    // Validate the token
    if (
      !storedToken ||
      storedToken.isRevoked ||
      new Date() > storedToken.expiresAt
    ) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    // Generate new tokens
    const tokens = this.generateTokens(
      storedToken.user.id,
      storedToken.user.username,
    );

    // Revoke the old token and store the new one in a transaction
    await this.prisma.$transaction(async (prisma: Prisma.TransactionClient) => {
      // Revoke the old token
      await prisma.refreshToken.update({
        where: { id: storedToken.id },
        data: { isRevoked: true },
      });

      // Store the new token
      await this.storeRefreshToken(
        prisma,
        tokens.refreshToken,
        storedToken.user.id,
      );
    });

    return tokens;
  }

  /**
   * Logout a user by revoking their refresh token
   * @param refreshToken Refresh token to revoke
   */
  async logout(refreshToken: string): Promise<void> {
    await this.prisma.refreshToken.updateMany({
      where: { token: refreshToken, isRevoked: false },
      data: { isRevoked: true },
    });
  }

  /**
   * Generate access and refresh tokens for a user
   * @param userId User ID
   * @param username Username
   * @returns Access and refresh tokens
   */
  private generateTokens(userId: number, username: string): TokensDto {
    const payload = {
      sub: userId,
      username,
    };

    // Generate access token (short-lived)
    const accessToken = this.jwtService.sign(payload);

    // Generate refresh token (long-lived, random UUID)
    const refreshToken = uuidv4();

    return {
      accessToken,
      refreshToken,
    };
  }

  /**
   * Store a refresh token in the database
   * @param prisma Prisma client (for transactions)
   * @param refreshToken Refresh token
   * @param userId User ID
   */
  private async storeRefreshToken(
    prisma: Prisma.TransactionClient,
    refreshToken: string,
    userId: number,
  ): Promise<void> {
    // Set expiration date (30 days from now)
    const expiresAt = addDays(new Date(), 30);

    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId,
        expiresAt,
      },
    });
  }
}
