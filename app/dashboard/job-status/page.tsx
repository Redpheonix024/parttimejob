"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import DashboardLayout from "@/components/dashboard/dashboard-layout"
import JobStatusCard from "@/components/dashboard/job-status-card"
import JobTimeline from "@/components/dashboard/job-timeline"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import { Briefcase, Calendar, Clock, MapPin, Star } from "lucide-react"
import { RupeeIcon } from "@/components/ui/rupee-icon"
import type { JobStatus } from "@/types/job"

export default function JobStatusPage() {
  const [selectedTab, setSelectedTab] = useState("all")
  const [selectedJob, setSelectedJob] = useState<JobStatus | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const handleViewDetails = (jobId: string) => {
    const job = allJobs.find((job) => job.id === jobId)
    if (job) {
      setSelectedJob(job)
      setIsDialogOpen(true)
    }
  }

  const filteredJobs = selectedTab === "all" ? allJobs : allJobs.filter((job) => job.status === selectedTab)

  return (
    <DashboardLayout activeRoute="job-status">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Job Status</h1>
        <Button>Find More Jobs</Button>
      </div>

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
                      <span>{selectedJob.location}</span>
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

// Sample job data
const allJobs: JobStatus[] = [
  {
    id: "1",
    title: "Weekend Barista",
    company: "Coffee House",
    location: "San Francisco, CA",
    hours: "10-15 hours/week",
    rate: "₹1350-1650/hour",
    duration: "3 months",
    type: "Part-time",
    appliedDate: "May 10, 2023",
    status: "applied",
    postedDate: "May 8, 2023",
  },
  {
    id: "2",
    title: "Event Photographer",
    company: "EventPro Agency",
    location: "Remote",
    hours: "Flexible hours",
    rate: "₹1875-2625/hour",
    duration: "One-time event",
    type: "Contract",
    appliedDate: "May 5, 2023",
    approvedDate: "May 7, 2023",
    status: "approved",
    postedDate: "May 3, 2023",
  },
  {
    id: "3",
    title: "Social Media Assistant",
    company: "Digital Marketing Co.",
    location: "Remote",
    rate: "₹1500-1875/hour",
    hours: "15-20 hours/week",
    duration: "6 months",
    type: "Part-time",
    appliedDate: "April 28, 2023",
    approvedDate: "May 1, 2023",
    startDate: "May 5, 2023",
    status: "in-progress",
    postedDate: "April 25, 2023",
  },
  {
    id: "4",
    title: "Web Developer",
    company: "Tech Solutions Inc.",
    location: "Remote",
    rate: "₹2250-3000/hour",
    hours: "20-30 hours/week",
    duration: "Contract",
    type: "Contract",
    appliedDate: "April 15, 2023",
    approvedDate: "April 18, 2023",
    startDate: "April 20, 2023",
    endDate: "May 5, 2023",
    status: "completed",
    paymentStatus: "pending",
    paymentAmount: "₹90,000",
    postedDate: "April 10, 2023",
  },
  {
    id: "5",
    title: "Data Entry Specialist",
    company: "Business Services",
    location: "Remote",
    rate: "₹1350-1650/hour",
    hours: "10-15 hours/week",
    duration: "Temporary",
    type: "Temporary",
    appliedDate: "April 1, 2023",
    approvedDate: "April 3, 2023",
    startDate: "April 5, 2023",
    endDate: "April 20, 2023",
    status: "paid",
    paymentStatus: "paid",
    paymentAmount: "₹48,750",
    paymentDate: "April 25, 2023",
    rating: 5,
    postedDate: "March 28, 2023",
  },
  {
    id: "6",
    title: "Customer Support",
    company: "Service Pro",
    location: "Austin, TX",
    rate: "₹1350-1650/hour",
    hours: "Weekend shifts",
    duration: "Ongoing",
    type: "Weekend",
    appliedDate: "March 15, 2023",
    approvedDate: "March 18, 2023",
    startDate: "March 20, 2023",
    endDate: "April 10, 2023",
    status: "paid",
    paymentStatus: "paid",
    paymentAmount: "₹60,000",
    paymentDate: "April 15, 2023",
    rating: 4,
    postedDate: "March 10, 2023",
  },
]

