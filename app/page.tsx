"use client";

import type React from "react";
import { useState, useEffect } from "react";
import MainLayout from "@/components/layout/main-layout";
import SectionContainer from "@/components/layout/section-container";
import PageHeader from "@/components/layout/page-header";
import JobSearchForm from "@/components/forms/job-search-form";
import JobList from "@/components/jobs/job-list";
import JobFilters from "@/components/jobs/job-filters";
import { Briefcase, Clock, Search } from "lucide-react";

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

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const [locationFilter, setLocationFilter] = useState("anywhere");
  const [sortBy, setSortBy] = useState("newest");
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const response = await fetch('/api/jobs');
        if (!response.ok) {
          throw new Error('Failed to fetch jobs');
        }
        const data = await response.json();
        // Format the jobs data to match our interface
        const formattedJobs = data.jobs.map((job: any) => {
          // Debug the createdAt field
          console.log('Job createdAt:', job.createdAt);
          console.log('Job createdAt type:', typeof job.createdAt);
          console.log('Job createdAt value:', job.createdAt);
          
          // Helper function to safely convert timestamp to relative time
          const getPostedDate = (timestamp: any) => {
            try {
              if (!timestamp) return 'Recently';
              
              let date: Date;
              
              // Handle Firebase Timestamp
              if (timestamp.seconds) {
                date = new Date(timestamp.seconds * 1000);
              }
              // Handle ISO string
              else if (typeof timestamp === 'string') {
                date = new Date(timestamp);
              }
              // Handle Date object
              else if (timestamp instanceof Date) {
                date = timestamp;
              } else {
                return 'Recently';
              }

              if (isNaN(date.getTime())) {
                return 'Recently';
              }

              const now = new Date();
              const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
              
              if (diffInSeconds < 60) {
                return 'Just now';
              }
              
              const diffInMinutes = Math.floor(diffInSeconds / 60);
              if (diffInMinutes < 60) {
                return `${diffInMinutes} ${diffInMinutes === 1 ? 'minute' : 'minutes'} ago`;
              }
              
              const diffInHours = Math.floor(diffInMinutes / 60);
              if (diffInHours < 24) {
                return `${diffInHours} ${diffInHours === 1 ? 'hour' : 'hours'} ago`;
              }
              
              const diffInDays = Math.floor(diffInHours / 24);
              if (diffInDays < 7) {
                return `${diffInDays} ${diffInDays === 1 ? 'day' : 'days'} ago`;
              }
              
              const diffInWeeks = Math.floor(diffInDays / 7);
              if (diffInWeeks < 4) {
                return `${diffInWeeks} ${diffInWeeks === 1 ? 'week' : 'weeks'} ago`;
              }
              
              const diffInMonths = Math.floor(diffInDays / 30);
              if (diffInMonths < 12) {
                return `${diffInMonths} ${diffInMonths === 1 ? 'month' : 'months'} ago`;
              }
              
              const diffInYears = Math.floor(diffInMonths / 12);
              return `${diffInYears} ${diffInYears === 1 ? 'year' : 'years'} ago`;
              
            } catch (error) {
              console.error('Error formatting date:', error);
              return 'Recently';
            }
          };

          return {
            ...job,
            postedDate: getPostedDate(job.createdAt),
            urgent: job.urgent || false,
            // Handle location data safely
            location: {
              ...(job.location || {}),
              display: job.location?.display || 
                      (job.location?.city && job.location?.state 
                        ? `${job.location.city}, ${job.location.state}`
                        : job.workLocation === 'on-site' ? 'On-site' : 'Remote'),
              city: job.location?.city || '',
              state: job.location?.state || '',
              address: job.location?.address || '',
              zip: job.location?.zip || '',
              coordinates: job.location?.coordinates || null
            }
          };
        });
        setJobs(formattedJobs);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, []);

  // Filter jobs based on search query and filters
  const filteredJobs = jobs
    .filter((job) => job.status === "Active") // First filter for active jobs
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
      if (sortBy === 'newest') {
        return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
      } else if (sortBy === 'oldest') {
        return new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime();
      }
      return 0;
    });

  return (
    <MainLayout activeLink="jobs">
      <PageHeader
        title="Find Part-Time Jobs or Post Your Needs"
        description="Connect with local part-time opportunities or find qualified people for your short-term tasks."
      >
        <JobSearchForm onSubmit={({ query }) => setSearchQuery(query)} />
      </PageHeader>

      <SectionContainer>
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold">Recent Job Postings</h2>
        </div>

        <JobFilters
          searchQuery={searchQuery}
          locationFilter={locationFilter}
          sortBy={sortBy}
          onSearch={setSearchQuery}
          onLocationChange={setLocationFilter}
          onSortChange={setSortBy}
        />

        {loading ? (
          <div className="text-center py-8">Loading jobs...</div>
        ) : error ? (
          <div className="text-center py-8 text-red-500">{error}</div>
        ) : (
          <>
            <JobList jobs={filteredJobs} />
            <div className="mt-10 text-center">
              <button className="px-4 py-2 border rounded-md hover:bg-muted transition-colors">
                Load More Jobs
              </button>
            </div>
          </>
        )}
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

