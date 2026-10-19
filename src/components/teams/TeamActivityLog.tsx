"use client";

import * as React from "react";
import { ActivityLogItem } from "@/types";
import {
  History,
  CheckCircle,
  PlusCircle,
  Trash2,
  UserPlus,
  UserX,
  ShieldAlert,
  Clock,
  Sparkles,
} from "lucide-react";

interface TeamActivityLogProps {
  teamId: string;
}

export const TeamActivityLog: React.FC<TeamActivityLogProps> = ({ teamId }) => {
  const [logs, setLogs] = React.useState<ActivityLogItem[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  const fetchLogs = React.useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await fetch(`/api/teams/${teamId}/activity`);
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setLogs(data.data);
      }
    } catch (err) {
      console.error("Failed to fetch activity logs:", err);
    } finally {
      setIsLoading(false);
    }
  }, [teamId]);

  React.useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const getActionBadge = (action: string) => {
    switch (action) {
      case "TASK_CREATED":
        return {
          icon: PlusCircle,
          color:
            "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800",
          label: "Task Created",
        };
      case "TASK_UPDATED":
        return {
          icon: CheckCircle,
          color:
            "text-blue-600 bg-blue-50 dark:bg-blue-950/60 dark:text-blue-400 border-blue-200 dark:border-blue-800",
          label: "Task Updated",
        };
      case "TASK_DELETED":
        return {
          icon: Trash2,
          color:
            "text-rose-600 bg-rose-50 dark:bg-rose-950/60 dark:text-rose-400 border-rose-200 dark:border-rose-800",
          label: "Task Deleted",
        };
      case "MEMBER_ADDED":
        return {
          icon: UserPlus,
          color:
            "text-indigo-600 bg-indigo-50 dark:bg-indigo-950/60 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800",
          label: "Member Added",
        };
      case "MEMBER_REMOVED":
        return {
          icon: UserX,
          color:
            "text-amber-600 bg-amber-50 dark:bg-amber-950/60 dark:text-amber-400 border-amber-200 dark:border-amber-800",
          label: "Member Removed",
        };
      case "ROLE_UPDATED":
        return {
          icon: ShieldAlert,
          color:
            "text-purple-600 bg-purple-50 dark:bg-purple-950/60 dark:text-purple-400 border-purple-200 dark:border-purple-800",
          label: "Role Changed",
        };
      default:
        return {
          icon: Sparkles,
          color:
            "text-slate-600 bg-slate-50 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700",
          label: action,
        };
    }
  };

  return (
    <div className="space-y-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8 dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">
            <History className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Team Audit Trail & Activity Log
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Complete history of task operations, member additions, and permission updates.
            </p>
          </div>
        </div>

        <button
          onClick={fetchLogs}
          className="cursor-pointer rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
        >
          Refresh Log
        </button>
      </div>

      {isLoading ? (
        <div className="flex h-48 flex-col items-center justify-center space-y-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
          <p className="text-xs text-slate-500">Loading audit history...</p>
        </div>
      ) : logs.length === 0 ? (
        <div className="flex h-48 flex-col items-center justify-center text-center">
          <History className="h-8 w-8 text-slate-300 dark:text-slate-600" />
          <p className="mt-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
            No activity recorded yet
          </p>
          <p className="text-xs text-slate-400">
            Actions like creating tasks, updating status, and adding members will appear here.
          </p>
        </div>
      ) : (
        <div className="relative pl-6 before:absolute before:top-3 before:bottom-3 before:left-2.5 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
          <div className="space-y-6">
            {logs.map((item) => {
              const badge = getActionBadge(item.action);
              const Icon = badge.icon;
              return (
                <div key={item.id} className="relative flex items-start gap-4">
                  {/* Timeline Node Icon */}
                  <div className="absolute -left-6 flex h-6 w-6 items-center justify-center rounded-full bg-white ring-4 ring-white dark:bg-slate-900 dark:ring-slate-900">
                    <span className="h-2.5 w-2.5 rounded-full bg-indigo-500" />
                  </div>

                  {/* Log Content Card */}
                  <div className="flex-1 rounded-2xl border border-slate-100 bg-slate-50/60 p-4 transition-all hover:bg-slate-50 dark:border-slate-800/80 dark:bg-slate-950/40 dark:hover:bg-slate-950/70">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span
                          className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[10px] font-bold uppercase ${badge.color}`}
                        >
                          <Icon className="h-3 w-3" />
                          {badge.label}
                        </span>

                        <span className="text-xs font-bold text-slate-900 dark:text-white">
                          {item.user?.name || "System"}
                        </span>
                      </div>

                      <span className="flex items-center gap-1 text-[11px] text-slate-400">
                        <Clock className="h-3 w-3" />
                        {new Date(item.createdAt).toLocaleString([], {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>

                    {item.details && (
                      <p className="mt-1.5 text-xs text-slate-600 dark:text-slate-300">
                        {item.details}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
