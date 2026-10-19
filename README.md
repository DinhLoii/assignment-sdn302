# TaskPulse – Task & Team Management Web Application

> **Assignment 3 & 4:** Real-time Collaboration, Team Chat, Live Task Board Sync, In-App Notifications & Advanced 3-Tier RBAC.

[![Next.js](https://img.shields.io/badge/Next.js-16+-black?style=flat&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19+-61DAFB?style=flat&logo=react&logoColor=black)](https://react.dev/)
[![Pusher](https://img.shields.io/badge/Pusher-Real--time-brightgreen?style=flat&logo=pusher)](https://pusher.com/)
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
- **Grading Test Account 1 (Owner):** `test@example.com` / `Password123!`
- **Grading Test Account 2 (Admin - Same Team):** `alice@example.com` / `Password123!`
- **Official Submission File:** [`ASSIGNMENT_3_SUBMISSION.md`](./ASSIGNMENT_3_SUBMISSION.md)

---

## 🌟 Overview

**TaskPulse** is a production-ready, full-stack **Task & Team Management Web Application** built with **Next.js 16 App Router**, **Prisma 7 ORM**, **Supabase PostgreSQL**, and **Pusher Channels**.

In **Assignment 3 & 4**, the platform extends into a high-performance **Real-time Collaborative Workspace** featuring team chat rooms with persistent history, live-updating Kanban task boards across multiple browser sessions, in-app notification center, team audit logs, and an advanced 3-tier permission hierarchy (Owner, Admin, Member).

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

## ✨ Assignment 3 & 4 Features

- **Real-time Team Chat**:
  - Dedicated real-time chat room per team with full message history persisted in database.
  - WebSocket instant message delivery via **Pusher Channels** with zero page refresh.
  - Bonus: **Typing indicators** ("Alice is typing...").
  - Bonus: **Online/offline presence badge** displaying active members in chat room.
  - Bonus: **Attachment support** (image preview and file URLs).
- **Live Task Board Updates (Kanban Sync)**:
  - Collaborative drag-and-drop: moving a task between `To Do`, `In Progress`, and `Done` reflects live on other users' screens.
  - Instant creation (`task:created`), update (`task:updated`), and deletion (`task:deleted`).
- **In-App Notification Center**:
  - Interactive notification bell in Navbar with dynamic unread counter badge.
  - Notifications triggered when assigned to a task (`TASK_ASSIGNED`), added to a team (`TEAM_INVITED`), or when role is modified (`ROLE_UPDATED`).
  - Single-click to mark as read and navigate; "Mark all as read" button.
  - Bonus: **Web Browser Push Notifications** via browser Notification API.
- **Advanced 3-Tier Role & Permission Hierarchy (RBAC)**:
  - **Owner**: Full control — manage members, modify roles, delete team, delete any task.
  - **Admin**: Manage members (add, promote/demote Member, remove Member) and manage all tasks, but **cannot delete the team**.
  - **Member**: Create and manage own tasks, collaborate on chat, view team tasks. Cannot manage members or delete others' tasks.
  - Enforced strictly on both **Server Route Handlers** (403 Forbidden) and **UI controls** (disabled/hidden).
- **Team Activity Log & Audit Trail (Bonus)**:
  - Dedicated Audit Trail timeline tracking who performed what action and when.
- **Dual-Session Evaluation Accounts**:
  - Pre-seeded Test Account 1 (`test@example.com` / `Password123!`) and Test Account 2 (`alice@example.com` / `Password123!`) in the **SAME** team `TaskPulse Core Platform` for immediate real-time testing across two browser windows.

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

| Method | Endpoint             | Description                                         | Auth Required |
| :----- | :------------------- | :-------------------------------------------------- | :-----------: |
| `POST` | `/api/auth/register` | Register new user account                           |      No       |
| `POST` | `/api/auth/login`    | Login with email & password (sets HTTP-Only cookie) |      No       |
| `POST` | `/api/auth/logout`   | Terminate session & clear cookies                   |      No       |
| `GET`  | `/api/auth/me`       | Fetch currently logged-in user profile              |    **Yes**    |

### Teams & RBAC Endpoints

| Method   | Endpoint                         | Description                               | Authorization  |
| :------- | :------------------------------- | :---------------------------------------- | :------------: |
| `GET`    | `/api/teams`                     | List teams current user belongs to        | Authenticated  |
| `POST`   | `/api/teams`                     | Create new team (creator becomes `OWNER`) | Authenticated  |
| `GET`    | `/api/teams/:id`                 | Get team details, members, and tasks      |  Team Member   |
| `PUT`    | `/api/teams/:id`                 | Update team name or description           | **Team Owner** |
| `DELETE` | `/api/teams/:id`                 | Delete team and cascade tasks/members     | **Team Owner** |
| `POST`   | `/api/teams/:id/members`         | Add member to team by registered email    | **Team Owner** |
| `DELETE` | `/api/teams/:id/members/:userId` | Remove member from team                   | **Team Owner** |

### Tasks & RBAC Endpoints

| Method   | Endpoint               | Description                                           |         Authorization          |
| :------- | :--------------------- | :---------------------------------------------------- | :----------------------------: |
| `GET`    | `/api/teams/:id/tasks` | List team tasks (with status, priority, search, page) |          Team Member           |
| `POST`   | `/api/teams/:id/tasks` | Create task within team and assign member             |          Team Member           |
| `PUT`    | `/api/tasks/:id`       | Update task details, status, priority, assignee       |          Team Member           |
| `DELETE` | `/api/tasks/:id`       | Delete task                                           | **Creator / Assignee / Owner** |

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
