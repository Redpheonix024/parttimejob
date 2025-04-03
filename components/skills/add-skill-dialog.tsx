import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skill, SkillLevel, SkillCategory } from "@/types/user";
import { useState } from "react";

interface AddSkillDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (skill: Omit<Skill, "id">) => void;
}

export function AddSkillDialog({
  isOpen,
  onClose,
  onAdd,
}: AddSkillDialogProps) {
  const [newSkill, setNewSkill] = useState<Partial<Skill>>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSkill.name || !newSkill.level || !newSkill.category) return;

    onAdd(newSkill as Omit<Skill, "id">);
    setNewSkill({});
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Skill</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Skill Name</Label>
              <Input
                id="name"
                value={newSkill.name || ""}
                onChange={(e) =>
                  setNewSkill((prev) => ({ ...prev, name: e.target.value }))
                }
                placeholder="Enter skill name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <select
                id="category"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2"
                value={newSkill.category || ""}
                onChange={(e) =>
                  setNewSkill((prev) => ({
                    ...prev,
                    category: e.target.value as SkillCategory,
                  }))
                }
              >
                <option value="">Select Category</option>
                {Object.values(SkillCategory).map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="level">Level</Label>
              <select
                id="level"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2"
                value={newSkill.level || ""}
                onChange={(e) =>
                  setNewSkill((prev) => ({
                    ...prev,
                    level: e.target.value as SkillLevel,
                  }))
                }
              >
                <option value="">Select Level</option>
                {Object.values(SkillLevel).map((level) => (
                  <option key={level} value={level}>
                    {level}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="years">Years of Experience</Label>
              <Input
                id="years"
                type="number"
                min="0"
                max="50"
                value={newSkill.yearsOfExperience || ""}
                onChange={(e) =>
                  setNewSkill((prev) => ({
                    ...prev,
                    yearsOfExperience: parseInt(e.target.value),
                  }))
                }
                placeholder="Years of experience"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={newSkill.description || ""}
                onChange={(e) =>
                  setNewSkill((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                placeholder="Describe your skill"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">Add Skill</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
