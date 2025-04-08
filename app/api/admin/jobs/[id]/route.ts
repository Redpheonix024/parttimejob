import { NextResponse } from 'next/server'
import { getJob, getUser, getJobApplications } from '@/lib/firebase'
import { use } from 'react'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const resolvedParams = use(params)
    const jobId = resolvedParams.id

    if (!jobId) {
      console.error('Job ID is missing')
      return NextResponse.json({ error: 'Job ID is required' }, { status: 400 })
    }

    console.log('Fetching job data for ID:', jobId)
    const job = await getJob(jobId)
    
    if (!job) {
      console.error('Job not found for ID:', jobId)
      return NextResponse.json({ error: 'Job not found' }, { status: 404 })
    }

    console.log('Job found:', job)

    // Get employer data if available
    let employer = null
    if (job.employerId) {
      try {
        console.log('Fetching employer data for ID:', job.employerId)
        employer = await getUser(job.employerId)
        console.log('Employer found:', employer)
      } catch (error) {
        console.error('Error fetching employer:', error)
        // Continue without employer data
      }
    }

    // Get applications if available
    let applications = []
    try {
      console.log('Fetching applications for job ID:', jobId)
      applications = await getJobApplications(jobId)
      console.log('Applications found:', applications.length)
    } catch (error) {
      console.error('Error fetching applications:', error)
      // Continue without applications
    }

    // Transform the data to match the frontend interface
    const transformedJob = {
      id: job.id,
      title: job.title || '',
      company: job.company || '',
      companyLogo: job.companyLogo || '/placeholder.svg',
      location: job.location || '',
      type: job.type || '',
      category: job.category || '',
      postedDate: job.createdAt || new Date().toISOString(),
      expiryDate: job.expiryDate || '',
      status: job.status || 'draft',
      featured: job.featured || false,
      urgent: job.urgent || false,
      rate: job.rate || '',
      duration: job.duration || '',
      applications: applications.length,
      views: job.views || 0,
      description: job.description || '',
      requirements: job.requirements || [],
      benefits: job.benefits || [],
      employer: employer ? {
        id: employer.id,
        name: employer.name || '',
        email: employer.email || '',
        phone: employer.phone || '',
        avatar: employer.avatar || '/placeholder.svg'
      } : null,
      applicants: applications.map(applicant => ({
        id: applicant.id,
        name: applicant.user?.name || '',
        email: applicant.user?.email || '',
        appliedDate: applicant.createdAt || new Date().toISOString(),
        status: applicant.status || 'pending',
        avatar: applicant.user?.avatar || '/placeholder.svg'
      })),
      timeline: job.timeline || [],
      flowStatus: job.flowStatus || 'draft',
      flowProgress: calculateFlowProgress(job.flowStatus || 'draft'),
      positionsNeeded: job.positionsNeeded || 1,
      positionsFilled: job.positionsFilled || 0,
      draftDetails: {
        submittedBy: employer?.name || 'Unknown',
        submittedDate: job.createdAt || new Date().toISOString(),
        lastEdited: job.updatedAt || new Date().toISOString(),
        adminNotes: job.adminNotes || '',
        status: job.draftStatus || 'pending',
        rejectionReason: job.rejectionReason || ''
      }
    }

    console.log('Transformed job data:', transformedJob)
    return NextResponse.json(transformedJob)
  } catch (error) {
    console.error('Error in GET /api/admin/jobs/[id]:', error)
    return NextResponse.json(
      { error: 'Failed to fetch job data', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

function calculateFlowProgress(flowStatus: string): number {
  const statusOrder = [
    'draft',
    'pending-approval',
    'active',
    'filling',
    'completed',
    'payment-pending',
    'payment-distributed'
  ]
  const currentIndex = statusOrder.indexOf(flowStatus)
  return currentIndex >= 0 ? (currentIndex / (statusOrder.length - 1)) * 100 : 0
} 