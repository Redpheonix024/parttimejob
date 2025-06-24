"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Share2,
  ArrowLeft,
  Mic,
  Play,
  Download,
  CheckCircle,
  Bookmark,
  BookmarkCheck,
  MapPin,
  PartyPopper,
} from "lucide-react";
import {
  doc,
  getDoc,
  collection,
  addDoc,
  serverTimestamp,
  query,
  where,
  getDocs,
  writeBatch,
} from "firebase/firestore";
import { db } from "@/app/config/firebase";
import { auth } from "@/app/config/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { toast } from "sonner";
import MainLayout from "@/components/layout/main-layout";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";

// Public page - no authentication required
export default function JobDetails() {
  const params = useParams();
  const router = useRouter();
  const jobId = params.id as string;

  const [job, setJob] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isApplying, setIsApplying] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [hasApplied, setHasApplied] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [applicationForm, setApplicationForm] = useState({
    name: "",
    email: "",
    phone: "",
    coverLetter: "",
    termsAccepted: false,
    status: "",
  });
  const [isRemoveDialogOpen, setIsRemoveDialogOpen] = useState(false);

  // Check authentication status
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);

      if (user) {
        try {
          // Fetch user profile from Firestore
          const userDoc = await getDoc(doc(db, "users", user.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            console.log("User profile data:", userData);
            setUserProfile(userData);

            // Create name from user data, avoiding any hardcoded values
            let fullName = "";

            // Only use firstName and lastName if both exist
            if (userData.firstName && userData.lastName) {
              fullName = `${userData.firstName} ${userData.lastName}`.trim();
            }
            // Fallback to display name from userData or user object
            else if (userData.displayName) {
              fullName = userData.displayName;
            } else if (user.displayName) {
              fullName = user.displayName;
            }

            console.log("Setting application name to:", fullName);

            setApplicationForm({
              name: fullName,
              email: userData.email || user.email || "",
              phone: userData.phone || user.phoneNumber || "",
              coverLetter: "",
              termsAccepted: false,
              status: "",
            });
          } else {
            console.log("User document doesn't exist for UID:", user.uid);
          }

          // Check if user has already applied for this job
          await checkApplicationStatus(user.uid, jobId);

          // Check if user has saved this job
          await checkSavedStatus(user.uid, jobId);
        } catch (err) {
          console.error("Error fetching user data:", err);
        }
      } else {
        // Reset form when user logs out
        setApplicationForm({
          name: "",
          email: "",
          phone: "",
          coverLetter: "",
          termsAccepted: false,
          status: "",
        });
      }
    });

    return () => unsubscribe();
  }, [jobId]);

  // Function to check if user has already applied for this job
  const checkApplicationStatus = async (userId: string, jobId: string) => {
    try {
      const applicationsRef = collection(db, "applications");
      const q = query(
        applicationsRef,
        where("userId", "==", userId),
        where("jobId", "==", jobId)
      );

      const querySnapshot = await getDocs(q);
      setHasApplied(!querySnapshot.empty);

      if (!querySnapshot.empty) {
        const applicationData = querySnapshot.docs[0].data();
        setApplicationForm((prev) => ({
          ...prev,
          status: applicationData.status || "",
        }));
      }
    } catch (err) {
      console.error("Error checking application status:", err);
    }
  };

  // Function to check if user has saved this job
  const checkSavedStatus = async (userId: string, jobId: string) => {
    try {
      const savedJobsRef = collection(db, "savedJobs");
      const q = query(
        savedJobsRef,
        where("userId", "==", userId),
        where("jobId", "==", jobId)
      );

      const querySnapshot = await getDocs(q);
      setIsSaved(!querySnapshot.empty);
    } catch (err) {
      console.error("Error checking saved status:", err);
    }
  };

  useEffect(() => {
    // Public data fetching - no auth required
    const fetchJob = async () => {
      try {
        setLoading(true);
        setError(null);

        if (!jobId) {
          throw new Error("Job ID is required");
        }

        const jobDoc = await getDoc(doc(db, "jobs", jobId));

        if (!jobDoc.exists()) {
          throw new Error("Job not found");
        }

        const jobData = jobDoc.data();

        // Debug logs for job data
        console.log("Full job data:", jobData);
        
        // Log custom Google Maps link if it exists
        if (jobData.location?.customGoogleMapsLink) {
          console.log("Custom Google Maps Link:", jobData.location.customGoogleMapsLink);
        }

        // Enhanced data validation and formatting
        const formattedJob = {
          ...jobData,
          id: jobDoc.id,
          title: jobData.title?.trim() || "Untitled Job",
          company: jobData.company?.trim() || "Unknown Company",
          companyLogo:
            jobData.companyLogo || "/placeholder.svg?height=40&width=40",
          description: jobData.description?.trim() || "",
          location: jobData.location || {}, // Preserve the full location object
          type: jobData.type?.trim() || "Not specified",
          category: jobData.category?.trim() || "Not specified",
          hours: jobData.hours?.trim() || "Not specified",
          rate: jobData.salaryAmount
            ? `₹${jobData.salaryAmount}/${jobData.salaryType}`
            : jobData.rate?.trim() || "Not specified",
          duration: jobData.duration?.trim() || "Not specified",
          postedDate: jobData.createdAt
            ? new Date(jobData.createdAt.seconds * 1000).toLocaleDateString(
                "en-US",
                {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                }
              )
            : "Recently",
          expiryDate: jobData.expiryDate
            ? new Date(jobData.expiryDate.seconds * 1000).toLocaleDateString(
                "en-US",
                {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                }
              )
            : undefined,
          urgent: Boolean(jobData.urgent),
          featured: Boolean(jobData.featured),
          responsibilities: Array.isArray(jobData.responsibilities)
            ? jobData.responsibilities
            : [],
          requirements: Array.isArray(jobData.requirements)
            ? jobData.requirements
            : [],
          benefits: Array.isArray(jobData.benefits) ? jobData.benefits : [],
          applicationInstructions:
            jobData.applicationInstructions?.trim() || "",
          skills: Array.isArray(jobData.skills) ? jobData.skills : [],
          positionsNeeded: Number(jobData.positionsNeeded) || 1,
          positionsFilled: Number(jobData.positionsFilled) || 0,
          gender: jobData.gender?.trim() || undefined,
          minAge: Number(jobData.minAge) || undefined,
          maxAge: Number(jobData.maxAge) || undefined,
          payType: jobData.payType?.trim() || undefined,
          companyDescription: jobData.companyDescription?.trim() || "",
          contactPerson: jobData.contactPerson?.trim() || "",
          applicationMethod: jobData.applicationMethod?.trim() || "",
          workLocation: jobData.workLocation?.trim() || "Remote",
          status: jobData.status?.trim() || "Active",
          audioDescription: jobData.audioDescription || null,
        };

        setJob(formattedJob);
      } catch (err) {
        console.error("Error fetching job:", err);
        const errorMessage =
          err instanceof Error ? err.message : "Failed to load job";
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchJob();
  }, [jobId]);

  // Function to format location display
  const getLocationDisplay = () => {
    if (!job.location) return "Remote";
    if (typeof job.location === "string") return job.location;

    // If location is an object
    if (typeof job.location === "object") {
      const parts = [];

      // Add building name if available
      if (job.location.buildingName) {
        parts.push(job.location.buildingName);
      }

      // Add address if available
      if (job.location.address) {
        parts.push(job.location.address);
      }

      // Add city and state
      if (job.location.city && job.location.state) {
        parts.push(`${job.location.city}, ${job.location.state}`);
      } else {
        if (job.location.city) parts.push(job.location.city);
        if (job.location.state) parts.push(job.location.state);
      }

      // Add ZIP code if available
      if (job.location.zip) {
        parts.push(job.location.zip);
      }

      return parts.join(", ");
    }

    return "Location not specified";
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setApplicationForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCheckboxChange = (checked: boolean) => {
    setApplicationForm((prev) => ({
      ...prev,
      termsAccepted: checked,
    }));
  };

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();

    // Ensure user is logged in
    if (!currentUser) {
      toast.error("You must be logged in to apply for jobs");
      router.push(
        `/login?redirect=/jobs/${jobId}&job=${encodeURIComponent(job.title)}`
      );
      return;
    }

    // Prevent reapplying if already applied
    if (hasApplied) {
      toast.info("You have already applied to this job");
      return;
    }

    if (!applicationForm.name.trim()) {
      toast.error("Please enter your name");
      return;
    }

    if (!applicationForm.phone.trim()) {
      toast.error("Please enter your phone number");
      return;
    }

    if (!applicationForm.termsAccepted) {
      toast.error("Please accept the terms");
      return;
    }

    try {
      setIsApplying(true);

      // Create application in Firestore
      const applicationData = {
        jobId,
        userId: currentUser.uid,
        name: applicationForm.name.trim(),
        email: applicationForm.email.trim(),
        phone: applicationForm.phone.trim(),
        coverLetter: applicationForm.coverLetter.trim(),
        jobTitle: job.title,
        company: job.company,
        status: "Applied",
        isManual: false,
        createdAt: serverTimestamp(),
      };

      await addDoc(collection(db, "applications"), applicationData);

      // Update application status
      setHasApplied(true);

      // Show success message
      setIsSubmitted(true);
      toast.success("Application submitted successfully!");

      // Reset form data completely to empty values
      setApplicationForm({
        name: "",
        email: "",
        phone: "",
        coverLetter: "",
        termsAccepted: false,
        status: "",
      });
    } catch (err) {
      console.error("Error submitting application:", err);
      toast.error("Failed to submit application. Please try again.");
    } finally {
      setIsApplying(false);
    }
  };

  // Add a new function to handle application removal
  const handleRemoveApplication = async () => {
    if (!currentUser) {
      toast.error("You must be logged in to remove an application");
      return;
    }

    try {
      // Find the application document
      const applicationsRef = collection(db, "applications");
      const q = query(
        applicationsRef,
        where("userId", "==", currentUser.uid),
        where("jobId", "==", jobId)
      );

      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        toast.error("Application not found");
        return;
      }

      // Delete the application document(s)
      const batch = writeBatch(db);
      querySnapshot.forEach((doc) => {
        batch.delete(doc.ref);
      });

      await batch.commit();

      // Update state
      setHasApplied(false);
      setIsSubmitted(false);
      setIsRemoveDialogOpen(false);

      toast.success("Application removed successfully");
    } catch (err) {
      console.error("Error removing application:", err);
      toast.error("Failed to remove application");
    }
  };

  // Function to save or unsave job
  const handleSaveJob = async () => {
    if (!currentUser) {
      toast.error("Please login to save jobs");
      router.push("/login");
      return;
    }

    setIsSaving(true);

    try {
      if (isSaved) {
        // Unsave the job
        const savedJobsRef = collection(db, "savedJobs");
        const q = query(
          savedJobsRef,
          where("userId", "==", currentUser.uid),
          where("jobId", "==", jobId)
        );

        const querySnapshot = await getDocs(q);
        const batch = writeBatch(db);

        querySnapshot.forEach((document) => {
          batch.delete(doc(db, "savedJobs", document.id));
        });

        await batch.commit();
        setIsSaved(false);
        toast.success("Job removed from saved jobs");
      } else {
        // Save the job
        await addDoc(collection(db, "savedJobs"), {
          userId: currentUser.uid,
          jobId: jobId,
          job: {
            id: job.id,
            title: job.title,
            company: job.company,
            location: job.location,
            salary: job.rate,
            type: job.type,
            postedDate: job.postedDate,
          },
          savedAt: serverTimestamp(),
        });

        setIsSaved(true);
        toast.success("Job saved successfully");
      }
    } catch (err) {
      console.error("Error saving/unsaving job:", err);
      toast.error("Failed to save job. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <MainLayout activeLink="jobs" showNav={true}>
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-[calc(100vh-200px)]">
            <div className="text-center space-y-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
              <p className="text-muted-foreground">Loading job details...</p>
              <p className="text-sm text-muted-foreground">
                Please wait while we fetch the job information
              </p>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (error || !job) {
    return (
      <MainLayout activeLink="jobs">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-[calc(100vh-200px)]">
            <div className="text-center space-y-4">
              <p className="text-destructive text-lg font-medium">
                {error || "Failed to load job"}
              </p>
              <p className="text-muted-foreground">
                We couldn't load the job details. Please try again later.
              </p>
              <Button asChild>
                <Link href="/jobs" className="mt-4">
                  Back to Jobs
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout activeLink="jobs">
      <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="mr-2"
          >
            <ArrowLeft className="mr-1 h-4 w-4" />
            <span className="hidden sm:inline">Back</span>
          </Button>

          <div className="flex-1" />

          <Button
            variant="ghost"
            size="sm"
            className="flex items-center gap-1"
            disabled={isSaving}
            onClick={handleSaveJob}
          >
            {isSaved ? (
              <>
                <BookmarkCheck className="h-4 w-4" />
                <span className="hidden sm:inline">Saved</span>
              </>
            ) : (
              <>
                <Bookmark className="h-4 w-4" />
                <span className="hidden sm:inline">Save</span>
              </>
            )}
          </Button>

          <Button 
            variant="ghost" 
            size="sm" 
            className="flex items-center gap-1"
            onClick={async () => {
              try {
                const jobUrl = `${window.location.origin}/jobs/${jobId}`;
                const shareData = {
                  title: job.title,
                  text: `Check out this ${job.title} position at ${job.company}`,
                  url: jobUrl,
                };

                if (navigator.share) {
                  // Use Web Share API if available (mobile)
                  await navigator.share(shareData);
                } else {
                  // Fallback to copying to clipboard
                  await navigator.clipboard.writeText(jobUrl);
                  toast.success('Link copied to clipboard');
                }
              } catch (error) {
                console.error('Error sharing:', error);
                if (error instanceof Error && error.name !== 'AbortError') {
                  // Don't show error if user cancelled the share
                  toast.error('Failed to share. Please try again.');
                }
              }
            }}
          >
            <Share2 className="h-4 w-4" />
            <span className="hidden sm:inline">Share</span>
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-3xl font-bold">{job.title}</h1>

            </div>

            {/* Basic job info card */}
            <div className="flex flex-wrap gap-4 mb-6">
              {job.urgent && (
                <div className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium">
                  Urgent
                </div>
              )}
              {job.featured && (
                <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                  Featured
                </div>
              )}
              {job.status !== "Active" && (
                <div className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium">
                  {job.status}
                </div>
              )}
              <div className="flex items-center text-sm">
                <span className="font-medium mr-2">Company:</span>
                <span>{job.company}</span>
              </div>
              <div className="flex items-center text-sm">
                <span className="font-medium mr-2">Location:</span>
                <span>{getLocationDisplay()}</span>
              </div>
              <div className="flex items-center text-sm">
                <span className="font-medium mr-2">Hours:</span>
                <span>{job.hours}</span>
              </div>
              <div className="flex items-center text-sm">
                <span className="font-medium mr-2">Pay Rate:</span>
                <span>{job.rate}</span>
              </div>
              <div className="flex items-center text-sm">
                <span className="font-medium mr-2">Duration:</span>
                <span>{job.duration}</span>
              </div>
              <div className="flex items-center text-sm">
                <span className="font-medium mr-2">Posted:</span>
                <span>{job.postedDate}</span>
              </div>
              {job.expiryDate && (
                <div className="flex items-center text-sm">
                  <span className="font-medium mr-2">Expires:</span>
                  <span>{job.expiryDate}</span>
                </div>
              )}
            </div>

            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Job Description</CardTitle>
              </CardHeader>
              <CardContent className="prose max-w-none">
                {/* Key job information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-muted/30 rounded-lg mb-4">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">Company:</span>
                    <span>{job.company}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">Location:</span>
                    <span>{getLocationDisplay()}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">Hours:</span>
                    <span>{job.hours}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">Pay Rate:</span>
                    <span>{job.rate}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">Duration:</span>
                    <span>{job.duration}</span>
                  </div>
                </div>

                {job.description && <p>{job.description}</p>}

                {/* Voice Description Section */}
                {job.audioDescription && (
                  <div className="my-6 space-y-2">
                    <h3>Voice Description</h3>
                    <div className="bg-muted/30 p-4 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Mic className="h-4 w-4 text-primary" />
                          <span className="text-sm font-medium">
                            Audio Description
                          </span>
                        </div>
                        {job.audioDescription.url && (
                          <a
                            href={job.audioDescription.url}
                            download
                            className="text-muted-foreground hover:text-primary"
                          >
                            <Download className="h-4 w-4" />
                          </a>
                        )}
                      </div>
                      <div className="flex items-center gap-4">
                        <audio
                          controls
                          className="w-full h-10 [&::-webkit-media-controls-panel]:bg-muted/50"
                          onError={(e) => {
                            console.error("Audio error:", e);
                            toast.error("Failed to load audio description");
                          }}
                        >
                          <source
                            src={job.audioDescription.url}
                            type="audio/webm"
                          />
                          Your browser does not support the audio element.
                        </audio>
                      </div>
                      {job.audioDescription.duration && (
                        <div className="text-xs text-muted-foreground mt-2">
                          Duration: {job.audioDescription.duration} seconds
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Job Details */}
                <div className="my-4 space-y-2">
                  <h3>Job Details</h3>
                  <ul>
                    {job.type && (
                      <li>
                        <strong>Job Type:</strong> {job.type}
                      </li>
                    )}
                    {job.category && (
                      <li>
                        <strong>Category:</strong> {job.category}
                      </li>
                    )}
                    {job.hours && (
                      <li>
                        <strong>Working Hours:</strong> {job.hours}
                      </li>
                    )}
                    {job.duration && (
                      <li>
                        <strong>Duration:</strong> {job.duration}
                      </li>
                    )}
                    {job.rate && (
                      <li>
                        <strong>Pay Rate:</strong> {job.rate}
                      </li>
                    )}
                    {job.payType && (
                      <li>
                        <strong>Payment Type:</strong> {job.payType}
                      </li>
                    )}
                    {job.positionsNeeded && (
                      <li>
                        <strong>Positions:</strong> {job.positionsNeeded}
                      </li>
                    )}
                    {job.positionsFilled !== undefined &&
                      job.positionsNeeded && (
                        <li>
                          <strong>Positions Filled:</strong>{" "}
                          {job.positionsFilled} of {job.positionsNeeded}
                        </li>
                      )}
                    {job.minAge && (
                      <li>
                        <strong>Minimum Age:</strong> {job.minAge} years
                      </li>
                    )}
                    {job.maxAge && (
                      <li>
                        <strong>Maximum Age:</strong> {job.maxAge} years
                      </li>
                    )}
                    {job.gender && (
                      <li>
                        <strong>Preferred Gender:</strong> {job.gender}
                      </li>
                    )}
                    {job.workLocation && (
                      <li>
                        <strong>Work Location Type:</strong> {job.workLocation}
                      </li>
                    )}
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Location Details Card - Only show for on-site jobs */}
            {job.workLocation &&
              (job.workLocation.toLowerCase() === "on-site" ||
                job.workLocation.toLowerCase() === "onsite") &&
              job.location && (
                <Card className="mb-8">
                  <CardHeader>
                    <CardTitle>Location Details</CardTitle>
                    <CardDescription>
                      Find detailed information about the job location and
                      directions
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-5 w-5 text-primary" />
                      <span className="font-medium text-lg">
                        {job.location.buildingName
                          ? `${job.location.buildingName}, `
                          : ""}
                        {job.location.address}
                      </span>
                    </div>

                    {/* Location details grid */}
                    <div className="grid grid-cols-2 gap-4">
                      {job.location.city && (
                        <div className="bg-muted/30 p-3 rounded-lg">
                          <p className="text-sm text-muted-foreground">City</p>
                          <p className="font-medium">{job.location.city}</p>
                        </div>
                      )}
                      {job.location.state && (
                        <div className="bg-muted/30 p-3 rounded-lg">
                          <p className="text-sm text-muted-foreground">State</p>
                          <p className="font-medium">{job.location.state}</p>
                        </div>
                      )}
                      {job.location.zip && (
                        <div className="bg-muted/30 p-3 rounded-lg">
                          <p className="text-sm text-muted-foreground">
                            Postal Code
                          </p>
                          <p className="font-medium">{job.location.zip}</p>
                        </div>
                      )}
                      {job.location.buildingName && (
                        <div className="bg-muted/30 p-3 rounded-lg">
                          <p className="text-sm text-muted-foreground">
                            Building
                          </p>
                          <p className="font-medium">
                            {job.location.buildingName}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Map Container */}
                    <div className="border rounded-lg overflow-hidden bg-muted/30 mb-4">
                      <div className="h-[300px] w-full relative">
                        {job.location?.customGoogleMapsLink ? (
                          <div className="h-full flex flex-col items-center justify-center p-4 text-center">
                            <MapPin className="h-12 w-12 text-primary mb-4" />
                            <h3 className="text-lg font-medium mb-2">Location</h3>
                            {job.location?.address && (
                              <p className="mb-4">{job.location.address}</p>
                            )}
                            <a
                              href={job.location.customGoogleMapsLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
                            >
                              <MapPin className="h-4 w-4" />
                              View on Google Maps
                            </a>
                          </div>
                        ) : job.location?.coordinates?.lat && job.location?.coordinates?.lng ? (
                          <iframe
                            title="Location Map"
                            width="100%"
                            height="100%"
                            frameBorder="0"
                            scrolling="no"
                            marginHeight={0}
                            marginWidth={0}
                            src={`https://www.openstreetmap.org/export/embed.html?bbox=${job.location.coordinates.lng-0.01}%2C${job.location.coordinates.lat-0.01}%2C${job.location.coordinates.lng+0.01}%2C${job.location.coordinates.lat+0.01}&layer=mapnik&marker=${job.location.coordinates.lat}%2C${job.location.coordinates.lng}`}
                            className="border-0"
                          />
                        ) : job.location?.address ? (
                          <div className="h-full flex items-center justify-center">
                            <div className="text-center p-4">
                              <MapPin className="h-12 w-12 text-primary mx-auto mb-3" />
                              <p className="mb-3">{job.location.address}</p>
                              <a
                                href={`https://www.openstreetmap.org/search?query=${encodeURIComponent(job.location.address)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors text-sm"
                              >
                                <MapPin className="h-4 w-4" />
                                View on OpenStreetMap
                              </a>
                            </div>
                          </div>
                        ) : (
                          <div className="h-full flex items-center justify-center">
                            <div className="text-center p-4">
                              <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                              <p className="text-muted-foreground">Location not available on map</p>
                            </div>
                          </div>
                        )}
                      </div>
                      {job.location?.customGoogleMapsLink ? (
                        <div className="p-3 bg-muted/50 text-center border-t">
                          <a
                            href={job.location.customGoogleMapsLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-blue-600 hover:underline"
                          >
                            View on Google Maps
                          </a>
                        </div>
                      ) : job.location?.coordinates?.lat && job.location?.coordinates?.lng && (
                        <div className="p-3 bg-muted/50 text-center border-t">
                          <a
                            href={`https://www.openstreetmap.org/?mlat=${job.location.coordinates.lat}&mlon=${job.location.coordinates.lng}#map=15/${job.location.coordinates.lat}/${job.location.coordinates.lng}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-blue-600 hover:underline"
                          >
                            View Larger Map
                          </a>
                        </div>
                      )}
                    </div>

                    {/* Location Details */}
                    <div className="space-y-4">
                      {/* Address */}
                      {job.location?.address && (
                        <div>
                          <h4 className="text-sm font-medium text-muted-foreground mb-1">Address</h4>
                          <p className="text-sm">{job.location.address}</p>
                        </div>
                      )}
                      
                      {/* Get Directions Button */}
                      <a
                        href={
                          job.location?.coordinates?.lat && job.location?.coordinates?.lng
                            ? `https://www.google.com/maps/dir/?api=1&destination=${job.location.coordinates.lat},${job.location.coordinates.lng}`
                            : job.location?.address
                            ? `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
                                job.location.address
                              )}`
                            : "#"
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-primary hover:underline text-sm"
                      >
                        <MapPin className="h-4 w-4" />
                        Get directions on Google Maps
                      </a>
                    </div>
                  </CardContent>
                </Card>
              )}

            {job.companyDescription && (
              <Card>
                <CardHeader>
                  <CardTitle>About {job.company}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    {job.companyDescription}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>

          <div className="relative">
            <Card className="sticky top-8 max-lg:fixed max-lg:bottom-0 max-lg:left-0 max-lg:right-0 max-lg:top-auto max-lg:rounded-b-none max-lg:shadow-lg max-lg:z-50 max-lg:border-t-2 max-lg:border-primary/10">
              <CardHeader>
                <CardTitle>Apply for this Position</CardTitle>
                <CardDescription>
                  Submit your application for {job.title} at {job.company}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {job.applicationMethod && (
                  <p className="text-sm">
                    <span className="font-medium">Application Method:</span>{" "}
                    {job.applicationMethod}
                  </p>
                )}
                {job.contactPerson && (
                  <p className="text-sm">
                    <span className="font-medium">Contact Person:</span>{" "}
                    {job.contactPerson}
                  </p>
                )}
                {job.applicationInstructions && (
                  <>
                    <Separator />
                    <p className="text-sm text-muted-foreground">
                      {job.applicationInstructions}
                    </p>
                  </>
                )}

                {/* Add login requirement notice */}
                {!currentUser && (
                  <div className="bg-amber-50 p-3 rounded-lg border border-amber-200">
                    <p className="text-amber-700 font-medium text-sm">
                      Login Required
                    </p>
                    <p className="text-amber-600 text-xs mt-1">
                      You must be logged in to apply for this job. Please login
                      or create an account to continue.
                    </p>
                  </div>
                )}

                {/* Position details */}
                <div className="bg-muted/50 p-3 rounded-lg">
                  <p className="text-sm font-medium mb-2">Position Details</p>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    {job.positionsNeeded && (
                      <div>
                        <p className="text-muted-foreground text-xs">
                          Positions
                        </p>
                        <p>{job.positionsNeeded}</p>
                      </div>
                    )}
                    {job.positionsFilled !== undefined && (
                      <div>
                        <p className="text-muted-foreground text-xs">Filled</p>
                        <p>
                          {job.positionsFilled} of {job.positionsNeeded}
                        </p>
                      </div>
                    )}
                    {job.status && (
                      <div>
                        <p className="text-muted-foreground text-xs">Status</p>
                        <p>{job.status}</p>
                      </div>
                    )}
                    {job.expiryDate && (
                      <div>
                        <p className="text-muted-foreground text-xs">Expires</p>
                        <p>{job.expiryDate}</p>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
              <CardFooter className="max-lg:pb-8">
                <div className="w-full flex gap-2">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        className={hasApplied ? "flex-1" : "w-full"}
                        variant={hasApplied ? "outline" : "default"}
                        disabled={
                          job.status !== "Active" ||
                          (hasApplied && !isSubmitted)
                        }
                      >
                        {hasApplied
                          ? "Already Applied"
                          : job.status !== "Active"
                          ? "Applications Closed"
                          : "Apply Now"}
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                      {isSubmitted ? (
                        <div className="py-6 text-center">
                          <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                            <CheckCircle className="h-6 w-6 text-primary" />
                          </div>
                          <DialogTitle className="text-xl mb-2">
                            Application Submitted!
                          </DialogTitle>
                          <DialogDescription>
                            Your application for {job.title} at {job.company}{" "}
                            has been sent successfully.
                            <br />
                            <br />
                            The employer will contact you if they are interested
                            in your application.
                          </DialogDescription>
                          <div className="mt-6 flex flex-col space-y-2">
                            <Button
                              onClick={() => {
                                setIsSubmitted(false);
                                router.push("/");
                              }}
                            >
                              Browse More Jobs
                            </Button>
                            <DialogClose asChild>
                              <Button variant="outline">Close</Button>
                            </DialogClose>
                          </div>
                        </div>
                      ) : hasApplied ? (
                        <div className="py-6 text-center">
                          <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                            {applicationForm.status === "Hired" ? (
                              <PartyPopper className="h-6 w-6 text-primary" />
                            ) : (
                              <CheckCircle className="h-6 w-6 text-primary" />
                            )}
                          </div>
                          <DialogTitle className="text-xl mb-2">
                            {applicationForm.status === "Hired"
                              ? "Congratulations! You've Been Hired!"
                              : "Already Applied!"}
                          </DialogTitle>
                          <DialogDescription>
                            {applicationForm.status === "Hired" ? (
                              <>
                                You have been hired for {job.title} at{" "}
                                {job.company}!
                                <br />
                                <br />
                                Check your dashboard for more details about
                                starting your new role.
                              </>
                            ) : (
                              <>
                                You have already applied for {job.title} at{" "}
                                {job.company}.
                                <br />
                                <br />
                                The employer will contact you if they are
                                interested in your application.
                              </>
                            )}
                          </DialogDescription>
                          <div className="mt-6 flex flex-col space-y-2">
                            <DialogClose asChild>
                              <Button variant="outline">Close</Button>
                            </DialogClose>
                            {applicationForm.status !== "Hired" && (
                              <Button
                                variant="destructive"
                                onClick={() => setIsRemoveDialogOpen(true)}
                              >
                                Remove Application
                              </Button>
                            )}
                          </div>
                        </div>
                      ) : (
                        <>
                          <DialogHeader>
                            <DialogTitle>Apply for {job.title}</DialogTitle>
                            <DialogDescription>
                              <div className="space-y-2">
                                <p>Fill out the form below to apply for this position at {job.company}.</p>
                                {!currentUser && (
                                  <div className="pt-2">
                                    <Link
                                      href={`/login?redirect=/jobs/${jobId}`}
                                      className="text-primary hover:underline"
                                    >
                                      Login to apply
                                    </Link>
                                  </div>
                                )}
                              </div>
                            </DialogDescription>
                          </DialogHeader>

                          <form onSubmit={handleApply}>
                            <div className="space-y-4 py-4">
                              <div>
                                <Label htmlFor="name">Full Name</Label>
                                <Input
                                  id="name"
                                  name="name"
                                  value={applicationForm.name}
                                  onChange={handleChange}
                                  required
                                  disabled={!currentUser}
                                />
                              </div>
                              <div>
                                <Label htmlFor="email">Email</Label>
                                <Input
                                  id="email"
                                  name="email"
                                  type="email"
                                  value={applicationForm.email}
                                  onChange={handleChange}
                                  required
                                  disabled={!currentUser}
                                />
                              </div>
                              <div>
                                <Label htmlFor="phone">Phone Number</Label>
                                <Input
                                  id="phone"
                                  name="phone"
                                  type="tel"
                                  value={applicationForm.phone}
                                  onChange={handleChange}
                                  required
                                  disabled={!currentUser}
                                />
                              </div>
                              <div>
                                <Label htmlFor="coverLetter">
                                  Cover Letter (Optional)
                                </Label>
                                <Textarea
                                  id="coverLetter"
                                  name="coverLetter"
                                  value={applicationForm.coverLetter}
                                  onChange={handleChange}
                                  placeholder="Tell us why you're interested in this position..."
                                  rows={4}
                                  disabled={!currentUser}
                                />
                              </div>
                              <div className="flex items-center space-x-2">
                                <Checkbox
                                  id="terms"
                                  name="termsAccepted"
                                  checked={applicationForm.termsAccepted}
                                  onCheckedChange={handleCheckboxChange}
                                  disabled={!currentUser}
                                />
                                <Label
                                  htmlFor="terms"
                                  className="text-sm font-normal"
                                >
                                  I confirm that the information provided is
                                  accurate
                                </Label>
                              </div>
                            </div>
                            <DialogFooter>
                              <Button
                                type="submit"
                                disabled={isApplying || !currentUser}
                              >
                                {isApplying
                                  ? "Applying..."
                                  : "Submit Application"}
                              </Button>
                            </DialogFooter>
                          </form>
                        </>
                      )}
                    </DialogContent>
                  </Dialog>

                  {hasApplied && (
                    <Button
                      variant="outline"
                      onClick={() => router.push("/dashboard/job-status")}
                    >
                      View Status
                    </Button>
                  )}
                </div>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>

      {/* Remove Application Confirmation Dialog */}
      <Dialog open={isRemoveDialogOpen} onOpenChange={setIsRemoveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove Application</DialogTitle>
            <DialogDescription>
              Are you sure you want to remove your application for {job.title}{" "}
              at {job.company}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsRemoveDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleRemoveApplication}>
              Remove Application
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
}
