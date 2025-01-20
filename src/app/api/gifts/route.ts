import { NextResponse } from "next/server";
import { OpenAI } from "openai";
import sharp from "sharp";
import * as cheerio from "cheerio";
import fetch from "node-fetch";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const maxDuration = 30;

interface GiftRecommendation {
  name: string;
  description: string;
  price: number;
  match_reason: string;
  amazon_asin?: string;
}

async function compressImage(buffer: Buffer): Promise<string> {
  try {
    if (!buffer || buffer.length === 0) {
      console.error("[Image Compression] Empty buffer received");
      return "";
    }

    const compressedImageBuffer = await sharp(buffer)
      .resize(200, 200, {
        fit: "inside",
        withoutEnlargement: true,
      })
      .jpeg({
        quality: 40,
        progressive: true,
        optimizeScans: true,
        chromaSubsampling: "4:2:0",
      })
      .toBuffer();

    const base64 = compressedImageBuffer.toString("base64");
    const truncatedBase64 = base64.slice(0, 50000);

    return truncatedBase64;
  } catch (error) {
    console.error("[Image Compression] Error:", error);
    return "";
  }
}

async function analyzeImage(base64Image: string): Promise<string> {
  try {
    console.log("[Image Analysis] Starting image analysis...");

    const prompt = `Analyze this Instagram profile grid and describe what you observe:
1. What activities and hobbies are shown?
2. What locations or environments appear?
3. What lifestyle elements are visible?
4. What appears to be their main interests?
5. What themes or patterns do you notice?

Provide a detailed analysis that could help recommend personalized gifts.`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.5,
      max_tokens: 400,
    });

    const analysis = response.choices[0].message.content || "";
    console.log("[Image Analysis] Full analysis:", analysis);
    return analysis;
  } catch (error) {
    console.error("[Image Analysis] Error:", error);
    return "";
  }
}

async function generateGiftRecommendations(
  age: number,
  budget: number,
  profileAnalysis: string
): Promise<GiftRecommendation[]> {
  try {
    const prompt = `Based on this Instagram profile analysis:
${profileAnalysis}

Generate 3 UNIQUE and SPECIFIC gift recommendations for a ${age} year old with a budget of $${budget}. 
Each gift should be different and include a real Amazon ASIN (10-character product ID).
Avoid generic items like passes, gift cards, or common accessories.

Format as JSON array: [
  {
    "name": "Gift Name",
    "description": "Description",
    "price": number,
    "match_reason": "Reason",
    "amazon_asin": "B0123XXXXX"  // Include real Amazon ASIN
  }
].
Keep descriptions concise and avoid apostrophes.`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.9,
      max_tokens: 600,
      top_p: 0.95,
    });

    let recommendationsText =
      response.choices[0].message.content?.trim() || "[]";

    // Extract JSON if it's wrapped in other text
    const jsonMatch = recommendationsText.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      recommendationsText = jsonMatch[0];
    }

    // Clean up the JSON string
    recommendationsText = recommendationsText
      .replace(/[\u201C\u201D]/g, '"')
      .replace(/[\u2018\u2019]/g, "'")
      .replace(/'/g, "'")
      .replace(/\n/g, " ")
      .replace(/,\s*}/g, "}")
      .replace(/\s+/g, " ")
      .replace(/\s*:\s*/g, ":")
      .replace(/\s*,\s*/g, ",")
      .replace(/it['']s/gi, "it is")
      .replace(/['']s\s/g, "s ")
      .replace(/['']re\s/g, " are ")
      .replace(/['']t\s/g, "t ");

    const recommendations = JSON.parse(recommendationsText);

    // Wait for all promises to resolve
    const recommendationsWithLinks = await Promise.all(
      recommendations.map(async (rec: any) => {
        const amazonProduct = await getFirstAmazonResult(rec.name);

        return {
          name: amazonProduct?.name || rec.name || "Gift suggestion",
          description: amazonProduct?.description || rec.description || "",
          price:
            amazonProduct?.price ||
            parseFloat(String(rec.price || budget).replace(/[$,]/g, "")),
          match_reason: rec.match_reason || "",
          amazon_link:
            amazonProduct?.url ||
            `https://www.amazon.com/s?k=${encodeURIComponent(rec.name || "")}`,
        };
      })
    );

    return recommendationsWithLinks;
  } catch (error) {
    console.error("Error generating recommendations:", error);
    // Return fallback recommendations
    return [
      {
        name: "No recommendations available",
        description: "No personalized gift recommendations available.",
        price: budget,
        match_reason: "No profile analysis available.",
        amazon_link: `https://www.amazon.com/s?k=${encodeURIComponent("gift")}`,
      },
    ];
  }
}

interface AmazonProduct {
  url: string;
  name: string;
  price: number;
  description?: string;
}

async function getFirstAmazonResult(
  searchQuery: string
): Promise<AmazonProduct | null> {
  try {
    const searchUrl = `https://www.amazon.com/s?k=${encodeURIComponent(
      searchQuery
    )}`;
    const response = await fetch(searchUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
      },
    });

    const html = await response.text();
    const $ = cheerio.load(html);

    // Find first product
    const firstProduct = $('[data-component-type="s-search-result"]').first();
    if (!firstProduct.length) return null;

    // Get product URL
    const productUrl = firstProduct
      .find('a[href*="/dp/"]')
      .first()
      .attr("href");
    if (!productUrl) return null;

    // Get ASIN
    const asinMatch = productUrl.match(/\/dp\/([A-Z0-9]{10})/);
    if (!asinMatch) return null;

    // Get product details
    const name = firstProduct.find("h2 span").text().trim();
    const priceWhole = firstProduct
      .find(".a-price-whole")
      .first()
      .text()
      .trim();
    const priceFraction = firstProduct
      .find(".a-price-fraction")
      .first()
      .text()
      .trim();
    const description = firstProduct.find(".a-size-base").text().trim();

    const price = parseFloat(`${priceWhole}.${priceFraction}`) || 0;

    return {
      url: `https://www.amazon.com/dp/${asinMatch[1]}`,
      name,
      price,
      description,
    };
  } catch (error) {
    console.error("Error getting Amazon result:", error);
    return null;
  }
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const age = Number(formData.get("age"));
    const budget = Number(formData.get("budget"));
    const imageFile = formData.get("instagram-grid") as File | null;

    console.log("\n[API] Starting new request:", {
      age,
      budget,
      hasImage: !!imageFile,
    });

    if (!age || !budget) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    let profileAnalysis = "";
    if (imageFile) {
      console.log("\n[API] Processing Instagram profile image...");
      const bytes = await imageFile.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const base64Image = await compressImage(buffer);

      console.log("\n[API] Starting profile analysis...");
      profileAnalysis = await analyzeImage(base64Image);

      console.log("\n[API] Profile Analysis Results:");
      console.log("----------------------------------------");
      console.log(profileAnalysis);
      console.log("----------------------------------------");
    } else {
      console.log("\n[API] No profile image provided");
    }

    console.log("\n[API] Generating gift recommendations based on analysis...");
    const recommendations = await generateGiftRecommendations(
      age,
      budget,
      profileAnalysis || "No profile analysis available."
    );

    console.log("\n[API] Generated recommendations:", recommendations);
    return NextResponse.json({ recommendations });
  } catch (error) {
    console.error("[API] Error:", error);
    return NextResponse.json(
      { error: "Failed to get gift recommendations" },
      { status: 500 }
    );
  }
}
