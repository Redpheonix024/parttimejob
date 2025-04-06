import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Clock } from "lucide-react"

interface EmployerApplicantCardProps {
  applicant: {
    name: string
    position: string
    appliedDate: string
    status: string
    avatar: string
  }
}

export default function EmployerApplicantCard({ applicant }: EmployerApplicantCardProps) {
  return (
    <div className="flex items-start space-x-4">
      <Avatar>
        <AvatarImage src={applicant.avatar} alt={applicant.name} />
        <AvatarFallback>{applicant.name.charAt(0)}</AvatarFallback>
      </Avatar>
      <div className="flex-1 space-y-1">
        <div className="flex items-center justify-between">
          <p className="font-medium text-sm">{applicant.name}</p>
          <Badge
            variant={
              applicant.status === "New" ? "default" : applicant.status === "Shortlisted" ? "success" : "secondary"
            }
          >
            {applicant.status}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground">{applicant.position}</p>
        <div className="flex items-center text-xs text-muted-foreground">
          <Clock className="h-3 w-3 mr-1" />
          <span>{applicant.appliedDate}</span>
        </div>
      </div>
      <Button variant="ghost" size="sm">
        View
      </Button>
    </div>
  )
}

