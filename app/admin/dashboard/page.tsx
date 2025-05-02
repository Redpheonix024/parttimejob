"use client";

import type React from "react";
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
} from "lucide-react";
import { RupeeIcon } from "@/components/ui/rupee-icon";
import AdminLayout from "@/components/admin/admin-layout";

export default function AdminDashboard() {
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Users"
          value="2,845"
          change="+12.5%"
          trend="up"
          icon={<Users className="h-5 w-5 text-primary" />}
        />
        <StatCard
          title="Active Jobs"
          value="487"
          change="+7.2%"
          trend="up"
          icon={<Briefcase className="h-5 w-5 text-primary" />}
        />
        <StatCard
          title="Applications"
          value="1,658"
          change="+24.3%"
          trend="up"
          icon={<FileText className="h-5 w-5 text-primary" />}
        />
        <StatCard
          title="Revenue"
          value="₹933,750"
          change="-2.4%"
          trend="down"
          icon={<RupeeIcon className="h-5 w-5 text-primary" />}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Activity */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle>Recent Activity</CardTitle>
              <Button variant="ghost" size="sm">
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

        {/* Quick Stats */}
        <Card>
          <CardHeader>
            <CardTitle>Platform Overview</CardTitle>
            <CardDescription>
              Key metrics and performance indicators
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="users">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="users">Users</TabsTrigger>
                <TabsTrigger value="jobs">Jobs</TabsTrigger>
                <TabsTrigger value="revenue">Revenue</TabsTrigger>
              </TabsList>
              <TabsContent value="users" className="pt-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">New Users</p>
                      <p className="text-2xl font-bold">127</p>
                    </div>
                    <PieChart className="h-10 w-10 text-primary opacity-80" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Job Seekers</span>
                      <span className="font-medium">78%</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary"
                        style={{ width: "78%" }}
                      ></div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Employers</span>
                      <span className="font-medium">22%</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary"
                        style={{ width: "22%" }}
                      ></div>
                    </div>
                  </div>
                  <div className="pt-2">
                    <Button variant="outline" size="sm" className="w-full">
                      View User Report
                    </Button>
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="jobs" className="pt-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">New Jobs</p>
                      <p className="text-2xl font-bold">43</p>
                    </div>
                    <Briefcase className="h-10 w-10 text-primary opacity-80" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Remote</span>
                      <span className="font-medium">45%</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary"
                        style={{ width: "45%" }}
                      ></div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>On-site</span>
                      <span className="font-medium">35%</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary"
                        style={{ width: "35%" }}
                      ></div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Hybrid</span>
                      <span className="font-medium">20%</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary"
                        style={{ width: "20%" }}
                      ></div>
                    </div>
                  </div>
                  <div className="pt-2">
                    <Button variant="outline" size="sm" className="w-full">
                      View Jobs Report
                    </Button>
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="revenue" className="pt-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Monthly Revenue</p>
                      <p className="text-2xl font-bold">₹321,375</p>
                    </div>
                    <RupeeIcon className="h-10 w-10 text-primary opacity-80" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Basic Plan</span>
                      <span className="font-medium">30%</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary"
                        style={{ width: "30%" }}
                      ></div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Professional Plan</span>
                      <span className="font-medium">45%</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary"
                        style={{ width: "45%" }}
                      ></div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Business Plan</span>
                      <span className="font-medium">25%</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary"
                        style={{ width: "25%" }}
                      ></div>
                    </div>
                  </div>
                  <div className="pt-2">
                    <Button variant="outline" size="sm" className="w-full">
                      View Revenue Report
                    </Button>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
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
}: {
  title: string;
  value: string;
  change: string;
  trend: "up" | "down";
  icon: React.ReactNode;
}) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
            {icon}
          </div>
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
