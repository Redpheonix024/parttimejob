"use client";

import { useState, useEffect } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
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
} from "lucide-react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { uploadToS3, deleteFromS3 } from "@/app/utils/aws-config";
import { PhoneVerificationModal } from "@/components/phone-verification-modal";
import { toast } from "sonner";
import { getIndiaState, getIndiaDistrict } from "@/app/data/india-states";
import { Skill, SkillCategory } from "@/types/user";
import { AddSkillDialog } from "@/components/skills/add-skill-dialog";
import { calculateProfileCompletion } from "@/app/utils/profile-completion";

export default function Profile() {
  const [user, setUser] = useState<any>(null);
  const [userData, setUserData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [imageKey, setImageKey] = useState(0);
  const [showCalendar, setShowCalendar] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showPhoneVerification, setShowPhoneVerification] = useState(false);
  const [phoneToVerify, setPhoneToVerify] = useState("");
  const states = getIndiaState();
  const [selectedState, setSelectedState] = useState(
    userData?.permanentAddress?.state || ""
  );
  const [districts, setDistricts] = useState<string[]>([]);
  const [showAddSkill, setShowAddSkill] = useState(false);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUser(user);
        await fetchUserData(user.uid);
      }
    });

    return () => unsubscribe();
  }, []);

  const createInitialUserData = (uid: string, user: any) => {
    return {
      uid,
      email: user.email,
      firstName: user.displayName?.split(" ")[0] || "",
      lastName: user.displayName?.split(" ")[1] || "",
      photoURL: user.photoURL || "",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      phoneVerified: false, // Explicit initialization
      phone: "", // Add empty phone field
      skills: [],
      completedWorks: [],
    };
  };

  const fetchUserData = async (uid: string) => {
    try {
      const userDocRef = doc(db, "users", uid);
      const userDoc = await getDoc(userDocRef);

      if (!userDoc.exists()) {
        const initialData = createInitialUserData(uid, user);
        await setDoc(userDocRef, initialData);
        setUserData(initialData);
      } else {
        const data = userDoc.data();
        setUserData(data);

        // Initialize districts if permanent address exists
        if (data?.permanentAddress?.state) {
          const stateCode = states.find(
            (s) => s.state === data.permanentAddress.state
          )?.code;
          if (stateCode) {
            setDistricts(getIndiaDistrict(stateCode));
            setSelectedState(data.permanentAddress.state);
          }
        }
      }
    } catch (error) {
      console.error("Error fetching/creating user data:", error);
      toast.error("Error loading profile data");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveChanges = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
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
        email: user.email,
        updatedAt: new Date().toISOString(),
      };

      await updateDoc(doc(db, "users", user.uid), formData);
      setUserData({ ...userData, ...formData });
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
    if (!event.target.files?.[0]) return;

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
    try {
      const loadingToast = toast.loading("Uploading photo...");
      const buffer = Buffer.from(await file.arrayBuffer());
      const newKey = `profile-photos/${user.uid}/${Date.now()}.jpg`;

      // Delete old photo if exists
      if (userData?.photoURL) {
        const oldPhotoKey = userData.photoURL.split(".com/").pop();
        if (oldPhotoKey) {
          await deleteFromS3(oldPhotoKey);
        }
      }

      const photoURL = await uploadToS3(buffer, newKey, file.type);
      if (!photoURL) throw new Error("Failed to get photo URL");

      const userDocRef = doc(db, "users", user.uid);
      await updateDoc(userDocRef, {
        photoURL,
        updatedAt: new Date().toISOString(),
      });

      setUserData((prev) => ({
        ...prev,
        photoURL,
        updatedAt: new Date().toISOString(),
      }));

      setImageKey((prev) => prev + 1);
      toast.dismiss(loadingToast);
      toast.success("Profile photo updated successfully");
    } catch (error) {
      console.error("Error updating photo:", error);
      toast.error("Failed to update profile photo");
    } finally {
      setIsUploadingPhoto(false);
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
    if (!user) return;
    try {
      await updateDoc(doc(db, "users", user.uid), {
        phoneVerified: true,
        updatedAt: new Date().toISOString(),
      });
      setUserData({ ...userData, phoneVerified: true });
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
    if (!user) return;
    try {
      const updatedSkills = [...(userData?.skills || []), newSkill];
      await updateDoc(doc(db, "users", user.uid), {
        skills: updatedSkills,
        updatedAt: new Date().toISOString(),
      });
      setUserData({ ...userData, skills: updatedSkills });
      toast.success("Skill added successfully");
    } catch (error) {
      console.error("Error adding skill:", error);
      toast.error("Failed to add skill");
    }
  };

  const profileCompletion = userData
    ? calculateProfileCompletion(userData)
    : { percentage: 0, sections: [] };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <DashboardLayout activeRoute="profile" userData={userData} user={user}>
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
                      userData?.photoURL
                        ? `${userData.photoURL}?${Date.now()}`
                        : ""
                    }
                    alt={userData?.firstName || "User"}
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
                    {userData?.firstName?.[0]?.toUpperCase() || "U"}
                    {userData?.lastName?.[0]?.toUpperCase() || ""}
                  </AvatarFallback>
                </Avatar>
                <h2 className="text-xl font-bold">
                  {userData?.firstName
                    ? `${userData.firstName} ${userData.lastName}`
                    : user?.displayName || "Complete Your Profile"}
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
                      <span className="animate-spin mr-2">◌</span>
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4 mr-2" />
                      Change Photo
                    </>
                  )}
                </Button>
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
                            userData?.firstName ||
                            user?.displayName?.split(" ")[0]
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="last-name">Last name</Label>
                        <Input
                          id="last-name"
                          defaultValue={
                            userData?.lastName ||
                            user?.displayName?.split(" ")[1]
                          }
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        defaultValue={userData?.email || user?.email}
                        disabled
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone number</Label>
                      <div className="flex space-x-2">
                        <Input
                          id="phone"
                          type="tel"
                          defaultValue={userData?.phone || "+91"}
                          className={
                            userData?.phoneVerified ? "border-green-500" : ""
                          }
                        />
                        <Button
                          type="button"
                          variant={
                            userData?.phoneVerified ? "outline" : "default"
                          }
                          onClick={() =>
                            handlePhoneSubmit(
                              (
                                document.getElementById(
                                  "phone"
                                ) as HTMLInputElement
                              ).value
                            )
                          }
                          className={
                            userData?.phoneVerified ? "text-green-500" : ""
                          }
                        >
                          {userData?.phoneVerified ? "Verified ✓" : "Verify"}
                        </Button>
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
                            userData?.permanentAddress?.street || ""
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
                              userData?.permanentAddress?.state || ""
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
                              userData?.permanentAddress?.district || ""
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
                              userData?.permanentAddress?.pincode || ""
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
                              : userData?.dateOfBirth || ""
                          }
                        />
                        {showCalendar && (
                          <div className="absolute z-50 mt-1">
                            <Calendar
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
                          defaultValue={userData?.gender || ""}
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
                        defaultValue={userData?.bio || ""}
                      />
                    </div>

                    <div className="space-y-4">
                      <Label className="text-base">Current Location</Label>
                      <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="current-city">City</Label>
                          <Input
                            id="current-city"
                            defaultValue={userData?.currentLocation?.city || ""}
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
                      const categorySkills = userData?.skills?.filter(
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
                        Add your previously completed projects and works
                      </CardDescription>
                    </div>
                    <Button size="sm">
                      <CheckSquare className="h-4 w-4 mr-2" />
                      Add Work
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {userData?.completedWorks?.map(
                      (work: any, index: number) => (
                        <div
                          key={index}
                          className="border-b pb-6 last:border-0 last:pb-0"
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-medium">{work.title}</h3>
                              <p className="text-sm text-muted-foreground">
                                {work.client}
                              </p>
                              <p className="text-xs text-muted-foreground mt-1">
                                {work.completionDate}
                              </p>
                            </div>
                            <Button variant="ghost" size="sm">
                              Edit
                            </Button>
                          </div>
                          {work.description && (
                            <p className="text-sm mt-2">{work.description}</p>
                          )}
                        </div>
                      )
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
      <PhoneVerificationModal
        isOpen={showPhoneVerification}
        onClose={() => setShowPhoneVerification(false)}
        phone={phoneToVerify}
        onVerificationSuccess={handlePhoneVerificationSuccess}
      />
      <AddSkillDialog
        isOpen={showAddSkill}
        onClose={() => setShowAddSkill(false)}
        onAdd={handleAddSkill}
      />
    </DashboardLayout>
  );
}
