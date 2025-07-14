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

export default function HomeClient() {
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

    fetchJobs();

    return () => {
      isSubscribed = false;
    };
  }, [searchQuery, locationFilter, sortBy]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
    setVisibleJobsCount(INITIAL_JOB_LOAD);
  };

  const handleLocationFilter = (location: string) => {
    setLocationFilter(location);
    setCurrentPage(1);
    setVisibleJobsCount(INITIAL_JOB_LOAD);
  };

  const handleSortBy = (sort: string) => {
    setSortBy(sort);
    setCurrentPage(1);
    setVisibleJobsCount(INITIAL_JOB_LOAD);
  };

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  const loadMoreJobs = () => {
    setVisibleJobsCount((prev) => prev + LOAD_MORE_INCREMENT);
  };

  const visibleJobs = jobs.slice(0, visibleJobsCount);
  const hasMoreJobs = visibleJobsCount < jobs.length;

  return (
    <MainLayout>
      <PageHeader
        title="Find Your Perfect Part-Time Job"
        subtitle="Connect with local opportunities or find qualified people for your short-term tasks"
      />

      <SectionContainer>
        <SearchSection onSearch={handleSearch} />

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1">
            <JobFilters
              locationFilter={locationFilter}
              sortBy={sortBy}
              onLocationFilter={handleLocationFilter}
              onSortBy={handleSortBy}
              isFiltered={isFiltered}
            />
          </div>

          <div className="lg:col-span-3">
            <JobListHeader count={jobs.length} loading={loading} />

            {error && (
              <div className="text-center py-8">
                <p className="text-red-500 mb-4">{error}</p>
                <Button onClick={() => window.location.reload()}>
                  Try Again
                </Button>
              </div>
            )}

            {!error && (
              <>
                <JobList
                  jobs={visibleJobs}
                  loading={loading}
                  currentPage={currentPage}
                  jobsPerPage={JOBS_PER_PAGE}
                  onPageChange={paginate}
                />

                {hasMoreJobs && (
                  <div className="text-center mt-8">
                    <Button onClick={loadMoreJobs} variant="outline">
                      Load More Jobs
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Features Section */}
        <div className="mt-16">
          <h2 className="text-3xl font-bold text-center mb-12">
            Why Choose Parttimejob?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard
              icon={<Briefcase className="h-8 w-8" />}
              title="Find Local Opportunities"
              description="Discover part-time jobs in your area with our location-based search."
            />
            <FeatureCard
              icon={<Clock className="h-8 w-8" />}
              title="Flexible Scheduling"
              description="Find jobs that fit your schedule, whether it's evenings, weekends, or specific hours."
            />
            <FeatureCard
              icon={<Search className="h-8 w-8" />}
              title="Easy Search & Apply"
              description="Simple search filters and one-click applications make job hunting effortless."
            />
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-16 text-center">
          <h2 className="text-2xl font-bold mb-4">
            Ready to Start Your Part-Time Journey?
          </h2>
          <p className="text-muted-foreground mb-6">
            Join thousands of people finding flexible work opportunities.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg">
              <Link href="/jobs">Browse Jobs</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/post-job">Post a Job</Link>
            </Button>
          </div>
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
    <div className="text-center p-6 rounded-lg border bg-card">
      <div className="flex justify-center mb-4 text-primary">{icon}</div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </div>
  );
} 