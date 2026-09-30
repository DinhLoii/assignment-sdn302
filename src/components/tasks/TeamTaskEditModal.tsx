"use client";

import * as React from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Select } from "@/components/ui/Select";
import { TaskItem, TaskPriority, TaskStatus, TeamMemberItem } from "@/types";
import { Save } from "lucide-react";
import { toast } from "sonner";

interface TeamTaskEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: TaskItem;
  members: TeamMemberItem[];
  onTaskUpdated: (updatedTask: TaskItem) => void;
}

export const TeamTaskEditModal: React.FC<TeamTaskEditModalProps> = ({
  isOpen,
  onClose,
  task,
  members,
  onTaskUpdated,
}) => {
  const [title, setTitle] = React.useState(task.title);
  const [description, setDescription] = React.useState(task.description || "");
  const [status, setStatus] = React.useState<TaskStatus>(task.status);
  const [priority, setPriority] = React.useState<TaskPriority>(task.priority);
  const [dueDate, setDueDate] = React.useState(
    task.dueDate ? new Date(task.dueDate).toISOString().split("T")[0] : ""
  );
  const [assigneeId, setAssigneeId] = React.useState<string>(task.assigneeId || "");
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  React.useEffect(() => {
    setTitle(task.title);
    setDescription(task.description || "");
    setStatus(task.status);
    setPriority(task.priority);
    setDueDate(task.dueDate ? new Date(task.dueDate).toISOString().split("T")[0] : "");
    setAssigneeId(task.assigneeId || "");
  }, [task]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error("Task title is required");
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await fetch(`/api/tasks/${task.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim() || null,
          status,
          priority,
          dueDate: dueDate ? new Date(dueDate).toISOString() : null,
          assigneeId: assigneeId || null,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success && data.data) {
        toast.success("Task updated successfully!");
        onTaskUpdated(data.data);
        onClose();
      } else {
        toast.error(data.error || "Failed to update task");
      }
    } catch {
      toast.error("Network error while updating task");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Task Details">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-1.5 block text-xs font-semibold tracking-wider text-slate-700 uppercase dark:text-slate-300">
            Task Title <span className="text-rose-500">*</span>
          </label>
          <Input
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Task title"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-semibold tracking-wider text-slate-700 uppercase dark:text-slate-300">
            Description
          </label>
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Task details and instructions..."
            rows={3}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-xs font-semibold tracking-wider text-slate-700 uppercase dark:text-slate-300">
              Status
            </label>
            <Select
              value={status}
              onChange={(e) => setStatus(e.target.value as TaskStatus)}
              options={[
                { value: "TODO", label: "To Do" },
                { value: "IN_PROGRESS", label: "In Progress" },
                { value: "DONE", label: "Done" },
              ]}
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold tracking-wider text-slate-700 uppercase dark:text-slate-300">
              Priority
            </label>
            <Select
              value={priority}
              onChange={(e) => setPriority(e.target.value as TaskPriority)}
              options={[
                { value: "LOW", label: "Low Priority" },
                { value: "MEDIUM", label: "Medium Priority" },
                { value: "HIGH", label: "High Priority" },
              ]}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-xs font-semibold tracking-wider text-slate-700 uppercase dark:text-slate-300">
              Assignee (Team Member)
            </label>
            <Select
              value={assigneeId}
              onChange={(e) => setAssigneeId(e.target.value)}
              options={[
                { value: "", label: "Unassigned" },
                ...members.map((m) => ({
                  value: m.user.id,
                  label: `${m.user.name} (${m.role})`,
                })),
              ]}
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold tracking-wider text-slate-700 uppercase dark:text-slate-300">
              Due Date
            </label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-sm text-slate-900 transition-all focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-white"
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-2.5 pt-3">
          <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            isLoading={isSubmitting}
            className="cursor-pointer"
          >
            <Save className="h-4 w-4" />
            Save Changes
          </Button>
        </div>
      </form>
    </Modal>
  );
};
