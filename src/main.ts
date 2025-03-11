import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, BadRequestException } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import {
  HttpExceptionFilter,
  AllExceptionsFilter,
  TransformInterceptor,
} from './common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Set global prefix for all routes
  app.setGlobalPrefix('api');

  // Enable CORS
  app.enableCors();

  // Apply global filters and interceptors
  app.useGlobalFilters(new AllExceptionsFilter(), new HttpExceptionFilter());
  app.useGlobalInterceptors(new TransformInterceptor());

  // Enable validation with detailed error messages
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Strip properties not in DTO
      forbidNonWhitelisted: true, // Throw error if non-whitelisted properties are present
      transform: true, // Transform payloads to DTO instances
      transformOptions: {
        enableImplicitConversion: true, // Allow implicit conversion of primitive types
      },
      exceptionFactory: (errors) => {
        const result = errors.map((error) => ({
          property: error.property,
          message: error.constraints
            ? Object.values(error.constraints)[0]
            : 'Validation failed',
        }));
        return new BadRequestException(result);
      },
    }),
  );

  // Configure Swagger
  const config = new DocumentBuilder()
    .setTitle('SpeedCoding API')
    .setDescription('API documentation for the SpeedCoding platform')
    .setVersion('1.0')
    .addTag('auth', 'Authentication endpoints')
    .addTag('runs', 'Run management endpoints')
    .addTag('verify', 'Milestone verification endpoints')
    .addTag('submissions', 'Submission management endpoints')
    .addTag('leaderboards', 'Leaderboard endpoints')
    .addTag('vibes', 'Vibe management endpoints')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth', // This is a key to be used in @ApiBearerAuth() decorator
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
