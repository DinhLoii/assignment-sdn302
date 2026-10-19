import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";
import { updateTaskSchema } from "@/lib/validations/task";
import { TaskPriority, TaskStatus, TeamRole } from "@prisma/client";
import { triggerRealtimeEvent } from "@/lib/pusher";
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

// PUT /api/tasks/:id - Update an existing task
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

    // Must be a member of the team
    if (existingTask.teamId && existingTask.team) {
      const membership = existingTask.team.members[0];
      if (!membership) {
        return forbiddenResponse("You must be a member of the team to update this task");
      }
    }

    const body = await request.json();
    const validation = updateTaskSchema.safeParse(body);

    if (!validation.success) {
      return validationErrorResponse(validation.error.flatten().fieldErrors);
    }

    const { title, description, status, priority, dueDate, assigneeId } = validation.data;

    // Verify assignee membership if changed
    if (assigneeId && existingTask.teamId && assigneeId !== existingTask.assigneeId) {
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

    const teamId = existingTask.teamId;

    if (teamId) {
      // 1. Notify new assignee if changed
      if (assigneeId && assigneeId !== existingTask.assigneeId && assigneeId !== auth.id) {
        const notification = await prisma.notification.create({
          data: {
            userId: assigneeId,
            title: "Task Assigned to You",
            message: `You were assigned to task "${updatedTask.title}" by ${auth.name}.`,
            type: "TASK_ASSIGNED",
            link: `/teams/${teamId}`,
          },
        });
        await triggerRealtimeEvent(`user-${assigneeId}`, "notification:new", notification);
      }

      // 2. Activity Log
      let actionDetail = `updated task "${updatedTask.title}"`;
      if (status !== undefined && status !== existingTask.status) {
        actionDetail = `moved task "${updatedTask.title}" to ${status.replace("_", " ")}`;
      }
      await prisma.activityLog.create({
        data: {
          teamId,
          userId: auth.id,
          action: "TASK_UPDATED",
          details: actionDetail,
        },
      });

      // 3. Real-time broadcast to team
      await triggerRealtimeEvent(
        [`team-${teamId}`, `presence-team-${teamId}`],
        "task:updated",
        updatedTask
      );
    }

    return successResponse(updatedTask);
  } catch (error) {
    console.error("PUT /api/tasks/:id Error:", error);
    return internalErrorResponse();
  }
}

// DELETE /api/tasks/:id - Delete a task
// RBAC: Owner and Admin can delete any task. Member can only delete tasks they created.
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

    const teamId = existingTask.teamId;
    const userMembership = existingTask.team?.members[0];
    const isOwner =
      existingTask.team?.ownerId === auth.id || userMembership?.role === TeamRole.OWNER;
    const isAdmin = userMembership?.role === TeamRole.ADMIN;
    const isCreator = existingTask.creatorId === auth.id;

    // RBAC check: Owner or Admin, or Member who created the task
    if (!isOwner && !isAdmin && !isCreator) {
      return forbiddenResponse(
        "Permission denied: Members can only delete their own created tasks, while Admins and Owners can delete any task"
      );
    }

    await prisma.task.delete({
      where: { id },
    });

    if (teamId) {
      // 1. Activity Log
      await prisma.activityLog.create({
        data: {
          teamId,
          userId: auth.id,
          action: "TASK_DELETED",
          details: `deleted task "${existingTask.title}"`,
        },
      });

      // 2. Real-time broadcast
      await triggerRealtimeEvent([`team-${teamId}`, `presence-team-${teamId}`], "task:deleted", {
        id,
        teamId,
      });
    }

    return successResponse({
      message: "Task deleted successfully",
      deletedId: id,
    });
  } catch (error) {
    console.error("DELETE /api/tasks/:id Error:", error);
    return internalErrorResponse();
  }
}
