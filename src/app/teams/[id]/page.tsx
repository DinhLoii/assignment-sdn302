"use client";

import * as React from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { TeamItem, TeamMemberItem, TaskItem, TaskStatus } from "@/types";
import { KanbanBoard } from "@/components/tasks/KanbanBoard";
import { TeamTaskCreateModal } from "@/components/tasks/TeamTaskCreateModal";
import { TeamTaskEditModal } from "@/components/tasks/TeamTaskEditModal";
import { AddMemberModal } from "@/components/teams/AddMemberModal";
import { EditTeamModal } from "@/components/teams/EditTeamModal";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import {
  ArrowLeft,
  Crown,
  UserCheck,
  Plus,
  Trash2,
  Edit2,
  LayoutGrid,
  List,
  Search,
  UserPlus,
  Clock,
} from "lucide-react";
import { toast } from "sonner";

export default function TeamDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user, isLoading: isAuthLoading } = useAuth();
  const teamId = params.id as string;

  const [team, setTeam] = React.useState<TeamItem | null>(null);
  const [tasks, setTasks] = React.useState<TaskItem[]>([]);
  const [members, setMembers] = React.useState<TeamMemberItem[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  // Active Tab: "tasks" | "members"
  const [activeTab, setActiveTab] = React.useState<"tasks" | "members">("tasks");

  // View Mode: "kanban" | "table"
  const [viewMode, setViewMode] = React.useState<"kanban" | "table">("kanban");

  // Filters & Search
  const [searchQuery, setSearchQuery] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<string>("ALL");
  const [priorityFilter, setPriorityFilter] = React.useState<string>("ALL");
  const [assigneeFilter, setAssigneeFilter] = React.useState<string>("ALL");

  // Modals
  const [isCreateTaskOpen, setIsCreateTaskOpen] = React.useState(false);
  const [isEditTaskOpen, setIsEditTaskOpen] = React.useState(false);
  const [selectedTask, setSelectedTask] = React.useState<TaskItem | null>(null);
  const [isAddMemberOpen, setIsAddMemberOpen] = React.useState(false);
  const [isEditTeamOpen, setIsEditTeamOpen] = React.useState(false);
  const [isDeletingTeam, setIsDeletingTeam] = React.useState(false);

  const fetchTeamData = React.useCallback(async () => {
    try {
      const res = await fetch(`/api/teams/${teamId}`);
      if (res.status === 401) {
        router.push("/login");
        return;
      }
      if (res.status === 403) {
        toast.error("You are not a member of this team");
        router.push("/teams");
        return;
      }
      const data = await res.json();
      if (data.success && data.data) {
        setTeam(data.data);
        setMembers(data.data.members || []);
        setTasks(data.data.tasks || []);
      }
    } catch (err) {
      console.error("Error loading team:", err);
      toast.error("Failed to load team details");
    } finally {
      setIsLoading(false);
    }
  }, [teamId, router]);

  React.useEffect(() => {
    if (!isAuthLoading) {
      if (!user) {
        router.push("/login");
      } else {
        fetchTeamData();
      }
    }
  }, [user, isAuthLoading, router, fetchTeamData]);

  const isOwner = team?.ownerId === user?.id || team?.currentUserRole === "OWNER";

  // Task Status Update (e.g. from Kanban drag-and-drop or select)
  const handleTaskStatusChange = async (taskId: string, newStatus: TaskStatus) => {
    const previousTasks = [...tasks];
    setTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t)));

    try {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setTasks(previousTasks);
        toast.error(data.error || "Failed to update task status");
      } else {
        toast.success(`Task moved to ${newStatus.replace("_", " ")}`);
      }
    } catch {
      setTasks(previousTasks);
      toast.error("Network error while updating task");
    }
  };

  // Delete Task
  const handleDeleteTask = async (task: TaskItem) => {
    if (!confirm(`Are you sure you want to delete task "${task.title}"?`)) return;

    try {
      const res = await fetch(`/api/tasks/${task.id}`, {
        method: "DELETE",
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setTasks((prev) => prev.filter((t) => t.id !== task.id));
        toast.success("Task deleted successfully");
      } else {
        toast.error(data.error || "Failed to delete task");
      }
    } catch {
      toast.error("Network error while deleting task");
    }
  };

  // Remove Member
  const handleRemoveMember = async (member: TeamMemberItem) => {
    if (!confirm(`Remove ${member.user.name} (${member.user.email}) from this team?`)) return;

    try {
      const res = await fetch(`/api/teams/${teamId}/members/${member.user.id}`, {
        method: "DELETE",
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setMembers((prev) => prev.filter((m) => m.userId !== member.user.id));
        // Also unassign tasks in local state
        setTasks((prev) =>
          prev.map((t) =>
            t.assigneeId === member.user.id ? { ...t, assigneeId: null, assignee: null } : t
          )
        );
        toast.success("Member removed from team");
      } else {
        toast.error(data.error || "Failed to remove member");
      }
    } catch {
      toast.error("Network error while removing member");
    }
  };

  // Delete Team
  const handleDeleteTeam = async () => {
    if (
      !confirm(
        `Are you sure you want to permanently delete the team "${team?.name}"? All associated tasks and memberships will be deleted.`
      )
    )
      return;

    try {
      setIsDeletingTeam(true);
      const res = await fetch(`/api/teams/${teamId}`, {
        method: "DELETE",
      });
      const data = await res.json();

      if (res.ok && data.success) {
        toast.success("Team deleted successfully");
        router.push("/teams");
      } else {
        toast.error(data.error || "Failed to delete team");
      }
    } catch {
      toast.error("Network error while deleting team");
    } finally {
      setIsDeletingTeam(false);
    }
  };

  // Filter tasks
  const filteredTasks = React.useMemo(() => {
    return tasks.filter((task) => {
      if (statusFilter !== "ALL" && task.status !== statusFilter) return false;
      if (priorityFilter !== "ALL" && task.priority !== priorityFilter) return false;
      if (assigneeFilter !== "ALL") {
        if (assigneeFilter === "UNASSIGNED" && task.assigneeId) return false;
        if (assigneeFilter !== "UNASSIGNED" && task.assigneeId !== assigneeFilter) return false;
      }
      if (searchQuery.trim() !== "") {
        const q = searchQuery.toLowerCase().trim();
        const matchTitle = task.title.toLowerCase().includes(q);
        const matchDesc = task.description?.toLowerCase().includes(q) || false;
        if (!matchTitle && !matchDesc) return false;
      }
      return true;
    });
  }, [tasks, statusFilter, priorityFilter, assigneeFilter, searchQuery]);

  if (isAuthLoading || isLoading) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center space-y-4">
        <div className="h-10 w-10 animate-spin rounded-full border-3 border-indigo-600 border-t-transparent" />
        <p className="text-sm text-slate-500">Loading team workspace...</p>
      </div>
    );
  }

  if (!team) return null;

  return (
    <div className="mx-auto max-w-6xl space-y-6 py-6 sm:py-8">
      {/* Back button */}
      <div>
        <Link
          href="/teams"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 transition-colors hover:text-indigo-600 dark:hover:text-indigo-400"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to All Teams
        </Link>
      </div>

      {/* Team Header Banner */}
      <div className="space-y-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8 dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl dark:text-white">
                {team.name}
              </h1>

              <span
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${
                  isOwner
                    ? "border border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800/60 dark:bg-amber-950/80 dark:text-amber-400"
                    : "border border-indigo-200 bg-indigo-50 text-indigo-700 dark:border-indigo-800/60 dark:bg-indigo-950/80 dark:text-indigo-400"
                }`}
              >
                {isOwner ? (
                  <Crown className="h-3.5 w-3.5" />
                ) : (
                  <UserCheck className="h-3.5 w-3.5" />
                )}
                {isOwner ? "Owner (Admin)" : "Member"}
              </span>
            </div>

            <p className="max-w-2xl text-sm leading-relaxed text-slate-600 dark:text-slate-400">
              {team.description || "No description set for this team workspace."}
            </p>

            <div className="flex items-center gap-4 pt-1 text-xs text-slate-500">
              <span>
                Owner:{" "}
                <strong className="text-slate-700 dark:text-slate-300">
                  {team.owner?.name || "Unknown"}
                </strong>
              </span>
              <span>•</span>
              <span>{members.length} Members</span>
              <span>•</span>
              <span>{tasks.length} Tasks</span>
            </div>
          </div>

          {/* Owner Management Buttons */}
          {isOwner && (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditTeamOpen(true)}
                className="cursor-pointer"
              >
                <Edit2 className="h-3.5 w-3.5" />
                Edit Team
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDeleteTeam}
                isLoading={isDeletingTeam}
                className="cursor-pointer border-rose-200 text-rose-600 hover:bg-rose-50 dark:border-rose-900/60 dark:hover:bg-rose-950/40"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Delete Team
              </Button>
            </div>
          )}
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-2 border-t border-slate-100 pt-4 dark:border-slate-800/80">
          <button
            onClick={() => setActiveTab("tasks")}
            className={`cursor-pointer rounded-xl px-4 py-2 text-sm font-bold transition-all ${
              activeTab === "tasks"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                : "text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
            }`}
          >
            Tasks & Workflow ({tasks.length})
          </button>
          <button
            onClick={() => setActiveTab("members")}
            className={`cursor-pointer rounded-xl px-4 py-2 text-sm font-bold transition-all ${
              activeTab === "members"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                : "text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
            }`}
          >
            Team Members ({members.length})
          </button>
        </div>
      </div>

      {/* ===================== TAB 1: TASKS ===================== */}
      {activeTab === "tasks" && (
        <div className="space-y-6">
          {/* Controls Bar: Search, Filters, View Mode, New Task */}
          <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5 dark:border-slate-800 dark:bg-slate-900">
            <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
              {/* Search Bar */}
              <div className="relative max-w-md flex-1">
                <Search className="pointer-events-none absolute top-3 left-3 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search tasks by title or details..."
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pr-3.5 pl-9 text-sm text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                />
              </div>

              {/* View Switcher & Create Task Button */}
              <div className="flex items-center gap-2">
                <div className="flex items-center rounded-xl border border-slate-200 bg-slate-100 p-1 dark:border-slate-700/60 dark:bg-slate-800/80">
                  <button
                    onClick={() => setViewMode("kanban")}
                    className={`flex cursor-pointer items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                      viewMode === "kanban"
                        ? "bg-white text-indigo-600 shadow-sm dark:bg-slate-900 dark:text-indigo-400"
                        : "text-slate-500 hover:text-slate-800 dark:hover:text-white"
                    }`}
                  >
                    <LayoutGrid className="h-3.5 w-3.5" />
                    Kanban Board
                  </button>
                  <button
                    onClick={() => setViewMode("table")}
                    className={`flex cursor-pointer items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                      viewMode === "table"
                        ? "bg-white text-indigo-600 shadow-sm dark:bg-slate-900 dark:text-indigo-400"
                        : "text-slate-500 hover:text-slate-800 dark:hover:text-white"
                    }`}
                  >
                    <List className="h-3.5 w-3.5" />
                    Table View
                  </button>
                </div>

                <Button
                  variant="primary"
                  size="md"
                  onClick={() => setIsCreateTaskOpen(true)}
                  className="cursor-pointer"
                >
                  <Plus className="h-4 w-4" />
                  New Task
                </Button>
              </div>
            </div>

            {/* Filter Pills Row */}
            <div className="flex flex-wrap items-center gap-3 border-t border-slate-100 pt-2 text-xs dark:border-slate-800/60">
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-semibold text-slate-400 uppercase">Status:</span>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs text-slate-800 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="TODO">To Do</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="DONE">Done</option>
                </select>
              </div>

              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-semibold text-slate-400 uppercase">
                  Priority:
                </span>
                <select
                  value={priorityFilter}
                  onChange={(e) => setPriorityFilter(e.target.value)}
                  className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs text-slate-800 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                >
                  <option value="ALL">All Priorities</option>
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                </select>
              </div>

              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-semibold text-slate-400 uppercase">
                  Assignee:
                </span>
                <select
                  value={assigneeFilter}
                  onChange={(e) => setAssigneeFilter(e.target.value)}
                  className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs text-slate-800 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                >
                  <option value="ALL">All Assignees</option>
                  <option value="UNASSIGNED">Unassigned</option>
                  {members.map((m) => (
                    <option key={m.userId} value={m.userId}>
                      {m.user.name}
                    </option>
                  ))}
                </select>
              </div>

              {(statusFilter !== "ALL" ||
                priorityFilter !== "ALL" ||
                assigneeFilter !== "ALL" ||
                searchQuery) && (
                <button
                  onClick={() => {
                    setStatusFilter("ALL");
                    setPriorityFilter("ALL");
                    setAssigneeFilter("ALL");
                    setSearchQuery("");
                  }}
                  className="ml-auto cursor-pointer text-xs font-semibold text-indigo-600 hover:underline dark:text-indigo-400"
                >
                  Reset Filters
                </button>
              )}
            </div>
          </div>

          {/* View Content */}
          {viewMode === "kanban" ? (
            <KanbanBoard
              tasks={filteredTasks}
              currentUser={user}
              teamOwnerId={team.ownerId}
              onEditTask={(task) => {
                setSelectedTask(task);
                setIsEditTaskOpen(true);
              }}
              onDeleteTask={handleDeleteTask}
              onStatusChange={handleTaskStatusChange}
            />
          ) : (
            /* Table View */
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="border-b border-slate-200 bg-slate-50 text-xs font-semibold text-slate-500 uppercase dark:border-slate-800 dark:bg-slate-950/60">
                    <tr>
                      <th className="px-5 py-3.5">Task</th>
                      <th className="px-5 py-3.5">Status</th>
                      <th className="px-5 py-3.5">Priority</th>
                      <th className="px-5 py-3.5">Assignee</th>
                      <th className="px-5 py-3.5">Due Date</th>
                      <th className="px-5 py-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                    {filteredTasks.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-5 py-10 text-center text-xs text-slate-400">
                          No tasks match the active filters or search query.
                        </td>
                      </tr>
                    ) : (
                      filteredTasks.map((task) => {
                        const canDelete =
                          user &&
                          (task.creatorId === user.id ||
                            task.assigneeId === user.id ||
                            team.ownerId === user.id);

                        return (
                          <tr
                            key={task.id}
                            className="transition-colors hover:bg-slate-50/50 dark:hover:bg-slate-800/30"
                          >
                            <td className="max-w-xs px-5 py-4">
                              <div className="truncate font-semibold text-slate-900 dark:text-white">
                                {task.title}
                              </div>
                              {task.description && (
                                <div className="mt-0.5 truncate text-xs text-slate-500">
                                  {task.description}
                                </div>
                              )}
                            </td>
                            <td className="px-5 py-4">
                              <Badge variant="status" status={task.status} />
                            </td>
                            <td className="px-5 py-4">
                              <Badge variant="priority" priority={task.priority} />
                            </td>
                            <td className="px-5 py-4">
                              {task.assignee ? (
                                <div className="flex items-center gap-1.5 text-xs text-slate-700 dark:text-slate-300">
                                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-indigo-500 text-[10px] font-bold text-white">
                                    {task.assignee.name.charAt(0).toUpperCase()}
                                  </div>
                                  <span>{task.assignee.name}</span>
                                </div>
                              ) : (
                                <span className="text-xs text-slate-400 italic">Unassigned</span>
                              )}
                            </td>
                            <td className="px-5 py-4 text-xs text-slate-500">
                              {task.dueDate ? (
                                <div className="flex items-center gap-1">
                                  <Clock className="h-3.5 w-3.5 text-slate-400" />
                                  <span>{new Date(task.dueDate).toLocaleDateString()}</span>
                                </div>
                              ) : (
                                "—"
                              )}
                            </td>
                            <td className="px-5 py-4 text-right">
                              <div className="flex items-center justify-end gap-1">
                                <button
                                  onClick={() => {
                                    setSelectedTask(task);
                                    setIsEditTaskOpen(true);
                                  }}
                                  className="cursor-pointer rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-indigo-600 dark:hover:bg-slate-800"
                                  title="Edit Task"
                                >
                                  <Edit2 className="h-4 w-4" />
                                </button>
                                {canDelete && (
                                  <button
                                    onClick={() => handleDeleteTask(task)}
                                    className="cursor-pointer rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/40"
                                    title="Delete Task"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ===================== TAB 2: MEMBERS ===================== */}
      {activeTab === "members" && (
        <div className="space-y-6">
          <div className="flex flex-col justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center dark:border-slate-800 dark:bg-slate-900">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Team Members & Permissions
              </h3>
              <p className="mt-0.5 text-xs text-slate-500">
                Each member can create tasks, update statuses, and collaborate on this project.
              </p>
            </div>

            {isOwner && (
              <Button
                variant="primary"
                size="md"
                onClick={() => setIsAddMemberOpen(true)}
                className="cursor-pointer"
              >
                <UserPlus className="h-4 w-4" />
                Add Member by Email
              </Button>
            )}
          </div>

          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-slate-200 bg-slate-50 text-xs font-semibold text-slate-500 uppercase dark:border-slate-800 dark:bg-slate-950/60">
                  <tr>
                    <th className="px-5 py-3.5">User</th>
                    <th className="px-5 py-3.5">Email</th>
                    <th className="px-5 py-3.5">Role</th>
                    <th className="px-5 py-3.5">Joined Date</th>
                    {isOwner && <th className="px-5 py-3.5 text-right">Actions</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                  {members.map((m) => {
                    const isMemberOwner = m.role === "OWNER" || m.userId === team.ownerId;
                    return (
                      <tr
                        key={m.id}
                        className="transition-colors hover:bg-slate-50/50 dark:hover:bg-slate-800/30"
                      >
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 text-xs font-bold text-white shadow-sm">
                              {m.user.name.charAt(0).toUpperCase()}
                            </div>
                            <span className="font-semibold text-slate-900 dark:text-white">
                              {m.user.name}{" "}
                              {m.userId === user?.id && (
                                <span className="text-xs text-slate-400">(You)</span>
                              )}
                            </span>
                          </div>
                        </td>

                        <td className="px-5 py-4 font-mono text-xs text-slate-600 dark:text-slate-300">
                          {m.user.email}
                        </td>

                        <td className="px-5 py-4">
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-bold ${
                              isMemberOwner
                                ? "border border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800/60 dark:bg-amber-950/80 dark:text-amber-400"
                                : "border border-indigo-200 bg-indigo-50 text-indigo-700 dark:border-indigo-800/60 dark:bg-indigo-950/80 dark:text-indigo-400"
                            }`}
                          >
                            {isMemberOwner ? (
                              <Crown className="h-3 w-3" />
                            ) : (
                              <UserCheck className="h-3 w-3" />
                            )}
                            {isMemberOwner ? "Owner" : "Member"}
                          </span>
                        </td>

                        <td className="px-5 py-4 text-xs text-slate-500">
                          {new Date(m.joinedAt).toLocaleDateString()}
                        </td>

                        {isOwner && (
                          <td className="px-5 py-4 text-right">
                            {!isMemberOwner ? (
                              <button
                                onClick={() => handleRemoveMember(m)}
                                className="cursor-pointer rounded-lg border border-rose-200 px-2.5 py-1 text-xs font-semibold text-rose-600 transition-colors hover:bg-rose-50 dark:border-rose-900/60 dark:text-rose-400 dark:hover:bg-rose-950/40"
                              >
                                Remove
                              </button>
                            ) : (
                              <span className="text-xs text-slate-400 italic">Owner</span>
                            )}
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Task Create Modal */}
      <TeamTaskCreateModal
        isOpen={isCreateTaskOpen}
        onClose={() => setIsCreateTaskOpen(false)}
        teamId={teamId}
        members={members}
        onTaskCreated={(newTask) => {
          setTasks((prev) => [newTask, ...prev]);
        }}
      />

      {/* Task Edit Modal */}
      {selectedTask && (
        <TeamTaskEditModal
          isOpen={isEditTaskOpen}
          onClose={() => {
            setIsEditTaskOpen(false);
            setSelectedTask(null);
          }}
          task={selectedTask}
          members={members}
          onTaskUpdated={(updatedTask) => {
            setTasks((prev) => prev.map((t) => (t.id === updatedTask.id ? updatedTask : t)));
          }}
        />
      )}

      {/* Add Member Modal */}
      <AddMemberModal
        isOpen={isAddMemberOpen}
        onClose={() => setIsAddMemberOpen(false)}
        teamId={teamId}
        onMemberAdded={(newMember) => {
          setMembers((prev) => [...prev, newMember]);
        }}
      />

      {/* Edit Team Modal */}
      <EditTeamModal
        isOpen={isEditTeamOpen}
        onClose={() => setIsEditTeamOpen(false)}
        team={team}
        onTeamUpdated={(updated) => {
          setTeam((prev) => (prev ? { ...prev, ...updated } : null));
        }}
      />
    </div>
  );
}
