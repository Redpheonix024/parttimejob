"use client";

import type React from "react";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import {
  FileText,
  Home,
  LogOut,
  Settings,
  Star,
  User,
  ClipboardCheck,
  Building2,
  Briefcase,
  PanelLeft,
  PanelRight,
} from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import { getAuth, signOut } from "firebase/auth";
import { useState, useEffect, useRef } from "react";

interface DashboardSidebarProps {
  activeRoute: string;
  isOpen?: boolean;
  mobileOpen?: boolean;
  setMobileOpen?: (open: boolean) => void;
  userData?: any;
  user?: any;
  toggleSidebar?: () => void;
}

export default function DashboardSidebar({
  activeRoute,
  isOpen = true,
  mobileOpen = false,
  setMobileOpen = () => {},
  userData,
  user,
  toggleSidebar,
}: DashboardSidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isMobile, setIsMobile] = useState(false);
  const [dashboardType, setDashboardType] = useState<"employee" | "employer">(
    pathname?.includes("/dashboard/employer") ? "employer" : "employee"
  );
  const sidebarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Check if the current path is for employer dashboard
    if (pathname?.includes("/dashboard/employer")) {
      setDashboardType("employer");
    } else {
      setDashboardType("employee");
    }
  }, [pathname]);

  useEffect(() => {
    // Check if the window is available (client-side)
    if (typeof window !== "undefined") {
      const checkMobile = () => {
        setIsMobile(window.innerWidth < 768);
      };

      // Initial check
      checkMobile();

      // Add event listener for window resize
      window.addEventListener("resize", checkMobile);

      // Clean up event listener
      return () => window.removeEventListener("resize", checkMobile);
    }
  }, []);

  // Effect to handle clicks outside the desktop sidebar
  useEffect(() => {
    // Only run this logic on the client and for desktop view
    if (typeof window === "undefined" || isMobile || !toggleSidebar) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (
        isOpen && // Only if the sidebar is open
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target as Node)
      ) {
        toggleSidebar(); // Call the toggle function passed from layout
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    // Cleanup listener on component unmount or when isOpen changes
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, toggleSidebar, isMobile]);

  const handleDashboardSwitch = (type: "employee" | "employer") => {
    if (type === "employer") {
      // Show alert and prevent switching
      alert("Employer dashboard is temporarily disabled.");
      return;
    }
    // Proceed with switching to employee dashboard
    setDashboardType(type);
    router.push("/dashboard");
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

  // Helper function to render NavItems with correct expanded state
  const renderNavItems = (expandedState: boolean) => (
    <>
      <NavItem
        href="/dashboard"
        icon={<Home className="h-5 w-5" />}
        label="Overview"
        isActive={activeRoute === "overview"}
        isExpanded={expandedState}
      />
      <NavItem
        href="/dashboard/applications"
        icon={<FileText className="h-5 w-5" />}
        label="Applications"
        isActive={activeRoute === "applications"}
        isExpanded={expandedState}
      />
      <NavItem
        href="/dashboard/job-status"
        icon={<ClipboardCheck className="h-5 w-5" />}
        label="Job Status"
        isActive={activeRoute === "job-status"}
        isExpanded={expandedState}
      />
      <NavItem
        href="/dashboard/saved-jobs"
        icon={<Star className="h-5 w-5" />}
        label="Saved Jobs"
        isActive={activeRoute === "saved-jobs"}
        isExpanded={expandedState}
      />
    </>
  );

  const getNavigationItems = (isCurrentlyExpanded: boolean) => {
    if (dashboardType === "employer") {
      return (
        <>
          <NavItem
            href="/dashboard/employer"
            icon={<Home className="h-5 w-5" />}
            label="Overview"
            isActive={activeRoute === "overview"}
            isExpanded={isCurrentlyExpanded}
          />
          <NavItem
            href="/dashboard/employer/jobs"
            icon={<Briefcase className="h-5 w-5" />}
            label="Posted Jobs"
            isActive={activeRoute === "jobs"}
            isExpanded={isCurrentlyExpanded}
          />
          <NavItem
            href="/dashboard/employer/applicants"
            icon={<FileText className="h-5 w-5" />}
            label="Applicants"
            isActive={activeRoute === "applicants"}
            isExpanded={isCurrentlyExpanded}
          />
        </>
      );
    }
    return renderNavItems(isCurrentlyExpanded);
  };

  // Helper function to render Account NavItems
  const renderAccountNavItems = (expandedState: boolean) => (
    <nav className="mt-2 space-y-1">
      <NavItem
        href={`/dashboard/profile`}
        icon={<User className="h-5 w-5" />}
        label="Profile"
        isActive={activeRoute === "profile"}
        isExpanded={expandedState}
      />
      <NavItem
        href={`/dashboard/settings`}
        icon={<Settings className="h-5 w-5" />}
        label="Settings"
        isActive={activeRoute === "settings"}
        isExpanded={expandedState}
      />
      <NavItem
        href="#"
        icon={<LogOut className="h-5 w-5" />}
        label="Logout"
        isActive={false}
        isExpanded={expandedState}
        onClick={handleLogout}
      />
    </nav>
  );

  const sidebarContent = (isCurrentlyExpanded: boolean) => (
    <>
      <div className="p-4 border-b relative bg-card">
        <Link
          href="/"
          className="flex items-center gap-2 group"
        >
          <div className="p-1 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
            <img 
              src="/icons/PTJ SVG.svg" 
              alt="Parttimejob Logo" 
              className="h-8 w-auto drop-shadow-md"
            />
          </div>
          {isCurrentlyExpanded && (
            <span className="text-xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
              Parttimejob
            </span>
          )}
        </Link>

        {!isMobile && toggleSidebar && (
          <button
            onClick={toggleSidebar}
            className={`absolute top-1/2 -translate-y-1/2 right-2 p-1 rounded-md text-muted-foreground hover:bg-muted hover:text-foreground ${
              !isCurrentlyExpanded ? "right-1/2 translate-x-1/2" : ""
            }`}
            aria-label={
              isCurrentlyExpanded ? "Collapse sidebar" : "Expand sidebar"
            }
          >
            {isCurrentlyExpanded ? (
              <PanelLeft className="h-5 w-5" />
            ) : (
              <PanelRight className="h-5 w-5" />
            )}
          </button>
        )}
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
                  onClick={() => handleDashboardSwitch("employee")}
                  className={`flex-1 px-2 py-1 text-xs rounded-md ${
                    dashboardType === "employee"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                >
                  <Briefcase className="h-4 w-4 mx-auto" />
                </button>
                <button
                  onClick={() => handleDashboardSwitch("employer")}
                  className={`flex-1 px-2 py-1 text-xs rounded-md ${
                    dashboardType === "employer"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                >
                  <Building2 className="h-4 w-4 mx-auto" />
                </button>
              </div>
            </div>
          )}
          {getNavigationItems(isCurrentlyExpanded)}
        </nav>
        <div className="px-3 py-4 mt-6">
          {isCurrentlyExpanded && (
            <h3 className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Account
            </h3>
          )}
          {renderAccountNavItems(isCurrentlyExpanded)}
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
          {isCurrentlyExpanded && (
            <div className="ml-3">
              <p className="text-sm font-medium">
                {userData?.firstName || user?.displayName || "Complete Profile"}
              </p>
              <p className="text-xs text-muted-foreground">
                {userData?.email || user?.email || "Add your details"}
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );

  if (isMobile) {
    return (
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="p-0 w-[280px]">
          <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
          <div className="flex flex-col h-full">{sidebarContent(true)}</div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <div
      ref={sidebarRef}
      className={`hidden md:flex flex-col bg-card border-r h-screen sticky top-0 transition-all duration-300 ${
        isOpen ? "w-64" : "w-20"
      }`}
    >
      {sidebarContent(isOpen)}
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
