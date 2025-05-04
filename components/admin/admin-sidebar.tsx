"use client";

import type React from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Briefcase,
  Home,
  LogOut,
  Menu,
  Settings,
  Shield,
  Users,
  X,
} from "lucide-react";
import { auth } from "@/app/config/firebase";
import { signOut } from "firebase/auth";
import { useState, useEffect, useRef } from "react";

interface AdminSidebarProps {
  isSidebarOpen: boolean;
  setIsSidebarOpen: (open: boolean) => void;
  activeLink?: string;
  onLogout?: () => void;
}

export default function AdminSidebar({
  isSidebarOpen,
  setIsSidebarOpen,
  activeLink,
  onLogout,
}: AdminSidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const sidebarRef = useRef<HTMLDivElement>(null);

  // Close sidebar when clicking outside (handles both mobile and desktop)
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (
        isSidebarOpen &&
        sidebarRef.current &&
        !sidebarRef.current.contains(e.target as Node)
      ) {
        // Check screen size directly if needed, though toggle should handle it
        // if (window.innerWidth < 768) { // Example: Only close on mobile via outside click
        setIsSidebarOpen(false);
        // }
      }
    };

    if (isSidebarOpen) {
      // Add listener only when open
      document.addEventListener("mousedown", handleOutsideClick);
    }

    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [isSidebarOpen, setIsSidebarOpen]); // Removed sidebarRef from deps as it's stable

  // Auto-close sidebar on mobile view and route changes
  useEffect(() => {
    const handleResize = () => {
      // Close sidebar on mobile screens
      if (window.innerWidth < 768) {
        setIsSidebarOpen(false);
      } else {
        // Open sidebar on desktop by default
        setIsSidebarOpen(true);
      }
    };

    // Set initial state based on screen size
    handleResize();

    // Add resize listener
    window.addEventListener("resize", handleResize);

    // Cleanup
    return () => window.removeEventListener("resize", handleResize);
  }, [setIsSidebarOpen]);

  // Close sidebar on route changes in mobile view
  useEffect(() => {
    if (window.innerWidth < 768) {
      setIsSidebarOpen(false);
    }
  }, [pathname, setIsSidebarOpen]);

  const handleLogout = async () => {
    try {
      if (onLogout) {
        onLogout();
        return;
      }

      await signOut(auth);

      // Clear the admin-session cookie
      document.cookie =
        "admin-session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Strict;";

      router.push("/admin/login");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        ref={sidebarRef}
        id="admin-sidebar"
        className={`bg-card border-r h-screen z-50 transition-all duration-300 
          md:sticky md:top-0 fixed top-0 bottom-0 left-0
          ${
            isSidebarOpen
              ? "translate-x-0 w-64"
              : "md:w-20 md:translate-x-0 -translate-x-full"
          }`}
      >
        <div className="p-4 border-b flex items-center justify-between">
          <Link
            href="/admin/dashboard"
            className={`font-bold text-primary flex items-center ${
              isSidebarOpen ? "text-xl" : "text-xs"
            }`}
            onClick={() => {
              // Close sidebar on mobile when clicking the logo
              if (window.innerWidth < 768) {
                setIsSidebarOpen(false);
              }
            }}
          >
            {isSidebarOpen ? (
              "Parttimejob Admin"
            ) : (
              <Shield className="h-6 w-6" />
            )}
          </Link>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          >
            {isSidebarOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </Button>
        </div>
        <div className="py-4">
          <nav className="space-y-1 px-2">
            <NavItem
              href="/admin/dashboard"
              icon={<Home />}
              label="Dashboard"
              isExpanded={isSidebarOpen}
              isActive={activeLink === "dashboard"}
              setIsSidebarOpen={setIsSidebarOpen}
            />
            <NavItem
              href="/admin/users"
              icon={<Users />}
              label="Users"
              isExpanded={isSidebarOpen}
              isActive={activeLink === "users"}
              setIsSidebarOpen={setIsSidebarOpen}
            />
            <NavItem
              href="/admin/jobs"
              icon={<Briefcase />}
              label="Jobs"
              isExpanded={isSidebarOpen}
              isActive={activeLink === "jobs"}
              setIsSidebarOpen={setIsSidebarOpen}
            />
            <NavItem
              href="/admin/settings"
              icon={<Settings />}
              label="Settings"
              isExpanded={isSidebarOpen}
              isActive={activeLink === "settings"}
              setIsSidebarOpen={setIsSidebarOpen}
            />
          </nav>
        </div>
        <div className="absolute bottom-0 w-full p-4 border-t">
          <Button
            variant="ghost"
            className={`w-full justify-start ${
              isSidebarOpen ? "" : "justify-center px-2"
            }`}
            onClick={handleLogout}
          >
            <LogOut className={`h-5 w-5 ${isSidebarOpen ? "mr-2" : ""}`} />
            {isSidebarOpen && "Logout"}
          </Button>
        </div>
      </div>

      {/* Mobile Toggle Button - Fixed at bottom */}
      <Button
        variant="outline"
        size="icon"
        onClick={() => setIsSidebarOpen(true)}
        className="md:hidden fixed bottom-4 right-4 z-40 rounded-full shadow-lg bg-primary text-primary-foreground"
      >
        <Menu className="h-5 w-5" />
      </Button>
    </>
  );
}

// Navigation Item Component
function NavItem({
  href,
  icon,
  label,
  isExpanded,
  isActive,
  setIsSidebarOpen,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  isExpanded: boolean;
  isActive?: boolean;
  setIsSidebarOpen?: (open: boolean) => void;
}) {
  const router = useRouter();
  const pathname = usePathname();

  // Handle navigation manually to ensure sidebar closes before navigation
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent the default link behavior

    // Close sidebar on mobile first
    if (window.innerWidth < 768 && setIsSidebarOpen) {
      setIsSidebarOpen(false);
    }

    // Navigate after a small delay to allow sidebar animation to complete
    setTimeout(() => {
      router.push(href);
    }, 100);
  };

  return (
    <a
      href={href}
      className={`flex items-center px-3 py-2 text-sm rounded-md cursor-pointer ${
        isActive || pathname === href
          ? "bg-primary/10 text-primary font-medium"
          : "text-muted-foreground hover:bg-muted hover:text-foreground"
      }`}
      onClick={handleClick}
    >
      <div className={isExpanded ? "mr-3" : ""}>{icon}</div>
      {isExpanded && <span className="flex-1">{label}</span>}
    </a>
  );
}
