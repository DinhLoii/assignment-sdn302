"use client";

import * as React from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Save } from "lucide-react";
import { toast } from "sonner";
import { TeamItem } from "@/types";

interface EditTeamModalProps {
  isOpen: boolean;
  onClose: () => void;
  team: TeamItem;
  onTeamUpdated: (updatedTeam: Partial<TeamItem>) => void;
}

export const EditTeamModal: React.FC<EditTeamModalProps> = ({
  isOpen,
  onClose,
  team,
  onTeamUpdated,
}) => {
  const [name, setName] = React.useState(team.name);
  const [description, setDescription] = React.useState(team.description || "");
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  React.useEffect(() => {
    setName(team.name);
    setDescription(team.description || "");
  }, [team]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Please provide a team name");
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await fetch(`/api/teams/${team.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim() || null,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success && data.data) {
        toast.success("Team updated successfully!");
        onTeamUpdated(data.data);
        onClose();
      } else {
        toast.error(data.error || "Failed to update team");
      }
    } catch {
      toast.error("Network error while updating team");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Team Information">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-1.5 block text-xs font-semibold tracking-wider text-slate-700 uppercase dark:text-slate-300">
            Team Name <span className="text-rose-500">*</span>
          </label>
          <Input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Core Engineering"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-semibold tracking-wider text-slate-700 uppercase dark:text-slate-300">
            Description
          </label>
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Team description and mission..."
            rows={3}
          />
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
            <Save className="h-4 w-4" />
            Save Changes
          </Button>
        </div>
      </form>
    </Modal>
  );
};
