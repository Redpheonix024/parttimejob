"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import AdminSidebar from "@/components/layout/admin-sidebar"
import AdminHeader from "@/components/layout/admin-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  ArrowLeft,
  Briefcase,
  Calendar,
  CheckCircle,
  Clock,
  DollarSign,
  Edit,
  Eye,
  FileText,
  MapPin,
  MoreHorizontal,
  Shield,
  Trash2,
  User,
  Users,
  Wallet,
} from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import React from "react"
import { use } from 'react'
import { notFound } from 'next/navigation'
import { getJob, getUser, getJobApplications } from '@/lib/firebase'
import AdminJobDetail from '@/components/admin/AdminJobDetail'

interface JobData {
  id: string
  title: string
  company: string
  companyLogo: string
  location: string
  type: string
  category: string
  postedDate: string
  expiryDate: string
  status: string
  featured: boolean
  urgent: boolean
  rate: string
  duration: string
  applications: number
  views: number
  description: string
  requirements: string[]
  benefits: string[]
  employer: {
    id: string
    name: string
    email: string
    phone: string
    avatar: string
  }
  applicants: {
    id: string
    name: string
    email: string
    appliedDate: string
    status: string
    avatar: string
  }[]
  timeline: {
    id: string
    date: string
    time: string
    action: string
    icon: string
  }[]
  flowStatus: string
  flowProgress: number
  positionsNeeded: number
  positionsFilled: number
  draftDetails: {
    submittedBy: string
    submittedDate: string
    lastEdited: string
    adminNotes: string
    status: string
    rejectionReason: string
  }
}

interface TimelineEvent {
  id: string
  date: string
  time: string
  action: string
  icon: string
}

function getTimelineIconComponent(iconName: string) {
  switch (iconName) {
    case 'file-text':
      return <FileText className="h-4 w-4" />
    case 'user':
      return <User className="h-4 w-4" />
    case 'shield':
      return <Shield className="h-4 w-4" />
    case 'calendar':
      return <Calendar className="h-4 w-4" />
    case 'check-circle':
      return <CheckCircle className="h-4 w-4" />
      default:
      return <FileText className="h-4 w-4" />
  }
}

interface PageProps {
  params: { id: string }
}

export default function Page({ params }: PageProps) {
  const resolvedParams = use(params)
  const jobId = resolvedParams.id

  if (!jobId) {
    notFound()
  }

  return <AdminJobDetail jobId={jobId} />
}

