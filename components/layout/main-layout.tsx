"use client"

import type React from "react"
import { useState, useEffect } from "react"
import Header from "@/components/layout/header"
import Footer from "@/components/layout/footer"
import MainSidebar from "@/components/layout/main-sidebar"
import { useUserProfile } from "@/hooks/useUserProfile"
import { useAuth } from "@/hooks/useAuth"

interface MainLayoutProps {
  children: React.ReactNode
  showNav?: boolean
  activeLink?: string
}

export default function MainLayout({ children, showNav = true, activeLink }: MainLayoutProps) {
  const { profile } = useUserProfile();
  const { user } = useAuth();
  const [refreshKey, setRefreshKey] = useState(Date.now());
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  
  // Force a refresh of the header when profile changes
  useEffect(() => {
    setRefreshKey(Date.now());
  }, [profile?.profilePicture]);
  
  const toggleMobileSidebar = () => {
    setMobileSidebarOpen(!mobileSidebarOpen);
  };
  
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header 
        key={refreshKey} 
        showNav={showNav} 
        activeLink={activeLink} 
        userData={profile || {}} 
        toggleMobileSidebar={toggleMobileSidebar}
      />
      
      {/* Mobile sidebar that only renders for logged-in users */}
      <MainSidebar 
        activeLink={activeLink}
        isOpen={mobileSidebarOpen}
        setIsOpen={setMobileSidebarOpen}
        userData={profile}
        user={user}
      />
      
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  )
}

