import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit, RateLimitConfig } from "./rate-limiter";
import { errorResponse } from "./api-response";

export interface ApiMiddlewareOptions {
  rateLimit?: RateLimitConfig;
  requireAuth?: boolean;
  cors?: {
    enabled?: boolean;
    origin?: string;
    methods?: string[];
    credentials?: boolean;
  };
}

export interface MiddlewareResult {
  success: boolean;
  response?: NextResponse;
  headers?: Record<string, string>;
}

export async function applyApiMiddleware(
  request: NextRequest,
  options: ApiMiddlewareOptions = {}
): Promise<MiddlewareResult> {
  const { rateLimit, cors } = options;
  const headers: Record<string, string> = {};

  if (rateLimit) {
    const rateLimitResult = checkRateLimit(request, rateLimit);

    if (!rateLimitResult.success) {
      const response = errorResponse("Too many requests", 429);
      response.headers.set("X-RateLimit-Limit", rateLimit.maxRequests.toString());
      response.headers.set("X-RateLimit-Remaining", "0");
      response.headers.set("X-RateLimit-Reset", rateLimitResult.resetTime.toString());
      return { success: false, response };
    }

    headers["X-RateLimit-Limit"] = rateLimit.maxRequests.toString();
    headers["X-RateLimit-Remaining"] = rateLimitResult.remaining.toString();
    headers["X-RateLimit-Reset"] = rateLimitResult.resetTime.toString();
  }

  if (cors?.enabled) {
    const origin = cors.origin || "*";
    const methods = cors.methods?.join(", ") || "GET, POST, PUT, DELETE, OPTIONS";
    const credentials = cors.credentials ? "true" : "false";

    headers["Access-Control-Allow-Origin"] = origin;
    headers["Access-Control-Allow-Methods"] = methods;
    headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization";
    headers["Access-Control-Allow-Credentials"] = credentials;
    headers["Access-Control-Max-Age"] = "86400";

    if (request.method === "OPTIONS") {
      const response = new NextResponse(null, { status: 204 });
      for (const [key, value] of Object.entries(headers)) {
        response.headers.set(key, value);
      }
      return { success: false, response };
    }
  }

  return { success: true, headers };
}

export function applyMiddlewareHeaders(response: NextResponse, headers: Record<string, string>): NextResponse {
  for (const [key, value] of Object.entries(headers)) {
    response.headers.set(key, value);
  }
  return response;
}
