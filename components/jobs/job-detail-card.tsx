import { Badge } from "@/components/ui/badge";
import { Briefcase, Building, Calendar, Clock, MapPin } from "lucide-react";
import { RupeeIcon } from "@/components/ui/rupee-icon";
import type { Job } from "@/types/job";

interface JobDetailCardProps {
  job: Job;
}

export default function JobDetailCard({ job }: JobDetailCardProps) {
  // Function to get the location display text
  const getLocationDisplay = () => {
    if (!job.location) return "Remote";
    if (typeof job.location === "string") return job.location;

    // If location is an object
    if (typeof job.location === "object") {
      const parts = [];

      // Add building name if available
      if (job.location.buildingName) {
        parts.push(job.location.buildingName);
      }

      // Add address if available
      if (job.location.address) {
        parts.push(job.location.address);
      }

      // Add city and state
      if (job.location.city && job.location.state) {
        parts.push(`${job.location.city}, ${job.location.state}`);
      } else {
        if (job.location.city) parts.push(job.location.city);
        if (job.location.state) parts.push(job.location.state);
      }

      // Add ZIP code if available
      if (job.location.zip) {
        parts.push(job.location.zip);
      }

      return parts.join(", ");
    }

    return "Location not specified";
  };

  return (
    <div className="flex flex-wrap gap-4 mb-6">
      {job.urgent && (
        <Badge variant="destructive" className="mb-4">
          Urgent
        </Badge>
      )}
      <div className="flex items-center text-sm">
        <Building className="h-4 w-4 mr-2 text-muted-foreground" />
        <span>{job.company}</span>
      </div>
      <div className="flex items-center text-sm">
        <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
        <span>{getLocationDisplay()}</span>
      </div>
      <div className="flex items-center text-sm">
        <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
        <span>{job.hours}</span>
      </div>
      <div className="flex items-center text-sm">
        <RupeeIcon className="h-4 w-4 mr-2 text-muted-foreground" />
        <span>{job.rate}</span>
      </div>
      <div className="flex items-center text-sm">
        <Briefcase className="h-4 w-4 mr-2 text-muted-foreground" />
        <span>{job.duration}</span>
      </div>
      <div className="flex items-center text-sm">
        <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
        <span>Posted {job.postedDate}</span>
      </div>
    </div>
  );
}
