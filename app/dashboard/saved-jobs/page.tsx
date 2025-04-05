"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import DashboardLayout from "@/components/dashboard/dashboard-layout"
import JobCard from "@/components/dashboard/job-card"

export default function SavedJobs() {
  return (
    <DashboardLayout activeRoute="saved-jobs">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Saved Jobs</h1>
        <Button>Find More Jobs</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Saved Jobs</CardTitle>
          <CardDescription>Jobs you've saved for later</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {savedJobs.map((job, index) => (
              <JobCard
                key={index}
                job={job}
                showApplyButton
                showRemoveButton
                onApply={() => console.log(`Apply to ${job.title}`)}
                onRemove={() => console.log(`Remove ${job.title}`)}
              />
            ))}
          </div>
        </CardContent>
      </Card>
    </DashboardLayout>
  )
}

const savedJobs = [
  {
    title: "JavaScript Developer",
    company: "Tech Innovations",
    location: "Remote",
    salary: "₹2250-3000/hr",
    type: "Part-time",
    postedDate: "3 days ago",
  },
  {
    title: "Web Designer",
    company: "Design Studio",
    location: "San Francisco, CA",
    salary: "₹1875-2625/hr",
    type: "Contract",
    postedDate: "1 week ago",
  },
  {
    title: "Frontend Engineer",
    company: "Software Solutions",
    location: "New York, NY",
    salary: "₹3000-3750/hr",
    type: "Part-time",
    postedDate: "2 days ago",
  },
  {
    title: "Data Entry Specialist",
    company: "Business Services",
    location: "Remote",
    salary: "₹1350-1650/hr",
    type: "Flexible hours",
    postedDate: "Just now",
  },
]

