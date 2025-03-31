import JobCard from "@/components/jobs/job-card"
import type { Job } from "@/types/job"

interface JobListProps {
  jobs: Job[]
  emptyMessage?: string
}

export default function JobList({ jobs, emptyMessage = "No jobs found" }: JobListProps) {
  if (jobs.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium mb-2">No jobs found</h3>
        <p className="text-muted-foreground">{emptyMessage}</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {jobs.map((job) => (
        <JobCard key={job.id} job={job} />
      ))}
    </div>
  )
}

