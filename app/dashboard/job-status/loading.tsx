import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import DashboardLayout from "@/components/dashboard/dashboard-layout"

export default function Loading() {
  return (
    <DashboardLayout activeRoute="job-status">
      <div className="flex items-center justify-between mb-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-10 w-32" />
      </div>

      <Tabs defaultValue="all">
        <TabsList className="grid grid-cols-6 mb-6">
          {Array(6).fill(0).map((_, i) => (
            <Skeleton key={i} className="h-10 rounded-md" />
          ))}
        </TabsList>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
          {Array(6).fill(0).map((_, i) => (
            <Skeleton key={i} className="h-64 rounded-md" />
          ))}
        </div>
      </Tabs>
    </DashboardLayout>
  )
}

