import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";
import { addMemberSchema } from "@/lib/validations/team";
import { TeamRole } from "@prisma/client";
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

// POST /api/teams/:id/members - Add a member to a team by email (Owner only)
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const auth = await getAuthUser(request);
    if (!auth) {
      return unauthorizedResponse("Authentication required");
    }

    const { id: teamId } = await params;

    const team = await prisma.team.findUnique({
      where: { id: teamId },
    });

    if (!team) {
      return notFoundResponse("Team");
    }

    // Only owner can add members
    if (team.ownerId !== auth.id) {
      return forbiddenResponse("Only the team Owner can add new members");
    }

    const body = await request.json();
    const validation = addMemberSchema.safeParse(body);

    if (!validation.success) {
      return validationErrorResponse(validation.error.flatten().fieldErrors);
    }

    const { email } = validation.data;

    // Look up user to invite
    const invitedUser = await prisma.user.findUnique({
      where: { email },
    });

    if (!invitedUser) {
      return errorResponse(
        `User with email "${email}" was not found. Please ensure they have registered an account.`,
        404
      );
    }

    // Check if already in the team
    const existingMembership = await prisma.teamMember.findUnique({
      where: {
        teamId_userId: {
          teamId,
          userId: invitedUser.id,
        },
      },
    });

    if (existingMembership) {
      return errorResponse("This user is already a member of the team", 409);
    }

    // Add member
    const newMember = await prisma.teamMember.create({
      data: {
        teamId,
        userId: invitedUser.id,
        role: TeamRole.MEMBER,
      },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    return successResponse(
      {
        message: `${invitedUser.name} (${invitedUser.email}) added to team`,
        member: newMember,
      },
      201
    );
  } catch (error) {
    console.error("POST /api/teams/:id/members Error:", error);
    return internalErrorResponse();
  }
}
