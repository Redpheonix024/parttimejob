import { useState, useCallback, useMemo } from "react";
import { jobsApi } from "../utils/api";

// Cache for storing job data
const jobCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export function useJobs() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchJobs = useCallback(async (forceRefresh = false) => {
    try {
      setLoading(true);
      setError(null);

      // Check cache first if not forcing refresh
      const cacheKey = "all_jobs";
      const cachedData = jobCache.get(cacheKey);
      const now = Date.now();

      if (
        !forceRefresh &&
        cachedData &&
        now - cachedData.timestamp < CACHE_DURATION
      ) {
        setJobs(cachedData.data);
        return;
      }

      const response = await jobsApi.getJobs();
      setJobs(response.jobs);

      // Update cache
      jobCache.set(cacheKey, {
        data: response.jobs,
        timestamp: now,
      });
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to fetch jobs");
    } finally {
      setLoading(false);
    }
  }, []);

  const createJob = useCallback(async (jobData: any) => {
    try {
      setLoading(true);
      setError(null);

      const response = await jobsApi.createJob(jobData);
      setJobs((prevJobs) => [...prevJobs, response.job]);

      // Update cache
      const cacheKey = "all_jobs";
      const cachedData = jobCache.get(cacheKey);
      if (cachedData) {
        jobCache.set(cacheKey, {
          data: [...cachedData.data, response.job],
          timestamp: Date.now(),
        });
      }

      return response.job;
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to create job");
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Memoize filtered jobs
  const filteredJobs = useMemo(() => {
    return jobs;
  }, [jobs]);

  return {
    jobs: filteredJobs,
    loading,
    error,
    fetchJobs,
    createJob,
  };
}
