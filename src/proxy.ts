import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const AUTH_COOKIE_NAME = "taskpulse_token";
const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "taskpulse_super_secret_jwt_key_2026_sdn302"
);

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;

  let isAuthenticated = false;
  if (token) {
    try {
      const { payload } = await jwtVerify(token, JWT_SECRET);
      if (payload.sub) {
        isAuthenticated = true;
      }
    } catch {
      isAuthenticated = false;
    }
  }

  // 1. Protected routes: /teams and sub-routes
  if (pathname.startsWith("/teams")) {
    if (!isAuthenticated) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // 2. Auth routes: /login, /register (redirect to /teams if already authenticated)
  if (pathname === "/login" || pathname === "/register") {
    if (isAuthenticated) {
      return NextResponse.redirect(new URL("/teams", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/teams/:path*", "/teams", "/login", "/register"],
};
