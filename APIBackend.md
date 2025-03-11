Purpose
These API endpoints define how clients (CLI or frontend) interact with the Nest.js backend, providing functionality for authentication, managing vibes, runs, milestones, submissions, and retrieving leaderboards.
Authorization
All protected endpoints require a JWT token in the Authorization header:
Authorization: Bearer <token>
1. Authentication
POST /auth/register  
Description: Registers a new user.  

Request Body (JSON):  
json

{
  "email": "user@example.com",
  "username": "alex123",
  "password": "MySecretPass"
}

Response (201 Created):  
json

{
  "id": "uuid-of-new-user",
  "email": "user@example.com",
  "username": "alex123"
}

Errors: 400 (Invalid data), 409 (User already exists).

POST /auth/login  
Description: Authenticates a user and returns a JWT.  

Request Body (JSON):  
json

{
  "email": "user@example.com",
  "password": "MySecretPass"
}

Response (200 OK):  
json

{
  "accessToken": "<jwt-token>"
}

Errors: 401 (Invalid credentials).

GET /auth/profile (Protected)  
Description: Retrieves the authenticated user’s profile.  

Response (200 OK):  
json

{
  "id": "uuid",
  "email": "user@example.com",
  "username": "alex123",
  "createdAt": "timestamp",
  "updatedAt": "timestamp"
}

Errors: 401 (Unauthorized).

2. Vibes
GET /vibes  
Description: Retrieves a list of all available Vibes (full-stack app challenges).  

Query Parameters:  
limit (optional, default 10): Number of Vibes to return.  

offset (optional, default 0): Pagination offset.

Response (200 OK):  
json

[
  {
    "id": "uuid-of-vibe",
    "name": "Slack Clone",
    "description": "Build a real-time chat app with AI",
    "milestoneCount": 7,
    "setupGuide": "Run `npm init` and install dependencies"
  },
  ...
]

Notes: Public endpoint; no auth required to browse Vibes.

GET /vibes/:vibeId  
Description: Fetches details of a specific Vibe, including its milestones.  

Response (200 OK):  
json

{
  "id": "uuid-of-vibe",
  "name": "Slack Clone",
  "description": "Build a real-time chat app with AI",
  "setupGuide": "Run `npm init` and install dependencies",
  "milestones": [
    { "index": 1, "name": "User Authentication", "description": "Implement login" },
    { "index": 2, "name": "Channel Management", "description": "Add channels" },
    ...
  ]
}

Errors: 404 (Vibe not found).

3. Runs
POST /runs/start (Protected)  
Description: Starts a new run for a given Vibe.  

Request Body (JSON):  
json

{
  "vibeId": "uuid-of-vibe",
  "techStack": ["react", "nestjs"]
}

Response (201 Created):  
json

{
  "id": "uuid-of-run",
  "userId": "uuid-of-user",
  "vibeId": "uuid-of-vibe",
  "startTime": "2025-03-11T12:00:00.000Z",
  "completed": false,
  "techStack": ["react", "nestjs"]
}

Errors: 400 (Invalid vibeId), 401 (Unauthorized).

POST /runs/end (Protected)  
Description: Ends a run by setting the endTime and marking it completed.  

Request Body (JSON):  
json

{
  "runId": "uuid-of-run"
}

Response (200 OK):  
json

{
  "id": "uuid-of-run",
  "completed": true,
  "totalTimeInSeconds": 3600
}

Errors: 400 (Invalid runId), 401 (Unauthorized).

GET /runs/:runId (Protected)  
Description: Fetches details for a specific run.  

Response (200 OK):  
json

{
  "id": "uuid-of-run",
  "startTime": "timestamp",
  "endTime": "timestamp",
  "completed": true,
  "vibeId": "uuid-of-vibe",
  "techStack": ["react", "nestjs"],
  "userId": "uuid-of-user"
}

Errors: 404 (Run not found).

GET /runs (Protected)  
Description: Lists all runs for the authenticated user.  

Response (200 OK):  
json

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

Notes: Could extend with admin privileges to list all runs.

4. Milestones
POST /verify/m{N} (Protected)  
Description: Verifies that the user has reached milestone N for a run (e.g., /verify/m1).  

Request Body (JSON):  
json

{
  "runId": "uuid-of-run"
}

Response (200 OK):  
json

{
  "runId": "uuid-of-run",
  "milestoneIndex": 1,
  "verified": true,
  "timestamp": "2025-03-11T12:15:00.000Z"
}

Errors: 400 (Invalid run or milestone), 401 (Unauthorized).

5. Submissions
POST /submissions (Protected)  
Description: Creates or updates a submission (video proof) for a run.  

Request Body (multipart/form-data):  
json

{
  "runId": "uuid-of-run",
  "videoUrl": "https://supabase.storage/video.mp4"
}

Response (201 Created):  
json

{
  "id": "uuid-of-submission",
  "runId": "uuid-of-run",
  "videoUrl": "https://supabase.storage/video.mp4",
  "status": "pending"
}

Notes: Status set to "pending" until verified.  

Errors: 400 (Invalid data), 401 (Unauthorized).

GET /submissions/:submissionId (Protected)  
Description: Fetches details of a single submission.  

Response (200 OK):  
json

{
  "id": "uuid-of-submission",
  "runId": "uuid-of-run",
  "videoUrl": "https://supabase.storage/video.mp4",
  "status": "approved"
}

Errors: 404 (Submission not found).

6. Leaderboards
GET /leaderboards  
Description: Retrieves a list of top runs, filtered by Vibe and sorted by completion time (ascending).  

Query Parameters:  
vibeId (optional): Filter by specific Vibe.  

limit (optional, default 10): Number of runs to return.

Response (200 OK):  
json

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

Notes: Only displays completed runs with approved submissions.

