import type React from "react"
import { cn } from "@/lib/utils"

interface SectionContainerProps {
  children: React.ReactNode
  className?: string
  as?: React.ElementType
  muted?: boolean
}

export default function SectionContainer({
  children,
  className,
  as: Component = "section",
  muted = false,
}: SectionContainerProps) {
  return (
    <Component className={cn(muted ? "bg-muted" : "bg-background", "py-12", className)}>
      <div className="container mx-auto px-4">{children}</div>
    </Component>
  )
}

