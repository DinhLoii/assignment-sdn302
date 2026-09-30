import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";
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

// DELETE /api/teams/:id/members/:userId - Remove a member from a team (Owner only)
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const auth = await getAuthUser(request);
    if (!auth) {
      return unauthorizedResponse("Authentication required");
    }

    const { id: teamId, userId: targetUserId } = await params;

    const team = await prisma.team.findUnique({
      where: { id: teamId },
    });

    if (!team) {
      return notFoundResponse("Team");
    }

    // Only owner can remove members
    if (team.ownerId !== auth.id) {
      return forbiddenResponse("Only the team Owner can remove members from the team");
    }

    // Owner cannot remove themselves through member removal
    if (targetUserId === team.ownerId) {
      return errorResponse(
        "The team Owner cannot be removed from the team. You can delete the team instead.",
        400
      );
    }

    const membership = await prisma.teamMember.findUnique({
      where: {
        teamId_userId: {
          teamId,
          userId: targetUserId,
        },
      },
    });

    if (!membership) {
      return notFoundResponse("Team member");
    }

    // Remove member and unassign any tasks assigned to them in this team
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

    return successResponse({
      message: "Member removed from team successfully",
      removedUserId: targetUserId,
    });
  } catch (error) {
    console.error("DELETE /api/teams/:id/members/:userId Error:", error);
    return internalErrorResponse();
  }
}
