import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { Check, Circle, Trash2 } from "lucide-react"
import { useState, useEffect } from "react"
import { updateDoc, doc, deleteDoc } from "firebase/firestore"
import { db } from "@/app/config/firebase"
import { toast } from "sonner"
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
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"

interface Application {
  id: string
  jobTitle: string
  company: string
  location: string
  salary: string
  type: string
  appliedDate: string
  status: string
  jobId: string
}

interface ApplicationDetailsProps {
  application: Application
  isOpen: boolean
  onClose: () => void
  onRemove: () => void
}

interface Stage {
  id: string
  name: string
  order: number
}

const defaultStages: Stage[] = [
  { id: "Applied", name: "Applied", order: 1 },
  { id: "Under Review", name: "Under Review", order: 2 },
  { id: "Hired", name: "Hired", order: 3 }
]

export default function ApplicationDetails({ application, isOpen, onClose, onRemove }: ApplicationDetailsProps) {
  const [currentStage, setCurrentStage] = useState(application.status)
  const [stages] = useState<Stage[]>(defaultStages)

  useEffect(() => {
    setCurrentStage(application.status)
  }, [application.status])

  const handleStageChange = async (newStage: string) => {
    try {
      await updateDoc(doc(db, "applications", application.id), {
        status: newStage,
      })
      setCurrentStage(newStage)
      toast.success("Application stage updated")
    } catch (error) {
      console.error("Error updating application stage:", error)
      toast.error("Failed to update application stage")
    }
  }

  const handleRemove = async () => {
    try {
      await deleteDoc(doc(db, "applications", application.id))
      toast.success("Application removed successfully")
      onRemove()
      onClose()
    } catch (error) {
      console.error("Error removing application:", error)
      toast.error("Failed to remove application")
    }
  }

  const sortedStages = [...stages].sort((a, b) => a.order - b.order)
  const currentStageOrder = sortedStages.find(s => s.id === currentStage)?.order || 1

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <div className="flex justify-between items-center">
            <DialogTitle className="text-2xl">{application.jobTitle}</DialogTitle>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete your application.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleRemove} className="bg-red-500 hover:bg-red-600">
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <Badge variant="outline">{application.location}</Badge>
            <Badge variant="outline">{application.type}</Badge>
            <Badge variant="outline">{application.salary}</Badge>
          </div>

          <div className="text-sm text-muted-foreground">
            Applied on {application.appliedDate}
          </div>

          <div className="pt-4">
            <h4 className="text-sm font-medium mb-4">Application Status</h4>
            <div className="flex items-center justify-between w-full">
              {sortedStages.map((stage, index) => {
                const isCompleted = stage.order < currentStageOrder
                const isCurrent = stage.id === currentStage
                const isNextStage = stage.order === currentStageOrder + 1 && currentStage === "Applied"
                const isHighlighted = isCurrent || isNextStage
                const isLastHighlighted = isNextStage || (isCurrent && !isNextStage)
                
                return (
                  <div key={stage.id} className="flex items-center flex-1">
                    <div
                      className={cn(
                        "flex items-center justify-center w-8 h-8 rounded-full cursor-pointer relative",
                        isCompleted ? "bg-green-500" : isHighlighted ? "bg-blue-500" : "bg-gray-200",
                        isLastHighlighted && "animate-pulse"
                      )}
                      onClick={() => handleStageChange(stage.id)}
                    >
                      {isCompleted ? (
                        <Check className="w-4 h-4 text-white" />
                      ) : (
                        <Circle className="w-4 h-4 text-white" />
                      )}
                    </div>
                    <div className="ml-2 text-sm font-medium">{stage.name}</div>
                    {index < sortedStages.length - 1 && stage.order < currentStageOrder + 1 && (
                      <div
                        className={cn(
                          "h-0.5 flex-1 mx-2",
                          stage.order < currentStageOrder ? "bg-green-500" : "bg-blue-500"
                        )}
                      />
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          <div className="pt-4">
            <h4 className="text-sm font-medium mb-2">Company</h4>
            <p className="text-sm">{application.company}</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
} 