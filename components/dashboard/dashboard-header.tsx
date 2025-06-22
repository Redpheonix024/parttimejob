"use client";

import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Bell, LogOut, Menu, MessageSquare, Settings, User } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

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
  const router = useRouter();
  const { logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <header className="bg-background border-b sticky top-0 z-10">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="md:hidden">
          <Button variant="ghost" size="icon" onClick={toggleSidebar}>
            <Menu className="h-5 w-5" />
          </Button>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/" className="group">
            <div className="p-1.5 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
              <img 
                src="/icons/PTJ SVG.svg" 
                alt="Parttimejob Logo" 
                className="h-8 w-auto drop-shadow-md"
              />
            </div>
          </Link>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
            Dashboard
          </h1>
        </div>
        <div className="flex items-center ml-auto">
          <ThemeToggle />
          {/* <Button variant="ghost" size="icon" className="mr-2 relative">
            <Bell className="h-5 w-5" />
            <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-primary"></span>
          </Button>
          <Button variant="ghost" size="icon" className="mr-2 relative">
            <MessageSquare className="h-5 w-5" />
            <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-primary"></span>
          </Button> */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Avatar className="h-8 w-8 cursor-pointer">
                <AvatarImage 
                  src={`${userData?.profilePicture || userData?.photoURL || user?.photoURL || "/placeholder-user.jpg"}?t=${Date.now()}`}
                  alt={userData?.firstName || user?.displayName || "User"} 
                  style={{ objectFit: "cover" }}
                />
                <AvatarFallback>
                  {userData?.firstName?.[0]?.toUpperCase() || user?.displayName?.[0] || ""}
                </AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link href="/dashboard">
                  <div className="flex items-center w-full">
                    <User className="h-4 w-4 mr-2" />
                    Dashboard
                  </div>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/dashboard/profile">
                  <div className="flex items-center w-full">
                    <User className="h-4 w-4 mr-2" />
                    Profile
                  </div>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/dashboard/settings">
                  <div className="flex items-center w-full">
                    <Settings className="h-4 w-4 mr-2" />
                    Settings
                  </div>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}


