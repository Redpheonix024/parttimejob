"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { BarChart, Briefcase, Clock, DollarSign, Eye, FileText, Plus, Users, Star, Camera, Building2 } from "lucide-react"
import DashboardLayout from "@/components/dashboard/dashboard-layout"
import StatCard from "@/components/dashboard/stat-card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useState, useEffect, useRef } from "react"
import { useAuth } from "@/hooks/useAuth"
import { useUserProfile } from "@/hooks/useUserProfile"
import { usersApi } from "@/utils/api"
import { toast } from "sonner"

export default function EmployerDashboard() {
  const [activeTab, setActiveTab] = useState("overview")
  const { user } = useAuth()
  const { profile, getProfilePicture, updateProfilePicture } = useUserProfile()
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const handleFileSelect = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0 || !user?.uid) return

    const file = files[0]
    
    // Check file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file')
      return
    }
    
    // Check file size (limit to 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size exceeds 5MB limit')
      return
    }

    // Upload the file
    try {
      setIsUploading(true)
      const response = await usersApi.uploadProfilePicture(file, user.uid)
      
      if (response.success) {
        await updateProfilePicture(response.imageUrl)
        toast.success('Profile picture updated successfully')
      }
    } catch (error) {
      console.error('Upload error:', error)
      toast.error('Failed to upload profile picture')
    } finally {
      setIsUploading(false)
      // Reset the input
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }
  
  return (
    <DashboardLayout activeRoute="overview" userData={profile} user={user}>
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        className="hidden" 
        accept="image/*"
      />
      <div className="space-y-6">
        <h2 className="text-3xl font-semibold text-primary">
          Welcome back, {user?.displayName || "Employer"}!
        </h2>

        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Employer Dashboard</h1>
          <Button>Post a Job</Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StatCard
            title="Posted Jobs"
            value="8"
            description="3 active, 5 filled"
          />
          <StatCard
            title="Total Applications"
            value="156"
            description="+24% from last month"
          />
          <StatCard 
            title="Active Candidates" 
            value="42" 
            description="12 in interview process"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Recent Applications</CardTitle>
                <CardDescription>
                  Latest job applications from candidates
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Add application list component here */}
                  <div className="text-center text-muted-foreground py-4">
                    No recent applications
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full">
                  View All Applications
                </Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Company Profile</CardTitle>
                <CardDescription>Your company information</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center mb-4">
                  <div className="relative group">
                    <Avatar className="h-16 w-16">
                      <AvatarImage
                        src={
                          profile?.profilePicture ||
                          profile?.photoURL ||
                          user?.photoURL ||
                          "/placeholder-user.jpg"
                        }
                        alt={user?.displayName || "Company"}
                      />
                      <AvatarFallback>
                        {user?.displayName?.[0] || "C"}
                      </AvatarFallback>
                    </Avatar>
                    <button 
                      className="absolute bottom-0 right-0 bg-primary text-white rounded-full p-1 cursor-pointer"
                      onClick={handleFileSelect}
                      disabled={isUploading}
                      type="button"
                    >
                      <Camera className="h-3 w-3" />
                    </button>
                  </div>
                  <div className="ml-4">
                    <h3 className="font-medium">
                      {user?.displayName || "Complete Your Company Profile"}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {user?.email || "Add your company details"}
                    </p>
                    <div className="flex items-center mt-1">
                      <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                      <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                      <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                      <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                      <Star className="h-4 w-4 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground ml-1">
                        (4.0)
                      </span>
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Profile Completion</span>
                      <span className="font-medium">75%</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary"
                        style={{ width: "75%" }}
                      ></div>
                    </div>
                  </div>
                  <div className="text-sm">
                    <p className="font-medium mb-2">Complete these items:</p>
                    <ul className="space-y-1">
                      <li className="flex items-center text-muted-foreground">
                        <span className="mr-2">•</span>
                        Add company description
                      </li>
                      <li className="flex items-center text-muted-foreground">
                        <span className="mr-2">•</span>
                        Upload company logo
                      </li>
                      <li className="flex items-center text-muted-foreground">
                        <span className="mr-2">•</span>
                        Add company location
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full">
                  Edit Company Profile
                </Button>
              </CardFooter>
            </Card>
          </div>

          <div>
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Posted Jobs</CardTitle>
                <CardDescription>
                  Your active job listings
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Add job listings component here */}
                  <div className="text-center text-muted-foreground py-4">
                    No active job listings
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full">
                  View All Jobs
                </Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Company Statistics</CardTitle>
                <CardDescription>
                  Your company's performance metrics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Building2 className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span className="text-sm">Company Size</span>
                    </div>
                    <span className="text-sm font-medium">10-50 employees</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Briefcase className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span className="text-sm">Jobs Posted</span>
                    </div>
                    <span className="text-sm font-medium">8</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Users className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span className="text-sm">Total Applications</span>
                    </div>
                    <span className="text-sm font-medium">156</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <FileText className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span className="text-sm">Active Candidates</span>
                    </div>
                    <span className="text-sm font-medium">42</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

// Helper functions for activity styling
function getActivityColor(type: string) {
  switch (type) {
    case "Application":
      return "bg-blue-100 text-blue-600"
    case "View":
      return "bg-green-100 text-green-600"
    case "Message":
      return "bg-purple-100 text-purple-600"
    case "System":
      return "bg-orange-100 text-orange-600"
    default:
      return "bg-gray-100 text-gray-600"
  }
}

function getActivityIcon(type: string) {
  switch (type) {
    case "Application":
      return <FileText className="h-5 w-5" />
    case "View":
      return <Eye className="h-5 w-5" />
    case "Message":
      return <FileText className="h-5 w-5" />
    case "System":
      return <BarChart className="h-5 w-5" />
    default:
      return <FileText className="h-5 w-5" />
  }
}

function getActivityBadgeVariant(type: string) {
  switch (type) {
    case "Application":
      return "secondary"
    case "View":
      return "default"
    case "Message":
      return "outline"
    case "System":
      return "destructive"
    default:
      return "secondary"
  }
}

// Sample data
const activeJobs = [
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
]

const recentActivities = [
  {
    type: "Application",
    title: "New Application",
    description: "Sarah Johnson applied for Weekend Barista position",
    time: "5 minutes ago",
  },
  {
    type: "View",
    title: "Job View Milestone",
    description: "Your Part-time Web Developer job reached 100+ views",
    time: "2 hours ago",
  },
  {
    type: "Message",
    title: "New Message",
    description: "Michael Chen sent you a message about the Web Developer position",
    time: "1 day ago",
  },
  {
    type: "System",
    title: "Subscription Renewal",
    description: "Your Pro Plan subscription will renew in 7 days",
    time: "2 days ago",
  },
]

const recentApplicants = [
  {
    name: "Sarah Johnson",
    position: "Weekend Barista",
    appliedDate: "5 minutes ago",
    status: "New",
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    name: "Michael Chen",
    position: "Part-time Web Developer",
    appliedDate: "2 hours ago",
    status: "Reviewed",
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    name: "Emily Rodriguez",
    position: "Evening Retail Associate",
    appliedDate: "1 day ago",
    status: "Shortlisted",
    avatar: "/placeholder.svg?height=40&width=40",
  },
]

const jobPerformance = [
  {
    title: "Weekend Barista",
    views: 245,
    applicants: 12,
    clickRate: 18,
  },
  {
    title: "Part-time Web Developer",
    views: 189,
    applicants: 8,
    clickRate: 12,
  },
  {
    title: "Evening Retail Associate",
    views: 320,
    applicants: 15,
    clickRate: 22,
  },
]

