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

export const TaskFilters: React.FC<TaskFiltersProps> = ({
  filters,
  onChange,
  totalResults,
}) => {
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
    <div className="space-y-4 bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 sm:p-5 backdrop-blur-sm">
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={filters.search}
            onChange={handleSearchChange}
            placeholder="Search tasks by title or description..."
            className="w-full pl-10 pr-4 py-2 text-sm bg-slate-950/80 border border-slate-700/80 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
          />
        </div>

        {/* Priority Filter */}
        <div className="flex items-center gap-2">
          <div className="relative min-w-[160px]">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
            <select
              value={filters.priority}
              onChange={handlePriorityChange}
              className="w-full pl-8 pr-8 py-2 text-xs font-medium bg-slate-950/80 border border-slate-700/80 rounded-xl text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 appearance-none cursor-pointer"
            >
              {priorityOptions.map((opt) => (
                <option key={opt.value} value={opt.value} className="bg-slate-900 text-slate-100">
                  {opt.label}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2.5 text-slate-400">
              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 20 20">
                <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
              </svg>
            </div>
          </div>

          {/* Reset Filters button */}
          {isFiltered && (
            <button
              onClick={handleReset}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-700/60 transition-colors"
              title="Reset filters"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800/60">
        <div className="flex flex-wrap items-center gap-1.5">
          {statusTabs.map((tab) => {
            const isActive = filters.status === tab.value;
            return (
              <button
                key={tab.value}
                onClick={() => handleStatusChange(tab.value)}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 cursor-pointer",
                  isActive
                    ? "bg-indigo-600 text-white shadow-sm shadow-indigo-600/30"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
                )}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        <span className="text-xs text-slate-400">
          Showing <span className="font-semibold text-slate-200">{totalResults}</span> task
          {totalResults === 1 ? "" : "s"}
        </span>
      </div>
    </div>
  );
};
