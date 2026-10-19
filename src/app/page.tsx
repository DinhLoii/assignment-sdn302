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
import { useAuth } from "@/context/AuthContext";

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
        if (!ignore && json.success && json.data?.tasks) {
          setTasks(json.data.tasks);
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
      if (json.success && json.data?.tasks) {
        setTasks(json.data.tasks);
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
    setTasks((prev) => prev.map((t) => (t.id === task.id ? { ...t, status: newStatus } : t)));

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

      if (json.data) {
        setTasks((prev) => prev.map((t) => (t.id === task.id ? { ...t, ...json.data } : t)));
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

  const { user } = useAuth();

  return (
    <div className="space-y-8 pb-12">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl border border-indigo-100 bg-gradient-to-br from-indigo-50/90 via-white to-slate-50 p-6 shadow-xl shadow-indigo-100/40 backdrop-blur-xl transition-all sm:p-10 dark:border-indigo-900/40 dark:from-indigo-950/50 dark:via-slate-900/60 dark:to-slate-950 dark:shadow-2xl">
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/20 bg-indigo-500/10 px-3 py-1 text-xs font-semibold tracking-wide text-indigo-700 dark:text-indigo-300">
            <Sparkles className="h-3.5 w-3.5 text-indigo-500 dark:text-indigo-400" />
            Assignment 3 & 4 &bull; Real-time WebSockets &bull; Team Chat &bull; Live Kanban &bull;
            In-App Notifications
          </div>

          <h1 className="text-3xl leading-tight font-extrabold tracking-tight text-slate-900 sm:text-5xl dark:text-white">
            Real-time Task & Team Management
          </h1>

          <p className="max-w-2xl text-sm leading-relaxed text-slate-600 sm:text-base dark:text-slate-300">
            {user ? (
              <>
                Welcome back,{" "}
                <strong className="text-indigo-600 dark:text-indigo-400">{user.name}</strong>!
                Collaborate in real time with your teams: chat with teammates, move tasks on
                live-updating Kanban boards, and receive instant in-app notifications.
              </>
            ) : (
              <>
                A modern real-time collaboration platform featuring instant team chat, live-updating
                Kanban boards across sessions, in-app notification center, and advanced 3-tier role
                permissions (Owner, Admin, Member).
              </>
            )}
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Link href="/teams">
              <Button
                variant="primary"
                size="md"
                className="cursor-pointer shadow-lg shadow-indigo-600/30"
              >
                <Users className="h-4 w-4" />
                Go to Teams Workspace
              </Button>
            </Link>

            <Button
              onClick={() => setIsCreateOpen(true)}
              variant="outline"
              size="md"
              className="cursor-pointer"
            >
              <PlusCircle className="h-4 w-4" />
              Quick Add Task
            </Button>

            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="cursor-pointer rounded-lg border border-slate-200 p-2.5 text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:border-slate-700/60 dark:text-slate-400 dark:hover:bg-slate-800/60 dark:hover:text-white"
              title="Refresh tasks from database"
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
            </button>
          </div>
        </div>

        {/* Ambient background glow */}
        <div className="pointer-events-none absolute -top-24 -right-24 h-96 w-96 rounded-full bg-indigo-500/10 blur-3xl dark:bg-indigo-500/15" />
      </section>

      {/* Task Statistics */}
      <section>
        <TaskStats tasks={tasks} />
      </section>

      {/* Task Filter & Search Bar */}
      <section>
        <TaskFilters filters={filters} onChange={setFilters} totalResults={filteredTasks.length} />
      </section>

      {/* Task List / Grid */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-900 dark:text-slate-100">
            <span>Tasks</span>
            <span className="text-xs font-normal text-slate-500 dark:text-slate-400">
              ({filteredTasks.length} {filteredTasks.length === 1 ? "task" : "tasks"})
            </span>
          </h2>

          <Button onClick={() => setIsCreateOpen(true)} variant="outline" size="sm">
            <PlusCircle className="h-3.5 w-3.5" />
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
