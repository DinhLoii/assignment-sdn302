# Assignment 3 & 4 – Task & Team Management App: Real-time Collaboration & Advanced Features

## Submission Information

Student ID: QE190167
Full Name: DINH VAN LOI
GitHub Repository URL: https://github.com/DinhLoii/assignment-sdn302
Deployed Website URL (Vercel): https://assignment-sdn302.vercel.app/
Separate Backend URL (NestJS on Render) — write N/A if not used: N/A
Real-time mechanism used (Supabase Realtime / Socket.io / Pusher / Ably): Pusher
Test Account 1 Email: test@example.com
Test Account 1 Password: Password123!
Test Account 2 Email (must be on the SAME team as Account 1, to test real-time between two sessions): alice@example.com
Test Account 2 Password: Password123!
Both test accounts are already email-verified / ready to log in immediately, with no confirmation link needed (Yes / No): Yes
Demo video link (YouTube/Drive/Loom, 2–3 minutes, showing live chat and live task updates across two sessions): https://drive.google.com/file/d/your-demo-video-link-here/view

---

## 🚀 Overview of Assignment 3 & 4 Implementation

### 1. Real-time Team Chat

- **Dedicated Team Chat Rooms**: Every team has its own real-time chat room (`src/components/chat/TeamChat.tsx`).
- **Database Persistence**: Messages are persisted in Supabase PostgreSQL via Prisma `Message` model (`senderId`, `content`, `attachmentUrl`, `teamId`, `createdAt`).
- **Zero-Refresh Delivery**: Real-time message streaming using Pusher Channels (`chat:new-message`).
- **Bonus Capabilities**:
  - **Typing Indicator**: Real-time "Alice is typing..." indicator using Pusher client events.
  - **Online Presence**: Dynamic badge displaying active online members in the team chat.
  - **File / Image Attachments**: Support for image URL previews and file links directly in chat.

### 2. Real-time Task Board Updates (Live Kanban Sync)

- **Live Collaborative Drag-and-Drop**: When a task status changes, the card moves live across all open sessions.
- **Instant Creation & Deletion**: New tasks appear instantly (`task:created`) and deleted tasks vanish live (`task:deleted`).
- **Dual-Session Evaluation**: Test Account 1 (`test@example.com`) and Test Account 2 (`alice@example.com`) are both on the same team `TaskPulse Core Platform`, enabling effortless testing across two browser windows.

### 3. In-App Notifications System

- **Event-Driven Alerts**:
  - Assignee receives notification when assigned a task (`TASK_ASSIGNED`).
  - User receives notification when added to a team (`TEAM_INVITED`).
  - User receives notification when their role is modified (`ROLE_UPDATED`).
- **Notification Bell & Unread Counter**:
  - Interactive dropdown in Navbar with unread badge counter.
  - Single click marks notification as read and navigates to the target team.
  - "Mark all as read" button.
- **Bonus Push Notifications**: Integrated browser Web Notification API (`window.Notification`).

### 4. Advanced 3-Tier Role & Permission System (RBAC)

Strictly enforced on both the **Server Route Handlers** (HTTP 403 Forbidden checks) and **Client UI** (hiding/disabling unauthorized controls):

| Permission / Action         |         👑 Owner         |          🛡️ Admin           |         👤 Member         |
| :-------------------------- | :----------------------: | :-------------------------: | :-----------------------: |
| **View Team, Chat & Tasks** |        ✅ Allowed        |         ✅ Allowed          |        ✅ Allowed         |
| **Create Tasks**            |        ✅ Allowed        |         ✅ Allowed          |        ✅ Allowed         |
| **Move Tasks on Kanban**    |        ✅ Allowed        |         ✅ Allowed          |        ✅ Allowed         |
| **Edit Any Task**           |        ✅ Allowed        |         ✅ Allowed          |     ❌ Own tasks only     |
| **Delete Any Task**         |        ✅ Allowed        |         ✅ Allowed          | ❌ Own created tasks only |
| **Invite New Members**      |        ✅ Allowed        |         ✅ Allowed          |       ❌ Forbidden        |
| **Change Member Roles**     |  ✅ Allowed (All roles)  | ✅ Allowed (Member ↔ Admin) |       ❌ Forbidden        |
| **Remove Members**          | ✅ Allowed (Except self) |  ✅ Allowed (Members only)  |       ❌ Forbidden        |
| **Update Team Settings**    |        ✅ Allowed        |        ❌ Forbidden         |       ❌ Forbidden        |
| **Delete Team**             |        ✅ Allowed        |        ❌ Forbidden         |       ❌ Forbidden        |

### 5. Team Audit Trail & Activity Log (Bonus)

- Dedicated **Activity Log** tab on the team workspace displaying an audit trail of:
  - Task creation, updates, and deletions
  - Member additions and removals
  - Role promotions and demotions

---

## 📋 Self-Assessment Checklist

| ID             | Feature / Requirement                      |    Status    | Notes                                                                                       |
| :------------- | :----------------------------------------- | :----------: | :------------------------------------------------------------------------------------------ |
| **CHAT-01**    | Team chat room with message history        | ✅ Completed | `GET /api/teams/:id/messages` loads history, rendered in chat panel                         |
| **CHAT-02**    | Message persistence in database            | ✅ Completed | Stored in PostgreSQL `messages` table with sender relation                                  |
| **CHAT-03**    | Real-time chat message delivery            | ✅ Completed | WebSocket broadcast via Pusher (`chat:new-message`) without refresh                         |
| **CHAT-04**    | Chat typing indicator (Bonus)              | ✅ Completed | Shows "Alice is typing..." using Pusher presence channel                                    |
| **CHAT-05**    | Online/offline presence in chat (Bonus)    | ✅ Completed | Active online member counter via Pusher Presence                                            |
| **CHAT-06**    | File/image attachments in chat (Bonus)     | ✅ Completed | Supports image preview and attachment links                                                 |
| **TASK-RT-01** | Live task board updates (Kanban sync)      | ✅ Completed | Tasks update live across all open sessions (`task:updated`, `task:created`, `task:deleted`) |
| **NOTIF-01**   | Notification when assigned a task          | ✅ Completed | Triggers in-app notification & real-time toast to assignee                                  |
| **NOTIF-02**   | Notification when added to a team          | ✅ Completed | Triggers notification when invited by email                                                 |
| **NOTIF-03**   | Notification bell with unread badge        | ✅ Completed | Interactive bell dropdown in Navbar with unread count                                       |
| **NOTIF-04**   | Mark notification as read                  | ✅ Completed | Single mark-as-read and "Mark all as read" API endpoints                                    |
| **NOTIF-05**   | Browser push notifications (Bonus)         | ✅ Completed | Web Notification API permission request & browser notifications                             |
| **RBAC-01**    | 3-tier Role system (Owner, Admin, Member)  | ✅ Completed | Prisma enum & centralized `permissions.ts` helper                                           |
| **RBAC-02**    | Owner full control & delete team           | ✅ Completed | Owner can delete team, manage all roles & tasks                                             |
| **RBAC-03**    | Admin task/member control (no team delete) | ✅ Completed | Admin can manage tasks & members, cannot delete team                                        |
| **RBAC-04**    | Member self-management & view permissions  | ✅ Completed | Member can only delete own tasks, cannot manage members                                     |
| **RBAC-05**    | Server-side enforcement (API 403 checks)   | ✅ Completed | All Route Handlers verify roles before executing mutations                                  |
| **RBAC-06**    | UI role controls & visual distinction      | ✅ Completed | Distinct badges (Gold/Purple/Blue), role change dropdown for Owner/Admin                    |
| **AUDIT-01**   | Team Activity Log / Audit Trail (Bonus)    | ✅ Completed | Timeline of team actions in `TeamActivityLog` tab                                           |
| **TEST-01**    | Pre-verified accounts on the SAME team     | ✅ Completed | Account 1 (Owner) & Account 2 (Admin) on `TaskPulse Core Platform`                          |
| **DEPLOY-01**  | Continuous Vercel deployment               | ✅ Completed | Next.js App Router deployed on Vercel with Pusher & Supabase                                |
