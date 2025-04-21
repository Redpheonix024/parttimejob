import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Briefcase, Clock } from "lucide-react";
import { useState } from "react";
import ApplicationDetails from "./application-details";

interface Application {
  id: string;
  jobTitle: string;
  company: string;
  location: string;
  salary: string;
  type: string;
  appliedDate: string;
  status: string;
  jobId: string;
}

interface ApplicationCardProps {
  application: Application;
  onRemove: () => void;
  onStatusChange?: (applicationId: string, newStatus: string) => void;
}

export default function ApplicationCard({
  application,
  onRemove,
  onStatusChange,
}: ApplicationCardProps) {
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const getStatusBadge = () => {
    switch (application.status) {
      case "Applied":
        return <Badge variant="secondary">Applied</Badge>;
      case "Under Review":
        return <Badge variant="secondary">Under Review</Badge>;
      case "Hired":
        return <Badge variant="default">Hired</Badge>;
      default:
        return <Badge variant="secondary">{application.status}</Badge>;
    }
  };

  return (
    <>
      <div className="flex items-start justify-between border-b pb-6 last:border-0 last:pb-0">
        <div
          className="flex items-start cursor-pointer hover:opacity-80 transition-opacity"
          onClick={() => setIsDetailsOpen(true)}
        >
          <div className="h-10 w-10 rounded-md bg-muted flex items-center justify-center mr-3">
            <Briefcase className="h-5 w-5 text-muted-foreground" />
          </div>
          <div>
            <h3 className="font-medium">{application.jobTitle}</h3>
            <p className="text-sm text-muted-foreground">
              {application.company}
            </p>
            <div className="flex items-center mt-1 text-xs text-muted-foreground">
              <Clock className="h-3 w-3 mr-1" />
              <span>Applied {application.appliedDate}</span>
            </div>
          </div>
        </div>
        {getStatusBadge()}
      </div>

      <ApplicationDetails
        application={application}
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        onRemove={onRemove}
        onStatusChange={onStatusChange}
      />
    </>
  );
}
