import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { HealthController } from './health.controller';
import { PrismaService } from '../prisma/prisma.service';
import { HttpModule } from '@nestjs/axios';
import { PrometheusModule } from '@willsoto/nestjs-prometheus';

/**
 * Health module for monitoring application status
 * Provides endpoints to check the health of various components
 */
@Module({
  imports: [
    // Terminus module for health checks
    TerminusModule,
    // HTTP module for external service health checks
    HttpModule,
    // Prometheus module for metrics
    PrometheusModule,
  ],
  controllers: [HealthController],
  providers: [PrismaService],
})
export class HealthModule {}
