# SpeedCode Backend API Contract

Base URL: `https://speedcode.app/api/v1/`  
Framework: Nest.js  
Database: Supabase (PostgreSQL) via Prisma  
Authentication: JWT (Bearer token)

## Endpoints

### 1. POST /auth/login
- **Description**: Authenticates a user and returns a JWT token.
- **Request Body**:
  ```json
  {
    "username": "johndoe",
    "password": "mypassword"
  }
  ```
- **Response (200)**:
  ```json
  {
    "token": "jwt.token.here"
  }
  ```
- **Errors**:
  - `400`: `{"message": "Username or password missing"}`
  - `401`: `{"message": "Invalid credentials"}`

### 2. POST /sessions/start
- **Description**: Starts a new speedrun session for the authenticated user.
- **Headers**: `Authorization: Bearer <token>`
- **Request Body**:
  ```json
  {
    "techStack": "Node.js, Express"
  }
  ```
- **Response (201)**:
  ```json
  {
    "sessionId": 123
  }
  ```
- **Errors**:
  - `401`: `{"message": "Unauthorized"}`
  - `400`: `{"message": "Tech stack missing"}`

### 3. GET /verify/m{milestoneNumber}
- **Description**: Verifies a specific milestone (e.g., /verify/m1 for milestone 1).
- **Headers**: `Authorization: Bearer <token>`
- **Query Params**: `sessionId` (e.g., ?sessionId=123)
- **Response (200)**:
  ```json
  {
    "passed": true,
    "message": "Login test successful"
  }
  ```
- **Errors**:
  - `401`: `{"message": "Unauthorized"}`
  - `400`: `{"message": "Invalid session ID or milestone number"}`
  - `500`: `{"message": "Verification test failed"}`

### 4. POST /sessions/end
- **Description**: Ends a session and submits the speedrun, including optional video.
- **Headers**: `Authorization: Bearer <token>`
- **Request Body** (multipart/form-data):
  - `sessionId`: 123 (string)
  - `packages`: '["express", "socket.io"]' (JSON string)
  - `video`: (binary file, optional)
- **Response (200)**:
  ```json
  {
    "totalTime": "45m 12s",
    "submissionId": 456
  }
  ```
- **Errors**:
  - `401`: `{"message": "Unauthorized"}`
  - `400`: `{"message": "Invalid session ID or packages"}`
  - `500`: `{"message": "Failed to upload video"}`

## Notes
- **Authentication**: All endpoints except /auth/login require a valid JWT token.
- **Video Storage**: Videos are uploaded to Supabase Storage (or AWS S3) and linked via videoUrl.
- **Verification**: /verify/m{N} endpoints trigger predefined tests (e.g., unit tests, Selenium) for each milestone.
- **Errors**: Standardized JSON error responses with HTTP status codes.

Last Updated: March 10, 2025

### Implementation Notes
- **Nest.js**: Endpoints use Nest.js controllers (e.g., `@Post('login')` in `AuthController`).
- **Supabase**: Leverages Supabase Auth for JWT (optional) or custom JWT with Prisma.
- **CLI Integration**: Matches `speedcode-cli` calls (e.g., `axios.post('/sessions/end', form)`).

---
