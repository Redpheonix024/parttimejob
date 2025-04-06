import type React from "react"
import Link from "next/link"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  BarChart,
  Briefcase,
  Building,
  CreditCard,
  Home,
  LogOut,
  MessageSquare,
  Settings,
  User,
  Users,
} from "lucide-react"

interface EmployerSidebarProps {
  activeRoute: string
  isOpen?: boolean
}

export default function EmployerSidebar({ activeRoute, isOpen = true }: EmployerSidebarProps) {
  return (
    <div
      className={`hidden md:flex flex-col bg-card border-r h-screen sticky top-0 transition-all duration-300 ${
        isOpen ? "w-64" : "w-20"
      }`}
    >
      <div className="p-4 border-b">
        <Link href="/" className={`font-bold text-primary flex items-center ${isOpen ? "text-2xl" : "text-xs"}`}>
          {isOpen ? "TaskMatch" : "TM"}
        </Link>
      </div>
      <div className="flex-1 overflow-auto py-2">
        <nav className="space-y-1 px-2">
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
            label="My Jobs"
            isActive={activeRoute === "jobs"}
            isExpanded={isOpen}
          />
          <NavItem
            href="/dashboard/employer/applicants"
            icon={<Users className="h-5 w-5" />}
            label="Applicants"
            isActive={activeRoute === "applicants"}
            isExpanded={isOpen}
            badge="12"
          />
          <NavItem
            href="/dashboard/employer/messages"
            icon={<MessageSquare className="h-5 w-5" />}
            label="Messages"
            isActive={activeRoute === "messages"}
            isExpanded={isOpen}
            badge="3"
          />
          <NavItem
            href="/dashboard/employer/analytics"
            icon={<BarChart className="h-5 w-5" />}
            label="Analytics"
            isActive={activeRoute === "analytics"}
            isExpanded={isOpen}
          />
        </nav>

        {/* Quick Switch Button */}
        <div className="px-2 py-4">
          {isOpen && (
            <p className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              Switch Dashboard
            </p>
          )}
          <Link href="/dashboard">
            <Button variant="outline" className={`w-full ${!isOpen ? "justify-center p-2" : ""}`}>
              <User className={`h-5 w-5 ${isOpen ? "mr-2" : ""}`} />
              {isOpen && "Job Seeker Dashboard"}
            </Button>
          </Link>
        </div>

        <div className="px-3 py-4 mt-2">
          {isOpen && (
            <h3 className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Account</h3>
          )}
          <nav className="mt-2 space-y-1">
            <NavItem
              href="/dashboard/employer/company"
              icon={<Building className="h-5 w-5" />}
              label="Company Profile"
              isActive={activeRoute === "company"}
              isExpanded={isOpen}
            />
            <NavItem
              href="/dashboard/employer/billing"
              icon={<CreditCard className="h-5 w-5" />}
              label="Billing"
              isActive={activeRoute === "billing"}
              isExpanded={isOpen}
            />
            <NavItem
              href="/dashboard/employer/settings"
              icon={<Settings className="h-5 w-5" />}
              label="Settings"
              isActive={activeRoute === "settings"}
              isExpanded={isOpen}
            />
            <NavItem
              href="/logout"
              icon={<LogOut className="h-5 w-5" />}
              label="Logout"
              isActive={false}
              isExpanded={isOpen}
            />
          </nav>
        </div>
      </div>
      <div className="p-4 border-t">
        <div className="flex items-center">
          <Avatar className="h-8 w-8">
            <AvatarImage src="/placeholder.svg?height=32&width=32" alt="Company" />
            <AvatarFallback>AC</AvatarFallback>
          </Avatar>
          {isOpen && (
            <div className="ml-3">
              <p className="text-sm font-medium">Acme Corp</p>
              <p className="text-xs text-muted-foreground">Pro Plan</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

interface NavItemProps {
  href: string
  icon: React.ReactNode
  label: string
  isActive: boolean
  isExpanded: boolean
  badge?: string
}

function NavItem({ href, icon, label, isActive, isExpanded, badge }: NavItemProps) {
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
      {isExpanded && badge && <Badge className="ml-auto bg-primary text-primary-foreground">{badge}</Badge>}
    </Link>
  )
}

