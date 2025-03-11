import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto, RegisterDto, RefreshTokenDto, TokensDto } from './dto';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { add } from 'date-fns';
import { User } from '@prisma/client';

/**
 * Authentication Service
 * Handles user authentication and JWT token generation
 */
@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  /**
   * Register a new user
   * @param registerDto Registration data
   * @returns Access and refresh tokens
   */
  async register(registerDto: RegisterDto): Promise<TokensDto> {
    const { username, password } = registerDto;

    // Check if username already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { username },
    });

    if (existingUser) {
      throw new ConflictException('Username already exists');
    }

    // Hash the password
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Create the user in a transaction with a refresh token
    const result = await this.prisma.$transaction(async (prisma) => {
      // Create the user
      const user = await prisma.user.create({
        data: {
          username,
          passwordHash,
        },
      });

      // Generate tokens
      const tokens = await this.generateTokens(user.id, user.username);

      // Create refresh token in database
      await this.storeRefreshToken(prisma, tokens.refreshToken, user.id);

      return { user, tokens };
    });

    return result.tokens;
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
    const tokens = await this.generateTokens(user.id, user.username);

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
    const storedToken = await this.prisma.refreshToken.findUnique({
      where: { token: refreshToken },
      include: { user: true },
    });

    // Validate the token
    if (
      !storedToken ||
      storedToken.isRevoked ||
      new Date() > storedToken.expiresAt
    ) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    // Generate new tokens
    const tokens = await this.generateTokens(
      storedToken.user.id,
      storedToken.user.username,
    );

    // Revoke the old token and store the new one in a transaction
    await this.prisma.$transaction(async (prisma) => {
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
  private async generateTokens(
    userId: number,
    username: string,
  ): Promise<TokensDto> {
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
    prisma: PrismaService | any,
    refreshToken: string,
    userId: number,
  ): Promise<void> {
    // Set expiration date (30 days from now)
    const expiresAt = add(new Date(), { days: 30 });

    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId,
        expiresAt,
      },
    });
  }
}
