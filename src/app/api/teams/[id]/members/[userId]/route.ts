import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";
import { TeamRole } from "@prisma/client";
import { triggerRealtimeEvent } from "@/lib/pusher";
import { canChangeMemberRole, canRemoveMember } from "@/lib/permissions";
import {
  successResponse,
  errorResponse,
  unauthorizedResponse,
  forbiddenResponse,
  notFoundResponse,
  internalErrorResponse,
} from "@/lib/api-response";

interface RouteParams {
  params: Promise<{ id: string; userId: string }>;
}

// PATCH /api/teams/:id/members/:userId - Update a member's role (Owner or Admin)
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const auth = await getAuthUser(request);
    if (!auth) {
      return unauthorizedResponse("Authentication required");
    }

    const { id: teamId, userId: targetUserId } = await params;

    const [team, actorMembership, targetMembership] = await Promise.all([
      prisma.team.findUnique({
        where: { id: teamId },
        select: { id: true, name: true, ownerId: true },
      }),
      prisma.teamMember.findUnique({
        where: {
          teamId_userId: {
            teamId,
            userId: auth.id,
          },
        },
      }),
      prisma.teamMember.findUnique({
        where: {
          teamId_userId: {
            teamId,
            userId: targetUserId,
          },
        },
        include: {
          user: {
            select: { id: true, name: true, email: true },
          },
        },
      }),
    ]);

    if (!team) return notFoundResponse("Team");
    if (!actorMembership) return forbiddenResponse("You are not a member of this team");
    if (!targetMembership) return notFoundResponse("Team member");

    const isTargetOwner = targetUserId === team.ownerId;
    if (isTargetOwner) {
      return forbiddenResponse("The team Owner's role cannot be modified");
    }

    const isAllowed = canChangeMemberRole(
      actorMembership.role,
      targetMembership.role,
      isTargetOwner
    );

    if (!isAllowed) {
      return forbiddenResponse(
        "Permission denied: You do not have authorization to modify this member's role"
      );
    }

    const body = await request.json();
    const newRole = body.role as TeamRole;

    if (!newRole || (newRole !== "ADMIN" && newRole !== "MEMBER")) {
      return errorResponse("Invalid role. Role must be 'ADMIN' or 'MEMBER'", 400);
    }

    const updatedMember = await prisma.teamMember.update({
      where: {
        teamId_userId: {
          teamId,
          userId: targetUserId,
        },
      },
      data: { role: newRole },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    // 1. Notify the updated user
    const notification = await prisma.notification.create({
      data: {
        userId: targetUserId,
        title: "Role Updated",
        message: `Your role in "${team.name}" was updated to ${newRole} by ${auth.name}.`,
        type: "ROLE_UPDATED",
        link: `/teams/${teamId}`,
      },
    });

    // 2. Activity Log
    await prisma.activityLog.create({
      data: {
        teamId,
        userId: auth.id,
        action: "ROLE_UPDATED",
        details: `changed ${targetMembership.user.name}'s role from ${targetMembership.role} to ${newRole}`,
      },
    });

    // 3. Real-time events
    await Promise.all([
      triggerRealtimeEvent(`user-${targetUserId}`, "notification:new", notification),
      triggerRealtimeEvent(
        [`team-${teamId}`, `presence-team-${teamId}`],
        "member:role-updated",
        updatedMember
      ),
    ]);

    return successResponse(updatedMember);
  } catch (error) {
    console.error("PATCH /api/teams/:id/members/:userId Error:", error);
    return internalErrorResponse();
  }
}

// DELETE /api/teams/:id/members/:userId - Remove a member from a team (Owner or Admin)
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const auth = await getAuthUser(request);
    if (!auth) {
      return unauthorizedResponse("Authentication required");
    }

    const { id: teamId, userId: targetUserId } = await params;

    const [team, actorMembership, targetMembership] = await Promise.all([
      prisma.team.findUnique({
        where: { id: teamId },
        select: { id: true, name: true, ownerId: true },
      }),
      prisma.teamMember.findUnique({
        where: {
          teamId_userId: {
            teamId,
            userId: auth.id,
          },
        },
      }),
      prisma.teamMember.findUnique({
        where: {
          teamId_userId: {
            teamId,
            userId: targetUserId,
          },
        },
        include: {
          user: {
            select: { id: true, name: true, email: true },
          },
        },
      }),
    ]);

    if (!team) return notFoundResponse("Team");
    if (!actorMembership) return forbiddenResponse("You are not a member of this team");
    if (!targetMembership) return notFoundResponse("Team member");

    const isTargetOwner = targetUserId === team.ownerId;
    if (isTargetOwner) {
      return errorResponse("The team Owner cannot be removed from the team", 400);
    }

    const isAllowed = canRemoveMember(
      actorMembership.role,
      auth.id,
      targetMembership.role,
      targetUserId,
      isTargetOwner
    );

    if (!isAllowed) {
      return forbiddenResponse(
        "Permission denied: Admins can only remove Members, and Members cannot remove anyone"
      );
    }

    // Remove member and unassign their tasks
    await prisma.$transaction([
      prisma.teamMember.delete({
        where: {
          teamId_userId: {
            teamId,
            userId: targetUserId,
          },
        },
      }),
      prisma.task.updateMany({
        where: {
          teamId,
          assigneeId: targetUserId,
        },
        data: {
          assigneeId: null,
        },
      }),
    ]);

    // 1. Notify removed user
    const notification = await prisma.notification.create({
      data: {
        userId: targetUserId,
        title: "Removed from Team",
        message: `You were removed from team "${team.name}" by ${auth.name}.`,
        type: "TEAM_INVITED",
        link: "/teams",
      },
    });

    // 2. Activity Log
    await prisma.activityLog.create({
      data: {
        teamId,
        userId: auth.id,
        action: "MEMBER_REMOVED",
        details: `removed ${targetMembership.user.name} (${targetMembership.user.email}) from the team`,
      },
    });

    // 3. Real-time events
    await Promise.all([
      triggerRealtimeEvent(`user-${targetUserId}`, "notification:new", notification),
      triggerRealtimeEvent([`team-${teamId}`, `presence-team-${teamId}`], "member:removed", {
        teamId,
        removedUserId: targetUserId,
      }),
    ]);

    return successResponse({
      message: "Member removed from team successfully",
      removedUserId: targetUserId,
    });
  } catch (error) {
    console.error("DELETE /api/teams/:id/members/:userId Error:", error);
    return internalErrorResponse();
  }
}
