import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";
import { updateTaskSchema } from "@/lib/validations/task";
import { TaskPriority, TaskStatus } from "@prisma/client";
import {
  successResponse,
  errorResponse,
  unauthorizedResponse,
  forbiddenResponse,
  notFoundResponse,
  validationErrorResponse,
  internalErrorResponse,
} from "@/lib/api-response";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/tasks/:id - Retrieve a single task by ID
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    const task = await prisma.task.findUnique({
      where: { id },
      include: {
        assignee: {
          select: { id: true, name: true, email: true },
        },
        creator: {
          select: { id: true, name: true, email: true },
        },
        team: {
          select: { id: true, name: true, ownerId: true },
        },
      },
    });

    if (!task) {
      return notFoundResponse("Task");
    }

    return successResponse(task);
  } catch (error) {
    console.error("GET /api/tasks/:id Error:", error);
    return internalErrorResponse();
  }
}

// PUT /api/tasks/:id - Update an existing task (team members can update details, status, priority, assignee)
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const auth = await getAuthUser(request);
    if (!auth) {
      return unauthorizedResponse("Authentication required to update task");
    }

    const { id } = await params;

    const existingTask = await prisma.task.findUnique({
      where: { id },
      include: {
        team: {
          include: {
            members: {
              where: { userId: auth.id },
            },
          },
        },
      },
    });

    if (!existingTask) {
      return notFoundResponse("Task");
    }

    // If task belongs to a team, user must be a member of the team
    if (existingTask.teamId && existingTask.team) {
      const isMember = existingTask.team.members.length > 0;
      if (!isMember) {
        return forbiddenResponse("You must be a member of the team to update this task");
      }
    }

    const body = await request.json();
    const validation = updateTaskSchema.safeParse(body);

    if (!validation.success) {
      return validationErrorResponse(validation.error.flatten().fieldErrors);
    }

    const { title, description, status, priority, dueDate, assigneeId } = validation.data;

    // If new assigneeId is provided, check if assignee is a member of the team
    if (assigneeId && existingTask.teamId) {
      const assigneeMembership = await prisma.teamMember.findUnique({
        where: {
          teamId_userId: {
            teamId: existingTask.teamId,
            userId: assigneeId,
          },
        },
      });

      if (!assigneeMembership) {
        return errorResponse("The assigned user is not a member of this team", 400);
      }
    }

    const updateData: {
      title?: string;
      description?: string | null;
      status?: TaskStatus;
      priority?: TaskPriority;
      dueDate?: Date | null;
      assigneeId?: string | null;
    } = {};

    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description || null;
    if (status !== undefined) updateData.status = status as TaskStatus;
    if (priority !== undefined) updateData.priority = priority as TaskPriority;
    if (dueDate !== undefined) updateData.dueDate = dueDate ? new Date(dueDate) : null;
    if (assigneeId !== undefined) updateData.assigneeId = assigneeId || null;

    const updatedTask = await prisma.task.update({
      where: { id },
      data: updateData,
      include: {
        assignee: {
          select: { id: true, name: true, email: true },
        },
        creator: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    return successResponse(updatedTask);
  } catch (error) {
    console.error("PUT /api/tasks/:id Error:", error);
    return internalErrorResponse();
  }
}

// DELETE /api/tasks/:id - Delete a task
// RBAC Requirement: "Only the task creator, the assignee, or the team Owner can delete a task."
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const auth = await getAuthUser(request);
    if (!auth) {
      return unauthorizedResponse("Authentication required to delete task");
    }

    const { id } = await params;

    const existingTask = await prisma.task.findUnique({
      where: { id },
      include: {
        team: {
          select: { ownerId: true },
        },
      },
    });

    if (!existingTask) {
      return notFoundResponse("Task");
    }

    // Role-based authorization check:
    const isCreator = existingTask.creatorId === auth.id;
    const isAssignee = existingTask.assigneeId === auth.id;
    const isTeamOwner = existingTask.team?.ownerId === auth.id;

    if (!isCreator && !isAssignee && !isTeamOwner) {
      return forbiddenResponse(
        "Permission denied: Only the task creator, assignee, or team Owner can delete this task"
      );
    }

    await prisma.task.delete({
      where: { id },
    });

    return successResponse({
      message: "Task deleted successfully",
      deletedId: id,
    });
  } catch (error) {
    console.error("DELETE /api/tasks/:id Error:", error);
    return internalErrorResponse();
  }
}
