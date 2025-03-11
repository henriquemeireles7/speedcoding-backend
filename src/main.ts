import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { LoggingService } from './logging/logging.service';
import { SentryService } from './sentry/sentry.service';

/**
 * Bootstrap the application
 */
async function bootstrap() {
  // Create the application
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });

  // Get configuration service
  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT', 3000);

  // Set up custom logger
  const logger = app.get(LoggingService);
  logger.setContext('Bootstrap');
  app.useLogger(logger);

  // Set up global prefix
  app.setGlobalPrefix('api');

  // Set up validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  // Set up CORS
  app.enableCors();

  // Set up Swagger documentation
  const swaggerConfig = new DocumentBuilder()
    .setTitle('SpeedCoding API')
    .setDescription('API for the SpeedCoding platform')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document);

  // Get Sentry service
  const sentryService = app.get(SentryService);

  // Handle shutdown signals
  const signals = ['SIGTERM', 'SIGINT', 'SIGHUP'] as const;
  signals.forEach((signal) => {
    process.on(signal, async () => {
      logger.log(`Received ${signal} signal, shutting down gracefully...`);

      // Close Sentry before shutdown
      await sentryService.close(2000).catch((err) => {
        logger.error('Error closing Sentry', err);
      });

      // Close the application
      await app.close();
      logger.log('Application shut down successfully');
      process.exit(0);
    });
  });

  // Start the application
  await app.listen(port);
  logger.log(`Application is running on: http://localhost:${port}/api`);
}

bootstrap();
