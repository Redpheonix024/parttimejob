"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import DashboardLayout from "@/components/dashboard/dashboard-layout";
import ApplicationCard from "@/components/dashboard/application-card";
import { useEffect, useState } from "react";
import {
  collection,
  query,
  where,
  getDocs,
  getDoc,
  doc,
  updateDoc,
} from "firebase/firestore";
import { db } from "@/app/config/firebase";
import { useAuth } from "@/hooks/useAuth";
import { format } from "date-fns";
import { useUserProfile } from "@/hooks/useUserProfile";

interface Application {
  id: string;
  jobTitle: string;
  company: string;
  location: string;
  salary: string;
  type: string;
  appliedDate: string;
  status: string;
  jobId: string;
}

interface JobData {
  location?: {
    display?: string;
  };
  salaryAmount?: string;
  salaryType?: string;
  jobType?: string;
}

interface ApplicationData {
  jobTitle: string;
  company: string;
  jobId: string;
  status: string;
  createdAt: {
    toDate: () => Date;
  };
}

export default function Applications() {
  const { user } = useAuth();
  const { profile } = useUserProfile();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchApplications = async () => {
    if (!user?.uid) return;

    try {
      const applicationsQuery = query(
        collection(db, "applications"),
        where("userId", "==", user.uid)
      );

      const querySnapshot = await getDocs(applicationsQuery);
      const fetchedApplications = await Promise.all(
        querySnapshot.docs.map(async (docSnapshot) => {
          const data = docSnapshot.data() as ApplicationData;

          // Fetch job details if jobId exists
          let jobDetails = {
            location: "Remote",
            salary: "Not specified",
            type: "Not specified",
          };

          if (data.jobId) {
            try {
              const jobDocRef = doc(db, "jobs", data.jobId);
              const jobDoc = await getDoc(jobDocRef);
              if (jobDoc.exists()) {
                const jobData = jobDoc.data() as JobData;
                jobDetails = {
                  location: jobData.location?.display || "Remote",
                  salary: jobData.salaryAmount
                    ? `${jobData.salaryAmount} ${jobData.salaryType}`
                    : "Not specified",
                  type: jobData.jobType || "Not specified",
                };
              }
            } catch (error) {
              console.error("Error fetching job details:", error);
            }
          }

          const application = {
            id: docSnapshot.id,
            jobTitle: data.jobTitle,
            company: data.company,
            location: jobDetails.location,
            salary: jobDetails.salary,
            type: jobDetails.type,
            appliedDate: data.createdAt
              ? format(data.createdAt.toDate(), "MMM d, yyyy")
              : "N/A",
            status: data.status || "Applied",
            jobId: data.jobId,
          };

          // console.log("Fetched application:", application);
          return application;
        })
      );

      // Sort applications by date in descending order
      const sortedApplications = fetchedApplications.sort((a, b) => {
        const dateA = new Date(a.appliedDate);
        const dateB = new Date(b.appliedDate);
        return dateB.getTime() - dateA.getTime();
      });

      setApplications(sortedApplications);
      // console.log("Updated applications state:", sortedApplications);
    } catch (error) {
      console.error("Error fetching applications:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = (applicationId: string, newStatus: string) => {
    console.log("Status change requested:", { applicationId, newStatus });
    setApplications((prevApplications) => {
      const updatedApplications = prevApplications.map((app) =>
        app.id === applicationId ? { ...app, status: newStatus } : app
      );
      console.log(
        "Updated applications after status change:",
        updatedApplications
      );
      return updatedApplications;
    });
  };

  useEffect(() => {
    fetchApplications();
  }, [user?.uid]);

  const handleRemoveApplication = (applicationId: string) => {
    setApplications(applications.filter((app) => app.id !== applicationId));
  };

  return (
    <DashboardLayout activeRoute="applications" userData={profile} user={user}>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">My Applications</h1>
        <Button>Find More Jobs</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Applications</CardTitle>
          <CardDescription>
            Track the status of your job applications
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-4">Loading applications...</div>
          ) : applications.length === 0 ? (
            <div className="text-center py-4 text-muted-foreground">
              You haven't applied to any jobs yet.
            </div>
          ) : (
            <div className="space-y-6">
              {applications.map((application) => (
                <ApplicationCard
                  key={application.id}
                  application={application}
                  onRemove={() => handleRemoveApplication(application.id)}
                  onStatusChange={handleStatusChange}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}
