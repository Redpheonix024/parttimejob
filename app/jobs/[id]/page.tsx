import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Share2 } from "lucide-react"
import MainLayout from "@/components/layout/main-layout"
import JobDetailCard from "@/components/jobs/job-detail-card"

export default function JobDetails({ params }: { params: { id: string } }) {
  // In a real app, you would fetch the job data based on the ID
  const job = jobData

  return (
    <MainLayout activeLink="jobs">
      <div className="container mx-auto px-4 py-8">
        <Link href="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="mr-2 h-4 w-4"
          >
            <path d="m12 19-7-7 7-7" />
            <path d="M19 12H5" />
          </svg>
          Back to Jobs
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-3xl font-bold">{job.title}</h1>
              <Button variant="outline" size="icon">
                <Share2 className="h-4 w-4" />
                <span className="sr-only">Share</span>
              </Button>
            </div>

            <JobDetailCard job={job} />

            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Job Description</CardTitle>
              </CardHeader>
              <CardContent className="prose max-w-none">
                <p>
                  {job.company} is looking for a {job.title} to join our team. This is a {job.type} position with
                  flexible hours.
                </p>
                <h3>Responsibilities:</h3>
                <ul>
                  {job.responsibilities?.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
                <h3>Requirements:</h3>
                <ul>
                  {job.requirements?.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
                <h3>Benefits:</h3>
                <ul>
                  {job.benefits?.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>About {job.company}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{job.companyDescription}</p>
              </CardContent>
            </Card>
          </div>

          <div>
            <Card className="sticky top-8">
              <CardHeader>
                <CardTitle>Apply for this Position</CardTitle>
                <CardDescription>
                  Submit your application for {job.title} at {job.company}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm">
                  <span className="font-medium">Application Method:</span> {job.applicationMethod}
                </p>
                <p className="text-sm">
                  <span className="font-medium">Contact:</span> {job.contactPerson}
                </p>
                <Separator />
                <p className="text-sm text-muted-foreground">{job.applicationInstructions}</p>
              </CardContent>
              <CardFooter>
                <Button className="w-full" asChild>
                  <Link href={`/jobs/${params.id}/apply`}>Apply Now</Link>
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}

// Sample job data
const jobData = {
  id: "1",
  title: "Weekend Barista",
  company: "Coffee House",
  location: "San Francisco, CA",
  hours: "10-15 hours/week",
  rate: "₹1350-1650/hour",
  duration: "3 months",
  type: "part-time",
  postedDate: "2 days ago",
  urgent: true,
  responsibilities: [
    "Prepare and serve coffee, tea, and other beverages",
    "Take customer orders and process payments",
    "Maintain cleanliness of the coffee bar and seating area",
    "Provide excellent customer service",
    "Assist with inventory management and restocking supplies",
  ],
  requirements: [
    "Previous barista experience preferred but not required",
    "Excellent customer service skills",
    "Ability to work weekends and some holidays",
    "Basic math skills for handling transactions",
    "Ability to stand for extended periods and lift up to 25 lbs",
  ],
  benefits: [
    "Flexible scheduling",
    "Free coffee and beverages during shifts",
    "Employee discount on food and merchandise",
    "Opportunity for growth and advancement",
    "Fun and collaborative work environment",
  ],
  companyDescription:
    "Coffee House is a locally owned café dedicated to providing high-quality coffee and a welcoming atmosphere for our community. We source our beans ethically and roast them in-house to ensure the freshest coffee experience possible.",
  applicationMethod: "Online Application",
  contactPerson: "Sarah Johnson, Manager",
  applicationInstructions:
    "Please complete the application form with your resume and a brief cover letter explaining your interest in the position and your availability.",
}

