export interface Job {
  id: string
  title: string
  company: string
  location: {
    address?: string
    city: string
    state: string
    zip?: string
    coordinates?: {
      lat: number
      lng: number
    }
    display?: string
  }
  hours: string
  rate: string
  duration: string
  type?: string
  postedDate: string
  urgent?: boolean
  description?: string
  responsibilities?: string[]
  requirements?: string[]
  benefits?: string[]
  companyDescription?: string
  applicationMethod?: string
  contactPerson?: string
  applicationInstructions?: string
  createdAt?: Date
  updatedAt?: Date
  userId?: string
}

export interface JobStatus extends Job {
  status: "applied" | "approved" | "in-progress" | "completed" | "paid"
  appliedDate: string
  approvedDate?: string
  startDate?: string
  endDate?: string
  paymentStatus?: "pending" | "processing" | "paid"
  paymentAmount?: string
  paymentDate?: string
  rating?: number
}

