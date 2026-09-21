export type TaskStatus = "TODO" | "IN_PROGRESS" | "DONE";
export type TaskPriority = "LOW" | "MEDIUM" | "HIGH";
export type TeamRole = "ADMIN" | "MEMBER";

export interface TaskItem {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string | Date | null;
  teamId: string | null;
  assigneeId: string | null;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface TaskStatsData {
  total: number;
  todo: number;
  inProgress: number;
  done: number;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  details?: Record<string, string[]>;
}

export interface TaskFilterState {
  status: "ALL" | TaskStatus;
  priority: "ALL" | TaskPriority;
  search: string;
}
