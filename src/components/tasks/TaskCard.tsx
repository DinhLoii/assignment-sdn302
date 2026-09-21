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

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  onEdit,
  onDelete,
  onStatusChange,
}) => {
  const overdue = isOverdue(task.dueDate, task.status);

  // Quick next status cycle
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
    <div className="group relative flex flex-col justify-between bg-slate-900/80 border border-slate-800/80 hover:border-slate-700/90 rounded-2xl p-5 backdrop-blur-sm transition-all duration-200 hover:shadow-lg hover:shadow-slate-950/50">
      <div>
        {/* Card Header: Badges & Quick Action */}
        <div className="flex items-center justify-between gap-2 pb-3 border-b border-slate-800/50">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="status" status={task.status} />
            <Badge variant="priority" priority={task.priority} />
          </div>

          <button
            onClick={handleQuickStatus}
            className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-400 hover:bg-slate-800/60 transition-colors"
            title={`Click to mark as ${getNextStatus(task.status).replace("_", " ")}`}
          >
            {task.status === "DONE" && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
            {task.status === "IN_PROGRESS" && <Clock className="w-4 h-4 text-amber-400" />}
            {task.status === "TODO" && <Circle className="w-4 h-4 text-slate-400" />}
          </button>
        </div>

        {/* Task Title */}
        <h4 className="mt-3 text-base font-semibold text-slate-100 group-hover:text-white transition-colors line-clamp-2">
          {task.title}
        </h4>

        {/* Task Description */}
        {task.description && (
          <p className="mt-2 text-xs text-slate-400 line-clamp-3 leading-relaxed">
            {task.description}
          </p>
        )}
      </div>

      {/* Card Footer */}
      <div className="mt-5 pt-3 border-t border-slate-800/60 flex items-center justify-between text-xs text-slate-400">
        {/* Due Date Indicator */}
        <div className="flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5 text-slate-500" />
          {task.dueDate ? (
            <span
              className={
                overdue
                  ? "text-rose-400 font-medium"
                  : task.status === "DONE"
                  ? "text-slate-500 line-through"
                  : "text-slate-300"
              }
            >
              {formatRelativeDate(task.dueDate)}
            </span>
          ) : (
            <span className="text-slate-500">No due date</span>
          )}
        </div>

        {/* Actions: Edit & Delete */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => onEdit(task)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-300 hover:bg-indigo-950/40 transition-colors cursor-pointer"
            title="Edit task"
          >
            <Edit3 className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(task)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 transition-colors cursor-pointer"
            title="Delete task"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
