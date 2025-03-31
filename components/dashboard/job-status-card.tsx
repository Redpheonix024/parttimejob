"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, Clock, DollarSign, MapPin, Star } from "lucide-react"

interface JobStatusCardProps {
  job: {
    id: string
    title: string
    company: string
    location: string
    rate: string
    startDate?: string
    endDate?: string
    status: "applied" | "approved" | "in-progress" | "completed" | "paid"
    paymentStatus?: "pending" | "processing" | "paid"
    paymentAmount?: string
    paymentDate?: string
    rating?: number
  }
  onViewDetails: (jobId: string) => void
}

export default function JobStatusCard({ job, onViewDetails }: JobStatusCardProps) {
  return (
    <Card className="mb-4">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">{job.title}</CardTitle>
            <p className="text-sm text-muted-foreground">{job.company}</p>
          </div>
          <StatusBadge status={job.status} paymentStatus={job.paymentStatus} />
        </div>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
          <div className="flex items-center">
            <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
            <span>{job.location}</span>
          </div>
          <div className="flex items-center">
            <DollarSign className="h-4 w-4 mr-2 text-muted-foreground" />
            <span>{job.rate}</span>
          </div>
          {job.startDate && (
            <div className="flex items-center">
              <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
              <span>Start: {job.startDate}</span>
            </div>
          )}
          {job.endDate && (
            <div className="flex items-center">
              <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
              <span>End: {job.endDate}</span>
            </div>
          )}
        </div>

        {job.status === "completed" || job.status === "paid" ? (
          <div className="mt-4 flex items-center">
            <div className="flex items-center mr-4">
              <span className="text-sm font-medium mr-2">Payment:</span>
              <Badge variant={job.paymentStatus === "paid" ? "default" : "outline"}>
                {job.paymentStatus === "paid" ? "Received" : "Pending"}
              </Badge>
            </div>
            {job.paymentAmount && (
              <div className="flex items-center">
                <DollarSign className="h-4 w-4 mr-1 text-muted-foreground" />
                <span className="text-sm">{job.paymentAmount}</span>
              </div>
            )}
          </div>
        ) : null}

        {job.status === "paid" && job.rating ? (
          <div className="mt-2 flex items-center">
            <span className="text-sm font-medium mr-2">Your Rating:</span>
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`h-4 w-4 ${i < job.rating! ? "text-[#FACC15] fill-[#FACC15]" : "text-muted-foreground"}`}
                />
              ))}
            </div>
          </div>
        ) : null}
      </CardContent>
      <CardFooter>
        <Button variant="outline" size="sm" className="w-full" onClick={() => onViewDetails(job.id)}>
          View Details
        </Button>
      </CardFooter>
    </Card>
  )
}

function StatusBadge({ status, paymentStatus }: { status: string; paymentStatus?: string }) {
  switch (status) {
    case "applied":
      return <Badge variant="outline">Applied</Badge>
    case "approved":
      return <Badge variant="secondary">Approved</Badge>
    case "in-progress":
      return <Badge variant="default">In Progress</Badge>
    case "completed":
      return <Badge variant={paymentStatus === "paid" ? "default" : "outline"}>Completed</Badge>
    case "paid":
      return <Badge className="bg-[#10B981] text-white">Paid</Badge>
    default:
      return <Badge variant="outline">{status}</Badge>
  }
}

