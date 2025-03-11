Below is a comprehensive System Overview Document (SOD) for SpeedCode, built using the framework we discussed. It provides a high-level yet detailed view of the application, drawing from our extensive conversations to date (as of March 11, 2025). I’ve kept it clear, concise, and rich with context, limiting each subsection to a few lines for readability while covering the what, why, and how of SpeedCode.
SpeedCode System Overview Document
1. Introduction
Purpose: SpeedCode transforms coding into a competitive, game-like experience where product engineers speedrun full-stack app builds using AI assistance (vibe coding).  
It’s designed to make coding fun, accessible, and skill-building, inspired by speedrunning platforms like speedrun.com.  
The initial focus is the Slack Clone Vibe, with plans to expand to more challenges.
Problem: Developers often don’t know how to use AI effectively in their workflows, risking being outcompeted by those who do.  
Learning AI coding is slow and intimidating, leaving many stuck with outdated methods.  
SpeedCode addresses this by gamifying the learning process, proving vibe coding’s 10x productivity boost.
Value Proposition: SpeedCode teaches vibe coding through timed challenges, helping engineers build faster, rank globally, and future-proof their careers.  
It turns learning into a race, rewarding speed and skill with leaderboards.  
Users master AI tools while building real apps, all in a fun, engaging way.
2. Use Cases
New Coder Learning AI:  
Sarah, a junior developer, picks the Slack Clone Vibe to learn AI coding.  
She finishes in 60 minutes, gaining practical skills and confidence with tools like Copilot.  
SpeedCode’s milestones guide her step-by-step, making AI less daunting.
Pro Engineer Competing:  
Alex, an experienced engineer, speedruns the Slack Clone in 45 minutes using Node.js.  
He tops the leaderboard, showcasing his vibe coding mastery to peers and employers.  
The competitive edge motivates him to refine his AI workflow further.
Speedrunner Exploring Coding:  
Jamie, a gaming speedrunner, tries the Calculator Vibe in Python, finishing in 30 minutes.  
She enjoys the race-like feel and shares her run on Twitter, drawing in new users.  
SpeedCode bridges her gaming passion with coding discovery.
3. Core Features
Vibes:  
Full-stack app challenges (e.g., Slack Clone) users choose to speedrun.  
Each Vibe has a unique set of milestones (e.g., 7 for Slack Clone) and a setup guide.  
Offers real-world practice, teaching AI-driven development through action.
Runs:  
Timed attempts to complete a Vibe, started with sc start and ended with sc end.  
Tracks tech stack (e.g., React, Nest.js) and total time, tying to a user and Vibe.  
Trains engineers to build fast with AI, boosting productivity.
Milestones:  
Backend-verified steps within a Vibe (e.g., "User Authentication," "AI Agent").  
Submitted via CLI (sc m1..m7), checked with automated tests to ensure fairness.  
Breaks complex apps into learnable tasks, teaching AI workflows incrementally.
Leaderboards:  
Rankings of top Runs by Vibe and language, requiring video proof for entry.  
Displays username, time (e.g., 45m), and tech stack, updated post-submission review.  
Motivates competition and showcases vibe coding skills globally.
4. System Architecture
Backend (Nest.js, Prisma, Supabase):  
Built with Nest.js for a modular REST API, hosted at speedcode.app/api.  
Uses Prisma to manage PostgreSQL (Supabase or local Docker) for data storage.  
Handles Vibes (/vibes), Runs (/runs), Milestones (/verify/m{N}), Submissions (/submissions), and Leaderboards (/leaderboards).  
Stores videos in Supabase Storage, linked via submission.videoUrl.
Frontend (React):  
A lightweight UI in React with TypeScript, showing Vibes, profiles, and leaderboards.  
Uses Axios to call the API, rendering data like "Slack Clone - 45m - Node.js".  
Designed for discovery and post-run review, not live tracking (MVP focus).
CLI (Node.js):  
The speedcode-cli (Node.js, TypeScript) drives speedrunning with commands like sc start.  
Built with Commander for CLI logic, Fluent-FFmpeg for optional recording, and Axios for API calls.  
Submits Runs and Milestones, tying user actions to the backend.
Data Flow:  
CLI/UI sends requests (e.g., POST /runs/start) to the Nest.js API.  
Backend processes via Prisma, stores in PostgreSQL, and updates Supabase Storage (videos).  
Responses (e.g., leaderboard data) flow back to CLI/UI for display.
5. User Workflow
Step 1: Sees a run on Twitter ("Slack Clone in 45m! #SpeedCode").  
Step 2: Visits speedcode.app, clicks "Vibes" to see options like Slack Clone.  
Step 3: Logs in via UI prompt after picking "Speedcode this Vibe."  
Step 4: Reads rules and setup guide (e.g., "Run npm init").  
Step 5: Starts run in terminal with sc start.  
Step 6: Completes 7 milestones (sc m1..m7), verified by backend tests.  
Step 7: Ends run with sc end, marking it "Ready to Upload."  
Step 8: Uploads video via Profile page on UI.  
Step 9: Run approved, appears on Slack Clone leaderboard.  
Step 10: Shares on Twitter ("My 43m Slack Clone!"), restarting the loop.
6. Technical Overview
Tech Stack:  
Backend: Nest.js (API structure), Prisma (ORM), PostgreSQL (data), Supabase (storage, hosting).  
Frontend: React with TypeScript (UI), Axios (API), Tailwind CSS (styling).  
CLI: Node.js, Commander (commands), Fluent-FFmpeg (recording), Axios (API).
Rationale:  
Nest.js and Prisma offer modular, type-safe development for a scalable backend.  
Supabase simplifies database and storage with PostgreSQL reliability.  
React provides a fast, flexible UI; Tailwind speeds up styling.  
CLI uses Node.js for dev familiarity, with tools suited for speedrunning tasks.
Key Dependencies:  
@nestjs/jwt and passport-jwt for authentication.  
class-validator for DTO validation in API endpoints.  
fluent-ffmpeg for optional video recording in CLI.
7. Future Roadmap
More Vibes: Add challenges like "To-Do List" or "E-commerce Store" to expand options.  
Paid Challenges: Introduce company-sponsored Vibes for premium users.  
Live Tracking: Enhance frontend with real-time Run progress (e.g., timer, milestone UI).  
AI Insights: Analyze vibe coding patterns to improve training and tools.  
Community Features: Add forums or run-sharing tools to boost engagement.
8. Conclusion
SpeedCode redefines coding as a fast, fun race, teaching vibe coding through real app builds.  
It empowers engineers to master AI workflows, outpace peers, and shine on leaderboards.  
From Slack Clone to future Vibes, it’s the go-to platform for 10x productivity.  
Try it—speedrun your way to coding greatness today!
Why This Document Works
Clarity: Each section uses simple language, avoiding jargon, while packing in context (e.g., why Milestones matter).  
Conciseness: Limits each topic to 3-5 lines, keeping it scannable yet informative.  
Context: Ties Vibes (e.g., Slack Clone), Runs, and Milestones to the growth loop and tech stack, showing the full picture.  
Actionable: Developers get enough to code (e.g., API endpoints), users see value (e.g., 10x productivity), and stakeholders grasp potential (e.g., roadmap).
