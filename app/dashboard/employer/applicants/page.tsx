"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Download, Eye, Mail, MoreHorizontal, Phone, Search, ThumbsDown, ThumbsUp, User, Calendar, Clock, FileText, MessageSquare } from "lucide-react"
import DashboardLayout from "@/components/dashboard/dashboard-layout"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useState } from "react"
import { useAuth } from "@/hooks/useAuth"
import { useUserProfile } from "@/hooks/useUserProfile"

export default function EmployerApplicants() {
  const { user } = useAuth()
  const { profile } = useUserProfile()
  const [statusFilter, setStatusFilter] = useState("all")

  const applicants = [
    {
      id: "1",
      name: "Sarah Johnson",
      position: "Weekend Barista",
      appliedDate: "5 minutes ago",
      status: "New",
      avatar: "/placeholder.svg?height=40&width=40",
      email: "sarah.j@example.com",
      phone: "+1 (555) 123-4567",
      experience: "2 years",
      education: "Bachelor's in Communications",
    },
    {
      id: "2",
      name: "Michael Chen",
      position: "Part-time Web Developer",
      appliedDate: "2 hours ago",
      status: "Reviewed",
      avatar: "/placeholder.svg?height=40&width=40",
      email: "michael.c@example.com",
      phone: "+1 (555) 987-6543",
      experience: "3 years",
      education: "Master's in Computer Science",
    },
    {
      id: "3",
      name: "Emily Rodriguez",
      position: "Evening Retail Associate",
      appliedDate: "1 day ago",
      status: "Shortlisted",
      avatar: "/placeholder.svg?height=40&width=40",
      email: "emily.r@example.com",
      phone: "+1 (555) 456-7890",
      experience: "1 year",
      education: "High School Diploma",
    },
    {
      id: "4",
      name: "David Kim",
      position: "Weekend Tour Guide",
      appliedDate: "3 days ago",
      status: "Interview",
      avatar: "/placeholder.svg?height=40&width=40",
      email: "david.k@example.com",
      phone: "+1 (555) 234-5678",
      experience: "4 years",
      education: "Bachelor's in History",
    },
    {
      id: "5",
      name: "Jessica Patel",
      position: "Freelance Graphic Designer",
      appliedDate: "2 days ago",
      status: "New",
      avatar: "/placeholder.svg?height=40&width=40",
      email: "jessica.p@example.com",
      phone: "+1 (555) 876-5432",
      experience: "5 years",
      education: "Bachelor's in Fine Arts",
    },
  ]

  const filteredApplicants = statusFilter === "all" 
    ? applicants 
    : applicants.filter(applicant => applicant.status.toLowerCase() === statusFilter.toLowerCase())

  function getStatusColor(status: string) {
    switch (status) {
      case "New":
        return "bg-blue-500"
      case "Reviewed":
        return "bg-yellow-500"
      case "Shortlisted":
        return "bg-green-500"
      case "Interview":
        return "bg-purple-500"
      case "Rejected":
        return "bg-red-500"
      case "Hired":
        return "bg-emerald-500"
      default:
        return "bg-gray-500"
    }
  }

  return (
    <DashboardLayout activeRoute="applicants" userData={profile} user={user}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Applicants</h1>
          <div className="flex space-x-2">
            <Button variant="outline">Export</Button>
            <Button variant="outline">Filter</Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Job Applicants</CardTitle>
                <CardDescription>
                  Review and manage candidates who applied to your job postings
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
                  variant={statusFilter === "new" ? "default" : "outline"} 
                  size="sm"
                  onClick={() => setStatusFilter("new")}
                >
                  New
                </Button>
                <Button 
                  variant={statusFilter === "shortlisted" ? "default" : "outline"} 
                  size="sm"
                  onClick={() => setStatusFilter("shortlisted")}
                >
                  Shortlisted
                </Button>
                <Button 
                  variant={statusFilter === "interview" ? "default" : "outline"} 
                  size="sm"
                  onClick={() => setStatusFilter("interview")}
                >
                  Interview
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredApplicants.length > 0 ? (
                filteredApplicants.map((applicant) => (
                  <div key={applicant.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={applicant.avatar} alt={applicant.name} />
                          <AvatarFallback>{applicant.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="font-medium">{applicant.name}</h3>
                          <p className="text-sm text-muted-foreground">{applicant.position}</p>
                          <div className="flex items-center mt-2 space-x-4 text-xs text-muted-foreground">
                            <div className="flex items-center">
                              <Calendar className="mr-1 h-3 w-3" />
                              <span>Applied {applicant.appliedDate}</span>
                            </div>
                            <div className="flex items-center">
                              <User className="mr-1 h-3 w-3" />
                              <span>{applicant.experience} experience</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className={`h-2 w-2 rounded-full ${getStatusColor(applicant.status)}`}></div>
                        <span className="text-sm font-medium">{applicant.status}</span>
                      </div>
                    </div>
                    <div className="mt-4 flex items-center justify-between">
                      <div className="flex space-x-2 text-xs">
                        <div className="text-muted-foreground">{applicant.email}</div>
                        <div className="text-muted-foreground">•</div>
                        <div className="text-muted-foreground">{applicant.phone}</div>
                      </div>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm">
                          <FileText className="mr-1 h-4 w-4" />
                          Resume
                        </Button>
                        <Button variant="outline" size="sm">
                          <MessageSquare className="mr-1 h-4 w-4" />
                          Message
                        </Button>
                        <Button variant="outline" size="sm">More</Button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No applicants found matching the current filter.
                </div>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <div className="text-sm text-muted-foreground">
              Showing {filteredApplicants.length} of {applicants.length} applicants
            </div>
            <Button variant="outline">View All Applications</Button>
          </CardFooter>
        </Card>
      </div>
    </DashboardLayout>
  )
}

