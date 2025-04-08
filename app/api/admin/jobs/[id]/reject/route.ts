import { NextResponse } from 'next/server'
import { updateJob, createTimelineEvent } from '@/lib/firebase'

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { adminNotes, rejectionReason } = await request.json()

    await updateJob(params.id, {
      draftStatus: 'rejected',
      adminNotes,
      rejectionReason,
      flowStatus: 'draft',
      updatedAt: new Date().toISOString(),
    })

    await createTimelineEvent(params.id, 'Job rejected by admin')

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error rejecting job:', error)
    return NextResponse.json(
      { error: 'Failed to reject job' },
      { status: 500 }
    )
  }
} 