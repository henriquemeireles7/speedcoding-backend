import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { Logger } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { CustomValidationPipe } from './common/pipes/validation.pipe';

/**
 * Bootstrap the application
 */
async function bootstrap() {
  // Create NestJS application instance
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    logger: ['error', 'warn', 'log', 'debug', 'verbose'],
  });

  // Get config service
  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT', 3000);
  const environment = configService.get<string>('NODE_ENV', 'development');
  const isProduction = environment === 'production';

  // Create logger
  const logger = new Logger('Bootstrap');

  // Set up global prefix
  const apiPrefix = configService.get<string>('API_PREFIX', 'api');
  app.setGlobalPrefix(apiPrefix);

  // Set up global validation pipe
  app.useGlobalPipes(new CustomValidationPipe());

  // Set up CORS
  app.enableCors({
    origin: configService.get<string>('CORS_ORIGIN', '*'),
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  // Serve static files
  app.useStaticAssets(join(__dirname, '..', 'public'), {
    prefix: '/static',
  });

  // Set up Swagger documentation
  if (!isProduction) {
    const config = new DocumentBuilder()
      .setTitle('SpeedCode API')
      .setDescription('SpeedCode backend API documentation')
      .setVersion('1.0')
      .addTag('speedcode')
      .addBearerAuth()
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document);

    logger.log('Swagger documentation available at /api/docs');
  }

  // Start server
  await app.listen(port);
  logger.log(`Application is running on port ${port} in ${environment} mode`);
}

// Start the application
bootstrap().catch((err: Error) => {
  // Log any bootstrap errors
  const logger = new Logger('Bootstrap');
  logger.error(`Failed to start application: ${err.message}`, err.stack);
  process.exit(1);
});
