import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { usersApi } from '../utils/api';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/app/config/firebase';

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
      // Fetch user data directly from Firestore
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
        profilePicture: imageUrl
      });
      
      setProfile((prev: any) => ({
        ...prev,
        profilePicture: imageUrl
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

  return {
    profile,
    loading,
    error,
    updateProfilePicture,
    getProfilePicture
  };
} 