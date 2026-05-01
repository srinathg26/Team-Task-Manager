====================================================
  TEAM TASK MANAGER — Full-Stack Web App
====================================================

LIVE URL: [Add your Railway frontend URL after deployment]
GITHUB:   [Add your GitHub repo URL]

----------------------------------------------------
TECH STACK
----------------------------------------------------
Frontend  : React 18, React Router v6, Axios
Backend   : Node.js, Express.js
ORM       : Prisma
Database  : PostgreSQL
Auth      : JWT + bcryptjs
Deploy    : Railway

----------------------------------------------------
FEATURES
----------------------------------------------------
✅ Authentication — Signup & Login with JWT sessions
✅ Project Management — Create, view, delete projects
✅ Team Management — Add/remove members by email
✅ Role-Based Access — Admin vs Member permissions
✅ Task Management — Title, description, status, priority, due date, assignee
✅ Kanban Board — Tasks grouped by To Do / In Progress / Done
✅ Dashboard — Stats, overdue tasks, recent activity
✅ Task Filters — Filter by status and priority
✅ Proper validations on all API endpoints

----------------------------------------------------
REST API ENDPOINTS
----------------------------------------------------
POST   /api/auth/signup
POST   /api/auth/login
GET    /api/auth/me

GET    /api/projects
POST   /api/projects
GET    /api/projects/:id
PUT    /api/projects/:id               (Admin only)
DELETE /api/projects/:id               (Owner only)
POST   /api/projects/:id/members       (Admin only)
DELETE /api/projects/:id/members/:uid  (Admin only)
PATCH  /api/projects/:id/members/:uid/role

GET    /api/projects/:id/tasks
POST   /api/projects/:id/tasks
PUT    /api/tasks/:id
PATCH  /api/tasks/:id/status
DELETE /api/tasks/:id

GET    /api/dashboard

----------------------------------------------------
DATABASE SCHEMA (PostgreSQL via Prisma)
----------------------------------------------------
User          — id, email, password, name, createdAt
Project       — id, name, description, ownerId, createdAt
ProjectMember — projectId, userId, role (ADMIN/MEMBER), joinedAt
Task          — id, title, description, status, priority,
                dueDate, projectId, assigneeId, creatorId

----------------------------------------------------
HOW TO RUN LOCALLY
----------------------------------------------------

PREREQUISITES:
  - Node.js >= 18
  - PostgreSQL database

BACKEND:
  cd backend
  npm install
  cp .env.example .env          # Edit DATABASE_URL + JWT_SECRET
  npx prisma db push
  npm run dev                   # Runs on http://localhost:5000

FRONTEND:
  cd frontend
  npm install
  cp .env.example .env          # Set REACT_APP_API_URL=http://localhost:5000/api
  npm start                     # Runs on http://localhost:3000

----------------------------------------------------
DEPLOY ON RAILWAY
----------------------------------------------------

1. Create Railway account at railway.app
2. Add PostgreSQL service → copy DATABASE_URL
3. Deploy backend:
     - New Service → GitHub Repo
     - Root directory: backend
     - Env vars: DATABASE_URL, JWT_SECRET, FRONTEND_URL, PORT=5000
     - railway.toml auto-runs: prisma migrate deploy && node src/index.js
4. Deploy frontend:
     - New Service → GitHub Repo (same repo)
     - Root directory: frontend
     - Env vars: REACT_APP_API_URL=<backend-url>/api
5. Update FRONTEND_URL in backend with deployed frontend URL

====================================================
