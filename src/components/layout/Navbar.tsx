"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { CheckSquare, Users, LogIn, LogOut, UserPlus, Menu, X, User } from "lucide-react";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/Button";

export const Navbar: React.FC = () => {
  const pathname = usePathname();
  const { user, logout, isLoading } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const navLinks = [
    { name: "Home", href: "/", icon: CheckSquare },
    { name: "Teams Workspace", href: "/teams", icon: Users },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 bg-white/85 backdrop-blur-md transition-colors dark:border-slate-800/80 dark:bg-slate-950/75">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Brand Logo */}
          <Link href="/" className="group flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-md shadow-indigo-500/25 transition-transform duration-200 group-hover:scale-105">
              <CheckSquare className="h-5 w-5 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="flex items-center gap-1.5 text-base font-bold tracking-tight text-slate-900 dark:text-white">
                TaskPulse
                <span className="rounded border border-emerald-200 bg-emerald-100 px-1.5 py-0.5 text-[10px] font-bold text-emerald-700 uppercase dark:border-emerald-800/50 dark:bg-emerald-950 dark:text-emerald-400">
                  Ass2
                </span>
              </span>
              <span className="hidden text-[11px] text-slate-500 sm:inline dark:text-slate-400">
                Task & Team Management
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden items-center gap-1 md:flex">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive =
                pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href));
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={cn(
                    "flex items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-medium transition-all duration-150",
                    isActive
                      ? "bg-slate-100 text-indigo-600 shadow-sm dark:bg-slate-800/80 dark:text-indigo-400"
                      : "text-slate-600 hover:bg-slate-100/70 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800/40 dark:hover:text-white"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {link.name}
                </Link>
              );
            })}
          </nav>

          {/* Right Actions */}
          <div className="hidden items-center gap-3 md:flex">
            {/* Theme Toggle Button */}
            <ThemeToggle />

            {!isLoading && (
              <>
                {user ? (
                  <div className="flex items-center gap-3 border-l border-slate-200 pl-2 dark:border-slate-800">
                    <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-100/80 px-2.5 py-1.5 text-xs font-medium text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
                      <div className="flex h-5 w-5 items-center justify-center rounded-full bg-indigo-500 text-[10px] font-bold text-white">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <span className="max-w-[120px] truncate">{user.name}</span>
                    </div>

                    <button
                      onClick={() => logout()}
                      className="flex cursor-pointer items-center gap-1.5 rounded-lg border border-rose-200 px-3 py-1.5 text-xs font-semibold text-rose-600 transition-colors hover:bg-rose-50 dark:border-rose-900/40 dark:text-rose-400 dark:hover:bg-rose-950/40"
                    >
                      <LogOut className="h-3.5 w-3.5" />
                      Logout
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Link href="/login">
                      <Button variant="outline" size="sm" className="cursor-pointer">
                        <LogIn className="h-3.5 w-3.5" />
                        Sign In
                      </Button>
                    </Link>
                    <Link href="/register">
                      <Button variant="primary" size="sm" className="cursor-pointer">
                        <UserPlus className="h-3.5 w-3.5" />
                        Register
                      </Button>
                    </Link>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center gap-2 md:hidden">
            <ThemeToggle />
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="rounded-lg p-2 text-slate-600 transition-colors hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6 text-slate-700 dark:text-slate-200" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="space-y-2 border-b border-slate-200 bg-white/95 px-4 pt-2 pb-4 backdrop-blur-md md:hidden dark:border-slate-800 dark:bg-slate-950/95">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3.5 py-2.5 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-indigo-50 font-semibold text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400"
                    : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-900"
                )}
              >
                <Icon className="h-4 w-4" />
                {link.name}
              </Link>
            );
          })}

          <div className="space-y-2 border-t border-slate-200 pt-3 dark:border-slate-800">
            {user ? (
              <div className="space-y-2">
                <div className="flex items-center gap-2 px-3 py-2 text-xs text-slate-600 dark:text-slate-400">
                  <User className="h-4 w-4 text-indigo-500" />
                  <span>
                    Signed in as <strong>{user.name}</strong>
                  </span>
                </div>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    logout();
                  }}
                  className="flex w-full items-center justify-center gap-2 rounded-lg border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-600 dark:border-rose-900 dark:bg-rose-950/30"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-800 dark:border-slate-700 dark:text-slate-200"
                >
                  <LogIn className="h-4 w-4" />
                  Sign In
                </Link>
                <Link
                  href="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-3 py-2 text-sm font-medium text-white"
                >
                  <UserPlus className="h-4 w-4" />
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
