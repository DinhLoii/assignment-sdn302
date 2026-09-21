import * as React from "react";
import { CheckSquare, Database, Server, Zap, ShieldCheck } from "lucide-react";

export const Footer: React.FC = () => {
  return (
    <footer className="w-full border-t border-slate-200/80 dark:border-slate-800/80 bg-white/90 dark:bg-slate-950/90 text-slate-500 dark:text-slate-400 py-10 mt-auto transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Brand Info */}
          <div className="flex items-center gap-3 text-center md:text-left">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-600/20 border border-indigo-200 dark:border-indigo-500/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <CheckSquare className="w-4 h-4" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900 dark:text-slate-200">
                TaskPulse &bull; Task & Team Management
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Assignment 1 – Project Setup, Prisma ORM & Supabase Deployment
              </p>
            </div>
          </div>

          {/* Tech Stack Badges */}
          <div className="flex flex-wrap items-center justify-center gap-2 text-xs">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300">
              <Zap className="w-3.5 h-3.5 text-sky-500 dark:text-sky-400" />
              Next.js 15
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300">
              <Database className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              Supabase PostgreSQL
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300">
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              Prisma 7
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300">
              <Server className="w-3.5 h-3.5 text-violet-600 dark:text-violet-400" />
              Vercel
            </span>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-200/80 dark:border-slate-800/60 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 dark:text-slate-400 gap-4">
          <p>&copy; {new Date().getFullYear()} TaskPulse. All rights reserved.</p>
          <p className="flex items-center gap-4">
            <span>Clean Architecture</span>
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
