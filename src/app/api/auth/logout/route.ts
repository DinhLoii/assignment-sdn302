import { clearAuthCookie } from "@/lib/auth";
import { successResponse } from "@/lib/api-response";

export async function POST() {
  const response = successResponse({ message: "Logged out successfully" });
  return clearAuthCookie(response);
}
