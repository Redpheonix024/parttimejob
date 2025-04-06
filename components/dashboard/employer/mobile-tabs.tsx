"use client"

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BarChart, Briefcase, Home, Users } from "lucide-react"

interface EmployerMobileTabsProps {
  activeTab: string
  onTabChange: (value: string) => void
}

export default function EmployerMobileTabs({ activeTab, onTabChange }: EmployerMobileTabsProps) {
  return (
    <div className="md:hidden mb-6">
      <Tabs value={activeTab} onValueChange={onTabChange}>
        <TabsList className="grid grid-cols-4 w-full">
          <TabsTrigger value="overview" className="flex flex-col items-center py-2 px-0">
            <Home className="h-4 w-4 mb-1" />
            <span className="text-xs">Overview</span>
          </TabsTrigger>
          <TabsTrigger value="jobs" className="flex flex-col items-center py-2 px-0">
            <Briefcase className="h-4 w-4 mb-1" />
            <span className="text-xs">Jobs</span>
          </TabsTrigger>
          <TabsTrigger value="applicants" className="flex flex-col items-center py-2 px-0">
            <Users className="h-4 w-4 mb-1" />
            <span className="text-xs">Applicants</span>
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex flex-col items-center py-2 px-0">
            <BarChart className="h-4 w-4 mb-1" />
            <span className="text-xs">Analytics</span>
          </TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  )
}

