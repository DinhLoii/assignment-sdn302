import { TeamRole, TaskItem } from "@/types";

/**
 * Role-Based Access Control (RBAC) helpers for TaskPulse
 * Enforces permissions across Owner, Admin, and Member roles.
 */

export interface UserRoleContext {
  userId: string;
  role: TeamRole;
  isOwner: boolean;
}

/**
 * Check if the user can manage team members (invite, change roles, remove).
 * Only OWNER and ADMIN have member management privileges.
 */
export function canManageMembers(role?: TeamRole | null): boolean {
  return role === "OWNER" || role === "ADMIN";
}

/**
 * Check if the actor can change the target member's role.
 * - OWNER can change anyone's role (except self cannot demote below owner).
 * - ADMIN can promote MEMBER to ADMIN or demote ADMIN to MEMBER, but CANNOT touch OWNER.
 * - MEMBER cannot change any roles.
 */
export function canChangeMemberRole(
  actorRole: TeamRole,
  targetRole: TeamRole,
  isTargetTeamOwner: boolean
): boolean {
  if (isTargetTeamOwner) return false; // Owner role cannot be changed through standard member role endpoint
  if (actorRole === "OWNER") return true;
  if (actorRole === "ADMIN") {
    // Admin can toggle between ADMIN and MEMBER
    return targetRole === "ADMIN" || targetRole === "MEMBER";
  }
  return false;
}

/**
 * Check if the actor can remove a member from the team.
 * - Cannot remove the team Owner.
 * - OWNER can remove any member.
 * - ADMIN can remove MEMBERs, but CANNOT remove OWNER or other ADMINs.
 * - MEMBER cannot remove anyone.
 */
export function canRemoveMember(
  actorRole: TeamRole,
  actorId: string,
  targetRole: TeamRole,
  targetId: string,
  isTargetTeamOwner: boolean
): boolean {
  if (isTargetTeamOwner) return false; // Owner cannot be removed
  if (actorId === targetId) return false; // Self removal is handled via leave team if implemented
  if (actorRole === "OWNER") return true;
  if (actorRole === "ADMIN") {
    // Admin can only remove normal members
    return targetRole === "MEMBER";
  }
  return false;
}

/**
 * Check if the user can delete the team.
 * ONLY the team OWNER can delete the team. Admins and Members cannot.
 */
export function canDeleteTeam(role?: TeamRole | null, isOwner?: boolean): boolean {
  return role === "OWNER" || Boolean(isOwner);
}

/**
 * Check if the user can edit team settings (name, description).
 * ONLY the team OWNER can update team metadata.
 */
export function canUpdateTeam(role?: TeamRole | null, isOwner?: boolean): boolean {
  return role === "OWNER" || Boolean(isOwner);
}

/**
 * Check if the user can delete a task.
 * - OWNER can delete any task.
 * - ADMIN can delete any task.
 * - MEMBER can only delete tasks they CREATED (creatorId === userId).
 */
export function canDeleteTask(
  userRole: TeamRole | undefined,
  userId: string | undefined,
  task: TaskItem
): boolean {
  if (!userId) return false;
  if (userRole === "OWNER" || userRole === "ADMIN") return true;
  if (userRole === "MEMBER") {
    return task.creatorId === userId;
  }
  return false;
}

/**
 * Check if the user can edit a task's full details (title, description, assignee, priority, dueDate).
 * - OWNER and ADMIN can edit any task.
 * - MEMBER can edit tasks they created or are assigned to, or update status.
 */
export function canEditTaskDetails(
  userRole: TeamRole | undefined,
  userId: string | undefined,
  task: TaskItem
): boolean {
  if (!userId) return false;
  if (userRole === "OWNER" || userRole === "ADMIN") return true;
  if (userRole === "MEMBER") {
    return task.creatorId === userId || task.assigneeId === userId;
  }
  return false;
}
