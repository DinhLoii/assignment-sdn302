"use client";

import * as React from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { TeamItem } from "@/types";

interface CreateTeamModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTeamCreated: (newTeam: TeamItem) => void;
}

export const CreateTeamModal: React.FC<CreateTeamModalProps> = ({
  isOpen,
  onClose,
  onTeamCreated,
}) => {
  const [name, setName] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Please provide a team name");
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await fetch("/api/teams", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success && data.data) {
        toast.success(`Team "${data.data.name}" created successfully!`);
        onTeamCreated(data.data);
        setName("");
        setDescription("");
        onClose();
      } else {
        toast.error(data.error || "Failed to create team");
      }
    } catch {
      toast.error("Network error while creating team");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create New Team Workspace">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-1.5 block text-xs font-semibold tracking-wider text-slate-700 uppercase dark:text-slate-300">
            Team Name <span className="text-rose-500">*</span>
          </label>
          <Input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Frontend Engineering, Product Design"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-semibold tracking-wider text-slate-700 uppercase dark:text-slate-300">
            Description (Optional)
          </label>
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Brief overview of the team's mission, goals, or department..."
            rows={3}
          />
        </div>

        <div className="rounded-xl border border-indigo-100 bg-indigo-50/60 p-3 text-xs text-indigo-700 dark:border-indigo-900/40 dark:bg-indigo-950/30 dark:text-indigo-300">
          💡 You will automatically become the <strong>Owner</strong> of this team and can invite
          members by email.
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
            <Plus className="h-4 w-4" />
            Create Team
          </Button>
        </div>
      </form>
    </Modal>
  );
};
