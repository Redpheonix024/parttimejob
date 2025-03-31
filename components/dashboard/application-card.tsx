import { Badge } from "@/components/ui/badge"
import { Briefcase, Clock } from "lucide-react"

interface ApplicationCardProps {
  application: {
    jobTitle: string
    company: string
    appliedDate: string
    status: string
    location?: string
    salary?: string
    type?: string
  }
}

export default function ApplicationCard({ application }: ApplicationCardProps) {
  return (
    <div className="flex items-start justify-between border-b pb-4 last:border-0 last:pb-0">
      <div className="flex items-start">
        <div className="h-10 w-10 rounded-md bg-muted flex items-center justify-center mr-3">
          <Briefcase className="h-5 w-5 text-muted-foreground" />
        </div>
        <div>
          <h3 className="font-medium">{application.jobTitle}</h3>
          <p className="text-sm text-muted-foreground">{application.company}</p>
          <div className="flex items-center mt-1 text-xs text-muted-foreground">
            <Clock className="h-3 w-3 mr-1" />
            <span>Applied {application.appliedDate}</span>
          </div>
        </div>
      </div>
      <Badge
        variant={
          application.status === "Pending"
            ? "outline"
            : application.status === "Interview"
              ? "secondary"
              : application.status === "Rejected"
                ? "destructive"
                : "default"
        }
      >
        {application.status}
      </Badge>
    </div>
  )
}

