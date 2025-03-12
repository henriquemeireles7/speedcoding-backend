# SpeedCode Backend

Backend API service for the SpeedCode platform. Built with NestJS, TypeScript, Prisma, and Supabase.

## Features

- ✅ **Rate Limiting**: Advanced configurable throttling with custom limits per route
- 🔒 **Security**: JWT Authentication with Guards
- 📝 **Validation**: Automatic request validation with class-validator
- 📖 **API Documentation**: Auto-generated OpenAPI/Swagger docs
- 🗄️ **Database**: Type-safe database access with Prisma ORM
- 🔄 **Type Safety**: Full TypeScript support throughout the codebase

## Setup & Installation

### Prerequisites

- Node.js (v16 or later)
- PostgreSQL (or Supabase account)
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/speedcoding-backend.git
cd speedcoding-backend

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env
# Update .env with your database connection string and other settings

# Run database migrations
npx prisma migrate dev

# Start the development server
npm run start:dev
```

## API Documentation

When running in development mode, the API documentation is available at:

```
http://localhost:3000/api/docs
```

## Rate Limiting

This application implements custom rate limiting with different rules for different endpoints:

- **Login**: 5 attempts per 15 minutes
- **Registration**: 3 attempts per hour
- **Run Starts**: 10 starts per hour
- **Submissions**: 5 submissions per hour
- **Public Endpoints**: 60 requests per minute
- **Authenticated Endpoints**: 120 requests per minute
- **Admin Endpoints**: 300 requests per minute

## Environment Variables

Configure the application using the following environment variables:

```
# Server Configuration
PORT=3000
NODE_ENV=development
API_PREFIX=api
CORS_ORIGIN=*

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/speedcode?schema=public

# Authentication
JWT_SECRET=your-jwt-secret
JWT_EXPIRES_IN=1d

# Redis Cache (Optional)
REDIS_URL=redis://localhost:6379
```

## Project Structure

```
src/
├── app.module.ts        # Main application module
├── main.ts              # Application bootstrap
├── common/              # Shared utilities, filters, pipes, etc.
├── auth/                # Authentication module
├── users/               # User management
├── runs/                # Code run tracking
├── submissions/         # Submission handling
├── milestones/          # Milestone verification
├── throttler/           # Rate limiting configuration
├── prisma/              # Database schema and client
└── config/              # Configuration utilities
```

## Development

```bash
# Start in development mode
npm run start:dev

# Lint the codebase
npm run lint

# Run unit tests
npm run test

# Run e2e tests
npm run test:e2e
```

## Production

```bash
# Build the application
npm run build

# Start in production mode
npm run start:prod
```

## License

[MIT Licensed](LICENSE)
