"use client";

import * as React from "react";
import { TaskItem, TaskStatus } from "@/types";
import { TaskCard } from "./TaskCard";
import { PlusCircle, SearchX } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface TaskListProps {
  tasks: TaskItem[];
  isLoading: boolean;
  onEdit: (task: TaskItem) => void;
  onDelete: (task: TaskItem) => void;
  onStatusChange: (task: TaskItem, newStatus: TaskStatus) => void;
  onCreateNew: () => void;
  isFiltered: boolean;
}

export const TaskList: React.FC<TaskListProps> = ({
  tasks,
  isLoading,
  onEdit,
  onDelete,
  onStatusChange,
  onCreateNew,
  isFiltered,
}) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map((idx) => (
          <div
            key={idx}
            className="flex h-48 animate-pulse flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/60"
          >
            <div className="space-y-3">
              <div className="flex gap-2">
                <div className="h-5 w-16 rounded-full bg-slate-200 dark:bg-slate-800" />
                <div className="h-5 w-12 rounded bg-slate-200 dark:bg-slate-800" />
              </div>
              <div className="h-5 w-3/4 rounded bg-slate-200 dark:bg-slate-800" />
              <div className="h-3 w-full rounded bg-slate-100 dark:bg-slate-800/60" />
              <div className="h-3 w-2/3 rounded bg-slate-100 dark:bg-slate-800/60" />
            </div>
            <div className="h-4 w-1/3 rounded bg-slate-200 dark:bg-slate-800" />
          </div>
        ))}
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50/60 p-12 text-center dark:border-slate-800 dark:bg-slate-900/30">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 dark:bg-slate-800/60">
          {isFiltered ? <SearchX className="h-6 w-6" /> : <PlusCircle className="h-6 w-6" />}
        </div>
        <h3 className="text-base font-semibold text-slate-900 dark:text-slate-200">
          {isFiltered ? "No matching tasks found" : "No tasks created yet"}
        </h3>
        <p className="mt-1 max-w-sm text-xs text-slate-500 dark:text-slate-400">
          {isFiltered
            ? "Try adjusting your search query or filter options to find what you're looking for."
            : "Get started by creating your very first task to organize your work."}
        </p>
        <div className="mt-5">
          <Button onClick={onCreateNew} size="sm">
            <PlusCircle className="h-4 w-4" />
            Create Task
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      {tasks.map((task) => (
        <TaskCard
          key={task.id}
          task={task}
          onEdit={onEdit}
          onDelete={onDelete}
          onStatusChange={onStatusChange}
        />
      ))}
    </div>
  );
};
