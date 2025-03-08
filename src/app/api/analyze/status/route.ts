import { NextResponse } from 'next/server';
import { analysisStore } from '@/utils/analysisStore';

export const maxDuration = 60;
export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    // Get the job ID from the URL
    const url = new URL(req.url);
    const jobId = url.searchParams.get('jobId');
    
    if (!jobId) {
      return NextResponse.json(
        { error: 'Job ID is required' },
        { status: 400 }
      );
    }
    
    // Get the job from the store
    const job = analysisStore.getJob(jobId);
    
    if (!job) {
      return NextResponse.json(
        { error: 'Job not found' },
        { status: 404 }
      );
    }
    
    // Return the job status and result if available
    return NextResponse.json({
      jobId: job.id,
      status: job.status,
      ...(job.result && { result: job.result }),
      ...(job.error && { error: job.error }),
    });
  } catch (error) {
    console.error('Error checking job status:', error);
    return NextResponse.json(
      { error: 'Failed to check job status' },
      { status: 500 }
    );
  }
}
