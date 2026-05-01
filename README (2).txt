====================================================
  TEAM TASK MANAGER — Full-Stack Web App
====================================================

LIVE URL: https://team-task-manager-1-2dxu.onrender.com
GITHUB:   https://github.com/srinathg26/Team-Task-Manager.git

----------------------------------------------------
TECH STACK
----------------------------------------------------
Frontend  : React 18, React Router v6, Axios
Backend   : Node.js, Express.js
ORM       : Prisma
Database  : PostgreSQL
Auth      : JWT + bcryptjs
Deploy    : Render

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
DEPLOY ON RENDER
----------------------------------------------------

STEP 1 — Create Render Account
  Go to render.com and sign in with GitHub.

STEP 2 — Create PostgreSQL Database
  - New → PostgreSQL
  - Name: teamtaskdb | Plan: Free
  - After creation, copy the "Internal Database URL"

STEP 3 — Deploy Backend (Web Service)
  - New → Web Service
  - Connect GitHub repo: Team-Task-Manager
  - Root Directory  : backend
  - Environment     : Node
  - Build Command   : npm install && npx prisma generate && npx prisma migrate deploy
  - Start Command   : node src/index.js
  - Plan            : Free
  - Environment Variables:
      DATABASE_URL  = <Internal Database URL from Step 2>
      JWT_SECRET    = <any long random string>
      FRONTEND_URL  = https://team-task-manager-1-2dxu.onrender.com
      PORT          = 5000
      NODE_ENV      = production

STEP 4 — Deploy Frontend (Static Site)
  - New → Static Site
  - Connect same GitHub repo
  - Root Directory    : frontend
  - Build Command     : npm install && npm run build
  - Publish Directory : build
  - Environment Variables:
      REACT_APP_API_URL = https://team-task-manager-qu6v.onrender.com/api

STEP 5 — Link Services
  - Update FRONTEND_URL in backend with the actual frontend Render URL
  - Trigger a manual redeploy of the backend

NOTE: Free-tier Render services spin down after 15 min of inactivity.
      First request after idle may take 30-60 seconds to wake up.

====================================================
