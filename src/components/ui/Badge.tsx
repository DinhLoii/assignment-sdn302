import * as React from "react";
import { cn } from "@/lib/utils";
import { TaskPriority, TaskStatus } from "@/types";

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "status" | "priority";
  status?: TaskStatus;
  priority?: TaskPriority;
}

export const Badge: React.FC<BadgeProps> = ({
  className,
  variant = "default",
  status,
  priority,
  children,
  ...props
}) => {
  if (variant === "status" && status) {
    const statusConfig = {
      TODO: {
        label: "To Do",
        classes: "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700",
        dot: "bg-slate-400",
      },
      IN_PROGRESS: {
        label: "In Progress",
        classes: "bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800/60",
        dot: "bg-amber-500 dark:bg-amber-400 animate-pulse",
      },
      DONE: {
        label: "Done",
        classes: "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/60",
        dot: "bg-emerald-500 dark:bg-emerald-400",
      },
    };

    const config = statusConfig[status];

    return (
      <span
        className={cn(
          "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border",
          config.classes,
          className
        )}
        {...props}
      >
        <span className={cn("w-1.5 h-1.5 rounded-full", config.dot)} />
        {children || config.label}
      </span>
    );
  }

  if (variant === "priority" && priority) {
    const priorityConfig = {
      LOW: {
        label: "Low",
        classes: "bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800/50",
      },
      MEDIUM: {
        label: "Medium",
        classes: "bg-yellow-50 dark:bg-yellow-950/40 text-yellow-700 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800/50",
      },
      HIGH: {
        label: "High",
        classes: "bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800/50",
      },
    };

    const config = priorityConfig[priority];

    return (
      <span
        className={cn(
          "inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold border tracking-wide uppercase",
          config.classes,
          className
        )}
        {...props}
      >
        {children || config.label}
      </span>
    );
  }

  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700",
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
};
