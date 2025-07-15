"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Bell, Menu, Plus, Search, User } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"
import Link from "next/link"
import { getAuth, onAuthStateChanged } from "firebase/auth"
import { app } from "@/app/config/firebase"

interface EmployerHeaderProps {
  toggleSidebar: () => void
}

export default function EmployerHeader({ toggleSidebar }: EmployerHeaderProps) {
  const auth = getAuth(app);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // Add your admin check logic here
        // This is a placeholder - replace with your actual admin check
        setIsAdmin(true); // Change this to your actual admin check
      } else {
        setIsAdmin(false);
      }
    });
    return () => unsubscribe();
  }, [auth]);
  return (
    <header className="bg-background border-b sticky top-0 z-10">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" className="md:hidden" onClick={toggleSidebar}>
            <Menu className="h-5 w-5" />
          </Button>
          <div className="hidden md:flex items-center">
            <div className="p-1.5 rounded-lg bg-primary/10 hover:bg-primary/20 transition-colors">
              <img 
                src="/icons/PTJ SVG.svg" 
                alt="Parttimejob Logo" 
                className="h-8 w-auto drop-shadow-md"
              />
            </div>
          </div>
        </div>

        <div className="flex-1 flex items-center justify-end md:justify-between">
          <div className="hidden md:flex relative w-full max-w-md">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input type="search" placeholder="Search..." className="pl-8 w-full bg-background" />
          </div>

          <div className="flex items-center gap-4">
            {/* Quick Switch Button */}
            <Link href="/dashboard/jobseeker">
              <Button variant="outline" size="sm" className="hidden md:flex">
                <User className="mr-2 h-4 w-4" />
                Switch to Job Seeker
              </Button>
            </Link>

            {isAdmin && (
              <Button variant="outline" size="sm" className="hidden md:flex">
                <Plus className="mr-2 h-4 w-4" />
                Post Job
              </Button>
            )}
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full"></span>
            </Button>
            <ThemeToggle />
          </div>
        </div>
      </div>
    </header>
  )
}

