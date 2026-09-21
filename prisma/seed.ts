import { PrismaClient, TaskStatus, TaskPriority, TeamRole } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting database seeding...");

  // 1. Create Demo User
  const demoUser = await prisma.user.upsert({
    where: { email: "alex.johnson@example.com" },
    update: {},
    create: {
      name: "Alex Johnson",
      email: "alex.johnson@example.com",
      password: "hashed_password_demo123", // placeholder for Assignment 1
    },
  });
  console.log("✓ Created demo user:", demoUser.email);

  // 2. Create Demo Team
  let demoTeam = await prisma.team.findFirst({
    where: { name: "Core Engineering Team" },
  });

  if (!demoTeam) {
    demoTeam = await prisma.team.create({
      data: {
        name: "Core Engineering Team",
        description: "Responsible for core platform architecture, APIs, and infrastructure.",
        ownerId: demoUser.id,
      },
    });
    console.log("✓ Created demo team:", demoTeam.name);

    // 3. Add Member to Team
    await prisma.teamMember.create({
      data: {
        teamId: demoTeam.id,
        userId: demoUser.id,
        role: TeamRole.ADMIN,
      },
    });
    console.log("✓ Added demo user as team admin");
  }

  // 4. Create Initial Sample Tasks
  const sampleTasks = [
    {
      title: "Design System Architecture & Setup Next.js 15",
      description: "Initialize the project repository with App Router, TypeScript, Tailwind CSS, and Prisma 7 ORM.",
      status: TaskStatus.DONE,
      priority: TaskPriority.HIGH,
      dueDate: new Date(Date.now() - 24 * 60 * 60 * 1000), // yesterday
    },
    {
      title: "Configure Supabase Cloud PostgreSQL Database",
      description: "Provision a free PostgreSQL database on Supabase, configure connection pooler (6543) and direct connection (5432).",
      status: TaskStatus.DONE,
      priority: TaskPriority.HIGH,
      dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // in 2 days
    },
    {
      title: "Implement RESTful Task CRUD API Route Handlers",
      description: "Build Next.js 15 Route Handlers for GET, POST, PUT, DELETE /api/tasks with Zod schema validation.",
      status: TaskStatus.IN_PROGRESS,
      priority: TaskPriority.HIGH,
      dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    },
    {
      title: "Build Responsive Homepage with Task Management UI",
      description: "Create hero header, task stats counter, status filter tabs, search bar, and interactive creation/editing modals.",
      status: TaskStatus.IN_PROGRESS,
      priority: TaskPriority.MEDIUM,
      dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    },
    {
      title: "Deploy Application to Vercel & Configure Production Secrets",
      description: "Link GitHub repository to Vercel, set up DATABASE_URL and DIRECT_URL environment variables, and test live deployment.",
      status: TaskStatus.TODO,
      priority: TaskPriority.MEDIUM,
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
    {
      title: "Draft Assignment 2 Team Collaboration Architecture",
      description: "Plan upcoming features including user authentication, team invite codes, role permissions, and assigned tasks.",
      status: TaskStatus.TODO,
      priority: TaskPriority.LOW,
      dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
    },
  ];

  for (const taskData of sampleTasks) {
    const existing = await prisma.task.findFirst({
      where: { title: taskData.title },
    });

    if (!existing) {
      await prisma.task.create({
        data: {
          ...taskData,
          teamId: demoTeam?.id,
          assigneeId: demoUser.id,
        },
      });
    }
  }

  console.log(`✓ Seeded sample tasks successfully!`);
}

main()
  .catch((e) => {
    console.error("❌ Error during database seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
