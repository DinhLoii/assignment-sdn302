import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { updateTaskSchema } from "@/lib/validations/task";
import { TaskPriority, TaskStatus } from "@prisma/client";
import {
  successResponse,
  errorResponse,
  validationErrorResponse,
  notFoundResponse,
  internalErrorResponse,
} from "@/lib/api-response";
import { applyApiMiddleware, applyMiddlewareHeaders } from "@/lib/api-middleware";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/tasks/:id - Retrieve a single task by ID
export async function GET(request: NextRequest, { params }: RouteParams) {
  const middlewareResult = await applyApiMiddleware(request, {
    rateLimit: { windowMs: 60 * 1000, maxRequests: 100 },
    cors: { enabled: true, origin: "*", methods: ["GET", "POST", "PUT", "DELETE"] },
  });

  if (!middlewareResult.success) return middlewareResult.response!;

  try {
    const { id } = await params;

    const task = await prisma.task.findUnique({
      where: { id },
    });

    if (!task) {
      return notFoundResponse("Task");
    }

    const response = successResponse(task);
    if (middlewareResult.headers) {
      return applyMiddlewareHeaders(response, middlewareResult.headers);
    }
    return response;
  } catch (error) {
    return internalErrorResponse();
  }
}

// PUT /api/tasks/:id - Update an existing task
export async function PUT(request: NextRequest, { params }: RouteParams) {
  const middlewareResult = await applyApiMiddleware(request, {
    rateLimit: { windowMs: 60 * 1000, maxRequests: 50 },
    cors: { enabled: true, origin: "*", methods: ["GET", "POST", "PUT", "DELETE"] },
  });

  if (!middlewareResult.success) return middlewareResult.response!;

  try {
    const { id } = await params;

    const existingTask = await prisma.task.findUnique({
      where: { id },
    });

    if (!existingTask) {
      return notFoundResponse("Task");
    }

    const body = await request.json();

    const validation = updateTaskSchema.safeParse(body);
    if (!validation.success) {
      const fieldErrors = validation.error.flatten().fieldErrors;
      return validationErrorResponse(fieldErrors);
    }

    const { title, description, status, priority, dueDate } = validation.data;

    const updateData: {
      title?: string;
      description?: string | null;
      status?: TaskStatus;
      priority?: TaskPriority;
      dueDate?: Date | null;
    } = {};

    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description || null;
    if (status !== undefined) updateData.status = status as TaskStatus;
    if (priority !== undefined) updateData.priority = priority as TaskPriority;
    if (dueDate !== undefined) updateData.dueDate = dueDate ? new Date(dueDate) : null;

    const updatedTask = await prisma.task.update({
      where: { id },
      data: updateData,
    });

    const response = successResponse(updatedTask);
    if (middlewareResult.headers) {
      return applyMiddlewareHeaders(response, middlewareResult.headers);
    }
    return response;
  } catch (error) {
    return internalErrorResponse();
  }
}

// DELETE /api/tasks/:id - Delete a task by ID
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const middlewareResult = await applyApiMiddleware(request, {
    rateLimit: { windowMs: 60 * 1000, maxRequests: 30 },
    cors: { enabled: true, origin: "*", methods: ["GET", "POST", "PUT", "DELETE"] },
  });

  if (!middlewareResult.success) return middlewareResult.response!;

  try {
    const { id } = await params;

    const existingTask = await prisma.task.findUnique({
      where: { id },
    });

    if (!existingTask) {
      return notFoundResponse("Task");
    }

    await prisma.task.delete({
      where: { id },
    });

    const response = successResponse({ deletedId: id });
    if (middlewareResult.headers) {
      return applyMiddlewareHeaders(response, middlewareResult.headers);
    }
    return response;
  } catch (error) {
    return internalErrorResponse();
  }
}
