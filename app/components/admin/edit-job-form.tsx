"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { toast } from "sonner"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { X } from "lucide-react"

const jobFormSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters"),
  company: z.string().min(2, "Company name must be at least 2 characters"),
  category: z.string().min(1, "Category is required"),
  type: z.string().min(1, "Job type is required"),
  location: z.object({
    address: z.string().min(1, "Location is required"),
    city: z.string().optional(),
    state: z.string().optional(),
    zip: z.string().optional(),
    coordinates: z.object({
      lat: z.number().optional(),
      lng: z.number().optional(),
    }).optional(),
  }),
  description: z.string().min(10, "Description must be at least 10 characters"),
  requirements: z.array(z.string()),
  benefits: z.array(z.string()),
  salaryAmount: z.string().min(1, "Salary amount is required"),
  salaryType: z.string().min(1, "Salary type is required"),
  duration: z.string().min(1, "Duration is required"),
  positionsNeeded: z.number().min(1, "At least 1 position is required"),
  gender: z.string().min(1, "Gender preference is required"),
  minAge: z.number().min(18, "Minimum age must be at least 18"),
  maxAge: z.number().optional(),
  hours: z.string().min(1, "Work hours are required"),
  payType: z.string().min(1, "Pay type is required"),
  applicationInstructions: z.string().optional(),
  skills: z.string().optional(),
  featured: z.boolean().optional(),
  urgent: z.boolean().optional(),
  expiryDate: z.string().optional(),
  workLocation: z.string().optional(),
  companyDescription: z.string().optional(),
  contactPerson: z.string().optional(),
  applicationMethod: z.string().optional(),
})

type JobFormValues = {
  title: string
  company: string
  category: string
  type: string
  location: {
    address: string
    city: string
    state: string
    zip: string
    coordinates: {
      lat: number
      lng: number
    }
  }
  description: string
  requirements: string[]
  benefits: string[]
  salaryAmount: string
  salaryType: string
  duration: string
  positionsNeeded: number
  gender: string
  minAge: number
  maxAge: number
  hours: string
  payType: string
  applicationInstructions: string
  skills: string
  featured: boolean
  urgent: boolean
  expiryDate: string
  workLocation: string
  companyDescription: string
  contactPerson: string
  applicationMethod: string
}

interface JobData {
  id: string
  title: string
  company: string
  companyLogo: string
  location: {
    address: string
    city: string
    state: string
    zip: string
    coordinates: {
      lat: number
      lng: number
    }
  }
  jobType: string
  category: string
  postedDate: string
  expiryDate: string
  status: string
  featured: boolean
  urgent: boolean
  salaryAmount: number
  salaryType: string
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
  } | null
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
    icon: React.ReactNode
  }[]
  flowStatus: string
  flowProgress: number
  positions: number
  positionsFilled: number
  gender: string
  ageRange: {
    min: number
    max: number
  }
  hours: string
  payType: string
  applicationInstructions: string
  skills: string[]
  contacts: {
    name: string
    phone: string
  }[]
  endDate: string | null
  workLocation: string
  companyDescription: string
  applicationMethod: string
}

interface EditJobFormProps {
  jobData: JobData
  onClose: () => void
}

export function EditJobForm({ jobData, onClose }: EditJobFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [requirement, setRequirement] = useState("")
  const [benefit, setBenefit] = useState("")

  // Detailed console logs for debugging
  console.log('=== Raw Job Data ===')
  console.log('Complete jobData:', jobData)
  console.log('=== Key Fields ===')
  console.log('Title:', jobData.title)
  console.log('Company:', jobData.company)
  console.log('Category:', jobData.category)
  console.log('Job Type:', jobData.jobType)
  console.log('Location:', jobData.location)
  console.log('Description:', jobData.description)
  console.log('Salary Amount:', jobData.salaryAmount, 'Type:', typeof jobData.salaryAmount)
  console.log('Salary Type:', jobData.salaryType)
  console.log('Duration:', jobData.duration)
  console.log('Positions:', jobData.positions)
  console.log('Gender:', jobData.gender)
  console.log('Age Range:', jobData.ageRange)
  console.log('Hours:', jobData.hours)
  console.log('Pay Type:', jobData.payType)
  console.log('Skills:', jobData.skills)
  console.log('Featured:', jobData.featured)
  console.log('Urgent:', jobData.urgent)
  console.log('Work Location:', jobData.workLocation)
  console.log('Company Description:', jobData.companyDescription)
  console.log('Contact Person:', jobData.contacts?.[0]?.name)
  console.log('Application Method:', jobData.applicationMethod)

  // Extract salary information from rate string
  const [salaryAmount, salaryType] = jobData.salaryAmount !== undefined && jobData.salaryAmount !== null
    ? jobData.salaryAmount.toString().split('/').map(s => s.trim())
    : ["0", ""]

  // Parse location data
  const locationData = typeof jobData.location === 'string' 
    ? { address: jobData.location }
    : jobData.location

  const form = useForm<JobFormValues>({
    resolver: zodResolver(jobFormSchema),
    defaultValues: {
      title: jobData.title || "",
      company: jobData.company || "",
      category: jobData.category || "",
      type: jobData.jobType || "",
      location: {
        address: jobData.location?.address || "",
        city: jobData.location?.city || "",
        state: jobData.location?.state || "",
        zip: jobData.location?.zip || "",
        coordinates: {
          lat: jobData.location?.coordinates?.lat || 0,
          lng: jobData.location?.coordinates?.lng || 0
        }
      },
      description: jobData.description || "",
      requirements: jobData.requirements || [],
      benefits: jobData.benefits || [],
      salaryAmount: jobData.salaryAmount?.toString() || "0",
      salaryType: jobData.salaryType || "",
      duration: jobData.duration || "",
      positionsNeeded: jobData.positions || 1,
      gender: jobData.gender || "",
      minAge: jobData.ageRange?.min || 18,
      maxAge: jobData.ageRange?.max || 18,
      hours: jobData.hours || "",
      payType: jobData.payType || "",
      applicationInstructions: jobData.applicationInstructions || "",
      skills: Array.isArray(jobData.skills) 
        ? jobData.skills.join(', ')
        : jobData.skills || "",
      featured: jobData.featured || false,
      urgent: jobData.urgent || false,
      expiryDate: jobData.endDate || "",
      workLocation: jobData.workLocation || "",
      companyDescription: jobData.companyDescription || "",
      contactPerson: jobData.contacts?.[0]?.name || "",
      applicationMethod: jobData.applicationMethod || "",
    },
  })

  // Log form values after initialization
  console.log('=== Form Values After Initialization ===')
  console.log('Form Values:', form.getValues())
  console.log('Form State:', form.formState)

  // Add useEffect to watch form values
  useEffect(() => {
    const subscription = form.watch((value, { name, type }) => {
      console.log('Form value changed:', { name, value: value[name as keyof typeof value] })
    })
    return () => subscription.unsubscribe()
  }, [form.watch])

  const onSubmit = async (data: JobFormValues) => {
    try {
      setIsSubmitting(true)
      
      // Format the data for submission
      const formattedData: Partial<JobData> = {
        ...data,
        salaryAmount: parseFloat(data.salaryAmount),
        positions: data.positionsNeeded,
        ageRange: {
          min: data.minAge,
          max: data.maxAge
        },
        skills: data.skills.split(',').map(skill => skill.trim()),
        contacts: data.contactPerson ? [{ name: data.contactPerson, phone: "" }] : [],
        endDate: data.expiryDate || null
      }

      // Create a new object without form-specific fields
      const finalData: Partial<JobData> = {
        title: formattedData.title,
        company: formattedData.company,
        category: formattedData.category,
        jobType: formattedData.jobType,
        location: formattedData.location,
        description: formattedData.description,
        requirements: formattedData.requirements,
        benefits: formattedData.benefits,
        salaryAmount: formattedData.salaryAmount,
        salaryType: formattedData.salaryType,
        duration: formattedData.duration,
        positions: formattedData.positions,
        gender: formattedData.gender,
        ageRange: formattedData.ageRange,
        hours: formattedData.hours,
        payType: formattedData.payType,
        applicationInstructions: formattedData.applicationInstructions,
        skills: formattedData.skills,
        featured: formattedData.featured,
        urgent: formattedData.urgent,
        endDate: formattedData.endDate,
        workLocation: formattedData.workLocation,
        companyDescription: formattedData.companyDescription,
        contacts: formattedData.contacts,
        applicationMethod: formattedData.applicationMethod
      }

      const response = await fetch(`/api/admin/jobs/${jobData.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(finalData),
      })

      if (!response.ok) {
        throw new Error('Failed to update job')
      }

      toast.success('Job updated successfully')
      router.refresh()
      onClose()
    } catch (error) {
      console.error('Error updating job:', error)
      toast.error('Failed to update job')
    } finally {
      setIsSubmitting(false)
    }
  }

  const addRequirement = () => {
    if (requirement.trim()) {
      const currentRequirements = form.getValues('requirements') || []
      form.setValue('requirements', [...currentRequirements, requirement.trim()])
      setRequirement("")
    }
  }

  const removeRequirement = (index: number) => {
    const currentRequirements = form.getValues('requirements') || []
    form.setValue('requirements', currentRequirements.filter((_, i) => i !== index))
  }

  const addBenefit = () => {
    if (benefit.trim()) {
      const currentBenefits = form.getValues('benefits') || []
      form.setValue('benefits', [...currentBenefits, benefit.trim()])
      setBenefit("")
    }
  }

  const removeBenefit = (index: number) => {
    const currentBenefits = form.getValues('benefits') || []
    form.setValue('benefits', currentBenefits.filter((_, i) => i !== index))
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Job Title</FormLabel>
                <FormControl>
                  <Input placeholder="Enter job title" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="company"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Company Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter company name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="full-time">Full-time</SelectItem>
                    <SelectItem value="part-time">Part-time</SelectItem>
                    <SelectItem value="contract">Contract</SelectItem>
                    <SelectItem value="internship">Internship</SelectItem>
                    <SelectItem value="temporary">Temporary</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Job Type</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select job type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="remote">Remote</SelectItem>
                    <SelectItem value="on-site">On-site</SelectItem>
                    <SelectItem value="hybrid">Hybrid</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="location.address"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Location</FormLabel>
                <FormControl>
                  <Input placeholder="Enter job location" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="salaryAmount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Salary Amount</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="Enter salary amount" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="salaryType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Salary Type</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select salary type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="hourly">Per Hour</SelectItem>
                    <SelectItem value="daily">Per Day</SelectItem>
                    <SelectItem value="weekly">Per Week</SelectItem>
                    <SelectItem value="monthly">Per Month</SelectItem>
                    <SelectItem value="yearly">Per Year</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="duration"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Duration</FormLabel>
                <FormControl>
                  <Input placeholder="Enter job duration" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="positionsNeeded"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Positions Needed</FormLabel>
                <FormControl>
                  <Input type="number" min={1} placeholder="Enter number of positions" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Job Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Enter job description"
                  className="min-h-[100px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-4">
          <FormLabel>Requirements</FormLabel>
          <div className="flex gap-2">
            <Input
              value={requirement}
              onChange={(e) => setRequirement(e.target.value)}
              placeholder="Enter requirement"
            />
            <Button type="button" onClick={addRequirement}>
              Add
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {form.watch('requirements')?.map((req, index) => (
              <Badge key={index} variant="secondary">
                {req}
                <button
                  type="button"
                  onClick={() => removeRequirement(index)}
                  className="ml-1 hover:text-destructive"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <FormLabel>Benefits</FormLabel>
          <div className="flex gap-2">
            <Input
              value={benefit}
              onChange={(e) => setBenefit(e.target.value)}
              placeholder="Enter benefit"
            />
            <Button type="button" onClick={addBenefit}>
              Add
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {form.watch('benefits')?.map((benefit, index) => (
              <Badge key={index} variant="secondary">
                {benefit}
                <button
                  type="button"
                  onClick={() => removeBenefit(index)}
                  className="ml-1 hover:text-destructive"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="gender"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Gender Preference</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select gender preference" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="any">Any</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="payType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Pay Type</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select pay type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="fixed">Fixed</SelectItem>
                    <SelectItem value="commission">Commission</SelectItem>
                    <SelectItem value="bonus">Bonus</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="minAge"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Minimum Age</FormLabel>
                <FormControl>
                  <Input type="number" min={18} placeholder="Enter minimum age" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="maxAge"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Maximum Age</FormLabel>
                <FormControl>
                  <Input type="number" min={18} placeholder="Enter maximum age" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="hours"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Work Hours</FormLabel>
                <FormControl>
                  <Input placeholder="Enter work hours" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="skills"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Required Skills</FormLabel>
                <FormControl>
                  <Input placeholder="Enter required skills (comma separated)" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="applicationInstructions"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Application Instructions</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Enter application instructions"
                  className="min-h-[100px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-4">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </form>
    </Form>
  )
} 