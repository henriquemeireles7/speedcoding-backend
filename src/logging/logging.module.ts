import { Module } from '@nestjs/common';
import { LoggingService } from './logging.service';

/**
 * Logging module for configuring application-wide logging
 * Provides a logging service that wraps NestJS Logger
 */
@Module({
  providers: [LoggingService],
  exports: [LoggingService],
})
export class LoggingModule {}
