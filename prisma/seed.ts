import { PrismaClient, TaskStatus, TaskPriority, TeamRole } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import bcrypt from "bcryptjs";

const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Starting database seeding for Assignment 2...");

  const salt = await bcrypt.genSalt(10);
  const defaultPasswordHash = await bcrypt.hash("Password123!", salt);

  // 1. Create Grader Test Account
  const testUser = await prisma.user.upsert({
    where: { email: "test@example.com" },
    update: {
      password: defaultPasswordHash,
    },
    create: {
      name: "Demo Evaluator",
      email: "test@example.com",
      password: defaultPasswordHash,
    },
  });
  console.log("✓ Grader Test User created/ready:", testUser.email);

  // 2. Create Colleague Account
  const aliceUser = await prisma.user.upsert({
    where: { email: "alice@example.com" },
    update: {
      password: defaultPasswordHash,
    },
    create: {
      name: "Alice Chen",
      email: "alice@example.com",
      password: defaultPasswordHash,
    },
  });
  console.log("✓ Colleague User created/ready:", aliceUser.email);

  // 3. Create Team 1: Owned by Test User
  let team1 = await prisma.team.findFirst({
    where: { name: "TaskPulse Core Platform" },
  });

  if (!team1) {
    team1 = await prisma.team.create({
      data: {
        name: "TaskPulse Core Platform",
        description:
          "Primary engineering workspace for backend APIs, auth, and database architecture.",
        ownerId: testUser.id,
      },
    });
    console.log("✓ Created team 1:", team1.name);
  }

  // Ensure members for Team 1
  await prisma.teamMember.upsert({
    where: { teamId_userId: { teamId: team1.id, userId: testUser.id } },
    update: { role: TeamRole.OWNER },
    create: { teamId: team1.id, userId: testUser.id, role: TeamRole.OWNER },
  });

  await prisma.teamMember.upsert({
    where: { teamId_userId: { teamId: team1.id, userId: aliceUser.id } },
    update: { role: TeamRole.MEMBER },
    create: { teamId: team1.id, userId: aliceUser.id, role: TeamRole.MEMBER },
  });

  // 4. Create Team 2: Owned by Alice, Test User is a Member
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

  // Ensure members for Team 2
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

  // 5. Seed Tasks for Team 1
  const team1Tasks = [
    {
      title: "Set up JWT Authentication & Route Guards",
      description:
        "Implement secure HTTP-only cookie JWT tokens with bcryptjs password hashing and role validation.",
      status: TaskStatus.DONE,
      priority: TaskPriority.HIGH,
      dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
      assigneeId: testUser.id,
      creatorId: testUser.id,
    },
    {
      title: "Build Kanban Board with Drag & Drop",
      description:
        "Allow team members to drag tasks across To Do, In Progress, and Done columns with smooth animation.",
      status: TaskStatus.IN_PROGRESS,
      priority: TaskPriority.HIGH,
      dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      assigneeId: aliceUser.id,
      creatorId: testUser.id,
    },
    {
      title: "Implement Team Member Invitation by Email",
      description:
        "Owners can add members to team by existing email with immediate access and role assignment.",
      status: TaskStatus.IN_PROGRESS,
      priority: TaskPriority.MEDIUM,
      dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      assigneeId: testUser.id,
      creatorId: testUser.id,
    },
    {
      title: "Optimize Task Filtering and Search Query",
      description:
        "Enable fast client and server-side filtering by status, priority, and assignee.",
      status: TaskStatus.TODO,
      priority: TaskPriority.LOW,
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      assigneeId: aliceUser.id,
      creatorId: aliceUser.id,
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

  // 6. Seed Tasks for Team 2
  const team2Tasks = [
    {
      title: "Create Glassmorphic Color Palette Tokens",
      description:
        "Define modern slate, indigo, and violet accents tailored for dark and light modes.",
      status: TaskStatus.DONE,
      priority: TaskPriority.MEDIUM,
      dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      assigneeId: aliceUser.id,
      creatorId: aliceUser.id,
    },
    {
      title: "Audit UI Accessibility & Contrast Ratios",
      description: "Ensure all status and priority badges satisfy WCAG AAA contrast guidelines.",
      status: TaskStatus.TODO,
      priority: TaskPriority.MEDIUM,
      dueDate: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000),
      assigneeId: testUser.id,
      creatorId: aliceUser.id,
    },
  ];

  for (const t of team2Tasks) {
    const existing = await prisma.task.findFirst({
      where: { title: t.title, teamId: team2.id },
    });
    if (!existing) {
      await prisma.task.create({
        data: {
          ...t,
          teamId: team2.id,
        },
      });
    }
  }

  console.log("✅ Database seeding completed successfully!");
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
