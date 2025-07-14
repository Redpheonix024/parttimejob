import { useState, useEffect } from 'react';
import { authApi } from '../utils/api';
import { getFirebaseAuth } from '@/utils/firebase-client';

// Safe Firebase initialization
const initializeFirebase = async () => {
  try {
    const { initializeApp, getApps } = await import("firebase/app");
    const { getAuth } = await import("firebase/auth");
    
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
    const auth = getAuth(app);
    
    return { auth };
  } catch (error) {
    console.error("Failed to initialize Firebase:", error);
    return null;
  }
};

export function useAuth() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const setupAuth = async () => {
      try {
        const auth = await getFirebaseAuth();
        if (auth) {
          const { onAuthStateChanged } = await import("firebase/auth");
          const unsubscribe = onAuthStateChanged(
            auth,
            (user) => {
              setUser(user);
              setLoading(false);
            },
            (error) => {
              setError(error.message);
              setLoading(false);
            }
          );

          return unsubscribe;
        } else {
          setLoading(false);
          setError("Firebase not available");
        }
      } catch (error) {
        setLoading(false);
        setError("Failed to initialize authentication");
      }
    };

    setupAuth();
  }, []);

  const logout = async () => {
    try {
      setLoading(true);
      const response = await authApi.logout();
      
      if (response.success) {
        setUser(null);
      } else {
        setError('Logout failed');
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  return {
    user,
    loading,
    error,
    isAuthenticated: !!user,
    logout
  };
} 