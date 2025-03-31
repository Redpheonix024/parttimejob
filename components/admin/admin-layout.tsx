"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import AdminSidebar from "@/components/admin/admin-sidebar"
import AdminHeader from "@/components/admin/admin-header"

interface AdminLayoutProps {
  children: React.ReactNode
  activeLink: string
  title?: string
}

export default function AdminLayout({ children, activeLink, title }: AdminLayoutProps) {
  const router = useRouter()
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)

  const handleLogout = () => {
    // In a real app, this would clear authentication state
    router.push("/admin/login")
  }

  return (
    <div className="min-h-screen bg-background flex">
      <AdminSidebar
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
        activeLink={activeLink}
        onLogout={handleLogout}
      />

      {/* Main content */}
      <div className="flex-1 min-w-0 overflow-auto">
        <AdminHeader toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} title={title} />

        <main className="container mx-auto px-4 py-8">{children}</main>
      </div>
    </div>
  )
}

