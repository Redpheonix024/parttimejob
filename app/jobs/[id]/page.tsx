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
            setUserProfile(userData);

            // Pre-fill the form with user data
            setApplicationForm((prev) => ({
              ...prev,
              name:
                userData.firstName && userData.lastName
                  ? `${userData.firstName} ${userData.lastName}`
                  : userData.displayName || user.displayName || "",
              email: userData.email || user.email || "",
              phone: userData.phone || user.phoneNumber || "",
            }));
          }

          // Check if user has already applied for this job
          await checkApplicationStatus(user.uid, jobId);

          // Check if user has saved this job
          await checkSavedStatus(user.uid, jobId);
        } catch (err) {
          console.error("Error fetching user data:", err);
        }
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

        // Enhanced data validation and formatting
        const formattedJob = {
          ...jobData,
          id: jobDoc.id,
          title: jobData.title?.trim() || "Untitled Job",
          company: jobData.company?.trim() || "Unknown Company",
          companyLogo:
            jobData.companyLogo || "/placeholder.svg?height=40&width=40",
          description: jobData.description?.trim() || "",
          location:
            typeof jobData.location === "object"
              ? jobData.location.display?.trim() ||
                jobData.location.address?.trim() ||
                "Remote"
              : jobData.location?.trim() || "Remote",
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
      // Check for display property first
      if (job.location.display) return job.location.display;

      // Check for city and state combination
      if (job.location.city && job.location.state) {
        return `${job.location.city}, ${job.location.state}`;
      }

      // Check for address
      if (job.location.address) return job.location.address;

      // Check for individual properties
      if (job.location.city) return job.location.city;
      if (job.location.state) return job.location.state;
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
      const applicationData: any = {
        jobId,
        name: applicationForm.name,
        email: applicationForm.email,
        phone: applicationForm.phone,
        coverLetter: applicationForm.coverLetter,
        jobTitle: job.title,
        company: job.company,
        status: "Applied",
        isManual: !currentUser, // Set to true for guest applications
        createdAt: serverTimestamp(),
      };

      // Add user ID if authenticated
      if (currentUser) {
        applicationData.userId = currentUser.uid;
        applicationData.isManual = false;
      }

      await addDoc(collection(db, "applications"), applicationData);

      // Update application status
      setHasApplied(true);

      // Show success message
      setIsSubmitted(true);
      toast.success("Application submitted successfully!");

      // Reset form after successful submission
      setApplicationForm({
        name: "",
        email: "",
        phone: "",
        coverLetter: "",
        termsAccepted: false,
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

      // Delete the application document
      const batch = await import("firebase/firestore").then((module) =>
        module.writeBatch(db)
      );
      querySnapshot.forEach((doc) => {
        batch.delete(doc.ref);
      });

      await batch.commit();

      // Update state
      setHasApplied(false);
      setIsSubmitted(false);

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
      <MainLayout activeLink="jobs">
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

          <Button variant="ghost" size="sm" className="flex items-center gap-1">
            <Share2 className="h-4 w-4" />
            <span className="hidden sm:inline">Share</span>
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-3xl font-bold">{job.title}</h1>
              <Button variant="outline" size="icon">
                <Share2 className="h-4 w-4" />
                <span className="sr-only">Share</span>
              </Button>
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

                {job.responsibilities && job.responsibilities.length > 0 && (
                  <>
                    <h3>Responsibilities:</h3>
                    <ul>
                      {job.responsibilities.map(
                        (item: string, index: number) => (
                          <li key={index}>{item}</li>
                        )
                      )}
                    </ul>
                  </>
                )}
                {job.requirements && job.requirements.length > 0 && (
                  <>
                    <h3>Requirements:</h3>
                    <ul>
                      {job.requirements.map((item: string, index: number) => (
                        <li key={index}>{item}</li>
                      ))}
                    </ul>
                  </>
                )}
                {job.benefits && job.benefits.length > 0 && (
                  <>
                    <h3>Benefits:</h3>
                    <ul>
                      {job.benefits.map((item: string, index: number) => (
                        <li key={index}>{item}</li>
                      ))}
                    </ul>
                  </>
                )}
                {job.skills && job.skills.length > 0 && (
                  <>
                    <h3>Skills Required:</h3>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {typeof job.skills === "string"
                        ? job.skills
                            .split(",")
                            .map((skill: string, index: number) => (
                              <span
                                key={index}
                                className="bg-secondary px-2 py-1 rounded-full text-xs"
                              >
                                {skill.trim()}
                              </span>
                            ))
                        : Array.isArray(job.skills)
                        ? job.skills.map((skill: string, index: number) => (
                            <span
                              key={index}
                              className="bg-secondary px-2 py-1 rounded-full text-xs"
                            >
                              {skill.trim()}
                            </span>
                          ))
                        : null}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

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

          <div>
            <Card className="sticky top-8">
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
              <CardFooter>
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
                            <CheckCircle className="h-6 w-6 text-primary" />
                          </div>
                          <DialogTitle className="text-xl mb-2">
                            Already Applied!
                          </DialogTitle>
                          <DialogDescription>
                            You have already applied for {job.title} at{" "}
                            {job.company}.
                            <br />
                            <br />
                            The employer will contact you if they are interested
                            in your application.
                          </DialogDescription>
                          <div className="mt-6 flex flex-col space-y-2">
                            <DialogClose asChild>
                              <Button variant="outline">Close</Button>
                            </DialogClose>
                            <Button
                              variant="destructive"
                              onClick={() => setIsRemoveDialogOpen(true)}
                            >
                              Remove Application
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <DialogHeader>
                            <DialogTitle>Apply for {job.title}</DialogTitle>
                            <DialogDescription>
                              Fill out the form below to apply for this position
                              at {job.company}.
                              {!currentUser && (
                                <div className="mt-2">
                                  <Link
                                    href={`/login?redirect=/jobs/${jobId}`}
                                    className="text-primary hover:underline"
                                  >
                                    Sign in
                                  </Link>{" "}
                                  to automatically fill your details.
                                </div>
                              )}
                            </DialogDescription>
                          </DialogHeader>
                          <form onSubmit={handleApply}>
                            <div className="grid gap-4 py-4">
                              <div className="grid gap-2">
                                <Label htmlFor="name">Full Name</Label>
                                <Input
                                  id="name"
                                  name="name"
                                  value={applicationForm.name}
                                  onChange={handleChange}
                                  required
                                />
                              </div>
                              <div className="grid gap-2">
                                <Label htmlFor="email">
                                  Email {currentUser ? "" : "(Optional)"}
                                </Label>
                                <Input
                                  id="email"
                                  name="email"
                                  type="email"
                                  value={applicationForm.email}
                                  onChange={handleChange}
                                  required={!!currentUser}
                                />
                              </div>
                              <div className="grid gap-2">
                                <Label htmlFor="phone">Phone Number</Label>
                                <Input
                                  id="phone"
                                  name="phone"
                                  type="tel"
                                  value={applicationForm.phone}
                                  onChange={handleChange}
                                  required
                                />
                              </div>
                              <div className="grid gap-2">
                                <Label htmlFor="coverLetter">
                                  Why are you interested in this job? (Optional)
                                </Label>
                                <Textarea
                                  id="coverLetter"
                                  name="coverLetter"
                                  value={applicationForm.coverLetter}
                                  onChange={handleChange}
                                  className="min-h-[100px]"
                                />
                              </div>
                              <div className="flex items-center space-x-2">
                                <Checkbox
                                  id="terms"
                                  checked={applicationForm.termsAccepted}
                                  onCheckedChange={handleCheckboxChange}
                                  required
                                />
                                <Label htmlFor="terms" className="text-sm">
                                  I agree to be contacted about this job
                                  opportunity
                                </Label>
                              </div>
                            </div>
                            <DialogFooter>
                              <Button type="submit" disabled={isApplying}>
                                {isApplying
                                  ? "Submitting..."
                                  : "Submit Application"}
                              </Button>
                            </DialogFooter>
                          </form>
                        </>
                      )}
                    </DialogContent>
                  </Dialog>

                  {hasApplied && currentUser && (
                    <>
                      <Button
                        variant="destructive"
                        className="flex-1"
                        onClick={() => setIsRemoveDialogOpen(true)}
                      >
                        Remove Application
                      </Button>

                      {/* Confirmation Dialog */}
                      <Dialog
                        open={isRemoveDialogOpen}
                        onOpenChange={setIsRemoveDialogOpen}
                      >
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Confirm Removal</DialogTitle>
                            <DialogDescription>
                              Are you sure you want to remove your application
                              for {job.title} at {job.company}? This action
                              cannot be undone.
                            </DialogDescription>
                          </DialogHeader>
                          <DialogFooter>
                            <Button
                              variant="outline"
                              onClick={() => setIsRemoveDialogOpen(false)}
                            >
                              Cancel
                            </Button>
                            <Button
                              variant="destructive"
                              onClick={() => {
                                handleRemoveApplication();
                                setIsRemoveDialogOpen(false);
                              }}
                            >
                              Confirm
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </>
                  )}
                </div>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
