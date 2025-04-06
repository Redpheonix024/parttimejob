"use client"

import type React from "react"
import { useState } from "react"
import EmployerSidebar from "@/components/dashboard/employer/sidebar"
import EmployerHeader from "@/components/dashboard/employer/header"
import EmployerMobileTabs from "@/components/dashboard/employer/mobile-tabs"

interface EmployerDashboardLayoutProps {
  children: React.ReactNode
  activeRoute: string
}

export default function EmployerDashboardLayout({ children, activeRoute }: EmployerDashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [activeTab, setActiveTab] = useState(activeRoute)

  const handleTabChange = (value: string) => {
    setActiveTab(value)
    // In a real app, you would use router.push here
    window.location.href = value === "overview" ? "/dashboard/employer" : `/dashboard/employer/${value}`
  }

  return (
    <div className="min-h-screen bg-background flex">
      <EmployerSidebar activeRoute={activeRoute} isOpen={sidebarOpen} />

      <div className="flex-1 min-w-0 overflow-auto">
        <EmployerHeader toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

        <main className="container mx-auto px-4 py-8">
          <EmployerMobileTabs activeTab={activeTab} onTabChange={handleTabChange} />
          {children}
        </main>
      </div>
    </div>
  )
}

