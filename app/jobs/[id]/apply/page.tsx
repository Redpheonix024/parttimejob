"use client";

import type React from "react";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import BackButton from "@/components/layout/back-button";
import JobDetailCard from "@/components/jobs/job-detail-card";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { CheckCircle2, Upload } from "lucide-react";

// This would typically come from an API call based on the job ID
const jobData = {
  id: "1",
  title: "Weekend Barista",
  company: "Coffee House",
  location: "San Francisco, CA",
  hours: "10-15 hours/week",
  rate: "$18-22/hour",
  duration: "3 months",
  type: "part-time",
  postedDate: "2 days ago",
  urgent: true,
  contactPerson: "Sarah Johnson, Manager",
  applicationMethod: "Online Application",
};

export default function ApplyJob({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [resumeFile, setResumeFile] = useState<File | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate form submission
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
    }, 1500);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setResumeFile(e.target.files[0]);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      <main className="flex-1 container mx-auto px-4 py-8">
        <BackButton href={`/jobs/${params.id}`} label="Back to Job Details" />

        {isSubmitted ? (
          <Card className="max-w-3xl mx-auto">
            <CardHeader className="text-center">
              <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <CheckCircle2 className="h-6 w-6 text-primary" />
              </div>
              <CardTitle className="text-2xl">Application Submitted!</CardTitle>
              <CardDescription>
                Your application for {jobData.title} at {jobData.company} has
                been submitted successfully.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center space-y-2">
              <p className="text-muted-foreground">
                The employer will review your application and contact you if
                they're interested.
              </p>
              <p className="text-muted-foreground">
                You can track the status of your application in your dashboard.
              </p>
            </CardContent>
            <CardFooter className="flex flex-col space-y-2">
              <Button
                className="w-full"
                onClick={() => router.push("/dashboard")}
              >
                Go to Dashboard
              </Button>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => router.push("/")}
              >
                Browse More Jobs
              </Button>
            </CardFooter>
          </Card>
        ) : (
          <div className="max-w-3xl mx-auto">
            <h1 className="text-3xl font-bold mb-2">
              Apply for {jobData.title}
            </h1>
            <p className="text-muted-foreground mb-6">
              Complete the form below to apply for this position at{" "}
              {jobData.company}.
            </p>

            <div className="mb-8">
              <Card>
                <CardHeader>
                  <CardTitle>Job Details</CardTitle>
                </CardHeader>
                <CardContent>
                  <JobDetailCard job={jobData} />
                </CardContent>
              </Card>
            </div>

            <form onSubmit={handleSubmit}>
              <Card className="mb-8">
                <CardHeader>
                  <CardTitle>Personal Information</CardTitle>
                  <CardDescription>
                    Provide your contact details
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="first-name">First name</Label>
                      <Input id="first-name" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="last-name">Last name</Label>
                      <Input id="last-name" required />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" required />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone number</Label>
                    <Input id="phone" type="tel" required />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <Input id="location" placeholder="City, State" required />
                  </div>
                </CardContent>
              </Card>

              <Card className="mb-8">
                <CardHeader>
                  <CardTitle>Resume & Cover Letter</CardTitle>
                  <CardDescription>
                    Upload your resume and provide a cover letter
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="resume">Resume</Label>
                    <div className="border-2 border-dashed rounded-md p-6 text-center cursor-pointer hover:bg-muted/50 transition-colors">
                      <input
                        type="file"
                        id="resume"
                        className="hidden"
                        accept=".pdf,.doc,.docx"
                        onChange={handleFileChange}
                      />
                      <label htmlFor="resume" className="cursor-pointer">
                        {resumeFile ? (
                          <div className="flex items-center justify-center">
                            <CheckCircle2 className="h-6 w-6 text-primary mr-2" />
                            <span>{resumeFile.name}</span>
                          </div>
                        ) : (
                          <div>
                            <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                            <p className="text-sm font-medium">
                              Click to upload your resume
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              PDF, DOC, or DOCX (Max 5MB)
                            </p>
                          </div>
                        )}
                      </label>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cover-letter">
                      Cover Letter (Optional)
                    </Label>
                    <Textarea
                      id="cover-letter"
                      placeholder="Explain why you're a good fit for this position..."
                      className="min-h-[150px]"
                    />
                  </div>
                </CardContent>
              </Card>

              <Card className="mb-8">
                <CardHeader>
                  <CardTitle>Additional Information</CardTitle>
                  <CardDescription>
                    Help us understand your qualifications better
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="experience">Relevant Experience</Label>
                    <Select>
                      <SelectTrigger id="experience">
                        <SelectValue placeholder="Select your experience level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">No experience</SelectItem>
                        <SelectItem value="less-than-1">
                          Less than 1 year
                        </SelectItem>
                        <SelectItem value="1-2">1-2 years</SelectItem>
                        <SelectItem value="3-5">3-5 years</SelectItem>
                        <SelectItem value="5-plus">5+ years</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="availability">Availability</Label>
                    <Textarea
                      id="availability"
                      placeholder="Please specify your availability (days and hours)..."
                      className="min-h-[100px]"
                      required
                    />
                  </div>

                  <div className="space-y-4">
                    <Label>How did you hear about this position?</Label>
                    <RadioGroup defaultValue="website">
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="website" id="website" />
                        <Label htmlFor="website" className="font-normal">
                          Parttimejob Website
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="social" id="social" />
                        <Label htmlFor="social" className="font-normal">
                          Social Media
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="referral" id="referral" />
                        <Label htmlFor="referral" className="font-normal">
                          Referral
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="other" id="other" />
                        <Label htmlFor="other" className="font-normal">
                          Other
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <Label htmlFor="additional-info">
                      Additional Information (Optional)
                    </Label>
                    <Textarea
                      id="additional-info"
                      placeholder="Is there anything else you'd like us to know about your application?"
                      className="min-h-[100px]"
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Submit Application</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox id="terms" required />
                    <Label htmlFor="terms" className="font-normal">
                      I certify that all information provided is true and
                      complete to the best of my knowledge
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="contact" required />
                    <Label htmlFor="contact" className="font-normal">
                      I agree to be contacted about this job opportunity
                    </Label>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button
                    variant="outline"
                    type="button"
                    onClick={() => router.push(`/jobs/${params.id}`)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Submitting..." : "Submit Application"}
                  </Button>
                </CardFooter>
              </Card>
            </form>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
