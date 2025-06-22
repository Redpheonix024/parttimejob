"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/app/config/firebase";
import { checkAdminRole } from "@/app/utils/admin";
import LoadingScreen from "./LoadingScreen";

export default function AdminGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [authState, setAuthState] = useState<"loading" | "authenticated" | "unauthenticated">("loading");

  useEffect(() => {
    // Function to handle redirection for unauthenticated users
    const redirectToLogin = () => {
      router.push("/admin/login");
    };

    // Function to refresh token and update cookie
    const refreshTokenAndCookie = async (user: any) => {
      try {
        const idToken = await user.getIdToken(true); // Force refresh token
        // Set cookie with shorter expiration (4 hours) to ensure more frequent refreshes
        document.cookie = `admin-session=${idToken}; path=/; max-age=${60 * 60 * 4}; SameSite=Strict;`;
        return true;
      } catch (error) {
        console.error("Error refreshing token:", error);
        return false;
      }
    };
    
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        // User is not authenticated
        setAuthState("unauthenticated");
        redirectToLogin();
        return;
      }
      
      try {
        // Check if user has admin role
        const hasAdminRole = await checkAdminRole(user.uid);
        
        if (hasAdminRole) {
          // User is authenticated and has admin role
          // Refresh token and update cookie
          const refreshSuccess = await refreshTokenAndCookie(user);
          if (refreshSuccess) {
            setAuthState("authenticated");
          } else {
            setAuthState("unauthenticated");
            redirectToLogin();
          }
        } else {
          // User is authenticated but not an admin
          setAuthState("unauthenticated");
          redirectToLogin();
        }
      } catch (error) {
        console.error("Error checking admin role:", error);
        setAuthState("unauthenticated");
        redirectToLogin();
      }
    });

    // Set up periodic token refresh (every 3.5 hours)
    const refreshInterval = setInterval(async () => {
      const currentUser = auth.currentUser;
      if (currentUser) {
        await refreshTokenAndCookie(currentUser);
      }
    }, 3.5 * 60 * 60 * 1000);

    return () => {
      unsubscribe();
      clearInterval(refreshInterval);
    };
  }, [router]);

  // While checking authentication or if unauthenticated, show loading screen
  if (authState !== "authenticated") {
    return <LoadingScreen />;
  }

  // User is authenticated as admin, render children
  return <>{children}</>;
}