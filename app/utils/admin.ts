import { doc, getDoc } from "firebase/firestore";
import { db } from "@/app/config/firebase";

// Check if a user has admin role
export async function isAdmin(uid: string): Promise<boolean> {
  try {
    // Check the users collection for document with admin role
    const userRef = doc(db, "users", uid);
    const userSnap = await getDoc(userRef);
    
    if (userSnap.exists()) {
      const userData = userSnap.data();
      return userData.role === "admin";
    }
    
    return false;
  } catch (error) {
    console.error("Error checking admin status:", error);
    return false;
  }
}

// Function to check admin role with caching for better performance
export function createAdminChecker() {
  const cache = new Map<string, boolean>();
  
  return async (uid: string): Promise<boolean> => {
    if (cache.has(uid)) {
      return cache.get(uid) as boolean;
    }
    
    const result = await isAdmin(uid);
    cache.set(uid, result);
    
    // Clear cache after 5 minutes
    setTimeout(() => {
      cache.delete(uid);
    }, 5 * 60 * 1000);
    
    return result;
  };
}

export const checkAdminRole = createAdminChecker(); 