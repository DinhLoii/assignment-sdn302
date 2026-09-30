import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";
import { updateTeamSchema } from "@/lib/validations/team";
import {
  successResponse,
  unauthorizedResponse,
  forbiddenResponse,
  notFoundResponse,
  validationErrorResponse,
  internalErrorResponse,
} from "@/lib/api-response";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/teams/:id - Get team details, including members and tasks
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const auth = await getAuthUser(request);
    if (!auth) {
      return unauthorizedResponse("Authentication required to view team details");
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

    // Fetch team with owner, members, and tasks
    const team = await prisma.team.findUnique({
      where: { id: teamId },
      include: {
        owner: {
          select: { id: true, name: true, email: true },
        },
        members: {
          include: {
            user: {
              select: { id: true, name: true, email: true, createdAt: true },
            },
          },
          orderBy: { joinedAt: "asc" },
        },
        tasks: {
          include: {
            assignee: {
              select: { id: true, name: true, email: true },
            },
            creator: {
              select: { id: true, name: true, email: true },
            },
          },
          orderBy: { createdAt: "desc" },
        },
        _count: {
          select: {
            members: true,
            tasks: true,
          },
        },
      },
    });

    if (!team) {
      return notFoundResponse("Team");
    }

    return successResponse({
      ...team,
      currentUserRole: membership.role,
    });
  } catch (error) {
    console.error("GET /api/teams/:id Error:", error);
    return internalErrorResponse();
  }
}

// PUT /api/teams/:id - Update team info (Owner only)
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const auth = await getAuthUser(request);
    if (!auth) {
      return unauthorizedResponse("Authentication required to update team");
    }

    const { id: teamId } = await params;

    const existingTeam = await prisma.team.findUnique({
      where: { id: teamId },
    });

    if (!existingTeam) {
      return notFoundResponse("Team");
    }

    // Verify Owner role
    if (existingTeam.ownerId !== auth.id) {
      return forbiddenResponse("Only the team Owner can update team details");
    }

    const body = await request.json();
    const validation = updateTeamSchema.safeParse(body);

    if (!validation.success) {
      return validationErrorResponse(validation.error.flatten().fieldErrors);
    }

    const { name, description } = validation.data;

    const updatedTeam = await prisma.team.update({
      where: { id: teamId },
      data: {
        ...(name !== undefined && { name }),
        ...(description !== undefined && { description: description || null }),
      },
      include: {
        owner: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    return successResponse(updatedTeam);
  } catch (error) {
    console.error("PUT /api/teams/:id Error:", error);
    return internalErrorResponse();
  }
}

// DELETE /api/teams/:id - Delete a team (Owner only)
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const auth = await getAuthUser(request);
    if (!auth) {
      return unauthorizedResponse("Authentication required to delete team");
    }

    const { id: teamId } = await params;

    const existingTeam = await prisma.team.findUnique({
      where: { id: teamId },
    });

    if (!existingTeam) {
      return notFoundResponse("Team");
    }

    // Verify Owner role
    if (existingTeam.ownerId !== auth.id) {
      return forbiddenResponse("Only the team Owner can delete this team");
    }

    // Delete team (cascade deletes team members and tasks)
    await prisma.team.delete({
      where: { id: teamId },
    });

    return successResponse({
      message: "Team deleted successfully",
      deletedId: teamId,
    });
  } catch (error) {
    console.error("DELETE /api/teams/:id Error:", error);
    return internalErrorResponse();
  }
}
