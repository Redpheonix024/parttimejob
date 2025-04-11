"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { app } from "@/app/config/firebase";

export default function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const auth = getAuth(app);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      // Public paths that don't require authentication
      const publicPaths = ["/", "/login", "/register"];
      
      // Check if path is a job details page
      const isJobDetailsPage = pathname.startsWith("/jobs/");
      
      // Admin paths that should not redirect to /login but to /admin/login instead
      const isAdminPath = pathname.startsWith("/admin");
      
      // Check if current path is public
      const isPublicPath = publicPaths.includes(pathname) || isJobDetailsPage;

      if (!user && !isPublicPath && !isAdminPath) {
        // For non-admin paths, redirect to regular login
        router.push("/login");
      } else if (!user && isAdminPath && pathname !== "/admin/login") {
        // For admin paths except admin login, redirect to admin login
        router.push("/admin/login");
      } else if (user && pathname === "/login") {
        // Redirect authenticated users away from login page
        router.push("/dashboard");
      }
    });

    return () => unsubscribe();
  }, [auth, router, pathname]);

  return children;
}
