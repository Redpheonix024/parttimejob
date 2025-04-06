"use client";

import type React from "react";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import {
  Calendar,
  FileText,
  Home,
  LogOut,
  MessageSquare,
  Settings,
  Star,
  User,
  ClipboardCheck,
  Building2,
  Briefcase,
} from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import { getAuth, signOut } from "firebase/auth";
import { useState, useEffect } from "react";

interface DashboardSidebarProps {
  activeRoute: string;
  isOpen?: boolean;
  mobileOpen?: boolean; 
  setMobileOpen?: (open: boolean) => void;
  userData?: any;
  user?: any;
}

export default function DashboardSidebar({
  activeRoute,
  isOpen = true,
  mobileOpen = false,
  setMobileOpen = () => {},
  userData,
  user,
}: DashboardSidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isMobile, setIsMobile] = useState(false);
  const [dashboardType, setDashboardType] = useState<'employee' | 'employer'>(
    pathname?.includes('/dashboard/employer') ? 'employer' : 'employee'
  );

  useEffect(() => {
    // Check if the current path is for employer dashboard
    if (pathname?.includes('/dashboard/employer')) {
      setDashboardType('employer');
    } else {
      setDashboardType('employee');
    }
  }, [pathname]);

  useEffect(() => {
    // Check if the window is available (client-side)
    if (typeof window !== 'undefined') {
      const checkMobile = () => {
        setIsMobile(window.innerWidth < 768);
      };
      
      // Initial check
      checkMobile();
      
      // Add event listener for window resize
      window.addEventListener('resize', checkMobile);
      
      // Clean up event listener
      return () => window.removeEventListener('resize', checkMobile);
    }
  }, []);

  const handleDashboardSwitch = (type: 'employee' | 'employer') => {
    setDashboardType(type);
    if (type === 'employer') {
      router.push('/dashboard/employer');
    } else {
      router.push('/dashboard');
    }
  };

  const handleLogout = async () => {
    const auth = getAuth();
    try {
      await signOut(auth);
      router.push("/");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const getNavigationItems = () => {
    if (dashboardType === 'employer') {
      return (
        <>
          <NavItem
            href="/dashboard/employer"
            icon={<Home className="h-5 w-5" />}
            label="Overview"
            isActive={activeRoute === "overview"}
            isExpanded={isOpen}
          />
          <NavItem
            href="/dashboard/employer/jobs"
            icon={<Briefcase className="h-5 w-5" />}
            label="Posted Jobs"
            isActive={activeRoute === "jobs"}
            isExpanded={isOpen}
          />
          <NavItem
            href="/dashboard/employer/applicants"
            icon={<FileText className="h-5 w-5" />}
            label="Applicants"
            isActive={activeRoute === "applicants"}
            isExpanded={isOpen}
          />
          <NavItem
            href="/dashboard/employer/messages"
            icon={<MessageSquare className="h-5 w-5" />}
            label="Messages"
            isActive={activeRoute === "messages"}
            badge="3"
            isExpanded={isOpen}
          />
          <NavItem
            href="/dashboard/employer/calendar"
            icon={<Calendar className="h-5 w-5" />}
            label="Calendar"
            isActive={activeRoute === "calendar"}
            isExpanded={isOpen}
          />
        </>
      );
    }

    return (
      <>
        <NavItem
          href="/dashboard"
          icon={<Home className="h-5 w-5" />}
          label="Overview"
          isActive={activeRoute === "overview"}
          isExpanded={isOpen}
        />
        <NavItem
          href="/dashboard/applications"
          icon={<FileText className="h-5 w-5" />}
          label="Applications"
          isActive={activeRoute === "applications"}
          isExpanded={isOpen}
        />
        <NavItem
          href="/dashboard/job-status"
          icon={<ClipboardCheck className="h-5 w-5" />}
          label="Job Status"
          isActive={activeRoute === "job-status"}
          isExpanded={isOpen}
        />
        <NavItem
          href="/dashboard/saved-jobs"
          icon={<Star className="h-5 w-5" />}
          label="Saved Jobs"
          isActive={activeRoute === "saved-jobs"}
          isExpanded={isOpen}
        />
        <NavItem
          href="/dashboard/messages"
          icon={<MessageSquare className="h-5 w-5" />}
          label="Messages"
          isActive={activeRoute === "messages"}
          badge="3"
          isExpanded={isOpen}
        />
        <NavItem
          href="/dashboard/calendar"
          icon={<Calendar className="h-5 w-5" />}
          label="Calendar"
          isActive={activeRoute === "calendar"}
          isExpanded={isOpen}
        />
      </>
    );
  };

  const sidebarContent = (
    <>
      <div className="p-4 border-b">
        <Link
          href="/"
          className={`font-bold text-primary flex items-center ${
            isOpen ? "text-2xl" : "text-xs"
          }`}
        >
          {isOpen ? "Parttimejob" : "TM"}
        </Link>
      </div>
      <div className="flex-1 overflow-auto py-2">
        <nav className="space-y-1 px-2">
          {isOpen && (
            <div className="px-3 mb-4">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                Dashboard Type
              </h3>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleDashboardSwitch('employee')}
                  className={`flex-1 px-2 py-1 text-xs rounded-md ${
                    dashboardType === 'employee'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  }`}
                >
                  <Briefcase className="h-4 w-4 mx-auto" />
                </button>
                <button
                  onClick={() => handleDashboardSwitch('employer')}
                  className={`flex-1 px-2 py-1 text-xs rounded-md ${
                    dashboardType === 'employer'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  }`}
                >
                  <Building2 className="h-4 w-4 mx-auto" />
                </button>
              </div>
            </div>
          )}
          {getNavigationItems()}
        </nav>
        <div className="px-3 py-4 mt-6">
          {isOpen && (
            <h3 className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Account
            </h3>
          )}
          <nav className="mt-2 space-y-1">
            <NavItem
              href={`/dashboard/${dashboardType}/profile`}
              icon={<User className="h-5 w-5" />}
              label="Profile"
              isActive={activeRoute === "profile"}
              isExpanded={isOpen}
            />
            <NavItem
              href={`/dashboard/${dashboardType}/settings`}
              icon={<Settings className="h-5 w-5" />}
              label="Settings"
              isActive={activeRoute === "settings"}
              isExpanded={isOpen}
            />
            <NavItem
              href="#"
              icon={<LogOut className="h-5 w-5" />}
              label="Logout"
              isActive={false}
              isExpanded={isOpen}
              onClick={handleLogout}
            />
          </nav>
        </div>
      </div>
      <div className="p-4 border-t">
        <div className="flex items-center">
          <Avatar className="h-8 w-8">
            <AvatarImage 
              src={userData?.profilePicture || userData?.photoURL || "/placeholder.svg?height=32&width=32"} 
              alt={user?.displayName || "User"} 
            />
            <AvatarFallback>{user?.displayName?.[0] || "U"}</AvatarFallback>
          </Avatar>
          {isOpen && (
            <div className="ml-3">
              <p className="text-sm font-medium">{user?.displayName || "Complete Profile"}</p>
              <p className="text-xs text-muted-foreground">
                {user?.email || "Add your details"}
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );

  // For mobile view, use Sheet
  if (isMobile) {
    return (
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="p-0 w-[280px]">
          <div className="flex flex-col h-full">
            {sidebarContent}
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  // For desktop view, use the regular sidebar
  return (
    <div
      className={`hidden md:flex flex-col bg-card border-r h-screen sticky top-0 transition-all duration-300 ${
        isOpen ? "w-64" : "w-20"
      }`}
    >
      {sidebarContent}
    </div>
  );
}

interface NavItemProps {
  href: string;
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  isExpanded: boolean;
  badge?: string;
  onClick?: () => void;
}

function NavItem({
  href,
  icon,
  label,
  isActive,
  isExpanded,
  badge,
  onClick,
}: NavItemProps) {
  if (onClick) {
    return (
      <button
        onClick={onClick}
        className={`w-full flex items-center px-3 py-2 text-sm rounded-md ${
          isActive
            ? "bg-primary/10 text-primary font-medium"
            : "text-muted-foreground hover:bg-muted hover:text-foreground"
        }`}
      >
        <div className={isExpanded ? "mr-3" : ""}>{icon}</div>
        {isExpanded && <span>{label}</span>}
        {isExpanded && badge && (
          <Badge className="ml-auto bg-primary text-primary-foreground">
            {badge}
          </Badge>
        )}
      </button>
    );
  }

  return (
    <Link
      href={href}
      className={`flex items-center px-3 py-2 text-sm rounded-md ${
        isActive
          ? "bg-primary/10 text-primary font-medium"
          : "text-muted-foreground hover:bg-muted hover:text-foreground"
      }`}
    >
      <div className={isExpanded ? "mr-3" : ""}>{icon}</div>
      {isExpanded && <span>{label}</span>}
      {isExpanded && badge && (
        <Badge className="ml-auto bg-primary text-primary-foreground">
          {badge}
        </Badge>
      )}
    </Link>
  );
}
