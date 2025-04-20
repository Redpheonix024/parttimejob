"use client";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface MobileTabsProps {
  activeTab: string;
  onTabChange: (value: string) => void;
}

export default function MobileTabs({
  activeTab,
  onTabChange,
}: MobileTabsProps) {
  // Don't show tabs on settings and profile pages
  if (activeTab === "settings" || activeTab === "profile") {
    return null;
  }

  return (
    <div className="md:hidden mb-6">
      <Tabs value={activeTab} onValueChange={onTabChange} className="w-full">
        <TabsList className="grid grid-cols-4 w-full">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="applications">Applications</TabsTrigger>
          <TabsTrigger value="job-status">Job Status</TabsTrigger>
          <TabsTrigger value="saved-jobs">Saved</TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  );
}
