import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { UserResponseDto } from './dto/user-response.dto';

/**
 * Service for managing users
 * Handles CRUD operations for user profiles
 */
@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  /**
   * Find a user by ID
   * @param id User ID
   * @returns User object
   * @throws NotFoundException if user not found
   */
  async findById(id: string): Promise<User> {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return user;
  }

  /**
   * Find a user by email
   * @param email User email
   * @returns User object or null if not found
   */
  async findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  /**
   * Find a user by username
   * @param username Username
   * @returns User object or null if not found
   */
  async findByUsername(username: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { username },
    });
  }

  /**
   * Update a user's profile
   * @param id User ID
   * @param updateUserDto Update data
   * @returns Updated user
   * @throws NotFoundException if user not found
   */
  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    // Check if user exists
    await this.findById(id);

    return this.prisma.user.update({
      where: { id },
      data: updateUserDto,
    });
  }

  /**
   * Delete a user and all related data
   * @param id User ID
   * @throws NotFoundException if user not found
   */
  async remove(id: string): Promise<void> {
    // Check if user exists
    await this.findById(id);

    // Use transaction to delete related data
    await this.prisma.$transaction(async (prisma) => {
      // Delete related data first (refreshTokens, runs, etc.)
      await prisma.refreshToken.deleteMany({
        where: { userId: id },
      });

      // Delete runs and related data
      const runs = await prisma.run.findMany({
        where: { userId: id },
        select: { id: true },
      });

      const runIds = runs.map((run) => run.id);

      await prisma.milestone.deleteMany({
        where: { runId: { in: runIds } },
      });

      await prisma.submission.deleteMany({
        where: { runId: { in: runIds } },
      });

      await prisma.run.deleteMany({
        where: { userId: id },
      });

      // Finally delete the user
      await prisma.user.delete({
        where: { id },
      });
    });
  }

  /**
   * Get user statistics
   * @param userId User ID
   * @returns User statistics
   */
  async getUserStats(userId: string): Promise<any> {
    const totalRuns = await this.prisma.run.count({
      where: { userId },
    });

    const completedRuns = await this.prisma.run.count({
      where: {
        userId,
        completed: true,
      },
    });

    const fastestRun = await this.prisma.run.findFirst({
      where: {
        userId,
        completed: true,
      },
      orderBy: {
        totalTimeInSeconds: 'asc',
      },
    });

    return {
      totalRuns,
      completedRuns,
      fastestRunTime: fastestRun?.totalTimeInSeconds || null,
    };
  }

  /**
   * Get user's runs
   * @param userId User ID
   * @param limit Maximum number of runs to return
   * @param offset Number of runs to skip
   * @returns Array of runs
   */
  async getUserRuns(userId: string, limit = 10, offset = 0): Promise<any[]> {
    return this.prisma.run.findMany({
      where: { userId },
      include: {
        vibe: true,
        milestones: true,
        submissions: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
      skip: offset,
    });
  }

  /**
   * Map a User entity to a UserResponseDto
   * @param user User entity
   * @returns UserResponseDto
   */
  mapToDto(user: User): UserResponseDto {
    const {
      id,
      username,
      email,
      isEmailVerified,
      displayName,
      bio,
      avatarUrl,
      preferences,
      createdAt,
      updatedAt,
    } = user;
    return {
      id,
      username,
      email,
      isEmailVerified,
      displayName,
      bio,
      avatarUrl,
      preferences,
      createdAt,
      updatedAt,
    };
  }
}
