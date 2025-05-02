import { NextRequest, NextResponse } from "next/server";
import { getJobs } from "@/lib/firebase";
import { headers } from "next/headers";

// Simple in-memory cache
const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export async function GET(request: NextRequest) {
  try {
    // Check cache first
    const cacheKey = "all_jobs";
    const cachedData = cache.get(cacheKey);
    const now = Date.now();

    if (cachedData && now - cachedData.timestamp < CACHE_DURATION) {
      return NextResponse.json({ jobs: cachedData.data });
    }

    // Get jobs from database
    const jobs = await getJobs();

    // Update cache
    cache.set(cacheKey, {
      data: jobs,
      timestamp: now,
    });

    // Set cache control headers
    const headersList = new Headers();
    headersList.set(
      "Cache-Control",
      "public, s-maxage=300, stale-while-revalidate=59"
    );

    return NextResponse.json({ jobs }, { headers: headersList });
  } catch (error) {
    console.error("Error fetching jobs:", error);
    return NextResponse.json(
      { error: "Failed to fetch jobs" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const jobData = await request.json();

    // This would typically save the job to a database
    // For now, we'll just return the job data as if it was saved

    return NextResponse.json({
      success: true,
      job: { id: Math.floor(Math.random() * 1000), ...jobData },
    });
  } catch (error) {
    console.error("Error creating job:", error);
    return NextResponse.json(
      { error: "Failed to create job" },
      { status: 500 }
    );
  }
}
