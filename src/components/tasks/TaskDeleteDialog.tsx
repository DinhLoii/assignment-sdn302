"use client";

import * as React from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { TaskItem } from "@/types";
import { AlertTriangle } from "lucide-react";
import { toast } from "sonner";

interface TaskDeleteDialogProps {
  task: TaskItem | null;
  isOpen: boolean;
  onClose: () => void;
  onTaskDeleted: (taskId: string) => void;
}

export const TaskDeleteDialog: React.FC<TaskDeleteDialogProps> = ({
  task,
  isOpen,
  onClose,
  onTaskDeleted,
}) => {
  const [isDeleting, setIsDeleting] = React.useState(false);

  const handleDelete = async () => {
    if (!task) return;

    try {
      setIsDeleting(true);
      const res = await fetch(`/api/tasks/${task.id}`, {
        method: "DELETE",
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to delete task");
      }

      toast.success("Task deleted successfully!");
      onTaskDeleted(task.id);
      onClose();
    } catch (err) {
      console.error(err);
      toast.error(err instanceof Error ? err.message : "Something went wrong deleting the task");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Delete Task"
      maxWidth="sm"
    >
      <div className="space-y-4">
        <div className="flex items-start gap-3 p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800/40 text-rose-800 dark:text-rose-300">
          <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5 text-rose-600 dark:text-rose-400" />
          <div className="text-xs space-y-1">
            <p className="font-semibold text-rose-900 dark:text-rose-200">Are you absolutely sure?</p>
            <p className="text-rose-700/90 dark:text-rose-300/80">
              This action cannot be undone. This will permanently delete:
            </p>
            <p className="font-medium text-slate-900 dark:text-white italic line-clamp-2">
              &quot;{task?.title}&quot;
            </p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <Button type="button" variant="ghost" onClick={onClose} disabled={isDeleting}>
            Cancel
          </Button>
          <Button
            type="button"
            variant="danger"
            onClick={handleDelete}
            isLoading={isDeleting}
          >
            Delete Permanently
          </Button>
        </div>
      </div>
    </Modal>
  );
};
