export interface UserProfile {
  uid: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneVerified: boolean; // Removed default value
  phone: string;
  dateOfBirth: string;
  gender: "male" | "female" | "other";
  professionalBio: string;
  permanentAddress: PermanentAddress;
  currentLocation: CurrentLocation;
  createdAt: string;
  updatedAt: string;

  // Optional fields that aren't part of profile completion
  bio?: string;
  availability?: string;
  photoURL?: string;
  isPhotoUploaded?: boolean;
  skills?: Skill[];
  completedWorks?: CompletedWork[];
}

export interface Skill {
  name: string;
  level: SkillLevel;
  category: SkillCategory;
  description?: string;
  yearsOfExperience?: number;
}

export enum SkillLevel {
  Beginner = "Beginner",
  Intermediate = "Intermediate",
  Advanced = "Advanced",
  Expert = "Expert",
}

export enum SkillCategory {
  Programming = "Programming",
  Design = "Design",
  Marketing = "Marketing",
  Sales = "Sales",
  BusinessDevelopment = "Business Development",
  Other = "Other",
}

export interface CompletedWork {
  title: string;
  client: string;
  completionDate: string;
  description?: string;
  skillsUsed?: string[];
  testimonial?: string;
  url?: string;
}

export interface PermanentAddress {
  street: string;
  state: string;
  district: string;
  pincode: string;
}

export interface CurrentLocation {
  city: string;
}
