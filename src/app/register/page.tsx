"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/Button";
import {
  CheckSquare,
  UserPlus,
  Lock,
  Mail,
  User,
  ArrowRight,
  Eye,
  EyeOff,
  CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";

export default function RegisterPage() {
  const router = useRouter();
  const { user, register } = useAuth();

  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
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

    if (!name.trim() || !email.trim() || !password) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters long");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setIsSubmitting(true);
    const result = await register(name.trim(), email.trim(), password);

    if (result.success) {
      setIsSuccess(true);
      toast.success("Account created successfully! Welcome to TaskPulse.");

      // Smooth visual feedback then navigate directly to Home ("Trang chủ")
      setTimeout(() => {
        router.push("/");
        router.refresh();
      }, 350);
    } else {
      setIsSubmitting(false);
      toast.error(result.error || "Registration failed");
    }
  };

  return (
    <div className="mx-auto max-w-md space-y-6 py-8 sm:py-14">
      {/* Brand Header */}
      <div className="space-y-2 text-center">
        <div className="mb-2 inline-flex rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 p-3.5 text-white shadow-xl shadow-indigo-500/25 transition-transform duration-300 hover:scale-105">
          <CheckSquare className="h-8 w-8" />
        </div>
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl dark:text-white">
          Create Your Account
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Join TaskPulse to create teams, delegate tasks, and collaborate
        </p>
      </div>

      {/* Register Card */}
      <div
        className={`rounded-3xl border bg-white p-6 shadow-xl backdrop-blur-md transition-all duration-300 sm:p-8 dark:bg-slate-900/80 ${
          isSuccess
            ? "border-emerald-500 shadow-emerald-500/10 ring-2 ring-emerald-500/20"
            : "border-slate-200 shadow-slate-200/50 dark:border-slate-800 dark:shadow-none"
        }`}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-semibold tracking-wider text-slate-700 uppercase dark:text-slate-300">
              Full Name
            </label>
            <div className="relative">
              <User className="pointer-events-none absolute top-3.5 left-3.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                required
                disabled={isSubmitting || isSuccess}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. John Doe"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pr-3.5 pl-10 text-sm text-slate-900 placeholder-slate-400 transition-all focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:outline-none disabled:opacity-60 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:bg-slate-900"
              />
            </div>
          </div>

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
                placeholder="john@example.com"
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
                minLength={6}
                disabled={isSubmitting || isSuccess}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
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

          <div>
            <label className="mb-1.5 block text-xs font-semibold tracking-wider text-slate-700 uppercase dark:text-slate-300">
              Confirm Password
            </label>
            <div className="relative">
              <Lock className="pointer-events-none absolute top-3.5 left-3.5 h-4 w-4 text-slate-400" />
              <input
                type={showPassword ? "text" : "password"}
                required
                minLength={6}
                disabled={isSubmitting || isSuccess}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter password"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pr-10 pl-10 text-sm text-slate-900 placeholder-slate-400 transition-all focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:outline-none disabled:opacity-60 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:bg-slate-900"
              />
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
                Account Created! Taking you to Home...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <UserPlus className="h-4 w-4" />
                Create Account
              </span>
            )}
          </Button>
        </form>

        <div className="mt-6 border-t border-slate-100 pt-6 text-center dark:border-slate-800/80">
          <p className="text-xs text-slate-600 dark:text-slate-400">
            Already have an account?{" "}
            <Link
              href="/login"
              className="inline-flex items-center gap-1 font-semibold text-indigo-600 hover:underline dark:text-indigo-400"
            >
              Sign In
              <ArrowRight className="h-3 w-3" />
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
