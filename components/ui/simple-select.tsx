"use client"

import React, { useState, useRef, useEffect } from "react"
import { ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

interface SimpleSelectProps {
  value?: string
  onValueChange?: (value: string) => void
  name?: string
  placeholder?: string
  children: React.ReactNode
  className?: string
}

export function SimpleSelect({
  value,
  onValueChange,
  name,
  placeholder,
  children,
  className
}: SimpleSelectProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedValue, setSelectedValue] = useState(value || "")
  const [selectedLabel, setSelectedLabel] = useState("")
  const selectRef = useRef<HTMLDivElement>(null)

  // Extract options from children - support both SelectItem and option elements
  const options = React.Children.toArray(children).map((child: any) => {
    if (child.type === 'option') {
      return {
        value: child.props.value,
        label: child.props.children
      }
    } else {
      // Handle SelectItem components
      return {
        value: child.props.value,
        label: child.props.children
      }
    }
  })

  useEffect(() => {
    if (value !== undefined) {
      setSelectedValue(value)
      const option = options.find(opt => opt.value === value)
      setSelectedLabel(option?.label || "")
    }
  }, [value, options])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleSelect = (optionValue: string, optionLabel: string) => {
    setSelectedValue(optionValue)
    setSelectedLabel(optionLabel)
    setIsOpen(false)
    onValueChange?.(optionValue)
  }

  return (
    <div ref={selectRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
      >
        <span className={selectedLabel ? "text-foreground" : "text-muted-foreground"}>
          {selectedLabel || placeholder}
        </span>
        <ChevronDown className={cn("h-4 w-4 opacity-50 transition-transform", isOpen && "rotate-180")} />
      </button>
      
      {isOpen && (
        <div className="absolute z-50 mt-1 w-full rounded-md border bg-popover text-popover-foreground shadow-md">
          <div className="p-1">
            {options.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => handleSelect(option.value, option.label)}
                className={cn(
                  "relative flex w-full cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground",
                  selectedValue === option.value && "bg-accent text-accent-foreground"
                )}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      )}
      
      {/* Hidden select for form submission */}
      <select 
        name={name} 
        value={selectedValue} 
        onChange={(e) => {
          const option = options.find(opt => opt.value === e.target.value)
          handleSelect(e.target.value, option?.label || "")
        }}
        className="hidden"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  )
} 