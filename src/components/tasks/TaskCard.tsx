"use client";

import * as React from "react";
import { TaskItem, TaskStatus } from "@/types";
import { Badge } from "@/components/ui/Badge";
import { formatRelativeDate, isOverdue } from "@/lib/utils";
import { Calendar, Edit3, Trash2, CheckCircle2, Clock, Circle } from "lucide-react";

interface TaskCardProps {
  task: TaskItem;
  onEdit: (task: TaskItem) => void;
  onDelete: (task: TaskItem) => void;
  onStatusChange: (task: TaskItem, newStatus: TaskStatus) => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({ task, onEdit, onDelete, onStatusChange }) => {
  const overdue = isOverdue(task.dueDate, task.status);

  const getNextStatus = (current: TaskStatus): TaskStatus => {
    if (current === "TODO") return "IN_PROGRESS";
    if (current === "IN_PROGRESS") return "DONE";
    return "TODO";
  };

  const handleQuickStatus = () => {
    const next = getNextStatus(task.status);
    onStatusChange(task, next);
  };

  return (
    <div className="group relative flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-sm backdrop-blur-sm transition-all duration-200 hover:border-slate-300 hover:shadow-md dark:border-slate-800/80 dark:bg-slate-900/80 dark:shadow-slate-950/50 dark:hover:border-slate-700/90">
      <div>
        {/* Card Header: Badges & Quick Action */}
        <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-3 dark:border-slate-800/50">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="status" status={task.status} />
            <Badge variant="priority" priority={task.priority} />
          </div>

          <button
            onClick={handleQuickStatus}
            className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-indigo-600 dark:hover:bg-slate-800/60 dark:hover:text-indigo-400"
            title={`Click to mark as ${getNextStatus(task.status).replace("_", " ")}`}
          >
            {task.status === "DONE" && (
              <CheckCircle2 className="h-4 w-4 text-emerald-500 dark:text-emerald-400" />
            )}
            {task.status === "IN_PROGRESS" && (
              <Clock className="h-4 w-4 text-amber-500 dark:text-amber-400" />
            )}
            {task.status === "TODO" && <Circle className="h-4 w-4 text-slate-400" />}
          </button>
        </div>

        {/* Task Title */}
        <h4 className="mt-3 line-clamp-2 text-base font-semibold text-slate-900 transition-colors group-hover:text-indigo-600 dark:text-slate-100 dark:group-hover:text-white">
          {task.title}
        </h4>

        {/* Task Description */}
        {task.description && (
          <p className="mt-2 line-clamp-3 text-xs leading-relaxed text-slate-600 dark:text-slate-400">
            {task.description}
          </p>
        )}
      </div>

      {/* Card Footer */}
      <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-3 text-xs text-slate-500 dark:border-slate-800/60 dark:text-slate-400">
        {/* Due Date Indicator */}
        <div className="flex items-center gap-1.5">
          <Calendar className="h-3.5 w-3.5 text-slate-400" />
          {task.dueDate ? (
            <span
              className={
                overdue
                  ? "font-medium text-rose-500 dark:text-rose-400"
                  : task.status === "DONE"
                    ? "text-slate-400 line-through"
                    : "text-slate-700 dark:text-slate-300"
              }
            >
              {formatRelativeDate(task.dueDate)}
            </span>
          ) : (
            <span className="text-slate-400">No due date</span>
          )}
        </div>

        {/* Actions: Edit & Delete */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => onEdit(task)}
            className="cursor-pointer rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-indigo-50 hover:text-indigo-600 dark:hover:bg-indigo-950/40 dark:hover:text-indigo-300"
            title="Edit task"
          >
            <Edit3 className="h-4 w-4" />
          </button>
          <button
            onClick={() => onDelete(task)}
            className="cursor-pointer rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/40 dark:hover:text-rose-400"
            title="Delete task"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
