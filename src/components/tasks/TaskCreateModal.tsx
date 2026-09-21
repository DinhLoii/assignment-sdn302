"use client";

import * as React from "react";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { createTaskSchema } from "@/lib/validations/task";
import { TaskItem, TaskPriority, TaskStatus } from "@/types";
import { toast } from "sonner";

interface TaskCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTaskCreated: (task: TaskItem) => void;
}

export const TaskCreateModal: React.FC<TaskCreateModalProps> = ({
  isOpen,
  onClose,
  onTaskCreated,
}) => {
  const [title, setTitle] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [status, setStatus] = React.useState<TaskStatus>("TODO");
  const [priority, setPriority] = React.useState<TaskPriority>("MEDIUM");
  const [dueDate, setDueDate] = React.useState("");
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setStatus("TODO");
    setPriority("MEDIUM");
    setDueDate("");
    setErrors({});
    setIsSubmitting(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // Client-side validation with Zod
    const payload = {
      title,
      description: description.trim() ? description : null,
      status,
      priority,
      dueDate: dueDate ? new Date(dueDate).toISOString() : null,
    };

    const validation = createTaskSchema.safeParse(payload);
    if (!validation.success) {
      const fieldErrors: Record<string, string> = {};
      const flattened = validation.error.flatten().fieldErrors;
      for (const [key, msgs] of Object.entries(flattened)) {
        if (msgs && msgs[0]) fieldErrors[key] = msgs[0];
      }
      setErrors(fieldErrors);
      toast.error("Please fix the validation errors before submitting.");
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to create task");
      }

      toast.success("Task created successfully!");
      resetForm();
      onTaskCreated(json.data);
      onClose();
    } catch (err) {
      console.error(err);
      toast.error(err instanceof Error ? err.message : "Something went wrong creating the task");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Create New Task"
      description="Add a new task to your team workflow. No authentication required."
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Task Title"
          required
          placeholder="e.g. Set up Supabase PostgreSQL database"
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            if (errors.title) setErrors((prev) => ({ ...prev, title: "" }));
          }}
          error={errors.title}
        />

        <Textarea
          label="Description"
          placeholder="Add more details, acceptance criteria, or links..."
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          error={errors.description}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Select
            label="Initial Status"
            options={[
              { value: "TODO", label: "To Do" },
              { value: "IN_PROGRESS", label: "In Progress" },
              { value: "DONE", label: "Done" },
            ]}
            value={status}
            onChange={(e) => setStatus(e.target.value as TaskStatus)}
          />

          <Select
            label="Priority Level"
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
          label="Due Date (Optional)"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          error={errors.dueDate}
        />

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
          <Button type="button" variant="ghost" onClick={handleClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" isLoading={isSubmitting}>
            Create Task
          </Button>
        </div>
      </form>
    </Modal>
  );
};
