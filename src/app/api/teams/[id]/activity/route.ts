import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";
import {
  successResponse,
  unauthorizedResponse,
  forbiddenResponse,
  internalErrorResponse,
} from "@/lib/api-response";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/teams/:id/activity - Get recent team audit trail / activity log
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const auth = await getAuthUser(request);
    if (!auth) {
      return unauthorizedResponse("Authentication required to view activity logs");
    }

    const { id: teamId } = await params;

    // Check team membership
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

    const logs = await prisma.activityLog.findMany({
      where: { teamId },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    return successResponse(logs);
  } catch (error) {
    console.error("GET /api/teams/:id/activity Error:", error);
    return internalErrorResponse();
  }
}
