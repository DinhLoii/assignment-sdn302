import Link from "next/link";
import { Users, ArrowLeft, ShieldCheck, UserCheck, CalendarCheck2, Activity } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function TeamsPage() {
  const upcomingFeatures = [
    {
      icon: Users,
      title: "Team Workspaces",
      description: "Create and manage multiple teams, invite coworkers, and organize tasks by department.",
    },
    {
      icon: ShieldCheck,
      title: "Role-Based Access Control",
      description: "Assign Team Roles (Admin, Member) with granular permissions to protect sensitive projects.",
    },
    {
      icon: UserCheck,
      title: "Task Assignment",
      description: "Delegate tasks to specific team members with email notifications and workload tracking.",
    },
    {
      icon: Activity,
      title: "Team Activity Feed",
      description: "Real-time updates on task status changes, completions, and team milestones.",
    },
  ];

  return (
    <div className="max-w-4xl mx-auto py-8 sm:py-12 space-y-10">
      {/* Header */}
      <div className="space-y-4 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-950/60 border border-indigo-800/50 text-indigo-400 text-xs font-semibold uppercase tracking-wider">
          <CalendarCheck2 className="w-3.5 h-3.5" />
          Assignment 2 Preview
        </div>

        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white">
          Team Management & Collaboration
        </h1>

        <p className="text-base sm:text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
          The <span className="text-indigo-400 font-medium">Team</span> and{" "}
          <span className="text-indigo-400 font-medium">TeamMember</span> models are already defined in our
          Prisma schema. Full team workspace features, invitations, and role management are coming in
          Assignment 2.
        </p>

        <div className="pt-2">
          <Link href="/">
            <Button variant="outline" size="md">
              <ArrowLeft className="w-4 h-4" />
              Back to Task Dashboard
            </Button>
          </Link>
        </div>
      </div>

      {/* Feature Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-4">
        {upcomingFeatures.map((feat) => {
          const Icon = feat.icon;
          return (
            <div
              key={feat.title}
              className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 hover:border-slate-700/80 transition-all duration-200 backdrop-blur-sm space-y-3"
            >
              <div className="w-10 h-10 rounded-xl bg-indigo-950/60 border border-indigo-800/50 flex items-center justify-center text-indigo-400">
                <Icon className="w-5 h-5" />
              </div>
              <h3 className="text-base font-semibold text-slate-100">{feat.title}</h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                {feat.description}
              </p>
            </div>
          );
        })}
      </div>

      {/* Schema Notice */}
      <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800/60 text-xs text-slate-400 space-y-2">
        <p className="font-semibold text-slate-300 text-sm">
          💡 Database Schema Readiness:
        </p>
        <p>
          The tables <code className="text-indigo-300 font-mono">teams</code> and{" "}
          <code className="text-indigo-300 font-mono">team_members</code> have been generated in Supabase
          via Prisma migration. In Assignment 1, the <code className="text-indigo-300 font-mono">teamId</code>{" "}
          and <code className="text-indigo-300 font-mono">assigneeId</code> fields on tasks are optional,
          ready to be connected when team authentication launches.
        </p>
      </div>
    </div>
  );
}
