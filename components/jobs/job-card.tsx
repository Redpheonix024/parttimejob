import Link from "next/link"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Briefcase, Clock, DollarSign, MapPin } from "lucide-react"
import type { Job } from "@/types/job"

interface JobCardProps {
  job: Job
}

export default function JobCard({ job }: JobCardProps) {
  return (
    <Link href={`/jobs/${job.id}`}>
      <Card className="h-full hover:shadow-md transition-shadow">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-xl">{job.title}</CardTitle>
              <CardDescription className="mt-1">{job.company}</CardDescription>
            </div>
            {job.urgent && (
              <Badge variant="destructive" className="ml-2">
                Urgent
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center text-sm">
              <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
              <span>{job.location}</span>
            </div>
            <div className="flex items-center text-sm">
              <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
              <span>{job.hours}</span>
            </div>
            <div className="flex items-center text-sm">
              <DollarSign className="h-4 w-4 mr-2 text-muted-foreground" />
              <span>{job.rate}</span>
            </div>
            <div className="flex items-center text-sm">
              <Briefcase className="h-4 w-4 mr-2 text-muted-foreground" />
              <span>{job.duration}</span>
            </div>
          </div>
        </CardContent>
        <CardFooter className="border-t pt-4">
          <div className="flex justify-between items-center w-full">
            <span className="text-sm text-muted-foreground">Posted {job.postedDate}</span>
            <Button variant="secondary" size="sm">
              View Details
            </Button>
          </div>
        </CardFooter>
      </Card>
    </Link>
  )
}

