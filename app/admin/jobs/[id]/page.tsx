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
  Briefcase,
  Calendar,
  CheckCircle,
  Clock,
  DollarSign,
  Edit,
  Eye,
  FileText,
  MapPin,
  MoreHorizontal,
  Shield,
  Trash2,
  User,
} from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

// Mock data - in a real app, this would come from an API call
const jobData = {
  id: "1",
  title: "Weekend Barista",
  company: "Coffee House",
  companyLogo: "/placeholder.svg?height=40&width=40",
  location: "San Francisco, CA",
  type: "Part-time",
  category: "Food Service",
  postedDate: "May 10, 2023",
  expiryDate: "July 10, 2023",
  status: "Active",
  featured: true,
  urgent: false,
  rate: "$18-22/hour",
  duration: "3 months",
  applications: 12,
  views: 245,
  description:
    "We are looking for a friendly and experienced barista to join our team for weekend shifts. The ideal candidate will have previous experience making espresso-based drinks and providing excellent customer service.",
  requirements: [
    "Previous barista experience preferred",
    "Ability to work weekends",
    "Excellent customer service skills",
    "Knowledge of coffee preparation techniques",
    "Food handler's certification a plus",
  ],
  benefits: ["Flexible scheduling", "Free coffee", "Tips", "Employee discount"],
  employer: {
    id: "e1",
    name: "Sarah Johnson",
    email: "sarah@coffeehouse.com",
    phone: "+1 (555) 987-6543",
    avatar: "/placeholder.svg?height=40&width=40",
  },
  applicants: [
    {
      id: "a1",
      name: "John Doe",
      email: "john.doe@example.com",
      appliedDate: "May 15, 2023",
      status: "Interviewed",
      avatar: "/placeholder.svg?height=32&width=32",
    },
    {
      id: "a2",
      name: "Emily Wilson",
      email: "emily.wilson@example.com",
      appliedDate: "May 12, 2023",
      status: "Hired",
      avatar: "/placeholder.svg?height=32&width=32",
    },
    {
      id: "a3",
      name: "Michael Chen",
      email: "michael.chen@example.com",
      appliedDate: "May 18, 2023",
      status: "Applied",
      avatar: "/placeholder.svg?height=32&width=32",
    },
    {
      id: "a4",
      name: "Jessica Brown",
      email: "jessica.brown@example.com",
      appliedDate: "May 20, 2023",
      status: "Rejected",
      avatar: "/placeholder.svg?height=32&width=32",
    },
  ],
  timeline: [
    {
      id: "t1",
      date: "May 10, 2023",
      time: "9:30 AM",
      action: "Job posted",
      icon: <FileText className="h-4 w-4" />,
    },
    {
      id: "t2",
      date: "May 12, 2023",
      time: "2:15 PM",
      action: "First application received",
      icon: <User className="h-4 w-4" />,
    },
    {
      id: "t3",
      date: "May 15, 2023",
      time: "11:00 AM",
      action: "Job featured by admin",
      icon: <Shield className="h-4 w-4" />,
    },
    {
      id: "t4",
      date: "May 18, 2023",
      time: "3:45 PM",
      action: "Interview scheduled with Emily Wilson",
      icon: <Calendar className="h-4 w-4" />,
    },
    {
      id: "t5",
      date: "May 25, 2023",
      time: "10:30 AM",
      action: "Emily Wilson hired",
      icon: <CheckCircle className="h-4 w-4" />,
    },
  ],
  flowStatus: "active", // Can be: draft, pending, active, paused, filled, expired, closed
  flowProgress: 60, // Percentage of completion in the job lifecycle
}

export default function AdminJobDetail() {
  const router = useRouter()
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)

  // Function to get status color
  const getStatusColor = (status) => {
    switch (status) {
      case "draft":
        return "bg-muted"
      case "pending":
        return "bg-yellow-500"
      case "active":
        return "bg-green-500"
      case "paused":
        return "bg-orange-500"
      case "filled":
        return "bg-blue-500"
      case "expired":
        return "bg-red-500"
      case "closed":
        return "bg-gray-500"
      default:
        return "bg-muted"
    }
  }

  return (
    <div className="min-h-screen bg-background flex">
      <AdminSidebar
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
        activeLink="jobs"
        onLogout={() => router.push("/admin/login")}
      />

      {/* Main content */}
      <div className="flex-1 min-w-0 overflow-auto">
        <AdminHeader toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />

        <main className="container mx-auto px-4 py-8">
          <div className="flex items-center gap-2 mb-6">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/admin/jobs">
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>
            <h1 className="text-xl font-bold">Job Details</h1>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Job Info Card */}
            <Card className="lg:col-span-1">
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="h-10 w-10 rounded-md bg-primary/10 flex items-center justify-center">
                    <Briefcase className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>{jobData.title}</CardTitle>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Badge variant={jobData.status === "Active" ? "default" : "outline"}>{jobData.status}</Badge>
                  {jobData.featured && <Badge variant="secondary">Featured</Badge>}
                  {jobData.urgent && <Badge variant="destructive">Urgent</Badge>}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={jobData.companyLogo} alt={jobData.company} />
                    <AvatarFallback>{jobData.company.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <span>{jobData.company}</span>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>{jobData.location}</span>
                </div>
                <div className="flex items-center gap-3">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  <span>{jobData.rate}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>{jobData.duration}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>Posted: {jobData.postedDate}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>Expires: {jobData.expiryDate}</span>
                </div>

                <Separator />

                <div>
                  <h3 className="font-medium mb-2">Description</h3>
                  <p className="text-sm text-muted-foreground">{jobData.description}</p>
                </div>

                <div>
                  <h3 className="font-medium mb-2">Requirements</h3>
                  <ul className="text-sm text-muted-foreground space-y-1 list-disc pl-5">
                    {jobData.requirements.map((req, index) => (
                      <li key={index}>{req}</li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h3 className="font-medium mb-2">Benefits</h3>
                  <ul className="text-sm text-muted-foreground space-y-1 list-disc pl-5">
                    {jobData.benefits.map((benefit, index) => (
                      <li key={index}>{benefit}</li>
                    ))}
                  </ul>
                </div>

                <Separator />

                <div>
                  <h3 className="font-medium mb-2">Employer</h3>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={jobData.employer.avatar} alt={jobData.employer.name} />
                      <AvatarFallback>{jobData.employer.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">{jobData.employer.name}</div>
                      <div className="text-xs text-muted-foreground">{jobData.employer.email}</div>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" className="flex items-center gap-2">
                  <Eye className="h-4 w-4" />
                  View Public Listing
                </Button>
                <Button variant="outline" className="flex items-center gap-2">
                  <Edit className="h-4 w-4" />
                  Edit Job
                </Button>
              </CardFooter>
            </Card>

            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Job Status Flow Chart */}
              <Card>
                <CardHeader>
                  <CardTitle>Job Status</CardTitle>
                  <CardDescription>Current status and progress of this job posting</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="mb-4">
                    <div className="flex justify-between mb-1">
                      <span className="text-sm">Job Lifecycle Progress</span>
                      <span className="text-sm font-medium">{jobData.flowProgress}%</span>
                    </div>
                    <Progress value={jobData.flowProgress} className="h-2" />
                  </div>

                  {/* Flow Chart */}
                  <div className="relative py-6">
                    <div className="absolute left-0 right-0 top-1/2 h-0.5 bg-muted -translate-y-1/2" />
                    <div className="relative flex justify-between">
                      {/* Draft */}
                      <div className="flex flex-col items-center">
                        <div
                          className={`z-10 w-8 h-8 rounded-full flex items-center justify-center ${
                            jobData.flowStatus === "draft"
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted text-muted-foreground"
                          }`}
                        >
                          <FileText className="h-4 w-4" />
                        </div>
                        <span className="text-xs mt-2">Draft</span>
                      </div>

                      {/* Pending */}
                      <div className="flex flex-col items-center">
                        <div
                          className={`z-10 w-8 h-8 rounded-full flex items-center justify-center ${
                            jobData.flowStatus === "pending"
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted text-muted-foreground"
                          }`}
                        >
                          <Clock className="h-4 w-4" />
                        </div>
                        <span className="text-xs mt-2">Pending</span>
                      </div>

                      {/* Active */}
                      <div className="flex flex-col items-center">
                        <div
                          className={`z-10 w-8 h-8 rounded-full flex items-center justify-center ${
                            jobData.flowStatus === "active"
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted text-muted-foreground"
                          }`}
                        >
                          <CheckCircle className="h-4 w-4" />
                        </div>
                        <span className="text-xs mt-2">Active</span>
                      </div>

                      {/* Filled */}
                      <div className="flex flex-col items-center">
                        <div
                          className={`z-10 w-8 h-8 rounded-full flex items-center justify-center ${
                            jobData.flowStatus === "filled"
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted text-muted-foreground"
                          }`}
                        >
                          <User className="h-4 w-4" />
                        </div>
                        <span className="text-xs mt-2">Filled</span>
                      </div>

                      {/* Closed */}
                      <div className="flex flex-col items-center">
                        <div
                          className={`z-10 w-8 h-8 rounded-full flex items-center justify-center ${
                            jobData.flowStatus === "closed" || jobData.flowStatus === "expired"
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted text-muted-foreground"
                          }`}
                        >
                          <Briefcase className="h-4 w-4" />
                        </div>
                        <span className="text-xs mt-2">Closed</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-muted/50 p-4 rounded-lg">
                      <div className="text-sm text-muted-foreground">Applications</div>
                      <div className="text-2xl font-bold mt-1">{jobData.applications}</div>
                    </div>
                    <div className="bg-muted/50 p-4 rounded-lg">
                      <div className="text-sm text-muted-foreground">Views</div>
                      <div className="text-2xl font-bold mt-1">{jobData.views}</div>
                    </div>
                    <div className="bg-muted/50 p-4 rounded-lg">
                      <div className="text-sm text-muted-foreground">Days Active</div>
                      <div className="text-2xl font-bold mt-1">
                        {Math.floor(
                          (new Date().getTime() - new Date(jobData.postedDate).getTime()) / (1000 * 60 * 60 * 24),
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Tabs for different sections */}
              <Tabs defaultValue="applicants">
                <TabsList className="grid grid-cols-2 mb-4">
                  <TabsTrigger value="applicants">Applicants</TabsTrigger>
                  <TabsTrigger value="timeline">Timeline</TabsTrigger>
                </TabsList>

                {/* Applicants Tab */}
                <TabsContent value="applicants" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Applicants</CardTitle>
                      <CardDescription>People who have applied for this job</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="rounded-md border">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Applicant</TableHead>
                              <TableHead>Applied Date</TableHead>
                              <TableHead>Status</TableHead>
                              <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {jobData.applicants.map((applicant) => (
                              <TableRow key={applicant.id}>
                                <TableCell>
                                  <div className="flex items-center gap-3">
                                    <Avatar className="h-8 w-8">
                                      <AvatarImage src={applicant.avatar} alt={applicant.name} />
                                      <AvatarFallback>{applicant.name.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                      <div className="font-medium">{applicant.name}</div>
                                      <div className="text-xs text-muted-foreground">{applicant.email}</div>
                                    </div>
                                  </div>
                                </TableCell>
                                <TableCell>{applicant.appliedDate}</TableCell>
                                <TableCell>
                                  <Badge
                                    variant={
                                      applicant.status === "Hired"
                                        ? "default"
                                        : applicant.status === "Rejected"
                                          ? "destructive"
                                          : applicant.status === "Interviewed"
                                            ? "outline"
                                            : "secondary"
                                    }
                                  >
                                    {applicant.status}
                                  </Badge>
                                </TableCell>
                                <TableCell className="text-right">
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button variant="ghost" size="icon">
                                        <MoreHorizontal className="h-4 w-4" />
                                        <span className="sr-only">Open menu</span>
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                      <DropdownMenuItem>
                                        <User className="mr-2 h-4 w-4" />
                                        View Profile
                                      </DropdownMenuItem>
                                      <DropdownMenuItem>
                                        <FileText className="mr-2 h-4 w-4" />
                                        View Application
                                      </DropdownMenuItem>
                                      <DropdownMenuSeparator />
                                      <DropdownMenuItem>
                                        <CheckCircle className="mr-2 h-4 w-4" />
                                        Mark as Hired
                                      </DropdownMenuItem>
                                      <DropdownMenuItem className="text-destructive">
                                        <Trash2 className="mr-2 h-4 w-4" />
                                        Reject
                                      </DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Timeline Tab */}
                <TabsContent value="timeline" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Job Timeline</CardTitle>
                      <CardDescription>History and activity for this job posting</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="relative">
                        {/* Timeline line */}
                        <div className="absolute left-3 top-0 bottom-0 w-0.5 bg-muted" />

                        {/* Timeline items */}
                        <div className="space-y-6 relative">
                          {jobData.timeline.map((item) => (
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
                  <CardDescription>Manage this job posting</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-4">
                    <Button variant="outline" className="flex items-center gap-2">
                      <Edit className="h-4 w-4" />
                      Edit Job
                    </Button>
                    <Button
                      variant="outline"
                      className={`flex items-center gap-2 ${
                        jobData.status === "Active" ? "text-red-500 hover:text-red-500" : ""
                      }`}
                    >
                      <Shield className="h-4 w-4" />
                      {jobData.status === "Active" ? "Deactivate Job" : "Activate Job"}
                    </Button>
                    <Button variant="outline" className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4" />
                      Mark as Filled
                    </Button>
                    <Button variant="destructive" className="flex items-center gap-2">
                      <Trash2 className="h-4 w-4" />
                      Delete Job
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

