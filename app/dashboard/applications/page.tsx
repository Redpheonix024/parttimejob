"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import DashboardLayout from "@/components/dashboard/dashboard-layout"
import ApplicationCard from "@/components/dashboard/application-card"

export default function Applications() {
  return (
    <DashboardLayout activeRoute="applications">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">My Applications</h1>
        <Button>Find More Jobs</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Applications</CardTitle>
          <CardDescription>Track the status of your job applications</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {allApplications.map((application, index) => (
              <div key={index} className="flex items-start justify-between border-b pb-6 last:border-0 last:pb-0">
                <ApplicationCard application={application} />
                <Button variant="link" size="sm" className="mt-2">
                  View Details
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </DashboardLayout>
  )
}

const allApplications = [
  {
    jobTitle: "Frontend Developer",
    company: "Tech Solutions Inc.",
    location: "Remote",
    salary: "₹2250-3000/hr",
    type: "Part-time",
    appliedDate: "2 days ago",
    status: "Pending",
  },
  {
    jobTitle: "UX Designer",
    company: "Creative Agency",
    location: "San Francisco, CA",
    salary: "₹2625-3375/hr",
    type: "Contract",
    appliedDate: "1 week ago",
    status: "Interview",
  },
  {
    jobTitle: "Content Writer",
    company: "Media Group",
    location: "Chicago, IL",
    salary: "₹1875-2250/hr",
    type: "Part-time",
    appliedDate: "3 days ago",
    status: "Reviewed",
  },
  {
    jobTitle: "Social Media Manager",
    company: "Marketing Solutions",
    location: "Remote",
    salary: "₹1500-1875/hr",
    type: "Part-time",
    appliedDate: "2 weeks ago",
    status: "Rejected",
  },
  {
    jobTitle: "Customer Support",
    company: "Service Pro",
    location: "Austin, TX",
    salary: "₹1350-1650/hr",
    type: "Weekend",
    appliedDate: "5 days ago",
    status: "Pending",
  },
]

