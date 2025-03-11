import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { VerifyMilestoneDto, MilestoneResponseDto } from './dto';
import { Milestone } from '@prisma/client';

/**
 * Service for managing milestones
 */
@Injectable()
export class MilestonesService {
  constructor(private prisma: PrismaService) {}

  /**
   * Verify a milestone for a run
   * @param userId User ID
   * @param milestoneIndex Milestone index (1-7)
   * @param verifyMilestoneDto Milestone data
   * @returns Verified milestone
   */
  async verifyMilestone(
    userId: string,
    milestoneIndex: number,
    verifyMilestoneDto: VerifyMilestoneDto,
  ): Promise<MilestoneResponseDto> {
    const { runId } = verifyMilestoneDto;

    // Validate milestone index
    if (milestoneIndex < 1 || milestoneIndex > 7) {
      throw new BadRequestException('Milestone index must be between 1 and 7');
    }

    // Find the run
    const run = await this.prisma.run.findUnique({
      where: { id: runId },
    });

    if (!run) {
      throw new NotFoundException(`Run with ID ${runId} not found`);
    }

    // Verify that the run belongs to the user
    if (run.userId !== userId) {
      throw new BadRequestException(
        'You can only verify milestones for your own runs',
      );
    }

    // Verify that the run is not already completed
    if (run.completed) {
      throw new BadRequestException(
        'Cannot verify milestones for completed runs',
      );
    }

    // Check if the milestone already exists
    const existingMilestone = await this.prisma.milestone.findFirst({
      where: {
        runId,
        milestoneIndex,
      },
    });

    if (existingMilestone) {
      // If the milestone exists and is already verified, return it
      if (existingMilestone.verified) {
        return this.mapMilestoneToDto(existingMilestone);
      }

      // Otherwise, update it to verified
      const updatedMilestone = await this.prisma.milestone.update({
        where: { id: existingMilestone.id },
        data: { verified: true },
      });

      return this.mapMilestoneToDto(updatedMilestone);
    }

    // Create a new milestone
    const milestone = await this.prisma.milestone.create({
      data: {
        runId,
        milestoneIndex,
        verified: true,
      },
    });

    return this.mapMilestoneToDto(milestone);
  }

  /**
   * Get all milestones for a run
   * @param userId User ID
   * @param runId Run ID
   * @returns List of milestones
   */
  async getMilestones(
    userId: string,
    runId: string,
  ): Promise<MilestoneResponseDto[]> {
    // Find the run
    const run = await this.prisma.run.findUnique({
      where: { id: runId },
    });

    if (!run) {
      throw new NotFoundException(`Run with ID ${runId} not found`);
    }

    // Verify that the run belongs to the user
    if (run.userId !== userId) {
      throw new BadRequestException(
        'You can only view milestones for your own runs',
      );
    }

    // Get all milestones for the run
    const milestones = await this.prisma.milestone.findMany({
      where: { runId },
      orderBy: { milestoneIndex: 'asc' },
    });

    return milestones.map((milestone) => this.mapMilestoneToDto(milestone));
  }

  /**
   * Map a Milestone entity to a MilestoneResponseDto
   * @param milestone Milestone entity
   * @returns MilestoneResponseDto
   */
  private mapMilestoneToDto(milestone: Milestone): MilestoneResponseDto {
    return {
      id: milestone.id,
      runId: milestone.runId,
      milestoneIndex: milestone.milestoneIndex,
      verified: milestone.verified,
      timestamp: milestone.createdAt,
    };
  }
}
