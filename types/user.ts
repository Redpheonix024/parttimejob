export interface UserProfile {
  uid: string; // Add this
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  title?: string;
  bio?: string;
  availability?: string;
  photoURL?: string;
  isPhotoUploaded?: boolean;
  experience?: WorkExperience[];
  education?: Education[];
  phoneVerified?: boolean; // Add this
  dateOfBirth?: string; // Add this
  gender?: string; // Add this
  permanentAddress?: PermanentAddress;
  currentLocation?: CurrentLocation;
  createdAt: string;
  updatedAt: string;
}

export interface WorkExperience {
  title: string;
  company: string;
  period: string;
  description: string;
}

export interface Education {
  degree: string;
  institution: string;
  period: string;
  description?: string;
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
