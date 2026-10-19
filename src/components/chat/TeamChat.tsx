"use client";

import * as React from "react";
import { MessageItem, UserSummary, PresenceMember } from "@/types";
import { getPusherClient } from "@/lib/pusher-client";
import { Button } from "@/components/ui/Button";
import { Send, Paperclip, Image as ImageIcon, Users, Sparkles, X } from "lucide-react";
import { toast } from "sonner";

interface PusherMemberEntry {
  id: string;
  info: {
    name: string;
    email: string;
  };
}

interface PusherMembersData {
  each: (callback: (member: PusherMemberEntry) => void) => void;
}

interface TeamChatProps {
  teamId: string;
  teamName: string;
  currentUser: UserSummary | null;
}

export const TeamChat: React.FC<TeamChatProps> = ({ teamId, teamName, currentUser }) => {
  const [messages, setMessages] = React.useState<MessageItem[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [inputText, setInputText] = React.useState("");
  const [attachmentUrl, setAttachmentUrl] = React.useState<string>("");
  const [showAttachmentInput, setShowAttachmentInput] = React.useState(false);
  const [isSending, setIsSending] = React.useState(false);

  // Presence & Online status (Bonus)
  const [onlineMembers, setOnlineMembers] = React.useState<PresenceMember[]>([]);

  // Typing indicators (Bonus)
  const [typingUsers, setTypingUsers] = React.useState<string[]>([]);
  const typingTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);
  const messagesEndRef = React.useRef<HTMLDivElement | null>(null);

  const scrollToBottom = (smooth = true) => {
    messagesEndRef.current?.scrollIntoView({ behavior: smooth ? "smooth" : "auto" });
  };

  // 1. Fetch message history with real-time auto-sync
  const fetchMessages = React.useCallback(async (isInitial = false) => {
    try {
      if (isInitial) setIsLoading(true);
      const res = await fetch(`/api/teams/${teamId}/messages?_t=${Date.now()}`, {
        cache: "no-store",
        headers: { "Cache-Control": "no-cache" },
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setMessages((prev) => {
          if (
            prev.length === data.data.length &&
            prev[prev.length - 1]?.id === data.data[data.data.length - 1]?.id
          ) {
            return prev;
          }
          return data.data;
        });
      }
    } catch (err) {
      console.error("Failed to load team messages:", err);
    } finally {
      if (isInitial) setIsLoading(false);
    }
  }, [teamId]);

  React.useEffect(() => {
    fetchMessages(true);

    // Smart real-time fallback: syncs every 1.5 seconds so messages appear automatically without page refresh
    const interval = setInterval(() => {
      fetchMessages(false);
    }, 1500);

    return () => clearInterval(interval);
  }, [fetchMessages]);

  React.useEffect(() => {
    scrollToBottom(false);
  }, [messages.length]);

  // 2. Pusher Real-time Subscriptions (Chat, Typing, Presence)
  React.useEffect(() => {
    const pusher = getPusherClient();
    if (!pusher) return;

    // Presence channel for online users & typing events
    const presenceChannelName = `presence-team-${teamId}`;
    const presenceChannel = pusher.subscribe(presenceChannelName);

    // Also fallback to regular channel
    const regularChannelName = `team-${teamId}`;
    const regularChannel = pusher.subscribe(regularChannelName);

    // Listen for new messages
    const handleNewMessage = (newMsg: MessageItem) => {
      setMessages((prev) => {
        if (prev.some((m) => m.id === newMsg.id)) return prev;
        return [...prev, newMsg];
      });
      scrollToBottom(true);
    };

    regularChannel.bind("chat:new-message", handleNewMessage);
    presenceChannel.bind("chat:new-message", handleNewMessage);

    // Presence events: subscription_succeeded, member_added, member_removed
    presenceChannel.bind("pusher:subscription_succeeded", (membersData: PusherMembersData) => {
      const active: PresenceMember[] = [];
      if (membersData?.each) {
        membersData.each((m: PusherMemberEntry) => {
          active.push({ id: m.id, info: m.info });
        });
      }
      setOnlineMembers(active);
    });

    presenceChannel.bind("pusher:member_added", (member: PusherMemberEntry) => {
      setOnlineMembers((prev) => {
        if (prev.some((m) => m.id === member.id)) return prev;
        return [...prev, { id: member.id, info: member.info }];
      });
    });

    presenceChannel.bind("pusher:member_removed", (member: PusherMemberEntry) => {
      setOnlineMembers((prev) => prev.filter((m) => m.id !== member.id));
    });

    // Client typing event
    presenceChannel.bind("client-typing", (data: { name: string; userId: string }) => {
      if (data.userId === currentUser?.id) return;
      setTypingUsers((prev) => (prev.includes(data.name) ? prev : [...prev, data.name]));

      setTimeout(() => {
        setTypingUsers((prev) => prev.filter((name) => name !== data.name));
      }, 2500);
    });

    return () => {
      pusher.unsubscribe(presenceChannelName);
      pusher.unsubscribe(regularChannelName);
    };
  }, [teamId, currentUser?.id]);

  // Handle typing notification
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputText(e.target.value);

    const pusher = getPusherClient();
    if (!pusher || !currentUser) return;

    if (!typingTimeoutRef.current) {
      const presenceChannel = pusher.channel(`presence-team-${teamId}`);
      if (presenceChannel) {
        try {
          presenceChannel.trigger("client-typing", {
            name: currentUser.name,
            userId: currentUser.id,
          });
        } catch {
          // Client event may be ignored if unauthenticated or not enabled
        }
      }
      typingTimeoutRef.current = setTimeout(() => {
        typingTimeoutRef.current = null;
      }, 2000);
    }
  };

  // Send message
  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const content = inputText.trim();
    const attUrl = attachmentUrl.trim();

    if (!content && !attUrl) return;

    try {
      setIsSending(true);
      const res = await fetch(`/api/teams/${teamId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content,
          attachmentUrl: attUrl || undefined,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success && data.data) {
        // Optimistically add message if not received through pusher yet
        setMessages((prev) => {
          if (prev.some((m) => m.id === data.data.id)) return prev;
          return [...prev, data.data];
        });
        setInputText("");
        setAttachmentUrl("");
        setShowAttachmentInput(false);
        scrollToBottom(true);
      } else {
        toast.error(data.error || "Failed to send message");
      }
    } catch {
      toast.error("Network error while sending message");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="flex h-[620px] flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
      {/* Chat Room Header */}
      <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/70 px-6 py-4 dark:border-slate-800 dark:bg-slate-950/40">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-md shadow-indigo-500/20">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              {teamName} Chat Room
            </h2>
            <p className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
              <span className="inline-block h-2 w-2 rounded-full bg-emerald-500" />
              Live Real-time Collaboration & History
            </p>
          </div>
        </div>

        {/* Online Presence Badge (Bonus) */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-700 shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
            <Users className="h-3.5 w-3.5 text-indigo-500" />
            <span>
              {onlineMembers.length > 0 ? `${onlineMembers.length} Online` : "Live Channel Active"}
            </span>
          </div>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 space-y-4 overflow-y-auto p-4 sm:p-6">
        {isLoading ? (
          <div className="flex h-full flex-col items-center justify-center space-y-3">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
            <p className="text-xs text-slate-500">Loading conversation history...</p>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400">
              <Sparkles className="h-6 w-6" />
            </div>
            <h3 className="mt-3 text-sm font-bold text-slate-800 dark:text-white">
              No messages yet
            </h3>
            <p className="mt-1 max-w-xs text-xs text-slate-500">
              Start the discussion! Send the first message to collaborate with your team in real
              time.
            </p>
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.senderId === currentUser?.id;
            return (
              <div key={msg.id} className={`flex gap-3 ${isMe ? "flex-row-reverse" : "flex-row"}`}>
                {/* Avatar */}
                <div
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold shadow-sm ${
                    isMe
                      ? "bg-indigo-600 text-white"
                      : "bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                  }`}
                >
                  {msg.sender?.name ? msg.sender.name.charAt(0).toUpperCase() : "U"}
                </div>

                {/* Message Body */}
                <div className={`max-w-[75%] space-y-1 ${isMe ? "items-end" : "items-start"}`}>
                  <div
                    className={`flex items-center gap-2 text-[11px] ${isMe ? "justify-end" : "justify-start"}`}
                  >
                    <span className="font-semibold text-slate-700 dark:text-slate-300">
                      {isMe ? "You" : msg.sender?.name || "Team Member"}
                    </span>
                    <span className="text-slate-400">
                      {new Date(msg.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>

                  <div
                    className={`rounded-2xl px-4 py-2.5 text-sm shadow-sm ${
                      isMe
                        ? "bg-indigo-600 text-white"
                        : "border border-slate-200/80 bg-slate-100/80 text-slate-800 dark:border-slate-800 dark:bg-slate-800/80 dark:text-slate-100"
                    }`}
                  >
                    <p className="break-words whitespace-pre-wrap">{msg.content}</p>

                    {/* Attachment preview if present */}
                    {msg.attachmentUrl && (
                      <div className="mt-2 overflow-hidden rounded-xl border border-white/20">
                        {msg.attachmentUrl.match(/\.(jpeg|jpg|gif|png|webp)($|\?)/i) ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={msg.attachmentUrl}
                            alt="Attachment"
                            className="max-h-60 max-w-full rounded-lg object-contain"
                          />
                        ) : (
                          <a
                            href={msg.attachmentUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1.5 text-xs underline"
                          >
                            <Paperclip className="h-3.5 w-3.5" />
                            View Attached File
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Typing Indicator (Bonus) */}
      {typingUsers.length > 0 && (
        <div className="flex items-center gap-2 px-6 py-1.5 text-xs text-indigo-600 dark:text-indigo-400">
          <div className="flex space-x-1">
            <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-indigo-500" />
            <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-indigo-500 [animation-delay:0.2s]" />
            <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-indigo-500 [animation-delay:0.4s]" />
          </div>
          <span>
            {typingUsers.join(", ")} {typingUsers.length === 1 ? "is" : "are"} typing...
          </span>
        </div>
      )}

      {/* Optional Attachment URL Box */}
      {showAttachmentInput && (
        <div className="flex items-center gap-2 border-t border-slate-100 bg-slate-50 px-6 py-2 dark:border-slate-800 dark:bg-slate-950/60">
          <ImageIcon className="h-4 w-4 text-slate-400" />
          <input
            type="url"
            value={attachmentUrl}
            onChange={(e) => setAttachmentUrl(e.target.value)}
            placeholder="Paste image or document URL (e.g. https://...)..."
            className="flex-1 bg-transparent text-xs text-slate-800 placeholder-slate-400 focus:outline-none dark:text-slate-200"
          />
          <button
            onClick={() => {
              setAttachmentUrl("");
              setShowAttachmentInput(false);
            }}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* Chat Input Bar */}
      <form
        onSubmit={handleSendMessage}
        className="flex items-center gap-2 border-t border-slate-200 bg-white p-3 sm:px-6 dark:border-slate-800 dark:bg-slate-900"
      >
        <button
          type="button"
          onClick={() => setShowAttachmentInput((prev) => !prev)}
          className={`cursor-pointer rounded-xl p-2.5 transition-colors ${
            showAttachmentInput
              ? "bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400"
              : "text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800"
          }`}
          title="Attach Image / URL"
        >
          <Paperclip className="h-4 w-4" />
        </button>

        <input
          type="text"
          value={inputText}
          onChange={handleInputChange}
          placeholder="Type a message... (Press Enter to send)"
          className="flex-1 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 transition-all focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-white"
        />

        <Button
          type="submit"
          variant="primary"
          size="md"
          isLoading={isSending}
          disabled={!inputText.trim() && !attachmentUrl.trim()}
          className="cursor-pointer rounded-2xl"
        >
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </div>
  );
};
