import { Module, Global } from '@nestjs/common';
import { SentryService } from './sentry.service';
import { SentryInterceptor } from './sentry.interceptor';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';

/**
 * Global Sentry module for error tracking and monitoring
 * Provides services for capturing errors and performance metrics
 */
@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    SentryService,
    {
      provide: APP_INTERCEPTOR,
      useClass: SentryInterceptor,
    },
  ],
  exports: [SentryService],
})
export class SentryModule {}
