import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const maxDuration = 60;
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const { imageUrl } = await request.json();

    if (!imageUrl) {
      return NextResponse.json(
        { error: "No image URL provided" },
        { status: 400 }
      );
    }

    // Extract base64 data from data URL
    const base64Data = imageUrl.split(",")[1];

    // Analyze the image using OpenAI's Vision API
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Analyze this Instagram grid screenshot and identify the following fashion preferences:\n1. Color palette\n2. Style categories (e.g., minimalist, bohemian, streetwear)\n3. Preferred clothing items\n4. Common patterns or textures\n5. Outfit combinations\n\nProvide the analysis in a structured JSON format.",
            },
            {
              type: "image",
              image_url: {
                url: `data:image/jpeg;base64,${base64Data}`,
              },
            },
          ],
        },
      ],
      max_tokens: 700,
    });

    const analysis = response.choices[0].message.content;
    return NextResponse.json({ analysis });
  } catch (error) {
    console.error("Error analyzing fashion preferences:", error);
    return NextResponse.json(
      { error: "Failed to analyze fashion preferences" },
      { status: 500 }
    );
  }
}
