# SpeedCoding Backend

A NestJS-based backend for the SpeedCoding platform, which allows users to track and verify coding challenges and speedruns.

## Project Overview

SpeedCoding is a platform that enables users to:

- Track coding runs with start and end times
- Complete coding milestones during runs
- Submit completed runs with video recordings
- Verify milestone completions

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
- Fields: id, username, passwordHash, createdAt
- Relations: runs (one-to-many), refreshTokens (one-to-many)

### RefreshToken

- Stores JWT refresh tokens for extended sessions
- Fields: id, token, userId, expiresAt, createdAt, isRevoked
- Relations: user (many-to-one)

### Run

- Tracks coding runs
- Fields: id, userId, techStack, startTime, endTime, totalTime
- Relations: user (many-to-one), milestones (one-to-many), submission (one-to-one)

### Milestone

- Records individual milestone completions during a run
- Fields: id, runId, milestoneNumber, completedAt, passed
- Relations: run (many-to-one)

### Submission

- Stores final submission data for completed runs
- Fields: id, runId, packages, videoUrl, submittedAt, status
- Relations: run (one-to-one)
- Status enum: PENDING, APPROVED, REJECTED

## Authentication System

The authentication system implements:

1. **User Registration**: Create new accounts with username/password
2. **Login**: Authenticate users and issue JWT tokens
3. **Refresh Tokens**: Allow extended sessions without re-authentication
4. **Logout**: Revoke refresh tokens
5. **Rate Limiting**: Prevent brute force attacks

### Security Features

- Password hashing with bcrypt
- JWT token-based authentication
- Refresh token rotation for enhanced security
- Rate limiting on sensitive endpoints

## API Endpoints

### Authentication

- `POST /api/v1/auth/register` - Register a new user
- `POST /api/v1/auth/login` - Authenticate and receive tokens
- `POST /api/v1/auth/refresh` - Refresh access token
- `POST /api/v1/auth/logout` - Revoke refresh token

### Runs

- `POST /api/v1/runs/start` - Start a new coding run
- `POST /api/v1/runs/end` - End a run and submit results

### Milestones

- `POST /api/v1/milestones/verify` - Verify milestone completion

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
```

## Development

This project follows NestJS best practices with a modular architecture:

- Each feature has its own module, controller, and service
- DTOs are used for request/response validation
- Guards protect authenticated routes
- Prisma is used as the primary database interface

## Project setup

```bash
$ npm install
```
