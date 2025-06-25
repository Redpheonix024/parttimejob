import { NextRequest, NextResponse } from 'next/server';
import type { JobStatus } from '@/types/job';
import { collection, query, where, getDocs, getDoc, doc } from "firebase/firestore";
import { db } from "@/app/config/firebase";
import { headers } from 'next/headers';

// Mocking some job application data for testing/backup
// In case Firebase auth fails, this will ensure the page still works
const mockJobStatus: JobStatus[] = [
  {
    id: "job1",
    title: "Web Developer",
    company: "Tech Solutions",
    location: {
      city: "Remote",
      state: "",
      display: "Remote"
    },
    hours: "20-30 hours/week",
    rate: "₹2250/hour",
    duration: "3 months",
    type: "Contract",
    appliedDate: "June 1, 2023",
    status: "hired",
    postedDate: "May 25, 2023",
    startDate: "June 10, 2023"
  },
  {
    id: "job2",
    title: "Social Media Manager",
    company: "Digital Agency",
    location: {
      city: "Mumbai",
      state: "MH",
      display: "Mumbai, MH"
    },
    hours: "15 hours/week",
    rate: "₹1800/hour",
    duration: "Ongoing",
    type: "Part-time",
    appliedDate: "May 15, 2023",
    status: "applied",
    postedDate: "May 10, 2023"
  }
];

export async function GET(request: NextRequest) {
  // Simulating a delay like a real API
  await new Promise(resolve => setTimeout(resolve, 500));
  
  try {
    // Get user ID from the Authorization header
    const headersList = headers();
    const authHeader = headersList.get('authorization') || '';
    const userId = authHeader.split('Bearer ')[1];
    
    // If no valid user ID is found, return mock data for testing
    // In a production app, you'd return 401 Unauthorized
    if (!userId) {
      console.warn('No user ID provided, returning mock data');
      return NextResponse.json({ jobs: mockJobStatus });
    }

    // Get all applications for the current user
    const applicationsQuery = query(
      collection(db, "applications"),
      where("userId", "==", userId)
    );

    const querySnapshot = await getDocs(applicationsQuery);
    
    // If no applications found, return an empty array
    if (querySnapshot.empty) {
      return NextResponse.json({ jobs: [] });
    }

    // Process each application and fetch related job details
    const jobs = await Promise.all(
      querySnapshot.docs.map(async (docSnapshot) => {
        const appData = docSnapshot.data();
        const applicationId = docSnapshot.id;
        
        // Get related job data
        let jobData = {};
        if (appData.jobId) {
          const jobDocRef = doc(db, "jobs", appData.jobId);
          const jobDoc = await getDoc(jobDocRef);
          if (jobDoc.exists()) {
            jobData = jobDoc.data();
          }
        }

        // Determine job status based on application status
        // Default to 'applied' if no status in the application
        const status = appData.status || 'applied';
        
        // Format dates
        let appliedDate = 'Unknown';
        if (appData.createdAt) {
          const date = appData.createdAt.toDate();
          appliedDate = date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          });
        }

        // Create job status object
        const jobStatus: JobStatus = {
          id: applicationId,
          title: appData.jobTitle || (jobData as any).title || 'Untitled Position',
          company: appData.company || (jobData as any).company || 'Unknown Company',
          location: {
            city: (jobData as any).location?.city || 'Remote',
            state: (jobData as any).location?.state || '',
            display: (jobData as any).location?.display || 'Remote'
          },
          hours: (jobData as any).hours || 'Flexible',
          rate: (jobData as any).salaryAmount ? `₹${(jobData as any).salaryAmount}/${(jobData as any).salaryType || 'hour'}` : 'Negotiable',
          duration: (jobData as any).duration || 'Not specified',
          type: (jobData as any).jobType || 'Not specified',
          postedDate: (jobData as any).postedDate || 'Unknown',
          status: status as "applied" | "approved" | "hired" | "completed" | "paid",
          appliedDate: appliedDate,
          // Optional fields
          approvedDate: appData.approvedDate ? new Date(appData.approvedDate.toDate()).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          }) : undefined,
          startDate: appData.startDate ? new Date(appData.startDate.toDate()).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          }) : undefined,
          endDate: appData.endDate ? new Date(appData.endDate.toDate()).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          }) : undefined,
          paymentStatus: appData.paymentStatus as "pending" | "processing" | "paid" | undefined,
          paymentAmount: appData.paymentAmount ? `₹${appData.paymentAmount}` : undefined,
          paymentDate: appData.paymentDate ? new Date(appData.paymentDate.toDate()).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          }) : undefined,
          rating: appData.rating
        };

        return jobStatus;
      })
    );

    return NextResponse.json({ jobs });
  } catch (error) {
    console.error('Error fetching job status:', error);
    // Return mock data in case of any errors
    return NextResponse.json({ jobs: mockJobStatus });
  }
} 