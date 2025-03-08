import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { randomUUID } from 'crypto';
import { analysisStore } from '@/utils/analysisStore';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const maxDuration = 60;
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    // Create a unique job ID
    const jobId = randomUUID();
    
    // Create a new job in the store
    analysisStore.createJob(jobId);
    
    // Get the request body
    const { image, budget, gender, size, shoeSize } = await req.json();
    
    // Try to complete the analysis within the timeout
    const abortController = new AbortController();
    const timeoutId = setTimeout(() => abortController.abort(), 50000); // 50 seconds timeout
    
    try {
      // Update job status to processing
      analysisStore.updateJob(jobId, { status: 'processing' });
      
      // Try to complete the analysis synchronously
      const result = await analyzeStyle(image, { budget, gender, size, shoeSize }, abortController.signal);
      
      // Clear the timeout
      clearTimeout(timeoutId);
      
      // Update job with result
      analysisStore.updateJob(jobId, {
        status: 'completed',
        result
      });
      
      // Return the result immediately
      return NextResponse.json(result);
    } catch (error) {
      // Clear the timeout
      clearTimeout(timeoutId);
      
      // If the error is an abort error, it means we hit the timeout
      if (error instanceof DOMException && error.name === 'AbortError') {
        // Continue processing in the background
        processAnalysisInBackground(jobId, image, { budget, gender, size, shoeSize });
        
        // Return the job ID
        return NextResponse.json({ jobId });
      }
      
      // For other errors, update the job with the error
      analysisStore.updateJob(jobId, {
        status: 'failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      
      throw error;
    }
  } catch (error) {
    console.error('Error in analyze-async:', error);
    return NextResponse.json(
      { error: 'Failed to analyze style' },
      { status: 500 }
    );
  }
}

// Function to analyze style
async function analyzeStyle(
  image: string, 
  options: { budget: string; gender: string; size: string; shoeSize: string },
  signal?: AbortSignal
) {
  // Call the OpenAI API to analyze the style
  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    max_tokens: 1500,
    messages: [
      {
        role: "system",
        content: `You are a professional fashion stylist and personal shopper with expertise in analyzing fashion styles from images.
        
        Analyze the uploaded image and identify the dominant fashion style, aesthetic, and color palette. The image may be an Instagram grid, a single post, or any fashion-related image.
        
        Based on this analysis, recommend specific clothing items and accessories that match this style.
        
        The user's preferences are:
        - Budget: ${options.budget}
        - Gender: ${options.gender}
        - Size: ${options.size}
        - Shoe Size: ${options.shoeSize}
        
        Format your response as JSON with the following structure:
        {
          "style_analysis": {
            "dominant_style": "Description of the dominant style",
            "aesthetic": "Description of the aesthetic",
            "color_palette": ["#HEX1", "#HEX2", "#HEX3", "#HEX4"]
          },
          "general_style_tips": [
            "Tip 1 for styling this aesthetic",
            "Tip 2 for styling this aesthetic",
            "Tip 3 for styling this aesthetic"
          ],
          "recommendations": [
            {
              "type": "Style Name",
              "items": [
                {
                  "name": "Item Name",
                  "price": "$XX.XX",
                  "description": "Description",
                  "style_match": "Why it matches their style",
                  "links": {
                    "amazon": "https://www.amazon.com/s?k=Item+Name+Style+Name",
                    "asos": "https://www.asos.com/search/?q=Item+Name+Style+Name",
                    "nordstrom": "https://www.nordstrom.com/sr?keyword=Item+Name+Style+Name"
                  }
                }
              ]
            }
          ]
        }
        
        Include 2-3 different style types with 2-3 items each. For the links, create search URLs that will search for the item name on each platform.`
      },
      {
        role: "user",
        content: [
          {
            type: "image_url",
            image_url: {
              url: image
            }
          },
          {
            type: "text",
            text: "Analyze this image and recommend fashion items that match this style."
          }
        ]
      }
    ],
    response_format: { type: "json_object" },
    signal
  });

  // Parse the response
  const content = response.choices[0].message.content;
  if (!content) {
    throw new Error("No content in response");
  }

  return JSON.parse(content);
}

// This function runs in the background and doesn't block the response
async function processAnalysisInBackground(
  jobId: string, 
  image: string, 
  options: { budget: string; gender: string; size: string; shoeSize: string }
) {
  try {
    // Update job status to processing
    analysisStore.updateJob(jobId, { status: 'processing' });
    
    // Analyze the style
    const result = await analyzeStyle(image, options);
    
    // Update job with result
    analysisStore.updateJob(jobId, {
      status: 'completed',
      result
    });
  } catch (error) {
    console.error(`Error processing job ${jobId}:`, error);
    
    // Update job with error
    analysisStore.updateJob(jobId, {
      status: 'failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
