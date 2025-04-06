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
          setAuthState("authenticated");
          
          // Get the token and update the admin-session cookie
          const idToken = await user.getIdToken(true); // Force refresh to get a new token
          document.cookie = `admin-session=${idToken}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Strict;`;
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

    return () => unsubscribe();
  }, [router]);

  // While checking authentication or if unauthenticated, show loading screen
  if (authState !== "authenticated") {
    return <LoadingScreen />;
  }

  // User is authenticated as admin, render children
  return <>{children}</>;
} 