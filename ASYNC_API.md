# Asynchronous API Pattern for Vercel Functions

This project implements an asynchronous API pattern to handle long-running tasks that would otherwise exceed Vercel's function timeout limit (60 seconds).

## Problem

Vercel serverless functions have a maximum execution time of 60 seconds. Our image analysis using OpenAI's GPT-4 Vision model can sometimes take longer than this limit, resulting in timeout errors.

## Solution

We've implemented an asynchronous processing pattern with the following components:

1. **In-Memory Job Store**: `src/utils/analysisStore.ts` provides a simple job storage mechanism
2. **Start Endpoint**: `/api/analyze/start` initiates a job and returns a job ID immediately
3. **Status Endpoint**: `/api/analyze/status` allows polling for job status and results
4. **Frontend Polling**: The UI polls the status endpoint and shows a progress bar

## How It Works

1. When a user submits an image for analysis, the frontend calls the `/api/analyze/start` endpoint
2. The start endpoint:
   - Creates a unique job ID
   - Stores the job in the in-memory store with status "pending"
   - Starts processing in the background without awaiting completion
   - Returns the job ID immediately to the client
3. The frontend begins polling the `/api/analyze/status` endpoint with the job ID
4. The background process:
   - Updates the job status to "processing"
   - Calls the OpenAI API to analyze the image
   - Updates the job with the result and status "completed" (or "failed" if there's an error)
5. When the frontend receives a "completed" status, it displays the results

## Implementation Details

### Analysis Store (`src/utils/analysisStore.ts`)

A simple in-memory store for jobs. In a production environment, this would be replaced with a database like MongoDB, PostgreSQL, or a serverless database.

### Start Endpoint (`src/app/api/analyze/start/route.ts`)

Initiates the analysis process and returns a job ID immediately.

### Status Endpoint (`src/app/api/analyze/status/route.ts`)

Returns the current status of a job, including results if the job is completed.

### Frontend Implementation

The frontend uses React's `useEffect` to implement polling and displays a progress bar to indicate the status of the analysis.

## Production Considerations

1. **Replace In-Memory Store**: The current implementation uses an in-memory store which will be reset when the server restarts. In production, use a database.
2. **Error Handling**: Implement more robust error handling and retries for failed jobs.
3. **Job Cleanup**: Implement a more sophisticated job cleanup strategy.
4. **Rate Limiting**: Add rate limiting to prevent abuse.

## Usage

```typescript
// Frontend example
const analyzeStyle = async () => {
  // Start the job
  const startResponse = await fetch("/api/analyze/start", {
    method: "POST",
    body: JSON.stringify({ image: imageData }),
  });
  const { jobId } = await startResponse.json();
  
  // Poll for results
  const intervalId = setInterval(async () => {
    const statusResponse = await fetch(`/api/analyze/status?jobId=${jobId}`);
    const statusData = await statusResponse.json();
    
    if (statusData.status === "completed") {
      // Handle completed job
      setResults(statusData.result);
      clearInterval(intervalId);
    } else if (statusData.status === "failed") {
      // Handle failed job
      setError(statusData.error);
      clearInterval(intervalId);
    }
  }, 2000);
};
```
