"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { NotificationItem, UserSummary } from "@/types";
import { getPusherClient } from "@/lib/pusher-client";
import { Bell, CheckCheck, ExternalLink, Sparkles } from "lucide-react";
import { toast } from "sonner";

interface NotificationBellProps {
  currentUser: UserSummary | null;
}

export const NotificationBell: React.FC<NotificationBellProps> = ({ currentUser }) => {
  const router = useRouter();
  const [isOpen, setIsOpen] = React.useState(false);
  const [notifications, setNotifications] = React.useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = React.useState(0);
  const [isLoading, setIsLoading] = React.useState(false);
  const dropdownRef = React.useRef<HTMLDivElement | null>(null);

  // 1. Fetch notifications
  const fetchNotifications = React.useCallback(async () => {
    if (!currentUser) return;
    try {
      setIsLoading(true);
      const res = await fetch("/api/notifications");
      const data = await res.json();
      if (data.success && data.data) {
        setNotifications(data.data.notifications || []);
        setUnreadCount(data.data.unreadCount || 0);
      }
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
    } finally {
      setIsLoading(false);
    }
  }, [currentUser]);

  React.useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // 2. Real-time notifications via Pusher
  React.useEffect(() => {
    if (!currentUser) return;
    const pusher = getPusherClient();
    if (!pusher) return;

    const channelName = `user-${currentUser.id}`;
    const channel = pusher.subscribe(channelName);

    channel.bind("notification:new", (newNotif: NotificationItem) => {
      setNotifications((prev) => [newNotif, ...prev]);
      setUnreadCount((prev) => prev + 1);

      // Toast notification popup
      toast.info(newNotif.title, {
        description: newNotif.message,
        action: newNotif.link
          ? {
              label: "View",
              onClick: () => router.push(newNotif.link!),
            }
          : undefined,
      });

      // Browser Push Notification (Bonus)
      if (typeof window !== "undefined" && "Notification" in window) {
        if (Notification.permission === "granted") {
          new Notification(newNotif.title, {
            body: newNotif.message,
            icon: "/favicon.ico",
          });
        }
      }
    });

    return () => {
      pusher.unsubscribe(channelName);
    };
  }, [currentUser, router]);

  // Close dropdown on outside click
  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Request browser notification permission (Bonus)
  const requestBrowserPermission = async () => {
    if (typeof window !== "undefined" && "Notification" in window) {
      const permission = await Notification.requestPermission();
      if (permission === "granted") {
        toast.success("Browser push notifications enabled!");
      }
    }
  };

  // Mark single notification as read
  const handleMarkAsRead = async (notif: NotificationItem) => {
    if (!notif.isRead) {
      setNotifications((prev) => prev.map((n) => (n.id === notif.id ? { ...n, isRead: true } : n)));
      setUnreadCount((prev) => Math.max(0, prev - 1));

      try {
        await fetch(`/api/notifications/${notif.id}/read`, { method: "PATCH" });
      } catch (err) {
        console.error("Failed to mark notification read:", err);
      }
    }

    if (notif.link) {
      setIsOpen(false);
      router.push(notif.link);
    }
  };

  // Mark all as read
  const handleMarkAllAsRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setUnreadCount(0);

    try {
      await fetch("/api/notifications/read-all", { method: "POST" });
      toast.success("All notifications marked as read");
    } catch {
      toast.error("Failed to mark all as read");
    }
  };

  if (!currentUser) return null;

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="relative cursor-pointer rounded-xl p-2 text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
        aria-label="View notifications"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white shadow-sm ring-2 ring-white dark:ring-slate-950">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Notifications Dropdown Panel */}
      {isOpen && (
        <div className="absolute right-0 z-50 mt-2 w-80 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl sm:w-96 dark:border-slate-800 dark:bg-slate-900">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/80 px-4 py-3 dark:border-slate-800 dark:bg-slate-950/60">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-slate-900 dark:text-white">
                Notifications
              </span>
              {unreadCount > 0 && (
                <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-[11px] font-bold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                  {unreadCount} new
                </span>
              )}
            </div>

            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAllAsRead}
                className="flex cursor-pointer items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
              >
                <CheckCheck className="h-3.5 w-3.5" />
                Mark all read
              </button>
            )}
          </div>

          {/* List Area */}
          <div className="max-h-[380px] divide-y divide-slate-100 overflow-y-auto dark:divide-slate-800/80">
            {isLoading ? (
              <div className="flex h-32 items-center justify-center">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
              </div>
            ) : notifications.length === 0 ? (
              <div className="flex h-40 flex-col items-center justify-center px-4 text-center">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-400 dark:bg-slate-800">
                  <Bell className="h-5 w-5" />
                </div>
                <p className="mt-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
                  All caught up!
                </p>
                <p className="text-[11px] text-slate-400">
                  You have no new notifications right now.
                </p>
              </div>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif.id}
                  onClick={() => handleMarkAsRead(notif)}
                  className={`flex cursor-pointer items-start gap-3 p-3.5 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50 ${
                    !notif.isRead
                      ? "bg-indigo-50/40 dark:bg-indigo-950/20"
                      : "bg-white dark:bg-slate-900"
                  }`}
                >
                  <div className="mt-0.5">
                    <span
                      className={`inline-block h-2 w-2 rounded-full ${
                        !notif.isRead ? "bg-indigo-600" : "bg-transparent"
                      }`}
                    />
                  </div>

                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-bold text-slate-900 dark:text-white">
                        {notif.title}
                      </p>
                      <span className="text-[10px] text-slate-400">
                        {new Date(notif.createdAt).toLocaleDateString([], {
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    </div>

                    <p className="line-clamp-2 text-xs text-slate-600 dark:text-slate-300">
                      {notif.message}
                    </p>

                    {notif.link && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-600 dark:text-indigo-400">
                        View detail <ExternalLink className="h-2.5 w-2.5" />
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer with Push notification prompt (Bonus) */}
          <div className="border-t border-slate-100 bg-slate-50/50 p-2.5 text-center text-[11px] dark:border-slate-800 dark:bg-slate-950/40">
            <button
              type="button"
              onClick={requestBrowserPermission}
              className="inline-flex items-center gap-1 font-medium text-slate-500 transition-colors hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400"
            >
              <Sparkles className="h-3 w-3 text-amber-500" />
              Enable browser push notifications
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
