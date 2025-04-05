"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Clock, MapPin } from "lucide-react"
import { RupeeIcon } from "@/components/ui/rupee-icon"

interface JobCardProps {
  job: {
    title: string
    company: string
    location: string
    salary: string
    type: string
    postedDate?: string
  }
  showApplyButton?: boolean
  showRemoveButton?: boolean
  onApply?: () => void
  onRemove?: () => void
}

export default function JobCard({
  job,
  showApplyButton = false,
  showRemoveButton = false,
  onApply,
  onRemove,
}: JobCardProps) {
  return (
    <div className="border-b pb-4 last:border-0 last:pb-0">
      <h3 className="font-medium">{job.title}</h3>
      <p className="text-sm text-muted-foreground">{job.company}</p>
      <div className="flex flex-wrap gap-2 mt-2">
        <div className="flex items-center text-xs text-muted-foreground">
          <MapPin className="h-3 w-3 mr-1" />
          <span>{job.location}</span>
        </div>
        <div className="flex items-center text-xs text-muted-foreground">
          <RupeeIcon className="h-3 w-3 mr-1" />
          <span>{job.salary}</span>
        </div>
        <div className="flex items-center text-xs text-muted-foreground">
          <Clock className="h-3 w-3 mr-1" />
          <span>{job.type}</span>
        </div>
        {job.postedDate && (
          <div className="flex items-center text-xs text-muted-foreground">
            <Clock className="h-3 w-3 mr-1" />
            <span>Posted {job.postedDate}</span>
          </div>
        )}
      </div>

      {(showApplyButton || showRemoveButton) && (
        <div className="flex flex-col sm:flex-row items-end space-y-2 sm:space-y-0 sm:space-x-2 mt-2">
          {showApplyButton && <Button onClick={onApply}>Apply Now</Button>}
          {showRemoveButton && (
            <Button variant="outline" size="sm" onClick={onRemove}>
              Remove
            </Button>
          )}
        </div>
      )}
    </div>
  )
}

