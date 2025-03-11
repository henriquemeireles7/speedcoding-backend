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

## Authentication System

The authentication system implements:

1. **User Registration**: Create new accounts with username/password
2. **Login**: Authenticate users and issue JWT tokens
3. **Refresh Tokens**: Allow extended sessions without re-authentication
4. **Logout**: Revoke refresh tokens
5. **Rate Limiting**: Prevent brute force attacks
6. **Email Verification**: Verify user email addresses
7. **Password Reset**: Allow users to reset forgotten passwords

### Security Features

- Password hashing with bcrypt
- JWT token-based authentication
- Refresh token rotation for enhanced security
- Rate limiting on sensitive endpoints
- Email verification for new accounts

## API Endpoints

### Authentication

- `POST /api/v1/auth/register` - Register a new user
- `POST /api/v1/auth/login` - Authenticate and receive tokens
- `POST /api/v1/auth/refresh` - Refresh access token
- `POST /api/v1/auth/logout` - Revoke refresh token
- `POST /api/v1/auth/verify-email` - Verify email address
- `POST /api/v1/auth/resend-verification` - Resend verification email
- `POST /api/v1/auth/request-password-reset` - Request password reset
- `POST /api/v1/auth/reset-password` - Reset password

### Runs

- `POST /api/v1/runs/start` - Start a new coding run
- `POST /api/v1/runs/end` - End a run and submit results
- `GET /api/v1/runs` - Get all runs for the authenticated user
- `GET /api/v1/runs/:id` - Get a specific run

### Milestones

- `POST /api/v1/milestones/verify` - Verify milestone completion
- `GET /api/v1/milestones/:runId` - Get all milestones for a run

### Vibes

- `GET /api/v1/vibes` - Get all available vibes
- `GET /api/v1/vibes/:id` - Get a specific vibe

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
DATABASE_URL=postgresql://user:password@localhost:5432/speedcode_db
JWT_SECRET=your_jwt_secret_key
RESEND_API_KEY=your_resend_api_key
FROM_EMAIL=noreply@speedcoding.app
FRONTEND_URL=http://localhost:3000
```

## Development

This project follows NestJS best practices with a modular architecture:

- Each feature has its own module, controller, and service
- DTOs are used for request/response validation
- Guards protect authenticated routes
- Prisma is used as the primary database interface
- UUID is used for all IDs for better security and distribution

## Project setup

```bash
$ npm install
```
