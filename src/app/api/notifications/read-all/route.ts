import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";
import { successResponse, unauthorizedResponse, internalErrorResponse } from "@/lib/api-response";

// POST /api/notifications/read-all - Mark all user's notifications as read
export async function POST(request: NextRequest) {
  try {
    const auth = await getAuthUser(request);
    if (!auth) {
      return unauthorizedResponse("Authentication required");
    }

    await prisma.notification.updateMany({
      where: {
        userId: auth.id,
        isRead: false,
      },
      data: {
        isRead: true,
      },
    });

    return successResponse({
      message: "All notifications marked as read",
    });
  } catch (error) {
    console.error("POST /api/notifications/read-all Error:", error);
    return internalErrorResponse();
  }
}
