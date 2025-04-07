"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import AdminSidebar from "@/components/layout/admin-sidebar"
import AdminHeader from "@/components/layout/admin-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import {
  ArrowLeft,
  Award,
  Calendar,
  CheckCircle,
  DollarSign,
  Edit,
  FileText,
  Mail,
  MapPin,
  Phone,
  Shield,
  Star,
  XCircle,
} from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

// Mock data - in a real app, this would come from an API call
const userData = {
  id: "1",
  name: "John Doe",
  email: "john.doe@example.com",
  phone: "+1 (555) 123-4567",
  location: "San Francisco, CA",
  type: "Job Seeker",
  joinDate: "May 10, 2023",
  status: "Active",
  avatar: "/placeholder.svg?height=128&width=128",
  bio: "Experienced part-time worker with a background in retail and food service. Looking for flexible opportunities to supplement my income while pursuing my degree in Marketing.",
  skills: ["Customer Service", "Cash Handling", "Inventory Management", "Food Preparation", "Sales"],
  completionRate: 95,
  responseRate: 98,
  rating: 4.8,
  totalEarnings: "$4,250",
  totalHours: 215,
  jobsCompleted: 18,
  jobsInProgress: 2,
  applications: [
    {
      id: "a1",
      jobTitle: "Weekend Barista",
      company: "Coffee House",
      date: "June 15, 2023",
      status: "Hired",
    },
    {
      id: "a2",
      jobTitle: "Event Staff",
      company: "City Convention Center",
      date: "June 10, 2023",
      status: "Rejected",
    },
    {
      id: "a3",
      jobTitle: "Retail Associate",
      company: "Fashion Outlet",
      date: "June 5, 2023",
      status: "Interview",
    },
    {
      id: "a4",
      jobTitle: "Food Delivery Driver",
      company: "Quick Eats",
      date: "May 28, 2023",
      status: "Applied",
    },
  ],
  completedJobs: [
    {
      id: "j1",
      title: "Weekend Barista",
      company: "Coffee House",
      duration: "May 15 - June 30, 2023",
      hours: 48,
      earnings: "$960",
      rating: 5,
    },
    {
      id: "j2",
      title: "Warehouse Assistant",
      company: "Global Logistics",
      duration: "April 10 - May 5, 2023",
      hours: 60,
      earnings: "$1,200",
      rating: 4.7,
    },
    {
      id: "j3",
      title: "Event Staff",
      company: "City Convention Center",
      duration: "March 15-17, 2023",
      hours: 24,
      earnings: "$480",
      rating: 4.9,
    },
  ],
  activityTimeline: [
    {
      id: "t1",
      date: "June 20, 2023",
      time: "2:30 PM",
      action: "Applied for 'Delivery Driver' at Local Eats",
      icon: <FileText className="h-4 w-4" />,
    },
    {
      id: "t2",
      date: "June 18, 2023",
      time: "10:15 AM",
      action: "Completed shift at Coffee House",
      icon: <CheckCircle className="h-4 w-4" />,
    },
    {
      id: "t3",
      date: "June 15, 2023",
      time: "3:45 PM",
      action: "Received payment for Warehouse Assistant job",
      icon: <DollarSign className="h-4 w-4" />,
    },
    {
      id: "t4",
      date: "June 12, 2023",
      time: "9:00 AM",
      action: "Scheduled interview with Fashion Outlet",
      icon: <Calendar className="h-4 w-4" />,
    },
    {
      id: "t5",
      date: "June 10, 2023",
      time: "5:30 PM",
      action: "Updated profile information",
      icon: <Edit className="h-4 w-4" />,
    },
  ],
}

export default function AdminUserDetail() {
  const router = useRouter()
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)

  return (
    <div className="min-h-screen bg-background flex">
      <AdminSidebar
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
        activeLink="users"
        onLogout={() => router.push("/admin/login")}
      />

      {/* Main content */}
      <div className="flex-1 min-w-0 overflow-auto">
        <AdminHeader toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />

        <main className="container mx-auto px-4 py-8">
          <div className="flex items-center gap-2 mb-6">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/admin/users">
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>
            <h1 className="text-xl font-bold">User Details</h1>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* User Profile Card */}
            <Card className="lg:col-span-1">
              <CardHeader className="text-center">
                <Avatar className="h-24 w-24 mx-auto mb-4">
                  <AvatarImage src={userData.avatar} alt={userData.name} />
                  <AvatarFallback>{userData.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <CardTitle>{userData.name}</CardTitle>
                <div className="flex justify-center mt-2">
                  <Badge
                    variant={
                      userData.type === "Employer" ? "outline" : userData.type === "Admin" ? "destructive" : "secondary"
                    }
                  >
                    {userData.type}
                  </Badge>
                  <Badge variant={userData.status === "Active" ? "default" : "outline"} className="ml-2">
                    {userData.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span>{userData.email}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{userData.phone}</span>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>{userData.location}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>Joined {userData.joinDate}</span>
                </div>

                <Separator />

                <div>
                  <h3 className="font-medium mb-2">Bio</h3>
                  <p className="text-sm text-muted-foreground">{userData.bio}</p>
                </div>

                <div>
                  <h3 className="font-medium mb-2">Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {userData.skills.map((skill, index) => (
                      <Badge key={index} variant="outline">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" className="w-full">
                  <Mail className="mr-2 h-4 w-4" />
                  Contact
                </Button>
              </CardFooter>
            </Card>

            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Performance Metrics */}
              <Card>
                <CardHeader>
                  <CardTitle>Performance Metrics</CardTitle>
                  <CardDescription>Overview of user's performance on the platform</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    <div className="bg-muted/50 p-4 rounded-lg">
                      <div className="text-sm text-muted-foreground">Jobs Completed</div>
                      <div className="text-2xl font-bold mt-1">{userData.jobsCompleted}</div>
                    </div>
                    <div className="bg-muted/50 p-4 rounded-lg">
                      <div className="text-sm text-muted-foreground">Total Hours</div>
                      <div className="text-2xl font-bold mt-1">{userData.totalHours}</div>
                    </div>
                    <div className="bg-muted/50 p-4 rounded-lg">
                      <div className="text-sm text-muted-foreground">Total Earnings</div>
                      <div className="text-2xl font-bold mt-1">{userData.totalEarnings}</div>
                    </div>
                    <div className="bg-muted/50 p-4 rounded-lg">
                      <div className="text-sm text-muted-foreground">Rating</div>
                      <div className="text-2xl font-bold mt-1 flex items-center">
                        {userData.rating}
                        <Star className="h-4 w-4 text-yellow-500 ml-1" fill="currentColor" />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm">Completion Rate</span>
                        <span className="text-sm font-medium">{userData.completionRate}%</span>
                      </div>
                      <Progress value={userData.completionRate} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm">Response Rate</span>
                        <span className="text-sm font-medium">{userData.responseRate}%</span>
                      </div>
                      <Progress value={userData.responseRate} className="h-2" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Tabs for different sections */}
              <Tabs defaultValue="jobs">
                <TabsList className="grid grid-cols-3 mb-4">
                  <TabsTrigger value="jobs">Completed Jobs</TabsTrigger>
                  <TabsTrigger value="applications">Applications</TabsTrigger>
                  <TabsTrigger value="activity">Activity</TabsTrigger>
                </TabsList>

                {/* Completed Jobs Tab */}
                <TabsContent value="jobs" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Completed Jobs</CardTitle>
                      <CardDescription>History of jobs completed by the user</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="rounded-md border">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Job</TableHead>
                              <TableHead>Duration</TableHead>
                              <TableHead>Hours</TableHead>
                              <TableHead>Earnings</TableHead>
                              <TableHead>Rating</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {userData.completedJobs.map((job) => (
                              <TableRow key={job.id}>
                                <TableCell>
                                  <div>
                                    <div className="font-medium">{job.title}</div>
                                    <div className="text-sm text-muted-foreground">{job.company}</div>
                                  </div>
                                </TableCell>
                                <TableCell>{job.duration}</TableCell>
                                <TableCell>{job.hours}</TableCell>
                                <TableCell>{job.earnings}</TableCell>
                                <TableCell>
                                  <div className="flex items-center">
                                    {job.rating}
                                    <Star className="h-3 w-3 text-yellow-500 ml-1" fill="currentColor" />
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Applications Tab */}
                <TabsContent value="applications" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Job Applications</CardTitle>
                      <CardDescription>Recent job applications submitted by the user</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="rounded-md border">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Job</TableHead>
                              <TableHead>Company</TableHead>
                              <TableHead>Date</TableHead>
                              <TableHead>Status</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {userData.applications.map((app) => (
                              <TableRow key={app.id}>
                                <TableCell>
                                  <div className="font-medium">{app.jobTitle}</div>
                                </TableCell>
                                <TableCell>{app.company}</TableCell>
                                <TableCell>{app.date}</TableCell>
                                <TableCell>
                                  <Badge
                                    variant={
                                      app.status === "Hired"
                                        ? "default"
                                        : app.status === "Rejected"
                                          ? "destructive"
                                          : app.status === "Interview"
                                            ? "outline"
                                            : "secondary"
                                    }
                                  >
                                    {app.status}
                                  </Badge>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Activity Tab */}
                <TabsContent value="activity" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Activity Timeline</CardTitle>
                      <CardDescription>Recent activity of the user on the platform</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="relative">
                        {/* Timeline line */}
                        <div className="absolute left-3 top-0 bottom-0 w-0.5 bg-muted" />

                        {/* Timeline items */}
                        <div className="space-y-6 relative">
                          {userData.activityTimeline.map((item) => (
                            <div key={item.id} className="flex items-start">
                              <div className="z-10 flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 border border-primary text-primary">
                                {item.icon}
                              </div>
                              <div className="ml-4">
                                <p className="text-sm font-medium">{item.action}</p>
                                <p className="text-xs text-muted-foreground mt-1">
                                  {item.date} at {item.time}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>

              {/* Admin Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Admin Actions</CardTitle>
                  <CardDescription>Manage this user account</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-4">
                    <Button variant="outline" className="flex items-center gap-2">
                      <Edit className="h-4 w-4" />
                      Edit Profile
                    </Button>
                    <Button variant="outline" className="flex items-center gap-2">
                      <Shield className="h-4 w-4" />
                      {userData.status === "Active" ? "Deactivate Account" : "Activate Account"}
                    </Button>
                    <Button variant="outline" className="flex items-center gap-2">
                      <Award className="h-4 w-4" />
                      Verify Skills
                    </Button>
                    <Button variant="destructive" className="flex items-center gap-2">
                      <XCircle className="h-4 w-4" />
                      Delete Account
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

