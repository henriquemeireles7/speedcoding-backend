import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import * as Sentry from '@sentry/node';
import { ProfilingIntegration } from '@sentry/profiling-node';
import { APP_FILTER } from '@nestjs/core';
import {
  Catch,
  ArgumentsHost,
  HttpException,
  ExceptionFilter,
} from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';

/**
 * Exception filter that sends exceptions to Sentry
 */
@Catch()
export class SentryExceptionFilter implements ExceptionFilter {
  constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const { httpAdapter } = this.httpAdapterHost;
    const ctx = host.switchToHttp();

    // Don't send 4xx errors to Sentry
    if (exception instanceof HttpException && exception.getStatus() < 500) {
      return;
    }

    // Send exception to Sentry
    Sentry.captureException(exception);

    // Let the default exception handler deal with the response
    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const response = exception.getResponse();

      httpAdapter.reply(ctx.getResponse(), response, status);
    } else {
      // For unhandled errors, return a 500
      httpAdapter.reply(
        ctx.getResponse(),
        {
          statusCode: 500,
          message: 'Internal server error',
        },
        500,
      );
    }
  }
}

/**
 * Module for Sentry integration
 */
@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: APP_FILTER,
      useClass: SentryExceptionFilter,
    },
  ],
})
export class SentryModule {
  constructor(private readonly configService: ConfigService) {
    const dsn = this.configService.get<string>('SENTRY_DSN');
    const environment = this.configService.get<string>(
      'NODE_ENV',
      'development',
    );

    if (dsn) {
      Sentry.init({
        dsn,
        environment,
        integrations: [new ProfilingIntegration()],
        // Performance monitoring
        tracesSampleRate: environment === 'production' ? 0.1 : 1.0,
        // Set sampling rate for profiling - this is relative to tracesSampleRate
        profilesSampleRate: environment === 'production' ? 0.1 : 1.0,
      });
    }
  }
}

// Export the Sentry module and components
export { SentryModule } from './sentry.module';
export { SentryService } from './sentry.service';
export { SentryInterceptor } from './sentry.interceptor';
export { SentryExceptionFilter } from './sentry.filter';
