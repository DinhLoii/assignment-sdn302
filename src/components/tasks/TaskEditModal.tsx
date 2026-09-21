"use client";

import * as React from "react";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { updateTaskSchema } from "@/lib/validations/task";
import { TaskItem, TaskPriority, TaskStatus } from "@/types";
import { toast } from "sonner";

interface TaskEditModalProps {
  task: TaskItem | null;
  isOpen: boolean;
  onClose: () => void;
  onTaskUpdated: (task: TaskItem) => void;
}

interface TaskEditModalContentProps {
  task: TaskItem;
  isOpen: boolean;
  onClose: () => void;
  onTaskUpdated: (task: TaskItem) => void;
}

const TaskEditModalContent: React.FC<TaskEditModalContentProps> = ({
  task,
  isOpen,
  onClose,
  onTaskUpdated,
}) => {
  const [title, setTitle] = React.useState(task.title);
  const [description, setDescription] = React.useState(task.description || "");
  const [status, setStatus] = React.useState<TaskStatus>(task.status);
  const [priority, setPriority] = React.useState<TaskPriority>(task.priority);
  const [dueDate, setDueDate] = React.useState(
    task.dueDate ? new Date(task.dueDate).toISOString().split("T")[0] : ""
  );
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const payload = {
      title,
      description: description.trim() ? description : null,
      status,
      priority,
      dueDate: dueDate ? new Date(dueDate).toISOString() : null,
    };

    const validation = updateTaskSchema.safeParse(payload);
    if (!validation.success) {
      const fieldErrors: Record<string, string> = {};
      const flattened = validation.error.flatten().fieldErrors;
      for (const [key, msgs] of Object.entries(flattened)) {
        if (msgs && msgs[0]) fieldErrors[key] = msgs[0];
      }
      setErrors(fieldErrors);
      toast.error("Please fix the validation errors before saving.");
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await fetch(`/api/tasks/${task.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to update task");
      }

      toast.success("Task updated successfully!");
      onTaskUpdated(json.data);
      onClose();
    } catch (err) {
      console.error(err);
      toast.error(err instanceof Error ? err.message : "Something went wrong updating the task");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Edit Task"
      description="Update task details, change status, or reschedule due dates."
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Task Title"
          required
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            if (errors.title) setErrors((prev) => ({ ...prev, title: "" }));
          }}
          error={errors.title}
        />

        <Textarea
          label="Description"
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          error={errors.description}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Select
            label="Status"
            options={[
              { value: "TODO", label: "To Do" },
              { value: "IN_PROGRESS", label: "In Progress" },
              { value: "DONE", label: "Done" },
            ]}
            value={status}
            onChange={(e) => setStatus(e.target.value as TaskStatus)}
          />

          <Select
            label="Priority"
            options={[
              { value: "LOW", label: "Low Priority" },
              { value: "MEDIUM", label: "Medium Priority" },
              { value: "HIGH", label: "High Priority" },
            ]}
            value={priority}
            onChange={(e) => setPriority(e.target.value as TaskPriority)}
          />
        </div>

        <Input
          type="date"
          label="Due Date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          error={errors.dueDate}
        />

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
          <Button type="button" variant="ghost" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" isLoading={isSubmitting}>
            Save Changes
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export const TaskEditModal: React.FC<TaskEditModalProps> = ({
  task,
  isOpen,
  onClose,
  onTaskUpdated,
}) => {
  if (!isOpen || !task) return null;

  return (
    <TaskEditModalContent
      key={task.id}
      task={task}
      isOpen={isOpen}
      onClose={onClose}
      onTaskUpdated={onTaskUpdated}
    />
  );
};
