<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://coveralls.io/github/nestjs/nest?branch=master" target="_blank"><img src="https://coveralls.io/repos/github/nestjs/nest/badge.svg?branch=master#9" alt="Coverage" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg" alt="Donate us"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow" alt="Follow us on Twitter"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

# SpeedCoding Backend

A NestJS-based backend for the SpeedCoding platform, which allows users to track and verify coding challenges and speedruns.

## Project Overview

SpeedCoding is a platform that enables users to:

- Track coding sessions with start and end times
- Complete coding milestones during sessions
- Submit completed sessions with video recordings
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
- Relations: sessions (one-to-many), refreshTokens (one-to-many)

### RefreshToken

- Stores JWT refresh tokens for extended sessions
- Fields: id, token, userId, expiresAt, createdAt, isRevoked
- Relations: user (many-to-one)

### Session

- Tracks coding sessions
- Fields: id, userId, techStack, startTime, endTime, totalTime
- Relations: user (many-to-one), milestones (one-to-many), submission (one-to-one)

### Milestone

- Records individual milestone completions during a session
- Fields: id, sessionId, milestoneNumber, completedAt, passed
- Relations: session (many-to-one)

### Submission

- Stores final submission data for completed sessions
- Fields: id, sessionId, packages, videoUrl, submittedAt, status
- Relations: session (one-to-one)
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

### Sessions

- `POST /api/v1/sessions/start` - Start a new coding session
- `POST /api/v1/sessions/end` - End a session and submit results

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
