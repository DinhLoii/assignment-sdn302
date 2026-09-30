export type TaskStatus = "TODO" | "IN_PROGRESS" | "DONE";
export type TaskPriority = "LOW" | "MEDIUM" | "HIGH";
export type TeamRole = "OWNER" | "MEMBER" | "ADMIN";

export interface UserSummary {
  id: string;
  name: string;
  email: string;
  createdAt?: string | Date;
}

export interface TeamMemberItem {
  id: string;
  teamId: string;
  userId: string;
  role: TeamRole;
  joinedAt: string | Date;
  user: UserSummary;
}

export interface TeamItem {
  id: string;
  name: string;
  description: string | null;
  ownerId: string;
  createdAt: string | Date;
  owner?: UserSummary;
  members?: TeamMemberItem[];
  tasks?: TaskItem[];
  currentUserRole?: TeamRole;
  _count?: {
    members: number;
    tasks: number;
  };
}

export interface TaskItem {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string | Date | null;
  teamId: string | null;
  assigneeId: string | null;
  creatorId?: string | null;
  createdAt: string | Date;
  updatedAt: string | Date;
  assignee?: UserSummary | null;
  creator?: UserSummary | null;
  team?: {
    id: string;
    name: string;
  } | null;
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
  assigneeId?: "ALL" | string;
  search: string;
}

export interface AuthSession {
  user: UserSummary;
  token: string;
}
