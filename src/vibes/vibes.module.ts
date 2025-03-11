import { Module } from '@nestjs/common';
import { VibesController } from './vibes.controller';
import { VibesService } from './vibes.service';
import { PrismaService } from '../prisma/prisma.service';

/**
 * Module for managing vibes
 */
@Module({
  controllers: [VibesController],
  providers: [VibesService, PrismaService],
  exports: [VibesService],
})
export class VibesModule {}
