"use client";

import type React from "react";

import { useState } from "react";
import MainLayout from "@/components/layout/main-layout";
import SectionContainer from "@/components/layout/section-container";
import PageHeader from "@/components/layout/page-header";
import JobSearchForm from "@/components/forms/job-search-form";
import JobList from "@/components/jobs/job-list";
import JobFilters from "@/components/jobs/job-filters";
import { Briefcase, Clock, Search } from "lucide-react";

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const [locationFilter, setLocationFilter] = useState("anywhere");
  const [sortBy, setSortBy] = useState("newest");

  // Filter jobs based on search query and filters
  const filteredJobs = jobListings.filter((job) => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        job.title.toLowerCase().includes(query) ||
        job.company.toLowerCase().includes(query) ||
        job.location.toLowerCase().includes(query)
      );
    }
    return true;
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

        <JobList jobs={filteredJobs} />

        <div className="mt-10 text-center">
          <button className="px-4 py-2 border rounded-md hover:bg-muted transition-colors">
            Load More Jobs
          </button>
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
const jobListings = [
  {
    id: "1",
    title: "Weekend Barista",
    company: "Coffee House",
    location: "San Francisco, CA",
    hours: "10-15 hours/week",
    rate: "$18-22/hour",
    duration: "3 months",
    postedDate: "2 days ago",
    urgent: true,
  },
  {
    id: "2",
    title: "Event Photographer",
    company: "EventPro Agency",
    location: "Remote",
    hours: "Flexible hours",
    rate: "$25-35/hour",
    duration: "One-time event",
    postedDate: "3 days ago",
    urgent: false,
  },
  {
    id: "3",
    title: "Dog Walker",
    company: "PetCare Services",
    location: "Brooklyn, NY",
    hours: "5-10 hours/week",
    rate: "$15-18/hour",
    duration: "Ongoing",
    postedDate: "1 week ago",
    urgent: false,
  },
  {
    id: "4",
    title: "Social Media Assistant",
    company: "Digital Marketing Co.",
    location: "Remote",
    hours: "15-20 hours/week",
    rate: "$20-25/hour",
    duration: "6 months",
    postedDate: "5 days ago",
    urgent: false,
  },
  {
    id: "5",
    title: "Delivery Driver",
    company: "Local Eats",
    location: "Chicago, IL",
    hours: "Evenings & Weekends",
    rate: "$17-20/hour + tips",
    duration: "Ongoing",
    postedDate: "3 days ago",
    urgent: true,
  },
  {
    id: "6",
    title: "Tutor - Mathematics",
    company: "Learning Center",
    location: "Hybrid",
    hours: "8-12 hours/week",
    rate: "$25-30/hour",
    duration: "School year",
    postedDate: "1 day ago",
    urgent: false,
  },
];
