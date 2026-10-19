import { PrismaClient, TaskStatus, TaskPriority, TeamRole } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import bcrypt from "bcryptjs";

const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Starting database seeding for Assignment 3 & 4...");

  const salt = await bcrypt.genSalt(10);
  const defaultPasswordHash = await bcrypt.hash("Password123!", salt);

  // 1. Create Grader Test Account 1 (Owner)
  const testUser = await prisma.user.upsert({
    where: { email: "test@example.com" },
    update: {
      password: defaultPasswordHash,
    },
    create: {
      name: "Demo Evaluator (Owner)",
      email: "test@example.com",
      password: defaultPasswordHash,
    },
  });
  console.log("✓ Grader Test User 1 created/ready:", testUser.email);

  // 2. Create Grader Test Account 2 (Admin - Same Team for multi-session real-time testing)
  const aliceUser = await prisma.user.upsert({
    where: { email: "alice@example.com" },
    update: {
      password: defaultPasswordHash,
    },
    create: {
      name: "Alice Chen (Admin)",
      email: "alice@example.com",
      password: defaultPasswordHash,
    },
  });
  console.log("✓ Grader Test User 2 created/ready:", aliceUser.email);

  // 3. Create Colleague Account 3 (Member)
  const bobUser = await prisma.user.upsert({
    where: { email: "bob@example.com" },
    update: {
      password: defaultPasswordHash,
    },
    create: {
      name: "Bob Williams (Member)",
      email: "bob@example.com",
      password: defaultPasswordHash,
    },
  });
  console.log("✓ Colleague User 3 created/ready:", bobUser.email);

  // 4. Create Team 1: "TaskPulse Core Platform" (Primary Testing Team)
  let team1 = await prisma.team.findFirst({
    where: { name: "TaskPulse Core Platform" },
  });

  if (!team1) {
    team1 = await prisma.team.create({
      data: {
        name: "TaskPulse Core Platform",
        description:
          "Primary engineering workspace with real-time WebSockets, live chat, and advanced RBAC.",
        ownerId: testUser.id,
      },
    });
    console.log("✓ Created team 1:", team1.name);
  }

  // Ensure members for Team 1: TestUser = OWNER, Alice = ADMIN, Bob = MEMBER
  await prisma.teamMember.upsert({
    where: { teamId_userId: { teamId: team1.id, userId: testUser.id } },
    update: { role: TeamRole.OWNER },
    create: { teamId: team1.id, userId: testUser.id, role: TeamRole.OWNER },
  });

  await prisma.teamMember.upsert({
    where: { teamId_userId: { teamId: team1.id, userId: aliceUser.id } },
    update: { role: TeamRole.ADMIN },
    create: { teamId: team1.id, userId: aliceUser.id, role: TeamRole.ADMIN },
  });

  await prisma.teamMember.upsert({
    where: { teamId_userId: { teamId: team1.id, userId: bobUser.id } },
    update: { role: TeamRole.MEMBER },
    create: { teamId: team1.id, userId: bobUser.id, role: TeamRole.MEMBER },
  });

  // 5. Create Team 2: "Design & UX Innovations"
  let team2 = await prisma.team.findFirst({
    where: { name: "Design & UX Innovations" },
  });

  if (!team2) {
    team2 = await prisma.team.create({
      data: {
        name: "Design & UX Innovations",
        description: "Product design system, UI components, and user experience research.",
        ownerId: aliceUser.id,
      },
    });
    console.log("✓ Created team 2:", team2.name);
  }

  await prisma.teamMember.upsert({
    where: { teamId_userId: { teamId: team2.id, userId: aliceUser.id } },
    update: { role: TeamRole.OWNER },
    create: { teamId: team2.id, userId: aliceUser.id, role: TeamRole.OWNER },
  });

  await prisma.teamMember.upsert({
    where: { teamId_userId: { teamId: team2.id, userId: testUser.id } },
    update: { role: TeamRole.MEMBER },
    create: { teamId: team2.id, userId: testUser.id, role: TeamRole.MEMBER },
  });

  // 6. Seed Tasks for Team 1
  const team1Tasks = [
    {
      title: "Real-time Team Chat with Message Persistence",
      description: "Enable WebSockets with Pusher for real-time delivery and database persistence.",
      status: TaskStatus.DONE,
      priority: TaskPriority.HIGH,
      dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
      assigneeId: testUser.id,
      creatorId: testUser.id,
    },
    {
      title: "Live Task Board Kanban Sync Across Sessions",
      description:
        "Synchronize task drag-and-drop, creation, edits, and deletions live across multiple browser windows.",
      status: TaskStatus.IN_PROGRESS,
      priority: TaskPriority.HIGH,
      dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      assigneeId: aliceUser.id,
      creatorId: testUser.id,
    },
    {
      title: "In-App Notification Bell & Badge Counter",
      description:
        "Notify team members when assigned to tasks or added to teams with mark-as-read controls.",
      status: TaskStatus.IN_PROGRESS,
      priority: TaskPriority.MEDIUM,
      dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      assigneeId: bobUser.id,
      creatorId: aliceUser.id,
    },
    {
      title: "Advanced 3-Tier RBAC (Owner, Admin, Member)",
      description:
        "Strictly enforce permission hierarchy on both server Route Handlers and UI controls.",
      status: TaskStatus.TODO,
      priority: TaskPriority.HIGH,
      dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      assigneeId: testUser.id,
      creatorId: testUser.id,
    },
  ];

  for (const t of team1Tasks) {
    const existing = await prisma.task.findFirst({
      where: { title: t.title, teamId: team1.id },
    });
    if (!existing) {
      await prisma.task.create({
        data: {
          ...t,
          teamId: team1.id,
        },
      });
    }
  }

  // 7. Seed Initial Chat Messages for Team 1
  const initialMessages = [
    {
      content:
        "Welcome to the TaskPulse Core Platform chat room! Real-time messaging is now active.",
      senderId: testUser.id,
      createdAt: new Date(Date.now() - 30 * 60 * 1000),
    },
    {
      content: "Hello team! I'm testing the real-time sync between Account 1 and Account 2.",
      senderId: aliceUser.id,
      createdAt: new Date(Date.now() - 20 * 60 * 1000),
    },
    {
      content:
        "Awesome! You can test moving tasks on the Kanban board or sending messages in two browser windows simultaneously.",
      senderId: testUser.id,
      createdAt: new Date(Date.now() - 10 * 60 * 1000),
    },
  ];

  for (const m of initialMessages) {
    const exists = await prisma.message.findFirst({
      where: { content: m.content, teamId: team1.id },
    });
    if (!exists) {
      await prisma.message.create({
        data: {
          ...m,
          teamId: team1.id,
        },
      });
    }
  }

  // 8. Seed Initial Notifications
  const initialNotifications = [
    {
      userId: testUser.id,
      title: "Welcome to Assignment 3 & 4",
      message:
        "Real-time collaboration, team chat, and notifications are now ready for evaluation.",
      type: "SYSTEM",
      link: `/teams/${team1.id}`,
      isRead: false,
    },
    {
      userId: aliceUser.id,
      title: "Promoted to Team Admin",
      message: `You were promoted to Admin in "${team1.name}" by ${testUser.name}.`,
      type: "ROLE_UPDATED",
      link: `/teams/${team1.id}`,
      isRead: false,
    },
    {
      userId: aliceUser.id,
      title: "Task Assigned to You",
      message: `You were assigned to task "Live Task Board Kanban Sync Across Sessions".`,
      type: "TASK_ASSIGNED",
      link: `/teams/${team1.id}`,
      isRead: false,
    },
  ];

  for (const n of initialNotifications) {
    const exists = await prisma.notification.findFirst({
      where: { userId: n.userId, title: n.title },
    });
    if (!exists) {
      await prisma.notification.create({ data: n });
    }
  }

  // 9. Seed Activity Logs
  const initialLogs = [
    {
      teamId: team1.id,
      userId: testUser.id,
      action: "ROLE_UPDATED",
      details: "promoted Alice Chen to Admin",
      createdAt: new Date(Date.now() - 40 * 60 * 1000),
    },
    {
      teamId: team1.id,
      userId: testUser.id,
      action: "TASK_CREATED",
      details: 'created task "Real-time Team Chat with Message Persistence"',
      createdAt: new Date(Date.now() - 35 * 60 * 1000),
    },
    {
      teamId: team1.id,
      userId: aliceUser.id,
      action: "TASK_UPDATED",
      details: 'moved task "Live Task Board Kanban Sync Across Sessions" to IN PROGRESS',
      createdAt: new Date(Date.now() - 15 * 60 * 1000),
    },
  ];

  for (const l of initialLogs) {
    const exists = await prisma.activityLog.findFirst({
      where: { teamId: l.teamId, action: l.action, details: l.details },
    });
    if (!exists) {
      await prisma.activityLog.create({ data: l });
    }
  }

  console.log("✅ Database seeding for Assignment 3 & 4 completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Error during database seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
