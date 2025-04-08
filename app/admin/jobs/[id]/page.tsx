"use client"

import React, { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"
import { doc, getDoc, collection, query, where, getDocs, DocumentData, QueryDocumentSnapshot, Timestamp } from "firebase/firestore"
import { db } from "@/app/config/firebase"
import { format } from "date-fns"
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
  Users,
  Wallet,
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
import { toast } from "sonner"

// Add these interfaces at the top of the file after imports
interface JobData {
  id: string
  title: string
  company: string
  companyLogo: string
  location: string
  type: string
  category: string
  postedDate: string
  expiryDate: string
  status: string
  featured: boolean
  urgent: boolean
  rate: string
  duration: string
  applications: number
  views: number
  description: string
  requirements: string[]
  benefits: string[]
  employer: {
    id: string
    name: string
    email: string
    phone: string
    avatar: string
  } | null
  applicants: {
    id: string
    name: string
    email: string
    appliedDate: string
    status: string
    avatar: string
  }[]
  timeline: {
    id: string
    date: string
    time: string
    action: string
    icon: React.ReactNode
  }[]
  flowStatus: string
  flowProgress: number
  positionsNeeded: number
  positionsFilled: number
}

interface UserData {
  firstName?: string
  lastName?: string
  displayName?: string
  email?: string
  phone?: string
  photoURL?: string
}

// Helper function to safely convert Firebase Timestamp to Date
const convertTimestampToDate = (timestamp: any) => {
  if (timestamp instanceof Timestamp) {
    return timestamp.toDate()
  }
  if (timestamp?.toDate) {
    return timestamp.toDate()
  }
  return new Date()
}

export default function AdminJobDetail() {
  const router = useRouter()
  const params = useParams()
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [jobData, setJobData] = useState<JobData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchJobData = async () => {
      try {
        setLoading(true)
        setError(null)

        // Fetch job data using the id from params
        const jobDoc = await getDoc(doc(db, "jobs", params.id as string))
        if (!jobDoc.exists()) {
          throw new Error("Job not found")
        }

        const job = jobDoc.data()

        // Fetch employer data if available
        let employer = null
        if (job.employerId) {
          const employerDoc = await getDoc(doc(db, "users", job.employerId))
          if (employerDoc.exists()) {
            employer = employerDoc.data()
          }
        }

        // Fetch applicants data
        const applicantsQuery = query(
          collection(db, "applications"),
          where("jobId", "==", params.id as string)
        )
        const applicantsSnapshot = await getDocs(applicantsQuery)
        const applicants = await Promise.all(
          applicantsSnapshot.docs.map(async (applicantDoc: QueryDocumentSnapshot<DocumentData>) => {
            const data = applicantDoc.data()
            const userDocRef = doc(db, "users", data.userId)
            const userDoc = await getDoc(userDocRef)
            const userData = userDoc.exists() ? userDoc.data() as UserData : null
            return {
              id: applicantDoc.id,
              name: userData?.firstName && userData?.lastName 
                ? `${userData.firstName} ${userData.lastName}`
                : userData?.displayName || "Unknown",
              email: userData?.email || "",
              appliedDate: data.createdAt 
                ? format(convertTimestampToDate(data.createdAt), "MMM d, yyyy")
                : "N/A",
              status: data.status || "Applied",
              avatar: userData?.photoURL || "/placeholder.svg?height=32&width=32",
            }
          })
        )

        // Transform the data to match the existing structure
        const transformedData = {
          id: jobDoc.id,
          title: job.title || "",
          company: job.company || "",
          companyLogo: job.companyLogo || "/placeholder.svg?height=40&width=40",
          location: job.location?.address || "Remote",
          type: job.type || "Part-time",
          category: job.category || "",
          postedDate: job.createdAt 
            ? format(convertTimestampToDate(job.createdAt), "MMM d, yyyy")
            : "N/A",
          expiryDate: job.expiryDate 
            ? format(convertTimestampToDate(job.expiryDate), "MMM d, yyyy")
            : "N/A",
          status: job.status || "Active",
          featured: job.featured || false,
          urgent: job.urgent || false,
          rate: job.salaryAmount 
            ? `₹${job.salaryAmount}/${job.salaryType}`
            : "Not specified",
          duration: job.duration || "Not specified",
          applications: applicants.length,
          views: job.views || 0,
          description: job.description || "",
          requirements: job.requirements || [],
          benefits: job.benefits || [],
          employer: employer ? {
            id: employer.uid,
            name: employer.firstName && employer.lastName 
              ? `${employer.firstName} ${employer.lastName}`
              : employer.displayName || "Unknown",
            email: employer.email || "",
            phone: employer.phone || "",
            avatar: employer.photoURL || "/placeholder.svg?height=40&width=40",
          } : null,
          applicants,
          timeline: job.timeline || [],
          flowStatus: job.flowStatus || "draft",
          flowProgress: job.flowProgress || 0,
          positionsNeeded: job.positionsNeeded || 1,
          positionsFilled: job.positionsFilled || 0,
        }

        setJobData(transformedData)
      } catch (err) {
        console.error("Error fetching job data:", err)
        setError(err instanceof Error ? err.message : "Failed to load job data")
        toast.error("Failed to load job data")
      } finally {
        setLoading(false)
      }
    }

    if (params.id) {
      fetchJobData()
    }
  }, [params.id]) // Use params.id in the dependency array

  // Function to get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case "draft":
        return "bg-muted"
      case "pending-approval":
        return "bg-yellow-500"
      case "active":
        return "bg-green-500"
      case "filling":
        return "bg-blue-500"
      case "completed":
        return "bg-purple-500"
      case "payment-pending":
        return "bg-orange-500"
      case "payment-distributed":
        return "bg-green-500"
      default:
        return "bg-muted"
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex">
        <AdminSidebar
          isSidebarOpen={isSidebarOpen}
          setIsSidebarOpen={setIsSidebarOpen}
          activeLink="jobs"
          onLogout={() => router.push("/admin/login")}
        />
        <div className="flex-1 min-w-0 overflow-auto">
          <AdminHeader toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
          <main className="container mx-auto px-4 py-8">
            <div className="flex items-center justify-center h-[calc(100vh-200px)]">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Loading job details...</p>
              </div>
            </div>
          </main>
        </div>
      </div>
    )
  }

  if (error || !jobData) {
    return (
      <div className="min-h-screen bg-background flex">
        <AdminSidebar
          isSidebarOpen={isSidebarOpen}
          setIsSidebarOpen={setIsSidebarOpen}
          activeLink="jobs"
          onLogout={() => router.push("/admin/login")}
        />
        <div className="flex-1 min-w-0 overflow-auto">
          <AdminHeader toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
          <main className="container mx-auto px-4 py-8">
            <div className="flex items-center justify-center h-[calc(100vh-200px)]">
              <div className="text-center">
                <p className="text-destructive mb-4">{error || "Failed to load job data"}</p>
                <Button onClick={() => router.push("/admin/jobs")}>
                  Back to Jobs
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
                    {jobData.requirements.map((req: string, index: number) => (
                      <li key={index}>{req}</li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h3 className="font-medium mb-2">Benefits</h3>
                  <ul className="text-sm text-muted-foreground space-y-1 list-disc pl-5">
                    {jobData.benefits.map((benefit: string, index: number) => (
                      <li key={index}>{benefit}</li>
                    ))}
                  </ul>
                </div>

                <Separator />

                {jobData.employer && (
                  <div className="space-y-4">
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
                )}
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
                  {/* Flow Chart */}
                  <div className="relative py-6">
                    <div className="absolute left-0 right-0 top-1/2 h-0.5 bg-muted -translate-y-1/2" />
                    <div className="relative flex justify-between">
                      {/* Draft */}
                      <div className="flex flex-col items-center">
                        <div className="relative">
                        <div
                            className={`z-10 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                            jobData.flowStatus === "draft"
                                ? "bg-primary text-primary-foreground scale-110 shadow-lg ring-4 ring-primary/20"
                                : jobData.flowStatus !== "draft"
                                ? "bg-green-500 text-white"
                              : "bg-muted text-muted-foreground"
                          }`}
                        >
                            {jobData.flowStatus !== "draft" ? (
                              <CheckCircle className="h-5 w-5" />
                            ) : (
                              <FileText className="h-5 w-5" />
                            )}
                          </div>
                        </div>
                        <span className={`text-xs mt-2 font-medium ${jobData.flowStatus === "draft" ? "text-primary" : "text-muted-foreground"}`}>
                          Draft
                        </span>
                      </div>

                      {/* Pending Approval */}
                      <div className="flex flex-col items-center">
                        <div className="relative">
                          <div
                            className={`z-10 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                              jobData.flowStatus === "pending-approval"
                                ? "bg-primary text-primary-foreground scale-110 shadow-lg ring-4 ring-primary/20"
                                : ["active", "filling", "completed", "payment-pending", "payment-distributed"].includes(jobData.flowStatus)
                                ? "bg-green-500 text-white"
                              : "bg-muted text-muted-foreground"
                          }`}
                        >
                            {["active", "filling", "completed", "payment-pending", "payment-distributed"].includes(jobData.flowStatus) ? (
                              <CheckCircle className="h-5 w-5" />
                            ) : (
                              <Shield className="h-5 w-5" />
                            )}
                          </div>
                        </div>
                        <span className={`text-xs mt-2 font-medium ${jobData.flowStatus === "pending-approval" ? "text-primary" : "text-muted-foreground"}`}>
                          Pending Approval
                        </span>
                      </div>

                      {/* Active */}
                      <div className="flex flex-col items-center">
                        <div className="relative">
                        <div
                            className={`z-10 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                            jobData.flowStatus === "active"
                                ? "bg-primary text-primary-foreground scale-110 shadow-lg ring-4 ring-primary/20"
                                : ["filling", "completed", "payment-pending", "payment-distributed"].includes(jobData.flowStatus)
                                ? "bg-green-500 text-white"
                                : "bg-muted text-muted-foreground"
                            }`}
                          >
                            {["filling", "completed", "payment-pending", "payment-distributed"].includes(jobData.flowStatus) ? (
                              <CheckCircle className="h-5 w-5" />
                            ) : (
                              <CheckCircle className="h-5 w-5" />
                            )}
                          </div>
                        </div>
                        <span className={`text-xs mt-2 font-medium ${jobData.flowStatus === "active" ? "text-primary" : "text-muted-foreground"}`}>
                          Active
                        </span>
                      </div>

                      {/* Filling */}
                      <div className="flex flex-col items-center">
                        <div className="relative">
                          <div
                            className={`z-10 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                              jobData.flowStatus === "filling"
                                ? "bg-primary text-primary-foreground scale-110 shadow-lg ring-4 ring-primary/20"
                                : ["completed", "payment-pending", "payment-distributed"].includes(jobData.flowStatus)
                                ? "bg-green-500 text-white"
                                : "bg-muted text-muted-foreground"
                            }`}
                          >
                            {["completed", "payment-pending", "payment-distributed"].includes(jobData.flowStatus) ? (
                              <CheckCircle className="h-5 w-5" />
                            ) : (
                              <Users className="h-5 w-5" />
                            )}
                          </div>
                          {jobData.flowStatus === "filling" && (
                            <div className="absolute -bottom-1 -right-1 bg-primary text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                              {jobData.positionsFilled}/{jobData.positionsNeeded}
                            </div>
                          )}
                        </div>
                        <span className={`text-xs mt-2 font-medium ${jobData.flowStatus === "filling" ? "text-primary" : "text-muted-foreground"}`}>
                          Filling
                        </span>
                      </div>

                      {/* Completed */}
                      <div className="flex flex-col items-center">
                        <div className="relative">
                          <div
                            className={`z-10 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                              jobData.flowStatus === "completed"
                                ? "bg-primary text-primary-foreground scale-110 shadow-lg ring-4 ring-primary/20"
                                : ["payment-pending", "payment-distributed"].includes(jobData.flowStatus)
                                ? "bg-green-500 text-white"
                              : "bg-muted text-muted-foreground"
                          }`}
                        >
                            {["payment-pending", "payment-distributed"].includes(jobData.flowStatus) ? (
                              <CheckCircle className="h-5 w-5" />
                            ) : (
                              <Briefcase className="h-5 w-5" />
                            )}
                          </div>
                        </div>
                        <span className={`text-xs mt-2 font-medium ${jobData.flowStatus === "completed" ? "text-primary" : "text-muted-foreground"}`}>
                          Completed
                        </span>
                      </div>

                      {/* Payment Pending */}
                      <div className="flex flex-col items-center">
                        <div className="relative">
                          <div
                            className={`z-10 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                              jobData.flowStatus === "payment-pending"
                                ? "bg-primary text-primary-foreground scale-110 shadow-lg ring-4 ring-primary/20"
                                : jobData.flowStatus === "payment-distributed"
                                ? "bg-green-500 text-white"
                              : "bg-muted text-muted-foreground"
                          }`}
                        >
                            {jobData.flowStatus === "payment-distributed" ? (
                              <CheckCircle className="h-5 w-5" />
                            ) : (
                              <DollarSign className="h-5 w-5" />
                            )}
                          </div>
                        </div>
                        <span className={`text-xs mt-2 font-medium ${jobData.flowStatus === "payment-pending" ? "text-primary" : "text-muted-foreground"}`}>
                          Payment Pending
                        </span>
                      </div>

                      {/* Payment Distributed */}
                      <div className="flex flex-col items-center">
                        <div className="relative">
                          <div
                            className={`z-10 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                              jobData.flowStatus === "payment-distributed"
                                ? "bg-primary text-primary-foreground scale-110 shadow-lg ring-4 ring-primary/20"
                              : "bg-muted text-muted-foreground"
                          }`}
                        >
                            <Wallet className="h-5 w-5" />
                          </div>
                        </div>
                        <span className={`text-xs mt-2 font-medium ${jobData.flowStatus === "payment-distributed" ? "text-primary" : "text-muted-foreground"}`}>
                          Payment Distributed
                        </span>
                      </div>
                    </div>

                    {/* Progress Connections */}
                    <div className="absolute left-0 right-0 top-1/2 h-0.5 -translate-y-1/2">
                      <div 
                        className={`h-full bg-primary transition-all duration-300`}
                        style={{
                          width: `${(() => {
                            const states = ["draft", "pending-approval", "active", "filling", "completed", "payment-pending", "payment-distributed"];
                            const currentIndex = states.indexOf(jobData.flowStatus);
                            // Calculate the width based on the number of completed steps
                            return (currentIndex / (states.length - 1)) * 100;
                          })()}%`
                        }}
                      />
                    </div>
                  </div>

                  {/* Status Details */}
                  <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-4">
                      <div className={`flex items-center gap-3 p-3 rounded-lg transition-all duration-300 ${
                        jobData.flowStatus === "draft" ? "bg-primary/10" : ""
                      }`}>
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <FileText className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <h4 className="font-medium">Draft</h4>
                          <p className="text-sm text-muted-foreground">Job is being created and edited</p>
                        </div>
                      </div>
                      <div className={`flex items-center gap-3 p-3 rounded-lg transition-all duration-300 ${
                        jobData.flowStatus === "pending-approval" ? "bg-primary/10" : ""
                      }`}>
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <Shield className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <h4 className="font-medium">Pending Approval</h4>
                          <p className="text-sm text-muted-foreground">Waiting for admin review</p>
                        </div>
                      </div>
                      <div className={`flex items-center gap-3 p-3 rounded-lg transition-all duration-300 ${
                        jobData.flowStatus === "active" ? "bg-primary/10" : ""
                      }`}>
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <CheckCircle className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <h4 className="font-medium">Active</h4>
                          <p className="text-sm text-muted-foreground">Job is live and accepting applications</p>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className={`flex items-center gap-3 p-3 rounded-lg transition-all duration-300 ${
                        jobData.flowStatus === "filling" ? "bg-primary/10" : ""
                      }`}>
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <Users className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <h4 className="font-medium">Filling</h4>
                          <p className="text-sm text-muted-foreground">Candidates are being selected</p>
                        </div>
                      </div>
                      <div className={`flex items-center gap-3 p-3 rounded-lg transition-all duration-300 ${
                        jobData.flowStatus === "completed" ? "bg-primary/10" : ""
                      }`}>
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <Briefcase className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <h4 className="font-medium">Completed</h4>
                          <p className="text-sm text-muted-foreground">Job has been filled</p>
                        </div>
                      </div>
                      <div className={`flex items-center gap-3 p-3 rounded-lg transition-all duration-300 ${
                        jobData.flowStatus === "payment-pending" || jobData.flowStatus === "payment-distributed" ? "bg-primary/10" : ""
                      }`}>
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <DollarSign className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <h4 className="font-medium">Payment</h4>
                          <p className="text-sm text-muted-foreground">Payment from owner and distribution</p>
                    </div>
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
                            {jobData.applicants.map((applicant: JobData['applicants'][0]) => (
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
                          {jobData.timeline.map((item: JobData['timeline'][0]) => (
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

