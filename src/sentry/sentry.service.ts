import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as Sentry from '@sentry/node';
import { RewriteFrames } from '@sentry/integrations';
import { Scope } from '@sentry/node';
import { Span, Transaction } from '@sentry/tracing';

/**
 * Service for Sentry error tracking and performance monitoring
 * Initializes Sentry and provides methods for capturing errors and transactions
 */
@Injectable()
export class SentryService implements OnModuleInit {
  private readonly logger = new Logger(SentryService.name);

  constructor(private readonly configService: ConfigService) {}

  /**
   * Initialize Sentry when the module is initialized
   */
  onModuleInit() {
    const dsn = this.configService.get<string>('SENTRY_DSN');
    const environment = this.configService.get<string>(
      'NODE_ENV',
      'development',
    );
    const isProduction = environment === 'production';
    const release = this.configService.get<string>('APP_VERSION', '1.0.0');

    if (!dsn) {
      this.logger.warn(
        'Sentry DSN not found. Error tracking is disabled. Set SENTRY_DSN in your environment to enable it.',
      );
      return;
    }

    Sentry.init({
      dsn,
      environment,
      release,
      enabled: !!dsn,
      tracesSampleRate: isProduction ? 0.1 : 1.0, // Sample 10% of transactions in production, all in development
      profilesSampleRate: isProduction ? 0.1 : 1.0, // Sample 10% of profiles in production, all in development
      integrations: [
        // Rewrite stack trace file paths for source maps
        new RewriteFrames({
          root: process.cwd(),
        }),
        // Enable profiling integration
        // new ProfilingIntegration(),
      ],
      // Set max breadcrumbs to avoid memory issues
      maxBreadcrumbs: 50,
      // Add app metadata
      initialScope: {
        tags: {
          app: 'speedcoding-backend',
        },
      },
    });

    this.logger.log(`Sentry initialized in ${environment} environment`);
  }

  /**
   * Capture an exception with optional extra context
   */
  captureException(exception: Error, captureContext?: any): string {
    return Sentry.captureException(exception, captureContext);
  }

  /**
   * Capture a message with optional extra context
   */
  captureMessage(message: string, captureContext?: any): string {
    return Sentry.captureMessage(message, captureContext);
  }

  /**
   * Start a new transaction for performance monitoring
   */
  startTransaction(context: {
    name: string;
    op: string;
    tags?: Record<string, string>;
    data?: Record<string, any>;
  }): any {
    // Use Sentry hub to create transaction
    return (
      Sentry.startTransaction?.(context) ||
      // Fallback methods if startTransaction is unavailable
      Sentry.getCurrentHub?.().startTransaction?.(context)
    );
  }

  /**
   * Start a new span within a transaction
   */
  startSpan(
    context: {
      name: string;
      op: string;
      tags?: Record<string, string>;
      data?: Record<string, any>;
    },
    parentSpan?: any,
  ): any {
    if (parentSpan) {
      return parentSpan.startChild(context);
    }

    // Use transaction to start span if no direct Sentry.startSpan method
    const transaction = this.getCurrentTransaction();
    if (transaction) {
      return transaction.startChild(context);
    }

    // Fallback to creating a new transaction
    return this.startTransaction(context);
  }

  /**
   * Set user information for the current scope
   */
  setUser(user: { id: string; email?: string; username?: string }): void {
    Sentry.setUser(user);
  }

  /**
   * Set extra context data for the current scope
   */
  setExtra(key: string, value: any): void {
    Sentry.setExtra(key, value);
  }

  /**
   * Set tag for the current scope
   */
  setTag(key: string, value: string): void {
    Sentry.setTag(key, value);
  }

  /**
   * Add breadcrumb to the current scope
   */
  addBreadcrumb(breadcrumb: {
    category?: string;
    message: string;
    level?: 'fatal' | 'error' | 'warning' | 'info' | 'debug';
    data?: Record<string, any>;
  }): void {
    Sentry.addBreadcrumb(breadcrumb);
  }

  /**
   * Get the current active transaction
   */
  getCurrentTransaction(): any {
    // Try accessing transaction through different methods available in Sentry
    const scope = Sentry.getCurrentScope?.();
    if (scope?.getTransaction) {
      return scope.getTransaction();
    }

    const hub = Sentry.getCurrentHub?.();
    return hub?.getScope?.()?.getTransaction?.();
  }

  /**
   * Get the current active span
   */
  getCurrentSpan(): any {
    // First try to get the transaction
    const transaction = this.getCurrentTransaction();
    if (transaction) {
      return transaction;
    }

    // Fallback if getSpan method exists
    const scope = Sentry.getCurrentScope?.();
    return scope?.getSpan?.();
  }

  /**
   * Flush events to Sentry before shutdown
   */
  async close(timeout?: number): Promise<boolean> {
    return Sentry.close(timeout);
  }
}
