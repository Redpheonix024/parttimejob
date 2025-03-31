import type React from "react";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
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
} from "lucide-react";
import { useRouter } from "next/navigation";
import { getAuth, signOut } from "firebase/auth";

interface DashboardSidebarProps {
  activeRoute: string;
  isOpen?: boolean;
}

export default function DashboardSidebar({
  activeRoute,
  isOpen = true,
}: DashboardSidebarProps) {
  const router = useRouter();

  const handleLogout = async () => {
    const auth = getAuth();
    try {
      await signOut(auth);
      router.push("/");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <div
      className={`hidden md:flex flex-col bg-card border-r h-screen sticky top-0 transition-all duration-300 ${
        isOpen ? "w-64" : "w-20"
      }`}
    >
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
        </nav>
        <div className="px-3 py-4 mt-6">
          {isOpen && (
            <h3 className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Account
            </h3>
          )}
          <nav className="mt-2 space-y-1">
            <NavItem
              href="/dashboard/profile"
              icon={<User className="h-5 w-5" />}
              label="Profile"
              isActive={activeRoute === "profile"}
              isExpanded={isOpen}
            />
            <NavItem
              href="/dashboard/settings"
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
            <AvatarImage src="/placeholder.svg?height=32&width=32" alt="User" />
            <AvatarFallback>JD</AvatarFallback>
          </Avatar>
          {isOpen && (
            <div className="ml-3">
              <p className="text-sm font-medium">John Doe</p>
              <p className="text-xs text-muted-foreground">
                john.doe@example.com
              </p>
            </div>
          )}
        </div>
      </div>
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
