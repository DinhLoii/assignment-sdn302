import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";
import { createTeamSchema } from "@/lib/validations/team";
import { TeamRole } from "@prisma/client";
import {
  successResponse,
  unauthorizedResponse,
  validationErrorResponse,
  internalErrorResponse,
} from "@/lib/api-response";

// GET /api/teams - List teams the current user belongs to
export async function GET(request: NextRequest) {
  try {
    const auth = await getAuthUser(request);
    if (!auth) {
      return unauthorizedResponse("Authentication required to view teams");
    }

    // Find all teams where the current user is a member
    const teamMemberships = await prisma.teamMember.findMany({
      where: { userId: auth.id },
      include: {
        team: {
          include: {
            owner: {
              select: { id: true, name: true, email: true },
            },
            _count: {
              select: {
                members: true,
                tasks: true,
              },
            },
          },
        },
      },
      orderBy: { joinedAt: "desc" },
    });

    const teams = teamMemberships.map((membership) => ({
      ...membership.team,
      currentUserRole: membership.role,
    }));

    return successResponse({ teams, count: teams.length });
  } catch (error) {
    console.error("GET /api/teams Error:", error);
    return internalErrorResponse();
  }
}

// POST /api/teams - Create a new team
export async function POST(request: NextRequest) {
  try {
    const auth = await getAuthUser(request);
    if (!auth) {
      return unauthorizedResponse("Authentication required to create a team");
    }

    const body = await request.json();
    const validation = createTeamSchema.safeParse(body);

    if (!validation.success) {
      return validationErrorResponse(validation.error.flatten().fieldErrors);
    }

    const { name, description } = validation.data;

    // Create the team and automatically add owner as OWNER member
    const newTeam = await prisma.$transaction(async (tx) => {
      const team = await tx.team.create({
        data: {
          name,
          description: description || null,
          ownerId: auth.id,
        },
        include: {
          owner: {
            select: { id: true, name: true, email: true },
          },
        },
      });

      await tx.teamMember.create({
        data: {
          teamId: team.id,
          userId: auth.id,
          role: TeamRole.OWNER,
        },
      });

      return team;
    });

    return successResponse(
      {
        ...newTeam,
        currentUserRole: TeamRole.OWNER,
        _count: { members: 1, tasks: 0 },
      },
      201
    );
  } catch (error) {
    console.error("POST /api/teams Error:", error);
    return internalErrorResponse();
  }
}
