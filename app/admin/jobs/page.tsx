"use client";

import React from "react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import AdminSidebar from "@/components/layout/admin-sidebar";
import AdminHeader from "@/components/layout/admin-header";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Bell,
  Briefcase,
  Download,
  Edit,
  Eye,
  Filter,
  Home,
  LogOut,
  Menu,
  MoreHorizontal,
  Plus,
  Search,
  Settings,
  Shield,
  Trash2,
  Users,
  Pencil,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { collection, getDocs, query, where, orderBy } from "firebase/firestore";
import { db } from "@/app/config/firebase";
import { format } from "date-fns";
import { toast } from "sonner";
import { ColumnDef } from "@tanstack/react-table";

interface Job {
  id: string;
  title: string;
  company: string;
  category: string;
  location: string;
  postedDate: string;
  status: string;
  rate: string;
  duration: string;
  applications: number;
  userId: string;
  createdAt: string;
  updatedAt: string;
  employerId: string;
  draftStatus: string;
  flowStatus: string;
  positionsNeeded: number;
  positionsFilled: number;
  companyName?: string;
  employerName?: string;
  employerEmail?: string;
  employerFirstName?: string;
  employerLastName?: string;
}

export default function AdminJobs() {
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchJobs = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch("/api/admin/jobs");
      if (!response.ok) {
        throw new Error(`Failed to fetch jobs: ${response.statusText}`);
      }
      const data = await response.json();
      setJobs(data);
    } catch (error) {
      console.error("Error fetching jobs:", error);
      setError(error instanceof Error ? error.message : "Failed to fetch jobs");
      toast.error("Failed to fetch jobs. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  const columns: ColumnDef<Job>[] = [
    {
      id: "title",
      header: "Title",
      cell: ({ row }) => row.original.title,
    },
    {
      id: "company",
      header: "Company",
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="font-medium">{row.original.companyName || row.original.company}</span>
          <span className="text-sm text-muted-foreground">{row.original.location}</span>
        </div>
      ),
    },
    {
      id: "employer",
      header: "Posted By",
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="font-medium">
            {row.original.employerFirstName} {row.original.employerLastName}
          </span>
          <span className="text-sm text-muted-foreground">{row.original.employerEmail}</span>
        </div>
      ),
    },
    {
      id: "status",
      header: "Status",
      cell: ({ row }) => (
        <Badge variant={row.original.status === "active" ? "default" : "secondary"}>
          {row.original.status}
        </Badge>
      ),
    },
    {
      id: "createdAt",
      header: "Created At",
      cell: ({ row }) => new Date(row.original.createdAt).toLocaleDateString(),
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const job = row.original;
        return (
          <div className="flex items-center gap-2">
            <Link
              href={`/admin/jobs/${job.id}`}
              className="text-primary hover:text-primary/80"
            >
              <Eye className="h-4 w-4" />
            </Link>
            <Link
              href={`/admin/jobs/${job.id}/edit`}
              className="text-primary hover:text-primary/80"
            >
              <Pencil className="h-4 w-4" />
            </Link>
            <Button
              variant="ghost"
              size="icon"
              className="text-destructive hover:text-destructive/80"
              onClick={() => handleDelete(job.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        );
      },
    },
  ];

  useEffect(() => {
    fetchJobs();
  }, []);

  const filteredJobs = jobs.filter((job) => {
    const matchesSearch =
      job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.location.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      categoryFilter === "all" ||
      job.category.toLowerCase() === categoryFilter.toLowerCase();

    const matchesStatus =
      statusFilter === "all" ||
      job.status.toLowerCase() === statusFilter.toLowerCase();

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const handleLogout = () => {
    router.push("/admin/login");
  };

  const handleDelete = async (jobId: string) => {
    try {
      const response = await fetch(`/api/admin/jobs/${jobId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete job");
      }

      // Refresh the jobs list
      fetchJobs();
    } catch (error) {
      console.error("Error deleting job:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <div className="text-destructive">{error}</div>
        <Button onClick={fetchJobs} variant="outline">
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <div
        className={`bg-card border-r h-screen sticky top-0 transition-all duration-300 ${
          isSidebarOpen ? "w-64" : "w-20"
        }`}
      >
        <div className="p-4 border-b flex items-center justify-between">
          <Link
            href="/admin/dashboard"
            className={`font-bold text-primary flex items-center ${
              isSidebarOpen ? "text-xl" : "text-xs"
            }`}
          >
            {isSidebarOpen ? (
              "Parttimejob Admin"
            ) : (
              <Shield className="h-6 w-6" />
            )}
          </Link>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="md:flex hidden"
          >
            <Menu className="h-5 w-5" />
          </Button>
        </div>
        <div className="py-4">
          <nav className="space-y-1 px-2">
            <NavItem
              href="/admin/dashboard"
              icon={<Home />}
              label="Dashboard"
              isExpanded={isSidebarOpen}
            />
            <NavItem
              href="/admin/users"
              icon={<Users />}
              label="Users"
              isExpanded={isSidebarOpen}
            />
            <NavItem
              href="/admin/jobs"
              icon={<Briefcase />}
              label="Jobs"
              isExpanded={isSidebarOpen}
              isActive
            />
            <NavItem
              href="/admin/settings"
              icon={<Settings />}
              label="Settings"
              isExpanded={isSidebarOpen}
            />
          </nav>
        </div>
        <div className="absolute bottom-0 w-full p-4 border-t">
          <Button
            variant="ghost"
            className={`w-full justify-start ${
              isSidebarOpen ? "" : "justify-center px-2"
            }`}
            onClick={handleLogout}
          >
            <LogOut className={`h-5 w-5 ${isSidebarOpen ? "mr-2" : ""}`} />
            {isSidebarOpen && "Logout"}
          </Button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 min-w-0 overflow-auto">
        <header className="bg-background border-b sticky top-0 z-10">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center md:hidden">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              >
                <Menu className="h-5 w-5" />
              </Button>
            </div>
            <div className="flex-1 max-w-md hidden md:block">
              <h1 className="text-xl font-bold">Job Management</h1>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-primary"></span>
              </Button>
              <div className="flex items-center gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage
                    src="/placeholder.svg?height=32&width=32"
                    alt="Admin"
                  />
                  <AvatarFallback>AD</AvatarFallback>
                </Avatar>
                <div className="hidden md:block">
                  <p className="text-sm font-medium">Admin User</p>
                  <p className="text-xs text-muted-foreground">
                    admin@Parttimejob.com
                  </p>
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 py-8">
          <div className="md:hidden mb-6">
            <h1 className="text-xl font-bold">Job Management</h1>
          </div>

          <Card className="mb-8">
            <CardHeader className="pb-3">
              <CardTitle>Jobs</CardTitle>
              <CardDescription>
                Manage all job listings on the Parttimejob platform
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search jobs..."
                    className="pl-10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <div className="flex gap-4">
                  <div className="w-40">
                    <Select
                      value={categoryFilter}
                      onValueChange={setCategoryFilter}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        <SelectItem value="food service">
                          Food Service
                        </SelectItem>
                        <SelectItem value="retail">Retail</SelectItem>
                        <SelectItem value="technology">Technology</SelectItem>
                        <SelectItem value="creative">Creative</SelectItem>
                        <SelectItem value="administrative">
                          Administrative
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="w-40">
                    <Select
                      value={statusFilter}
                      onValueChange={setStatusFilter}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="expired">Expired</SelectItem>
                        <SelectItem value="draft">Draft</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button variant="outline" className="flex items-center gap-2">
                    <Filter className="h-4 w-4" />
                    <span className="hidden md:inline">More Filters</span>
                  </Button>
                </div>
              </div>

              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Company</TableHead>
                      <TableHead>Posted By</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created At</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredJobs.map((job) => (
                      <TableRow key={job.id}>
                        <TableCell className="font-medium">{job.title}</TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-medium">{job.companyName || job.company}</span>
                            <span className="text-sm text-muted-foreground">{job.location}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-medium">
                              {job.employerFirstName} {job.employerLastName}
                            </span>
                            <span className="text-sm text-muted-foreground">{job.employerEmail}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={job.status === "active" ? "default" : "secondary"}>
                            {job.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{new Date(job.createdAt).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Link
                              href={`/admin/jobs/${job.id}`}
                              className="text-primary hover:text-primary/80"
                            >
                              <Eye className="h-4 w-4" />
                            </Link>
                            <Link
                              href={`/admin/jobs/${job.id}/edit`}
                              className="text-primary hover:text-primary/80"
                            >
                              <Pencil className="h-4 w-4" />
                            </Link>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-destructive hover:text-destructive/80"
                              onClick={() => handleDelete(job.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <div className="flex items-center justify-between mt-4">
                <div className="text-sm text-muted-foreground">
                  Showing <strong>{filteredJobs.length}</strong> of{" "}
                  <strong>{jobs.length}</strong> jobs
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm">
                    Previous
                  </Button>
                  <Button variant="outline" size="sm">
                    Next
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex items-center justify-between">
            <Button variant="outline" className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Export Jobs
            </Button>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add Job
            </Button>
          </div>
        </main>
      </div>
    </div>
  );
}

// Navigation Item Component
function NavItem({
  href,
  icon,
  label,
  isExpanded,
  isActive,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  isExpanded: boolean;
  isActive?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`flex items-center px-3 py-2 text-sm rounded-md ${
        isActive
          ? "bg-primary/10 text-primary font-medium"
          : "text-muted-foreground hover:bg-muted hover:text-foreground"
      }`}
    >
      <div className={isExpanded ? "mr-3" : ""}>{icon}</div>
      {isExpanded && <span className="flex-1">{label}</span>}
    </Link>
  );
}
