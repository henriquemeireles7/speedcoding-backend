import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSubmissionDto, SubmissionResponseDto } from './dto';
import { Submission, Status } from '@prisma/client';

/**
 * Service for managing submissions
 */
@Injectable()
export class SubmissionsService {
  constructor(private prisma: PrismaService) {}

  /**
   * Create a new submission or update an existing one
   * @param userId User ID
   * @param createSubmissionDto Submission data
   * @returns Created or updated submission
   */
  async createSubmission(
    userId: string,
    createSubmissionDto: CreateSubmissionDto,
  ): Promise<SubmissionResponseDto> {
    const { runId, videoUrl } = createSubmissionDto;

    // Find the run
    const run = await this.prisma.run.findUnique({
      where: { id: runId },
    });

    if (!run) {
      throw new NotFoundException(`Run with ID ${runId} not found`);
    }

    // Verify that the run belongs to the user
    if (run.userId !== userId) {
      throw new BadRequestException('You can only submit for your own runs');
    }

    // Verify that the run is completed
    if (!run.completed) {
      throw new BadRequestException('Run must be completed before submission');
    }

    // Check if a submission already exists for this run
    const existingSubmission = await this.prisma.submission.findFirst({
      where: { runId },
    });

    if (existingSubmission) {
      // Update the existing submission
      const updatedSubmission = await this.prisma.submission.update({
        where: { id: existingSubmission.id },
        data: {
          videoUrl,
          status: Status.PENDING, // Reset status to pending on update
        },
      });

      return this.mapSubmissionToDto(updatedSubmission);
    }

    // Create a new submission
    const submission = await this.prisma.submission.create({
      data: {
        runId,
        videoUrl,
        status: Status.PENDING,
      },
    });

    return this.mapSubmissionToDto(submission);
  }

  /**
   * Get a submission by ID
   * @param userId User ID
   * @param submissionId Submission ID
   * @returns Submission
   */
  async getSubmission(
    userId: string,
    submissionId: string,
  ): Promise<SubmissionResponseDto> {
    const submission = await this.prisma.submission.findUnique({
      where: { id: submissionId },
      include: { run: true },
    });

    if (!submission) {
      throw new NotFoundException(
        `Submission with ID ${submissionId} not found`,
      );
    }

    // Verify that the submission belongs to the user
    if (submission.run.userId !== userId) {
      throw new BadRequestException('You can only view your own submissions');
    }

    return this.mapSubmissionToDto(submission);
  }

  /**
   * Get all submissions for a user
   * @param userId User ID
   * @returns List of submissions
   */
  async getSubmissions(userId: string): Promise<SubmissionResponseDto[]> {
    const submissions = await this.prisma.submission.findMany({
      where: {
        run: {
          userId,
        },
      },
      include: { run: true },
      orderBy: { createdAt: 'desc' },
    });

    return submissions.map((submission) => this.mapSubmissionToDto(submission));
  }

  /**
   * Map a Submission entity to a SubmissionResponseDto
   * @param submission Submission entity
   * @returns SubmissionResponseDto
   */
  private mapSubmissionToDto(submission: Submission): SubmissionResponseDto {
    return {
      id: submission.id,
      runId: submission.runId,
      videoUrl: submission.videoUrl,
      status: submission.status,
      createdAt: submission.createdAt,
      updatedAt: submission.updatedAt,
    };
  }
}
