import { NextResponse } from 'next/server';
import { getJobs, getUser, deleteJob, db } from '@/lib/firebase';
import { Timestamp } from 'firebase/firestore';
import { doc, updateDoc, getDoc } from 'firebase/firestore';

interface Job {
  id: string;
  title?: string;
  company?: string;
  companyName?: string;
  category?: string;
  status?: string;
  createdAt?: any;
  updatedAt?: any;
  employerId?: string;
  draftStatus?: string;
  flowStatus?: string;
  positionsNeeded?: number;
  positionsFilled?: number;
}

// Helper function to safely convert Firebase Timestamp to Date
const convertTimestampToDate = (timestamp: any) => {
  if (timestamp instanceof Timestamp) {
    return timestamp.toDate();
  }
  if (timestamp?.toDate) {
    return timestamp.toDate();
  }
  return new Date();
};

export async function GET() {
  try {
    const jobs = await getJobs();
    
    if (!jobs) {
      return NextResponse.json({ error: 'No jobs found' }, { status: 404 });
    }

    // Transform the jobs data to match the frontend interface
    const transformedJobs = await Promise.all(jobs.map(async (job: Job) => {
      // Get user data if available
      let user = null;
      if (job.employerId) {
        try {
          user = await getUser(job.employerId);
        } catch (error) {
          console.error('Error fetching user for job:', job.id, error);
        }
      }

      // Create a formatted name from firstName and lastName if available
      const firstName = user?.firstName || '';
      const lastName = user?.lastName || '';
      const formattedName = firstName && lastName 
        ? `${firstName} ${lastName}` 
        : firstName || lastName || user?.name || user?.displayName || 'Unknown';

      return {
        id: job.id,
        title: job.title || '',
        company: job.company || '',
        companyName: job.companyName || '',
        category: job.category || '',
        status: job.status || 'draft',
        createdAt: job.createdAt ? convertTimestampToDate(job.createdAt).toISOString() : new Date().toISOString(),
        updatedAt: job.updatedAt ? convertTimestampToDate(job.updatedAt).toISOString() : new Date().toISOString(),
        employerId: job.employerId || '',
        employerName: formattedName,
        employerFirstName: firstName,
        employerLastName: lastName,
        employerEmail: user?.email || '',
        draftStatus: job.draftStatus || 'pending',
        flowStatus: job.flowStatus || 'draft',
        positionsNeeded: job.positionsNeeded || 1,
        positionsFilled: job.positionsFilled || 0
      };
    }));

    return NextResponse.json(transformedJobs);
  } catch (error) {
    console.error('Error fetching jobs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch jobs' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { id } = await request.json();
    
    if (!id) {
      return NextResponse.json({ error: 'Job ID is required' }, { status: 400 });
    }

    const success = await deleteJob(id);
    
    if (!success) {
      return NextResponse.json({ error: 'Failed to delete job' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting job:', error);
    return NextResponse.json(
      { error: 'Failed to delete job' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const { id, ...jobData } = await request.json();
    
    if (!id) {
      return NextResponse.json({ error: 'Job ID is required' }, { status: 400 });
    }

    const jobRef = doc(db, "jobs", id);
    await updateDoc(jobRef, {
      ...jobData,
      updatedAt: new Date()
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating job:', error);
    return NextResponse.json(
      { error: 'Failed to update job' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const { id, action } = await request.json();
    
    if (!id) {
      return NextResponse.json({ error: 'Job ID is required' }, { status: 400 });
    }

    if (!action || !['activate', 'deactivate'].includes(action)) {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    const jobRef = doc(db, "jobs", id);
    const jobDoc = await getDoc(jobRef);
    
    if (!jobDoc.exists()) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    const currentStatus = jobDoc.data().status?.toLowerCase() || 'active';
    const newStatus = action === 'activate' ? 'Active' : 'Deactivated';

    // Only update if the status is actually changing
    if (currentStatus === newStatus.toLowerCase()) {
      return NextResponse.json({ 
        success: true,
        message: `Job is already ${newStatus.toLowerCase()}`
      });
    }

    await updateDoc(jobRef, {
      status: newStatus,
      updatedAt: new Date()
    });

    return NextResponse.json({ 
      success: true,
      message: `Job ${action === 'activate' ? 'activated' : 'deactivated'} successfully`
    });
  } catch (error) {
    console.error('Error updating job status:', error);
    return NextResponse.json(
      { error: 'Failed to update job status' },
      { status: 500 }
    );
  }
} 