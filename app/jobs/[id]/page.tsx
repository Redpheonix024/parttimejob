"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Share2, ArrowLeft } from "lucide-react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/app/config/firebase";
import { toast } from "sonner";
import MainLayout from "@/components/layout/main-layout";

// Public page - no authentication required
export default function JobDetails() {
  const params = useParams();
  const jobId = params.id as string;
  
  const [job, setJob] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Public data fetching - no auth required
    const fetchJob = async () => {
      try {
        setLoading(true);
        const jobDoc = await getDoc(doc(db, "jobs", jobId));
        
        if (!jobDoc.exists()) {
          throw new Error("Job not found");
        }

        const jobData = jobDoc.data();
        
        // Ensure all required fields have values to prevent rendering errors
        const formattedJob = {
          ...jobData,
          id: jobDoc.id,
          title: jobData.title || 'Untitled Job',
          company: jobData.company || 'Unknown Company',
          description: jobData.description || '',
          location: jobData.location || { display: 'Remote' },
          hours: jobData.hours || 'Not specified',
          rate: jobData.rate || 'Not specified',
          duration: jobData.duration || 'Not specified',
          postedDate: jobData.createdAt 
            ? new Date(jobData.createdAt.seconds * 1000).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
              })
            : 'Recently',
          urgent: jobData.urgent || false,
          responsibilities: jobData.responsibilities || [],
          requirements: jobData.requirements || [],
          benefits: jobData.benefits || []
        };
        
        setJob(formattedJob);
      } catch (err) {
        console.error("Error fetching job:", err);
        setError(err instanceof Error ? err.message : "Failed to load job");
        toast.error("Failed to load job");
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

  if (loading) {
    return (
      <MainLayout activeLink="jobs">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-[calc(100vh-200px)]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading job details...</p>
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
            <div className="text-center">
              <p className="text-destructive mb-4">{error || "Failed to load job"}</p>
              <Button asChild>
                <Link href="/">Back to Jobs</Link>
              </Button>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout activeLink="jobs">
      <div className="container mx-auto px-4 py-8">
        <Link href="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Jobs
        </Link>

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
            </div>

            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Job Description</CardTitle>
              </CardHeader>
              <CardContent className="prose max-w-none">
                {job.description && <p>{job.description}</p>}
                
                {/* Job Details */}
                <div className="my-4 space-y-2">
                  <h3>Job Details</h3>
                  <ul>
                    {job.type && <li><strong>Job Type:</strong> {job.type}</li>}
                    {job.category && <li><strong>Category:</strong> {job.category}</li>}
                    {job.hours && <li><strong>Working Hours:</strong> {job.hours}</li>}
                    {job.duration && <li><strong>Duration:</strong> {job.duration}</li>}
                    {job.rate && <li><strong>Pay Rate:</strong> {job.rate}</li>}
                    {job.salaryAmount && <li><strong>Salary:</strong> ₹{job.salaryAmount} {job.salaryType === 'daily' ? 'per day' : 'per month'}</li>}
                    {job.startDate && <li><strong>Start Date:</strong> {new Date(job.startDate).toLocaleDateString()}</li>}
                    {job.positions && <li><strong>Positions:</strong> {job.positions}</li>}
                    {job.positionsFilled !== undefined && job.positions && <li><strong>Positions Filled:</strong> {job.positionsFilled} of {job.positions}</li>}
                    {job.minAge && <li><strong>Minimum Age:</strong> {job.minAge} years</li>}
                    {job.maxAge && <li><strong>Maximum Age:</strong> {job.maxAge} years</li>}
                    {job.gender && <li><strong>Preferred Gender:</strong> {job.gender}</li>}
                    {job.workLocation && <li><strong>Work Location Type:</strong> {job.workLocation}</li>}
                  </ul>
                </div>
                
                {job.responsibilities && job.responsibilities.length > 0 && (
                  <>
                    <h3>Responsibilities:</h3>
                    <ul>
                      {job.responsibilities.map((item: string, index: number) => (
                        <li key={index}>{item}</li>
                      ))}
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
              </CardContent>
            </Card>

            {job.companyDescription && (
              <Card>
                <CardHeader>
                  <CardTitle>About {job.company}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{job.companyDescription}</p>
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
                    <span className="font-medium">Application Method:</span> {job.applicationMethod}
                  </p>
                )}
                {job.contactPerson && (
                  <p className="text-sm">
                    <span className="font-medium">Contact:</span> {job.contactPerson}
                  </p>
                )}
                {job.applicationInstructions && (
                  <>
                    <Separator />
                    <p className="text-sm text-muted-foreground">{job.applicationInstructions}</p>
                  </>
                )}
              </CardContent>
              <CardFooter>
                <Button className="w-full" asChild>
                  <Link href={`/jobs/${jobId}/apply`}>Apply Now</Link>
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

