"use client";

import * as React from "react";
import { TaskItem, TaskStatsData } from "@/types";
import { CheckCircle2, Clock, ListTodo, Layers } from "lucide-react";

interface TaskStatsProps {
  tasks: TaskItem[];
}

export const TaskStats: React.FC<TaskStatsProps> = ({ tasks }) => {
  const stats: TaskStatsData = React.useMemo(() => {
    const total = tasks.length;
    const todo = tasks.filter((t) => t.status === "TODO").length;
    const inProgress = tasks.filter((t) => t.status === "IN_PROGRESS").length;
    const done = tasks.filter((t) => t.status === "DONE").length;
    return { total, todo, inProgress, done };
  }, [tasks]);

  const completionRate = stats.total > 0 ? Math.round((stats.done / stats.total) * 100) : 0;

  const cards = [
    {
      label: "Total Tasks",
      value: stats.total,
      icon: Layers,
      color: "text-indigo-400",
      bg: "bg-indigo-950/30 border-indigo-800/40",
      subtext: `${completionRate}% completed`,
    },
    {
      label: "To Do",
      value: stats.todo,
      icon: ListTodo,
      color: "text-slate-400",
      bg: "bg-slate-900/60 border-slate-800",
      subtext: "Awaiting action",
    },
    {
      label: "In Progress",
      value: stats.inProgress,
      icon: Clock,
      color: "text-amber-400",
      bg: "bg-amber-950/20 border-amber-800/30",
      subtext: "Currently active",
    },
    {
      label: "Completed",
      value: stats.done,
      icon: CheckCircle2,
      color: "text-emerald-400",
      bg: "bg-emerald-950/20 border-emerald-800/30",
      subtext: "Tasks finished",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.label}
            className={`p-4 sm:p-5 rounded-xl border ${card.bg} backdrop-blur-sm transition-all duration-200 hover:border-slate-700/80 shadow-sm`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-400">{card.label}</span>
              <Icon className={`w-4 h-4 ${card.color}`} />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                {card.value}
              </span>
            </div>
            <p className="mt-1 text-[11px] text-slate-400">{card.subtext}</p>
          </div>
        );
      })}
    </div>
  );
};
