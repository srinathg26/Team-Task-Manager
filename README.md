# Team Task Manager

A full-stack web application for managing projects, tasks, and teams with role-based access control.

## Live Demo
- **Frontend:** https://team-task-manager-1-2dxu.onrender.com
- **Backend API:** https://team-task-manager-qu6v.onrender.com

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18, React Router v6, Axios |
| Backend | Node.js, Express.js |
| ORM | Prisma |
| Database | PostgreSQL |
| Auth | JWT (jsonwebtoken) + bcryptjs |
| Deploy | Railway |

## Features

- **Authentication** – Signup & Login with JWT-based sessions
- **Project Management** – Create, view, and delete projects
- **Team Management** – Add/remove members by email, assign Admin/Member roles
- **Task Management** – Create tasks with title, description, status, priority, due date, and assignee
- **Kanban Board** – Visual task board grouped by status (To Do / In Progress / Done)
- **Dashboard** – Overview of all stats, overdue tasks, and recent activity
- **Role-Based Access** – Only Admins can add/remove members and manage tasks
- **Filters** – Filter tasks by status and priority

## Project Structure

```
team-task-manager/
├── backend/
│   ├── prisma/
│   │   └── schema.prisma       # Database schema
│   ├── src/
│   │   ├── controllers/        # Business logic
│   │   │   ├── authController.js
│   │   │   ├── projectController.js
│   │   │   ├── taskController.js
│   │   │   └── dashboardController.js
│   │   ├── middleware/
│   │   │   └── auth.js         # JWT auth + role check middleware
│   │   ├── routes/
│   │   │   ├── auth.js
│   │   │   ├── projects.js
│   │   │   ├── tasks.js
│   │   │   └── dashboard.js
│   │   └── index.js            # Express app entry point
│   ├── .env.example
│   ├── package.json
│   └── railway.toml
└── frontend/
    ├── public/
    │   └── index.html
    ├── src/
    │   ├── api/
    │   │   └── axios.js         # Axios instance with interceptors
    │   ├── context/
    │   │   └── AuthContext.js   # Auth state management
    │   ├── pages/
    │   │   ├── Login.js
    │   │   ├── Signup.js
    │   │   ├── Dashboard.js
    │   │   ├── Projects.js
    │   │   └── ProjectDetail.js
    │   ├── components/
    │   │   └── Navbar.js
    │   ├── App.js
    │   └── index.js
    ├── .env.example
    ├── package.json
    └── railway.toml
```

## REST API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/signup` | Register new user |
| POST | `/api/auth/login` | Login & get JWT |
| GET | `/api/auth/me` | Get current user |

### Projects
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/projects` | ✅ | List all user's projects |
| POST | `/api/projects` | ✅ | Create new project |
| GET | `/api/projects/:id` | ✅ Member | Get project details |
| PUT | `/api/projects/:id` | ✅ Admin | Update project |
| DELETE | `/api/projects/:id` | ✅ Owner | Delete project |
| POST | `/api/projects/:id/members` | ✅ Admin | Add member by email |
| DELETE | `/api/projects/:id/members/:userId` | ✅ Admin | Remove member |
| PATCH | `/api/projects/:id/members/:userId/role` | ✅ Admin | Update member role |

### Tasks
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/projects/:projectId/tasks` | ✅ Member | List tasks (with filters) |
| POST | `/api/projects/:projectId/tasks` | ✅ Member | Create task |
| PUT | `/api/tasks/:id` | ✅ Member | Update task |
| PATCH | `/api/tasks/:id/status` | ✅ Member | Quick status update |
| DELETE | `/api/tasks/:id` | ✅ Admin/Creator | Delete task |

### Dashboard
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/dashboard` | Stats, overdue tasks, recent activity |

---

## Local Development Setup

### Prerequisites
- Node.js >= 18
- PostgreSQL database (local or cloud)
- npm or yarn

### 1. Clone the Repository
```bash
git clone https://github.com/YOUR_USERNAME/team-task-manager.git
cd team-task-manager
```

### 2. Backend Setup
```bash
cd backend

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env and fill in DATABASE_URL and JWT_SECRET

# Push database schema
npx prisma db push

# Start development server
npm run dev
```

The backend runs at **http://localhost:5000**

### 3. Frontend Setup
```bash
cd frontend

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env — set REACT_APP_API_URL=http://localhost:5000/api

# Start development server
npm start
```

The frontend runs at **http://localhost:3000**

---

## Deployment on Railway

### Step 1 – Create a Railway Account
Go to [railway.app](https://railway.app) and sign in with GitHub.

### Step 2 – Deploy the Database
1. In Railway dashboard → **New Project** → **PostgreSQL**
2. After provisioning, go to **Variables** tab
3. Copy the `DATABASE_URL` value

### Step 3 – Deploy the Backend
1. **New Project** → **Deploy from GitHub Repo**
2. Select your repository → set **Root Directory** to `backend`
3. Add these environment variables:
   ```
   DATABASE_URL=<paste from PostgreSQL service>
   JWT_SECRET=<any long random string>
   FRONTEND_URL=<your frontend Railway URL>
   PORT=5000
   ```
4. Railway auto-detects `railway.toml` and runs migrations on deploy
5. Copy the backend **public URL** after deployment

### Step 4 – Deploy the Frontend
1. **New Service** → **Deploy from GitHub Repo** (same repo)
2. Set **Root Directory** to `frontend`
3. Add environment variables:
   ```
   REACT_APP_API_URL=<your backend Railway URL>/api
   ```
4. Railway builds and serves the React app

### Step 5 – Link Services
- Update `FRONTEND_URL` in backend variables to point to the frontend Railway URL
- Redeploy the backend

---

## Database Schema

```
User
  id, email (unique), password (hashed), name, createdAt

Project
  id, name, description, ownerId → User, createdAt, updatedAt

ProjectMember
  projectId → Project, userId → User, role (ADMIN|MEMBER), joinedAt

Task
  id, title, description, status (TODO|IN_PROGRESS|DONE),
  priority (LOW|MEDIUM|HIGH), dueDate, projectId → Project,
  assigneeId → User, creatorId → User, createdAt, updatedAt
```

## License
MIT
