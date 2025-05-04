"use client";

import type React from "react";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import {
  Home,
  Search,
  Info,
  BookOpen,
  LogOut,
  User,
  Briefcase,
  LayoutDashboard,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { getAuth, signOut } from "firebase/auth";

interface MainSidebarProps {
  activeLink?: string;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  userData?: any;
  user?: any;
}

export default function MainSidebar({
  activeLink,
  isOpen,
  setIsOpen,
  userData,
  user,
}: MainSidebarProps) {
  const router = useRouter();

  const handleLogout = async () => {
    const auth = getAuth();
    try {
      await signOut(auth);
      router.push("/");
      setIsOpen(false);
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  if (!user) {
    // Don't render sidebar if user is not logged in
    return null;
  }

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetContent side="left" className="p-0 w-[280px]">
        <div className="flex flex-col h-full">
          <div className="p-4 border-b">
            <Link
              href="/"
              className="font-bold text-primary flex items-center text-2xl"
              onClick={() => setIsOpen(false)}
            >
              Parttimejob
            </Link>
          </div>

          <div className="flex-1 overflow-auto py-4">
            <nav className="space-y-1 px-2">
              <NavItem
                href="/"
                icon={<Home className="h-5 w-5" />}
                label="Home"
                isActive={activeLink === "jobs"}
                onClick={() => setIsOpen(false)}
              />
              {/* <NavItem
                href="/search"
                icon={<Search className="h-5 w-5" />}
                label="Search Jobs"
                isActive={activeLink === "search"}
                onClick={() => setIsOpen(false)}
              />
              <NavItem
                href="/post-job"
                icon={<Briefcase className="h-5 w-5" />}
                label="Post a Job"
                isActive={activeLink === "post-job"}
                onClick={() => setIsOpen(false)}
              /> */}
              <NavItem
                href="/how-it-works"
                icon={<BookOpen className="h-5 w-5" />}
                label="How it Works"
                isActive={activeLink === "how-it-works"}
                onClick={() => setIsOpen(false)}
              />
              <NavItem
                href="/about"
                icon={<Info className="h-5 w-5" />}
                label="About"
                isActive={activeLink === "about"}
                onClick={() => setIsOpen(false)}
              />
            </nav>

            <div className="px-2 py-4 mt-6">
              <h3 className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Account
              </h3>
              <nav className="mt-2 space-y-1">
                <NavItem
                  href="/dashboard"
                  icon={<LayoutDashboard className="h-5 w-5" />}
                  label="Dashboard"
                  isActive={false}
                  onClick={() => setIsOpen(false)}
                />
                <NavItem
                  href="/dashboard/profile"
                  icon={<User className="h-5 w-5" />}
                  label="Profile"
                  isActive={false}
                  onClick={() => setIsOpen(false)}
                />
                <NavItem
                  href="#"
                  icon={<LogOut className="h-5 w-5" />}
                  label="Logout"
                  isActive={false}
                  onClick={handleLogout}
                />
              </nav>
            </div>
          </div>

          <div className="p-4 border-t">
            <div className="flex items-center">
              <Avatar className="h-8 w-8">
                <AvatarImage
                  src={
                    userData?.profilePicture ||
                    userData?.photoURL ||
                    user?.photoURL ||
                    "/placeholder-user.jpg"
                  }
                  alt={userData?.firstName || user?.displayName || "User"}
                  style={{ objectFit: "cover" }}
                />
                <AvatarFallback>
                  {userData?.firstName?.[0]?.toUpperCase() ||
                    user?.displayName?.[0] ||
                    "U"}
                </AvatarFallback>
              </Avatar>
              <div className="ml-3">
                <p className="text-sm font-medium">
                  {userData?.firstName || user?.displayName || "User"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {userData?.email || user?.email || ""}
                </p>
              </div>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

interface NavItemProps {
  href: string;
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  onClick?: () => void;
}

function NavItem({ href, icon, label, isActive, onClick }: NavItemProps) {
  const className = `flex items-center px-3 py-2 text-sm rounded-md ${
    isActive
      ? "bg-primary/10 text-primary font-medium"
      : "text-muted-foreground hover:bg-muted hover:text-foreground"
  }`;

  if (href === "#" && onClick) {
    return (
      <button onClick={onClick} className={`w-full ${className}`}>
        <div className="mr-3">{icon}</div>
        <span>{label}</span>
      </button>
    );
  }

  return (
    <Link href={href} className={className} onClick={onClick}>
      <div className="mr-3">{icon}</div>
      <span>{label}</span>
    </Link>
  );
}
