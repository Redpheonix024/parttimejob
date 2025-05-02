"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "@/app/config/firebase";

interface JobFormData {
  title: string;
  company: string;
  description: string;
  location: string;
  type: string;
  category: string;
  hours: string;
  rate: string;
  duration: string;
  status: string;
  urgent: boolean;
  featured: boolean;
  requirements: string[];
  benefits: string[];
  positionsNeeded: number;
  positionsFilled: number;
  gender?: string;
  minAge?: number;
  maxAge?: number;
  payType?: string;
  applicationInstructions?: string;
  skills?: string[];
  companyDescription?: string;
  contactPerson?: string;
  applicationMethod?: string;
  workLocation?: string;
}

interface EditJobFormProps {
  jobId: string;
  isAdmin?: boolean;
  onSuccess?: () => void;
}

export default function EditJobForm({
  jobId,
  isAdmin = false,
  onSuccess,
}: EditJobFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<JobFormData>({
    title: "",
    company: "",
    description: "",
    location: "",
    type: "",
    category: "",
    hours: "",
    rate: "",
    duration: "",
    status: "Active",
    urgent: false,
    featured: false,
    requirements: [],
    benefits: [],
    positionsNeeded: 1,
    positionsFilled: 0,
  });

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const jobDoc = await getDoc(doc(db, "jobs", jobId));
        if (jobDoc.exists()) {
          const jobData = jobDoc.data();
          setFormData({
            title: jobData.title || "",
            company: jobData.company || "",
            description: jobData.description || "",
            location: jobData.location || "",
            type: jobData.type || "",
            category: jobData.category || "",
            hours: jobData.hours || "",
            rate: jobData.rate || "",
            duration: jobData.duration || "",
            status: jobData.status || "Active",
            urgent: jobData.urgent || false,
            featured: jobData.featured || false,
            requirements: jobData.requirements || [],
            benefits: jobData.benefits || [],
            positionsNeeded: jobData.positionsNeeded || 1,
            positionsFilled: jobData.positionsFilled || 0,
            gender: jobData.gender,
            minAge: jobData.minAge,
            maxAge: jobData.maxAge,
            payType: jobData.payType,
            applicationInstructions: jobData.applicationInstructions,
            skills: jobData.skills,
            companyDescription: jobData.companyDescription,
            contactPerson: jobData.contactPerson,
            applicationMethod: jobData.applicationMethod,
            workLocation: jobData.workLocation,
          });
        }
      } catch (error) {
        console.error("Error fetching job:", error);
        toast.error("Failed to load job data");
      } finally {
        setLoading(false);
      }
    };

    fetchJob();
  }, [jobId]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (name: string, checked: boolean) => {
    setFormData((prev) => ({ ...prev, [name]: checked }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const jobRef = doc(db, "jobs", jobId);
      await updateDoc(jobRef, {
        ...formData,
        updatedAt: new Date(),
      });

      toast.success("Job updated successfully");
      if (onSuccess) {
        onSuccess();
      } else if (isAdmin) {
        router.push("/admin/jobs");
      } else {
        router.push(`/jobs/${jobId}`);
      }
    } catch (error) {
      console.error("Error updating job:", error);
      toast.error("Failed to update job");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading job data...</p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Job Title</Label>
              <Input
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="company">Company Name</Label>
              <Input
                id="company"
                name="company"
                value={formData.company}
                onChange={handleChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                name="location"
                value={formData.location}
                onChange={handleChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="type">Job Type</Label>
              <Select
                value={formData.type}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, type: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select job type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="full-time">Full-time</SelectItem>
                  <SelectItem value="part-time">Part-time</SelectItem>
                  <SelectItem value="contract">Contract</SelectItem>
                  <SelectItem value="temporary">Temporary</SelectItem>
                  <SelectItem value="internship">Internship</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Input
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="hours">Working Hours</Label>
              <Input
                id="hours"
                name="hours"
                value={formData.hours}
                onChange={handleChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="rate">Pay Rate</Label>
              <Input
                id="rate"
                name="rate"
                value={formData.rate}
                onChange={handleChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="duration">Duration</Label>
              <Input
                id="duration"
                name="duration"
                value={formData.duration}
                onChange={handleChange}
                required
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Job Description</Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              className="min-h-[200px]"
            />
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="urgent"
                checked={formData.urgent}
                onCheckedChange={(checked) =>
                  handleCheckboxChange("urgent", checked as boolean)
                }
              />
              <Label htmlFor="urgent">Urgent</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="featured"
                checked={formData.featured}
                onCheckedChange={(checked) =>
                  handleCheckboxChange("featured", checked as boolean)
                }
              />
              <Label htmlFor="featured">Featured</Label>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Additional Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="positionsNeeded">Positions Needed</Label>
              <Input
                id="positionsNeeded"
                name="positionsNeeded"
                type="number"
                value={formData.positionsNeeded}
                onChange={handleChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="positionsFilled">Positions Filled</Label>
              <Input
                id="positionsFilled"
                name="positionsFilled"
                type="number"
                value={formData.positionsFilled}
                onChange={handleChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="gender">Gender Preference</Label>
              <Select
                value={formData.gender}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, gender: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select gender preference" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="any">Any</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="workLocation">Work Location Type</Label>
              <Select
                value={formData.workLocation}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, workLocation: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select work location type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="remote">Remote</SelectItem>
                  <SelectItem value="office">Office</SelectItem>
                  <SelectItem value="hybrid">Hybrid</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="requirements">Requirements (one per line)</Label>
            <Textarea
              id="requirements"
              name="requirements"
              value={formData.requirements.join("\n")}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  requirements: e.target.value.split("\n"),
                }))
              }
              className="min-h-[100px]"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="benefits">Benefits (one per line)</Label>
            <Textarea
              id="benefits"
              name="benefits"
              value={formData.benefits.join("\n")}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  benefits: e.target.value.split("\n"),
                }))
              }
              className="min-h-[100px]"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="skills">Skills (comma separated)</Label>
            <Input
              id="skills"
              name="skills"
              value={formData.skills?.join(", ") || ""}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  skills: e.target.value.split(",").map((s) => s.trim()),
                }))
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="companyDescription">Company Description</Label>
            <Textarea
              id="companyDescription"
              name="companyDescription"
              value={formData.companyDescription}
              onChange={handleChange}
              className="min-h-[100px]"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Application Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="contactPerson">Contact Person</Label>
              <Input
                id="contactPerson"
                name="contactPerson"
                value={formData.contactPerson}
                onChange={handleChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="applicationMethod">Application Method</Label>
              <Input
                id="applicationMethod"
                name="applicationMethod"
                value={formData.applicationMethod}
                onChange={handleChange}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="applicationInstructions">
              Application Instructions
            </Label>
            <Textarea
              id="applicationInstructions"
              name="applicationInstructions"
              value={formData.applicationInstructions}
              onChange={handleChange}
              className="min-h-[100px]"
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end space-x-4">
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
        <Button type="submit" disabled={saving}>
          {saving ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </form>
  );
}
