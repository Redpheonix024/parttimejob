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
    <div
      className={`bg-card border-r h-screen sticky top-0 transition-all duration-300 ${
        isSidebarOpen ? "w-64" : "w-20"
      }`}
    >
      <div className="p-4 border-b flex items-center justify-between">
        <Link
          href="/admin/dashboard"
          className={`font-bold text-primary flex items-center ${
            isSidebarOpen ? "text-xl" : "text-xs"
          }`}
        >
          {isSidebarOpen ? "Parttimejob Admin" : <Shield className="h-6 w-6" />}
        </Link>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="md:flex hidden"
        >
          <Menu className="h-5 w-5" />
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
          />
          <NavItem
            href="/admin/users"
            icon={<Users />}
            label="Users"
            isExpanded={isSidebarOpen}
            isActive={activeLink === "users"}
          />
          <NavItem
            href="/admin/jobs"
            icon={<Briefcase />}
            label="Jobs"
            isExpanded={isSidebarOpen}
            isActive={activeLink === "jobs"}
          />
          <NavItem
            href="/admin/settings"
            icon={<Settings />}
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
            isSidebarOpen ? "" : "justify-center px-2"
          }`}
          onClick={onLogout}
        >
          <LogOut className={`h-5 w-5 ${isSidebarOpen ? "mr-2" : ""}`} />
          {isSidebarOpen && "Logout"}
        </Button>
      </div>
    </div>
  );
}

// Navigation Item Component
function NavItem({
  href,
  icon,
  label,
  isExpanded,
  isActive,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  isExpanded: boolean;
  isActive?: boolean;
}) {
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
      {isExpanded && <span className="flex-1">{label}</span>}
    </Link>
  );
}
