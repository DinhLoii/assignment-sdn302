import { NextResponse } from "next/server";

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  details?: Record<string, string[]>;
  timestamp?: string;
}

export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public details?: Record<string, string[]>
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export function successResponse<T>(data: T, statusCode: number = 200): NextResponse<ApiResponse<T>> {
  return NextResponse.json(
    {
      success: true,
      data,
      timestamp: new Date().toISOString(),
    },
    { status: statusCode }
  );
}

export function errorResponse(
  error: string | Error | ApiError,
  statusCode: number = 500,
  details?: Record<string, string[]>
): NextResponse<ApiResponse> {
  const message = error instanceof Error ? error.message : error;
  const responseDetails = error instanceof ApiError ? error.details : details;

  console.error(`API Error [${statusCode}]:`, message);

  return NextResponse.json(
    {
      success: false,
      error: message,
      details: responseDetails,
      timestamp: new Date().toISOString(),
    },
    { status: statusCode }
  );
}

export function validationErrorResponse(fieldErrors: Record<string, string[]>): NextResponse<ApiResponse> {
  return errorResponse("Validation failed", 400, fieldErrors);
}

export function notFoundResponse(resource: string = "Resource"): NextResponse<ApiResponse> {
  return errorResponse(`${resource} not found`, 404);
}

export function unauthorizedResponse(message: string = "Unauthorized"): NextResponse<ApiResponse> {
  return errorResponse(message, 401);
}

export function forbiddenResponse(message: string = "Forbidden"): NextResponse<ApiResponse> {
  return errorResponse(message, 403);
}

export function badRequestResponse(message: string = "Bad request"): NextResponse<ApiResponse> {
  return errorResponse(message, 400);
}

export function internalErrorResponse(): NextResponse<ApiResponse> {
  return errorResponse("Internal server error", 500);
}
