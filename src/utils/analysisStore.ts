// A persistent store for analysis jobs
// This approach works better with serverless environments like Vercel

export interface AnalysisJob {
  id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  startTime: number;
  result?: any;
  error?: string;
}

// In-memory cache for server-side operations
const jobCache = new Map<string, AnalysisJob>();

// Initialize from localStorage if in browser
if (typeof window !== 'undefined') {
  try {
    const storedJobs = localStorage.getItem('analysisJobs');
    if (storedJobs) {
      const parsedJobs = JSON.parse(storedJobs);
      for (const job of parsedJobs) {
        jobCache.set(job.id, job);
      }
    }
  } catch (e) {
    console.error('Failed to load jobs from localStorage:', e);
  }
}

// Helper to save jobs to localStorage
const saveJobsToStorage = () => {
  if (typeof window !== 'undefined') {
    try {
      const jobs = Array.from(jobCache.values());
      localStorage.setItem('analysisJobs', JSON.stringify(jobs));
    } catch (e) {
      console.error('Failed to save jobs to localStorage:', e);
    }
  }
};

export const analysisStore = {
  // Create a new job
  createJob: (id: string): AnalysisJob => {
    const job: AnalysisJob = {
      id,
      status: 'pending',
      startTime: Date.now(),
    };
    
    // Store in memory cache
    jobCache.set(id, job);
    saveJobsToStorage();
    
    return job;
  },

  // Get a job by ID
  getJob: (id: string): AnalysisJob | undefined => {
    return jobCache.get(id);
  },

  // Update a job
  updateJob: (id: string, updates: Partial<AnalysisJob>): AnalysisJob | undefined => {
    const job = jobCache.get(id);
    if (!job) return undefined;

    const updatedJob = { ...job, ...updates };
    
    // Update in memory cache
    jobCache.set(id, updatedJob);
    saveJobsToStorage();
    
    return updatedJob;
  },

  // Clean up old jobs (older than 1 hour)
  cleanupOldJobs: (): void => {
    const oneHourAgo = Date.now() - 60 * 60 * 1000;
    for (const [id, job] of jobCache.entries()) {
      if (job.startTime < oneHourAgo) {
        jobCache.delete(id);
      }
    }
    saveJobsToStorage();
  }
};

// Clean up old jobs every hour
analysisStore.cleanupOldJobs = analysisStore.cleanupOldJobs.bind(analysisStore);
setInterval(analysisStore.cleanupOldJobs, 60 * 60 * 1000);
