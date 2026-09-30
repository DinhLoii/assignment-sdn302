import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { registerSchema } from "@/lib/validations/auth";
import { hashPassword, signJwtToken, attachAuthCookie } from "@/lib/auth";
import {
  successResponse,
  errorResponse,
  validationErrorResponse,
  internalErrorResponse,
} from "@/lib/api-response";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = registerSchema.safeParse(body);

    if (!validation.success) {
      return validationErrorResponse(validation.error.flatten().fieldErrors);
    }

    const { name, email, password } = validation.data;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return errorResponse("An account with this email already exists", 409);
    }

    // Hash password & create user
    const hashedPassword = await hashPassword(password);
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
      },
    });

    // Generate JWT Token
    const token = await signJwtToken({
      id: user.id,
      email: user.email,
      name: user.name,
    });

    const response = successResponse(
      {
        user,
        token,
        message: "Registration successful",
      },
      201
    );

    return attachAuthCookie(response, token);
  } catch (error) {
    console.error("Register Error:", error);
    return internalErrorResponse();
  }
}
