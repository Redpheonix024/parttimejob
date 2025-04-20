"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import DashboardLayout from "@/components/dashboard/dashboard-layout"
import JobStatusCard from "@/components/dashboard/job-status-card"
import JobTimeline from "@/components/dashboard/job-timeline"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import { Briefcase, Calendar, Clock, MapPin, Star, AlertCircle } from "lucide-react"
import { RupeeIcon } from "@/components/ui/rupee-icon"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { jobsApi } from "@/utils/api"
import type { JobStatus } from "@/types/job"
import { useAuth } from "@/hooks/useAuth"
import { useRouter } from "next/navigation"

export default function JobStatusPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  
  const [selectedTab, setSelectedTab] = useState("all")
  const [selectedJob, setSelectedJob] = useState<JobStatus | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  
  const [jobs, setJobs] = useState<JobStatus[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Redirect if not authenticated
    if (!authLoading && !user) {
      router.push('/login?redirect=/dashboard/job-status')
      return
    }

    // Don't fetch data until authentication is complete
    if (authLoading || !user) return

    const fetchJobs = async () => {
      try {
        setLoading(true)
        const data = await jobsApi.getUserJobStatus(user.uid)
        setJobs(data.jobs)
        setError(null)
      } catch (err: any) {
        console.error('Failed to fetch jobs:', err)
        setError(err?.message || 'Failed to load your job status. Please try again later.')
      } finally {
        setLoading(false)
      }
    }

    fetchJobs()
  }, [user, authLoading, router])

  const handleViewDetails = (jobId: string) => {
    const job = jobs.find((job) => job.id === jobId)
    if (job) {
      setSelectedJob(job)
      setIsDialogOpen(true)
    }
  }

  const filteredJobs = selectedTab === "all" ? jobs : jobs.filter((job) => job.status === selectedTab)

  // During auth loading, show nothing, as the layout will handle this
  if (authLoading) {
    return null
  }

  // If user is not authenticated, don't show anything as we're redirecting
  if (!user) {
    return null
  }

  // Content loading state is handled by loading.tsx
  if (loading) {
    return null
  }

  return (
    <DashboardLayout activeRoute="job-status">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Job Status</h1>
        <Button onClick={() => router.push('/jobs')}>Find More Jobs</Button>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="all" value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid grid-cols-6 mb-6">
          <TabsTrigger value="all">All Jobs</TabsTrigger>
          <TabsTrigger value="applied">Applied</TabsTrigger>
          <TabsTrigger value="approved">Approved</TabsTrigger>
          <TabsTrigger value="in-progress">In Progress</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
          <TabsTrigger value="paid">Paid</TabsTrigger>
        </TabsList>

        <TabsContent value={selectedTab}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredJobs.map((job) => (
              <JobStatusCard key={job.id} job={job} onViewDetails={handleViewDetails} />
            ))}

            {filteredJobs.length === 0 && (
              <div className="col-span-full text-center py-12">
                <h3 className="text-lg font-medium mb-2">No jobs found</h3>
                <p className="text-muted-foreground">
                  {selectedTab === "all"
                    ? "You haven't applied to any jobs yet."
                    : `You don't have any jobs with '${selectedTab}' status.`}
                </p>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Job Details Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-3xl">
          {selectedJob && (
            <>
              <DialogHeader>
                <DialogTitle>{selectedJob.title}</DialogTitle>
                <DialogDescription>{selectedJob.company}</DialogDescription>
              </DialogHeader>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                <div>
                  <h3 className="text-sm font-medium mb-3">Job Details</h3>
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span>{selectedJob.location.display || `${selectedJob.location.city}, ${selectedJob.location.state}`}</span>
                    </div>
                    <div className="flex items-center">
                      <RupeeIcon className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span>{selectedJob.rate}</span>
                    </div>
                    <div className="flex items-center">
                      <Briefcase className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span>{selectedJob.type}</span>
                    </div>
                    {selectedJob.startDate && (
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span>Start Date: {selectedJob.startDate}</span>
                      </div>
                    )}
                    {selectedJob.endDate && (
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span>End Date: {selectedJob.endDate}</span>
                      </div>
                    )}
                  </div>

                  {selectedJob.paymentAmount && (
                    <>
                      <Separator className="my-4" />
                      <h3 className="text-sm font-medium mb-3">Payment Details</h3>
                      <div className="space-y-3">
                        <div className="flex items-center">
                          <RupeeIcon className="h-4 w-4 mr-2 text-muted-foreground" />
                          <span>Amount: {selectedJob.paymentAmount}</span>
                        </div>
                        {selectedJob.paymentDate && (
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                            <span>Payment Date: {selectedJob.paymentDate}</span>
                          </div>
                        )}
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                          <span>Status: {selectedJob.paymentStatus === "paid" ? "Received" : "Pending"}</span>
                        </div>
                      </div>
                    </>
                  )}

                  {selectedJob.rating && (
                    <>
                      <Separator className="my-4" />
                      <h3 className="text-sm font-medium mb-3">Your Rating</h3>
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-5 w-5 ${i < selectedJob.rating! ? "text-[#FACC15] fill-[#FACC15]" : "text-muted-foreground"}`}
                          />
                        ))}
                      </div>
                    </>
                  )}
                </div>

                <div>
                  <JobTimeline
                    status={selectedJob.status}
                    dates={{
                      applied: selectedJob.appliedDate,
                      approved: selectedJob.approvedDate,
                      started: selectedJob.startDate,
                      completed: selectedJob.endDate,
                      paid: selectedJob.paymentDate,
                    }}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 mt-4">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Close
                </Button>
                <Button>Contact Employer</Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  )
}

