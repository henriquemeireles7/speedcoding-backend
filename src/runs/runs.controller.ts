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
import { RunsService } from './runs.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { StartRunDto, EndRunDto, RunResponseDto, RunSummaryDto } from './dto';
import { Request } from 'express';

/**
 * Controller for managing runs
 */
@Controller('runs')
@UseGuards(JwtAuthGuard)
export class RunsController {
  constructor(private runsService: RunsService) {}

  /**
   * Start a new run
   * @param req Request object
   * @param startRunDto Run data
   * @returns Created run
   */
  @Post('start')
  @HttpCode(HttpStatus.CREATED)
  async startRun(
    @Req() req: Request & { user: { id: string } },
    @Body() startRunDto: StartRunDto,
  ): Promise<RunResponseDto> {
    return this.runsService.startRun(req.user.id, startRunDto);
  }

  /**
   * End a run
   * @param req Request object
   * @param endRunDto Run data
   * @returns Updated run
   */
  @Post('end')
  @HttpCode(HttpStatus.OK)
  async endRun(
    @Req() req: Request & { user: { id: string } },
    @Body() endRunDto: EndRunDto,
  ): Promise<RunResponseDto> {
    return this.runsService.endRun(req.user.id, endRunDto);
  }

  /**
   * Get a run by ID
   * @param req Request object
   * @param runId Run ID
   * @returns Run
   */
  @Get(':runId')
  @HttpCode(HttpStatus.OK)
  async getRun(
    @Req() req: Request & { user: { id: string } },
    @Param('runId') runId: string,
  ): Promise<RunResponseDto> {
    return this.runsService.getRun(req.user.id, runId);
  }

  /**
   * Get all runs for the authenticated user
   * @param req Request object
   * @returns List of runs
   */
  @Get()
  @HttpCode(HttpStatus.OK)
  async getRuns(
    @Req() req: Request & { user: { id: string } },
  ): Promise<RunSummaryDto[]> {
    return this.runsService.getRuns(req.user.id);
  }
}
