import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import * as Joi from 'joi';

/**
 * Configuration module for handling environment variables
 * Uses Joi for validation to ensure all required variables are present
 */
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // Make config available throughout the application
      validationSchema: Joi.object({
        // Database
        DATABASE_URL: Joi.string().required(),

        // JWT Authentication
        JWT_SECRET: Joi.string().required(),
        JWT_EXPIRES_IN: Joi.string().default('1d'),

        // Email service (Resend)
        RESEND_API_KEY: Joi.string().required(),
        FROM_EMAIL: Joi.string().email().required(),

        // Frontend URL for email links
        FRONTEND_URL: Joi.string().uri().required(),

        // Redis (for caching and rate limiting)
        REDIS_URL: Joi.string().when('NODE_ENV', {
          is: 'production',
          then: Joi.required(),
          otherwise: Joi.optional(),
        }),

        // Server configuration
        PORT: Joi.number().default(3000),
        NODE_ENV: Joi.string()
          .valid('development', 'production', 'test')
          .default('development'),
      }),
      validationOptions: {
        abortEarly: true, // Stop validation on first error
      },
    }),
  ],
})
export class AppConfigModule {}
