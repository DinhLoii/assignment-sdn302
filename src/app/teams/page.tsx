"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { TeamItem } from "@/types";
import { CreateTeamModal } from "@/components/teams/CreateTeamModal";
import { Button } from "@/components/ui/Button";
import { Users, Plus, Crown, UserCheck, CheckSquare, ArrowRight, RefreshCw } from "lucide-react";
import { toast } from "sonner";

export default function TeamsPage() {
  const router = useRouter();
  const { user, isLoading: isAuthLoading } = useAuth();

  const [teams, setTeams] = React.useState<TeamItem[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isRefreshing, setIsRefreshing] = React.useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = React.useState(false);

  const fetchTeams = React.useCallback(async () => {
    try {
      const res = await fetch("/api/teams");
      if (res.status === 401) {
        router.push("/login");
        return;
      }
      const data = await res.json();
      if (data.success && data.data?.teams) {
        setTeams(data.data.teams);
      }
    } catch (err) {
      console.error("Error fetching teams:", err);
      toast.error("Failed to load your teams");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [router]);

  React.useEffect(() => {
    if (!isAuthLoading) {
      if (!user) {
        router.push("/login");
      } else {
        fetchTeams();
      }
    }
  }, [user, isAuthLoading, router, fetchTeams]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchTeams();
    toast.success("Teams reloaded");
  };

  const handleTeamCreated = (newTeam: TeamItem) => {
    setTeams((prev) => [newTeam, ...prev]);
  };

  const ownedCount = teams.filter(
    (t) => t.currentUserRole === "OWNER" || t.ownerId === user?.id
  ).length;
  const memberCount = teams.length - ownedCount;

  if (isAuthLoading || isLoading) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center space-y-4">
        <div className="h-10 w-10 animate-spin rounded-full border-3 border-indigo-600 border-t-transparent" />
        <p className="text-sm text-slate-500">Loading your team workspaces...</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-8 py-6 sm:py-10">
      {/* Top Header */}
      <div className="flex flex-col justify-between gap-4 border-b border-slate-200 pb-6 sm:flex-row sm:items-center dark:border-slate-800">
        <div>
          <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs font-semibold tracking-wider text-indigo-700 uppercase dark:border-indigo-800/50 dark:bg-indigo-950/60 dark:text-indigo-400">
            <Users className="h-3.5 w-3.5" />
            Collaboration Workspaces
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-4xl dark:text-white">
            Your Teams & Workspaces
          </h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            Manage your teams, invite colleagues, and coordinate task progress in real time.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="md"
            onClick={handleRefresh}
            isLoading={isRefreshing}
            className="cursor-pointer"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>

          <Button
            variant="primary"
            size="md"
            onClick={() => setIsCreateModalOpen(true)}
            className="cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            Create Team
          </Button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-indigo-100 bg-indigo-50 text-indigo-600 dark:border-indigo-900 dark:bg-indigo-950/50 dark:text-indigo-400">
            <Users className="h-6 w-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900 dark:text-white">{teams.length}</div>
            <div className="text-xs font-medium text-slate-500">Total Workspaces</div>
          </div>
        </div>

        <div className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-amber-100 bg-amber-50 text-amber-600 dark:border-amber-900 dark:bg-amber-950/50 dark:text-amber-400">
            <Crown className="h-6 w-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900 dark:text-white">{ownedCount}</div>
            <div className="text-xs font-medium text-slate-500">Teams Owned (Admin)</div>
          </div>
        </div>

        <div className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-emerald-100 bg-emerald-50 text-emerald-600 dark:border-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-400">
            <UserCheck className="h-6 w-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900 dark:text-white">{memberCount}</div>
            <div className="text-xs font-medium text-slate-500">Teams Joined</div>
          </div>
        </div>
      </div>

      {/* Teams Grid */}
      {teams.length === 0 ? (
        <div className="space-y-4 rounded-3xl border-2 border-dashed border-slate-200 bg-slate-50/50 py-16 text-center dark:border-slate-800 dark:bg-slate-900/20">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400">
            <Users className="h-7 w-7" />
          </div>
          <div className="mx-auto max-w-md space-y-1">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">No Teams Found</h3>
            <p className="text-sm text-slate-500">
              You do not belong to any team workspace yet. Create a new team or ask a team owner to
              invite your email!
            </p>
          </div>
          <Button
            variant="primary"
            size="md"
            onClick={() => setIsCreateModalOpen(true)}
            className="cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            Create Your First Team
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {teams.map((team) => {
            const isOwner = team.currentUserRole === "OWNER" || team.ownerId === user?.id;

            return (
              <Link
                key={team.id}
                href={`/teams/${team.id}`}
                className="group flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-6 shadow-sm backdrop-blur-sm transition-all duration-200 hover:border-indigo-400 hover:shadow-lg dark:border-slate-800 dark:bg-slate-900 dark:hover:border-indigo-600"
              >
                <div className="space-y-3">
                  {/* Card Header: Role Badge */}
                  <div className="flex items-center justify-between">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold ${
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
                      {isOwner ? "Owner" : "Member"}
                    </span>

                    <span className="text-[11px] text-slate-400">
                      {new Date(team.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  {/* Team Title & Description */}
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 transition-colors group-hover:text-indigo-600 dark:text-white dark:group-hover:text-indigo-400">
                      {team.name}
                    </h3>
                    <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-slate-600 dark:text-slate-400">
                      {team.description || "No description provided."}
                    </p>
                  </div>
                </div>

                {/* Card Footer */}
                <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4 text-xs text-slate-500 dark:border-slate-800/80 dark:text-slate-400">
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1 font-medium">
                      <Users className="h-3.5 w-3.5 text-slate-400" />
                      {team._count?.members ?? 1} members
                    </span>
                    <span className="flex items-center gap-1 font-medium">
                      <CheckSquare className="h-3.5 w-3.5 text-slate-400" />
                      {team._count?.tasks ?? 0} tasks
                    </span>
                  </div>

                  <span className="inline-flex items-center gap-1 font-semibold text-indigo-600 transition-transform group-hover:translate-x-0.5 dark:text-indigo-400">
                    Enter <ArrowRight className="h-3.5 w-3.5" />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {/* Create Team Modal */}
      <CreateTeamModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onTeamCreated={handleTeamCreated}
      />
    </div>
  );
}
