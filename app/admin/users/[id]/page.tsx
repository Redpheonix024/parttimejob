"use client"

import React from "react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { doc, getDoc, getDocs, collection, query, where } from "firebase/firestore"
import { db } from "@/app/config/firebase"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Mail, Phone, MapPin, Calendar, Briefcase, User, Shield, Trash2, FileText, CheckCircle, DollarSign, Edit } from "lucide-react"
import { format } from "date-fns"
import { toast } from "sonner"
import Link from "next/link"
import { use } from "react"
import AdminSidebar from "@/components/admin/admin-sidebar"
import AdminHeader from "@/components/admin/admin-header"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

interface UserDetails {
  id: string
  name: string
  email: string
  phone: string
  role: string
  status: string
  createdAt: string
  location: {
    address: string
    city: string
    state: string
    zip: string
  }
  jobs: {
    posted: number
    active: number
    completed: number
  }
  bio?: string
  skills?: string[]
  completionRate?: number
  responseRate?: number
  rating?: number
  totalEarnings?: string
  totalHours?: number
  completedJobs?: Array<{
    id: string
    title: string
    company: string
    duration: string
    hours: number
    earnings: string
    rating: number
  }>
  applications?: Array<{
    id: string
    jobTitle: string
    company: string
    date: string
    status: string
  }>
  activityTimeline?: Array<{
    id: string
    date: string
    time: string
    action: string
    icon: React.ReactNode
  }>
}

interface Job {
  status: string
  [key: string]: any
}

export default function UserDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const [user, setUser] = useState<UserDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const { id } = use(params)

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const userDoc = await getDoc(doc(db, "users", id))
        if (userDoc.exists()) {
          const userData = userDoc.data()
          
          // Fetch user's jobs
          const jobsQuery = await getDocs(query(collection(db, "jobs"), where("userId", "==", id)))
          const jobs = jobsQuery.docs.map((doc) => doc.data() as Job)
          
          setUser({
            ...userData,
            id: userDoc.id,
            jobs: {
              posted: jobs.length,
              active: jobs.filter((job) => job.status === "active").length,
              completed: jobs.filter((job) => job.status === "completed").length
            },
            // Mock data for demonstration
            bio: "Experienced part-time worker with a background in retail and food service. Looking for flexible opportunities to supplement my income while pursuing my degree in Marketing.",
            skills: ["Customer Service", "Cash Handling", "Inventory Management", "Food Preparation", "Sales"],
            completionRate: 95,
            responseRate: 98,
            rating: 4.8,
            totalEarnings: "$4,250",
            totalHours: 215,
            completedJobs: [
              {
                id: "j1",
                title: "Weekend Barista",
                company: "Coffee House",
                duration: "May 15 - June 30, 2023",
                hours: 48,
                earnings: "$960",
                rating: 5
              },
              {
                id: "j2",
                title: "Warehouse Assistant",
                company: "Global Logistics",
                duration: "April 10 - May 5, 2023",
                hours: 60,
                earnings: "$1,200",
                rating: 4.7
              }
            ],
            applications: [
              {
                id: "a1",
                jobTitle: "Weekend Barista",
                company: "Coffee House",
                date: "June 15, 2023",
                status: "Hired"
              },
              {
                id: "a2",
                jobTitle: "Event Staff",
                company: "City Convention Center",
                date: "June 10, 2023",
                status: "Rejected"
              }
            ],
            activityTimeline: [
              {
                id: "t1",
                date: "June 20, 2023",
                time: "2:30 PM",
                action: "Applied for 'Delivery Driver' at Local Eats",
                icon: <FileText className="h-4 w-4" />
              },
              {
                id: "t2",
                date: "June 18, 2023",
                time: "10:15 AM",
                action: "Completed shift at Coffee House",
                icon: <CheckCircle className="h-4 w-4" />
              },
              {
                id: "t3",
                date: "June 15, 2023",
                time: "3:45 PM",
                action: "Received payment for Warehouse Assistant job",
                icon: <DollarSign className="h-4 w-4" />
              }
            ]
          } as UserDetails)
        } else {
          toast.error("User not found")
          router.push("/admin/users")
        }
      } catch (error) {
        console.error("Error fetching user details:", error)
        toast.error("Failed to fetch user details")
      } finally {
        setLoading(false)
      }
    }

    fetchUserDetails()
  }, [id, router])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex">
        <AdminSidebar
          isSidebarOpen={isSidebarOpen}
          setIsSidebarOpen={setIsSidebarOpen}
          activeLink="users"
        />
        <div className="flex-1 min-w-0 overflow-auto">
          <AdminHeader 
            toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} 
            title="User Details"
          />
          <main className="container mx-auto px-4 py-8">
            <div className="flex items-center justify-center min-h-[50vh]">
              <div className="text-center">
                <h2 className="text-2xl font-bold mb-2">User Not Found</h2>
                <p className="text-muted-foreground mb-4">The requested user could not be found.</p>
                <Button asChild>
                  <Link href="/admin/users">Back to Users</Link>
                </Button>
              </div>
            </div>
          </main>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex">
      <AdminSidebar
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
        activeLink="users"
      />

      {/* Main content */}
      <div className="flex-1 min-w-0 overflow-auto">
        <AdminHeader 
          toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} 
          title="User Details"
        />

        <main className="container mx-auto px-4 py-8">
          <div className="flex items-center gap-2 mb-6">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => router.back()}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-xl font-bold">User Details</h1>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* User Profile Card */}
            <Card className="lg:col-span-1">
              <CardHeader className="text-center">
                <Avatar className="h-24 w-24 mx-auto mb-4">
                  <AvatarImage src="/placeholder.svg" alt={user.name || 'User'} />
                  <AvatarFallback>{user.name?.charAt(0) || 'U'}</AvatarFallback>
                </Avatar>
                <CardTitle>{user.name || 'Unknown User'}</CardTitle>
                <div className="flex justify-center mt-2">
                  <Badge variant={user.role === "Employer" ? "outline" : user.role === "Admin" ? "destructive" : "secondary"}>
                    {user.role || 'User'}
                  </Badge>
                  <Badge variant={user.status === "Active" ? "default" : "outline"} className="ml-2">
                    {user.status || 'Inactive'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span>{user.email || 'No email provided'}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{user.phone || 'No phone provided'}</span>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>
                    {user.location?.address || 'N/A'}, 
                    {user.location?.city || 'N/A'}, 
                    {user.location?.state || 'N/A'} 
                    {user.location?.zip || ''}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>Joined {user.createdAt ? format(new Date(user.createdAt), "MMM d, yyyy") : 'N/A'}</span>
                </div>

                <Separator />

                <div>
                  <h3 className="font-medium mb-2">Bio</h3>
                  <p className="text-sm text-muted-foreground">{user.bio || 'No bio provided'}</p>
                </div>

                <div>
                  <h3 className="font-medium mb-2">Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {user.skills?.length ? (
                      user.skills.map((skill, index) => (
                        <Badge key={index} variant="outline">
                          {skill}
                        </Badge>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground">No skills listed</p>
                    )}
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
                      <div className="text-2xl font-bold mt-1">{user.jobs.completed}</div>
                    </div>
                    <div className="bg-muted/50 p-4 rounded-lg">
                      <div className="text-sm text-muted-foreground">Total Hours</div>
                      <div className="text-2xl font-bold mt-1">{user.totalHours}</div>
                    </div>
                    <div className="bg-muted/50 p-4 rounded-lg">
                      <div className="text-sm text-muted-foreground">Total Earnings</div>
                      <div className="text-2xl font-bold mt-1">{user.totalEarnings}</div>
                    </div>
                    <div className="bg-muted/50 p-4 rounded-lg">
                      <div className="text-sm text-muted-foreground">Rating</div>
                      <div className="text-2xl font-bold mt-1 flex items-center">
                        {user.rating}
                        <span className="text-yellow-500 ml-1">★</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm">Completion Rate</span>
                        <span className="text-sm font-medium">{user.completionRate}%</span>
                      </div>
                      <Progress value={user.completionRate} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm">Response Rate</span>
                        <span className="text-sm font-medium">{user.responseRate}%</span>
                      </div>
                      <Progress value={user.responseRate} className="h-2" />
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
                            {user.completedJobs?.map((job) => (
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
                                    <span className="text-yellow-500 ml-1">★</span>
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
                            {user.applications?.map((app) => (
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
                          {user.activityTimeline?.map((item) => (
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
                      {user.status === "Active" ? "Deactivate Account" : "Activate Account"}
                    </Button>
                    <Button variant="outline" className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Verify Skills
                    </Button>
                    <Button variant="destructive" className="flex items-center gap-2">
                      <Trash2 className="h-4 w-4" />
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

