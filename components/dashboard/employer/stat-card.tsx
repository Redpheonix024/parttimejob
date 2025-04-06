import type React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChevronDown } from "lucide-react"

interface EmployerStatCardProps {
  title: string
  value: string
  change?: string
  trend?: "up" | "down"
  secondaryValue?: string
  icon: React.ReactNode
}

export default function EmployerStatCard({ title, value, change, trend, secondaryValue, icon }: EmployerStatCardProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {change && trend && (
          <div className={`flex items-center text-xs mt-1 ${trend === "up" ? "text-green-500" : "text-red-500"}`}>
            <ChevronDown className={`h-4 w-4 ${trend === "up" ? "rotate-180" : ""}`} />
            <span>{change} from last month</span>
          </div>
        )}
        {secondaryValue && <div className="text-sm text-muted-foreground mt-1">{secondaryValue}</div>}
      </CardContent>
    </Card>
  )
}

