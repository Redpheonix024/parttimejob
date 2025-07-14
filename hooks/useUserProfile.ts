import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { usersApi } from '../utils/api';
import { getFirebaseDb } from '@/utils/firebase-client';

// Safe Firebase initialization
const initializeFirebase = async () => {
  try {
    const { initializeApp, getApps } = await import("firebase/app");
    const { getFirestore } = await import("firebase/firestore");
    
    const firebaseConfig = {
      apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
      authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
      appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
      measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
    };

    // Check if config is valid
    if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
      console.warn("Firebase configuration is incomplete");
      return null;
    }

    const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
    const db = getFirestore(app);
    
    return { db };
  } catch (error) {
    console.error("Failed to initialize Firebase:", error);
    return null;
  }
};

export function useUserProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user?.uid) {
      fetchUserProfile(user.uid);
    }
  }, [user?.uid]);

  const fetchUserProfile = async (userId: string) => {
    try {
      setLoading(true);
      
      const db = await getFirebaseDb();
      if (!db) {
        setError("Firebase not available");
        return;
      }

      // Fetch user data directly from Firestore
      const { doc, getDoc } = await import("firebase/firestore");
      const userDocRef = doc(db, "users", userId);
      const userDoc = await getDoc(userDocRef);
      
      if (userDoc.exists()) {
        setProfile(userDoc.data());
      } else {
        console.warn("User document not found");
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to load user profile');
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateProfilePicture = async (imageUrl: string) => {
    if (!user?.uid) return null;
    
    try {
      setLoading(true);
      const updatedProfile = await usersApi.updateUser({
        id: user.uid,
        profilePicture: imageUrl,
        photoURL: imageUrl,
      });
      
      setProfile((prev: any) => ({
        ...prev,
        profilePicture: imageUrl,
        photoURL: imageUrl,
      }));
      
      return updatedProfile;
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to update profile picture');
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Get the best available profile picture
  const getProfilePicture = () => {
    // First check if user has a custom uploaded profile picture
    if (profile?.profilePicture) {
      return profile.profilePicture;
    }
    
    // Otherwise use Firebase auth photoURL if available
    if (user?.photoURL) {
      return user.photoURL;
    }
    
    // Default placeholder
    return "/placeholder.svg?height=64&width=64";
  };

  // Expose a method to manually refetch the profile
  const refetchProfile = async () => {
    if (user?.uid) {
      await fetchUserProfile(user.uid);
    }
  };

  return {
    profile,
    loading,
    error,
    updateProfilePicture,
    getProfilePicture,
    refetchProfile,
  };
} 