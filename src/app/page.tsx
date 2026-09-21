"use client";

import * as React from "react";
import { TaskItem, TaskFilterState, TaskStatus } from "@/types";
import { TaskStats } from "@/components/tasks/TaskStats";
import { TaskFilters } from "@/components/tasks/TaskFilters";
import { TaskList } from "@/components/tasks/TaskList";
import { TaskCreateModal } from "@/components/tasks/TaskCreateModal";
import { TaskEditModal } from "@/components/tasks/TaskEditModal";
import { TaskDeleteDialog } from "@/components/tasks/TaskDeleteDialog";
import { Button } from "@/components/ui/Button";
import { PlusCircle, Sparkles, RefreshCw, Users } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

export default function HomePage() {
  const [tasks, setTasks] = React.useState<TaskItem[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isRefreshing, setIsRefreshing] = React.useState(false);

  // Filter & Search State
  const [filters, setFilters] = React.useState<TaskFilterState>({
    status: "ALL",
    priority: "ALL",
    search: "",
  });

  // Modal States
  const [isCreateOpen, setIsCreateOpen] = React.useState(false);
  const [isEditOpen, setIsEditOpen] = React.useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = React.useState(false);
  const [selectedTask, setSelectedTask] = React.useState<TaskItem | null>(null);

  // Initial load with cleanup flag to adhere to React 19 best practices
  React.useEffect(() => {
    let ignore = false;

    async function loadInitialTasks() {
      try {
        const res = await fetch("/api/tasks");
        const json = await res.json();
        if (!ignore && json.success && Array.isArray(json.data)) {
          setTasks(json.data);
        }
      } catch (err) {
        if (!ignore) {
          console.error("Error fetching tasks:", err);
          toast.error("Failed to connect to tasks API.");
        }
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    }

    loadInitialTasks();

    return () => {
      ignore = true;
    };
  }, []);

  const handleRefresh = async () => {
    try {
      setIsRefreshing(true);
      const res = await fetch("/api/tasks");
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setTasks(json.data);
        toast.success("Tasks refreshed from database!");
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to refresh tasks.");
    } finally {
      setIsRefreshing(false);
    }
  };

  // Client-side filtering
  const filteredTasks = React.useMemo(() => {
    return tasks.filter((task) => {
      // Status filter
      if (filters.status !== "ALL" && task.status !== filters.status) {
        return false;
      }
      // Priority filter
      if (filters.priority !== "ALL" && task.priority !== filters.priority) {
        return false;
      }
      // Search filter (title or description)
      if (filters.search.trim() !== "") {
        const query = filters.search.toLowerCase().trim();
        const inTitle = task.title.toLowerCase().includes(query);
        const inDesc = task.description?.toLowerCase().includes(query) || false;
        if (!inTitle && !inDesc) return false;
      }
      return true;
    });
  }, [tasks, filters]);

  // CRUD Handlers with instant state update (no page reload)
  const handleTaskCreated = (newTask: TaskItem) => {
    setTasks((prev) => [newTask, ...prev]);
  };

  const handleTaskUpdated = (updatedTask: TaskItem) => {
    setTasks((prev) => prev.map((t) => (t.id === updatedTask.id ? updatedTask : t)));
  };

  const handleTaskDeleted = (deletedId: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== deletedId));
  };

  const handleQuickStatusChange = async (task: TaskItem, newStatus: TaskStatus) => {
    // Optimistic update
    const previousTasks = [...tasks];
    setTasks((prev) =>
      prev.map((t) => (t.id === task.id ? { ...t, status: newStatus } : t))
    );

    try {
      const res = await fetch(`/api/tasks/${task.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to update status");
      }

      toast.success(`Task moved to ${newStatus.replace("_", " ")}`);
    } catch (err) {
      // Rollback on error
      setTasks(previousTasks);
      toast.error(err instanceof Error ? err.message : "Failed to update task status");
    }
  };

  // Open Edit Modal
  const openEditModal = (task: TaskItem) => {
    setSelectedTask(task);
    setIsEditOpen(true);
  };

  // Open Delete Dialog
  const openDeleteDialog = (task: TaskItem) => {
    setSelectedTask(task);
    setIsDeleteOpen(true);
  };

  const isFiltered =
    filters.status !== "ALL" || filters.priority !== "ALL" || filters.search.trim() !== "";

  return (
    <div className="space-y-8 pb-12">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-50/90 via-white to-slate-50 border border-indigo-100 dark:from-indigo-950/50 dark:via-slate-900/60 dark:to-slate-950 dark:border-indigo-900/40 p-6 sm:p-10 shadow-xl shadow-indigo-100/40 dark:shadow-2xl backdrop-blur-xl transition-all">
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-700 dark:text-indigo-300 text-xs font-semibold tracking-wide">
            <Sparkles className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400" />
            Next.js 15 &bull; Prisma 7 &bull; Supabase PostgreSQL
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight">
            Task & Team Management
          </h1>

          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl">
            A public, full-stack CRUD task management dashboard connected live to Supabase PostgreSQL.
            Create, update, prioritize, and track tasks seamlessly without requiring authentication.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Button
              onClick={() => setIsCreateOpen(true)}
              variant="primary"
              size="md"
              className="shadow-lg shadow-indigo-600/30"
            >
              <PlusCircle className="w-4 h-4" />
              Create Task
            </Button>

            <Link href="/teams">
              <Button variant="secondary" size="md">
                <Users className="w-4 h-4" />
                Explore Teams (Ass2 Preview)
              </Button>
            </Link>

            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="p-2.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 transition-colors cursor-pointer"
              title="Refresh tasks from database"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`} />
            </button>
          </div>
        </div>

        {/* Ambient background glow */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-indigo-500/10 dark:bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />
      </section>

      {/* Task Statistics */}
      <section>
        <TaskStats tasks={tasks} />
      </section>

      {/* Task Filter & Search Bar */}
      <section>
        <TaskFilters
          filters={filters}
          onChange={setFilters}
          totalResults={filteredTasks.length}
        />
      </section>

      {/* Task List / Grid */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <span>Tasks</span>
            <span className="text-xs font-normal text-slate-500 dark:text-slate-400">
              ({filteredTasks.length} {filteredTasks.length === 1 ? "task" : "tasks"})
            </span>
          </h2>

          <Button onClick={() => setIsCreateOpen(true)} variant="outline" size="sm">
            <PlusCircle className="w-3.5 h-3.5" />
            Add Task
          </Button>
        </div>

        <TaskList
          tasks={filteredTasks}
          isLoading={isLoading}
          onEdit={openEditModal}
          onDelete={openDeleteDialog}
          onStatusChange={handleQuickStatusChange}
          onCreateNew={() => setIsCreateOpen(true)}
          isFiltered={isFiltered}
        />
      </section>

      {/* Modals */}
      <TaskCreateModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onTaskCreated={handleTaskCreated}
      />

      <TaskEditModal
        task={selectedTask}
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        onTaskUpdated={handleTaskUpdated}
      />

      <TaskDeleteDialog
        task={selectedTask}
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onTaskDeleted={handleTaskDeleted}
      />
    </div>
  );
}
