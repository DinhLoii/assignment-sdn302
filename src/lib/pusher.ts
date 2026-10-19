import PusherServer from "pusher";

// Global singleton for server-side Pusher
const globalForPusher = globalThis as unknown as {
  pusherServer: PusherServer | undefined;
};

export function getPusherServer(): PusherServer | null {
  const appId = process.env.PUSHER_APP_ID;
  const key = process.env.NEXT_PUBLIC_PUSHER_KEY || process.env.PUSHER_KEY;
  const secret = process.env.PUSHER_SECRET;
  const cluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER || process.env.PUSHER_CLUSTER || "ap1";

  if (!appId || !key || !secret) {
    return null;
  }

  if (!globalForPusher.pusherServer) {
    globalForPusher.pusherServer = new PusherServer({
      appId,
      key,
      secret,
      cluster,
      useTLS: true,
    });
  }

  return globalForPusher.pusherServer;
}

/**
 * Safely triggers a real-time event across one or multiple Pusher channels.
 * Gracefully handles missing credentials so API mutations never fail.
 */
export async function triggerRealtimeEvent(
  channels: string | string[],
  event: string,
  data: unknown
): Promise<boolean> {
  try {
    const pusher = getPusherServer();
    if (!pusher) {
      if (process.env.NODE_ENV === "development") {
        console.warn(
          `[Pusher] Skipped triggering event "${event}" on channel "${channels}" because Pusher credentials are not configured.`
        );
      }
      return false;
    }

    await pusher.trigger(channels, event, data);
    return true;
  } catch (error) {
    console.error(`[Pusher] Error triggering event "${event}":`, error);
    return false;
  }
}
