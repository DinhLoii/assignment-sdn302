import { NextRequest, NextResponse } from "next/server";
import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";

export const AUTH_COOKIE_NAME = "taskpulse_token";

const JWT_SECRET_STRING = process.env.JWT_SECRET || "taskpulse_super_secret_jwt_key_2026_sdn302";
const JWT_SECRET = new TextEncoder().encode(JWT_SECRET_STRING);

export interface TokenPayload {
  id: string;
  email: string;
  name: string;
}

// Password helpers
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// JWT Token helpers
export async function signJwtToken(payload: TokenPayload): Promise<string> {
  return new SignJWT({
    id: payload.id,
    email: payload.email,
    name: payload.name,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(payload.id)
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(JWT_SECRET);
}

export async function verifyJwtToken(token: string): Promise<TokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    if (!payload.sub || typeof payload.sub !== "string") return null;

    return {
      id: payload.sub,
      email: (payload.email as string) || "",
      name: (payload.name as string) || "",
    };
  } catch {
    return null;
  }
}

// Extract authenticated user from request (Authorization header or Cookie)
export async function getAuthUser(request: NextRequest): Promise<TokenPayload | null> {
  // 1. Try Authorization header
  const authHeader = request.headers.get("authorization");
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.substring(7).trim();
    if (token) {
      const verified = await verifyJwtToken(token);
      if (verified) return verified;
    }
  }

  // 2. Try HttpOnly Cookie
  const cookieToken = request.cookies.get(AUTH_COOKIE_NAME)?.value;
  if (cookieToken) {
    const verified = await verifyJwtToken(cookieToken);
    if (verified) return verified;
  }

  return null;
}

// Set auth cookie in response
export function attachAuthCookie(response: NextResponse, token: string): NextResponse {
  response.cookies.set({
    name: AUTH_COOKIE_NAME,
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 7 * 24 * 60 * 60, // 7 days
  });
  return response;
}

// Clear auth cookie in response
export function clearAuthCookie(response: NextResponse): NextResponse {
  response.cookies.set({
    name: AUTH_COOKIE_NAME,
    value: "",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  return response;
}
