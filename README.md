# TaskPulse – Task & Team Management Web Application

> **Assignment 2:** Full-Stack CRUD API with Authentication, Team Management, Role-Based Access Control (RBAC), and Kanban Board.

[![Next.js](https://img.shields.io/badge/Next.js-16+-black?style=flat&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19+-61DAFB?style=flat&logo=react&logoColor=black)](https://react.dev/)
[![Prisma](https://img.shields.io/badge/Prisma-7+-2D3748?style=flat&logo=prisma)](https://www.prisma.io/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?style=flat&logo=supabase)](https://supabase.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC?style=flat&logo=tailwind-css)](https://tailwindcss.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5+-3178C6?style=flat&logo=typescript)](https://www.typescriptlang.org/)
[![Vercel](https://img.shields.io/badge/Deploy-Vercel-black?style=flat&logo=vercel)](https://assignment-sdn302.vercel.app/)

---

### 📌 Student & Submission Info

- **Student Name:** DINH VAN LOI
- **Student ID (MSSV):** QE190167
- **Class:** SE19C
- **Live Demo (Vercel):** [TaskPulse | Task & Team Management Application](https://assignment-sdn302.vercel.app/)
- **GitHub Repository:** [https://github.com/DinhLoii/assignment-sdn302](https://github.com/DinhLoii/assignment-sdn302)
- **Grading Test Account:** `test@example.com` / `Password123!` (Ready for immediate login, no confirmation link needed)

---

## 🌟 Overview

**TaskPulse** is a production-ready, full-stack **Task & Team Management Web Application** built with **Next.js App Router**, **Prisma 7 ORM**, and **Supabase Cloud PostgreSQL**.

In **Assignment 2**, the project implements a complete **JWT Authentication** flow, team workspace management, role-based access control (Owner & Member), invite-by-email functionality, task delegation, and an interactive **Kanban Board** with drag-and-drop task progression.

---

## ✨ Assignment 2 Features

- **User Authentication**:
  - Registration with Zod validation and `bcryptjs` password hashing.
  - Login with JWT token issuance, stored securely in HTTP-Only cookies.
  - Session verification endpoint (`/api/auth/me`) and clean logout.
  - Route protection middleware guarding `/teams/*`.
- **Team Workspace Management**:
  - Create teams; creator automatically becomes the `OWNER`.
  - Team dashboard listing user's teams with role badges and stats.
  - Owner-exclusive team update and team deletion permissions.
  - Member management: add members by email (Owner only) and remove members.
- **Task Management & Role-Based Authorization (RBAC)**:
  - Create tasks within teams and assign them to specific team members.
  - Update task status, priority, due date, description, and assignee.
  - Task deletion authorization: Only the **task creator**, **assignee**, or **team Owner** can delete a task.
- **Interactive Kanban Board (Bonus)**:
  - Drag-and-drop task progression between `To Do`, `In Progress`, and `Done` columns with real-time database persistence.
  - Table view alternative for tabular inspection.
- **Advanced Filtering & Search**:
  - Filter tasks by Status, Priority, and Assignee.
  - Full-text search across titles and descriptions.
- **Modern UI & Micro-interactions**:
  - Slate dark palette, glassmorphism, animated status badges, and Sonner toast notifications.
  - 1-click test credentials autofill on the login page for evaluator convenience.

---

## 🗄️ Database Architecture & Entity Relationship Diagram (ERD)

The application uses **Prisma 7** connected to **Supabase Cloud PostgreSQL**. The schema defines four core models: `User`, `Team`, `TeamMember`, and `Task`.

```mermaid
erDiagram
    User ||--o{ Team : "owns"
    User ||--o{ TeamMember : "belongs to"
    User ||--o{ Task : "assigned to"
    Team ||--o{ TeamMember : "has"
    Team ||--o{ Task : "contains"

    User {
        String id PK "cuid"
        String name
        String email UK
        String password "hashed"
        DateTime createdAt
    }

    Team {
        String id PK "cuid"
        String name
        String description
        String ownerId FK
        DateTime createdAt
    }

    TeamMember {
        String id PK "cuid"
        String teamId FK
        String userId FK
        TeamRole role "ADMIN | MEMBER"
        DateTime joinedAt
    }

    Task {
        String id PK "cuid"
        String title
        String description
        TaskStatus status "TODO | IN_PROGRESS | DONE"
        TaskPriority priority "LOW | MEDIUM | HIGH"
        DateTime dueDate
        String teamId FK "optional in Ass1"
        String assigneeId FK "optional in Ass1"
        DateTime createdAt
        DateTime updatedAt
    }
```

---

## 🚀 Getting Started

### 1. Prerequisites

- [Node.js](https://nodejs.org/) v20+ or v22 LTS
- [Git](https://git-scm.com/)
- A free [Supabase](https://supabase.com/) account

### 2. Clone the Repository

```bash
git clone https://github.com/DinhLoii/assignment-sdn302.git
cd assignment-1
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Configure Supabase Cloud PostgreSQL

1. Sign in to [supabase.com](https://supabase.com) and click **New project**.
2. Set a **Project Name** (e.g. `task-team-management`), choose a database password, and select a region (e.g. `Singapore - ap-southeast-1`).
3. Once created, go to **Project Settings** -> **Database** -> **Connection string** -> **URI** tab.
4. Copy the connection strings:
   - **Transaction Pooler (Port 6543)** -> set as `DATABASE_URL`
   - **Direct Connection (Port 5432)** -> set as `DIRECT_URL`
5. Create a `.env` file in the project root:
   ```env
   DATABASE_URL="postgresql://postgres.[PROJECT_REF]:[PASSWORD]@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
   DIRECT_URL="postgresql://postgres.[PROJECT_REF]:[PASSWORD]@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres"
   ```

### 5. Run Prisma Migrations

Apply the schema to your Supabase database:

```bash
npx prisma migrate dev --name init
```

_This command creates the `users`, `teams`, `team_members`, and `tasks` tables in your Supabase PostgreSQL instance._

### 6. Seed Sample Data & Inspect in Prisma Studio

```bash
# Seed initial sample tasks and demo team
npx prisma db seed

# Open Prisma Studio to visually inspect and manage database records
npx prisma studio
```

### 7. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to view the application.

---

## 📡 RESTful API Reference

Interactive API documentation with live execution is available via **Swagger UI** at [`/docs`](http://localhost:3000/docs) (or [`/api/docs`](http://localhost:3000/api/docs)).

### Authentication Endpoints
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :---: |
| `POST` | `/api/auth/register` | Register new user account | No |
| `POST` | `/api/auth/login` | Login with email & password (sets HTTP-Only cookie) | No |
| `POST` | `/api/auth/logout` | Terminate session & clear cookies | No |
| `GET` | `/api/auth/me` | Fetch currently logged-in user profile | **Yes** |

### Teams & RBAC Endpoints
| Method | Endpoint | Description | Authorization |
| :--- | :--- | :--- | :---: |
| `GET` | `/api/teams` | List teams current user belongs to | Authenticated |
| `POST` | `/api/teams` | Create new team (creator becomes `OWNER`) | Authenticated |
| `GET` | `/api/teams/:id` | Get team details, members, and tasks | Team Member |
| `PUT` | `/api/teams/:id` | Update team name or description | **Team Owner** |
| `DELETE` | `/api/teams/:id` | Delete team and cascade tasks/members | **Team Owner** |
| `POST` | `/api/teams/:id/members` | Add member to team by registered email | **Team Owner** |
| `DELETE` | `/api/teams/:id/members/:userId` | Remove member from team | **Team Owner** |

### Tasks & RBAC Endpoints
| Method | Endpoint | Description | Authorization |
| :--- | :--- | :--- | :---: |
| `GET` | `/api/teams/:id/tasks` | List team tasks (with status, priority, search, page) | Team Member |
| `POST` | `/api/teams/:id/tasks` | Create task within team and assign member | Team Member |
| `PUT` | `/api/tasks/:id` | Update task details, status, priority, assignee | Team Member |
| `DELETE` | `/api/tasks/:id` | Delete task | **Creator / Assignee / Owner** |

---

## ☁️ Deployment to Vercel

1. Push your repository to **GitHub**.
2. Sign in to [Vercel](https://vercel.com/) and click **Add New...** -> **Project**.
3. Import your GitHub repository (`DinhLoii/assignment-sdn302`).
4. In **Project Settings** -> **Environment Variables**, add:
   - `DATABASE_URL`: Your Supabase Transaction Pooler connection string (`port 6543`).
   - `DIRECT_URL`: Your Supabase Direct connection string (`port 5432`).
   - `JWT_SECRET`: Random secure string (e.g. `your-jwt-secret-min-32-chars-long`).
5. Click **Deploy**. Vercel will build the project and provide a live URL!

---

## 📂 Project Structure

```
assignment-sdn302/
├── .github/workflows/ci.yml       # GitHub Actions CI workflow
├── prisma/
│   ├── schema.prisma              # Relational models: User, Team, TeamMember, Task
│   └── seed.ts                    # Database seeding (test accounts, teams, tasks)
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── auth/              # register, login, logout, me
│   │   │   ├── docs/              # /api/docs (redirect) & /api/docs/spec (OpenAPI JSON)
│   │   │   ├── tasks/             # Task update & delete with RBAC
│   │   │   └── teams/             # Teams CRUD, members management, team tasks
│   │   ├── docs/                  # Full-screen Swagger UI interactive docs
│   │   ├── login/                 # Glassmorphic Login page + 1-click test login
│   │   ├── register/              # Registration page with Zod validation
│   │   ├── teams/
│   │   │   ├── page.tsx           # Teams dashboard with metrics & team cards
│   │   │   └── [id]/page.tsx      # Team workspace (Tasks & Members tabs)
│   │   ├── globals.css            # Tailwind CSS & design system tokens
│   │   ├── layout.tsx             # Root layout with AuthProvider, Navbar, Footer
│   │   └── page.tsx               # Homepage with Assignment 2 highlights
│   ├── components/
│   │   ├── layout/                # Navbar (with user auth state & menu), Footer
│   │   ├── tasks/                 # KanbanBoard, TaskCard, Modals, Filters, Stats
│   │   ├── teams/                 # CreateTeamModal, EditTeamModal, AddMemberModal
│   │   └── ui/                    # Button, Badge, Input, Select, Textarea, Modal
│   ├── context/
│   │   └── AuthContext.tsx        # Global user authentication context & session state
│   ├── lib/
│   │   ├── api-middleware.ts      # API error handling wrapper
│   │   ├── api-response.ts        # Standardized JSON response envelope
│   │   ├── auth.ts                # JWT sign/verify, bcrypt hashing, cookie helpers
│   │   ├── prisma.ts              # PrismaClient singleton
│   │   ├── swagger-spec.ts        # OpenAPI 3.0 specification definition
│   │   ├── utils.ts               # CSS class merger & helpers
│   │   └── validations/           # Zod schemas (auth, team, task)
│   ├── proxy.ts                   # Next.js 16 Proxy route guarding (/teams/*)
│   └── types/                     # TypeScript shared interfaces
├── ASSIGNMENT_2_SUBMISSION.md     # Official Assignment 2 submission document
├── README.md                      # Comprehensive project documentation & ERD
└── package.json
```
