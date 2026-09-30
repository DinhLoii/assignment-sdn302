# Assignment 2 – Task & Team Management App: CRUD API with Authentication

## Submission Information

Student ID: QE190167
Full Name: DINH VAN LOI
GitHub Repository URL: https://github.com/DinhLoii/assignment-sdn302
Deployed Website URL (Vercel): https://assignment-sdn302.vercel.app/
Separate Backend URL (NestJS on Render) — write N/A if not used: N/A
Test Account Email: test@example.com
Test Account Password: Password123!
This test account is already email-verified / ready to log in immediately, with no confirmation link needed (Yes / No): Yes
Self-registration works, so a grader can create their own account (Yes / No): Yes

---

## 🚀 Overview of Assignment 2 Implementation

### 1. User Authentication (JWT + HTTP-Only Cookie + bcryptjs)

- **Registration** (`POST /api/auth/register`): User signs up with name, email, and password (hashed with `bcryptjs` salt rounds 10).
- **Login** (`POST /api/auth/login`): Verifies credentials and returns a secure JWT token, sets an HTTP-Only secure cookie (`taskpulse_token`).
- **Logout** (`POST /api/auth/logout`): Clears the authentication session.
- **Session Verification** (`GET /api/auth/me`): Returns the current authenticated user's profile.
- **Route Guarding / Proxy** (`src/proxy.ts`): Next.js 16 route protection guarding `/teams/*` routes, redirecting unauthenticated visitors to `/login`, and redirecting authenticated users from auth pages to `/teams`.
- **Pre-verified Test Account**: Seeded directly into the database: `test@example.com` / `Password123!`. Includes a 1-click auto-fill button on the Login page for immediate grading.

### 2. Team Model & Management (CRUD & RBAC)

- **List Teams** (`GET /api/teams`): Retrieves all teams the authenticated user belongs to, including roles, member count, and task count.
- **Create Team** (`POST /api/teams`): Authenticated user creates a team and is automatically assigned as the `OWNER`.
- **Team Detail** (`GET /api/teams/:id`): Fetches team details, members, tasks, and user's role. Accessible only by team members.
- **Update Team** (`PUT /api/teams/:id`): Update team name and description. **Owner only**.
- **Delete Team** (`DELETE /api/teams/:id`): Cascades deletion to memberships and tasks. **Owner only**.
- **Add Team Member** (`POST /api/teams/:id/members`): Owner adds a registered user by email with immediate member role assignment.
- **Remove Team Member** (`DELETE /api/teams/:id/members/:userId`): Owner removes a member from the team. Prevents removing the Owner.

### 3. Task Model & Management (CRUD & RBAC)

- **List Team Tasks** (`GET /api/teams/:id/tasks`): Lists tasks for a specific team with filtering by status, priority, assignee, and search keywords.
- **Create Team Task** (`POST /api/teams/:id/tasks`): Any team member can create tasks, assign them to team members, set priority, status, and due dates. Stores `creatorId`.
- **Update Task** (`PUT /api/tasks/:id`): Team members can update task details, priority, status, assignee, and due date.
- **Delete Task** (`DELETE /api/tasks/:id`): Enforces RBAC — only the **task creator**, the **assignee**, or the **team Owner** can delete a task.

### 4. Interactive UI & Bonus Features

- **Interactive Kanban Board View**: Drag-and-drop tasks between To Do, In Progress, and Done columns with immediate status updates.
- **Filtering & Search**: Real-time filtering by Status, Priority, and Assignee, plus keyword search across task title and description.
- **OpenAPI 3.0 & Swagger UI Documentation** (Bonus): Standalone full-screen Swagger UI available at `/docs` (and `/api/docs`) with live request execution and JWT Bearer authorization support.
- **Theme Support**: Seamless Dark Mode / Light Mode with Tailwind CSS.

---

## 📋 Self-Assessment Checklist

| ID            | Feature / Requirement                                        |    Status    | Notes                                                                |
| :------------ | :----------------------------------------------------------- | :----------: | :------------------------------------------------------------------- |
| **AUTH-01**   | User registration with name, email, password                 | ✅ Completed | Form with Zod validation, bcryptjs password hashing                  |
| **AUTH-02**   | User login with session/token issuance                       | ✅ Completed | JWT issued, HttpOnly cookie set + JSON response                      |
| **AUTH-03**   | User logout functionality                                    | ✅ Completed | Clears authentication cookie, resets state                           |
| **AUTH-04**   | Route protection for teams & task management                 | ✅ Completed | Proxy/Middleware redirects unauthenticated requests to `/login`      |
| **AUTH-05**   | Pre-verified grader test account & working self-registration | ✅ Completed | `test@example.com` / `Password123!` seeded & ready                   |
| **TEAM-01**   | Create team with auto-assigned Owner role                    | ✅ Completed | `POST /api/teams` creates team & sets `OWNER` in TeamMember          |
| **TEAM-02**   | List teams the user belongs to                               | ✅ Completed | `GET /api/teams` with member/task counts and user role               |
| **TEAM-03**   | Get team details with members and tasks                      | ✅ Completed | `GET /api/teams/:id` guarded by team membership                      |
| **TEAM-04**   | Update team details (Owner only)                             | ✅ Completed | `PUT /api/teams/:id` checks `team.ownerId === auth.id`               |
| **TEAM-05**   | Delete team (Owner only)                                     | ✅ Completed | `DELETE /api/teams/:id` checks `team.ownerId === auth.id`            |
| **TEAM-06**   | Add team member by email (Owner only)                        | ✅ Completed | `POST /api/teams/:id/members` checks owner and user email            |
| **TEAM-07**   | Remove member from team (Owner only)                         | ✅ Completed | `DELETE /api/teams/:id/members/:userId` checks owner permission      |
| **TASK-01**   | List tasks for a team with filters                           | ✅ Completed | `GET /api/teams/:id/tasks` with status, priority, assignee filter    |
| **TASK-02**   | Create task within team & assign to member                   | ✅ Completed | `POST /api/teams/:id/tasks` sets `creatorId`, `teamId`, `assigneeId` |
| **TASK-03**   | Update task details & status                                 | ✅ Completed | `PUT /api/tasks/:id` allows team members to update                   |
| **TASK-04**   | Delete task RBAC (Creator, Assignee, Owner only)             | ✅ Completed | `DELETE /api/tasks/:id` enforces 3-role authorization guard          |
| **UI-01**     | Login & Register pages with Logout button                    | ✅ Completed | Sleek glassmorphism UI, 1-click test credentials fill                |
| **UI-02**     | Teams dashboard with user teams list                         | ✅ Completed | Cards with role badge, member/task count, create team modal          |
| **UI-03**     | Team detail page with members & tasks tabs                   | ✅ Completed | Workspace tabs for managing tasks and team members                   |
| **UI-04**     | Visual status & priority color badges                        | ✅ Completed | Custom badges matching design system                                 |
| **BONUS-01**  | Kanban-style board with Drag & Drop                          | ✅ Completed | Drag tasks between To Do, In Progress, Done columns                  |
| **BONUS-02**  | Filter & search tasks by status, priority, assignee          | ✅ Completed | Instant client and server filtering                                  |
| **BONUS-03**  | OpenAPI 3.0 & Swagger UI Interactive Documentation           | ✅ Completed | Standalone full-screen Swagger tester at `/docs` (and `/api/docs`)   |
| **DEPLOY-01** | Continuous Vercel deployment with Supabase PostgreSQL        | ✅ Completed | Synced with Prisma 7 and remote Supabase database                    |
