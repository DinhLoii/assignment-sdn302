import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";
import {
  successResponse,
  unauthorizedResponse,
  errorResponse,
  internalErrorResponse,
} from "@/lib/api-response";

export const dynamic = "force-dynamic";

// GET /api/auth/me - Get current user profile with team & task statistics
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
        teamMembers: {
          select: {
            role: true,
            joinedAt: true,
            team: {
              select: {
                id: true,
                name: true,
                description: true,
                _count: {
                  select: {
                    members: true,
                    tasks: true,
                  },
                },
              },
            },
          },
        },
        _count: {
          select: {
            tasks: true,
            createdTasks: true,
          },
        },
      },
    });

    if (!user) {
      return unauthorizedResponse("User not found");
    }

    return successResponse({ user });
  } catch (error) {
    console.error("Auth Me GET Error:", error);
    return internalErrorResponse();
  }
}

// PUT /api/auth/me - Update user profile (e.g. name)
export async function PUT(request: NextRequest) {
  try {
    const auth = await getAuthUser(request);
    if (!auth) {
      return unauthorizedResponse("Authentication required");
    }

    const body = await request.json();
    const name = typeof body.name === "string" ? body.name.trim() : "";

    if (!name || name.length < 2) {
      return errorResponse("Full name must be at least 2 characters long", 400);
    }

    const updatedUser = await prisma.user.update({
      where: { id: auth.id },
      data: { name },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
      },
    });

    return successResponse({ user: updatedUser });
  } catch (error) {
    console.error("Auth Me PUT Error:", error);
    return internalErrorResponse();
  }
}
