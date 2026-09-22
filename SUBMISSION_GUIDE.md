# Assignment 1 Submission Guide & Report Template
**Document Name format:** `[YOUR_STUDENT_ID]_Ass1.docx` (e.g., `QE180000_Ass1.docx`)

---

## 1. Student Information
- **Student Full Name:** DINH VAN LOI
- **Student ID:** QE190167
- **Class:** SE19C
- **Course:** SDN302 – Web Development with Node.js & Next.js
- **Assignment:** Assignment 1 – Task & Team Management App: Project Setup, Prisma & Deployment
- **Date of Submission:** 22/09/2026

---

## 2. Project Links
- **Public GitHub Repository:** [https://github.com/DinhLoii/assignment-sdn302](https://github.com/DinhLoii/assignment-sdn302)
- **Live Deployed Vercel Application:** [TaskPulse | Task & Team Management Application](https://assignment-sdn302.vercel.app/)

---

## 3. Database Design & Supabase Integration

### 3.1. Prisma Schema Overview
The database is built using **Prisma 7 ORM** connected to a cloud-hosted **PostgreSQL** instance on **Supabase**. The schema defines four interconnected models:
1. **`User`**: Represents system users with `id`, `name`, `email` (unique), `password`, and timestamps. In Assignment 2, this model will be integrated with authentication.
2. **`Team`**: Represents workspaces/teams created by users, containing `id`, `name`, `description`, `ownerId` (foreign key to `User`), and timestamps.
3. **`TeamMember`**: A join table managing the many-to-many relationship between users and teams, storing `teamId`, `userId`, `role` (`ADMIN` or `MEMBER`), and `joinedAt`.
4. **`Task`**: Represents work items containing `id`, `title`, `description`, `status` (`TODO`, `IN_PROGRESS`, `DONE`), `priority` (`LOW`, `MEDIUM`, `HIGH`), `dueDate`, `teamId` (optional in Ass1), `assigneeId` (optional in Ass1), and timestamps.

### 3.2. Verification in Supabase (Screenshots)
*(Paste your screenshots here)*
- **Screenshot 1: Supabase Table Editor** showing the 4 created tables (`users`, `teams`, `team_members`, `tasks`).
- **Screenshot 2: Supabase Schema / Database Settings** showing connection settings.
- **Screenshot 3: Prisma Studio (`npx prisma studio`)** showing sample task records.

---

## 4. Summary of Completed Requirements

| Requirement | Status | Description |
| :--- | :---: | :--- |
| **Next.js 15 App Router & TypeScript** | ✅ 100% | Clean folder structure (`app/`, `components/`, `lib/`, `prisma/`, `types/`). |
| **Git & GitHub Commits** | ✅ 100% | Standard git repository with clean commit history (>5 commits). |
| **Prisma ORM & Supabase** | ✅ 100% | Full models (`User`, `Team`, `TeamMember`, `Task`) migrated to Supabase. |
| **Homepage & Shared Layout** | ✅ 100% | Responsive header/navbar, hero section, and footer across all viewports. |
| **Public Task CRUD** | ✅ 100% | Create, View, Edit, Delete tasks with automatic instant UI refresh. |
| **Route Handlers** | ✅ 100% | `GET /api/tasks`, `POST /api/tasks`, `PUT /api/tasks/:id`, `DELETE /api/tasks/:id`. |
| **Teams Placeholder** | ✅ 100% | Sleek `/teams` Coming Soon page detailing Assignment 2 roadmap. |
| **Bonus: Client-Side Validation** | ✅ 100% | Real-time Zod validation with intuitive inline errors. |
| **Bonus: Filtering & Search** | ✅ 100% | Filter by status (`TODO`, `IN_PROGRESS`, `DONE`), priority, and keyword search. |
| **Bonus: GitHub Actions CI** | ✅ 100% | Automated CI workflow for linting, type-checking, and building on push. |
| **Bonus: ERD in README** | ✅ 100% | Professional Mermaid ERD diagram documenting entity relationships. |
| **Bonus: UI / Design** | ✅ 100% | Tailwind CSS, Lucide icons, Sonner toast notifications, glassmorphism. |
