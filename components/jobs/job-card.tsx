import Link from "next/link"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Briefcase, Clock, MapPin, Users, Calendar } from "lucide-react"
import { RupeeIcon } from "@/components/ui/rupee-icon"
import type { Job } from "@/types/job"

interface JobCardProps {
  job: Job
}

export default function JobCard({ job }: JobCardProps) {
  // Helper function to get relative time
  const getRelativeTime = (date: Date) => {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) return `${diffInMinutes} ${diffInMinutes === 1 ? 'minute' : 'minutes'} ago`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} ${diffInHours === 1 ? 'hour' : 'hours'} ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays} ${diffInDays === 1 ? 'day' : 'days'} ago`;
    const diffInWeeks = Math.floor(diffInDays / 7);
    if (diffInWeeks < 4) return `${diffInWeeks} ${diffInWeeks === 1 ? 'week' : 'weeks'} ago`;
    const diffInMonths = Math.floor(diffInDays / 30);
    if (diffInMonths < 12) return `${diffInMonths} ${diffInMonths === 1 ? 'month' : 'months'} ago`;
    const diffInYears = Math.floor(diffInMonths / 12);
    return `${diffInYears} ${diffInYears === 1 ? 'year' : 'years'} ago`;
  };

  // Get location display text with fallbacks
  const getLocationDisplay = () => {
    try {
      // If location is a string, return it directly
      if (typeof job.location === 'string') {
        return job.location;
      }

      // If location is undefined or null, use workLocation
      if (!job.location) {
        return job.workLocation === 'on-site' ? 'On-site' : 'Remote';
      }

      // If location is an object
      if (typeof job.location === 'object') {
        // Check for display property first
        if (job.location.display) return job.location.display;

        // Check for address property
        if (job.location.address) return job.location.address;

        // Check for city and state combination
        if (job.location.city && job.location.state) {
          return `${job.location.city}, ${job.location.state}`;
        }

        // Check for individual properties
        if (job.location.city) return job.location.city;
        if (job.location.state) return job.location.state;
      }

      // Final fallback
      return job.workLocation === 'on-site' ? 'On-site' : 'Remote';
    } catch (error) {
      console.error('Error getting location display:', error);
      return job.workLocation === 'on-site' ? 'On-site' : 'Remote';
    }
  };

  // Format salary display
  const getSalaryDisplay = () => {
    if (!job.salaryAmount) return 'Rate not specified';
    return `${job.salaryAmount} ${job.salaryType === 'daily' ? 'per day' : 'per month'}`;
  };

  // Format positions display
  const getPositionsDisplay = () => {
    if (!job.positions) return 'Positions not specified';
    return `${job.positionsFilled || 0}/${job.positions} positions filled`;
  };

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
              <span>{getLocationDisplay()}</span>
            </div>
            <div className="flex items-center text-sm">
              <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
              <span>{job.hours || 'Flexible hours'}</span>
            </div>
            <div className="flex items-center text-sm">
              <RupeeIcon className="h-4 w-4 mr-2 text-muted-foreground" />
              <span>{getSalaryDisplay()}</span>
            </div>
            <div className="flex items-center text-sm">
              <Briefcase className="h-4 w-4 mr-2 text-muted-foreground" />
              <span>{job.duration || 'Duration not specified'}</span>
            </div>
            <div className="flex items-center text-sm">
              <Users className="h-4 w-4 mr-2 text-muted-foreground" />
              <span>{getPositionsDisplay()}</span>
            </div>
            {job.startDate && (
              <div className="flex items-center text-sm">
                <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                <span>Starts {new Date(job.startDate).toLocaleDateString()}</span>
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter className="border-t pt-4">
          <div className="flex justify-between items-center w-full">
            <span className="text-sm text-muted-foreground">
              Posted {job.createdAt ? getRelativeTime(new Date(job.createdAt)) : 'Recently'}
            </span>
            <Button variant="secondary" size="sm">
              View Details
            </Button>
          </div>
        </CardFooter>
      </Card>
    </Link>
  )
}