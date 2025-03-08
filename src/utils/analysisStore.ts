// A simple in-memory store for analysis jobs
// In a production environment, this would be replaced with a database

export interface AnalysisJob {
  id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  startTime: number;
  result?: any;
  error?: string;
}

// Global variable to store jobs (will be reset on server restart)
const jobs = new Map<string, AnalysisJob>();

export const analysisStore = {
  // Create a new job
  createJob: (id: string): AnalysisJob => {
    const job: AnalysisJob = {
      id,
      status: 'pending',
      startTime: Date.now(),
    };
    jobs.set(id, job);
    return job;
  },

  // Get a job by ID
  getJob: (id: string): AnalysisJob | undefined => {
    return jobs.get(id);
  },

  // Update a job
  updateJob: (id: string, updates: Partial<AnalysisJob>): AnalysisJob | undefined => {
    const job = jobs.get(id);
    if (!job) return undefined;

    const updatedJob = { ...job, ...updates };
    jobs.set(id, updatedJob);
    return updatedJob;
  },

  // Clean up old jobs (older than 1 hour)
  cleanupOldJobs: (): void => {
    const oneHourAgo = Date.now() - 60 * 60 * 1000;
    for (const [id, job] of jobs.entries()) {
      if (job.startTime < oneHourAgo) {
        jobs.delete(id);
      }
    }
  }
};

// Clean up old jobs every hour
analysisStore.cleanupOldJobs = analysisStore.cleanupOldJobs.bind(analysisStore);
setInterval(analysisStore.cleanupOldJobs, 60 * 60 * 1000);
