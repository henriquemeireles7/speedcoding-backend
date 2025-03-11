Backend API Contract
Purpose
These API endpoints define how clients (CLI or frontend) interact with the Nest.js backend, providing functionality for authentication, managing runs, milestones, submissions, and retrieving leaderboards.

Authorization
All protected endpoints require a JWT token in the Authorization header:
Authorization: Bearer <token>

1. Authentication
POST /auth/register
Description: Registers a new user.
Request
Body (JSON):
json
Copy
{
  "email": "user@example.com",
  "username": "alex123",
  "password": "MySecretPass"
}
Response (201 Created)
json
Copy
{
  "id": "uuid-of-new-user",
  "email": "user@example.com",
  "username": "alex123"
}
Errors: 400 (Invalid data), 409 (User already exists), etc.
POST /auth/login
Description: Authenticates a user and returns a JWT.
Request
Body (JSON):
json
Copy
{
  "email": "user@example.com",
  "password": "MySecretPass"
}
Response (200 OK)
json
Copy
{
  "accessToken": "<jwt-token>"
}
Errors: 401 (Invalid credentials)
GET /auth/profile (Protected)
Description: Retrieves the authenticated user’s profile.
Response (200 OK)
json
Copy
{
  "id": "uuid",
  "email": "user@example.com",
  "username": "alex123",
  "createdAt": "timestamp",
  "updatedAt": "timestamp"
}
Errors: 401 (Unauthorized)
2. Runs
POST /runs/start (Protected)
Description: Starts a new run for a given vibe.
Request
Body (JSON):
json
Copy
{
  "vibeId": "uuid-of-vibe",
  "techStack": ["react", "nestjs"]
}
Response (201 Created)
json
Copy
{
  "id": "uuid-of-run",
  "userId": "uuid-of-user",
  "vibeId": "uuid-of-vibe",
  "startTime": "2025-03-11T12:00:00.000Z",
  "completed": false,
  "techStack": ["react", "nestjs"]
}
POST /runs/end (Protected)
Description: Ends a run by setting the endTime and marking it completed.
Request
Body (JSON):
json
Copy
{
  "runId": "uuid-of-run"
}
Response (200 OK)
json
Copy
{
  "id": "uuid-of-run",
  "completed": true,
  "totalTimeInSeconds": 3600
}
GET /runs/:runId (Protected)
Description: Fetches details for a specific run.
Response (200 OK)
json
Copy
{
  "id": "uuid-of-run",
  "startTime": "timestamp",
  "endTime": "timestamp",
  "completed": true,
  "vibeId": "uuid-of-vibe",
  "techStack": ["react", "nestjs"],
  "userId": "uuid-of-user"
  // etc.
}
GET /runs (Protected)
Description: Lists all runs for the authenticated user (could be extended with admin privileges to list all).
Response (200 OK)
json
Copy
[
  {
    "id": "uuid-of-run",
    "vibeId": "uuid-of-vibe",
    "startTime": "timestamp",
    "endTime": "timestamp",
    "completed": true
  },
  ...
]
3. Milestones
POST /verify/m{N} (Protected)
Description: Verifies that the user has reached milestone N for a run.
Example: /verify/m1, /verify/m2, … /verify/m7
Request
Body (JSON):
json
Copy
{
  "runId": "uuid-of-run"
}
Response (200 OK)
json
Copy
{
  "runId": "uuid-of-run",
  "milestoneIndex": 1,
  "verified": true,
  "timestamp": "2025-03-11T12:15:00.000Z"
}
Errors: 400 (Invalid run or milestone), 401/403 (Unauthorized)
4. Submissions
POST /submissions (Protected)
Description: Creates or updates a submission (video proof) for a run.
Request
Body (JSON or multipart/form-data):
json
Copy
{
  "runId": "uuid-of-run",
  "videoUrl": "https://supabase.storage/video.mp4"
}
Response (201 Created)
json
Copy
{
  "id": "uuid-of-submission",
  "runId": "uuid-of-run",
  "videoUrl": "https://supabase.storage/video.mp4",
  "status": "pending"
}
Notes: Status set to "pending" until admin or automated test verification.
Errors: 400 (Invalid data), 401 (Unauthorized)
GET /submissions/:submissionId (Protected)
Description: Fetches details of a single submission.
Response (200 OK)
json
Copy
{
  "id": "uuid-of-submission",
  "runId": "uuid-of-run",
  "videoUrl": "https://supabase.storage/video.mp4",
  "status": "approved"
}
5. Leaderboards
GET /leaderboards
Description: Retrieves a list of top runs, filtered by vibe and sorted by completion time (ascending).
Query Parameters:
vibeId (optional)
limit (optional, default 10)
Response (200 OK)
json
Copy
[
  {
    "runId": "uuid-of-run",
    "userId": "uuid-of-user",
    "username": "alex123",
    "vibeId": "uuid-of-vibe",
    "totalTimeInSeconds": 3600,
    "submissionStatus": "approved"
  },
  ...
]
Notes: Only displays runs that are completed and have an approved submission.