"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/app/config/firebase";
import { checkAdminRole } from "@/app/utils/admin";
import LoadingScreen from "@/components/auth/LoadingScreen";

export default function AdminRoot() {
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Check if user has admin privileges
        const isAdmin = await checkAdminRole(user.uid);
        if (isAdmin) {
          // User is already authenticated as admin, redirect to dashboard
          router.push("/admin/dashboard");
        } else {
          // User is authenticated but not an admin
          router.push("/admin/login");
        }
      } else {
        // No user is signed in, redirect to login
        router.push("/admin/login");
      }
    });

    return () => unsubscribe();
  }, [router]);

  return <LoadingScreen />;
} 