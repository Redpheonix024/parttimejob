"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Bell, Menu } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { auth } from "@/app/config/firebase";
import { User } from "firebase/auth";

interface AdminHeaderProps {
  toggleSidebar: () => void;
  title?: string;
}

export default function AdminHeader({
  toggleSidebar,
  title = "Admin control Centre",
}: AdminHeaderProps) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
    });

    return () => unsubscribe();
  }, []);

  return (
    <header className="bg-background border-b sticky top-0 z-10">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="md:hidden">
            <Button variant="ghost" size="icon" onClick={toggleSidebar}>
              <Menu className="h-5 w-5" />
            </Button>
          </div>
          <div className="flex items-center gap-3">
            <div className="p-1.5 rounded-lg bg-primary/10 hover:bg-primary/20 transition-colors">
              <img 
                src="/icons/PTJ SVG.svg" 
                alt="Parttimejob Logo" 
                className="h-8 w-auto drop-shadow-md"
              />
            </div>
            <h1 className="text-xl font-semibold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
              Admin control Centre
            </h1>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <ThemeToggle />
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-primary"></span>
          </Button>
          <div className="flex items-center gap-2">
            <Avatar className="h-8 w-8">
              <AvatarImage
                src={user?.photoURL || "/placeholder.svg?height=32&width=32"}
                alt="Admin"
              />
              <AvatarFallback>
                {user?.displayName
                  ? `${user.displayName.split(" ")[0][0]}${
                      user.displayName.split(" ")[1]?.[0] || ""
                    }`
                  : "AD"}
              </AvatarFallback>
            </Avatar>
            <div className="hidden md:block">
              <p className="text-sm font-medium">
                {user?.displayName || "Admin User"}
              </p>
              <p className="text-xs text-muted-foreground">
                {user?.email || "admin@Parttimejob.com"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
