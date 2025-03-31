"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search } from "lucide-react"

interface JobSearchFormProps {
  onSubmit?: (data: { query: string; location: string }) => void
  className?: string
}

export default function JobSearchForm({ onSubmit, className = "" }: JobSearchFormProps) {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const query = formData.get("query") as string
    const location = formData.get("location") as string

    if (onSubmit) {
      onSubmit({ query, location })
    }
  }

  return (
    <form onSubmit={handleSubmit} className={`max-w-4xl mx-auto bg-card rounded-lg p-4 shadow-sm ${className}`}>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="relative md:col-span-2">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input name="query" placeholder="Job title, keywords, or company" className="pl-10" />
        </div>
        <div>
          <Select name="location">
            <SelectTrigger>
              <SelectValue placeholder="Location" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="anywhere">Anywhere</SelectItem>
              <SelectItem value="remote">Remote Only</SelectItem>
              <SelectItem value="local">Local Only</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button type="submit" className="w-full">
          Search Jobs
        </Button>
      </div>
    </form>
  )
}

