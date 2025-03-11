import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { StartRunDto, EndRunDto, RunResponseDto, RunSummaryDto } from './dto';
import { Run } from '@prisma/client';
import { differenceInSeconds } from 'date-fns';

/**
 * Service for managing runs
 */
@Injectable()
export class RunsService {
  constructor(private prisma: PrismaService) {}

  /**
   * Start a new run
   * @param userId User ID
   * @param startRunDto Run data
   * @returns Created run
   */
  async startRun(
    userId: string,
    startRunDto: StartRunDto,
  ): Promise<RunResponseDto> {
    const { vibeId, techStack } = startRunDto;

    // Verify that the vibe exists
    if (vibeId) {
      const vibe = await this.prisma.vibe.findUnique({
        where: { id: vibeId },
      });

      if (!vibe) {
        throw new NotFoundException(`Vibe with ID ${vibeId} not found`);
      }
    }

    // Create the run
    const run = await this.prisma.run.create({
      data: {
        userId,
        vibeId,
        techStack: techStack ? techStack : [],
        startTime: new Date(),
      },
    });

    return this.mapRunToDto(run);
  }

  /**
   * End a run
   * @param userId User ID
   * @param endRunDto Run data
   * @returns Updated run
   */
  async endRun(userId: string, endRunDto: EndRunDto): Promise<RunResponseDto> {
    const { runId } = endRunDto;

    // Find the run
    const run = await this.prisma.run.findUnique({
      where: { id: runId },
    });

    if (!run) {
      throw new NotFoundException(`Run with ID ${runId} not found`);
    }

    // Verify that the run belongs to the user
    if (run.userId !== userId) {
      throw new BadRequestException('You can only end your own runs');
    }

    // Verify that the run is not already completed
    if (run.completed) {
      throw new BadRequestException('Run is already completed');
    }

    const endTime = new Date();
    const totalTimeInSeconds = differenceInSeconds(endTime, run.startTime);

    // Update the run
    const updatedRun = await this.prisma.run.update({
      where: { id: runId },
      data: {
        endTime,
        completed: true,
        totalTimeInSeconds,
      },
    });

    return this.mapRunToDto(updatedRun);
  }

  /**
   * Get a run by ID
   * @param userId User ID
   * @param runId Run ID
   * @returns Run
   */
  async getRun(userId: string, runId: string): Promise<RunResponseDto> {
    const run = await this.prisma.run.findUnique({
      where: { id: runId },
    });

    if (!run) {
      throw new NotFoundException(`Run with ID ${runId} not found`);
    }

    // Verify that the run belongs to the user
    if (run.userId !== userId) {
      throw new BadRequestException('You can only view your own runs');
    }

    return this.mapRunToDto(run);
  }

  /**
   * Get all runs for a user
   * @param userId User ID
   * @returns List of runs
   */
  async getRuns(userId: string): Promise<RunSummaryDto[]> {
    const runs = await this.prisma.run.findMany({
      where: { userId },
      orderBy: { startTime: 'desc' },
    });

    return runs.map((run) => this.mapRunToSummaryDto(run));
  }

  /**
   * Map a Run entity to a RunResponseDto
   * @param run Run entity
   * @returns RunResponseDto
   */
  private mapRunToDto(run: Run): RunResponseDto {
    return {
      id: run.id,
      userId: run.userId,
      vibeId: run.vibeId || undefined,
      techStack: (run.techStack as string[]) || [],
      startTime: run.startTime,
      endTime: run.endTime || undefined,
      completed: run.completed,
      totalTimeInSeconds: run.totalTimeInSeconds || undefined,
      createdAt: run.createdAt,
      updatedAt: run.updatedAt,
    };
  }

  /**
   * Map a Run entity to a RunSummaryDto
   * @param run Run entity
   * @returns RunSummaryDto
   */
  private mapRunToSummaryDto(run: Run): RunSummaryDto {
    return {
      id: run.id,
      vibeId: run.vibeId || undefined,
      startTime: run.startTime,
      endTime: run.endTime || undefined,
      completed: run.completed,
    };
  }
}
