"use client";

import PusherClient, { Channel, PresenceChannel } from "pusher-js";

let clientInstance: PusherClient | null = null;

export function getPusherClient(): PusherClient | null {
  if (typeof window === "undefined") return null;

  const appKey = process.env.NEXT_PUBLIC_PUSHER_KEY;
  const cluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER || "ap1";

  if (!appKey) {
    return null;
  }

  if (!clientInstance) {
    clientInstance = new PusherClient(appKey, {
      cluster,
      authEndpoint: "/api/pusher/auth",
      auth: {
        headers: {},
      },
    });
  }

  return clientInstance;
}

export type { Channel, PresenceChannel };
