import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return "No due date";
  const d = new Date(date);
  if (isNaN(d.getTime())) return "Invalid date";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(d);
}

export function formatRelativeDate(date: Date | string | null | undefined): string {
  if (!date) return "";
  const d = new Date(date);
  if (isNaN(d.getTime())) return "";

  const now = new Date();
  const diffTime = d.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Due today";
  if (diffDays === 1) return "Due tomorrow";
  if (diffDays === -1) return "1 day overdue";
  if (diffDays < -1) return `${Math.abs(diffDays)} days overdue`;
  if (diffDays <= 7) return `Due in ${diffDays} days`;
  return `Due ${formatDate(d)}`;
}

export function isOverdue(date: Date | string | null | undefined, status: string): boolean {
  if (!date || status === "DONE") return false;
  const d = new Date(date);
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return d < now;
}
