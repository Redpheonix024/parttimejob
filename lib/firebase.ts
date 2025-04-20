import {
  collection,
  getDocs,
  doc,
  getDoc,
  deleteDoc,
  updateDoc,
  setDoc,
} from "firebase/firestore";
import { db, auth } from "@/app/config/firebase";

interface UserData {
  id: string;
  username?: string;
  email?: string;
  displayName?: string;
  settings?: {
    notifications: {
      email: {
        jobRecommendations: boolean;
        applicationUpdates: boolean;
        messages: boolean;
        marketing: boolean;
      };
      push: {
        newJobMatches: boolean;
        interviewReminders: boolean;
        applicationDeadlines: boolean;
      };
    };
    privacy: {
      profileVisibility: "everyone" | "employers" | "private";
      showOnlineStatus: boolean;
      showApplicationHistory: boolean;
      personalizedRecommendations: boolean;
      analytics: boolean;
    };
  };
  // Add other user properties as needed
}

// Helper functions
export const getJobs = async () => {
  try {
    const jobsRef = collection(db, "jobs");
    const snapshot = await getDocs(jobsRef);
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error("Error fetching jobs:", error);
    throw error;
  }
};

export const getUser = async (userId: string): Promise<UserData | null> => {
  try {
    const userRef = doc(db, "users", userId);
    const userDoc = await getDoc(userRef);
    if (userDoc.exists()) {
      return {
        id: userDoc.id,
        ...userDoc.data(),
      } as UserData;
    }
    return null;
  } catch (error) {
    console.error("Error fetching user:", error);
    throw error;
  }
};

export const updateUserSettings = async (
  userId: string,
  settings: Partial<UserData["settings"]>
) => {
  try {
    const userRef = doc(db, "users", userId);
    const userDoc = await getDoc(userRef);

    if (userDoc.exists()) {
      // Update existing settings
      await updateDoc(userRef, {
        settings: {
          ...userDoc.data().settings,
          ...settings,
        },
      });
    } else {
      // Create new user document with settings
      await setDoc(userRef, {
        settings,
      });
    }
    return true;
  } catch (error) {
    console.error("Error updating user settings:", error);
    throw error;
  }
};

export const deleteJob = async (jobId: string) => {
  try {
    const jobRef = doc(db, "jobs", jobId);
    await deleteDoc(jobRef);
    return true;
  } catch (error) {
    console.error("Error deleting job:", error);
    return false;
  }
};
