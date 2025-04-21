import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Check, Circle, Trash2, ArrowRight, ArrowDown } from "lucide-react";
import { useState, useEffect } from "react";
import { updateDoc, doc, deleteDoc } from "firebase/firestore";
import { db } from "@/app/config/firebase";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

interface Application {
  id: string;
  jobTitle: string;
  company: string;
  location: string;
  salary: string;
  type: string;
  appliedDate: string;
  status: string;
  jobId: string;
  companyWebsite?: string;
  jobDescription?: string;
  jobUrl?: string;
  contactName?: string;
  contactEmail?: string;
  notes?: string;
}

interface ApplicationDetailsProps {
  application: Application;
  isOpen: boolean;
  onClose: () => void;
  onRemove: () => void;
  onStatusChange?: (applicationId: string, newStatus: string) => void;
}

interface Stage {
  id: string;
  name: string;
  order: number;
}

const defaultStages: Stage[] = [
  { id: "Applied", name: "Applied", order: 1 },
  { id: "Under Review", name: "Under Review", order: 2 },
  { id: "Hired", name: "Hired", order: 3 },
];

export default function ApplicationDetails({
  application,
  isOpen,
  onClose,
  onRemove,
  onStatusChange,
}: ApplicationDetailsProps) {
  const [currentStage, setCurrentStage] = useState(application.status);
  const [stages] = useState<Stage[]>(defaultStages);

  useEffect(() => {
    setCurrentStage(application.status);
  }, [application.status]);

  const handleStageChange = async (newStage: string) => {
    try {
      console.log("Updating stage to:", newStage);
      await updateDoc(doc(db, "applications", application.id), {
        status: newStage,
      });
      setCurrentStage(newStage);
      onStatusChange?.(application.id, newStage);
      toast.success("Application stage updated");
    } catch (error) {
      console.error("Error updating application stage:", error);
      toast.error("Failed to update application stage");
    }
  };

  const handleRemove = async () => {
    try {
      await deleteDoc(doc(db, "applications", application.id));
      toast.success("Application removed successfully");
      onRemove();
      onClose();
    } catch (error) {
      console.error("Error removing application:", error);
      toast.error("Failed to remove application");
    }
  };

  const sortedStages = [...stages].sort((a, b) => a.order - b.order);
  const currentStageOrder =
    sortedStages.find((s) => s.id === currentStage)?.order || 1;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px] p-4 sm:p-6 max-h-[90vh] overflow-y-auto">
        <DialogHeader className="px-0">
          <div className="flex justify-between items-center">
            <DialogTitle className="text-2xl">
              {application.jobTitle}
            </DialogTitle>
          </div>
          <div className="mt-2">
            <h3 className="text-lg font-medium">{application.company}</h3>
          </div>
        </DialogHeader>

        <div className="flex flex-col sm:flex-row application-details-container">
          <div className="w-full sm:w-2/3 sm:pr-6 space-y-6">
            <div className="flex flex-wrap items-center gap-2">
              {application.location && (
                <Badge variant="outline">{application.location}</Badge>
              )}
              {application.type && (
                <Badge variant="outline">{application.type}</Badge>
              )}
              {application.salary && (
                <Badge variant="outline">{application.salary}</Badge>
              )}
            </div>

            <div className="text-sm text-muted-foreground">
              Applied on {application.appliedDate}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4">
              {/* Job Details Section */}
              <div className="space-y-3 col-span-1 sm:col-span-2">
                <h4 className="text-sm font-medium">Job Description</h4>
                <div className="space-y-2 bg-slate-50 dark:bg-slate-900 p-3 rounded-md">
                  {application.jobDescription ? (
                    <div className="text-sm">{application.jobDescription}</div>
                  ) : (
                    <div className="text-sm text-muted-foreground italic">
                      No description available
                    </div>
                  )}
                </div>
              </div>

              {/* Company Information */}
              <div className="space-y-3">
                <h4 className="text-sm font-medium">Company Information</h4>
                <div className="space-y-2">
                  <p className="text-sm">{application.company}</p>
                  {application.companyWebsite && (
                    <a
                      href={application.companyWebsite}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-500 hover:underline flex items-center gap-1"
                    >
                      Visit Company Website
                    </a>
                  )}
                </div>
              </div>

              {/* Application Details */}
              <div className="space-y-3">
                <h4 className="text-sm font-medium">Application Details</h4>
                <div className="space-y-2">
                  <div className="text-sm">
                    <span className="font-medium">Salary:</span>{" "}
                    {application.salary || "Not specified"}
                  </div>
                  <div className="text-sm">
                    <span className="font-medium">Job Type:</span>{" "}
                    {application.type || "Not specified"}
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              {(application.contactName || application.contactEmail) && (
                <div className="space-y-3">
                  <h4 className="text-sm font-medium">Contact Information</h4>
                  <div className="space-y-2">
                    {application.contactName && (
                      <div className="text-sm">
                        <span className="font-medium">Name:</span>{" "}
                        {application.contactName}
                      </div>
                    )}
                    {application.contactEmail && (
                      <div>
                        <span className="text-sm font-medium">Email:</span>
                        <a
                          href={`mailto:${application.contactEmail}`}
                          className="text-sm ml-1 text-blue-500 hover:underline"
                        >
                          {application.contactEmail}
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Application Notes */}
              {application.notes && (
                <div className="space-y-3 col-span-1 sm:col-span-2">
                  <h4 className="text-sm font-medium">Notes</h4>
                  <div className="text-sm bg-slate-50 dark:bg-slate-900 p-2 sm:p-3 rounded-md max-h-32 overflow-y-auto">
                    {application.notes}
                  </div>
                </div>
              )}
            </div>

            {/* Action buttons */}
            <div className="pt-6 flex flex-wrap gap-4 justify-start">
              {application.jobId && (
                <a
                  href={`/jobs/${application.jobId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900 px-4 py-2 rounded-md flex items-center gap-2"
                >
                  View Public Listing
                </a>
              )}

              {application.jobUrl && (
                <a
                  href={application.jobUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 px-4 py-2 rounded-md flex items-center gap-2"
                >
                  View Original Job Post
                </a>
              )}
            </div>
          </div>

          <div className="w-full sm:w-1/3 border-t sm:border-t-0 sm:border-l pt-6 sm:pt-0 sm:pl-6 mt-6 sm:mt-0">
            <h4 className="text-sm font-medium mb-4">Application Status</h4>

            {/* Mobile Status View (horizontal) */}
            <div className="sm:hidden overflow-x-auto pb-4 -mx-4 px-4">
              <div
                className="flex items-center"
                style={{ minWidth: "max-content" }}
              >
                {sortedStages.map((stage, index) => {
                  const isCompleted = stage.order < currentStageOrder;
                  const isCurrent = stage.id === currentStage;
                  const isHighlighted = isCurrent || isCompleted;
                  const isHired = stage.id === "Hired" && isCurrent;

                  return (
                    <div
                      key={stage.id}
                      className="flex flex-col items-center"
                      style={{ width: "85px" }}
                    >
                      <div className="flex items-center w-full justify-center">
                        <div
                          className={cn(
                            "w-10 h-10 rounded-full flex items-center justify-center cursor-pointer transition-all duration-300",
                            isHighlighted
                              ? "bg-blue-500 shadow-md"
                              : "bg-gray-200",
                            isCurrent && "ring-4 ring-blue-200",
                            isHired && "bg-green-500"
                          )}
                          onClick={() => handleStageChange(stage.id)}
                        >
                          {isCompleted || isHired ? (
                            <Check className="w-5 h-5 text-white" />
                          ) : (
                            <Circle className="w-5 h-5 text-white" />
                          )}
                        </div>

                        {/* Connector with arrow */}
                        {index < sortedStages.length - 1 && (
                          <div
                            className="flex items-center h-[2px] w-12 absolute"
                            style={{ left: "55px" }}
                          >
                            <div
                              className={cn(
                                "h-[2px] flex-1",
                                isCompleted ? "bg-blue-500" : "bg-gray-200"
                              )}
                            ></div>
                            <ArrowRight
                              className={cn(
                                "h-4 w-4 flex-shrink-0 -mr-2",
                                isCompleted ? "text-blue-500" : "text-gray-200"
                              )}
                            />
                          </div>
                        )}
                      </div>
                      <div className="text-xs font-medium text-center w-full mt-2 truncate px-1">
                        {stage.name}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Desktop Status View (vertical) */}
            <div className="hidden sm:block">
              <div className="relative pl-5">
                {sortedStages.map((stage, index) => {
                  const isCompleted = stage.order < currentStageOrder;
                  const isCurrent = stage.id === currentStage;
                  const isHighlighted = isCurrent || isCompleted;
                  const isHired = stage.id === "Hired" && isCurrent;

                  return (
                    <div
                      key={stage.id}
                      className={cn("mb-12 last:mb-0 relative")}
                    >
                      <div className="flex items-center">
                        <div
                          className={cn(
                            "w-10 h-10 rounded-full flex items-center justify-center cursor-pointer transition-all duration-300",
                            isHighlighted
                              ? "bg-blue-500 shadow-md"
                              : "bg-gray-200",
                            isCurrent && "ring-4 ring-blue-200",
                            isHired && "bg-green-500"
                          )}
                          onClick={() => handleStageChange(stage.id)}
                        >
                          {isCompleted || isHired ? (
                            <Check className="w-5 h-5 text-white" />
                          ) : (
                            <Circle className="w-5 h-5 text-white" />
                          )}
                        </div>
                        <div className="text-sm font-medium ml-4">
                          {stage.name}
                        </div>
                      </div>

                      {/* Vertical connector with arrow */}
                      {index < sortedStages.length - 1 && (
                        <div
                          className="absolute left-5 top-[40px] flex flex-col items-center"
                          style={{ transform: "translateX(-50%)" }}
                        >
                          <div
                            className={cn(
                              "w-[2px] h-8",
                              isCompleted ? "bg-blue-500" : "bg-gray-200"
                            )}
                          ></div>
                          <ArrowDown
                            className={cn(
                              "h-4 w-4 -mt-1",
                              isCompleted ? "text-blue-500" : "text-gray-200"
                            )}
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Centered delete button */}
        <div className="mt-6 pt-6 border-t flex justify-center">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="outline"
                className="text-red-500 hover:text-red-600 hover:bg-red-50 border-red-200 hover:border-red-300"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Application
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete
                  your application.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleRemove}
                  className="bg-red-500 hover:bg-red-600"
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </DialogContent>
    </Dialog>
  );
}
