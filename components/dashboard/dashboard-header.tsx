"use client";

import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Bell, Menu, MessageSquare } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";

interface DashboardHeaderProps {
  toggleSidebar: () => void;
  userData?: any; // Add userData prop
  user?: any; // Add user prop for Google profile
}

export default function DashboardHeader({
  toggleSidebar,
  userData,
  user,
}: DashboardHeaderProps) {
  return (
    <header className="bg-background border-b sticky top-0 z-10">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="md:hidden">
          <Button variant="ghost" size="icon" onClick={toggleSidebar}>
            <Menu className="h-5 w-5" />
          </Button>
        </div>
        <div className="md:hidden">
          <Link href="/" className="text-2xl font-bold text-primary">
            Parttimejob
          </Link>
        </div>
        <div className="flex items-center ml-auto">
          <ThemeToggle />
          <Button variant="ghost" size="icon" className="mr-2 relative">
            <Bell className="h-5 w-5" />
            <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-primary"></span>
          </Button>
          <Button variant="ghost" size="icon" className="mr-2 relative">
            <MessageSquare className="h-5 w-5" />
            <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-primary"></span>
          </Button>
          <Avatar className="h-8 w-8">
            <AvatarImage 
              src={userData?.photoURL || user?.photoURL || "/placeholder-user.jpg"} 
              alt={userData?.firstName || user?.displayName || "User"} 
              style={{ objectFit: "cover" }}
            />
            <AvatarFallback>
              {userData?.firstName?.[0]?.toUpperCase() || user?.displayName?.[0] || ""}
            </AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>
  );
}
