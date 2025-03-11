import { Injectable, LoggerService, LogLevel } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

/**
 * Enhanced logging service that wraps NestJS Logger
 * Provides structured logging with metadata and context
 */
@Injectable()
export class LoggingService implements LoggerService {
  private context?: string;
  private logLevels: LogLevel[] = ['error', 'warn', 'log', 'debug', 'verbose'];

  constructor(private configService: ConfigService) {
    // Set log levels based on environment
    const nodeEnv = this.configService.get('NODE_ENV', 'development');
    if (nodeEnv === 'production') {
      this.logLevels = ['error', 'warn', 'log']; // Less verbose in production
    }
  }

  /**
   * Set the context for the logger
   * @param context Logger context (usually class name)
   */
  setContext(context: string): this {
    this.context = context;
    return this;
  }

  /**
   * Log an error message
   * @param message Message to log
   * @param trace Error stack trace
   * @param context Optional context override
   */
  error(message: any, trace?: string, context?: string): void {
    if (!this.isLogLevelEnabled('error')) return;

    const currentContext = context || this.context;
    const timestamp = new Date().toISOString();

    console.error(
      this.formatMessage('ERROR', message, currentContext, timestamp),
    );

    if (trace) {
      console.error(trace);
    }
  }

  /**
   * Log a warning message
   * @param message Message to log
   * @param context Optional context override
   */
  warn(message: any, context?: string): void {
    if (!this.isLogLevelEnabled('warn')) return;

    const currentContext = context || this.context;
    const timestamp = new Date().toISOString();

    console.warn(
      this.formatMessage('WARN', message, currentContext, timestamp),
    );
  }

  /**
   * Log an info message
   * @param message Message to log
   * @param context Optional context override
   */
  log(message: any, context?: string): void {
    if (!this.isLogLevelEnabled('log')) return;

    const currentContext = context || this.context;
    const timestamp = new Date().toISOString();

    console.log(this.formatMessage('INFO', message, currentContext, timestamp));
  }

  /**
   * Log a debug message
   * @param message Message to log
   * @param context Optional context override
   */
  debug(message: any, context?: string): void {
    if (!this.isLogLevelEnabled('debug')) return;

    const currentContext = context || this.context;
    const timestamp = new Date().toISOString();

    console.debug(
      this.formatMessage('DEBUG', message, currentContext, timestamp),
    );
  }

  /**
   * Log a verbose message
   * @param message Message to log
   * @param context Optional context override
   */
  verbose(message: any, context?: string): void {
    if (!this.isLogLevelEnabled('verbose')) return;

    const currentContext = context || this.context;
    const timestamp = new Date().toISOString();

    console.log(
      this.formatMessage('VERBOSE', message, currentContext, timestamp),
    );
  }

  /**
   * Log a message with metadata
   * @param level Log level
   * @param message Message to log
   * @param metadata Additional metadata
   * @param context Optional context override
   */
  logWithMetadata(
    level: 'error' | 'warn' | 'log' | 'debug' | 'verbose',
    message: string,
    metadata: Record<string, any>,
    context?: string,
  ): void {
    const metadataString = JSON.stringify(metadata);
    const fullMessage = `${message} - Metadata: ${metadataString}`;

    switch (level) {
      case 'error':
        this.error(fullMessage, undefined, context);
        break;
      case 'warn':
        this.warn(fullMessage, context);
        break;
      case 'log':
        this.log(fullMessage, context);
        break;
      case 'debug':
        this.debug(fullMessage, context);
        break;
      case 'verbose':
        this.verbose(fullMessage, context);
        break;
    }
  }

  /**
   * Format a log message
   * @param level Log level
   * @param message Message to format
   * @param context Message context
   * @param timestamp Message timestamp
   * @returns Formatted message
   */
  private formatMessage(
    level: string,
    message: any,
    context?: string,
    timestamp?: string,
  ): string {
    const nodeEnv = this.configService.get('NODE_ENV', 'development');

    // In production, format as JSON for better parsing
    if (nodeEnv === 'production') {
      const logObject = {
        level,
        message:
          typeof message === 'object' ? JSON.stringify(message) : message,
        context,
        timestamp: timestamp || new Date().toISOString(),
      };

      return JSON.stringify(logObject);
    }

    // In development, format for readability
    const contextStr = context ? `[${context}] ` : '';
    const timestampStr = timestamp ? `${timestamp} ` : '';

    return `${timestampStr}${level} ${contextStr}${message}`;
  }

  /**
   * Check if a log level is enabled
   * @param level Log level to check
   * @returns Whether the log level is enabled
   */
  private isLogLevelEnabled(level: LogLevel): boolean {
    return this.logLevels.includes(level);
  }
}
