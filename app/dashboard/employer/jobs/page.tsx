"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Search, Calendar, Clock, Eye, Users } from "lucide-react"
import DashboardLayout from "@/components/dashboard/dashboard-layout"
import { Badge } from "@/components/ui/badge"
import { useState } from "react"
import { useAuth } from "@/hooks/useAuth"
import { useUserProfile } from "@/hooks/useUserProfile"

export default function EmployerJobs() {
  const { user } = useAuth()
  const { profile } = useUserProfile()
  const [statusFilter, setStatusFilter] = useState("all")

  const filteredJobs = statusFilter === "all" 
    ? jobs 
    : jobs.filter(job => job.status.toLowerCase() === statusFilter.toLowerCase())

  return (
    <DashboardLayout activeRoute="jobs" userData={profile} user={user}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Posted Jobs</h1>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Post New Job
          </Button>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Your Jobs</CardTitle>
                <CardDescription>
                  Manage your current job postings
                </CardDescription>
              </div>
              <div className="flex space-x-2">
                <Button 
                  variant={statusFilter === "all" ? "default" : "outline"} 
                  size="sm"
                  onClick={() => setStatusFilter("all")}
                >
                  All
                </Button>
                <Button 
                  variant={statusFilter === "active" ? "default" : "outline"} 
                  size="sm"
                  onClick={() => setStatusFilter("active")}
                >
                  Active
                </Button>
                <Button 
                  variant={statusFilter === "paused" ? "default" : "outline"} 
                  size="sm"
                  onClick={() => setStatusFilter("paused")}
                >
                  Paused
                </Button>
                <Button 
                  variant={statusFilter === "expired" ? "default" : "outline"} 
                  size="sm"
                  onClick={() => setStatusFilter("expired")}
                >
                  Expired
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredJobs.length > 0 ? (
                filteredJobs.map((job) => (
                  <div key={job.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-medium">{job.title}</h3>
                        <p className="text-sm text-muted-foreground">{job.location}</p>
                        <div className="flex items-center mt-2 space-x-4 text-sm">
                          <div className="flex items-center">
                            <Calendar className="mr-1 h-4 w-4 text-muted-foreground" />
                            <span>Posted {job.postedDate}</span>
                          </div>
                          <div className="flex items-center">
                            <Clock className="mr-1 h-4 w-4 text-muted-foreground" />
                            <span>Expires in {job.expiresIn}</span>
                          </div>
                        </div>
                      </div>
                      <Badge variant={job.status === "Active" ? "default" : "secondary"}>
                        {job.status}
                      </Badge>
                    </div>
                    <div className="mt-4 flex items-center justify-between">
                      <div className="flex space-x-4 text-sm">
                        <div className="flex items-center">
                          <Users className="mr-1 h-4 w-4 text-muted-foreground" />
                          <span>{job.applicants} Applicants</span>
                        </div>
                        <div className="flex items-center">
                          <Eye className="mr-1 h-4 w-4 text-muted-foreground" />
                          <span>{job.views} Views</span>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm">Edit</Button>
                        <Button variant="outline" size="sm">
                          {job.status === "Active" ? "Pause" : "Activate"}
                        </Button>
                        <Button variant="outline" size="sm">Delete</Button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No jobs found matching the current filter.
                </div>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <div className="text-sm text-muted-foreground">
              Showing {filteredJobs.length} of {jobs.length} jobs
            </div>
            <Button variant="outline">
              <Plus className="mr-2 h-4 w-4" />
              Post New Job
            </Button>
          </CardFooter>
        </Card>
      </div>
    </DashboardLayout>
  )
}

// Sample data
const jobs = [
  {
    id: "1",
    title: "Weekend Barista",
    location: "San Francisco, CA",
    applicants: 12,
    views: 245,
    status: "Active",
    postedDate: "5 days ago",
    expiresIn: "25 days",
  },
  {
    id: "2",
    title: "Part-time Web Developer",
    location: "Remote",
    applicants: 8,
    views: 189,
    status: "Active",
    postedDate: "1 week ago",
    expiresIn: "23 days",
  },
  {
    id: "3",
    title: "Evening Retail Associate",
    location: "New York, NY",
    applicants: 15,
    views: 320,
    status: "Active",
    postedDate: "3 days ago",
    expiresIn: "27 days",
  },
  {
    id: "4",
    title: "Weekend Tour Guide",
    location: "Chicago, IL",
    applicants: 6,
    views: 178,
    status: "Active",
    postedDate: "6 days ago",
    expiresIn: "24 days",
  },
  {
    id: "5",
    title: "Freelance Graphic Designer",
    location: "Remote",
    applicants: 19,
    views: 302,
    status: "Active",
    postedDate: "2 days ago",
    expiresIn: "28 days",
  },
]

