import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  // This would typically fetch jobs from a database
  try {
    // Example response with dummy data
    return NextResponse.json({ 
      jobs: [
        { id: 1, title: 'Frontend Developer', company: 'Example Corp' },
        { id: 2, title: 'Backend Developer', company: 'Tech Solutions' }
      ] 
    });
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