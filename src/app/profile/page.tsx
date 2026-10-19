"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/Button";
import {
  User,
  Mail,
  Calendar,
  ShieldCheck,
  Users,
  CheckSquare,
  ArrowRight,
  Edit3,
  Save,
  CheckCircle2,
  Crown,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";

interface ProfileTeamItem {
  role: string;
  joinedAt: string;
  team: {
    id: string;
    name: string;
    description: string | null;
    _count: {
      members: number;
      tasks: number;
    };
  };
}

interface DetailedUserProfile {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  teamMembers?: ProfileTeamItem[];
  _count?: {
    tasks: number;
    createdTasks: number;
  };
}

export default function ProfilePage() {
  const router = useRouter();
  const { user, isLoading: isAuthLoading, refreshUser } = useAuth();

  const [profileData, setProfileData] = React.useState<DetailedUserProfile | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isEditing, setIsEditing] = React.useState(false);
  const [nameInput, setNameInput] = React.useState("");
  const [isSaving, setIsSaving] = React.useState(false);

  // Fetch full profile info
  const fetchProfile = React.useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/auth/me");
      if (res.status === 401) {
        router.push("/login");
        return;
      }
      const data = await res.json();
      if (data.success && data.data?.user) {
        setProfileData(data.data.user);
        setNameInput(data.data.user.name);
      }
    } catch (err) {
      console.error("Error loading profile:", err);
      toast.error("Failed to load profile details");
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  React.useEffect(() => {
    if (!isAuthLoading) {
      if (!user) {
        router.push("/login");
      } else {
        fetchProfile();
      }
    }
  }, [isAuthLoading, user, router, fetchProfile]);

  const handleUpdateName = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameInput.trim() || nameInput.trim().length < 2) {
      toast.error("Full name must be at least 2 characters long");
      return;
    }

    try {
      setIsSaving(true);
      const res = await fetch("/api/auth/me", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: nameInput.trim() }),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        toast.success("Profile updated successfully!");
        setIsEditing(false);
        await refreshUser();
        fetchProfile();
      } else {
        toast.error(data.error || "Failed to update profile");
      }
    } catch {
      toast.error("Network error while updating profile");
    } finally {
      setIsSaving(false);
    }
  };

  if (isAuthLoading || isLoading) {
    return (
      <div className="flex min-h-[500px] flex-col items-center justify-center space-y-3">
        <div className="h-9 w-9 animate-spin rounded-full border-3 border-indigo-600 border-t-transparent" />
        <p className="text-xs text-slate-500">Loading user profile...</p>
      </div>
    );
  }

  if (!profileData) {
    return null;
  }

  const teams = profileData.teamMembers || [];
  const assignedTasksCount = profileData._count?.tasks || 0;
  const createdTasksCount = profileData._count?.createdTasks || 0;

  return (
    <div className="mx-auto max-w-4xl space-y-8 pb-16">
      {/* Header Profile Hero Card */}
      <div className="relative overflow-hidden rounded-3xl border border-indigo-100 bg-gradient-to-br from-indigo-50/80 via-white to-violet-50/60 p-6 shadow-sm backdrop-blur-md sm:p-8 dark:border-indigo-900/40 dark:from-indigo-950/40 dark:via-slate-900 dark:to-slate-950">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-5">
            {/* Avatar Circle with Ring */}
            <div className="relative">
              <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-indigo-500 via-indigo-600 to-violet-600 text-3xl font-extrabold text-white shadow-xl shadow-indigo-500/30">
                {profileData.name.charAt(0).toUpperCase()}
              </div>
              <div
                className="absolute -right-1 -bottom-1 flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 text-white ring-4 ring-white dark:ring-slate-900"
                title="Active Session"
              >
                <CheckCircle2 className="h-3.5 w-3.5" />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2.5">
                <h1 className="text-2xl font-black text-slate-900 sm:text-3xl dark:text-white">
                  {profileData.name}
                </h1>
                <span className="rounded-full bg-indigo-100 px-2.5 py-0.5 text-[10px] font-bold text-indigo-700 uppercase dark:bg-indigo-950 dark:text-indigo-300">
                  Verified
                </span>
              </div>
              <p className="flex items-center gap-1.5 text-sm text-slate-600 dark:text-slate-400">
                <Mail className="h-3.5 w-3.5 text-slate-400" />
                {profileData.email}
              </p>
              <p className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-500">
                <Calendar className="h-3.5 w-3.5 text-slate-400" />
                Member since {new Date(profileData.createdAt).toLocaleDateString(undefined, {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link href="/teams">
              <Button variant="primary" size="md" className="cursor-pointer shadow-md shadow-indigo-600/20">
                <Users className="h-4 w-4" />
                Go to Teams
              </Button>
            </Link>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-slate-200/80 bg-white/90 p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/80">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase">Teams Joined</span>
              <Users className="h-4 w-4 text-indigo-500" />
            </div>
            <div className="mt-2 text-2xl font-black text-slate-900 dark:text-white">
              {teams.length}
            </div>
            <p className="text-[11px] text-slate-500">Active collaborative workspaces</p>
          </div>

          <div className="rounded-2xl border border-slate-200/80 bg-white/90 p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/80">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase">Assigned Tasks</span>
              <CheckSquare className="h-4 w-4 text-emerald-500" />
            </div>
            <div className="mt-2 text-2xl font-black text-slate-900 dark:text-white">
              {assignedTasksCount}
            </div>
            <p className="text-[11px] text-slate-500">Tasks assigned across teams</p>
          </div>

          <div className="rounded-2xl border border-slate-200/80 bg-white/90 p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/80">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase">Tasks Created</span>
              <Sparkles className="h-4 w-4 text-violet-500" />
            </div>
            <div className="mt-2 text-2xl font-black text-slate-900 dark:text-white">
              {createdTasksCount}
            </div>
            <p className="text-[11px] text-slate-500">Delegated team activities</p>
          </div>
        </div>
      </div>

      {/* Account Settings / Edit Name Form */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8 dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Account Details</h2>
            <p className="text-xs text-slate-500">Manage your profile information and display name</p>
          </div>
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="flex cursor-pointer items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
            >
              <Edit3 className="h-3.5 w-3.5 text-indigo-500" />
              Edit Name
            </button>
          )}
        </div>

        <div className="mt-6 space-y-5">
          {/* Full Name Field */}
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-700 uppercase dark:text-slate-300">
              Full Name
            </label>
            {isEditing ? (
              <form onSubmit={handleUpdateName} className="flex gap-2">
                <input
                  type="text"
                  required
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                />
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  isLoading={isSaving}
                  className="cursor-pointer rounded-xl"
                >
                  <Save className="h-4 w-4" />
                  Save
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="md"
                  onClick={() => {
                    setNameInput(profileData.name);
                    setIsEditing(false);
                  }}
                  className="cursor-pointer rounded-xl"
                >
                  Cancel
                </Button>
              </form>
            ) : (
              <div className="flex items-center gap-2 rounded-xl border border-slate-200/60 bg-slate-50/70 px-4 py-2.5 text-sm font-medium text-slate-800 dark:border-slate-800 dark:bg-slate-950/60 dark:text-slate-200">
                <User className="h-4 w-4 text-slate-400" />
                {profileData.name}
              </div>
            )}
          </div>

          {/* Email Address */}
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-700 uppercase dark:text-slate-300">
              Email Address
            </label>
            <div className="flex items-center justify-between rounded-xl border border-slate-200/60 bg-slate-50/70 px-4 py-2.5 text-sm font-medium text-slate-800 dark:border-slate-800 dark:bg-slate-950/60 dark:text-slate-200">
              <span className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-slate-400" />
                {profileData.email}
              </span>
              <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                <ShieldCheck className="h-3.5 w-3.5" />
                Pre-verified
              </span>
            </div>
          </div>

          {/* Account ID */}
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-700 uppercase dark:text-slate-300">
              User ID (System UID)
            </label>
            <div className="rounded-xl border border-slate-200/60 bg-slate-50/70 px-4 py-2.5 font-mono text-xs text-slate-500 dark:border-slate-800 dark:bg-slate-950/60 dark:text-slate-400">
              {profileData.id}
            </div>
          </div>
        </div>
      </div>

      {/* User's Teams & Workspaces List */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8 dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Your Teams</h2>
            <p className="text-xs text-slate-500">Teams and workspaces you are a member of</p>
          </div>
          <Link href="/teams">
            <Button variant="outline" size="sm" className="cursor-pointer">
              Manage All Teams
            </Button>
          </Link>
        </div>

        <div className="mt-6 space-y-3">
          {teams.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400">
              You haven&apos;t joined any teams yet. Create or get invited to a team!
            </div>
          ) : (
            teams.map((item) => {
              const isOwner = item.role === "OWNER";
              const isAdmin = item.role === "ADMIN";
              return (
                <div
                  key={item.team.id}
                  className="flex flex-col justify-between gap-4 rounded-2xl border border-slate-200/80 bg-slate-50/60 p-4 transition-all hover:border-indigo-200 hover:bg-slate-50 sm:flex-row sm:items-center dark:border-slate-800 dark:bg-slate-950/40 dark:hover:border-slate-700"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-slate-900 dark:text-white">{item.team.name}</h3>
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                          isOwner
                            ? "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                            : isAdmin
                            ? "bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300"
                            : "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300"
                        }`}
                      >
                        {isOwner && <Crown className="h-3 w-3" />}
                        {item.role}
                      </span>
                    </div>
                    {item.team.description && (
                      <p className="line-clamp-1 text-xs text-slate-500">{item.team.description}</p>
                    )}
                    <p className="text-[11px] text-slate-400">
                      {item.team._count.members} Members &bull; {item.team._count.tasks} Tasks
                    </p>
                  </div>

                  <Link href={`/teams/${item.team.id}`}>
                    <Button variant="outline" size="sm" className="cursor-pointer gap-1.5">
                      Open Workspace
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Button>
                  </Link>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
