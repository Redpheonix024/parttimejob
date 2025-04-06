"use client";

import React, { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/app/config/firebase";
import { checkAdminRole } from "@/app/utils/admin";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  
  useEffect(() => {
    // This effect will override the behavior from the root AuthProvider
    // For admin routes we want different behavior

    // Skip auth check for admin login page
    if (pathname === "/admin/login" || pathname.startsWith("/admin/forgot-password")) {
      return;
    }
    
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        // If not logged in, redirect to admin login
        router.push("/admin/login");
        return;
      }
      
      try {
        // Check if user has admin role
        const hasAdminRole = await checkAdminRole(user.uid);
        
        if (!hasAdminRole) {
          // User is logged in but not an admin
          router.push("/admin/login");
        }
      } catch (error) {
        console.error("Error checking admin role:", error);
        router.push("/admin/login");
      }
    });
    
    return () => unsubscribe();
  }, [pathname, router]);
  
  return <>{children}</>;
} 