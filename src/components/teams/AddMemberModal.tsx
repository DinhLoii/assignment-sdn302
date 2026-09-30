"use client";

import * as React from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { UserPlus, Mail } from "lucide-react";
import { toast } from "sonner";
import { TeamMemberItem } from "@/types";

interface AddMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  teamId: string;
  onMemberAdded: (member: TeamMemberItem) => void;
}

export const AddMemberModal: React.FC<AddMemberModalProps> = ({
  isOpen,
  onClose,
  teamId,
  onMemberAdded,
}) => {
  const [email, setEmail] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      toast.error("Please enter a member email address");
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await fetch(`/api/teams/${teamId}/members`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });

      const data = await res.json();
      if (res.ok && data.success && data.data?.member) {
        toast.success(data.data.message || "Member added successfully!");
        onMemberAdded(data.data.member);
        setEmail("");
        onClose();
      } else {
        toast.error(data.error || "Failed to add member");
      }
    } catch {
      toast.error("Network error while adding member");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Member to Team">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-1.5 block text-xs font-semibold tracking-wider text-slate-700 uppercase dark:text-slate-300">
            Member Email Address <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <Mail className="pointer-events-none absolute top-3.5 left-3 h-4 w-4 text-slate-400" />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="colleague@example.com (e.g. alice@example.com)"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pr-3.5 pl-9 text-sm text-slate-900 placeholder-slate-400 transition-all focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-white"
            />
          </div>
        </div>

        <div className="space-y-1 rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-600 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-400">
          <p className="font-medium text-slate-700 dark:text-slate-300">💡 Quick Tip:</p>
          <p>
            The user must already be registered in TaskPulse. Try testing with sample colleague:{" "}
            <code className="font-mono text-indigo-600 dark:text-indigo-400">
              alice@example.com
            </code>
          </p>
        </div>

        <div className="flex items-center justify-end gap-2.5 pt-2">
          <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            isLoading={isSubmitting}
            className="cursor-pointer"
          >
            <UserPlus className="h-4 w-4" />
            Add to Team
          </Button>
        </div>
      </form>
    </Modal>
  );
};
