import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";
import { successResponse, unauthorizedResponse, internalErrorResponse } from "@/lib/api-response";

// GET /api/notifications - List notifications for current user
export async function GET(request: NextRequest) {
  try {
    const auth = await getAuthUser(request);
    if (!auth) {
      return unauthorizedResponse("Authentication required to view notifications");
    }

    const [notifications, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where: { userId: auth.id },
        orderBy: { createdAt: "desc" },
        take: 50,
      }),
      prisma.notification.count({
        where: {
          userId: auth.id,
          isRead: false,
        },
      }),
    ]);

    return successResponse({
      notifications,
      unreadCount,
    });
  } catch (error) {
    console.error("GET /api/notifications Error:", error);
    return internalErrorResponse();
  }
}
