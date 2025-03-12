import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { User, Prisma } from '@prisma/client';
import { BaseRepository } from '../../common/repositories/base.repository';

/**
 * Repository for user-related database operations
 * Abstracts Prisma operations for better testability and separation of concerns
 */
@Injectable()
export class UserRepository extends BaseRepository {
  constructor(private prisma: PrismaService) {
    super();
  }

  /**
   * Find a user by ID
   * @param id User ID
   * @returns User or null
   */
  async findById(id: string): Promise<User | null> {
    return this.handlePrismaError(
      () => this.prisma.user.findUnique({ where: { id } }),
      'finding user by ID',
    );
  }

  /**
   * Find a user by email
   * @param email User email
   * @returns User or null
   */
  async findByEmail(email: string): Promise<User | null> {
    return this.handlePrismaError(
      () => this.prisma.user.findUnique({ where: { email } }),
      'finding user by email',
    );
  }

  /**
   * Find a user by username
   * @param username Username
   * @returns User or null
   */
  async findByUsername(username: string): Promise<User | null> {
    return this.handlePrismaError(
      () => this.prisma.user.findUnique({ where: { username } }),
      'finding user by username',
    );
  }

  /**
   * Find a user by verification token
   * @param token Verification token
   * @returns User or null
   */
  async findByVerificationToken(token: string): Promise<User | null> {
    return this.handlePrismaError(
      () => this.prisma.user.findFirst({ where: { verificationToken: token } }),
      'finding user by verification token',
    );
  }

  /**
   * Find a user by reset token
   * @param token Reset token
   * @returns User or null
   */
  async findByResetToken(token: string): Promise<User | null> {
    return this.handlePrismaError(
      () => this.prisma.user.findFirst({ where: { resetToken: token } }),
      'finding user by reset token',
    );
  }

  /**
   * Find a user by social connection
   * @param provider OAuth provider
   * @param providerId Provider-specific user ID
   * @returns User or null
   */
  async findBySocialConnection(
    provider: string,
    providerId: string,
  ): Promise<User | null> {
    return this.handlePrismaError(
      () =>
        this.prisma.user.findFirst({
          where: {
            socialConnections: {
              some: {
                provider,
                providerId,
              },
            },
          },
        }),
      'finding user by social connection',
    );
  }

  /**
   * Create a new user
   * @param data User data
   * @returns Created user
   */
  async createUser(data: Prisma.UserCreateInput): Promise<User> {
    return this.handlePrismaError(
      () => this.prisma.user.create({ data }),
      'creating user',
    );
  }

  /**
   * Update a user
   * @param id User ID
   * @param data User data to update
   * @returns Updated user
   */
  async updateUser(id: string, data: Prisma.UserUpdateInput): Promise<User> {
    return this.handlePrismaError(
      () => this.prisma.user.update({ where: { id }, data }),
      'updating user',
    );
  }

  /**
   * Update user profile
   * @param id User ID
   * @param data Profile data to update
   * @returns Updated user
   */
  async updateUserProfile(
    id: string,
    data: {
      displayName?: string;
      avatarUrl?: string;
      bio?: string;
      location?: string;
      website?: string;
      socialLinks?: any;
      skills?: any;
    },
  ): Promise<User> {
    return this.handlePrismaError(
      () => this.prisma.user.update({ where: { id }, data }),
      'updating user profile',
    );
  }

  /**
   * Set verification token for a user
   * @param userId User ID
   * @param token Verification token
   * @param expiryDate Token expiry date
   */
  async setVerificationToken(
    userId: string,
    token: string,
    expiryDate: Date,
  ): Promise<void> {
    await this.handlePrismaError(
      () =>
        this.prisma.user.update({
          where: { id: userId },
          data: {
            verificationToken: token,
            verificationTokenExpiry: expiryDate,
          },
        }),
      'setting verification token',
    );
  }

  /**
   * Mark a user's email as verified
   * @param userId User ID
   */
  async markEmailAsVerified(userId: string): Promise<void> {
    await this.handlePrismaError(
      () =>
        this.prisma.user.update({
          where: { id: userId },
          data: {
            isEmailVerified: true,
            verificationToken: null,
            verificationTokenExpiry: null,
          },
        }),
      'marking email as verified',
    );
  }

  /**
   * Set reset token for a user
   * @param userId User ID
   * @param token Reset token
   * @param expiryDate Token expiry date
   */
  async setResetToken(
    userId: string,
    token: string,
    expiryDate: Date,
  ): Promise<void> {
    await this.handlePrismaError(
      () =>
        this.prisma.user.update({
          where: { id: userId },
          data: {
            resetToken: token,
            resetTokenExpiry: expiryDate,
          },
        }),
      'setting reset token',
    );
  }

  /**
   * Update a user's password
   * @param userId User ID
   * @param passwordHash Hashed password
   */
  async updatePassword(userId: string, passwordHash: string): Promise<void> {
    await this.handlePrismaError(
      () =>
        this.prisma.user.update({
          where: { id: userId },
          data: {
            passwordHash,
            resetToken: null,
            resetTokenExpiry: null,
          },
        }),
      'updating password',
    );
  }

  /**
   * Find a social connection
   * @param userId User ID
   * @param provider OAuth provider
   * @param providerId Provider-specific user ID
   * @returns Social connection or null
   */
  async findSocialConnection(
    userId: string,
    provider: string,
    providerId: string,
  ): Promise<Prisma.SocialConnectionGetPayload<object> | null> {
    return this.handlePrismaError(
      () =>
        this.prisma.socialConnection.findFirst({
          where: {
            userId,
            provider,
            providerId,
          },
        }),
      'finding social connection',
    );
  }

  /**
   * Create a social connection
   * @param userId User ID
   * @param provider OAuth provider
   * @param providerId Provider-specific user ID
   */
  async createSocialConnection(
    userId: string,
    provider: string,
    providerId: string,
  ): Promise<void> {
    await this.handlePrismaError(
      () =>
        this.prisma.socialConnection.create({
          data: {
            userId,
            provider,
            providerId,
          },
        }),
      'creating social connection',
    );
  }

  /**
   * Create a user with a social connection
   * @param userData User data
   * @param socialData Social connection data
   * @returns Created user
   */
  async createUserWithSocialConnection(
    userData: {
      email: string;
      username: string;
      passwordHash: string;
      isEmailVerified: boolean;
      displayName?: string;
      avatarUrl?: string;
    },
    socialData: {
      provider: string;
      providerId: string;
    },
  ): Promise<User> {
    return this.handlePrismaError(async () => {
      return this.prisma.$transaction(async (tx) => {
        // Check if username is already taken
        const existingUserByUsername = await tx.user.findUnique({
          where: { username: userData.username },
        });

        // If username is taken, append a random string
        const finalUsername = existingUserByUsername
          ? `${userData.username}-${Math.random().toString(36).substring(2, 8)}`
          : userData.username;

        // Create user
        const newUser = await tx.user.create({
          data: {
            ...userData,
            username: finalUsername,
          },
        });

        // Create social connection
        await tx.socialConnection.create({
          data: {
            userId: newUser.id,
            provider: socialData.provider,
            providerId: socialData.providerId,
          },
        });

        return newUser;
      });
    }, 'creating user with social connection');
  }

  /**
   * Store a refresh token
   * @param token Refresh token
   * @param userId User ID
   * @param expiresAt Token expiry date
   */
  async storeRefreshToken(
    token: string,
    userId: string,
    expiresAt: Date,
  ): Promise<void> {
    await this.handlePrismaError(
      () =>
        this.prisma.refreshToken.create({
          data: {
            token,
            userId,
            expiresAt,
          },
        }),
      'storing refresh token',
    );
  }

  /**
   * Validate a refresh token
   * @param token Refresh token
   * @returns True if token is valid
   */
  async validateRefreshToken(token: string): Promise<boolean> {
    const refreshToken = await this.handlePrismaError(
      () => this.prisma.refreshToken.findUnique({ where: { token } }),
      'validating refresh token',
    );

    if (!refreshToken) {
      return false;
    }

    if (refreshToken.isRevoked) {
      return false;
    }

    if (refreshToken.expiresAt < new Date()) {
      return false;
    }

    return true;
  }

  /**
   * Revoke a refresh token
   * @param token Refresh token
   */
  async revokeRefreshToken(token: string): Promise<void> {
    await this.handlePrismaError(
      () =>
        this.prisma.refreshToken.update({
          where: { token },
          data: { isRevoked: true },
        }),
      'revoking refresh token',
    );
  }

  /**
   * Revoke all refresh tokens for a user
   * @param userId User ID
   */
  async revokeAllUserRefreshTokens(userId: string): Promise<void> {
    await this.handlePrismaError(
      () =>
        this.prisma.refreshToken.updateMany({
          where: { userId },
          data: { isRevoked: true },
        }),
      'revoking all user refresh tokens',
    );
  }
}
