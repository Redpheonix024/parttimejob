import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { VisuallyHidden } from "@/components/ui/visually-hidden";
import { useState } from "react";

export function AccessibleDialogExamples() {
  const [showDialog1, setShowDialog1] = useState(false);
  const [showDialog2, setShowDialog2] = useState(false);
  const [showDialog3, setShowDialog3] = useState(false);

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Accessible Dialog Examples</h2>
      
      {/* Example 1: Standard Dialog with visible title */}
      <div>
        <h3 className="text-lg font-medium mb-2">Standard Dialog with visible title</h3>
        <Button onClick={() => setShowDialog1(true)}>Open Dialog 1</Button>
        <Dialog open={showDialog1} onOpenChange={setShowDialog1}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Visible Title</DialogTitle>
              <DialogDescription>
                This dialog has a visible title that is also accessible to screen readers.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">Dialog content here...</div>
            <DialogFooter>
              <Button onClick={() => setShowDialog1(false)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Example 2: Using sr-only class */}
      <div>
        <h3 className="text-lg font-medium mb-2">Dialog with sr-only title</h3>
        <Button onClick={() => setShowDialog2(true)}>Open Dialog 2</Button>
        <Dialog open={showDialog2} onOpenChange={setShowDialog2}>
          <DialogContent>
            <DialogTitle className="sr-only">Hidden Title with sr-only</DialogTitle>
            <div className="py-4">
              <p>
                This dialog has no visible title but still includes a DialogTitle
                with the sr-only class for screen reader accessibility.
              </p>
            </div>
            <DialogFooter>
              <Button onClick={() => setShowDialog2(false)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Example 3: Using VisuallyHidden component */}
      <div>
        <h3 className="text-lg font-medium mb-2">Dialog with VisuallyHidden component</h3>
        <Button onClick={() => setShowDialog3(true)}>Open Dialog 3</Button>
        <Dialog open={showDialog3} onOpenChange={setShowDialog3}>
          <DialogContent>
            <VisuallyHidden>
              <DialogTitle>Hidden Title with VisuallyHidden component</DialogTitle>
            </VisuallyHidden>
            <div className="py-4">
              <p>
                This dialog has no visible title but wraps a DialogTitle
                in the VisuallyHidden component for screen reader accessibility.
              </p>
            </div>
            <DialogFooter>
              <Button onClick={() => setShowDialog3(false)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
} 