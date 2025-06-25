"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import DashboardLayout from "@/components/dashboard/dashboard-layout"
import JobCard from "@/components/dashboard/job-card"
import { collection, getDocs, query, where, deleteDoc, doc } from "firebase/firestore"
import { db, auth } from "@/app/config/firebase"
import { onAuthStateChanged } from "firebase/auth"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { useUserProfile } from "@/hooks/useUserProfile"

interface SavedJob {
  id: string
  jobId: string
  title: string
  company: string
  location: string
  salary: string
  type: string
  postedDate: string
}

export default function SavedJobs() {
  const router = useRouter()
  const { profile } = useUserProfile()
  const [savedJobs, setSavedJobs] = useState<SavedJob[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user)
      if (user) {
        fetchSavedJobs(user.uid)
      } else {
        setLoading(false)
      }
    })
    
    return () => unsubscribe()
  }, [])
  
  const fetchSavedJobs = async (userId: string) => {
    try {
      setLoading(true)
      const savedJobsRef = collection(db, "savedJobs")
      const q = query(savedJobsRef, where("userId", "==", userId))
      const querySnapshot = await getDocs(q)
      
      const jobs: SavedJob[] = []
      querySnapshot.forEach((doc) => {
        const data = doc.data()
        jobs.push({
          id: doc.id,
          jobId: data.jobId,
          title: data.job?.title || "Untitled Job",
          company: data.job?.company || "Unknown Company",
          location: data.job?.location || "Remote",
          salary: data.job?.salary || "Not specified",
          type: data.job?.type || "Not specified",
          postedDate: data.job?.postedDate || "Recently",
        })
      })
      
      setSavedJobs(jobs)
    } catch (error) {
      console.error("Error fetching saved jobs:", error)
      toast.error("Failed to load saved jobs")
    } finally {
      setLoading(false)
    }
  }
  
  const handleRemoveJob = async (jobId: string) => {
    try {
      await deleteDoc(doc(db, "savedJobs", jobId))
      setSavedJobs(savedJobs.filter(job => job.id !== jobId))
      toast.success("Job removed from saved jobs")
    } catch (error) {
      console.error("Error removing saved job:", error)
      toast.error("Failed to remove job")
    }
  }
  
  const handleApplyToJob = (jobId: string) => {
    router.push(`/jobs/${jobId}/apply`)
  }

  return (
    <DashboardLayout activeRoute="saved-jobs" userData={profile} user={user}>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Saved Jobs</h1>
        <Button onClick={() => router.push('/jobs')}>Find More Jobs</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Saved Jobs</CardTitle>
          <CardDescription>Jobs you've saved for later</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-primary"></div>
            </div>
          ) : savedJobs.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-muted-foreground mb-4">You haven't saved any jobs yet.</p>
              <Button onClick={() => router.push('/jobs')}>Find Jobs to Save</Button>
            </div>
          ) : (
            <div className="space-y-6">
              {savedJobs.map((job) => (
                <JobCard
                  key={job.id}
                  job={job}
                  showApplyButton
                  showRemoveButton
                  onApply={() => handleApplyToJob(job.jobId)}
                  onRemove={() => handleRemoveJob(job.id)}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </DashboardLayout>
  )
}

