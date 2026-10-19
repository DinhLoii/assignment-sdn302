import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { getPusherServer } from "@/lib/pusher";
import { unauthorizedResponse, errorResponse } from "@/lib/api-response";

export async function POST(request: NextRequest) {
  try {
    const auth = await getAuthUser(request);
    if (!auth) {
      return unauthorizedResponse("Authentication required to authorize real-time channel");
    }

    const pusher = getPusherServer();
    if (!pusher) {
      return errorResponse("Realtime server is not configured", 500);
    }

    // Pusher sends application/x-www-form-urlencoded or JSON
    const contentType = request.headers.get("content-type") || "";
    let socketId = "";
    let channelName = "";

    if (contentType.includes("application/json")) {
      const body = await request.json();
      socketId = body.socket_id;
      channelName = body.channel_name;
    } else {
      const formData = await request.formData();
      socketId = formData.get("socket_id") as string;
      channelName = formData.get("channel_name") as string;
    }

    if (!socketId || !channelName) {
      return errorResponse("Missing socket_id or channel_name", 400);
    }

    // Presence channel authorization with user metadata
    if (channelName.startsWith("presence-")) {
      const presenceData = {
        user_id: auth.id,
        user_info: {
          name: auth.name,
          email: auth.email,
        },
      };
      const authResponse = pusher.authorizeChannel(socketId, channelName, presenceData);
      return NextResponse.json(authResponse);
    }

    // Private channel authorization
    const authResponse = pusher.authorizeChannel(socketId, channelName);
    return NextResponse.json(authResponse);
  } catch (error) {
    console.error("POST /api/pusher/auth Error:", error);
    return errorResponse("Authorization failed", 500);
  }
}
