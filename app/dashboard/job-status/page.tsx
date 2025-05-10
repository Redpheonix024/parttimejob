"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import DashboardLayout from "@/components/dashboard/dashboard-layout";
import { MapPin, Briefcase, Calendar } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import JobTimeline from "@/components/dashboard/job-timeline";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { db } from "@/app/config/firebase";

interface JobStatus {
  id: string;
  title: string;
  company: string;
  location: {
    display?: string;
    city: string;
    state: string;
  };
  rate: string;
  type: string;
  status: "applied" | "approved" | "in-progress" | "completed" | "paid";
  appliedDate: string;
  approvedDate?: string;
  startDate?: string;
  endDate?: string;
  paymentDate?: string;
}

export default function JobStatusPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [selectedTab, setSelectedTab] = useState("all");
  const [selectedJob, setSelectedJob] = useState<JobStatus | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const [jobs, setJobs] = useState<JobStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Redirect if not authenticated
    if (!authLoading && !user) {
      router.push("/login?redirect=/dashboard/job-status");
      return;
    }

    // Don't fetch data until authentication is complete
    if (authLoading || !user) return;

    // Set up real-time listener for applications
    const applicationsQuery = query(
      collection(db, "applications"),
      where("userId", "==", user.uid)
    );

    const unsubscribe = onSnapshot(
      applicationsQuery,
      async (snapshot) => {
        try {
          setLoading(true);
          const jobsData: JobStatus[] = [];

          snapshot.docs.forEach((doc) => {
            const data = doc.data();
            jobsData.push({
              id: doc.id,
              title: data.jobTitle || "Untitled Job",
              company: data.company || "Unknown Company",
              location: data.location || { city: "", state: "" },
              rate: data.rate || "Not specified",
              type: data.type || "Not specified",
              status: (data.status?.toLowerCase() ||
                "applied") as JobStatus["status"],
              appliedDate: new Date(
                data.createdAt?.seconds * 1000
              ).toLocaleDateString(),
              approvedDate: data.approvedDate
                ? new Date(
                    data.approvedDate?.seconds * 1000
                  ).toLocaleDateString()
                : undefined,
              startDate: data.startDate
                ? new Date(data.startDate?.seconds * 1000).toLocaleDateString()
                : undefined,
              endDate: data.endDate
                ? new Date(data.endDate?.seconds * 1000).toLocaleDateString()
                : undefined,
              paymentDate: data.paymentDate
                ? new Date(
                    data.paymentDate?.seconds * 1000
                  ).toLocaleDateString()
                : undefined,
            });
          });

          setJobs(jobsData);
          setError(null);
        } catch (err: any) {
          console.error("Failed to fetch jobs:", err);
          setError(
            err?.message ||
              "Failed to load your job status. Please try again later."
          );
        } finally {
          setLoading(false);
        }
      },
      (error) => {
        console.error("Error in real-time listener:", error);
        setError("Failed to maintain real-time connection");
      }
    );

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, [user, authLoading, router]);

  const handleViewDetails = (jobId: string) => {
    const job = jobs.find((job) => job.id === jobId);
    if (job) {
      setSelectedJob(job);
      setIsDialogOpen(true);
    }
  };

  const filteredJobs = jobs.filter((job) => {
    if (selectedTab === "all") return true;
    return job.status.toLowerCase() === selectedTab.toLowerCase();
  });

  if (loading) {
    return (
      <DashboardLayout activeRoute="job-status">
        <div className="flex items-center justify-center h-[calc(100vh-200px)]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">
              Loading your job applications...
            </p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout activeRoute="job-status">
      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Tabs
        defaultValue="all"
        value={selectedTab}
        onValueChange={setSelectedTab}
      >
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
              <div
                key={job.id}
                className="bg-card border rounded-lg p-4 hover:border-primary transition-colors cursor-pointer"
                onClick={() => handleViewDetails(job.id)}
              >
                <h3 className="font-medium">{job.title}</h3>
                <p className="text-sm text-muted-foreground">{job.company}</p>
                <div className="mt-4 flex items-center justify-between">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4 mr-2" />
                    <span>Applied {job.appliedDate}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-sm font-medium capitalize">
                      {job.status}
                    </span>
                  </div>
                </div>
              </div>
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

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-3xl">
          {selectedJob && (
            <>
              <DialogHeader>
                <DialogTitle>Job Details</DialogTitle>
                <DialogDescription>{selectedJob.company}</DialogDescription>
              </DialogHeader>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                <div>
                  <h3 className="text-sm font-medium mb-3">Job Details</h3>
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span>
                        {selectedJob.location.display ||
                          `${selectedJob.location.city}, ${selectedJob.location.state}`}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <span className="font-medium text-lg mr-1">₹</span>
                      <span>{selectedJob.rate}</span>
                    </div>
                    <div className="flex items-center">
                      <Briefcase className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span>{selectedJob.type}</span>
                    </div>
                    {selectedJob.startDate && (
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span>Started {selectedJob.startDate}</span>
                      </div>
                    )}
                  </div>
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
                <Button
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Close
                </Button>
                <Button>Contact Employer</Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
