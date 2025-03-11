import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { User, Prisma } from '@prisma/client';
import { DatabaseException } from '../exceptions/database.exception';

/**
 * Repository for user-related database operations
 * Abstracts Prisma operations for better testability and separation of concerns
 */
@Injectable()
export class UserRepository {
  constructor(private prisma: PrismaService) {}

  /**
   * Find a user by ID
   * @param id User ID
   * @returns User or null
   */
  async findById(id: string): Promise<User | null> {
    try {
      return await this.prisma.user.findUnique({
        where: { id },
      });
    } catch (error) {
      throw new DatabaseException(`Error finding user by ID: ${error.message}`);
    }
  }

  /**
   * Find a user by email
   * @param email User email
   * @returns User or null
   */
  async findByEmail(email: string): Promise<User | null> {
    try {
      return await this.prisma.user.findUnique({
        where: { email },
      });
    } catch (error) {
      throw new DatabaseException(
        `Error finding user by email: ${error.message}`,
      );
    }
  }

  /**
   * Find a user by username
   * @param username Username
   * @returns User or null
   */
  async findByUsername(username: string): Promise<User | null> {
    try {
      return await this.prisma.user.findUnique({
        where: { username },
      });
    } catch (error) {
      throw new DatabaseException(
        `Error finding user by username: ${error.message}`,
      );
    }
  }

  /**
   * Find a user by verification token
   * @param token Verification token
   * @returns User or null
   */
  async findByVerificationToken(token: string): Promise<User | null> {
    try {
      return await this.prisma.user.findFirst({
        where: { verificationToken: token },
      });
    } catch (error) {
      throw new DatabaseException(
        `Error finding user by verification token: ${error.message}`,
      );
    }
  }

  /**
   * Find a user by reset token
   * @param token Reset token
   * @returns User or null
   */
  async findByResetToken(token: string): Promise<User | null> {
    try {
      return await this.prisma.user.findFirst({
        where: { resetToken: token },
      });
    } catch (error) {
      throw new DatabaseException(
        `Error finding user by reset token: ${error.message}`,
      );
    }
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
    try {
      return await this.prisma.user.findFirst({
        where: {
          socialConnections: {
            some: {
              provider,
              providerId,
            },
          },
        },
      });
    } catch (error) {
      throw new DatabaseException(
        `Error finding user by social connection: ${error.message}`,
      );
    }
  }

  /**
   * Create a new user
   * @param data User data
   * @returns Created user
   */
  async createUser(data: Prisma.UserCreateInput): Promise<User> {
    try {
      return await this.prisma.user.create({
        data,
      });
    } catch (error) {
      throw new DatabaseException(`Error creating user: ${error.message}`);
    }
  }

  /**
   * Update a user
   * @param id User ID
   * @param data User data to update
   * @returns Updated user
   */
  async updateUser(id: string, data: Prisma.UserUpdateInput): Promise<User> {
    try {
      return await this.prisma.user.update({
        where: { id },
        data,
      });
    } catch (error) {
      throw new DatabaseException(`Error updating user: ${error.message}`);
    }
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
    try {
      return await this.prisma.user.update({
        where: { id },
        data,
      });
    } catch (error) {
      throw new DatabaseException(
        `Error updating user profile: ${error.message}`,
      );
    }
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
    try {
      await this.prisma.user.update({
        where: { id: userId },
        data: {
          verificationToken: token,
          verificationTokenExpiry: expiryDate,
        },
      });
    } catch (error) {
      throw new DatabaseException(
        `Error setting verification token: ${error.message}`,
      );
    }
  }

  /**
   * Mark a user's email as verified
   * @param userId User ID
   */
  async markEmailAsVerified(userId: string): Promise<void> {
    try {
      await this.prisma.user.update({
        where: { id: userId },
        data: {
          isEmailVerified: true,
          verificationToken: null,
          verificationTokenExpiry: null,
        },
      });
    } catch (error) {
      throw new DatabaseException(
        `Error marking email as verified: ${error.message}`,
      );
    }
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
    try {
      await this.prisma.user.update({
        where: { id: userId },
        data: {
          resetToken: token,
          resetTokenExpiry: expiryDate,
        },
      });
    } catch (error) {
      throw new DatabaseException(
        `Error setting reset token: ${error.message}`,
      );
    }
  }

  /**
   * Update a user's password
   * @param userId User ID
   * @param passwordHash Hashed password
   */
  async updatePassword(userId: string, passwordHash: string): Promise<void> {
    try {
      await this.prisma.user.update({
        where: { id: userId },
        data: {
          passwordHash,
          resetToken: null,
          resetTokenExpiry: null,
        },
      });
    } catch (error) {
      throw new DatabaseException(`Error updating password: ${error.message}`);
    }
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
  ): Promise<any | null> {
    try {
      return await this.prisma.socialConnection.findFirst({
        where: {
          userId,
          provider,
          providerId,
        },
      });
    } catch (error) {
      throw new DatabaseException(
        `Error finding social connection: ${error.message}`,
      );
    }
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
    try {
      await this.prisma.socialConnection.create({
        data: {
          userId,
          provider,
          providerId,
        },
      });
    } catch (error) {
      throw new DatabaseException(
        `Error creating social connection: ${error.message}`,
      );
    }
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
    try {
      return await this.prisma.$transaction(async (tx) => {
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
    } catch (error) {
      throw new DatabaseException(
        `Error creating user with social connection: ${error.message}`,
      );
    }
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
    try {
      await this.prisma.refreshToken.create({
        data: {
          token,
          userId,
          expiresAt,
        },
      });
    } catch (error) {
      throw new DatabaseException(
        `Error storing refresh token: ${error.message}`,
      );
    }
  }

  /**
   * Validate a refresh token
   * @param token Refresh token
   * @returns True if token is valid
   */
  async validateRefreshToken(token: string): Promise<boolean> {
    try {
      const refreshToken = await this.prisma.refreshToken.findUnique({
        where: { token },
      });

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
    } catch (error) {
      throw new DatabaseException(
        `Error validating refresh token: ${error.message}`,
      );
    }
  }

  /**
   * Revoke a refresh token
   * @param token Refresh token
   */
  async revokeRefreshToken(token: string): Promise<void> {
    try {
      await this.prisma.refreshToken.update({
        where: { token },
        data: { isRevoked: true },
      });
    } catch (error) {
      throw new DatabaseException(
        `Error revoking refresh token: ${error.message}`,
      );
    }
  }

  /**
   * Revoke all refresh tokens for a user
   * @param userId User ID
   */
  async revokeAllUserRefreshTokens(userId: string): Promise<void> {
    try {
      await this.prisma.refreshToken.updateMany({
        where: { userId },
        data: { isRevoked: true },
      });
    } catch (error) {
      throw new DatabaseException(
        `Error revoking all user refresh tokens: ${error.message}`,
      );
    }
  }
}
