import { NextResponse } from 'next/server';
import { analysisStore } from '@/utils/analysisStore';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    // Get the job ID from the query string
    const url = new URL(req.url);
    const jobId = url.searchParams.get('jobId');
    
    // Validate job ID
    if (!jobId) {
      return NextResponse.json(
        { error: 'Job ID is required' },
        { status: 400 }
      );
    }
    
    // Get the job from the store
    const job = analysisStore.getJob(jobId);
    
    // If job not found, return 404
    if (!job) {
      console.error(`Job ${jobId} not found`);
      return NextResponse.json(
        { 
          error: 'Job not found',
          jobId,
          message: 'The requested analysis job could not be found. It may have expired or been deleted.'
        },
        { status: 404 }
      );
    }
    
    // Return the job status and result if completed
    if (job.status === 'completed' && job.result) {
      return NextResponse.json({
        status: job.status,
        result: job.result,
        jobId: job.id,
        startTime: job.startTime,
        completionTime: Date.now()
      });
    }
    
    // Return the job status and error if failed
    if (job.status === 'failed') {
      return NextResponse.json({
        status: job.status,
        error: job.error || 'Unknown error',
        jobId: job.id,
        startTime: job.startTime,
        failureTime: Date.now()
      });
    }
    
    // Return the job status if pending or processing
    return NextResponse.json({
      status: job.status,
      jobId: job.id,
      startTime: job.startTime,
      currentTime: Date.now(),
      message: job.status === 'pending' ? 'Job is queued for processing' : 'Job is currently being processed'
    });
  } catch (error) {
    console.error('Error in analyze/status:', error);
    return NextResponse.json(
      { error: 'Failed to check job status' },
      { status: 500 }
    );
  }
}
