import { useState, useCallback } from 'react';
import { jobsApi } from '../utils/api';

export function useJobs() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchJobs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await jobsApi.getJobs();
      setJobs(response.jobs);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to fetch jobs');
    } finally {
      setLoading(false);
    }
  }, []);

  const createJob = useCallback(async (jobData: any) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await jobsApi.createJob(jobData);
      setJobs(prevJobs => [...prevJobs, response.job]);
      return response.job;
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to create job');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    jobs,
    loading,
    error,
    fetchJobs,
    createJob
  };
} 