"use client";

import * as React from "react";
import { TaskItem, TaskStatus, TeamRole, UserSummary } from "@/types";
import { Badge } from "@/components/ui/Badge";
import { Clock, Trash2, Edit3, CheckCircle2, Circle, PlayCircle } from "lucide-react";

interface KanbanBoardProps {
  tasks: TaskItem[];
  currentUser: UserSummary | null;
  currentUserRole?: TeamRole;
  teamOwnerId?: string;
  onEditTask: (task: TaskItem) => void;
  onDeleteTask: (task: TaskItem) => void;
  onStatusChange: (taskId: string, newStatus: TaskStatus) => Promise<void>;
}

const COLUMNS: {
  id: TaskStatus;
  title: string;
  icon: React.ElementType;
  color: string;
  badgeColor: string;
}[] = [
  {
    id: "TODO",
    title: "To Do",
    icon: Circle,
    color: "border-slate-300 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30",
    badgeColor: "bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300",
  },
  {
    id: "IN_PROGRESS",
    title: "In Progress",
    icon: PlayCircle,
    color: "border-amber-200 dark:border-amber-900/40 bg-amber-50/30 dark:bg-amber-950/10",
    badgeColor: "bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300",
  },
  {
    id: "DONE",
    title: "Done",
    icon: CheckCircle2,
    color: "border-emerald-200 dark:border-emerald-900/40 bg-emerald-50/30 dark:bg-emerald-950/10",
    badgeColor: "bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300",
  },
];

export const KanbanBoard: React.FC<KanbanBoardProps> = ({
  tasks,
  currentUser,
  currentUserRole,
  teamOwnerId,
  onEditTask,
  onDeleteTask,
  onStatusChange,
}) => {
  const [draggedTaskId, setDraggedTaskId] = React.useState<string | null>(null);
  const [dragOverColumn, setDragOverColumn] = React.useState<TaskStatus | null>(null);

  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    e.dataTransfer.setData("text/plain", taskId);
    setDraggedTaskId(taskId);
  };

  const handleDragOver = (e: React.DragEvent, status: TaskStatus) => {
    e.preventDefault();
    setDragOverColumn(status);
  };

  const handleDragLeave = () => {
    setDragOverColumn(null);
  };

  const handleDrop = async (e: React.DragEvent, newStatus: TaskStatus) => {
    e.preventDefault();
    setDragOverColumn(null);
    const taskId = e.dataTransfer.getData("text/plain") || draggedTaskId;
    setDraggedTaskId(null);

    if (!taskId) return;

    const task = tasks.find((t) => t.id === taskId);
    if (!task || task.status === newStatus) return;

    await onStatusChange(taskId, newStatus);
  };

  const canDeleteTask = (task: TaskItem) => {
    if (!currentUser) return false;
    const isOwnerOrAdmin =
      currentUserRole === "OWNER" || currentUserRole === "ADMIN" || teamOwnerId === currentUser.id;
    if (isOwnerOrAdmin) return true;
    return task.creatorId === currentUser.id;
  };

  return (
    <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
      {COLUMNS.map((col) => {
        const colTasks = tasks.filter((t) => t.status === col.id);
        const Icon = col.icon;
        const isOver = dragOverColumn === col.id;

        return (
          <div
            key={col.id}
            onDragOver={(e) => handleDragOver(e, col.id)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, col.id)}
            className={`flex flex-col rounded-2xl border ${col.color} min-h-[500px] p-4 transition-all duration-200 ${
              isOver
                ? "scale-[1.01] bg-indigo-50/40 ring-2 ring-indigo-500 dark:bg-indigo-950/30"
                : ""
            }`}
          >
            {/* Column Header */}
            <div className="mb-3 flex items-center justify-between border-b border-slate-200/70 pb-3 dark:border-slate-800/70">
              <div className="flex items-center gap-2">
                <Icon className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">{col.title}</h3>
              </div>
              <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${col.badgeColor}`}>
                {colTasks.length}
              </span>
            </div>

            {/* Column Cards */}
            <div className="flex-1 space-y-3">
              {colTasks.length === 0 ? (
                <div className="flex h-32 flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 p-4 text-center text-xs text-slate-400 dark:border-slate-800/80">
                  Drag tasks here
                </div>
              ) : (
                colTasks.map((task) => {
                  const isDeletable = canDeleteTask(task);
                  return (
                    <div
                      key={task.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, task.id)}
                      className={`group cursor-grab space-y-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-all duration-150 hover:border-slate-300 hover:shadow-md active:cursor-grabbing dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700 ${
                        draggedTaskId === task.id ? "opacity-40" : ""
                      }`}
                    >
                      {/* Card Top: Priority & Actions */}
                      <div className="flex items-start justify-between gap-2">
                        <Badge variant="priority" priority={task.priority} />
                        <div className="flex items-center gap-1 opacity-80 transition-opacity group-hover:opacity-100">
                          <button
                            onClick={() => onEditTask(task)}
                            className="rounded-md p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-indigo-600 dark:hover:bg-slate-800"
                            title="Edit Task"
                          >
                            <Edit3 className="h-3.5 w-3.5" />
                          </button>
                          {isDeletable && (
                            <button
                              onClick={() => onDeleteTask(task)}
                              className="rounded-md p-1 text-slate-400 transition-colors hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/40"
                              title="Delete Task"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Card Title & Description */}
                      <div>
                        <h4 className="text-sm leading-snug font-semibold text-slate-900 dark:text-slate-100">
                          {task.title}
                        </h4>
                        {task.description && (
                          <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                            {task.description}
                          </p>
                        )}
                      </div>

                      {/* Card Footer: Assignee & Due Date */}
                      <div className="flex items-center justify-between border-t border-slate-100 pt-2 text-[11px] text-slate-500 dark:border-slate-800/80 dark:text-slate-400">
                        <div className="flex items-center gap-1.5">
                          {task.assignee ? (
                            <div className="flex items-center gap-1 font-medium text-slate-700 dark:text-slate-300">
                              <div className="flex h-4 w-4 items-center justify-center rounded-full bg-indigo-500 text-[9px] font-bold text-white">
                                {task.assignee.name.charAt(0).toUpperCase()}
                              </div>
                              <span className="max-w-[90px] truncate">{task.assignee.name}</span>
                            </div>
                          ) : (
                            <span className="text-slate-400 italic">Unassigned</span>
                          )}
                        </div>

                        {task.dueDate && (
                          <div className="flex items-center gap-1 font-mono">
                            <Clock className="h-3 w-3 text-slate-400" />
                            <span>
                              {new Date(task.dueDate).toLocaleDateString(undefined, {
                                month: "short",
                                day: "numeric",
                              })}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
