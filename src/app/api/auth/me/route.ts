import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";
import { successResponse, unauthorizedResponse, internalErrorResponse } from "@/lib/api-response";

export async function GET(request: NextRequest) {
  try {
    const auth = await getAuthUser(request);
    if (!auth) {
      return unauthorizedResponse("Authentication required");
    }

    const user = await prisma.user.findUnique({
      where: { id: auth.id },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
      },
    });

    if (!user) {
      return unauthorizedResponse("User not found");
    }

    return successResponse({ user });
  } catch (error) {
    console.error("Auth Me Error:", error);
    return internalErrorResponse();
  }
}
