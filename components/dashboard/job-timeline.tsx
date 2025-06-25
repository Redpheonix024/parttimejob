import { Badge } from "@/components/ui/badge"
import { CheckCircle2, Clock, FileText, Briefcase } from "lucide-react"
import { RupeeIcon } from "@/components/ui/rupee-icon"

interface JobTimelineProps {
  status: "applied" | "approved" | "hired" | "completed" | "paid"
  dates?: {
    applied?: string
    approved?: string
    started?: string
    completed?: string
    paid?: string
  }
}

export default function JobTimeline({ status, dates }: JobTimelineProps) {
  const steps = [
    {
      key: "applied",
      label: "Applied",
      icon: <FileText className="h-5 w-5" />,
      date: dates?.applied,
      completed: ["applied", "approved", "hired", "completed", "paid"].includes(status),
    },
    {
      key: "approved",
      label: "Approved",
      icon: <CheckCircle2 className="h-5 w-5" />,
      date: dates?.approved,
      completed: ["approved", "hired", "completed", "paid"].includes(status),
    },
    {
      key: "hired",
      label: "Hired",
      icon: <Briefcase className="h-5 w-5" />,
      date: dates?.started,
      completed: ["hired", "completed", "paid"].includes(status),
    },
    {
      key: "completed",
      label: "Completed",
      icon: <Clock className="h-5 w-5" />,
      date: dates?.completed,
      completed: ["completed", "paid"].includes(status),
    },
    {
      key: "paid",
      label: "Payment Received",
      icon: <RupeeIcon className="h-5 w-5" />,
      date: dates?.paid,
      completed: ["paid"].includes(status),
    },
  ]

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium">Job Progress</h3>
      <div className="relative">
        {/* Timeline line */}
        <div className="absolute left-7 top-0 bottom-0 w-0.5 bg-muted" />

        {/* Timeline steps */}
        <div className="space-y-8 relative">
          {steps.map((step, index) => (
            <div key={step.key} className="flex items-start">
              <div
                className={`z-10 flex items-center justify-center w-14 h-14 rounded-full border-2 ${
                  step.completed
                    ? step.key === "paid"
                      ? "bg-[#10B981]/10 border-[#10B981] text-[#10B981]"
                      : "bg-primary/10 border-primary text-primary"
                    : "bg-muted border-muted-foreground/20 text-muted-foreground"
                }`}
              >
                {step.icon}
              </div>
              <div className="ml-4 pt-3">
                <div className="flex items-center">
                  <h4 className="font-medium">{step.label}</h4>
                  {step.completed && (
                    <Badge
                      variant="outline"
                      className={`ml-2 ${step.key === status ? "border-primary text-primary" : ""}`}
                    >
                      {step.key === status ? "Current" : "Completed"}
                    </Badge>
                  )}
                </div>
                {step.date && <p className="text-sm text-muted-foreground mt-1">{step.date}</p>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

