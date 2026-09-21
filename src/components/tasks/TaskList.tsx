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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5, 6].map((idx) => (
          <div
            key={idx}
            className="h-48 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 p-5 animate-pulse flex flex-col justify-between shadow-sm"
          >
            <div className="space-y-3">
              <div className="flex gap-2">
                <div className="h-5 w-16 bg-slate-200 dark:bg-slate-800 rounded-full" />
                <div className="h-5 w-12 bg-slate-200 dark:bg-slate-800 rounded" />
              </div>
              <div className="h-5 w-3/4 bg-slate-200 dark:bg-slate-800 rounded" />
              <div className="h-3 w-full bg-slate-100 dark:bg-slate-800/60 rounded" />
              <div className="h-3 w-2/3 bg-slate-100 dark:bg-slate-800/60 rounded" />
            </div>
            <div className="h-4 w-1/3 bg-slate-200 dark:bg-slate-800 rounded" />
          </div>
        ))}
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/30">
        <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800/60 flex items-center justify-center text-slate-400 mb-4">
          {isFiltered ? <SearchX className="w-6 h-6" /> : <PlusCircle className="w-6 h-6" />}
        </div>
        <h3 className="text-base font-semibold text-slate-900 dark:text-slate-200">
          {isFiltered ? "No matching tasks found" : "No tasks created yet"}
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm">
          {isFiltered
            ? "Try adjusting your search query or filter options to find what you're looking for."
            : "Get started by creating your very first task to organize your work."}
        </p>
        <div className="mt-5">
          <Button onClick={onCreateNew} size="sm">
            <PlusCircle className="w-4 h-4" />
            Create Task
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
