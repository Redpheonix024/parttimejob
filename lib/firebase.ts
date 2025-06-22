import {
  collection,
  getDocs,
  doc,
  getDoc,
  deleteDoc,
  updateDoc,
  setDoc,
  query,
  where,
  orderBy,
  DocumentData,
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
export const getJobs = async (filters?: {
  status?: string;
  location?: string;
  type?: string;
  sortBy?: string;
}) => {
  try {
    console.log(
      "%c[Firebase] Starting job fetch",
      "color: #2196F3; font-weight: bold"
    );
    console.log("%c[Firebase] Filters:", "color: #2196F3", filters);
    const jobsRef = collection(db, "jobs");

    // Create arrays to hold filter conditions and ordering
    const filterConditions = [
      // Always filter for active jobs unless status is explicitly specified
      where("status", "==", filters?.status || "Active"),
    ];

    // Add additional filters
    if (filters?.location && filters.location !== "anywhere") {
      filterConditions.push(where("location.city", "==", filters.location));
    }

    if (filters?.type && filters.type !== "all") {
      filterConditions.push(where("type", "==", filters.type));
    }

    // Create the query with filters and sorting
    const jobsQuery = query(
      jobsRef,
      ...filterConditions,
      // Always add sorting - default to newest first
      filters?.sortBy === "oldest"
        ? orderBy("createdAt", "asc")
        : orderBy("createdAt", "desc")
    );

    console.log(
      "%c[Firebase] Executing query with conditions:",
      "color: #2196F3",
      filterConditions
    );
    const snapshot = await getDocs(jobsQuery);

    if (snapshot.empty) {
      console.log(
        "%c[Firebase] No jobs found matching criteria",
        "color: #FF5252"
      );
      return [];
    }

    console.log(
      `%c[Firebase] Found ${snapshot.size} matching jobs`,
      "color: #4CAF50"
    );

    // Convert Firestore timestamps to JavaScript Dates
    const jobs = snapshot.docs.map((doc) => {
      const data = doc.data();
      const now = new Date();

      // Properly handle Firestore timestamps
      let createdAt = now;
      let updatedAt = now;

      try {
        if (data.createdAt?.toDate) {
          createdAt = data.createdAt.toDate();
        } else if (data.createdAt?.seconds) {
          createdAt = new Date(data.createdAt.seconds * 1000);
        } else if (data.createdAt) {
          createdAt = new Date(data.createdAt);
        }

        if (data.updatedAt?.toDate) {
          updatedAt = data.updatedAt.toDate();
        } else if (data.updatedAt?.seconds) {
          updatedAt = new Date(data.updatedAt.seconds * 1000);
        } else if (data.updatedAt) {
          updatedAt = new Date(data.updatedAt);
        } else {
          updatedAt = createdAt;
        }
      } catch (error) {
        console.error(
          "%c[Firebase] Error converting timestamps:",
          "color: #FF5252",
          error
        );
        // Use default values if conversion fails
      }

      // Ensure all required fields have default values
      return {
        id: doc.id,
        ...data,
        title: data.title || "Untitled Job",
        company: data.company || "Unknown Company",
        location: {
          ...(data.location || {}),
          city: data.location?.city || "",
          state: data.location?.state || "",
          address: data.location?.address || "",
          coordinates: data.location?.coordinates || null,
        },
        status: data.status || "Active",
        createdAt, // Use converted timestamp
        updatedAt, // Use converted timestamp
        description: data.description || "",
        requirements: Array.isArray(data.requirements) ? data.requirements : [],
        type: data.type || "Not specified",
        rate: data.rate || "Not specified",
        hours: data.hours || "Not specified",
        duration: data.duration || "Not specified",
        urgent: Boolean(data.urgent),
        featured: Boolean(data.featured),
        skills: Array.isArray(data.skills) ? data.skills : [],
      };
    });

    console.log("%c[Firebase] Jobs processed successfully", "color: #4CAF50");
    return jobs;
  } catch (error) {
    console.error("%c[Firebase] Error fetching jobs:", "color: #FF5252", error);
    throw error; // Let the API layer handle the error
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
