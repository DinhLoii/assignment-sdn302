import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";
import { addMemberSchema } from "@/lib/validations/team";
import { TeamRole } from "@prisma/client";
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

// POST /api/teams/:id/members - Add a member to a team by email (Owner and Admin only)
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
      return notFoundResponse("Team");
    }

    // Role verification: Must be OWNER or ADMIN
    const requesterMembership = team.members[0];
    const isOwner = team.ownerId === auth.id || requesterMembership?.role === TeamRole.OWNER;
    const isAdmin = requesterMembership?.role === TeamRole.ADMIN;

    if (!isOwner && !isAdmin) {
      return forbiddenResponse("Only team Owners and Admins can add new members");
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

    // Add member as MEMBER
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

    // 1. Create In-App Notification for the invited user
    const notification = await prisma.notification.create({
      data: {
        userId: invitedUser.id,
        title: "Added to Team",
        message: `You were added to team "${team.name}" by ${auth.name}.`,
        type: "TEAM_INVITED",
        link: `/teams/${teamId}`,
      },
    });

    // 2. Log Activity
    await prisma.activityLog.create({
      data: {
        teamId,
        userId: auth.id,
        action: "MEMBER_ADDED",
        details: `added ${invitedUser.name} (${invitedUser.email}) to the team`,
      },
    });

    // 3. Broadcast real-time events
    await Promise.all([
      // Real-time notification to the invited user
      triggerRealtimeEvent(`user-${invitedUser.id}`, "notification:new", notification),
      // Real-time member addition to team members
      triggerRealtimeEvent(
        [`team-${teamId}`, `presence-team-${teamId}`],
        "member:added",
        newMember
      ),
    ]);

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
