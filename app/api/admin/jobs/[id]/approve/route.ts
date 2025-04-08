import { NextResponse } from 'next/server'
import { updateJob, createTimelineEvent } from '@/lib/firebase'
import { use } from 'react'

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const resolvedParams = use(params)
    const jobId = resolvedParams.id

    if (!jobId) {
      return NextResponse.json({ error: 'Job ID is required' }, { status: 400 })
    }

    const body = await request.json()
    const { adminNotes } = body

    // Update job status
    const updatedJob = await updateJob(jobId, {
      status: 'approved',
      adminNotes: adminNotes || '',
      flowStatus: 'active',
      updatedAt: new Date().toISOString()
    })

    if (!updatedJob) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 })
    }

    // Create timeline event
    await createTimelineEvent(jobId, 'Job approved by admin')

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error approving job:', error)
    return NextResponse.json(
      { error: 'Failed to approve job' },
      { status: 500 }
    )
  }
} 