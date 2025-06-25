"use client";

import { useState, useEffect } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, setDoc, updateDoc, collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/app/config/firebase";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import DashboardLayout from "@/components/dashboard/dashboard-layout";
import {
  Briefcase,
  GraduationCap,
  Upload,
  Code,
  CheckSquare,
  Calendar as CalendarIcon,
} from "lucide-react";
import CalendarComponent from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { uploadToS3, deleteFromS3 } from "@/app/utils/aws-config";
import { PhoneVerificationModal } from "@/components/phone-verification-modal";
import { toast } from "sonner";
import { getIndiaState, getIndiaDistrict } from "@/app/data/india-states";
import { Skill, SkillCategory } from "@/types/user";
import { AddSkillDialog } from "@/components/skills/add-skill-dialog";
import { calculateProfileCompletion } from "@/app/utils/profile-completion";
import { Progress } from "@/components/ui/progress";
import { Upload as AWSUpload } from "@aws-sdk/lib-storage";
import { s3Client } from "@/app/utils/aws-config";
import { Progress as AWSUploadProgress } from "@aws-sdk/lib-storage";
import { ProfileCompletionDialog } from "@/components/profile/profile-completion-dialog";
import { useAuth } from "@/hooks/useAuth";
import JobTimeline from "@/components/dashboard/job-timeline";
import { RupeeIcon } from "@/components/ui/rupee-icon";
import { useUserProfile } from "@/hooks/useUserProfile";
import { usersApi } from "@/utils/api";

export default function Profile() {
  const { user: authUser, loading: authLoading } = useAuth();
  const { profile, loading: profileLoading, updateProfilePicture, refetchProfile } = useUserProfile();
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [imageKey, setImageKey] = useState(0);
  const [showCalendar, setShowCalendar] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showPhoneVerification, setShowPhoneVerification] = useState(false);
  const [phoneToVerify, setPhoneToVerify] = useState("");
  const [showProfileCompletionDialog, setShowProfileCompletionDialog] = useState(false);
  const states = getIndiaState();
  const [selectedState, setSelectedState] = useState(profile?.permanentAddress?.state || "");
  const [districts, setDistricts] = useState<string[]>([]);
  const [showAddSkill, setShowAddSkill] = useState(false);
  const [completedJobs, setCompletedJobs] = useState<any[]>([]);

  useEffect(() => {
    if (profile?.permanentAddress?.state) {
      const stateCode = states.find((s) => s.state === profile.permanentAddress.state)?.code;
      if (stateCode) {
        setDistricts(getIndiaDistrict(stateCode));
        setSelectedState(profile.permanentAddress.state);
      }
    }
  }, [profile?.permanentAddress?.state]);

  useEffect(() => {
    if (!authLoading && authUser) {
      // Fetch all applications for the user, then filter for completed/hired in JS, and fetch jobStatus for 'hired'
      const fetchCompletedJobs = async () => {
        const q = query(
          collection(db, "applications"),
          where("userId", "==", authUser.uid)
        );
        const snapshot = await getDocs(q);
        const apps = snapshot.docs.map((doc) => ({ id: doc.id, ...(doc.data() as any) }));
        // Only keep status 'hired' or 'completed'
        const filtered = apps.filter((job) => {
          const status = String(job.status || "").toLowerCase();
          return status === "hired" || status === "completed";
        });
        // For 'hired', fetch related job status
        const jobsWithStatus = await Promise.all(
          filtered.map(async (job) => {
            let jobStatus = job.status;
            if (String(job.status).toLowerCase() === "hired" && job.jobId) {
              try {
                const jobDocRef = doc(db, "jobs", job.jobId);
                const jobDocSnap = await getDoc(jobDocRef);
                if (jobDocSnap.exists()) {
                  jobStatus = jobDocSnap.data().status || jobStatus;
                }
              } catch (e) {
                // ignore error, fallback to application status
              }
            }
            return { ...job, jobStatus };
          })
        );
        setCompletedJobs(jobsWithStatus);
      };
      fetchCompletedJobs();
    }
  }, [authUser, authLoading]);

  const handleSaveChanges = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authUser) return;
    setIsSaving(true);
    try {
      const form = e.target as HTMLFormElement;
      const getValue = (
        id: string,
        type: "input" | "select" | "textarea" = "input"
      ) => {
        const element = form.elements.namedItem(id) as
          | HTMLInputElement
          | HTMLSelectElement
          | HTMLTextAreaElement;
        return element?.value || "";
      };
      const formData = {
        id: authUser.uid,
        firstName: getValue("first-name"),
        lastName: getValue("last-name"),
        phone: getValue("phone").startsWith("+91")
          ? getValue("phone")
          : "+91" + getValue("phone"),
        permanentAddress: {
          street: getValue("permanent-address", "textarea"),
          state: getValue("state", "select"),
          district: getValue("district", "select"),
          pincode: getValue("pincode"),
        },
        currentLocation: {
          city: getValue("current-city"),
        },
        dateOfBirth: getValue("dob"),
        gender: getValue("gender", "select"),
        bio: getValue("bio", "textarea"),
        email: authUser.email,
        updatedAt: new Date().toISOString(),
      };
      await usersApi.updateUser(formData);
      await refetchProfile();
      toast.success("Profile updated successfully");
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  const handlePhotoUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (!event.target.files?.[0] || !authUser) return;
    const file = event.target.files[0];
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size must be less than 5MB");
      return;
    }
    setIsUploadingPhoto(true);
    setUploadProgress(0);
    try {
      const loadingToast = toast.loading("Uploading photo...");
      // Upload the file to S3 and get the image URL
      const response = await usersApi.uploadProfilePicture(file, authUser.uid);
      if (response.success) {
        await updateProfilePicture(response.imageUrl);
        setImageKey((prev) => prev + 1);
        toast.dismiss(loadingToast);
        toast.success("Profile photo updated successfully");
      } else {
        throw new Error("Failed to upload profile picture");
      }
    } catch (error) {
      console.error("Error updating photo:", error);
      toast.error("Failed to update profile photo");
    } finally {
      setIsUploadingPhoto(false);
      setUploadProgress(0);
    }
  };

  const handlePhoneSubmit = (phoneNumber: string) => {
    if (!phoneNumber.trim()) {
      toast.error("Please enter a phone number");
      return;
    }
    setPhoneToVerify(phoneNumber);
    setShowPhoneVerification(true);
  };

  const handlePhoneVerificationSuccess = async () => {
    if (!authUser) return;
    try {
      await updateDoc(doc(db, "users", authUser.uid), {
        phoneVerified: true,
        updatedAt: new Date().toISOString(),
      });
      toast.success("Phone number verified successfully");
    } catch (error) {
      console.error("Error updating phone verification status:", error);
      toast.error("Failed to update verification status");
    }
  };

  const handleStateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedStateValue = e.target.value;
    const stateCode =
      states.find((s) => s.state === selectedStateValue)?.code || "";
    setSelectedState(selectedStateValue);
    setDistricts(stateCode ? getIndiaDistrict(stateCode) : []);
  };

  const handleAddSkill = async (newSkill: Omit<Skill, "id">) => {
    if (!authUser) return;
    try {
      const updatedSkills = [...(profile?.skills || []), newSkill];
      await updateDoc(doc(db, "users", authUser.uid), {
        skills: updatedSkills,
        updatedAt: new Date().toISOString(),
      });
      toast.success("Skill added successfully");
    } catch (error) {
      console.error("Error adding skill:", error);
      toast.error("Failed to add skill");
    }
  };

  const profileCompletion = profile
    ? calculateProfileCompletion(profile)
    : { percentage: 0, sections: [] };

  // Show dialog when profile completion reaches 100%
  useEffect(() => {
    if (profileCompletion.percentage === 100) {
      setShowProfileCompletionDialog(true);
    }
  }, [profileCompletion.percentage]);

  if (profileLoading) {
    return <div>Loading...</div>;
  }

  return (
    <DashboardLayout activeRoute="profile" userData={profile} user={authUser}>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">My Profile</h1>
        <Button disabled={isSaving}>
          {isSaving ? "Saving..." : "Save Changes"}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1">
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center">
                <Avatar className="h-24 w-24 mb-4" key={imageKey}>
                  <AvatarImage
                    src={
                      profile?.photoURL
                        ? `${profile.photoURL}?${Date.now()}`
                        : ""
                    }
                    alt={profile?.firstName || "User"}
                    onError={(e) => {
                      const img = e.target as HTMLImageElement;
                      img.src = "/placeholder-user.jpg";
                      console.error(
                        "Error loading image, fallback to placeholder"
                      );
                    }}
                    className="object-cover"
                  />
                  <AvatarFallback>
                    {profile?.firstName?.[0]?.toUpperCase() || "U"}
                    {profile?.lastName?.[0]?.toUpperCase() || ""}
                  </AvatarFallback>
                </Avatar>
                <h2 className="text-xl font-bold">
                  {profile?.firstName
                    ? `${profile.firstName} ${profile.lastName}`
                    : authUser?.displayName || "Complete Your Profile"}
                </h2>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-4 w-full"
                  disabled={isUploadingPhoto}
                  onClick={() =>
                    document.getElementById("photo-upload")?.click()
                  }
                >
                  {isUploadingPhoto ? (
                    <>
                      <Upload className="h-4 w-4 mr-2" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4 mr-2" />
                      Change Photo
                    </>
                  )}
                </Button>
                {isUploadingPhoto && (
                  <div className="w-full mt-2">
                    <Progress value={uploadProgress} className="h-2" />
                    <p className="text-xs text-muted-foreground text-center mt-1">
                      {uploadProgress}% uploaded
                    </p>
                  </div>
                )}
                <input
                  id="photo-upload"
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                />
              </div>

              <Separator className="my-6" />

              <div className="space-y-1">
                <p className="text-sm font-medium">Profile Completion</p>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary transition-all duration-500"
                    style={{ width: `${profileCompletion.percentage}%` }}
                  ></div>
                </div>
                <div className="flex justify-between items-center">
                  <div className="text-xs text-muted-foreground">
                    {profileCompletion.sections
                      .filter((s) => !s.completed)
                      .slice(0, 1)
                      .map((section) => (
                        <span key={section.name}>
                          Next: Complete {section.nextField || section.name}
                        </span>
                      ))}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {profileCompletion.percentage}%
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-3">
          <Tabs defaultValue="personal">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="personal">Personal Info</TabsTrigger>
              <TabsTrigger value="skills">Skills</TabsTrigger>
              <TabsTrigger value="completed-works">Completed Works</TabsTrigger>
            </TabsList>

            <TabsContent value="personal" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Personal Information</CardTitle>
                  <CardDescription>
                    Update your personal details
                  </CardDescription>
                </CardHeader>
                <form onSubmit={handleSaveChanges}>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="first-name">First name</Label>
                        <Input
                          id="first-name"
                          defaultValue={
                            profile?.firstName ||
                            authUser?.displayName?.split(" ")[0]
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="last-name">Last name</Label>
                        <Input
                          id="last-name"
                          defaultValue={
                            profile?.lastName ||
                            authUser?.displayName?.split(" ")[1]
                          }
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        defaultValue={profile?.email || authUser?.email}
                        disabled
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone number</Label>
                      <div className="flex space-x-2">
                        <Input
                          id="phone"
                          type="tel"
                          defaultValue={profile?.phone || "+91"}
                          className={profile?.phoneVerified ? "border-green-500" : ""}
                        />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <Label className="text-base">Permanent Address</Label>
                      <div className="space-y-2">
                        <Label htmlFor="permanent-address">
                          Street Address
                        </Label>
                        <Textarea
                          id="permanent-address"
                          className="min-h-[80px]"
                          defaultValue={
                            profile?.permanentAddress?.street || ""
                          }
                          placeholder="Enter your street address"
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="state">State</Label>
                          <select
                            id="state"
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2"
                            defaultValue={
                              profile?.permanentAddress?.state || ""
                            }
                            onChange={handleStateChange}
                          >
                            <option value="">Select State</option>
                            {states.map((state) => (
                              <option key={state.code} value={state.state}>
                                {state.state}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="district">District</Label>
                          <select
                            id="district"
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2"
                            defaultValue={
                              profile?.permanentAddress?.district || ""
                            }
                            disabled={districts.length === 0}
                          >
                            <option value="">Select District</option>
                            {districts.map((district) => (
                              <option key={district} value={district}>
                                {district}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="pincode">Pincode</Label>
                          <Input
                            id="pincode"
                            type="text"
                            maxLength={6}
                            defaultValue={
                              profile?.permanentAddress?.pincode || ""
                            }
                            placeholder="Enter pincode"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2 relative">
                        <Label htmlFor="dob">Date of Birth</Label>
                        <Input
                          id="dob"
                          type="text"
                          readOnly
                          onClick={() => setShowCalendar(true)}
                          value={
                            selectedDate
                              ? selectedDate.toLocaleDateString()
                              : profile?.dateOfBirth || ""
                          }
                        />
                        {showCalendar && (
                          <div className="absolute z-50 mt-1">
                            <CalendarComponent
                              onChange={(date) => {
                                setSelectedDate(date as Date);
                                setShowCalendar(false);
                              }}
                              value={selectedDate}
                            />
                          </div>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="gender">Gender</Label>
                        <select
                          id="gender"
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2"
                          defaultValue={profile?.gender || ""}
                        >
                          <option value="">Select Gender</option>
                          <option value="male">Male</option>
                          <option value="female">Female</option>
                          <option value="prefer-not-to-say">
                            Prefer not to say
                          </option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="bio">Professional Bio</Label>
                      <Textarea
                        id="bio"
                        className="min-h-[120px]"
                        defaultValue={profile?.bio || ""}
                      />
                    </div>

                    <div className="space-y-4">
                      <Label className="text-base">Current Location</Label>
                      <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="current-city">City</Label>
                          <Input
                            id="current-city"
                            defaultValue={profile?.currentLocation?.city || ""}
                            placeholder="Enter your current city"
                          />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button type="submit" disabled={isSaving}>
                      {isSaving ? "Saving..." : "Save Changes"}
                    </Button>
                  </CardFooter>
                </form>
              </Card>
            </TabsContent>

            <TabsContent value="skills" className="mt-6">
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle>Skills</CardTitle>
                      <CardDescription>
                        Add your technical and professional skills
                      </CardDescription>
                    </div>
                    <Button size="sm" onClick={() => setShowAddSkill(true)}>
                      <Code className="h-4 w-4 mr-2" />
                      Add Skill
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {Object.values(SkillCategory).map((category) => {
                      const categorySkills = profile?.skills?.filter(
                        (skill: Skill) => skill.category === category
                      );

                      if (!categorySkills?.length) return null;

                      return (
                        <div key={category} className="space-y-4">
                          <h3 className="font-medium text-lg">{category}</h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {categorySkills.map(
                              (skill: Skill, index: number) => (
                                <div
                                  key={index}
                                  className="border rounded-lg p-4 space-y-2"
                                >
                                  <div className="flex justify-between items-start">
                                    <div>
                                      <h4 className="font-medium">
                                        {skill.name}
                                      </h4>
                                      <div className="flex items-center space-x-2">
                                        <Badge variant="secondary">
                                          {skill.level}
                                        </Badge>
                                        {skill.yearsOfExperience && (
                                          <span className="text-sm text-muted-foreground">
                                            {skill.yearsOfExperience} years
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                    <Button variant="ghost" size="sm">
                                      Edit
                                    </Button>
                                  </div>
                                  {skill.description && (
                                    <p className="text-sm text-muted-foreground">
                                      {skill.description}
                                    </p>
                                  )}
                                </div>
                              )
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="completed-works" className="mt-6">
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle>Completed Works</CardTitle>
                      <CardDescription>
                        These are jobs you have completed through the platform
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {completedJobs.length === 0 && (
                      <div className="col-span-full text-center py-12 text-muted-foreground">No completed jobs yet.</div>
                    )}
                    {completedJobs.map((job, index) => {
                      const jobStatus = job.jobStatus || job.status;
                      const isPaid = String(jobStatus).toLowerCase() === "payment received";
                      return (
                        <div
                          key={index}
                          className="bg-card border rounded-lg p-4"
                        >
                          <h3 className="font-medium">{job.jobTitle || job.title || "Untitled Job"}</h3>
                          <p className="text-sm text-muted-foreground">{job.company || "Unknown Company"}</p>
                          <div className="mt-4 flex items-center justify-between">
                            <div className="flex items-center text-sm text-muted-foreground">
                              <CalendarIcon className="h-4 w-4 mr-2" />
                              <span>
                                Applied {job.appliedDate || (job.createdAt?.seconds ? new Date(job.createdAt.seconds * 1000).toLocaleDateString() : "")}
                              </span>
                            </div>
                            <div className="flex items-center">
                              <span className="text-sm font-medium capitalize">
                                {jobStatus}
                              </span>
                            </div>
                          </div>
                          {/* Paid badge */}
                          {isPaid && (
                            <span className="ml-2" title="Paid">
                              <svg width="32" height="32" viewBox="0 0 512 512" fill="none">
                                <circle cx="256" cy="256" r="256" fill="#C6F6D5"/>
                                <circle cx="256" cy="256" r="208" fill="#fff" stroke="#38A169" strokeWidth="16"/>
                                <path d="M160 256l64 64 128-128" stroke="#38A169" strokeWidth="24" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                                <text
                                  x="50%"
                                  y="60%"
                                  textAnchor="middle"
                                  fill="#222"
                                  fontSize="96"
                                  fontWeight="bold"
                                  fontFamily="Arial, sans-serif"
                                  dy=".3em"
                                >PAID</text>
                              </svg>
                            </span>
                          )}
                        </div>
                      );
                    })}
                    {/* Payment warning if any completed job is not paid */}
                    {completedJobs.length > 0 &&
                      completedJobs.filter(job => String((job.jobStatus || job.status)).toLowerCase() !== "payment received").length > 0 && (
                        <div className="col-span-full text-center py-4">
                          <p className="text-warning-foreground">Payment not received for some completed jobs.</p>
                        </div>
                      )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
      {/* <PhoneVerificationModal
        isOpen={showPhoneVerification}
        onClose={() => setShowPhoneVerification(false)}
        phone={phoneToVerify}
        onVerificationSuccess={handlePhoneVerificationSuccess}
      /> */}
      <AddSkillDialog
        isOpen={showAddSkill}
        onClose={() => setShowAddSkill(false)}
        onAdd={handleAddSkill}
      />
      <ProfileCompletionDialog
        isOpen={showProfileCompletionDialog}
        onClose={() => setShowProfileCompletionDialog(false)}
      />
    </DashboardLayout>
  );
}
