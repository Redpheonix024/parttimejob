"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { User } from "firebase/auth";
import MainLayout from "@/components/layout/main-layout";
import SectionContainer from "@/components/layout/section-container";
import PageHeader from "@/components/layout/page-header";
import JobSearchForm from "@/components/forms/job-search-form";
import JobList from "@/components/jobs/job-list";
import JobFilters from "@/components/jobs/job-filters";
import { Briefcase, Clock, Search } from "lucide-react";
import { DropdownMenu } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { getRelativeTime } from "@/utils/relative-time";
import { useSSERefresh } from "@/hooks/useSSERefresh";

// Define constants for job counts
const INITIAL_JOB_LOAD = 6;
const JOBS_PER_PAGE = 10;
const LOAD_MORE_INCREMENT = 6;

interface Job {
  id: string;
  title: string;
  company: string;
  location: {
    address?: string;
    city: string;
    state: string;
    zip?: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  hours: string;
  rate: string;
  duration: string;
  postedDate: string;
  urgent: boolean;
  description?: string;
  requirements?: string[];
  skills?: string[];
  createdAt?: Date;
  updatedAt?: Date;
  userId?: string;
  status: string;
}

// Create separate components for search, job list, and job list header
// to avoid hydration issues
const SearchSection = ({ onSearch }: { onSearch: (query: string) => void }) => (
  <div data-testid="search-section" className="mb-8">
    <JobSearchForm onSubmit={({ query }) => onSearch(query)} />
  </div>
);

const JobListHeader = ({
  count,
  loading,
}: {
  count: number;
  loading: boolean;
}) => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <div
      data-testid="job-list-header"
      className="flex justify-between items-center mb-8"
    >
      <h2 className="text-2xl font-bold">Recent Job Postings</h2>
      {/* {isMounted && !loading && (
        <span className="text-muted-foreground">{count} jobs found</span>
      )} */}
    </div>
  );
};

export default function Home() {
  useSSERefresh();
  const [searchQuery, setSearchQuery] = useState("");
  const [locationFilter, setLocationFilter] = useState("anywhere");
  const [sortBy, setSortBy] = useState("newest");
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [visibleJobsCount, setVisibleJobsCount] = useState(INITIAL_JOB_LOAD);
  const [user, setUser] = useState<User | null>(null);

  // Determine if filters are active
  const isFiltered =
    searchQuery !== "" || locationFilter !== "anywhere" || sortBy !== "newest";

  useEffect(() => {
    let isSubscribed = true;
    let attempts = 0;
    const maxAttempts = 3;

    const fetchJobs = async () => {
      try {
        if (!isSubscribed) return;

        setLoading(true);
        setError(null);

        // Construct URL with filters
        const params = new URLSearchParams();
        if (searchQuery) params.append("search", searchQuery);
        if (locationFilter !== "anywhere")
          params.append("location", locationFilter);
        if (sortBy !== "newest") params.append("sortBy", sortBy);

        const url = `/api/jobs${
          params.toString() ? `?${params.toString()}` : ""
        }`;
        console.log("%c[Page] Fetching jobs with URL:", "color: #2196F3", url);

        const response = await fetch(url, {
          method: "GET",
          headers: {
            Accept: "application/json",
            "Cache-Control": "no-cache",
          },
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(
            errorData.message || `Failed to fetch jobs: ${response.status}`
          );
        }

        const data = await response.json();

        if (!data.success) {
          throw new Error(data.message || "Failed to fetch jobs");
        }

        if (!isSubscribed) return;

        // Format the jobs data to match our interface using the relative time utility
        const formattedJobs = data.jobs.map((job: any) => ({
          ...job,
          postedDate: getRelativeTime(job.createdAt),
          urgent: job.urgent || false,
          // Handle location data safely
          location: {
            ...(job.location || {}),
            city: job.location?.city || "",
            state: job.location?.state || "",
            address: job.location?.address || "",
            zip: job.location?.zip || "",
            coordinates: job.location?.coordinates || null,
          },
        }));

        if (!isSubscribed) return;

        console.log(
          "%c[Page] Formatted jobs:",
          "color: #4CAF50",
          formattedJobs
        );
        setJobs(formattedJobs);
      } catch (err) {
        console.error("%c[Page] Error fetching jobs:", "color: #FF5252", err);

        if (!isSubscribed) return;

        attempts++;
        if (attempts < maxAttempts) {
          const retryDelay = Math.min(1000 * Math.pow(2, attempts), 5000); // Exponential backoff with 5s max
          console.log(
            `%c[Page] Retrying in ${retryDelay}ms... Attempt ${
              attempts + 1
            }/${maxAttempts}`,
            "color: #FF9800"
          );
          await new Promise((resolve) => setTimeout(resolve, retryDelay));
          return fetchJobs();
        }

        setError(
          err instanceof Error
            ? err.message
            : "Failed to load jobs. Please try again later."
        );
      } finally {
        if (isSubscribed) {
          setLoading(false);
        }
      }
    };

    console.log("%c[Page] Starting job fetch effect", "color: #9C27B0");
    fetchJobs();

    return () => {
      isSubscribed = false;
    };
  }, [searchQuery, locationFilter, sortBy]); // Added dependencies to re-fetch when filters change
  // Filter jobs based on search query and filters
  const filteredJobs = jobs
    .filter((job) => {
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          job.title.toLowerCase().includes(query) ||
          job.company.toLowerCase().includes(query) ||
          job.location.city.toLowerCase().includes(query) ||
          job.location.state.toLowerCase().includes(query) ||
          job.description?.toLowerCase().includes(query)
        );
      }
      return true;
    })
    .sort((a, b) => {
      if (sortBy === "newest") {
        return (
          new Date(b.createdAt || 0).getTime() -
          new Date(a.createdAt || 0).getTime()
        );
      } else if (sortBy === "oldest") {
        return (
          new Date(a.createdAt || 0).getTime() -
          new Date(b.createdAt || 0).getTime()
        );
      }
      return 0;
    });

  // Determine which jobs to display based on pagination or "load more" mode
  let jobsToDisplay: Job[] = [];
  let totalPages = 0;

  if (isFiltered) {
    // Pagination mode
    const indexOfLastJob = currentPage * JOBS_PER_PAGE;
    const indexOfFirstJob = indexOfLastJob - JOBS_PER_PAGE;
    jobsToDisplay = filteredJobs.slice(indexOfFirstJob, indexOfLastJob);
    totalPages = Math.ceil(filteredJobs.length / JOBS_PER_PAGE);
  } else {
    // Load more mode
    jobsToDisplay = filteredJobs.slice(0, visibleJobsCount);
  }

  // Change page handler (for pagination)
  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  // Load more jobs handler
  const loadMoreJobs = () => {
    setVisibleJobsCount((prev) => prev + LOAD_MORE_INCREMENT);
  };

  // Reset states when filters change
  useEffect(() => {
    setCurrentPage(1);
    setVisibleJobsCount(INITIAL_JOB_LOAD);
  }, [searchQuery, locationFilter, sortBy]);

  return (
    <MainLayout activeLink="jobs">
      <PageHeader
        title="Find Part-Time Jobs or Post Your Needs"
        description="Connect with local part-time opportunities or find qualified people for your short-term tasks."
      />

      <SectionContainer>
        {/* Search section */}
        <SearchSection onSearch={setSearchQuery} />

        {/* Job list header with count */}
        <JobListHeader count={filteredJobs.length} loading={loading} />

        {/* Filters */}
        <JobFilters
          searchQuery={searchQuery}
          locationFilter={locationFilter}
          sortBy={sortBy}
          onSearch={setSearchQuery}
          onLocationChange={setLocationFilter}
          onSortChange={setSortBy}
        />

        {/* Job results */}
        <div data-testid="job-results">
          {loading ? (
            <div className="text-center py-8">Loading jobs...</div>
          ) : error ? (
            <div className="text-center py-8 text-red-500">{error}</div>
          ) : jobsToDisplay.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No jobs found matching your criteria.
            </div>
          ) : (
            <>
              <JobList jobs={jobsToDisplay} />

              {/* Conditional navigation controls */}
              {isFiltered ? (
                // Pagination controls
                totalPages > 1 && (
                  <div
                    data-testid="pagination-controls"
                    className="mt-10 flex justify-center items-center space-x-1"
                  >
                    <button
                      onClick={() => paginate(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="px-3 py-1 border rounded-md hover:bg-muted transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>

                    {/* Simple page numbers for now */}
                    {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                      const pageNum = i + 1;
                      return (
                        <button
                          key={pageNum}
                          onClick={() => paginate(pageNum)}
                          className={`px-3 py-1 border rounded-md transition-colors ${
                            currentPage === pageNum
                              ? "bg-primary text-primary-foreground"
                              : "hover:bg-muted"
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}

                    {totalPages > 5 && <span className="px-2">...</span>}

                    {totalPages > 5 && (
                      <button
                        onClick={() => paginate(totalPages)}
                        className={`px-3 py-1 border rounded-md transition-colors ${
                          currentPage === totalPages
                            ? "bg-primary text-primary-foreground"
                            : "hover:bg-muted"
                        }`}
                      >
                        {totalPages}
                      </button>
                    )}

                    <button
                      onClick={() => paginate(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="px-3 py-1 border rounded-md hover:bg-muted transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                )
              ) : // Load More button
              visibleJobsCount < filteredJobs.length ? (
                <div data-testid="load-more" className="mt-10 text-center">
                  <button
                    onClick={loadMoreJobs}
                    className="px-4 py-2 border rounded-md hover:bg-muted transition-colors"
                  >
                    Load More Jobs
                  </button>
                </div>
              ) : (
                filteredJobs.length > 0 && (
                  <div
                    data-testid="end-of-jobs"
                    className="mt-10 text-center text-muted-foreground"
                  >
                    End of job listings.
                  </div>
                )
              )}
            </>
          )}
        </div>
      </SectionContainer>

      <SectionContainer muted>
        <h2 className="text-3xl font-bold mb-6 text-center">
          Why Use Parttimejob?
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <FeatureCard
            icon={<Briefcase className="h-6 w-6 text-primary" />}
            title="Find Flexible Work"
            description="Browse through hundreds of part-time opportunities that fit your schedule and skills."
          />
          <FeatureCard
            icon={<Search className="h-6 w-6 text-primary" />}
            title="Post Your Needs"
            description="Quickly find qualified people for your short-term tasks or part-time positions."
          />
          <FeatureCard
            icon={<Clock className="h-6 w-6 text-primary" />}
            title="Save Time"
            description="Our streamlined platform connects you directly with opportunities or candidates."
          />
        </div>
      </SectionContainer>
    </MainLayout>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="bg-card p-6 rounded-lg shadow-sm">
      <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
        {icon}
      </div>
      <h3 className="text-xl font-semibold mb-2 text-center">{title}</h3>
      <p className="text-muted-foreground text-center">{description}</p>
    </div>
  );
}

// Sample job data
