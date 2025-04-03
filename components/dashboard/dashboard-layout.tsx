"use client"

import type React from "react"
import { useState } from "react"
import DashboardSidebar from "@/components/dashboard/dashboard-sidebar"
import DashboardHeader from "@/components/dashboard/dashboard-header"
import MobileTabs from "@/components/dashboard/mobile-tabs"

interface DashboardLayoutProps {
  children: React.ReactNode
  activeRoute: string
  userData?: any
  user?: any
}

export default function DashboardLayout({ 
  children, 
  activeRoute,
  userData, 
  user,
}: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [activeTab, setActiveTab] = useState(activeRoute)

  const handleTabChange = (value: string) => {
    setActiveTab(value)
    // In a real app, you would use router.push here
    window.location.href = value === "overview" ? "/dashboard" : `/dashboard/${value}`
  }

  return (
    <div className="min-h-screen bg-background flex">
      <DashboardSidebar activeRoute={activeRoute} isOpen={sidebarOpen} />

      <div className="flex-1 min-w-0 overflow-auto">
        <DashboardHeader toggleSidebar={() => setSidebarOpen(!sidebarOpen)} userData={userData} user={user} />

        <main className="container mx-auto px-4 py-8">
          <MobileTabs activeTab={activeTab} onTabChange={handleTabChange} />
          {children}
        </main>
      </div>
    </div>
  )
}

