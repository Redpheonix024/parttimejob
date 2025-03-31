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
import { Star } from "lucide-react";
import DashboardLayout from "@/components/dashboard/dashboard-layout";
import StatCard from "@/components/dashboard/stat-card";
import ApplicationCard from "@/components/dashboard/application-card";
import InterviewCard from "@/components/dashboard/interview-card";
import JobCard from "@/components/dashboard/job-card";
import { useState, useEffect } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <DashboardLayout activeRoute="overview">
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
            value="12"
            description="4 in progress, 2 interviews"
          />
          <StatCard
            title="Profile Views"
            value="48"
            description="+12% from last week"
          />
          <StatCard title="Profile Completion" value="85%" progress={85} />
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
                  {recentApplications.map((application, index) => (
                    <ApplicationCard key={index} application={application} />
                  ))}
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full">
                  View All Applications
                </Button>
              </CardFooter>
            </Card>

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
                  <Avatar className="h-16 w-16">
                    <AvatarImage
                      src={
                        user?.photoURL || "/placeholder.svg?height=64&width=64"
                      }
                      alt={user?.displayName || "User"}
                    />
                    <AvatarFallback>
                      {user?.displayName?.[0] || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="ml-4">
                    <h3 className="font-medium">
                      {user?.displayName || "Complete Your Profile"}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {user?.email || "Add your title"}
                    </p>
                    <div className="flex items-center mt-1">
                      <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                      <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                      <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                      <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                      <Star className="h-4 w-4 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground ml-1">
                        (4.0)
                      </span>
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Profile Completion</span>
                      <span className="font-medium">85%</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary"
                        style={{ width: "85%" }}
                      ></div>
                    </div>
                  </div>
                  <div className="text-sm">
                    <p className="font-medium mb-2">Complete these items:</p>
                    <ul className="space-y-1">
                      <li className="flex items-center text-muted-foreground">
                        <span className="mr-2">•</span>
                        Add your education history
                      </li>
                      <li className="flex items-center text-muted-foreground">
                        <span className="mr-2">•</span>
                        Upload your resume
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full">
                  Edit Profile
                </Button>
              </CardFooter>
            </Card>

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
    status: "Pending",
  },
  {
    jobTitle: "UX Designer",
    company: "Creative Agency",
    appliedDate: "1 week ago",
    status: "Interview",
  },
  {
    jobTitle: "Content Writer",
    company: "Media Group",
    appliedDate: "3 days ago",
    status: "Reviewed",
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
    salary: "$30-40/hr",
    type: "Part-time",
  },
  {
    title: "Web Designer",
    company: "Design Studio",
    location: "San Francisco, CA",
    salary: "$25-35/hr",
    type: "Contract",
  },
  {
    title: "Frontend Engineer",
    company: "Software Solutions",
    location: "New York, NY",
    salary: "$40-50/hr",
    type: "Part-time",
  },
];

const allApplications = [
  {
    jobTitle: "Frontend Developer",
    company: "Tech Solutions Inc.",
    location: "Remote",
    salary: "$30-40/hr",
    type: "Part-time",
    appliedDate: "2 days ago",
    status: "Pending",
  },
  {
    jobTitle: "UX Designer",
    company: "Creative Agency",
    location: "San Francisco, CA",
    salary: "$35-45/hr",
    type: "Contract",
    appliedDate: "1 week ago",
    status: "Interview",
  },
  {
    jobTitle: "Content Writer",
    company: "Media Group",
    location: "Chicago, IL",
    salary: "$25-30/hr",
    type: "Part-time",
    appliedDate: "3 days ago",
    status: "Reviewed",
  },
  {
    jobTitle: "Social Media Manager",
    company: "Marketing Solutions",
    location: "Remote",
    salary: "$20-25/hr",
    type: "Part-time",
    appliedDate: "2 weeks ago",
    status: "Rejected",
  },
  {
    jobTitle: "Customer Support",
    company: "Service Pro",
    location: "Austin, TX",
    salary: "$18-22/hr",
    type: "Weekend",
    appliedDate: "5 days ago",
    status: "Pending",
  },
];

const savedJobs: Job[] = [
  {
    title: "JavaScript Developer",
    company: "Tech Innovations",
    location: "Remote",
    salary: "$30-40/hr",
    type: "Part-time",
    postedDate: "3 days ago",
  },
  {
    title: "Web Designer",
    company: "Design Studio",
    location: "San Francisco, CA",
    salary: "$25-35/hr",
    type: "Contract",
    postedDate: "1 week ago",
  },
  {
    title: "Frontend Engineer",
    company: "Software Solutions",
    location: "New York, NY",
    salary: "$40-50/hr",
    type: "Part-time",
    postedDate: "2 days ago",
  },
  {
    title: "Data Entry Specialist",
    company: "Business Services",
    location: "Remote",
    salary: "$18-22/hr",
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
