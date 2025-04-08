import { NextResponse } from 'next/server'
import { updateJob, createTimelineEvent } from '@/lib/firebase'

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { adminNotes, rejectionReason } = await request.json()

    await updateJob(params.id, {
      adminNotes,
      rejectionReason,
      updatedAt: new Date().toISOString(),
    })

    await createTimelineEvent(params.id, 'Admin notes updated')

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating notes:', error)
    return NextResponse.json(
      { error: 'Failed to update notes' },
      { status: 500 }
    )
  }
} 