import { NextResponse } from "next/server";
import { ApifyClient } from "apify-client";
import { saveInstagramPost } from "@/utils/fileSystem";

// Initialize the ApifyClient with your API token
const client = new ApifyClient({
  token: process.env.APIFY_API_KEY,
});

async function scrapeInstagram(username: string, limit: number = 200) {
  try {
    // Prepare the Actor input
    const input = {
      directUrls: [`https://www.instagram.com/${username}/`],
      resultsType: "posts",
      resultsLimit: limit,
      searchType: "hashtag",
      searchLimit: 1,
      addParentData: false,
    };

    // Run the Actor and wait for it to finish
    const run = await client.actor("shu8hvrXbJbY3Eb9W").call(input);

    // Get the dataset items
    const { items } = await client.dataset(run.defaultDatasetId).listItems();
    console.log("Scraped items:", items);
    return items;
  } catch (error) {
    console.error("Error scraping Instagram:", error);
    throw error;
  }
}

export const maxDuration = 60;
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { username, limit } = body;

    if (!username) {
      return NextResponse.json(
        { error: "Username is required" },
        { status: 400 }
      );
    }

    const posts = await scrapeInstagram(username, limit);

    // Process and extract relevant information from posts
    const processedPosts = posts.map((post: any) => ({
      id: post.id || `${Date.now()}-${Math.random()}`,
      caption: post.caption || "",
      likesCount: post.likesCount || 0,
      images:
        post.type === "Sidecar"
          ? post.childPosts
              ?.filter((child: any) => child.type === "Image")
              .map((child: any) => child.displayUrl) || []
          : [post.displayUrl],
      timestamp: post.timestamp || new Date().toISOString(),
      ownerUsername: post.ownerUsername || username,
      // Add additional fields that might be useful for gift recommendations
      hashtags: post.hashtags || [],
      mentions: post.mentions || [],
      locationName: post.locationName || null,
    }));

    // Save posts to filesystem
    const { baseDir, imagesDir } = await saveInstagramPost(
      username,
      processedPosts
    );
    console.log(`Posts saved to ${baseDir}`);

    return NextResponse.json({
      posts: processedPosts,
      savedTo: {
        baseDir,
        imagesDir,
      },
    });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch Instagram data" },
      { status: 500 }
    );
  }
}
