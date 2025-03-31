"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import AdminSidebar from "@/components/layout/admin-sidebar"
import AdminHeader from "@/components/layout/admin-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
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
} from "lucide-react"

export default function AdminDashboard() {
  const router = useRouter()
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)

  const handleLogout = () => {
    // In a real app, this would clear authentication state
    router.push("/admin/login")
  }

  return (
    <div className="min-h-screen bg-background flex">
      <AdminSidebar
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
        activeLink="dashboard"
        onLogout={handleLogout}
      />

      {/* Main content */}
      <div className="flex-1 min-w-0 overflow-auto">
        <AdminHeader toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />

        <main className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-2xl font-bold">Admin Dashboard</h1>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="hidden md:flex">
                <Download className="mr-2 h-4 w-4" />
                Export Data
              </Button>
              <Button size="sm">
                <Plus className="mr-2 h-4 w-4" />
                New Job
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
              value="$12,450"
              change="-2.4%"
              trend="down"
              icon={<DollarSign className="h-5 w-5 text-primary" />}
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
                <CardDescription>Latest actions and updates on the platform</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {recentActivities.map((activity, index) => (
                    <div key={index} className="flex items-start">
                      <div
                        className={`h-9 w-9 rounded-full flex items-center justify-center mr-3 ${getActivityColor(activity.type)}`}
                      >
                        {getActivityIcon(activity.type)}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{activity.title}</p>
                        <p className="text-sm text-muted-foreground">{activity.description}</p>
                        <div className="flex items-center mt-1 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3 mr-1" />
                          <span>{activity.time}</span>
                        </div>
                      </div>
                      <Badge variant={getActivityBadgeVariant(activity.type)}>{activity.type}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Platform Overview</CardTitle>
                <CardDescription>Key metrics and performance indicators</CardDescription>
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
                          <div className="h-full bg-primary" style={{ width: "78%" }}></div>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Employers</span>
                          <span className="font-medium">22%</span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div className="h-full bg-primary" style={{ width: "22%" }}></div>
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
                          <div className="h-full bg-primary" style={{ width: "45%" }}></div>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>On-site</span>
                          <span className="font-medium">35%</span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div className="h-full bg-primary" style={{ width: "35%" }}></div>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Hybrid</span>
                          <span className="font-medium">20%</span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div className="h-full bg-primary" style={{ width: "20%" }}></div>
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
                          <p className="text-2xl font-bold">$4,285</p>
                        </div>
                        <DollarSign className="h-10 w-10 text-primary opacity-80" />
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Basic Plan</span>
                          <span className="font-medium">30%</span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div className="h-full bg-primary" style={{ width: "30%" }}></div>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Professional Plan</span>
                          <span className="font-medium">45%</span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div className="h-full bg-primary" style={{ width: "45%" }}></div>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Business Plan</span>
                          <span className="font-medium">25%</span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div className="h-full bg-primary" style={{ width: "25%" }}></div>
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
        </main>
      </div>
    </div>
  )
}

// Stat Card Component
function StatCard({
  title,
  value,
  change,
  trend,
  icon,
}: {
  title: string
  value: string
  change: string
  trend: "up" | "down"
  icon: React.ReactNode
}) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <div className={`flex items-center text-xs mt-1 ${trend === "up" ? "text-green-500" : "text-red-500"}`}>
          <ChevronDown className={`h-4 w-4 ${trend === "up" ? "rotate-180" : ""}`} />
          <span>{change} from last month</span>
        </div>
      </CardContent>
    </Card>
  )
}

// Helper functions for activity styling
function getActivityColor(type: string) {
  switch (type) {
    case "User":
      return "bg-blue-100 text-blue-600"
    case "Job":
      return "bg-green-100 text-green-600"
    case "Payment":
      return "bg-purple-100 text-purple-600"
    case "System":
      return "bg-orange-100 text-orange-600"
    default:
      return "bg-gray-100 text-gray-600"
  }
}

function getActivityIcon(type: string) {
  switch (type) {
    case "User":
      return <Users className="h-5 w-5" />
    case "Job":
      return <Briefcase className="h-5 w-5" />
    case "Payment":
      return <DollarSign className="h-5 w-5" />
    case "System":
      return <BarChart3 className="h-5 w-5" />
    default:
      return <FileText className="h-5 w-5" />
  }
}

function getActivityBadgeVariant(type: string) {
  switch (type) {
    case "User":
      return "secondary"
    case "Job":
      return "default"
    case "Payment":
      return "outline"
    case "System":
      return "destructive"
    default:
      return "secondary"
  }
}

// Sample data
const recentActivities = [
  {
    type: "User",
    title: "New User Registration",
    description: "John Doe (john.doe@example.com) created a new account",
    time: "5 minutes ago",
  },
  {
    type: "Job",
    title: "New Job Posted",
    description: "Weekend Barista position posted by Coffee House",
    time: "25 minutes ago",
  },
  {
    type: "Payment",
    title: "Subscription Payment",
    description: "Tech Solutions Inc. renewed their Professional plan",
    time: "1 hour ago",
  },
  {
    type: "User",
    title: "Profile Updated",
    description: "Sarah Johnson updated her profile information",
    time: "2 hours ago",
  },
  {
    type: "System",
    title: "System Maintenance",
    description: "Scheduled database backup completed successfully",
    time: "4 hours ago",
  },
]

