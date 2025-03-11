import { Module } from '@nestjs/common';
import { RunsController } from './runs.controller';
import { RunsService } from './runs.service';
import { PrismaService } from '../prisma/prisma.service';

/**
 * Module for managing runs
 */
@Module({
  controllers: [RunsController],
  providers: [RunsService, PrismaService],
  exports: [RunsService],
})
export class RunsModule {}
