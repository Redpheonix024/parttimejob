"use client";

import React from "react";
import { useParams } from "next/navigation";
import MainLayout from "@/components/layout/main-layout";
import EditJobForm from "@/components/jobs/edit-job-form";

export default function EditJobPage() {
  const params = useParams();
  const jobId = params.id as string;

  return (
    <MainLayout activeLink="jobs">
      <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Edit Job</h1>
          <p className="text-muted-foreground mt-2">
            Update the job details below
          </p>
        </div>
        <EditJobForm jobId={jobId} />
      </div>
    </MainLayout>
  );
}
