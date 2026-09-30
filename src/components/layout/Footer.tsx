import * as React from "react";
import { CheckSquare, Database, Server, Zap, ShieldCheck } from "lucide-react";

export const Footer: React.FC = () => {
  return (
    <footer className="mt-auto w-full border-t border-slate-200/80 bg-white/90 py-10 text-slate-500 transition-colors dark:border-slate-800/80 dark:bg-slate-950/90 dark:text-slate-400">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
          {/* Brand Info */}
          <div className="flex items-center gap-3 text-center md:text-left">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-indigo-200 bg-indigo-50 text-indigo-600 dark:border-indigo-500/30 dark:bg-indigo-600/20 dark:text-indigo-400">
              <CheckSquare className="h-4 w-4" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900 dark:text-slate-200">
                TaskPulse &bull; Task & Team Management
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Assignment 2 – JWT Auth, RBAC, Team Workspaces & REST API
              </p>
            </div>
          </div>

          {/* Tech Stack Badges */}
          <div className="flex flex-wrap items-center justify-center gap-2 text-xs">
            <span className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-slate-100 px-2.5 py-1 text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
              <Zap className="h-3.5 w-3.5 text-sky-500 dark:text-sky-400" />
              Next.js 15
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-slate-100 px-2.5 py-1 text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
              <Database className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
              Supabase PostgreSQL
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-slate-100 px-2.5 py-1 text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
              <ShieldCheck className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
              Prisma 7
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-slate-100 px-2.5 py-1 text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
              <Server className="h-3.5 w-3.5 text-violet-600 dark:text-violet-400" />
              Vercel
            </span>
          </div>
        </div>

        <div className="mt-8 flex flex-col items-center justify-between gap-4 border-t border-slate-200/80 pt-6 text-xs text-slate-500 sm:flex-row dark:border-slate-800/60 dark:text-slate-400">
          <p>&copy; {new Date().getFullYear()} TaskPulse. All rights reserved.</p>
          <p className="flex items-center gap-4">
            <a
              href="/docs"
              target="_blank"
              rel="noreferrer"
              className="font-medium transition-colors hover:text-indigo-600 dark:hover:text-indigo-400"
            >
              API Docs (Swagger)
            </a>
            <span>&bull;</span>
            <span>REST API</span>
            <span>&bull;</span>
            <span>Light & Dark Mode</span>
          </p>
        </div>
      </div>
    </footer>
  );
};
