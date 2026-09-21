# TaskPulse – Task & Team Management Web Application

> **Assignment 1:** Project Setup, Database Design with Prisma, Cloud PostgreSQL (Supabase) & Vercel Deployment.

[![Next.js](https://img.shields.io/badge/Next.js-15+-black?style=flat&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19+-61DAFB?style=flat&logo=react&logoColor=black)](https://react.dev/)
[![Prisma](https://img.shields.io/badge/Prisma-6+-2D3748?style=flat&logo=prisma)](https://www.prisma.io/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?style=flat&logo=supabase)](https://supabase.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC?style=flat&logo=tailwind-css)](https://tailwindcss.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5+-3178C6?style=flat&logo=typescript)](https://www.typescriptlang.org/)
[![Vercel](https://img.shields.io/badge/Deploy-Vercel-black?style=flat&logo=vercel)](https://vercel.com/)

---

## 🌟 Overview

**TaskPulse** is the technical foundation for a full-stack **Task & Team Management Application**. Built with **Next.js 15 App Router**, **Prisma 6 ORM**, and **Supabase Cloud PostgreSQL**, this project enables teams and individuals to organize, prioritize, and track tasks efficiently with a public, responsive CRUD interface.

This project fulfills **100% of the functional and bonus requirements** for Assignment 1, establishing a robust architecture for multi-user team collaboration in Assignments 2 and 3.

---

## ✨ Features

- **Public Task CRUD**: Create, Read, Update, and Delete tasks directly on the homepage without authentication.
- **Real-Time State Synchronization**: Automatic UI updates on create, edit, or delete actions with zero full-page reloads.
- **Advanced Filtering & Search**: Filter tasks by **Status** (`TODO`, `IN_PROGRESS`, `DONE`) and **Priority** (`LOW`, `MEDIUM`, `HIGH`), with real-time text search.
- **Client-Side Validation (Bonus)**: Form validation powered by **Zod** with user-friendly error messages.
- **Modern UI & Micro-interactions**: Dark slate palette, glassmorphism, responsive mobile/desktop layout, animated badges, and **Sonner** toast notifications.
- **Teams Section Placeholder**: Sleek "Coming Soon" preview page (`/teams`) outlining upcoming features for Assignment 2.
- **CI/CD Pipeline (Bonus)**: GitHub Actions workflow checking ESLint, TypeScript types, and production build on every push.
- **Prisma Studio & Seed Data**: Pre-configured `prisma/seed.ts` script to immediately populate the database with realistic sample data.

---

## 🗄️ Database Architecture & Entity Relationship Diagram (ERD)

The application uses **Prisma 6** connected to **Supabase Cloud PostgreSQL**. The schema defines four core models: `User`, `Team`, `TeamMember`, and `Task`.

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
*This command creates the `users`, `teams`, `team_members`, and `tasks` tables in your Supabase PostgreSQL instance.*

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

All endpoints return standardized JSON responses:

| Method | Endpoint | Description | Request Body / Query |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/tasks` | List tasks (supports filter & search) | `?status=TODO&priority=HIGH&search=query` |
| `POST` | `/api/tasks` | Create a new task | `{ title, description?, status?, priority?, dueDate? }` |
| `GET` | `/api/tasks/:id` | Get single task details | None |
| `PUT` | `/api/tasks/:id` | Update an existing task | `{ title?, description?, status?, priority?, dueDate? }` |
| `DELETE`| `/api/tasks/:id` | Delete a task by ID | None |

---

## ☁️ Deployment to Vercel

1. Push your repository to **GitHub**.
2. Sign in to [Vercel](https://vercel.com/) and click **Add New...** -> **Project**.
3. Import your GitHub repository.
4. In **Project Settings** -> **Environment Variables**, add:
   - `DATABASE_URL`: Your Supabase Transaction Pooler connection string.
   - `DIRECT_URL`: Your Supabase Direct connection string.
5. Click **Deploy**. Vercel will build the project and provide a live URL!

---

## 📂 Project Structure

```
assignment-1/
├── .github/workflows/ci.yml       # GitHub Actions CI workflow
├── prisma/
│   ├── schema.prisma              # Prisma schema definition
│   └── seed.ts                    # Database seeding script
├── src/
│   ├── app/
│   │   ├── api/tasks/             # Route Handlers for Tasks CRUD
│   │   ├── teams/page.tsx         # Teams Coming Soon page
│   │   ├── globals.css            # Tailwind CSS & theme tokens
│   │   ├── layout.tsx             # Root layout with Navbar & Footer
│   │   └── page.tsx               # Homepage with Task CRUD
│   ├── components/
│   │   ├── layout/                # Navbar, Footer
│   │   ├── tasks/                 # TaskList, TaskCard, TaskStats, Modals, Filters
│   │   └── ui/                    # Button, Badge, Input, Select, Textarea, Modal
│   ├── lib/
│   │   ├── prisma.ts              # PrismaClient singleton
│   │   ├── utils.ts               # Utility helpers
│   │   └── validations/           # Zod schemas
│   └── types/                     # TypeScript definitions
├── .env.example                   # Documented env template
├── README.md                      # Project documentation & ERD
└── SUBMISSION_GUIDE.md            # Template for student assignment report
```
