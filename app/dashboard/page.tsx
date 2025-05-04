"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star, Camera } from "lucide-react";
import DashboardLayout from "@/components/dashboard/dashboard-layout";
import StatCard from "@/components/dashboard/stat-card";
import ApplicationCard from "@/components/dashboard/application-card";
import InterviewCard from "@/components/dashboard/interview-card";
import JobCard from "@/components/dashboard/job-card";
import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useUserProfile } from "@/hooks/useUserProfile";
import { toast } from "sonner";
import {
  collection,
  query,
  where,
  getDocs,
  getCountFromServer,
  getDoc,
  doc,
  limit,
  orderBy,
} from "firebase/firestore";
import { db } from "@/app/config/firebase";
import { format } from "date-fns";
import { usersApi } from "@/utils/api";
import { calculateProfileCompletion } from "@/app/utils/profile-completion";

// Define the Application type based on expected props
interface Application {
  id: string; // Added ID based on typical data structures
  jobTitle: string;
  company: string;
  location: string;
  salary: string;
  type: string;
  appliedDate: string;
  status: string;
  jobId: string; // Added jobId based on potential needs
}

// Add interfaces from applications page
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
  // Add other fields if present in your Firestore data
  userId?: string;
}

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const { user } = useAuth();
  const { profile, getProfilePicture, updateProfilePicture } = useUserProfile();
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [recentApplicationsData, setRecentApplicationsData] = useState<
    Application[]
  >([]);
  const [isLoadingApplications, setIsLoadingApplications] = useState(true);
  const [applicationsError, setApplicationsError] = useState<string | null>(
    null
  );

  const [totalApplications, setTotalApplications] = useState<number | null>(
    null
  );
  const [profileCompletion, setProfileCompletion] = useState(0);
  const [missingProfileItems, setMissingProfileItems] = useState<string[]>([]);

  useEffect(() => {
    const fetchRecentApplications = async () => {
      if (!user?.uid) return; // Don't fetch if user is not available

      setIsLoadingApplications(true);
      setApplicationsError(null);
      try {
        // Fetch recent applications from Firestore
        const applicationsQuery = query(
          collection(db, "applications"),
          where("userId", "==", user.uid),
          orderBy("createdAt", "desc"), // Order by creation date descending
          limit(3) // Limit to 3 recent applications for the dashboard
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
                      ? `${jobData.salaryAmount} ${jobData.salaryType || "/hr"}` // Added default salaryType
                      : "Not specified",
                    type: jobData.jobType || "Not specified",
                  };
                }
              } catch (error) {
                console.error(
                  "Error fetching job details for dashboard:",
                  error
                );
              }
            }

            return {
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
            } as Application;
          })
        );

        setRecentApplicationsData(fetchedApplications);
      } catch (error) {
        console.error("Error fetching recent applications:", error);
        setApplicationsError("An error occurred while fetching applications.");
        toast.error("An error occurred while fetching recent applications.");
      } finally {
        setIsLoadingApplications(false);
      }

      // Fetch total application count
      try {
        const countQuery = query(
          collection(db, "applications"),
          where("userId", "==", user.uid)
        );
        const snapshot = await getCountFromServer(countQuery);
        setTotalApplications(snapshot.data().count);
      } catch (error) {
        console.error("Error fetching total application count:", error);
        // Handle error appropriately, maybe set count to 0 or show an error message
        setTotalApplications(0);
      }
    };

    if (user?.uid) {
      fetchRecentApplications();
    }
  }, [user?.uid]); // Refetch if user changes

  // Calculate profile completion when profile data is available
  useEffect(() => {
    if (profile) {
      const completionData = calculateProfileCompletion(profile);
      setProfileCompletion(completionData.percentage);

      // Extract missing items from all sections
      const missingItems = completionData.sections
        .filter((section) => !section.completed && section.remainingFields)
        .flatMap((section) => section.remainingFields || []); // Use flatMap to combine arrays

      setMissingProfileItems(missingItems);
    }
  }, [profile]);

  // Add handler for removing application (filters local state for now)
  const handleRemoveApplication = (applicationId: string) => {
    setRecentApplicationsData((prevApps) =>
      prevApps.filter((app) => app.id !== applicationId)
    );
    // TODO: Add backend call to actually delete/withdraw the application if needed
    toast.info("Application removed from this view.");
  };

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0 || !user?.uid) return;

    const file = files[0];

    // Check file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    // Check file size (limit to 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size exceeds 5MB limit");
      return;
    }

    // Upload the file
    try {
      setIsUploading(true);
      const response = await usersApi.uploadProfilePicture(file, user.uid);

      if (response.success) {
        await updateProfilePicture(response.imageUrl);
        toast.success("Profile picture updated successfully");
      }
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to upload profile picture");
    } finally {
      setIsUploading(false);
      // Reset the input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  return (
    <DashboardLayout activeRoute="overview" userData={profile} user={user}>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept="image/*"
      />
      <div className="space-y-6">
        <h2 className="text-3xl font-semibold text-primary">
          Welcome back, {user?.displayName || "User"}!
        </h2>

        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <Button>Find Jobs</Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StatCard
            title="Applications"
            value={
              totalApplications !== null ? totalApplications.toString() : "..."
            }
            description="View all applications"
          />
          <StatCard
            title="Profile Completion"
            value={`${profileCompletion}%`}
            progress={profileCompletion}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Recent Applications</CardTitle>
                <CardDescription>
                  Your recently submitted job applications
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {isLoadingApplications ? (
                    <p>Loading applications...</p>
                  ) : applicationsError ? (
                    <p className="text-red-500">{applicationsError}</p>
                  ) : recentApplicationsData.length > 0 ? (
                    recentApplicationsData.map((application) => (
                      <ApplicationCard
                        key={application.id}
                        application={application}
                        onRemove={() => handleRemoveApplication(application.id)}
                      />
                    ))
                  ) : (
                    <p>No recent applications found.</p>
                  )}
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full">
                  View All Applications
                </Button>
              </CardFooter>
            </Card>

            {/* Remove Upcoming Interviews Card */}
            {/* 
            <Card>
              <CardHeader>
                <CardTitle>Upcoming Interviews</CardTitle>
                <CardDescription>Your scheduled interviews</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {upcomingInterviews.map((interview, index) => (
                    <InterviewCard key={index} interview={interview} />
                  ))}
                </div>
              </CardContent>
            </Card>
            */}
          </div>

          <div>
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Profile Overview</CardTitle>
                <CardDescription>
                  Complete your profile to attract employers
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center mb-4">
                  <div className="relative group">
                    <Avatar className="h-16 w-16">
                      <AvatarImage
                        src={
                          profile?.profilePicture ||
                          profile?.photoURL ||
                          getProfilePicture()
                        }
                        alt={user?.displayName || "User"}
                      />
                      <AvatarFallback>
                        {user?.displayName?.[0] || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <button
                      className="absolute bottom-0 right-0 bg-primary text-white rounded-full p-1 cursor-pointer"
                      onClick={handleFileSelect}
                      disabled={isUploading}
                      type="button"
                    >
                      <Camera className="h-3 w-3" />
                    </button>
                  </div>
                  <div className="ml-4">
                    <h3 className="font-medium">
                      <span className="font-medium">
                        {profile?.firstName ||
                          user?.displayName ||
                          "Complete Your Profile"}
                      </span>
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {profile?.email || user?.email || "Add your email"}
                    </p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Profile Completion</span>
                      <span className="font-medium">{profileCompletion}%</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary"
                        style={{ width: `${profileCompletion}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className="text-sm">
                    <p className="font-medium mb-2">Complete these items:</p>
                    {missingProfileItems.length > 0 ? (
                      <ul className="space-y-1">
                        {missingProfileItems.map((item, index) => (
                          <li
                            key={index}
                            className="flex items-center text-muted-foreground"
                          >
                            <span className="mr-2">•</span>
                            {item}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-green-600">
                        Profile is complete!
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full">
                  Edit Profile
                </Button>
              </CardFooter>
            </Card>

            {/* Remove Recommended Jobs Card */}
            {/*             
            <Card>
              <CardHeader>
                <CardTitle>Recommended Jobs</CardTitle>
                <CardDescription>
                  Based on your profile and preferences
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recommendedJobs.map((job, index) => (
                    <JobCard key={index} job={job} />
                  ))}
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full">
                  View All Recommendations
                </Button>
              </CardFooter>
            </Card> 
            */}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

interface Job {
  title: string;
  company: string;
  location: string;
  salary: string;
  type: string;
  postedDate?: string;
}

const recentApplications = [
  {
    jobTitle: "Frontend Developer",
    company: "Tech Solutions Inc.",
    appliedDate: "2 days ago",
  },
  {
    jobTitle: "UX Designer",
    company: "Creative Agency",
    appliedDate: "1 week ago",
  },
  {
    jobTitle: "Content Writer",
    company: "Media Group",
    appliedDate: "3 days ago",
  },
];

const upcomingInterviews = [
  {
    jobTitle: "UX Designer",
    company: "Creative Agency",
    date: "Tomorrow",
    time: "10:00 AM",
  },
  {
    jobTitle: "Web Developer",
    company: "Digital Solutions",
    date: "May 15, 2023",
    time: "2:30 PM",
  },
];

const recommendedJobs = [
  {
    title: "JavaScript Developer",
    company: "Tech Innovations",
    location: "Remote",
    salary: "₹2250-3000/hr",
    type: "Part-time",
  },
  {
    title: "Web Designer",
    company: "Design Studio",
    location: "San Francisco, CA",
    salary: "₹1875-2625/hr",
    type: "Contract",
  },
  {
    title: "Frontend Engineer",
    company: "Software Solutions",
    location: "New York, NY",
    salary: "₹3000-3750/hr",
    type: "Part-time",
  },
];

const allApplications = [
  {
    jobTitle: "Frontend Developer",
    company: "Tech Solutions Inc.",
    location: "Remote",
    salary: "₹2250-3000/hr",
    type: "Part-time",
    appliedDate: "2 days ago",
  },
  {
    jobTitle: "UX Designer",
    company: "Creative Agency",
    location: "San Francisco, CA",
    salary: "₹1875-2625/hr",
    type: "Contract",
    appliedDate: "1 week ago",
  },
  {
    jobTitle: "Content Writer",
    company: "Media Group",
    location: "Chicago, IL",
    salary: "₹1500-1875/hr",
    type: "Part-time",
    appliedDate: "3 days ago",
  },
  {
    jobTitle: "Social Media Manager",
    company: "Marketing Solutions",
    location: "Remote",
    salary: "₹1350-1650/hr",
    type: "Part-time",
    appliedDate: "2 weeks ago",
  },
  {
    jobTitle: "Customer Support",
    company: "Service Pro",
    location: "Austin, TX",
    salary: "₹1875-2250/hr",
    type: "Weekend",
    appliedDate: "5 days ago",
  },
];

const savedJobs: Job[] = [
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
    salary: "₹1875-2250/hr",
    type: "Flexible hours",
    postedDate: "Just now",
  },
];

const messages = [
  {
    sender: "Sarah Johnson",
    subject: "Interview Invitation: UX Designer Position",
    preview:
      "Hi John, We've reviewed your application and would like to invite you for an interview...",
    time: "10:30 AM",
    unread: true,
  },
  {
    sender: "Michael Chen",
    subject: "Follow-up: Frontend Developer Application",
    preview:
      "Thank you for applying to the Frontend Developer position. We have a few additional questions...",
    time: "Yesterday",
    unread: true,
  },
  {
    sender: "Tech Solutions Inc.",
    subject: "Application Received: Frontend Developer",
    preview:
      "Thank you for applying to the Frontend Developer position at Tech Solutions Inc. We've received your application...",
    time: "2 days ago",
    unread: false,
  },
  {
    sender: "Parttimejob Support",
    subject: "Your profile is getting noticed!",
    preview:
      "Your profile has been viewed by 12 employers in the last week. Here are some tips to increase your chances...",
    time: "1 week ago",
    unread: false,
  },
];
