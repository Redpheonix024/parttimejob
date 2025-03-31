import type React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

interface StatCardProps {
  title: string
  value: string | number
  description?: string
  icon?: React.ReactNode
  progress?: number
}

export default function StatCard({ title, value, description, icon, progress }: StatCardProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && <p className="text-xs text-muted-foreground mt-1">{description}</p>}
        {progress !== undefined && <Progress value={progress} className="h-2 mt-2" indicatorClassName="bg-primary" />}
      </CardContent>
    </Card>
  )
}

