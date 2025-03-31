import { Button } from "@/components/ui/button"
import { Calendar, Clock } from "lucide-react"

interface InterviewCardProps {
  interview: {
    jobTitle: string
    company: string
    date: string
    time: string
  }
}

export default function InterviewCard({ interview }: InterviewCardProps) {
  return (
    <div className="flex items-start justify-between border-b pb-4 last:border-0 last:pb-0">
      <div className="flex items-start">
        <div className="h-10 w-10 rounded-md bg-muted flex items-center justify-center mr-3">
          <Calendar className="h-5 w-5 text-muted-foreground" />
        </div>
        <div>
          <h3 className="font-medium">{interview.jobTitle}</h3>
          <p className="text-sm text-muted-foreground">{interview.company}</p>
          <div className="flex items-center mt-1 text-xs">
            <Clock className="h-3 w-3 mr-1 text-muted-foreground" />
            <span className="text-muted-foreground">
              {interview.date}, {interview.time}
            </span>
          </div>
        </div>
      </div>
      <Button variant="outline" size="sm">
        Details
      </Button>
    </div>
  )
}

