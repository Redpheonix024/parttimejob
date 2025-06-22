"use client";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Bell, Menu } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";

interface AdminHeaderProps {
  toggleSidebar: () => void;
}

export default function AdminHeader({ toggleSidebar }: AdminHeaderProps) {
  return (
    <header className="bg-background border-b sticky top-0 z-10 h-16">
      <div className="h-full flex items-center justify-between px-4">
        <div className="flex items-center">
          <Button variant="ghost" size="icon" onClick={toggleSidebar} className="lg:hidden mr-2">
            <Menu className="h-5 w-5" />
          </Button>
          <div className="flex-1 md:block text-lg font-semibold">
            <div className="flex items-center gap-2">
              <img 
                src="/icons/PTJ SVG.svg" 
                alt="Parttimejob Logo" 
                className="h-8 w-auto hidden md:block"
              />
              <h1 className="text-lg md:text-xl font-bold truncate max-w-[180px] md:max-w-full">Admin Dashboard</h1>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 md:gap-4">
          <ThemeToggle />
          <Button variant="ghost" size="icon" className="relative hidden md:flex">
            <Bell className="h-5 w-5" />
            <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-primary"></span>
          </Button>
          <div className="flex items-center gap-2">
            <Avatar className="h-8 w-8">
              <AvatarImage
                src="/placeholder.svg?height=32&width=32"
                alt="Admin"
              />
              <AvatarFallback>AD</AvatarFallback>
            </Avatar>
            <div className="hidden md:block">
              <p className="text-sm font-medium">Admin User</p>
              <p className="text-xs text-muted-foreground">
                admin@Parttimejob.com
              </p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
