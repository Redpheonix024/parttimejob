import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CheckCircle2 } from "lucide-react";

interface ProfileCompletionDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ProfileCompletionDialog({
  isOpen,
  onClose,
}: ProfileCompletionDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex justify-center mb-4">
            <CheckCircle2 className="h-12 w-12 text-green-500" />
          </div>
          <DialogTitle className="text-center">Profile Complete!</DialogTitle>
          <DialogDescription className="text-center">
            Congratulations! Your profile is now 100% complete. You are ready to
            start applying for jobs.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="sm:justify-center">
          <Button onClick={onClose}>Start Applying</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 