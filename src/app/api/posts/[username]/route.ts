import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

export const maxDuration = 60;
export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  { params }: { params: { username: string } }
) {
  try {
    const username = params.username;
    const postsPath = path.join(process.cwd(), "data", username, "posts.json");

    // Check if the file exists
    try {
      await fs.access(postsPath);
    } catch {
      return NextResponse.json(
        { error: "No posts found for this username" },
        { status: 404 }
      );
    }

    // Read and parse the posts file
    const postsData = await fs.readFile(postsPath, "utf-8");
    const posts = JSON.parse(postsData);

    return NextResponse.json({ posts });
  } catch (error) {
    console.error("Error reading posts:", error);
    return NextResponse.json(
      { error: "Failed to retrieve posts" },
      { status: 500 }
    );
  }
}
