import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { createTaskSchema } from "@/lib/validations/task";
import { TaskPriority, TaskStatus } from "@prisma/client";
import {
  successResponse,
  validationErrorResponse,
  internalErrorResponse,
} from "@/lib/api-response";
import { applyApiMiddleware, applyMiddlewareHeaders } from "@/lib/api-middleware";
import { getAuthUser } from "@/lib/auth";

// GET /api/tasks - Retrieve all tasks with optional filtering & search
export async function GET(request: NextRequest) {
  const middlewareResult = await applyApiMiddleware(request, {
    rateLimit: { windowMs: 60 * 1000, maxRequests: 100 },
    cors: { enabled: true, origin: "*", methods: ["GET", "POST", "PUT", "DELETE"] },
  });

  if (!middlewareResult.success) return middlewareResult.response!;

  try {
    const { searchParams } = new URL(request.url);
    const statusParam = searchParams.get("status");
    const priorityParam = searchParams.get("priority");
    const searchParam = searchParams.get("search");

    const where: {
      status?: TaskStatus;
      priority?: TaskPriority;
      OR?: Array<{
        title?: { contains: string; mode: "insensitive" };
        description?: { contains: string; mode: "insensitive" };
      }>;
    } = {};

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

    if (searchParam && searchParam.trim().length > 0) {
      where.OR = [
        { title: { contains: searchParam.trim(), mode: "insensitive" } },
        { description: { contains: searchParam.trim(), mode: "insensitive" } },
      ];
    }

    const tasks = await prisma.task.findMany({
      where,
      include: {
        assignee: {
          select: { id: true, name: true, email: true },
        },
        creator: {
          select: { id: true, name: true, email: true },
        },
        team: {
          select: { id: true, name: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const response = successResponse({ tasks, count: tasks.length });
    if (middlewareResult.headers) {
      return applyMiddlewareHeaders(response, middlewareResult.headers);
    }
    return response;
  } catch {
    return internalErrorResponse();
  }
}

// POST /api/tasks - Create a new task
export async function POST(request: NextRequest) {
  const middlewareResult = await applyApiMiddleware(request, {
    rateLimit: { windowMs: 60 * 1000, maxRequests: 50 },
    cors: { enabled: true, origin: "*", methods: ["GET", "POST", "PUT", "DELETE"] },
  });

  if (!middlewareResult.success) return middlewareResult.response!;

  try {
    const auth = await getAuthUser(request);
    const body = await request.json();

    const validation = createTaskSchema.safeParse(body);
    if (!validation.success) {
      const fieldErrors = validation.error.flatten().fieldErrors;
      return validationErrorResponse(fieldErrors);
    }

    const { title, description, status, priority, dueDate, assigneeId } = validation.data;

    const newTask = await prisma.task.create({
      data: {
        title,
        description: description || null,
        status: status as TaskStatus,
        priority: priority as TaskPriority,
        dueDate: dueDate ? new Date(dueDate) : null,
        assigneeId: assigneeId || null,
        creatorId: auth?.id || null,
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

    const response = successResponse(newTask, 201);
    if (middlewareResult.headers) {
      return applyMiddlewareHeaders(response, middlewareResult.headers);
    }
    return response;
  } catch {
    return internalErrorResponse();
  }
}
