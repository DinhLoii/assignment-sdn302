import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";
import { triggerRealtimeEvent } from "@/lib/pusher";
import {
  successResponse,
  errorResponse,
  unauthorizedResponse,
  forbiddenResponse,
  internalErrorResponse,
} from "@/lib/api-response";

export const dynamic = "force-dynamic";
export const revalidate = 0;

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/teams/:id/messages - Retrieve team chat history
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const auth = await getAuthUser(request);
    if (!auth) {
      return unauthorizedResponse("Authentication required to view messages");
    }

    const { id: teamId } = await params;

    // Verify membership
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

    const messages = await prisma.message.findMany({
      where: { teamId },
      include: {
        sender: {
          select: { id: true, name: true, email: true },
        },
      },
      orderBy: { createdAt: "asc" },
      take: 100,
    });

    return successResponse(messages);
  } catch (error) {
    console.error("GET /api/teams/:id/messages Error:", error);
    return internalErrorResponse();
  }
}

// POST /api/teams/:id/messages - Send a chat message
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const auth = await getAuthUser(request);
    if (!auth) {
      return unauthorizedResponse("Authentication required to send messages");
    }

    const { id: teamId } = await params;

    // Verify membership
    const membership = await prisma.teamMember.findUnique({
      where: {
        teamId_userId: {
          teamId,
          userId: auth.id,
        },
      },
      include: {
        team: {
          select: { name: true },
        },
      },
    });

    if (!membership) {
      return forbiddenResponse("You are not a member of this team");
    }

    const body = await request.json();
    const content = typeof body.content === "string" ? body.content.trim() : "";
    const attachmentUrl = typeof body.attachmentUrl === "string" ? body.attachmentUrl.trim() : null;

    if (!content && !attachmentUrl) {
      return errorResponse("Message content or attachment is required", 400);
    }

    if (content.length > 2000) {
      return errorResponse("Message content exceeds maximum length (2000 characters)", 400);
    }

    // Persist message
    const message = await prisma.message.create({
      data: {
        content: content || "Sent an attachment",
        attachmentUrl,
        teamId,
        senderId: auth.id,
      },
      include: {
        sender: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    // Broadcast to real-time channels (both regular & presence channels)
    await triggerRealtimeEvent(
      [`team-${teamId}`, `presence-team-${teamId}`],
      "chat:new-message",
      message
    );

    return successResponse(message, 201);
  } catch (error) {
    console.error("POST /api/teams/:id/messages Error:", error);
    return internalErrorResponse();
  }
}
