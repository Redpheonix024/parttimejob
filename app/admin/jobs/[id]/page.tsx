"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
  DocumentData,
  QueryDocumentSnapshot,
  Timestamp,
  updateDoc,
  addDoc,
  deleteDoc,
} from "firebase/firestore";
import { db } from "@/app/config/firebase";
import { format } from "date-fns";
import AdminSidebar from "@/components/admin/admin-sidebar";
import AdminHeader from "@/components/admin/admin-header";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  BadgeCheck,
  Bell,
  Bookmark,
  Briefcase,
  Calendar,
  Check,
  CheckCircle,
  CheckCheck,
  ChevronDown,
  Clock,
  Copy,
  DollarSign,
  Download,
  Edit,
  ExternalLink,
  Eye,
  FileText,
  Filter,
  Heart,
  Home,
  Info,
  Link as LinkIcon,
  Loader2,
  Mail,
  MapPin,
  Mic,
  MoreHorizontal,
  Phone,
  Play,
  Plus,
  Search,
  Send,
  Share2,
  Shield,
  Star,
  Trash2,
  User,
  Users,
  Wallet,
  X,
  X as Close,
  type LucideIcon,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// Add these interfaces at the top of the file after imports
interface JobData {
  id: string;
  title: string;
  company: string;
  companyLogo: string;
  location: string;
  type: string;
  category: string;
  postedDate: string;
  expiryDate: string;
  status: string;
  featured: boolean;
  urgent: boolean;
  rate: string;
  duration: string;
  applications: number;
  views: number;
  description: string;
  requirements: string[];
  benefits: string[];
  employer: {
    id: string;
    name: string;
    email: string;
    phone: string;
    avatar: string;
  } | null;
  applicants: {
    id: string;
    userId?: string;
    name: string;
    email: string;
    appliedDate: string;
    status: string;
    avatar: string;
    phone?: string;
  }[];
  timeline: {
    id: string;
    date: string;
    time: string;
    action: string;
    icon: React.ReactNode;
  }[];
  flowStatus: string;
  flowProgress: number;
  positionsNeeded: number;
  positionsFilled: number;
  gender?: string;
  minAge?: number;
  maxAge?: number;
  hours?: string;
  payType?: string;
  applicationInstructions?: string;
  skills?: string;
  audioDescription?: {
    url: string;
    duration: string;
  };
}

interface UserData {
  firstName?: string;
  lastName?: string;
  displayName?: string;
  email?: string;
  phone?: string;
  photoURL?: string;
}

// Update the schema to remove email
const manualApplicantSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
});

type ManualApplicantFormValues = z.infer<typeof manualApplicantSchema>;

// Helper function to safely convert Firebase Timestamp to Date
const convertTimestampToDate = (timestamp: any) => {
  if (timestamp instanceof Timestamp) {
    return timestamp.toDate();
  }
  if (timestamp?.toDate) {
    return timestamp.toDate();
  }
  return new Date();
};

// Helper to map status for display
const getDisplayStatus = (status: string) => {
  if (status === "Filled") return "Completed";
  return status;
};

// Helper to check if status is completed (including 'Filled')
const isCompletedStatus = (status: string) =>
  status === "Completed" || status === "Filled";

export default function AdminJobDetail() {
  const router = useRouter();
  const params = useParams();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [jobData, setJobData] = useState<JobData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isApproving, setIsApproving] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isAddingApplicant, setIsAddingApplicant] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState<
    JobData["applicants"][0] | null
  >(null);
  const [isHiring, setIsHiring] = useState(false);
  const [isRemovingHire, setIsRemovingHire] = useState(false);
  const [isMarkingWorkFinished, setIsMarkingWorkFinished] = useState(false);
  const [isMarkingPaymentReceived, setIsMarkingPaymentReceived] =
    useState(false);
  useState(false);
  const [isCheckingPayment, setIsCheckingPayment] = useState(false);
  const [selectedApplicant, setSelectedApplicant] = useState<
    JobData["applicants"][0] | null
  >(null);
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [distributedPayments, setDistributedPayments] = useState<string[]>([]);
  const [isUndoing, setIsUndoing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeactivating, setIsDeactivating] = useState(false);

  const form = useForm<ManualApplicantFormValues>({
    resolver: zodResolver(manualApplicantSchema),
    defaultValues: {
      name: "",
      phone: "",
    },
  });

  useEffect(() => {
    const fetchJobData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch job data using the id from params
        const jobDoc = await getDoc(doc(db, "jobs", params.id as string));
        if (!jobDoc.exists()) {
          throw new Error("Job not found");
        }

        const job = jobDoc.data();

        // Fetch employer data if available
        let employer = null;
        if (job.employerId) {
          const employerDoc = await getDoc(doc(db, "users", job.employerId));
          if (employerDoc.exists()) {
            employer = employerDoc.data();
          }
        }

        // Fetch applicants data
        const applicantsQuery = query(
          collection(db, "applications"),
          where("jobId", "==", params.id as string)
        );
        const applicantsSnapshot = await getDocs(applicantsQuery);
        const applicants = await Promise.all(
          applicantsSnapshot.docs.map(
            async (applicantDoc: QueryDocumentSnapshot<DocumentData>) => {
              const data = applicantDoc.data();
              // For manual applicants, use the name directly from the application
              if (data.isManual) {
                return {
                  id: applicantDoc.id,
                  name: data.name,
                  email: data.email || "",
                  appliedDate: data.createdAt
                    ? format(
                        convertTimestampToDate(data.createdAt),
                        "MMM d, yyyy"
                      )
                    : "N/A",
                  status: data.status || "Applied",
                  avatar: "/placeholder.svg?height=32&width=32",
                };
              }
              // For regular applicants, fetch user data
              const userDocRef = doc(db, "users", data.userId);
              const userDoc = await getDoc(userDocRef);
              const userData = userDoc.exists()
                ? (userDoc.data() as UserData)
                : null;
              return {
                id: applicantDoc.id,
                userId: data.userId, // Include the userId from the application
                name:
                  userData?.firstName && userData?.lastName
                    ? `${userData.firstName} ${userData.lastName}`
                    : userData?.displayName || "Unknown",
                email: userData?.email || "",
                appliedDate: data.createdAt
                  ? format(
                      convertTimestampToDate(data.createdAt),
                      "MMM d, yyyy"
                    )
                  : "N/A",
                status: data.status || "Applied",
                avatar:
                  userData?.photoURL || "/placeholder.svg?height=32&width=32",
                phone: data.phone || "",
              };
            }
          )
        );

        // Transform the data to match the existing structure
        const transformedData = {
          id: jobDoc.id,
          title: job.title || "",
          company: job.company || "",
          companyLogo: job.companyLogo || "/placeholder.svg?height=40&width=40",
          location: job.location?.address || "Remote",
          type: job.type || "Part-time",
          category: job.category || "",
          postedDate: job.createdAt
            ? format(convertTimestampToDate(job.createdAt), "MMM d, yyyy")
            : "N/A",
          expiryDate: job.expiryDate
            ? format(convertTimestampToDate(job.expiryDate), "MMM d, yyyy")
            : "N/A",
          status: job.status || "Active",
          featured: job.featured || false,
          urgent: job.urgent || false,
          rate: job.salaryAmount
            ? `₹${job.salaryAmount}/${job.salaryType}`
            : "Not specified",
          duration: job.duration || "Not specified",
          applications: applicants.length,
          views: job.views || 0,
          description: job.description || "",
          requirements: job.requirements || [],
          benefits: job.benefits || [],
          employer: employer
            ? {
                id: employer.uid,
                name:
                  employer.firstName && employer.lastName
                    ? `${employer.firstName} ${employer.lastName}`
                    : employer.displayName || "Unknown",
                email: employer.email || "",
                phone: employer.phone || "",
                avatar:
                  employer.photoURL || "/placeholder.svg?height=40&width=40",
              }
            : null,
          applicants,
          timeline: job.timeline || [],
          flowStatus: job.flowStatus || "draft",
          flowProgress: job.flowProgress || 0,
          positionsNeeded: job.positionsNeeded || 1,
          positionsFilled: job.positionsFilled || 0,
          gender: job.gender || undefined,
          minAge: job.minAge || undefined,
          maxAge: job.maxAge || undefined,
          hours: job.hours || undefined,
          payType: job.payType || undefined,
          applicationInstructions: job.applicationInstructions || undefined,
          skills: job.skills || undefined,
          audioDescription: job.audioDescription || undefined,
        };

        setJobData(transformedData);
      } catch (err) {
        console.error("Error fetching job data:", err);
        setError(
          err instanceof Error ? err.message : "Failed to load job data"
        );
        toast.error("Failed to load job data");
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchJobData();
    }
  }, [params.id]); // Use params.id in the dependency array

  const handleApproveDraft = async () => {
    try {
      setIsApproving(true);
      const jobRef = doc(db, "jobs", params.id as string);
      await updateDoc(jobRef, {
        status: "Pending",
        updatedAt: new Date(),
      });

      // Update local state
      setJobData((prev) =>
        prev
          ? {
              ...prev,
              status: "Pending",
            }
          : null
      );

      toast.success("Job draft approved successfully");
    } catch (error) {
      console.error("Error approving draft:", error);
      toast.error("Failed to approve draft");
    } finally {
      setIsApproving(false);
    }
  };

  const handlePostJob = async () => {
    try {
      setIsPosting(true);
      const jobRef = doc(db, "jobs", params.id as string);
      await updateDoc(jobRef, {
        status: "Active",
        updatedAt: new Date(),
        publishedAt: new Date(),
      });

      // Update local state
      setJobData((prev) =>
        prev
          ? {
              ...prev,
              status: "Active",
            }
          : null
      );

      toast.success("Job posted successfully");
    } catch (error) {
      console.error("Error posting job:", error);
      toast.error("Failed to post job");
    } finally {
      setIsPosting(false);
    }
  };

  const handleAddManualApplicant = async (data: ManualApplicantFormValues) => {
    try {
      setIsAddingApplicant(true);

      // Add applicant to applications collection
      const applicationRef = await addDoc(collection(db, "applications"), {
        jobId: params.id,
        userId: "manual", // Special identifier for manually added applicants
        name: data.name,
        phone: data.phone,
        status: "Applied",
        createdAt: new Date(),
        isManual: true,
      });

      // Update local state
      setJobData((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          applicants: [
            ...prev.applicants,
            {
              id: applicationRef.id,
              name: data.name,
              email: "", // Empty email for manual applicants
              appliedDate: format(new Date(), "MMM d, yyyy"),
              status: "Applied",
              avatar: "/placeholder.svg?height=32&width=32",
            },
          ],
        };
      });

      toast.success("Applicant added successfully");
      setIsDialogOpen(false);
      form.reset();
    } catch (error) {
      console.error("Error adding manual applicant:", error);
      toast.error("Failed to add applicant");
    } finally {
      setIsAddingApplicant(false);
    }
  };

  const handleHireApplicant = async (applicantId: string) => {
    try {
      setIsHiring(true);

      // Update application status
      const applicationRef = doc(db, "applications", applicantId);
      await updateDoc(applicationRef, {
        status: "Hired",
        updatedAt: new Date(),
      });

      // Update job status and positions filled
      const jobRef = doc(db, "jobs", params.id as string);
      const newPositionsFilled = (jobData?.positionsFilled || 0) + 1;
      const isFilled = newPositionsFilled >= (jobData?.positionsNeeded || 1);

      await updateDoc(jobRef, {
        status: isFilled ? "Filled" : "Active",
        positionsFilled: newPositionsFilled,
        updatedAt: new Date(),
      });

      // Update local state
      setJobData((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          status: isFilled ? "Filled" : "Active",
          positionsFilled: newPositionsFilled,
          applicants: prev.applicants.map((applicant) =>
            applicant.id === applicantId
              ? { ...applicant, status: "Hired" }
              : applicant
          ),
        };
      });

      toast.success("Applicant hired successfully");
    } catch (error) {
      console.error("Error hiring applicant:", error);
      toast.error("Failed to hire applicant");
    } finally {
      setIsHiring(false);
    }
  };

  const handleRemoveHire = async (applicantId: string) => {
    try {
      setIsRemovingHire(true);

      // Update application status
      const applicationRef = doc(db, "applications", applicantId);
      await updateDoc(applicationRef, {
        status: "Applied",
        updatedAt: new Date(),
      });

      // Update job status and positions filled
      const jobRef = doc(db, "jobs", params.id as string);
      const newPositionsFilled = Math.max(
        0,
        (jobData?.positionsFilled || 0) - 1
      );

      await updateDoc(jobRef, {
        status: newPositionsFilled === 0 ? "Active" : "Filling",
        positionsFilled: newPositionsFilled,
        updatedAt: new Date(),
      });

      // Update local state
      setJobData((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          status: newPositionsFilled === 0 ? "Active" : "Filling",
          positionsFilled: newPositionsFilled,
          applicants: prev.applicants.map((applicant) =>
            applicant.id === applicantId
              ? { ...applicant, status: "Applied" }
              : applicant
          ),
        };
      });

      toast.success("Hiring status removed successfully");
    } catch (error) {
      console.error("Error removing hire status:", error);
      toast.error("Failed to remove hire status");
    } finally {
      setIsRemovingHire(false);
    }
  };

  const handleMarkWorkFinished = async () => {
    try {
      setIsMarkingWorkFinished(true);
      const jobRef = doc(db, "jobs", params.id as string);
      await updateDoc(jobRef, {
        status: "Work Finished",
        updatedAt: new Date(),
      });

      // Update local state
      setJobData((prev) =>
        prev
          ? {
              ...prev,
              status: "Work Finished",
            }
          : null
      );

      toast.success("Job marked as work finished");
    } catch (error) {
      console.error("Error marking work as finished:", error);
      toast.error("Failed to mark work as finished");
    } finally {
      setIsMarkingWorkFinished(false);
    }
  };

  const handleMarkPaymentReceived = async () => {
    try {
      setIsMarkingPaymentReceived(true);
      const jobRef = doc(db, "jobs", params.id as string);
      await updateDoc(jobRef, {
        status: "Payment Received",
        updatedAt: new Date(),
      });

      // Update local state
      setJobData((prev) =>
        prev
          ? {
              ...prev,
              status: "Payment Received",
            }
          : null
      );

      toast.success("Payment marked as received");
    } catch (error) {
      console.error("Error marking payment as received:", error);
      toast.error("Failed to mark payment as received");
    } finally {
      setIsMarkingPaymentReceived(false);
    }
  };

  const handleCheckPaymentDistribution = (
    applicant: JobData["applicants"][0]
  ) => {
    setSelectedApplicant(applicant);
    setIsPaymentDialogOpen(true);
  };

  const handleMarkPaymentDistributed = async () => {
    if (!selectedApplicant) return;

    try {
      setIsCheckingPayment(true);

      // Add the applicant's ID to the distributed payments list
      const newDistributedPayments = [
        ...distributedPayments,
        selectedApplicant.id,
      ];
      setDistributedPayments(newDistributedPayments);

      // Check if all hired applicants have received payment
      const allHiredApplicants =
        jobData?.applicants.filter((a) => a.status === "Hired") || [];
      const allPaymentsDistributed = allHiredApplicants.every((a) =>
        newDistributedPayments.includes(a.id)
      );

      // Update job status if all payments are distributed
      if (allPaymentsDistributed) {
        const jobRef = doc(db, "jobs", params.id as string);
        await updateDoc(jobRef, {
          status: "Payment Distributed",
          updatedAt: new Date(),
        });

        // Update local state
        setJobData((prev) =>
          prev
            ? {
                ...prev,
                status: "Payment Distributed",
              }
            : null
        );
      }

      toast.success("Payment marked as distributed");
      setIsPaymentDialogOpen(false);
    } catch (error) {
      console.error("Error marking payment as distributed:", error);
      toast.error("Failed to mark payment as distributed");
    } finally {
      setIsCheckingPayment(false);
    }
  };

  const handleUndoStatus = async () => {
    if (!jobData) return;

    try {
      setIsUndoing(true);
      const jobRef = doc(db, "jobs", params.id as string);

      // Determine the previous status based on current status
      let previousStatus = "Draft";
      switch (jobData.status) {
        case "Pending":
          previousStatus = "Draft";
          break;
        case "Active":
          previousStatus = "Pending";
          break;
        case "Filling":
          previousStatus = "Active";
          break;
        case "Filled":
          previousStatus = "Filling";
          break;
        case "Completed":
          previousStatus = "Filled";
          break;
        case "Deactivated":
          previousStatus = "Active";
          break;
        default:
          previousStatus = "Draft";
      }

      await updateDoc(jobRef, {
        status: previousStatus,
        updatedAt: new Date(),
      });

      // Update local state
      setJobData((prev) =>
        prev
          ? {
              ...prev,
              status: previousStatus,
            }
          : null
      );

      toast.success("Status reverted successfully");
    } catch (error) {
      console.error("Error reverting status:", error);
      toast.error("Failed to revert status");
    } finally {
      setIsUndoing(false);
    }
  };

  const handleDeleteJob = async () => {
    if (!jobData) return;

    try {
      setIsDeleting(true);
      const response = await fetch("/api/admin/jobs", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id: jobData.id }),
      });

      if (!response.ok) {
        throw new Error("Failed to delete job");
      }

      toast.success("Job deleted successfully");
      router.push("/admin/jobs");
    } catch (error) {
      console.error("Error deleting job:", error);
      toast.error("Failed to delete job");
    } finally {
      setIsDeleting(false);
      setIsDeleteDialogOpen(false);
    }
  };

  const handleDeactivateJob = async () => {
    if (!jobData) return;

    try {
      setIsDeactivating(true);
      const response = await fetch("/api/admin/jobs", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: jobData.id,
          action:
            jobData.status.toLowerCase() === "active"
              ? "deactivate"
              : "activate",
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update job status");
      }

      const result = await response.json();

      // Update local state
      setJobData((prev) =>
        prev
          ? {
              ...prev,
              status:
                prev.status.toLowerCase() === "active"
                  ? "Deactivated"
                  : "Active",
            }
          : null
      );

      toast.success(
        result.message ||
          `Job ${
            jobData.status.toLowerCase() === "active"
              ? "deactivated"
              : "activated"
          } successfully`
      );
    } catch (error) {
      console.error("Error updating job status:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to update job status"
      );
    } finally {
      setIsDeactivating(false);
    }
  };

  // Function to get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case "draft":
        return "bg-muted";
      case "pending-approval":
        return "bg-yellow-500";
      case "active":
        return "bg-green-500";
      case "filling":
        return "bg-blue-500";
      case "completed":
        return "bg-purple-500";
      case "payment-pending":
        return "bg-orange-500";
      case "payment-distributed":
        return "bg-green-500";
      default:
        return "bg-muted";
    }
  };

  // Add a new function to handle removing applications
  const handleRemoveApplicant = async (applicantId: string) => {
    try {
      // First confirm with the user
      if (
        !confirm(
          "Are you sure you want to remove this applicant? This action cannot be undone."
        )
      ) {
        return;
      }

      // Delete the application document from Firestore
      const applicationRef = doc(db, "applications", applicantId);
      await deleteDoc(applicationRef);

      // Update local state to remove the applicant
      setJobData((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          applicants: prev.applicants.filter((a) => a.id !== applicantId),
          applications: (prev.applications || 0) - 1,
        };
      });

      toast.success("Applicant removed successfully");
    } catch (error) {
      console.error("Error removing applicant:", error);
      toast.error("Failed to remove applicant");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex">
        <AdminSidebar
          isSidebarOpen={isSidebarOpen}
          setIsSidebarOpen={setIsSidebarOpen}
          activeLink="jobs"
          onLogout={() => router.push("/admin/login")}
        />
        <div className="flex-1 min-w-0 overflow-auto">
          <AdminHeader toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
          <main className="container mx-auto px-4 py-8">
            <div className="flex items-center justify-center h-[calc(100vh-200px)]">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Loading job details...</p>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (error || !jobData) {
    return (
      <div className="min-h-screen bg-background flex">
        <AdminSidebar
          isSidebarOpen={isSidebarOpen}
          setIsSidebarOpen={setIsSidebarOpen}
          activeLink="jobs"
          onLogout={() => router.push("/admin/login")}
        />
        <div className="flex-1 min-w-0 overflow-auto">
          <AdminHeader toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
          <main className="container mx-auto px-4 py-8">
            <div className="flex items-center justify-center h-[calc(100vh-200px)]">
              <div className="text-center">
                <p className="text-destructive mb-4">
                  {error || "Failed to load job data"}
                </p>
                <Button onClick={() => router.push("/admin/jobs")}>
                  Back to Jobs
                </Button>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  // Debug: log the current job status
  console.log("Job Status:", jobData.status);

  // Status order for flow chart
  const statusOrder = [
    "Draft",
    "Pending",
    "Active",
    "Filling",
    "Completed",
    "Work Finished",
    "Payment Pending",
    "Payment Distributed",
    // Add any aliases if needed
  ];
  // Map 'Filled' to 'Completed' for index logic
  const normalizedStatus = jobData.status === "Filled" ? "Completed" : jobData.status;
  const currentStatusIndex = statusOrder.indexOf(normalizedStatus);

  return (
    <div className="min-h-screen bg-background flex">
      <AdminSidebar
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
        activeLink="jobs"
        onLogout={() => router.push("/admin/login")}
      />
      <div className="flex-1 min-w-0 overflow-auto">
        <AdminHeader toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
        <main className="container mx-auto px-4 py-8">
          <div className="flex items-center gap-2 mb-6">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/admin/jobs">
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>
            <h1 className="text-xl font-bold">Job Details</h1>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Job Info Card */}
            <Card className="lg:col-span-1">
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="h-10 w-10 rounded-md bg-primary/10 flex items-center justify-center">
                    <Briefcase className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>{jobData.title}</CardTitle>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Badge
                    variant={
                      jobData.status === "Active" ? "default" : "outline"
                    }
                  >
                    {getDisplayStatus(jobData.status)}
                  </Badge>
                  {jobData.status === "Deactivated" && (
                    <Badge variant="destructive">Deactivated</Badge>
                  )}
                  {jobData.featured && (
                    <Badge variant="secondary">Featured</Badge>
                  )}
                  {jobData.urgent && (
                    <Badge variant="destructive">Urgent</Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <Avatar className="h-6 w-6">
                    <AvatarImage
                      src={jobData.companyLogo}
                      alt={jobData.company}
                    />
                    <AvatarFallback>{jobData.company.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <span>{jobData.company}</span>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>{jobData.location}</span>
                </div>
                <div className="flex items-center gap-3">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  <span>{jobData.rate}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>{jobData.duration}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>Posted: {jobData.postedDate}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>Expires: {jobData.expiryDate}</span>
                </div>

                <Separator />

                {/* Detailed Job Information */}
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium mb-2">Job Details</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Job Type</p>
                        <p className="font-medium">{jobData.type}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Category</p>
                        <p className="font-medium">{jobData.category}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">
                          Positions Needed
                        </p>
                        <p className="font-medium">{jobData.positionsNeeded}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">
                          Positions Filled
                        </p>
                        <p className="font-medium">{jobData.positionsFilled}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">
                          Gender Preference
                        </p>
                        <p className="font-medium">
                          {jobData.gender || "No preference"}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Age Range</p>
                        <p className="font-medium">
                          {jobData.minAge && jobData.maxAge
                            ? `${jobData.minAge} - ${jobData.maxAge} years`
                            : "No age restriction"}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Work Hours</p>
                        <p className="font-medium">
                          {jobData.hours || "Not specified"}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Pay Type</p>
                        <p className="font-medium">
                          {jobData.payType || "Not specified"}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-medium mb-2">Job Description</h3>
                    <p className="text-sm text-muted-foreground whitespace-pre-line">
                      {jobData.description}
                    </p>
                  </div>

                  {/* Voice Description Section */}
                  {jobData.audioDescription && (
                    <div className="space-y-4">
                      <h3 className="font-medium mb-2">Voice Description</h3>
                      <div className="flex items-center gap-3">
                        <div className="w-full bg-muted/30 p-4 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <Mic className="h-4 w-4 text-primary" />
                              <span className="text-sm font-medium">
                                Voice Recording
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => {
                                  const audio = document.querySelector(
                                    "audio"
                                  ) as HTMLAudioElement;
                                  if (audio) {
                                    audio.paused ? audio.play() : audio.pause();
                                  }
                                }}
                              >
                                <Play className="h-4 w-4" />
                              </Button>
                              <a
                                href={jobData.audioDescription.url}
                                download
                                className="text-muted-foreground hover:text-primary"
                              >
                                <Download className="h-4 w-4" />
                              </a>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <audio
                              controls
                              className="flex-1 h-10 [&::-webkit-media-controls-panel]:bg-muted/50 [&::-webkit-media-controls-current-time-display]:text-xs [&::-webkit-media-controls-time-remaining-display]:text-xs"
                              onError={(e) => {
                                const audioElement =
                                  e.target as HTMLAudioElement;
                                const errorContainer =
                                  audioElement.parentElement?.querySelector(
                                    ".audio-error"
                                  );
                                if (errorContainer) {
                                  errorContainer.textContent =
                                    "Failed to load audio. Please try again later.";
                                }
                              }}
                            >
                              <source
                                src={jobData.audioDescription.url}
                                type="audio/webm"
                              />
                              Your browser does not support the audio element.
                            </audio>
                          </div>
                          <div className="flex items-center justify-between mt-2">
                            <div className="text-xs text-muted-foreground">
                              Duration: {jobData.audioDescription.duration}{" "}
                              seconds
                            </div>
                            <div className="audio-error text-xs text-destructive"></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  <Separator />

                  <div>
                    <h3 className="font-medium mb-2">Requirements</h3>
                    <ul className="text-sm text-muted-foreground space-y-1 list-disc pl-5">
                      {jobData.requirements.map(
                        (req: string, index: number) => (
                          <li key={index}>{req}</li>
                        )
                      )}
                    </ul>
                  </div>

                  <div>
                    <h3 className="font-medium mb-2">Benefits</h3>
                    <ul className="text-sm text-muted-foreground space-y-1 list-disc pl-5">
                      {jobData.benefits.map(
                        (benefit: string, index: number) => (
                          <li key={index}>{benefit}</li>
                        )
                      )}
                    </ul>
                  </div>

                  <div>
                    <h3 className="font-medium mb-2">
                      Application Instructions
                    </h3>
                    <p className="text-sm text-muted-foreground whitespace-pre-line">
                      {jobData.applicationInstructions}
                    </p>
                  </div>

                  <div>
                    <h3 className="font-medium mb-2">Skills Required</h3>
                    <div className="flex flex-wrap gap-2">
                      {jobData.skills &&
                        (typeof jobData.skills === "string"
                          ? jobData.skills
                              .split(",")
                              .map((skill: string, index: number) => (
                                <Badge key={index} variant="secondary">
                                  {skill.trim()}
                                </Badge>
                              ))
                          : Array.isArray(jobData.skills)
                          ? jobData.skills.map(
                              (skill: string, index: number) => (
                                <Badge key={index} variant="secondary">
                                  {skill.trim()}
                                </Badge>
                              )
                            )
                          : null)}
                    </div>
                  </div>
                </div>

                <Separator />

                {jobData.employer && (
                  <div className="space-y-4">
                    <h3 className="font-medium mb-2">Employer</h3>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage
                          src={jobData.employer.avatar}
                          alt={jobData.employer.name}
                        />
                        <AvatarFallback>
                          {jobData.employer.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">
                          {jobData.employer.name}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {jobData.employer.email}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex justify-between">
                <Link href={`/jobs/${jobData.id}`}>
                  <Button variant="outline" className="flex items-center gap-2">
                    <Eye className="h-4 w-4" />
                    View Public Listing
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  className="flex items-center gap-2"
                  onClick={() => router.push(`/admin/jobs/edit/${jobData.id}`)}
                >
                  <Edit className="h-4 w-4" />
                  Edit Job
                </Button>
              </CardFooter>
            </Card>

            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Job Status Flow Chart */}
              <Card>
                <CardHeader>
                  <CardTitle>Job Status</CardTitle>
                  <CardDescription>
                    Current status and progress of this job posting
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {/* Flow Chart */}
                  <div className="relative py-6">
                    <div className="absolute left-0 right-0 top-1/2 h-0.5 bg-muted -translate-y-1/2" />
                    <div className="relative flex justify-between">
                      {/* Draft */}
                      <div className="flex flex-col items-center">
                        <div className="relative">
                          <div
                            className={`z-10 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                              currentStatusIndex === 0
                                ? "bg-primary text-primary-foreground scale-110 shadow-lg ring-4 ring-primary/20"
                                : currentStatusIndex > 0
                                ? "bg-green-500 text-white"
                                : "bg-muted text-muted-foreground"
                            }`}
                          >
                            {currentStatusIndex > 0 ? (
                              <CheckCircle className="h-5 w-5" />
                            ) : (
                              <FileText className="h-5 w-5" />
                            )}
                          </div>
                        </div>
                        <span
                          className={`text-xs mt-2 font-medium ${
                            currentStatusIndex === 0 ? "text-primary" : "text-muted-foreground"
                          }`}
                        >
                          Draft
                        </span>
                      </div>

                      {/* Pending Approval */}
                      <div className="flex flex-col items-center">
                        <div className="relative">
                          <div
                            className={`z-10 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                              currentStatusIndex === 1
                                ? "bg-primary text-primary-foreground scale-110 shadow-lg ring-4 ring-primary/20"
                                : currentStatusIndex > 1
                                ? "bg-green-500 text-white"
                                : "bg-muted text-muted-foreground"
                            }`}
                          >
                            {currentStatusIndex > 1 ? (
                              <CheckCircle className="h-5 w-5" />
                            ) : (
                              <Shield className="h-5 w-5" />
                            )}
                          </div>
                        </div>
                        <span
                          className={`text-xs mt-2 font-medium ${
                            currentStatusIndex === 1 ? "text-primary" : "text-muted-foreground"
                          }`}
                        >
                          Pending Approval
                        </span>
                      </div>

                      {/* Active */}
                      <div className="flex flex-col items-center">
                        <div className="relative">
                          <div
                            className={`z-10 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                              currentStatusIndex === 2
                                ? "bg-primary text-primary-foreground scale-110 shadow-lg ring-4 ring-primary/20"
                                : currentStatusIndex > 2
                                ? "bg-green-500 text-white"
                                : "bg-muted text-muted-foreground"
                            }`}
                          >
                            {currentStatusIndex > 2 ? (
                              <CheckCircle className="h-5 w-5" />
                            ) : (
                              <CheckCircle className="h-5 w-5" />
                            )}
                          </div>
                        </div>
                        <span
                          className={`text-xs mt-2 font-medium ${
                            currentStatusIndex === 2 ? "text-primary" : "text-muted-foreground"
                          }`}
                        >
                          Active
                        </span>
                      </div>

                      {/* Filling */}
                      <div className="flex flex-col items-center">
                        <div className="relative">
                          <div
                            className={`z-10 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                              currentStatusIndex === 3
                                ? "bg-primary text-primary-foreground scale-110 shadow-lg ring-4 ring-primary/20"
                                : currentStatusIndex > 3
                                ? "bg-green-500 text-white"
                                : "bg-muted text-muted-foreground"
                            }`}
                          >
                            {currentStatusIndex > 3 ? (
                              <CheckCircle className="h-5 w-5" />
                            ) : (
                              <Users className="h-5 w-5" />
                            )}
                          </div>
                          {(jobData.status === "Filling" ||
                            jobData.status === "Completed") && (
                            <div className="absolute -bottom-1 -right-1 bg-primary text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                              {jobData.positionsFilled}/
                              {jobData.positionsNeeded}
                            </div>
                          )}
                        </div>
                        <span
                          className={`text-xs mt-2 font-medium ${
                            currentStatusIndex === 3 ? "text-primary" : "text-muted-foreground"
                          }`}
                        >
                          Filling
                        </span>
                      </div>

                      {/* Completed */}
                      <div className="flex flex-col items-center">
                        <div className="relative">
                          <div
                            className={`z-10 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                              currentStatusIndex === 4
                                ? "bg-primary text-primary-foreground scale-110 shadow-lg ring-4 ring-primary/20"
                                : currentStatusIndex > 4
                                ? "bg-green-500 text-white"
                                : "bg-muted text-muted-foreground"
                            }`}
                          >
                            {currentStatusIndex > 4 ? (
                              <CheckCircle className="h-5 w-5" />
                            ) : (
                              <Briefcase className="h-5 w-5" />
                            )}
                          </div>
                        </div>
                        <span
                          className={`text-xs mt-2 font-medium ${
                            currentStatusIndex === 4 ? "text-primary" : "text-muted-foreground"
                          }`}
                        >
                          Completed
                        </span>
                      </div>

                      {/* Work Finished */}
                      <div className="flex flex-col items-center">
                        <div className="relative">
                          <div
                            className={`z-10 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                              currentStatusIndex === 5
                                ? "bg-primary text-primary-foreground scale-110 shadow-lg ring-4 ring-primary/20"
                                : currentStatusIndex > 5
                                ? "bg-green-500 text-white"
                                : "bg-muted text-muted-foreground"
                            }`}
                          >
                            {currentStatusIndex > 5 ? (
                              <CheckCircle className="h-5 w-5" />
                            ) : (
                              <CheckCircle className="h-5 w-5" />
                            )}
                          </div>
                        </div>
                        <span
                          className={`text-xs mt-2 font-medium ${
                            currentStatusIndex === 5 ? "text-primary" : "text-muted-foreground"
                          }`}
                        >
                          Work Finished
                        </span>
                      </div>

                      {/* Payment Pending */}
                      <div className="flex flex-col items-center">
                        <div className="relative">
                          <div
                            className={`z-10 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                              currentStatusIndex === 6
                                ? "bg-primary text-primary-foreground scale-110 shadow-lg ring-4 ring-primary/20"
                                : currentStatusIndex > 6
                                ? "bg-green-500 text-white"
                                : "bg-muted text-muted-foreground"
                            }`}
                          >
                            {currentStatusIndex > 6 ? (
                              <CheckCircle className="h-5 w-5" />
                            ) : (
                              <DollarSign className="h-5 w-5" />
                            )}
                          </div>
                        </div>
                        <span
                          className={`text-xs mt-2 font-medium ${
                            currentStatusIndex === 6 ? "text-primary" : "text-muted-foreground"
                          }`}
                        >
                          Payment Pending
                        </span>
                      </div>

                      {/* Payment Distributed */}
                      <div className="flex flex-col items-center">
                        <div className="relative">
                          <div
                            className={`z-10 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                              currentStatusIndex === 7
                                ? "bg-primary text-primary-foreground scale-110 shadow-lg ring-4 ring-primary/20"
                                : "bg-muted text-muted-foreground"
                            }`}
                          >
                            <Wallet className="h-5 w-5" />
                          </div>
                        </div>
                        <span
                          className={`text-xs mt-2 font-medium ${
                            currentStatusIndex === 7 ? "text-primary" : "text-muted-foreground"
                          }`}
                        >
                          Payment Distributed
                        </span>
                      </div>
                    </div>

                    {/* Progress Connections */}
                    <div className="absolute left-0 right-0 top-1/2 h-0.5 -translate-y-1/2">
                      <div
                        className={`h-full bg-primary transition-all duration-300`}
                        style={{
                          width: `${(() => {
                            const states = [
                              "Draft",
                              "Pending",
                              "Active",
                              "Filling",
                              "Completed",
                              "Work Finished",
                              "Payment Pending",
                              "Payment Distributed",
                            ];
                            const currentIndex = states.indexOf(jobData.status);
                            // Calculate the width based on the number of completed steps
                            return (currentIndex / (states.length - 1)) * 100;
                          })()}%`,
                        }}
                      />
                    </div>
                  </div>

                  {/* Status Details */}
                  <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-4">
                      <div
                        className={`flex items-center gap-3 p-3 rounded-lg transition-all duration-300 ${
                          currentStatusIndex === 0 ? "bg-primary/10" : ""
                        }`}
                      >
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <FileText className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <h4 className="font-medium">Draft</h4>
                          <p className="text-sm text-muted-foreground">
                            Job is being created and edited
                          </p>
                        </div>
                      </div>
                      <div
                        className={`flex items-center gap-3 p-3 rounded-lg transition-all duration-300 ${
                          currentStatusIndex === 1 ? "bg-primary/10" : ""
                        }`}
                      >
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <Shield className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <h4 className="font-medium">Pending Approval</h4>
                          <p className="text-sm text-muted-foreground">
                            Waiting for admin review
                          </p>
                        </div>
                      </div>
                      <div
                        className={`flex items-center gap-3 p-3 rounded-lg transition-all duration-300 ${
                          currentStatusIndex === 2 ? "bg-primary/10" : ""
                        }`}
                      >
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <CheckCircle className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <h4 className="font-medium">Active</h4>
                          <p className="text-sm text-muted-foreground">
                            Job is live and accepting applications
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div
                        className={`flex items-center gap-3 p-3 rounded-lg transition-all duration-300 ${
                          currentStatusIndex === 3 ? "bg-primary/10" : ""
                        }`}
                      >
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <Users className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <h4 className="font-medium">Filling</h4>
                          <p className="text-sm text-muted-foreground">
                            Candidates are being selected (
                            {jobData.positionsFilled}/{jobData.positionsNeeded}{" "}
                            positions filled)
                          </p>
                        </div>
                      </div>
                      <div
                        className={`flex items-center gap-3 p-3 rounded-lg transition-all duration-300 ${
                          currentStatusIndex === 4 ? "bg-primary/10" : ""
                        }`}
                      >
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <Briefcase className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <h4 className="font-medium">Completed</h4>
                          <p className="text-sm text-muted-foreground">
                            Job has been filled
                          </p>
                        </div>
                      </div>
                      <div
                        className={`flex items-center gap-3 p-3 rounded-lg transition-all duration-300 ${
                          currentStatusIndex === 5 ? "bg-primary/10" : ""
                        }`}
                      >
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <CheckCircle className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <h4 className="font-medium">Work Finished</h4>
                          <p className="text-sm text-muted-foreground">
                            All work has been completed by the hired candidates
                          </p>
                        </div>
                      </div>
                      <div
                        className={`flex items-center gap-3 p-3 rounded-lg transition-all duration-300 ${
                          currentStatusIndex === 6 ? "bg-primary/10" : ""
                        }`}
                      >
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <DollarSign className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <h4 className="font-medium">Payment</h4>
                          <p className="text-sm text-muted-foreground">
                            Payment from owner and distribution
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Tabs for different sections */}
              <Tabs defaultValue="applicants">
                <TabsList className="grid grid-cols-2 mb-4">
                  <TabsTrigger value="applicants">Applicants</TabsTrigger>
                  <TabsTrigger value="timeline">Timeline</TabsTrigger>
                </TabsList>

                {/* Applicants Tab */}
                <TabsContent value="applicants" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Applicants</CardTitle>
                      <CardDescription>
                        People who have applied for this job
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex justify-end mb-4">
                        <Dialog
                          open={isDialogOpen}
                          onOpenChange={setIsDialogOpen}
                        >
                          <DialogTrigger asChild>
                            <Button>
                              <User className="mr-2 h-4 w-4" />
                              Add Manual Applicant
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Add Manual Applicant</DialogTitle>
                              <DialogDescription>
                                Add an applicant manually to this job posting.
                              </DialogDescription>
                            </DialogHeader>
                            <Form {...form}>
                              <form
                                onSubmit={form.handleSubmit(
                                  handleAddManualApplicant
                                )}
                                className="space-y-4"
                              >
                                <FormField
                                  control={form.control}
                                  name="name"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Name</FormLabel>
                                      <FormControl>
                                        <Input
                                          placeholder="Enter applicant name"
                                          {...field}
                                        />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                                <FormField
                                  control={form.control}
                                  name="phone"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Phone Number</FormLabel>
                                      <FormControl>
                                        <Input
                                          placeholder="Enter phone number"
                                          {...field}
                                        />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                                <DialogFooter>
                                  <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setIsDialogOpen(false)}
                                  >
                                    Cancel
                                  </Button>
                                  <Button
                                    type="submit"
                                    disabled={isAddingApplicant}
                                  >
                                    {isAddingApplicant
                                      ? "Adding..."
                                      : "Add Applicant"}
                                  </Button>
                                </DialogFooter>
                              </form>
                            </Form>
                          </DialogContent>
                        </Dialog>
                      </div>
                      <div className="rounded-md border">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Applicant</TableHead>
                              <TableHead>Applied Date</TableHead>
                              <TableHead>Status</TableHead>
                              <TableHead className="text-right">
                                Actions
                              </TableHead>
                              <TableHead>Contact</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {jobData.applicants.map(
                              (applicant: JobData["applicants"][0]) => (
                                <TableRow key={applicant.id}>
                                  <TableCell>
                                    <div className="flex items-center gap-3">
                                      <Avatar className="h-8 w-8">
                                        <AvatarImage
                                          src={applicant.avatar}
                                          alt={applicant.name}
                                        />
                                        <AvatarFallback>
                                          {applicant.name.charAt(0)}
                                        </AvatarFallback>
                                      </Avatar>
                                      <div>
                                        <Link
                                          href={`/admin/users/${applicant.userId}`}
                                          className="font-medium hover:underline cursor-pointer"
                                          onClick={(e) => {
                                            if (
                                              !applicant.userId ||
                                              applicant.email.includes(
                                                "manual-"
                                              )
                                            ) {
                                              e.preventDefault();
                                              toast.info(
                                                "This applicant does not have a user profile"
                                              );
                                            }
                                          }}
                                        >
                                          {applicant.name}
                                        </Link>
                                        <div className="text-xs text-muted-foreground">
                                          {applicant.email}
                                        </div>
                                      </div>
                                    </div>
                                  </TableCell>
                                  <TableCell>{applicant.appliedDate}</TableCell>
                                  <TableCell>
                                    <div className="flex items-center gap-2">
                                      <Badge
                                        variant={
                                          applicant.status === "Hired"
                                            ? "default"
                                            : applicant.status === "Rejected"
                                            ? "destructive"
                                            : applicant.status === "Interviewed"
                                            ? "outline"
                                            : "secondary"
                                        }
                                      >
                                        {applicant.status}
                                      </Badge>
                                      {jobData.status ===
                                        "Payment Distributed" &&
                                        applicant.status === "Hired" && (
                                          <TooltipProvider>
                                            <Tooltip>
                                              <TooltipTrigger>
                                                <CheckCircle className="h-4 w-4 text-green-500" />
                                              </TooltipTrigger>
                                              <TooltipContent>
                                                <p>Payment distributed</p>
                                              </TooltipContent>
                                            </Tooltip>
                                          </TooltipProvider>
                                        )}
                                      {jobData.status === "Payment Pending" &&
                                        applicant.status === "Hired" && (
                                          <TooltipProvider>
                                            <Tooltip>
                                              <TooltipTrigger>
                                                <Clock className="h-4 w-4 text-yellow-500" />
                                              </TooltipTrigger>
                                              <TooltipContent>
                                                <p>Payment pending</p>
                                              </TooltipContent>
                                            </Tooltip>
                                          </TooltipProvider>
                                        )}
                                    </div>
                                  </TableCell>
                                  <TableCell className="text-right">
                                    <DropdownMenu>
                                      <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon">
                                          <MoreHorizontal className="h-4 w-4" />
                                          <span className="sr-only">
                                            Open menu
                                          </span>
                                        </Button>
                                      </DropdownMenuTrigger>
                                      <DropdownMenuContent align="end">
                                        <DropdownMenuLabel>
                                          Actions
                                        </DropdownMenuLabel>
                                        <DropdownMenuItem
                                          onClick={() => {
                                            // For manual applicants, we don't have a user profile to link to
                                            if (
                                              applicant.email.includes(
                                                "manual-"
                                              ) ||
                                              !applicant.userId
                                            ) {
                                              toast.info(
                                                "This applicant does not have a user profile"
                                              );
                                              return;
                                            }
                                            // Use the userId from the application data
                                            router.push(
                                              `/admin/users/${applicant.userId}`
                                            );
                                          }}
                                          className="cursor-pointer"
                                        >
                                          <User className="mr-2 h-4 w-4" />
                                          View Profile
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                          onClick={() =>
                                            setSelectedApplication(applicant)
                                          }
                                          className="cursor-pointer"
                                        >
                                          <FileText className="mr-2 h-4 w-4" />
                                          View Application
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                        {jobData.status ===
                                          "Payment Pending" && (
                                          <DropdownMenuItem
                                            onClick={() =>
                                              handleCheckPaymentDistribution(
                                                applicant
                                              )
                                            }
                                          >
                                            <Wallet className="mr-2 h-4 w-4" />
                                            Check Payment Distribution
                                          </DropdownMenuItem>
                                        )}
                                        {applicant.status === "Hired" ? (
                                          <DropdownMenuItem
                                            onClick={() =>
                                              handleRemoveHire(applicant.id)
                                            }
                                            disabled={isRemovingHire}
                                          >
                                            <Trash2 className="mr-2 h-4 w-4" />
                                            Remove Hire Status
                                          </DropdownMenuItem>
                                        ) : (
                                          <DropdownMenuItem
                                            onClick={() =>
                                              handleHireApplicant(applicant.id)
                                            }
                                            disabled={isHiring}
                                          >
                                            <CheckCircle className="mr-2 h-4 w-4" />
                                            Mark as Hired
                                          </DropdownMenuItem>
                                        )}
                                        <DropdownMenuItem
                                          className="text-destructive"
                                          onClick={() =>
                                            handleRemoveApplicant(applicant.id)
                                          }
                                        >
                                          <Trash2 className="mr-2 h-4 w-4" />
                                          Delete Application
                                        </DropdownMenuItem>
                                      </DropdownMenuContent>
                                    </DropdownMenu>
                                  </TableCell>
                                  <TableCell>
                                    {applicant.phone ? (
                                      <div className="flex gap-2">
                                        <a href={`tel:${applicant.phone}`} target="_blank" rel="noopener noreferrer">
                                          <Button variant="outline" size="sm">
                                            <Phone className="h-4 w-4 mr-1" />
                                            Call
                                          </Button>
                                        </a>
                                        <a href={`https://wa.me/${applicant.phone.replace(/[^\d]/g, "")}`} target="_blank" rel="noopener noreferrer">
                                          <Button variant="outline" size="sm" className="bg-green-100 text-green-700 hover:bg-green-200">
                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" fill="currentColor" className="h-4 w-4 mr-1"><path d="M16.003 3.2c-7.06 0-12.8 5.74-12.8 12.8 0 2.26.6 4.47 1.74 6.41L2.2 28.2l5.97-2.01c1.85 1.01 3.94 1.54 6.07 1.54h.01c7.06 0 12.8-5.74 12.8-12.8s-5.74-12.8-12.8-12.8zm0 23.2c-1.87 0-3.7-.48-5.3-1.39l-.38-.21-3.54 1.19 1.18-3.45-.25-.39c-1.09-1.7-1.67-3.67-1.67-5.7 0-5.79 4.71-10.5 10.5-10.5s10.5 4.71 10.5 10.5-4.71 10.5-10.5 10.5zm5.77-7.97c-.32-.16-1.89-.93-2.18-1.03-.29-.11-.5-.16-.71.16-.21.32-.82 1.03-1.01 1.24-.18.21-.37.24-.69.08-.32-.16-1.36-.5-2.59-1.59-.96-.85-1.61-1.89-1.8-2.21-.19-.32-.02-.49.14-.65.14-.14.32-.37.48-.55.16-.18.21-.32.32-.53.11-.21.05-.4-.03-.56-.08-.16-.71-1.71-.97-2.34-.26-.62-.53-.54-.71-.55-.18-.01-.39-.01-.6-.01-.21 0-.56.08-.85.4-.29.32-1.12 1.09-1.12 2.65 0 1.56 1.14 3.06 1.3 3.27.16.21 2.24 3.42 5.43 4.66.76.33 1.35.53 1.81.68.76.24 1.45.21 2 .13.61-.09 1.89-.77 2.16-1.52.27-.75.27-1.39.19-1.52-.08-.13-.29-.21-.61-.37z"/></svg>
                                            WhatsApp
                                          </Button>
                                        </a>
                                      </div>
                                    ) : (
                                      <span className="text-xs text-muted-foreground">No phone</span>
                                    )}
                                  </TableCell>
                                </TableRow>
                              )
                            )}
                          </TableBody>
                        </Table>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Timeline Tab */}
                <TabsContent value="timeline" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Job Timeline</CardTitle>
                      <CardDescription>
                        History and activity for this job posting
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="relative">
                        {/* Timeline line */}
                        <div className="absolute left-3 top-0 bottom-0 w-0.5 bg-muted" />

                        {/* Timeline items */}
                        <div className="space-y-6 relative">
                          {jobData.timeline.map(
                            (item: JobData["timeline"][0]) => (
                              <div key={item.id} className="flex items-start">
                                <div className="z-10 flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 border border-primary text-primary">
                                  {item.icon}
                                </div>
                                <div className="ml-4">
                                  <p className="text-sm font-medium">
                                    {item.action}
                                  </p>
                                  <p className="text-xs text-muted-foreground mt-1">
                                    {item.date} at {item.time}
                                  </p>
                                </div>
                              </div>
                            )
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>

              {/* Application Details Dialog */}
              <Dialog
                open={!!selectedApplication}
                onOpenChange={(open) => !open && setSelectedApplication(null)}
              >
                <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                  {selectedApplication && (
                    <>
                      <DialogHeader>
                        <DialogTitle>Application Details</DialogTitle>
                        <DialogDescription>
                          Application from {selectedApplication.name}
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-6 py-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <h3 className="text-sm font-medium text-muted-foreground mb-2">
                              Applicant
                            </h3>
                            <div className="flex items-center gap-3">
                              <Avatar className="h-10 w-10">
                                <AvatarImage
                                  src={selectedApplication.avatar}
                                  alt={selectedApplication.name}
                                />
                                <AvatarFallback>
                                  {selectedApplication.name.charAt(0)}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium">
                                  {selectedApplication.name}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  {selectedApplication.email}
                                </p>
                              </div>
                            </div>
                          </div>
                          <div>
                            <h3 className="text-sm font-medium text-muted-foreground mb-2">
                              Application Status
                            </h3>
                            <Badge
                              variant={
                                selectedApplication.status === "Hired"
                                  ? "default"
                                  : selectedApplication.status === "Rejected"
                                  ? "destructive"
                                  : "secondary"
                              }
                            >
                              {selectedApplication.status}
                            </Badge>
                          </div>
                          <div>
                            <h3 className="text-sm font-medium text-muted-foreground mb-2">
                              Applied On
                            </h3>
                            <p>{selectedApplication.appliedDate}</p>
                          </div>
                          <div>
                            <h3 className="text-sm font-medium text-muted-foreground mb-2">
                              Contact
                            </h3>
                            <p className="text-sm">
                              {selectedApplication.email}
                              {selectedApplication.phone &&
                                ` • ${selectedApplication.phone}`}
                            </p>
                          </div>
                        </div>

                        <div className="border-t pt-4">
                          <h3 className="text-sm font-medium text-muted-foreground mb-2">
                            Cover Letter
                          </h3>
                          <div className="bg-muted/50 p-4 rounded-md">
                            {selectedApplication.coverLetter ? (
                              <p className="whitespace-pre-line">
                                {selectedApplication.coverLetter}
                              </p>
                            ) : (
                              <p className="text-muted-foreground text-sm">
                                No cover letter provided
                              </p>
                            )}
                          </div>
                        </div>

                        {selectedApplication.resumeUrl && (
                          <div className="border-t pt-4">
                            <h3 className="text-sm font-medium text-muted-foreground mb-2">
                              Resume
                            </h3>
                            <a
                              href={selectedApplication.resumeUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center text-primary hover:underline"
                            >
                              <FileText className="h-4 w-4 mr-2" />
                              View Resume
                            </a>
                          </div>
                        )}
                      </div>

                      <div className="flex justify-end gap-2 pt-4 border-t">
                        {selectedApplication.status !== "Hired" ? (
                          <Button
                            onClick={() =>
                              handleHireApplicant(selectedApplication.id)
                            }
                            disabled={isHiring}
                            className="flex items-center gap-2"
                          >
                            <CheckCircle className="h-4 w-4" />
                            {isHiring ? "Marking as Hired..." : "Mark as Hired"}
                          </Button>
                        ) : (
                          <Button
                            onClick={() =>
                              handleRemoveHire(selectedApplication.id)
                            }
                            variant="outline"
                            disabled={isRemovingHire}
                            className="flex items-center gap-2"
                          >
                            <X className="h-4 w-4" />
                            {isRemovingHire
                              ? "Removing Hire..."
                              : "Remove Hire Status"}
                          </Button>
                        )}
                      </div>
                    </>
                  )}
                </DialogContent>
              </Dialog>

              {/* Admin Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Admin Actions</CardTitle>
                  <CardDescription>Manage this job posting</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-4">
                    {jobData.status === "Draft" && (
                      <Button
                        onClick={handleApproveDraft}
                        disabled={isApproving}
                        className="flex items-center gap-2"
                      >
                        <CheckCircle className="h-4 w-4" />
                        {isApproving ? "Approving..." : "Approve Draft"}
                      </Button>
                    )}
                    {jobData.status === "Pending" && (
                      <>
                        <Button
                          onClick={handlePostJob}
                          disabled={isPosting}
                          className="flex items-center gap-2"
                        >
                          <CheckCircle className="h-4 w-4" />
                          {isPosting ? "Posting..." : "Post Job"}
                        </Button>
                        <Button
                          onClick={handleUndoStatus}
                          disabled={isUndoing}
                          variant="outline"
                          className="flex items-center gap-2"
                        >
                          <ArrowLeft className="h-4 w-4" />
                          {isUndoing ? "Reverting..." : "Revert to Draft"}
                        </Button>
                      </>
                    )}
                    {jobData.status === "Active" && (
                      <Button
                        onClick={handleUndoStatus}
                        disabled={isUndoing}
                        variant="outline"
                        className="flex items-center gap-2"
                      >
                        <ArrowLeft className="h-4 w-4" />
                        {isUndoing
                          ? "Reverting..."
                          : "Revert to Pending Approval"}
                      </Button>
                    )}
                    {jobData.status === "Filling" && (
                      <Button
                        onClick={handleUndoStatus}
                        disabled={isUndoing}
                        variant="outline"
                        className="flex items-center gap-2"
                      >
                        <ArrowLeft className="h-4 w-4" />
                        {isUndoing ? "Reverting..." : "Revert to Active"}
                      </Button>
                    )}
                    {isCompletedStatus(jobData.status) && (
                      <Button
                        onClick={handleUndoStatus}
                        disabled={isUndoing}
                        variant="outline"
                        className="flex items-center gap-2"
                      >
                        <ArrowLeft className="h-4 w-4" />
                        {isUndoing ? "Reverting..." : "Revert to Filling"}
                      </Button>
                    )}
                    {jobData.status === "Work Finished" && (
                      <Button
                        onClick={handleUndoStatus}
                        disabled={isUndoing}
                        variant="outline"
                        className="flex items-center gap-2"
                      >
                        <ArrowLeft className="h-4 w-4" />
                        {isUndoing ? "Reverting..." : "Revert to Completed"}
                      </Button>
                    )}
                    {jobData.status === "Payment Pending" && (
                      <Button
                        onClick={handleUndoStatus}
                        disabled={isUndoing}
                        variant="outline"
                        className="flex items-center gap-2"
                      >
                        <ArrowLeft className="h-4 w-4" />
                        {isUndoing ? "Reverting..." : "Revert to Work Finished"}
                      </Button>
                    )}
                    {jobData.status === "Payment Distributed" && (
                      <Button
                        onClick={handleUndoStatus}
                        disabled={isUndoing}
                        variant="outline"
                        className="flex items-center gap-2"
                      >
                        <ArrowLeft className="h-4 w-4" />
                        {isUndoing
                          ? "Reverting..."
                          : "Revert to Payment Pending"}
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      className="flex items-center gap-2"
                      onClick={() =>
                        router.push(`/admin/jobs/edit/${jobData.id}`)
                      }
                    >
                      <Edit className="h-4 w-4" />
                      Edit Job
                    </Button>
                    <Button
                      variant="outline"
                      className={`flex items-center gap-2 ${
                        jobData.status === "Active"
                          ? "text-red-500 hover:text-red-500"
                          : ""
                      }`}
                      onClick={handleDeactivateJob}
                      disabled={isDeactivating}
                    >
                      <Shield className="h-4 w-4" />
                      {isDeactivating
                        ? "Updating..."
                        : jobData.status === "Active"
                        ? "Deactivate Job"
                        : "Activate Job"}
                    </Button>
                    {jobData.status !== "Completed" &&
                      jobData.positionsFilled < jobData.positionsNeeded && (
                        <Button
                          variant="outline"
                          className="flex items-center gap-2"
                        >
                          <CheckCircle className="h-4 w-4" />
                          Mark as Filled
                        </Button>
                      )}
                    {isCompletedStatus(jobData.status) && (
                      <Button
                        variant="outline"
                        className="flex items-center gap-2"
                        onClick={handleMarkWorkFinished}
                        disabled={isMarkingWorkFinished}
                      >
                        <CheckCircle className="h-4 w-4" />
                        {isMarkingWorkFinished
                          ? "Marking..."
                          : "Mark as Work Finished"}
                      </Button>
                    )}
                    {jobData.status === "Work Finished" && (
                      <Button
                        variant="outline"
                        className="flex items-center gap-2"
                        onClick={handleMarkPaymentReceived}
                        disabled={isMarkingPaymentReceived}
                      >
                        <DollarSign className="h-4 w-4" />
                        {isMarkingPaymentReceived
                          ? "Marking..."
                          : "Mark Payment Received"}
                      </Button>
                    )}
                    <Button
                      variant="destructive"
                      className="flex items-center gap-2"
                      onClick={() => setIsDeleteDialogOpen(true)}
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete Job
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Payment Distribution Dialog */}
          <Dialog
            open={isPaymentDialogOpen}
            onOpenChange={setIsPaymentDialogOpen}
          >
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Payment Distribution</DialogTitle>
                <DialogDescription>
                  Review and confirm payment distribution for{" "}
                  {selectedApplicant?.name}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage
                      src={selectedApplicant?.avatar}
                      alt={selectedApplicant?.name}
                    />
                    <AvatarFallback>
                      {selectedApplicant?.name?.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium">{selectedApplicant?.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {selectedApplicant?.email}
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">
                      Job Rate:
                    </span>
                    <span className="font-medium">{jobData.rate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">
                      Payment Status:
                    </span>
                    <Badge
                      variant="outline"
                      className="bg-yellow-100 text-yellow-800"
                    >
                      {distributedPayments.includes(selectedApplicant?.id || "")
                        ? "Distributed"
                        : "Pending Distribution"}
                    </Badge>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsPaymentDialogOpen(false)}
                >
                  Cancel
                </Button>
                {!distributedPayments.includes(selectedApplicant?.id || "") && (
                  <Button
                    onClick={handleMarkPaymentDistributed}
                    disabled={isCheckingPayment}
                  >
                    {isCheckingPayment
                      ? "Processing..."
                      : "Mark as Distributed"}
                  </Button>
                )}
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Delete Job Dialog */}
          <Dialog
            open={isDeleteDialogOpen}
            onOpenChange={setIsDeleteDialogOpen}
          >
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Delete Job</DialogTitle>
                <DialogDescription>
                  Are you sure you want to delete this job? This action cannot
                  be undone.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-md bg-primary/10 flex items-center justify-center">
                    <Briefcase className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <div className="font-medium">{jobData?.title}</div>
                    <div className="text-sm text-muted-foreground">
                      {jobData?.company}
                    </div>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsDeleteDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleDeleteJob}
                  disabled={isDeleting}
                >
                  {isDeleting ? "Deleting..." : "Delete Job"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </main>
      </div>
    </div>
  );
}
