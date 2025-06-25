"use client";

import type React from "react";
import { useState, useEffect } from "react";
import DashboardSidebar from "@/components/dashboard/dashboard-sidebar";
import DashboardHeader from "@/components/dashboard/dashboard-header";

interface DashboardLayoutProps {
  children: React.ReactNode;
  activeRoute: string;
  userData?: any;
  user?: any;
}

// Define toggle function type if not already defined globally
type ToggleSidebarFunc = () => void;

export default function DashboardLayout({
  children,
  activeRoute,
  userData,
  user,
}: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(Date.now());

  // Force a refresh of the header when profile picture changes
  useEffect(() => {
    setRefreshKey(Date.now());
  }, [userData?.profilePicture, userData?.photoURL]);

  const toggleSidebar = () => {
    // For mobile, toggle the mobile sidebar
    if (window.innerWidth < 768) {
      setMobileSidebarOpen(!mobileSidebarOpen);
    } else {
      // For desktop, toggle the regular sidebar
      setSidebarOpen(!sidebarOpen);
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      <DashboardSidebar
        activeRoute={activeRoute}
        isOpen={sidebarOpen}
        mobileOpen={mobileSidebarOpen}
        setMobileOpen={setMobileSidebarOpen}
        userData={userData}
        user={user}
        toggleSidebar={toggleSidebar}
      />

      <div className="flex-1 min-w-0 overflow-auto">
        <DashboardHeader
          key={refreshKey}
          toggleSidebar={toggleSidebar}
          userData={userData}
          user={user}
        />

        <main className="container mx-auto px-4 py-8">
          {children}
        </main>
      </div>
    </div>
  );
}
