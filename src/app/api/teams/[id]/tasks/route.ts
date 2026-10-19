import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";
import { createTaskSchema } from "@/lib/validations/task";
import { TaskPriority, TaskStatus } from "@prisma/client";
import { triggerRealtimeEvent } from "@/lib/pusher";
import {
  successResponse,
  errorResponse,
  unauthorizedResponse,
  forbiddenResponse,
  validationErrorResponse,
  internalErrorResponse,
} from "@/lib/api-response";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/teams/:id/tasks - List tasks for a team with filtering, searching, and pagination
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const auth = await getAuthUser(request);
    if (!auth) {
      return unauthorizedResponse("Authentication required");
    }

    const { id: teamId } = await params;

    // Check membership
    const membership = await prisma.teamMember.findUnique({
      where: {
        teamId_userId: {
          teamId,
          userId: auth.id,
        },
      },
    });

    if (!membership) {
      return forbiddenResponse("You are not a member of this team");
    }

    const { searchParams } = new URL(request.url);
    const statusParam = searchParams.get("status");
    const priorityParam = searchParams.get("priority");
    const assigneeParam = searchParams.get("assigneeId");
    const searchParam = searchParams.get("search");
    const pageParam = parseInt(searchParams.get("page") || "1", 10);
    const limitParam = parseInt(searchParams.get("limit") || "100", 10);

    const where: {
      teamId: string;
      status?: TaskStatus;
      priority?: TaskPriority;
      assigneeId?: string;
      OR?: Array<{
        title?: { contains: string; mode: "insensitive" };
        description?: { contains: string; mode: "insensitive" };
      }>;
    } = {
      teamId,
    };

    if (
      statusParam &&
      statusParam !== "ALL" &&
      Object.values(TaskStatus).includes(statusParam as TaskStatus)
    ) {
      where.status = statusParam as TaskStatus;
    }

    if (
      priorityParam &&
      priorityParam !== "ALL" &&
      Object.values(TaskPriority).includes(priorityParam as TaskPriority)
    ) {
      where.priority = priorityParam as TaskPriority;
    }

    if (assigneeParam && assigneeParam !== "ALL") {
      where.assigneeId = assigneeParam;
    }

    if (searchParam && searchParam.trim().length > 0) {
      where.OR = [
        { title: { contains: searchParam.trim(), mode: "insensitive" } },
        { description: { contains: searchParam.trim(), mode: "insensitive" } },
      ];
    }

    const totalCount = await prisma.task.count({ where });

    const tasks = await prisma.task.findMany({
      where,
      include: {
        assignee: {
          select: { id: true, name: true, email: true },
        },
        creator: {
          select: { id: true, name: true, email: true },
        },
      },
      orderBy: { createdAt: "desc" },
      skip: Math.max(0, (pageParam - 1) * limitParam),
      take: limitParam,
    });

    return successResponse({
      tasks,
      pagination: {
        total: totalCount,
        page: pageParam,
        limit: limitParam,
        totalPages: Math.ceil(totalCount / limitParam) || 1,
      },
    });
  } catch (error) {
    console.error("GET /api/teams/:id/tasks Error:", error);
    return internalErrorResponse();
  }
}

// POST /api/teams/:id/tasks - Create a new task in a team
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const auth = await getAuthUser(request);
    if (!auth) {
      return unauthorizedResponse("Authentication required");
    }

    const { id: teamId } = await params;

    const team = await prisma.team.findUnique({
      where: { id: teamId },
      include: {
        members: {
          where: { userId: auth.id },
        },
      },
    });

    if (!team) {
      return errorResponse("Team not found", 404);
    }

    const membership = team.members[0];
    if (!membership) {
      return forbiddenResponse("You must be a member of this team to create tasks");
    }

    const body = await request.json();
    const validation = createTaskSchema.safeParse(body);

    if (!validation.success) {
      return validationErrorResponse(validation.error.flatten().fieldErrors);
    }

    const { title, description, status, priority, dueDate, assigneeId } = validation.data;

    // If assigneeId is provided, verify they are in this team
    if (assigneeId) {
      const assigneeMembership = await prisma.teamMember.findUnique({
        where: {
          teamId_userId: {
            teamId,
            userId: assigneeId,
          },
        },
      });

      if (!assigneeMembership) {
        return errorResponse("The assigned user is not a member of this team", 400);
      }
    }

    const newTask = await prisma.task.create({
      data: {
        title,
        description: description || null,
        status: status as TaskStatus,
        priority: priority as TaskPriority,
        dueDate: dueDate ? new Date(dueDate) : null,
        teamId,
        assigneeId: assigneeId || null,
        creatorId: auth.id,
      },
      include: {
        assignee: {
          select: { id: true, name: true, email: true },
        },
        creator: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    // 1. In-app notification for the assignee (if assigned to someone else)
    if (assigneeId && assigneeId !== auth.id) {
      const notification = await prisma.notification.create({
        data: {
          userId: assigneeId,
          title: "New Task Assigned",
          message: `You were assigned to task "${title}" in "${team.name}" by ${auth.name}.`,
          type: "TASK_ASSIGNED",
          link: `/teams/${teamId}`,
        },
      });
      await triggerRealtimeEvent(`user-${assigneeId}`, "notification:new", notification);
    }

    // 2. Activity Log
    await prisma.activityLog.create({
      data: {
        teamId,
        userId: auth.id,
        action: "TASK_CREATED",
        details: `created task "${title}"`,
      },
    });

    // 3. Real-time broadcast to team
    await triggerRealtimeEvent(
      [`team-${teamId}`, `presence-team-${teamId}`],
      "task:created",
      newTask
    );

    return successResponse(newTask, 201);
  } catch (error) {
    console.error("POST /api/teams/:id/tasks Error:", error);
    return internalErrorResponse();
  }
}
