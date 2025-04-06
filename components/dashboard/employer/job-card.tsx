import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Briefcase, Clock, Edit, Eye, MapPin, MoreHorizontal, Users } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface EmployerJobCardProps {
  job: {
    id: string
    title: string
    location: string
    applicants: number
    views: number
    status: string
    postedDate: string
    expiresIn: string
  }
}

export default function EmployerJobCard({ job }: EmployerJobCardProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors">
      <div className="flex-1 mb-4 md:mb-0">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-medium">{job.title}</h3>
            <div className="flex items-center text-sm text-muted-foreground mt-1">
              <MapPin className="h-3.5 w-3.5 mr-1" />
              <span>{job.location}</span>
            </div>
          </div>
          <Badge variant={job.status === "Active" ? "default" : "secondary"}>{job.status}</Badge>
        </div>

        <div className="flex flex-wrap gap-x-4 gap-y-2 mt-3">
          <div className="flex items-center text-sm">
            <Users className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
            <span>{job.applicants} applicants</span>
          </div>
          <div className="flex items-center text-sm">
            <Eye className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
            <span>{job.views} views</span>
          </div>
          <div className="flex items-center text-sm">
            <Clock className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
            <span>Posted {job.postedDate}</span>
          </div>
          <div className="flex items-center text-sm">
            <Briefcase className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
            <span>Expires in {job.expiresIn}</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm">
          <Users className="h-4 w-4 mr-2" />
          Applicants
        </Button>
        <Button variant="outline" size="sm">
          <Edit className="h-4 w-4 mr-2" />
          Edit
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Duplicate</DropdownMenuItem>
            <DropdownMenuItem>Pause Listing</DropdownMenuItem>
            <DropdownMenuItem>Promote Job</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive">Delete Job</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}

