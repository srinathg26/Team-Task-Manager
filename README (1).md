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
| Deploy | Render |

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
│   └── render.yaml
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
    └── package.json
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
git clone https://github.com/srinathg26/Team-Task-Manager.git
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

## Deployment on Render

### Step 1 – Create a Render Account
Go to [render.com](https://render.com) and sign in with GitHub.

### Step 2 – Deploy the Database (PostgreSQL)
1. In Render dashboard → **New** → **PostgreSQL**
2. Fill in:
   - **Name:** `teamtaskdb`
   - **Region:** Choose closest to you
   - **Plan:** Free
3. Click **Create Database**
4. After creation, copy the **Internal Database URL** (use this for `DATABASE_URL`)

### Step 3 – Deploy the Backend (Web Service)
1. **New** → **Web Service**
2. Connect your GitHub repo → select `Team-Task-Manager`
3. Configure:
   - **Name:** `team-task-manager-backend`
   - **Root Directory:** `backend`
   - **Environment:** `Node`
   - **Build Command:** `npm install && npx prisma generate && npx prisma migrate deploy`
   - **Start Command:** `node src/index.js`
   - **Plan:** Free
4. Add **Environment Variables**:
   ```
   DATABASE_URL      = <Internal Database URL from Step 2>
   JWT_SECRET        = <any long random string, e.g. mysecretkey123abc>
   FRONTEND_URL      = https://team-task-manager-1-2dxu.onrender.com
   PORT              = 5000
   NODE_ENV          = production
   ```
5. Click **Create Web Service**
6. Wait for deploy — copy the backend URL (e.g. `https://team-task-manager-qu6v.onrender.com`)

### Step 4 – Deploy the Frontend (Static Site)
1. **New** → **Static Site**
2. Connect the same GitHub repo
3. Configure:
   - **Name:** `team-task-manager-frontend`
   - **Root Directory:** `frontend`
   - **Build Command:** `npm install && npm run build`
   - **Publish Directory:** `build`
4. Add **Environment Variables**:
   ```
   REACT_APP_API_URL = https://team-task-manager-qu6v.onrender.com/api
   ```
5. Click **Create Static Site**

### Step 5 – Link Services
- Go back to your **Backend** service on Render
- Update `FRONTEND_URL` to your actual frontend Render URL
- Click **Manual Deploy** → **Deploy latest commit**

> ⚠️ **Note on Free Tier:** Render free-tier services spin down after 15 minutes of inactivity. First request may take 30–60 seconds to wake up. This is expected behavior on the free plan.

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
