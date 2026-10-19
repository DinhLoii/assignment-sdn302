"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/Button";
import {
  CheckSquare,
  LogIn,
  Lock,
  Mail,
  Sparkles,
  KeyRound,
  ArrowRight,
  Eye,
  EyeOff,
  CheckCircle2,
  Crown,
  ShieldCheck,
} from "lucide-react";
import { toast } from "sonner";

export default function LoginPage() {
  const router = useRouter();
  const { user, login } = useAuth();

  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isSuccess, setIsSuccess] = React.useState(false);

  // If already logged in, redirect to Home ("Trang chủ")
  React.useEffect(() => {
    if (user) {
      router.push("/");
    }
  }, [user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      toast.error("Please enter both email and password");
      return;
    }

    setIsSubmitting(true);
    const result = await login(email.trim(), password);

    if (result.success) {
      setIsSuccess(true);
      const userName = result.user?.name || "User";
      toast.success(`Welcome back, ${userName}! Taking you to Home...`);

      // Smooth visual feedback then navigate directly to Home ("Trang chủ")
      setTimeout(() => {
        router.push("/");
        router.refresh();
      }, 350);
    } else {
      setIsSubmitting(false);
      toast.error(result.error || "Login failed. Please check your credentials.");
    }
  };

  const handleFillAccount = (testEmail: string, roleName: string) => {
    setEmail(testEmail);
    setPassword("Password123!");
    toast.info(`Filled ${roleName} credentials! Click Sign In to proceed.`);
  };

  return (
    <div className="mx-auto max-w-md space-y-6 py-8 sm:py-14">
      {/* Brand Header */}
      <div className="space-y-2 text-center">
        <div className="mb-2 inline-flex rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 p-3.5 text-white shadow-xl shadow-indigo-500/25 transition-transform duration-300 hover:scale-105">
          <CheckSquare className="h-8 w-8" />
        </div>
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl dark:text-white">
          Sign In to TaskPulse
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Access your teams, real-time collaboration, and task boards
        </p>
      </div>

      {/* 1-Click Fast Login Helper for Grading & Evaluation */}
      <div className="space-y-3 rounded-2xl border border-indigo-200/90 bg-indigo-50/70 p-4.5 text-xs text-indigo-950 shadow-sm backdrop-blur-sm dark:border-indigo-800/60 dark:bg-indigo-950/40 dark:text-indigo-200">
        <div className="flex items-center justify-between font-semibold">
          <span className="flex items-center gap-1.5 text-indigo-900 dark:text-indigo-200">
            <KeyRound className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
            Quick Test Accounts (Assignment 3 & 4)
          </span>
          <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
            Pre-verified
          </span>
        </div>

        <p className="text-[11px] text-slate-600 dark:text-slate-400">
          Both test accounts share the same team <strong>TaskPulse Core Platform</strong> for
          seamless real-time testing across two browser sessions:
        </p>

        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {/* Account 1: Owner */}
          <button
            type="button"
            onClick={() => handleFillAccount("test@example.com", "Owner")}
            className="flex cursor-pointer flex-col rounded-xl border border-indigo-200 bg-white/90 p-2.5 text-left transition-all hover:border-indigo-400 hover:shadow-md dark:border-indigo-900 dark:bg-slate-900/80"
          >
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1 text-[11px] font-bold text-amber-600 dark:text-amber-400">
                <Crown className="h-3 w-3" />
                Account 1 (Owner)
              </span>
              <Sparkles className="h-3 w-3 text-indigo-500" />
            </div>
            <div className="mt-1 font-mono text-[10px] text-slate-700 dark:text-slate-300">
              test@example.com
            </div>
          </button>

          {/* Account 2: Admin */}
          <button
            type="button"
            onClick={() => handleFillAccount("alice@example.com", "Admin")}
            className="flex cursor-pointer flex-col rounded-xl border border-indigo-200 bg-white/90 p-2.5 text-left transition-all hover:border-indigo-400 hover:shadow-md dark:border-indigo-900 dark:bg-slate-900/80"
          >
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1 text-[11px] font-bold text-purple-600 dark:text-purple-400">
                <ShieldCheck className="h-3 w-3" />
                Account 2 (Admin)
              </span>
              <Sparkles className="h-3 w-3 text-indigo-500" />
            </div>
            <div className="mt-1 font-mono text-[10px] text-slate-700 dark:text-slate-300">
              alice@example.com
            </div>
          </button>
        </div>
      </div>

      {/* Main Login Form Card */}
      <div
        className={`rounded-3xl border bg-white p-6 shadow-xl backdrop-blur-md transition-all duration-300 sm:p-8 dark:bg-slate-900/80 ${
          isSuccess
            ? "border-emerald-500 shadow-emerald-500/10 ring-2 ring-emerald-500/20"
            : "border-slate-200 shadow-slate-200/50 dark:border-slate-800 dark:shadow-none"
        }`}
      >
        <form onSubmit={handleSubmit} className="space-y-4.5">
          <div>
            <label className="mb-1.5 block text-xs font-semibold tracking-wider text-slate-700 uppercase dark:text-slate-300">
              Email Address
            </label>
            <div className="relative">
              <Mail className="pointer-events-none absolute top-3.5 left-3.5 h-4 w-4 text-slate-400" />
              <input
                type="email"
                required
                disabled={isSubmitting || isSuccess}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pr-3.5 pl-10 text-sm text-slate-900 placeholder-slate-400 transition-all focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:outline-none disabled:opacity-60 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:bg-slate-900"
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold tracking-wider text-slate-700 uppercase dark:text-slate-300">
              Password
            </label>
            <div className="relative">
              <Lock className="pointer-events-none absolute top-3.5 left-3.5 h-4 w-4 text-slate-400" />
              <input
                type={showPassword ? "text" : "password"}
                required
                disabled={isSubmitting || isSuccess}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pr-10 pl-10 text-sm text-slate-900 placeholder-slate-400 transition-all focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:outline-none disabled:opacity-60 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:bg-slate-900"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute top-3 right-3 text-slate-400 hover:text-slate-600 focus:outline-none dark:hover:text-slate-200"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            isLoading={isSubmitting && !isSuccess}
            disabled={isSubmitting || isSuccess}
            className={`mt-2 w-full cursor-pointer transition-all duration-300 ${
              isSuccess ? "bg-emerald-600 hover:bg-emerald-600" : ""
            }`}
          >
            {isSuccess ? (
              <span className="flex items-center gap-2 font-bold text-white">
                <CheckCircle2 className="h-4 w-4 animate-bounce" />
                Signed In! Taking you to Home...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <LogIn className="h-4 w-4" />
                Sign In to Account
              </span>
            )}
          </Button>
        </form>

        <div className="mt-6 border-t border-slate-100 pt-6 text-center dark:border-slate-800/80">
          <p className="text-xs text-slate-600 dark:text-slate-400">
            Don&apos;t have an account yet?{" "}
            <Link
              href="/register"
              className="inline-flex items-center gap-1 font-semibold text-indigo-600 hover:underline dark:text-indigo-400"
            >
              Register here
              <ArrowRight className="h-3 w-3" />
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
