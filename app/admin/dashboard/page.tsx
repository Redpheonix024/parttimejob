"use client";

import type React from "react";
import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  BarChart3,
  Briefcase,
  ChevronDown,
  Clock,
  DollarSign,
  Download,
  FileText,
  Plus,
  PieChart,
  Users,
  Loader2,
} from "lucide-react";
import { RupeeIcon } from "@/components/ui/rupee-icon";
import AdminLayout from "@/components/admin/admin-layout";

export default function AdminDashboard() {
  const [totalUsers, setTotalUsers] = useState<number | null>(null);
  const [activeJobs, setActiveJobs] = useState<number | null>(null);
  const [totalApplications, setTotalApplications] = useState<number | null>(
    null
  );
  const [loadingStats, setLoadingStats] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      setLoadingStats(true);
      setError(null);
      try {
        // Fetch Total Users
        const usersRes = await fetch("/api/admin/users/count");
        if (!usersRes.ok) throw new Error("Failed to fetch users count");
        const usersData = await usersRes.json();
        setTotalUsers(usersData.count);

        // Fetch Active Jobs
        const jobsRes = await fetch("/api/admin/jobs/count");
        if (!jobsRes.ok) throw new Error("Failed to fetch jobs count");
        const jobsData = await jobsRes.json();
        setActiveJobs(jobsData.count);

        // Fetch Applications Count from API
        const appsRes = await fetch("/api/admin/applications/count");
        if (!appsRes.ok) throw new Error("Failed to fetch applications count");
        const appsData = await appsRes.json();
        setTotalApplications(appsData.count);
      } catch (err) {
        console.error("Error fetching admin stats:", err);
        setError(
          err instanceof Error ? err.message : "An unknown error occurred"
        );
      } finally {
        setLoadingStats(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <AdminLayout activeLink="dashboard" title="Admin Dashboard">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="hidden md:flex">
            <Download className="mr-2 h-4 w-4" />
            Export Data
          </Button>
          <Button size="sm" asChild>
            <Link href="/post-job">
              <Plus className="mr-2 h-4 w-4" />
              New Job
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <StatCard
          title="Total Users"
          value={
            loadingStats ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              totalUsers?.toLocaleString() ?? "N/A"
            )
          }
          icon={<Users className="h-5 w-5 text-primary" />}
          isLoading={loadingStats}
        />
        <StatCard
          title="Active Jobs"
          value={
            loadingStats ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              activeJobs?.toLocaleString() ?? "N/A"
            )
          }
          icon={<Briefcase className="h-5 w-5 text-primary" />}
          isLoading={loadingStats}
        />
        <StatCard
          title="Applications"
          value={
            loadingStats ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              totalApplications?.toLocaleString() ?? "N/A"
            )
          }
          icon={<FileText className="h-5 w-5 text-primary" />}
          isLoading={loadingStats}
        />
      </div>

      {error && (
        <div className="mb-4 text-center text-red-600">
          Error loading stats: {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Activity */}
        {/*
        <Card className="lg:col-span-2 relative">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CardTitle>Recent Activity</CardTitle>
                <Badge variant="outline" className="text-xs h-5">
                  Coming Soon
                </Badge>
              </div>
              <Button variant="ghost" size="sm" disabled>
                View All
              </Button>
            </div>
            <CardDescription>
              Latest actions and updates on the platform
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {recentActivities.map((activity, index) => (
                <div key={index} className="flex items-start">
                  <div
                    className={`h-9 w-9 rounded-full flex items-center justify-center mr-3 ${getActivityColor(
                      activity.type
                    )}`}
                  >
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{activity.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {activity.description}
                    </p>
                    <div className="flex items-center mt-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3 mr-1" />
                      <span>{activity.time}</span>
                    </div>
                  </div>
                  <Badge variant={getActivityBadgeVariant(activity.type)}>
                    {activity.type}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        */}

        {/* Quick Stats */}
        {/*
        <Card className="relative">
          <CardHeader>
            <div className="flex items-center gap-2">
              <CardTitle>Platform Overview</CardTitle>
              <Badge variant="outline" className="text-xs h-5">
                Coming Soon
              </Badge>
            </div>
            <CardDescription>
              Key metrics and performance indicators
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <BarChart3 className="h-6 w-6 text-primary" />
                <div>
                  <p className="font-medium">User Growth</p>
                  <p className="text-xs text-muted-foreground">
                    +12% this month
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <PieChart className="h-6 w-6 text-primary" />
                <div>
                  <p className="font-medium">Job Distribution</p>
                  <p className="text-xs text-muted-foreground">
                    40% part-time, 60% full-time
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <DollarSign className="h-6 w-6 text-primary" />
                <div>
                  <p className="font-medium">Revenue</p>
                  <p className="text-xs text-muted-foreground">
                    ₹1,20,000 this month
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        */}
      </div>
    </AdminLayout>
  );
}

// Dummy data for recent activities
const recentActivities = [
  {
    type: "User",
    title: "New User Registration",
    description: "Rahul Sharma registered as a job seeker.",
    time: "10 min ago",
  },
  {
    type: "Job",
    title: "New Job Posted",
    description: "Tech Innovators posted 'Frontend Developer' job.",
    time: "45 min ago",
  },
  {
    type: "Payment",
    title: "Subscription Payment",
    description: "QuickHire upgraded to Professional Plan.",
    time: "1 hour ago",
  },
  {
    type: "Application",
    title: "Job Application",
    description: "14 new applications for 'Customer Support Executive'.",
    time: "3 hours ago",
  },
];

function StatCard({
  title,
  value,
  change,
  trend,
  icon,
  isLoading,
}: {
  title: string;
  value: string | React.ReactNode;
  change?: string;
  trend?: "up" | "down";
  icon: React.ReactNode;
  isLoading?: boolean;
}) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
            {icon}
          </div>
          {change && trend && !isLoading && (
            <div
              className={`text-xs font-medium flex items-center ${
                trend === "up" ? "text-green-500" : "text-red-500"
              }`}
            >
              {change}
              <ChevronDown
                className={`h-3 w-3 ml-1 ${trend === "up" ? "rotate-180" : ""}`}
              />
            </div>
          )}
        </div>
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-2xl font-bold">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function getActivityColor(type: string) {
  switch (type) {
    case "User":
      return "bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300";
    case "Job":
      return "bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-300";
    case "Payment":
      return "bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300";
    case "Application":
      return "bg-orange-100 text-orange-600 dark:bg-orange-900 dark:text-orange-300";
    default:
      return "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300";
  }
}

function getActivityIcon(type: string) {
  switch (type) {
    case "User":
      return <Users className="h-5 w-5" />;
    case "Job":
      return <Briefcase className="h-5 w-5" />;
    case "Payment":
      return <DollarSign className="h-5 w-5" />;
    case "Application":
      return <FileText className="h-5 w-5" />;
    default:
      return <BarChart3 className="h-5 w-5" />;
  }
}

function getActivityBadgeVariant(type: string) {
  switch (type) {
    case "User":
      return "outline";
    case "Job":
      return "secondary";
    case "Payment":
      return "default";
    case "Application":
      return "destructive";
    default:
      return "outline";
  }
}
