import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const docsUrl = new URL("/docs", request.url);
  return NextResponse.redirect(docsUrl);
}
