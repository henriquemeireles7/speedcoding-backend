# SpeedCoding Backend

A NestJS-based backend for the SpeedCoding platform, which allows users to track and verify coding challenges and speedruns.

## Project Overview

SpeedCoding is a platform that enables users to:

- Track coding runs with start and end times
- Complete coding milestones during runs
- Submit completed runs with video recordings
- Verify milestone completions
- Categorize runs by vibe/theme

## Tech Stack

- **Framework**: NestJS (Node.js)
- **Database**: PostgreSQL via Supabase
- **ORM**: Prisma
- **Authentication**: JWT with refresh tokens
- **API**: RESTful endpoints
- **Documentation**: Swagger/OpenAPI
- **Validation**: class-validator with detailed error messages
- **Configuration**: Centralized environment validation with Joi
- **Health Checks**: Terminus for application monitoring
- **Metrics**: Prometheus for performance and business metrics
- **Caching**: Redis for improved performance
- **Rate Limiting**: Protection against abuse
- **Logging**: Structured logging for better observability
- **Error Tracking**: Sentry for real-time error monitoring and debugging

## Database Schema

The database consists of the following models:

### User

- Stores user authentication information
- Fields: id (UUID), username, email, passwordHash, isEmailVerified, createdAt, updatedAt
- Relations: runs (one-to-many), refreshTokens (one-to-many)

### RefreshToken

- Stores JWT refresh tokens for extended sessions
- Fields: id (UUID), token, userId, expiresAt, isRevoked, createdAt, updatedAt
- Relations: user (many-to-one)

### Vibe

- Categorizes runs by theme or type
- Fields: id (UUID), name, description, createdAt, updatedAt
- Relations: runs (one-to-many)

### Run

- Tracks coding runs
- Fields: id (UUID), userId, vibeId, techStack (JSON), startTime, endTime, completed, totalTimeInSeconds, createdAt, updatedAt
- Relations: user (many-to-one), vibe (many-to-one), milestones (one-to-many), submissions (one-to-many)

### Milestone

- Records individual milestone completions during a run
- Fields: id (UUID), runId, milestoneIndex, verified, createdAt, updatedAt
- Relations: run (many-to-one)

### Submission

- Stores final submission data for completed runs
- Fields: id (UUID), runId, videoUrl, status, createdAt, updatedAt
- Relations: run (many-to-one)
- Status enum: PENDING, APPROVED, REJECTED

## Monitoring and Metrics

The SpeedCoding backend includes comprehensive monitoring and metrics collection using Prometheus:

### Available Metrics

- **HTTP Metrics**: Request counts, durations, sizes, and status codes
- **Cache Metrics**: Cache hits, misses, and operation durations
- **Rate Limiting Metrics**: Rate limit exceeded events
- **Business Metrics**: Run durations, milestone completions, and active runs

### Endpoints

- `/metrics`: Exposes all Prometheus metrics
- `/metrics/health`: Simple health check for the metrics service

### Grafana Dashboards

Sample Grafana dashboards are provided in the `dashboards` directory:

- `api-performance.json`: Dashboard for monitoring API performance
- `business-metrics.json`: Dashboard for monitoring business metrics
- `sentry-overview.json`: Dashboard for monitoring Sentry errors and transactions

### Integration

To integrate with Prometheus and Grafana:

1. Configure Prometheus to scrape the `/metrics` endpoint
2. Import the provided dashboards into Grafana
3. Configure Grafana to use your Prometheus instance as a data source

## Error Tracking and Observability

The SpeedCoding backend includes comprehensive error tracking and observability using Sentry:

### Features

- **Real-time Error Tracking**: Automatically captures and reports errors to Sentry
- **Performance Monitoring**: Tracks transaction performance and identifies bottlenecks
- **User Context**: Associates errors with user information for better debugging
- **Breadcrumbs**: Records application events leading up to errors
- **Custom Tags**: Adds metadata to errors for better filtering and analysis
- **Sanitization**: Automatically redacts sensitive information from error reports

### Integration

The Sentry integration is configured in the `SentryModule` and requires the following environment variables:

```
SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id
NODE_ENV=development|production
APP_VERSION=1.0.0
```

### Sentry Dashboard

The Sentry dashboard provides:

- Real-time error tracking and notifications
- Performance monitoring and transaction analysis
- User impact analysis
- Release tracking
- Issue assignment and resolution workflow

### Best Practices

1. **Capture Meaningful Errors**: Only capture errors that are actionable and provide context
2. **Add User Context**: Always associate errors with user information when available
3. **Use Tags for Filtering**: Add tags to errors for better filtering and analysis
4. **Add Breadcrumbs**: Record important events leading up to errors
5. **Sanitize Sensitive Data**: Never send sensitive information to Sentry
6. **Monitor Performance**: Use transactions and spans to identify bottlenecks
7. **Set Up Alerts**: Configure Sentry alerts for critical errors

## Caching System

The application uses Redis for caching to improve performance:

- **HTTP Response Caching**: Common responses are cached to reduce database load
- **Distributed Caching**: Redis enables caching across multiple instances
- **Cache Invalidation**: Automatic invalidation when data changes
- **Custom Decorators**: `@Cacheable()` and `@CacheEvict()` for easy cache management

## Rate Limiting

The application includes rate limiting to protect against abuse:

- **IP-based Limiting**: Prevents abuse from a single IP address
- **User-based Limiting**: Prevents abuse from a single user
- **Endpoint-specific Limits**: Different limits for different endpoints
- **Redis Storage**: Distributed rate limiting across multiple instances

## Logging

The application includes structured logging for better observability:

- **Request Logging**: All requests are logged with method, path, status, and duration
- **Error Logging**: All errors are logged with stack traces
- **Structured Format**: Logs are formatted as JSON for easier parsing
- **Context-aware**: Logs include request IDs for tracing requests across services

## API Endpoints

### Authentication

- `POST /auth/register` - Register a new user
- `POST /auth/login` - Login with email and password
- `POST /auth/refresh` - Refresh access token
- `POST /auth/logout` - Logout (revoke refresh token)
- `POST /auth/verify-email` - Verify email address
- `POST /auth/resend-verification` - Resend verification email
- `POST /auth/request-password-reset` - Request password reset
- `POST /auth/reset-password` - Reset password
- `GET /auth/profile` - Get authenticated user profile

### Runs

- `POST /runs/start` - Start a new run with a specified vibe and tech stack
- `POST /runs/end` - End a run and calculate total time
- `GET /runs/:runId` - Get details for a specific run
- `GET /runs` - List all runs for the authenticated user

### Milestones

- `POST /verify/m1` - Verify milestone 1 for a run
- `POST /verify/m2` - Verify milestone 2 for a run
- `POST /verify/m3` - Verify milestone 3 for a run
- `POST /verify/m4` - Verify milestone 4 for a run
- `POST /verify/m5` - Verify milestone 5 for a run
- `POST /verify/m6` - Verify milestone 6 for a run
- `POST /verify/m7` - Verify milestone 7 for a run
- `GET /verify/milestones/:runId` - Get all milestones for a run

### Submissions

- `POST /submissions` - Create or update a submission with video proof
- `GET /submissions/:submissionId` - Get details for a specific submission
- `GET /submissions` - List all submissions for the authenticated user

### Leaderboards

- `GET /leaderboards` - Get top runs sorted by completion time
  - Query parameters:
    - `vibeId` (optional) - Filter by vibe
    - `limit` (optional, default 10) - Limit the number of results

### Vibes

- `GET /vibes` - Get all available vibes
  - Query parameters:
    - `limit` (optional, default 10) - Limit the number of results
    - `offset` (optional, default 0) - Number of vibes to skip
- `GET /vibes/:vibeId` - Get details for a specific vibe, including its milestones

### Health

- `GET /health` - Check the health of the application and its dependencies

## API Documentation

The API is documented using Swagger/OpenAPI. You can access the documentation at `/api/docs` when the server is running.

## Error Handling

The application uses global exception filters to ensure consistent error responses:

- All responses follow a standard format with `statusCode`, `message`, `timestamp`, `path`, and `method`
- Validation errors include detailed information about the invalid fields
- HTTP exceptions are properly formatted and logged

## Project Setup

```bash
# Install dependencies
$ npm install

# Generate Prisma client
$ npx prisma generate

# Push schema to database
$ npx prisma db push

# Start development server
$ npm run start:dev
```

## Environment Variables

The project requires the following environment variables:

```
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/speedcode_db

# JWT Authentication
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=1d

# Email service (Resend)
RESEND_API_KEY=your_resend_api_key
FROM_EMAIL=noreply@speedcoding.app

# Frontend URL for email links
FRONTEND_URL=http://localhost:3000

# Server configuration
PORT=3001
NODE_ENV=development
APP_VERSION=1.0.0

# Redis configuration
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0

# Sentry configuration
SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id
```

## Development

This project follows NestJS best practices with a modular architecture:

- Each feature has its own module, controller, and service
- DTOs are used for request/response validation
- Guards protect authenticated routes
- Prisma is used as the primary database interface
- UUID is used for all IDs for better security and distribution
- Global filters and interceptors ensure consistent responses
- Configuration is validated at startup to prevent runtime errors
- Health checks monitor the application and its dependencies
