import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { loginSchema } from "@/lib/validations/auth";
import { comparePassword, signJwtToken, attachAuthCookie } from "@/lib/auth";
import {
  successResponse,
  unauthorizedResponse,
  validationErrorResponse,
  internalErrorResponse,
} from "@/lib/api-response";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = loginSchema.safeParse(body);

    if (!validation.success) {
      return validationErrorResponse(validation.error.flatten().fieldErrors);
    }

    const { email, password } = validation.data;

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return unauthorizedResponse("Invalid email or password");
    }

    // Verify password
    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
      return unauthorizedResponse("Invalid email or password");
    }

    // Generate JWT Token
    const token = await signJwtToken({
      id: user.id,
      email: user.email,
      name: user.name,
    });

    const userSummary = {
      id: user.id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt,
    };

    const response = successResponse({
      user: userSummary,
      token,
      message: "Login successful",
    });

    return attachAuthCookie(response, token);
  } catch (error) {
    console.error("Login Error:", error);
    return internalErrorResponse();
  }
}
