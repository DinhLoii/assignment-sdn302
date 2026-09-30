"use client";

import * as React from "react";
import { TaskFilterState, TaskPriority, TaskStatus } from "@/types";
import { Search, Filter, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";

interface TaskFiltersProps {
  filters: TaskFilterState;
  onChange: (filters: TaskFilterState) => void;
  totalResults: number;
}

export const TaskFilters: React.FC<TaskFiltersProps> = ({ filters, onChange, totalResults }) => {
  const statusTabs: Array<{ label: string; value: "ALL" | TaskStatus }> = [
    { label: "All Tasks", value: "ALL" },
    { label: "To Do", value: "TODO" },
    { label: "In Progress", value: "IN_PROGRESS" },
    { label: "Done", value: "DONE" },
  ];

  const priorityOptions: Array<{ label: string; value: "ALL" | TaskPriority }> = [
    { label: "All Priorities", value: "ALL" },
    { label: "High Priority", value: "HIGH" },
    { label: "Medium Priority", value: "MEDIUM" },
    { label: "Low Priority", value: "LOW" },
  ];

  const handleStatusChange = (status: "ALL" | TaskStatus) => {
    onChange({ ...filters, status });
  };

  const handlePriorityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange({ ...filters, priority: e.target.value as "ALL" | TaskPriority });
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({ ...filters, search: e.target.value });
  };

  const handleReset = () => {
    onChange({ status: "ALL", priority: "ALL", search: "" });
  };

  const isFiltered =
    filters.status !== "ALL" || filters.priority !== "ALL" || filters.search.trim() !== "";

  return (
    <div className="space-y-4 rounded-2xl border border-slate-200 bg-white/80 p-4 shadow-sm backdrop-blur-sm transition-colors sm:p-5 dark:border-slate-800/80 dark:bg-slate-900/60">
      <div className="flex flex-col items-stretch justify-between gap-3 md:flex-row md:items-center">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={filters.search}
            onChange={handleSearchChange}
            placeholder="Search tasks by title or description..."
            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pr-4 pl-10 text-sm text-slate-900 placeholder-slate-400 transition-all focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 focus:outline-none dark:border-slate-700/80 dark:bg-slate-950/80 dark:text-slate-100 dark:placeholder-slate-500"
          />
        </div>

        {/* Priority Filter */}
        <div className="flex items-center gap-2">
          <div className="relative min-w-[160px]">
            <Filter className="pointer-events-none absolute top-1/2 left-3 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
            <select
              value={filters.priority}
              onChange={handlePriorityChange}
              className="w-full cursor-pointer appearance-none rounded-xl border border-slate-200 bg-slate-50 py-2 pr-8 pl-8 text-xs font-medium text-slate-700 focus:ring-2 focus:ring-indigo-500 focus:outline-none dark:border-slate-700/80 dark:bg-slate-950/80 dark:text-slate-200"
            >
              {priorityOptions.map((opt) => (
                <option
                  key={opt.value}
                  value={opt.value}
                  className="bg-white text-slate-900 dark:bg-slate-900 dark:text-slate-100"
                >
                  {opt.label}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2.5 text-slate-400">
              <svg className="h-3.5 w-3.5 fill-current" viewBox="0 0 20 20">
                <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
              </svg>
            </div>
          </div>

          {/* Reset Filters button */}
          {isFiltered && (
            <button
              onClick={handleReset}
              className="rounded-xl border border-slate-200 p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:border-slate-700/60 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
              title="Reset filters"
            >
              <RotateCcw className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-2 dark:border-slate-800/60">
        <div className="flex flex-wrap items-center gap-1.5">
          {statusTabs.map((tab) => {
            const isActive = filters.status === tab.value;
            return (
              <button
                key={tab.value}
                onClick={() => handleStatusChange(tab.value)}
                className={cn(
                  "cursor-pointer rounded-lg px-3 py-1.5 text-xs font-medium transition-all duration-150",
                  isActive
                    ? "bg-indigo-600 text-white shadow-sm shadow-indigo-600/30"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/60 dark:hover:text-slate-200"
                )}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        <span className="text-xs text-slate-500 dark:text-slate-400">
          Showing{" "}
          <span className="font-semibold text-slate-900 dark:text-slate-200">{totalResults}</span>{" "}
          task
          {totalResults === 1 ? "" : "s"}
        </span>
      </div>
    </div>
  );
};
