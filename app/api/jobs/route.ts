import { NextRequest, NextResponse } from "next/server";
import { getJobs } from "@/lib/firebase";

interface JobFilters {
  status?: string;
  location?: string;
  type?: string;
  sortBy?: string;
  [key: string]: string | undefined;
}

// Simple in-memory cache with automatic cleanup
const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Cleanup old cache entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of cache.entries()) {
    if (now - value.timestamp > CACHE_DURATION) {
      cache.delete(key);
    }
  }
}, CACHE_DURATION);

export async function GET(request: NextRequest) {
  const now = Date.now();

  try {
    console.log("%c[API] Handling jobs request", "color: #2196F3");

    // Get filters from query params and clean them
    const searchParams = request.nextUrl.searchParams;
    const filters: JobFilters = {
      status: searchParams.get("status")?.trim() || undefined,
      location: searchParams.get("location")?.trim() || undefined,
      type: searchParams.get("type")?.trim() || undefined,
      sortBy: searchParams.get("sortBy")?.trim() || undefined,
    };

    // Remove undefined values
    Object.keys(filters).forEach((key) => {
      if (filters[key] === undefined) {
        delete filters[key];
      }
    });

    console.log("%c[API] Request filters:", "color: #2196F3", filters);

    // Generate cache key based on filters
    const cacheKey = `jobs_${JSON.stringify(filters)}`;
    const cachedData = cache.get(cacheKey);

    // Return cached data if available and fresh
    if (cachedData && now - cachedData.timestamp < CACHE_DURATION) {
      console.log("%c[API] Returning cached jobs data", "color: #4CAF50");
      return NextResponse.json({
        success: true,
        jobs: cachedData.data,
        total: cachedData.data.length,
        cached: true,
        timestamp: now,
        filters,
      });
    }

    // Fetch fresh data
    const jobs = await getJobs(filters);

    if (!Array.isArray(jobs)) {
      console.error("%c[API] Invalid jobs data format", "color: #FF5252");
      return NextResponse.json(
        {
          success: false,
          error: "Invalid jobs data format",
          timestamp: now,
        },
        { status: 500 }
      );
    }

    console.log(
      `%c[API] Successfully fetched ${jobs.length} jobs`,
      "color: #4CAF50"
    );

    // Update cache
    cache.set(cacheKey, {
      data: jobs,
      timestamp: now,
    }); // Set response headers for caching and CORS
    const headers = new Headers({
      "Content-Type": "application/json",
      "Cache-Control": "public, s-maxage=300, stale-while-revalidate=59",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    });

    return new NextResponse(
      JSON.stringify({
        success: true,
        jobs,
        total: jobs.length,
        cached: false,
        timestamp: now,
        filters,
      }),
      {
        status: 200,
        headers,
      }
    );
  } catch (error) {
    console.error("%c[API] Error fetching jobs:", "color: #FF5252", error);
    return new NextResponse(
      JSON.stringify({
        success: false,
        error: "Failed to fetch jobs",
        message: error instanceof Error ? error.message : "Unknown error",
        timestamp: now,
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
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
