"use client";

import type React from "react";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Briefcase,
  Home,
  LogOut,
  Menu,
  Settings,
  Shield,
  Users,
} from "lucide-react";

interface AdminSidebarProps {
  isSidebarOpen: boolean;
  setIsSidebarOpen: (open: boolean) => void;
  activeLink?: string;
  onLogout: () => void;
}

export default function AdminSidebar({
  isSidebarOpen,
  setIsSidebarOpen,
  activeLink,
  onLogout,
}: AdminSidebarProps) {
  return (
    <>
      {/* Overlay for mobile */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/20 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
      
      {/* Sidebar */}
      <div
        className={`bg-card border-r h-screen fixed lg:sticky top-0 transition-all duration-300 z-50 lg:z-auto ${
          isSidebarOpen ? "w-64 translate-x-0" : "w-0 -translate-x-full lg:w-20 lg:translate-x-0"
        }`}
      >
        <div className="p-4 border-b flex items-center justify-between h-16">
          <Link
            href="/admin/dashboard"
            className={`font-bold text-primary flex items-center whitespace-nowrap ${
              isSidebarOpen ? "text-xl" : "text-xs lg:block hidden"
            }`}
          >
            {isSidebarOpen ? "Parttimejob Admin" : <Shield className="h-6 w-6" />}
          </Link>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="lg:flex hidden"
          >
            <Menu className="h-5 w-5" />
          </Button>
        </div>
        <div className="py-4 overflow-y-auto h-[calc(100vh-4rem-3.5rem)]">
          <nav className="space-y-1 px-2">
            <NavItem
              href="/admin/dashboard"
              icon={<Home className="h-5 w-5" />}
              label="Dashboard"
              isExpanded={isSidebarOpen}
              isActive={activeLink === "dashboard"}
            />
            <NavItem
              href="/admin/users"
              icon={<Users className="h-5 w-5" />}
              label="Users"
              isExpanded={isSidebarOpen}
              isActive={activeLink === "users"}
            />
            <NavItem
              href="/admin/jobs"
              icon={<Briefcase className="h-5 w-5" />}
              label="Jobs"
              isExpanded={isSidebarOpen}
              isActive={activeLink === "jobs"}
            />
            <NavItem
              href="/admin/settings"
              icon={<Settings className="h-5 w-5" />}
              label="Settings"
              isExpanded={isSidebarOpen}
              isActive={activeLink === "settings"}
            />
          </nav>
        </div>
        <div className="absolute bottom-0 w-full p-4 border-t">
          <Button
            variant="ghost"
            className={`w-full justify-start ${
              isSidebarOpen ? "" : "justify-center px-2 lg:flex hidden"
            }`}
            onClick={onLogout}
          >
            <LogOut className={`h-5 w-5 ${isSidebarOpen ? "mr-2" : ""}`} />
            {isSidebarOpen && "Logout"}
          </Button>
        </div>
      </div>
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
  badge,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  isExpanded: boolean;
  isActive?: boolean;
  badge?: string;
}) {
  return (
    <Link
      href={href}
      className={`flex items-center px-3 py-3 rounded-md transition-colors ${
        isActive
          ? "bg-primary/10 text-primary font-medium"
          : "text-muted-foreground hover:bg-muted hover:text-foreground"
      }`}
    >
      <div className={`flex-shrink-0 ${isExpanded ? "mr-3" : ""}`}>{icon}</div>
      {isExpanded && <span className="flex-1 text-sm">{label}</span>}
      {isExpanded && badge && (
        <span className="ml-auto bg-primary text-primary-foreground text-xs px-2 py-0.5 rounded-full">
          {badge}
        </span>
      )}
    </Link>
  );
}
