"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import AdminSidebar from "@/components/admin/admin-sidebar";
import AdminHeader from "@/components/admin/admin-header";
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
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  startAfter,
} from "firebase/firestore";
import { db } from "@/app/config/firebase";
import { format } from "date-fns";
import { toast } from "sonner";
import { Job } from "@/types/job";

const ITEMS_PER_PAGE = 10;

const formatDate = (timestamp: any) => {
  if (!timestamp) return "N/A";

  try {
    if (timestamp instanceof Timestamp) {
      return format(timestamp.toDate(), "MMM d, yyyy");
    }
    if (timestamp.toDate) {
      return format(timestamp.toDate(), "MMM d, yyyy");
    }
    if (typeof timestamp === "string") {
      return format(new Date(timestamp), "MMM d, yyyy");
    }
    if (typeof timestamp === "number") {
      return format(new Date(timestamp), "MMM d, yyyy");
    }
    return "N/A";
  } catch (error) {
    console.error("Error formatting date:", error);
    return "N/A";
  }
};

export default function AdminJobs() {
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastVisible, setLastVisible] = useState<any>(null);
  const [hasMore, setHasMore] = useState(true);

  const fetchJobs = useCallback(
    async (isInitial = false) => {
      try {
        setIsLoading(true);
        console.log("Fetching jobs...");
        const jobsRef = collection(db, "jobs");
        let q = query(
          jobsRef,
          orderBy("createdAt", "desc"),
          limit(ITEMS_PER_PAGE)
        );

        // Apply status filter if not "all"
        if (statusFilter !== "all") {
          q = query(q, where("status", "==", statusFilter));
        }

        // If not initial load and we have a last visible document, start after it
        if (!isInitial && lastVisible) {
          q = query(q, startAfter(lastVisible));
        }

        const querySnapshot = await getDocs(q);
        console.log("Number of jobs found:", querySnapshot.size);

        // Update last visible document
        const lastDoc = querySnapshot.docs[querySnapshot.docs.length - 1];
        setLastVisible(lastDoc);
        setHasMore(querySnapshot.docs.length === ITEMS_PER_PAGE);

        const jobsData = querySnapshot.docs.map((doc) => {
          const data = doc.data();
          console.log("Job data:", data);
          return {
            id: doc.id,
            title: data.title || "",
            company: data.company || "",
            category: data.category || "",
            location: data.location?.address || "Remote",
            postedDate: formatDate(data.createdAt),
            status: data.status || "pending",
            rate: data.salaryAmount
              ? `₹${data.salaryAmount}/${data.salaryType}`
              : "Not specified",
            duration: data.duration || "Not specified",
            applications: data.applications?.length || 0,
            userId: data.userId || "",
          };
        }) as Job[];

        setJobs((prevJobs) =>
          isInitial ? jobsData : [...prevJobs, ...jobsData]
        );
      } catch (err) {
        console.error("Error fetching jobs:", err);
        toast.error("Failed to load jobs. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    },
    [statusFilter, lastVisible]
  );

  // Initial load
  useEffect(() => {
    fetchJobs(true);
  }, [statusFilter]);

  // Load more function
  const loadMore = useCallback(() => {
    if (!isLoading && hasMore) {
      fetchJobs(false);
    }
  }, [isLoading, hasMore, fetchJobs]);

  // Filter jobs based on search query
  const filteredJobs = jobs.filter((job) => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        job.title.toLowerCase().includes(query) ||
        job.company.toLowerCase().includes(query) ||
        job.location.toLowerCase().includes(query)
      );
    }
    return true;
  });

  const handleLogout = () => {
    router.push("/admin/login");
  };

  const columns: ColumnDef<Job>[] = [
    {
      accessorKey: "title",
      header: "Job",
      cell: ({ row }) => {
        const job = row.original;
        return (
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-md bg-primary/10 flex items-center justify-center">
              <Briefcase className="h-5 w-5 text-primary" />
            </div>
            <div>
              <Link
                href={`/admin/jobs/${job.id}`}
                className="font-medium hover:underline"
              >
                {job.title}
              </Link>
              <div className="text-sm text-muted-foreground">{job.company}</div>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "category",
      header: "Category",
      cell: ({ row }) => {
        const job = row.original;
        return <Badge variant="secondary">{job.category}</Badge>;
      },
    },
    {
      accessorKey: "location",
      header: "Location",
    },
    {
      accessorKey: "postedDate",
      header: "Posted",
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const job = row.original;
        return (
          <Badge
            variant={
              job.status === "active"
                ? "default"
                : job.status === "pending"
                ? "outline"
                : job.status === "expired"
                ? "destructive"
                : "secondary"
            }
          >
            {job.status}
          </Badge>
        );
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const job = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link href={`/admin/jobs/${job.id}`}>
                  <Eye className="mr-2 h-4 w-4" />
                  View Details
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <AdminSidebar
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
        activeLink="jobs"
        onLogout={handleLogout}
      />

      {/* Main content */}
      <div className="flex-1 min-w-0 overflow-auto">
        <AdminHeader toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />

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
                      <TableHead>Job</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Posted</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredJobs.map((job) => (
                      <TableRow key={job.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="h-9 w-9 rounded-md bg-primary/10 flex items-center justify-center">
                              <Briefcase className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                              <Link
                                href={`/admin/jobs/${job.id}`}
                                className="font-medium hover:underline"
                              >
                                {job.title}
                              </Link>
                              <div className="text-sm text-muted-foreground">
                                {job.company}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">{job.category}</Badge>
                        </TableCell>
                        <TableCell>{job.location}</TableCell>
                        <TableCell>{job.postedDate}</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              job.status === "active"
                                ? "default"
                                : job.status === "pending"
                                ? "outline"
                                : job.status === "expired"
                                ? "destructive"
                                : "secondary"
                            }
                          >
                            {job.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                                <span className="sr-only">Open menu</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                <Eye className="mr-2 h-4 w-4" />
                                View
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Shield className="mr-2 h-4 w-4" />
                                {job.status === "active"
                                  ? "Deactivate"
                                  : "Activate"}
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-destructive">
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
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
            <Link href="/post-job">
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Add Job
              </Button>
            </Link>
          </div>

          {/* Add infinite scroll or load more button */}
          {hasMore && (
            <div className="flex justify-center mt-4">
              <button
                onClick={loadMore}
                disabled={isLoading}
                className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 disabled:opacity-50"
              >
                {isLoading ? "Loading..." : "Load More"}
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
