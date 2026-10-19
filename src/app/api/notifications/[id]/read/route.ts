import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";
import {
  successResponse,
  unauthorizedResponse,
  notFoundResponse,
  forbiddenResponse,
  internalErrorResponse,
} from "@/lib/api-response";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// PATCH /api/notifications/:id/read - Mark notification as read
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const auth = await getAuthUser(request);
    if (!auth) {
      return unauthorizedResponse("Authentication required");
    }

    const { id } = await params;

    const notification = await prisma.notification.findUnique({
      where: { id },
    });

    if (!notification) {
      return notFoundResponse("Notification");
    }

    if (notification.userId !== auth.id) {
      return forbiddenResponse("You do not own this notification");
    }

    const updated = await prisma.notification.update({
      where: { id },
      data: { isRead: true },
    });

    return successResponse(updated);
  } catch (error) {
    console.error("PATCH /api/notifications/:id/read Error:", error);
    return internalErrorResponse();
  }
}
