"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Filter, Search } from "lucide-react"

interface JobFiltersProps {
  onSearch: (query: string) => void
  onLocationChange: (location: string) => void
  onSortChange: (sort: string) => void
  searchQuery: string
  locationFilter: string
  sortBy: string
}

export default function JobFilters({
  onSearch,
  onLocationChange,
  onSortChange,
  searchQuery,
  locationFilter,
  sortBy,
}: JobFiltersProps) {
  return (
    <div className="flex flex-col md:flex-row gap-4 mb-8">
      <div className="relative md:flex-1">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Job title, keywords, or company"
          className="pl-10"
          value={searchQuery}
          onChange={(e) => onSearch(e.target.value)}
        />
      </div>
      <div className="flex gap-4">
        <Select value={locationFilter} onValueChange={onLocationChange}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Location" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="anywhere">Anywhere</SelectItem>
            <SelectItem value="remote">Remote Only</SelectItem>
            <SelectItem value="local">Local Only</SelectItem>
          </SelectContent>
        </Select>
        <Select value={sortBy} onValueChange={onSortChange}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest</SelectItem>
            <SelectItem value="salary">Highest Pay</SelectItem>
            <SelectItem value="duration">Duration</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" className="flex items-center gap-2">
          <Filter className="h-4 w-4" />
          <span className="hidden md:inline">More Filters</span>
        </Button>
      </div>
    </div>
  )
}

