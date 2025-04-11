import { NextRequest, NextResponse } from 'next/server';
import { getJobs } from '@/lib/firebase';

export async function GET(request: NextRequest) {
  try {
    const jobs = await getJobs();
    return NextResponse.json({ jobs });
  } catch (error) {
    console.error("Error fetching jobs:", error);
    return NextResponse.json({ error: 'Failed to fetch jobs' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const jobData = await request.json();
    
    // This would typically save the job to a database
    // For now, we'll just return the job data as if it was saved
    
    return NextResponse.json({ 
      success: true, 
      job: { id: Math.floor(Math.random() * 1000), ...jobData } 
    });
  } catch (error) {
    console.error("Error creating job:", error);
    return NextResponse.json({ error: 'Failed to create job' }, { status: 500 });
  }
} 