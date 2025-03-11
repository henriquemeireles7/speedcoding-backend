import {
  Controller,
  Post,
  Body,
  UseGuards,
  Req,
  Get,
  Param,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { SubmissionsService } from './submissions.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateSubmissionDto, SubmissionResponseDto } from './dto';
import { Request } from 'express';

/**
 * Controller for managing submissions
 */
@Controller('submissions')
@UseGuards(JwtAuthGuard)
export class SubmissionsController {
  constructor(private submissionsService: SubmissionsService) {}

  /**
   * Create a new submission or update an existing one
   * @param req Request object
   * @param createSubmissionDto Submission data
   * @returns Created or updated submission
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createSubmission(
    @Req() req: Request & { user: { id: string } },
    @Body() createSubmissionDto: CreateSubmissionDto,
  ): Promise<SubmissionResponseDto> {
    return this.submissionsService.createSubmission(
      req.user.id,
      createSubmissionDto,
    );
  }

  /**
   * Get a submission by ID
   * @param req Request object
   * @param submissionId Submission ID
   * @returns Submission
   */
  @Get(':submissionId')
  @HttpCode(HttpStatus.OK)
  async getSubmission(
    @Req() req: Request & { user: { id: string } },
    @Param('submissionId') submissionId: string,
  ): Promise<SubmissionResponseDto> {
    return this.submissionsService.getSubmission(req.user.id, submissionId);
  }

  /**
   * Get all submissions for the authenticated user
   * @param req Request object
   * @returns List of submissions
   */
  @Get()
  @HttpCode(HttpStatus.OK)
  async getSubmissions(
    @Req() req: Request & { user: { id: string } },
  ): Promise<SubmissionResponseDto[]> {
    return this.submissionsService.getSubmissions(req.user.id);
  }
}
