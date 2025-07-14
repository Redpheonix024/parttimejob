"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { SimpleSelect } from "@/components/ui/simple-select"
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
        <SimpleSelect 
          value={locationFilter} 
          onValueChange={onLocationChange}
          placeholder="Location"
          className="w-[160px]"
        >
          <option value="anywhere">Anywhere</option>
          <option value="remote">Remote Only</option>
          <option value="local">Local Only</option>
        </SimpleSelect>
        <SimpleSelect 
          value={sortBy} 
          onValueChange={onSortChange}
          placeholder="Sort by"
          className="w-[160px]"
        >
          <option value="newest">Newest</option>
          <option value="salary">Highest Pay</option>
          <option value="duration">Duration</option>
        </SimpleSelect>
        <Button variant="outline" className="flex items-center gap-2">
          <Filter className="h-4 w-4" />
          <span className="hidden md:inline">More Filters</span>
        </Button>
      </div>
    </div>
  )
}

