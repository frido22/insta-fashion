import { NextResponse } from 'next/server';
import OpenAI from 'openai';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const maxDuration = 60;
export const dynamic = 'force-dynamic';

// Function to estimate price using GPT-4
async function estimatePriceRange(item: string, style: string, budget: string) {
  const pricePrompt = `As a fashion expert, estimate a realistic price range for:
Item: ${item}
Style: ${style}
Budget Level: ${budget} (budget=affordable, medium=moderate, luxury=high-end)

Consider:
- Current market prices
- Quality level expected
- Brand tier for this style
- Seasonal factors

Respond with JSON only:
{
  "estimated_price": number (realistic average price),
  "price_range": {"min": number, "max": number},
  "reasoning": "Brief note about quality/value"
}`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: pricePrompt }],
      temperature: 0.7,
    });

    let analysisText = response.choices[0].message.content || "{}";
    analysisText = analysisText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    return JSON.parse(analysisText);
  } catch (error) {
    console.error('Error estimating price:', error);
    // Only use fallback if GPT fails completely
    const basePrice = budget === 'luxury' ? 300 : budget === 'budget' ? 50 : 150;
    return {
      estimated_price: basePrice,
      price_range: { 
        min: Math.floor(basePrice * 0.8), 
        max: Math.ceil(basePrice * 1.2) 
      },
      reasoning: "Estimated based on budget level"
    };
  }
}

// Function to search products across multiple stores
async function searchMultipleStores(item: string, style: string, budget: string) {
  try {
    const priceEstimate = await estimatePriceRange(item, style, budget);
    const searchQuery = encodeURIComponent(item);
    
    // Generate store-specific URLs with price ranges
    const amazonUrl = `https://www.amazon.com/s?k=${searchQuery}&rh=p_36%3A${priceEstimate.price_range.min}00-${priceEstimate.price_range.max}00`;
    const nordstromUrl = `https://www.nordstrom.com/sr?keyword=${searchQuery}&price=${priceEstimate.price_range.min}-${priceEstimate.price_range.max}`;
    const asosUrl = `https://www.asos.com/us/search/?q=${searchQuery}&price=${priceEstimate.price_range.min}-${priceEstimate.price_range.max}`;

    return {
      name: item,
      price: priceEstimate.estimated_price,
      description: `Perfect match for your style. ${priceEstimate.reasoning}`,
      style_match: style,
      shop_links: {
        amazon: amazonUrl,
        nordstrom: nordstromUrl,
        asos: asosUrl
      }
    };
  } catch (error) {
    console.error('Error searching products:', error);
    return null;
  }
}

export async function POST(req: Request) {
  try {
    const { image, budget } = await req.json();

    if (!image) {
      return NextResponse.json(
        { error: 'No image provided' },
        { status: 400 }
      );
    }

    const base64Image = image.split(',')[1];

    // Enhanced prompt for style analysis with quality assessment
    const stylePrompt = `You MUST respond with ONLY a valid JSON object, no additional text or markdown formatting.
The response MUST follow this EXACT structure:
{
  "overall_aesthetic": "Brief description of the overall style aesthetic",
  "key_pieces": [
    {
      "item": "Specific item name (e.g., 'Black Leather Jacket', 'White Cotton T-shirt')",
      "description": "Detailed description including cut, material, fit",
      "style_elements": "Key style elements that make it stand out",
      "quality_assessment": "Assessment of apparent quality, materials, and craftsmanship"
    }
  ],
  "color_palette": {
    "primary": ["color1", "color2"],
    "accent": ["color3", "color4"]
  },
  "styling_patterns": [
    "Pattern 1: e.g., layering technique",
    "Pattern 2: e.g., color combination principle"
  ],
  "recommended_searches": [
    "Specific search term for similar items"
  ]
}

Analyze this Instagram fashion image and provide the analysis following the EXACT format above.
Important:
1. DO NOT include any explanatory text outside the JSON
2. DO NOT use markdown code blocks
3. Ensure all JSON keys match exactly
4. The response must be a single valid JSON object
5. Consider the budget level: ${budget}`;

    // Analyze the image using GPT-4o
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a fashion analysis assistant. You MUST ONLY respond with a valid JSON object following the exact schema provided. Never include any text outside the JSON structure. Never use markdown code blocks or formatting."
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: stylePrompt
            },
            {
              type: "image_url",
              image_url: {
                url: `data:image/jpeg;base64,${base64Image}`
              }
            }
          ]
        }
      ],
      max_tokens: 700,
      temperature: 0.3, // Lower temperature for more consistent formatting
      response_format: { type: "json_object" } // Enforce JSON response format
    });

    // Clean up the response content and ensure valid JSON
    let analysisText = response.choices[0].message.content || "{}";
    
    try {
      // Validate JSON structure before parsing
      if (!analysisText.startsWith('{') || !analysisText.endsWith('}')) {
        console.error('Invalid JSON format received:', analysisText);
        throw new Error('Invalid JSON format in response');
      }
      
      const analysis = JSON.parse(analysisText);
      
      // Enhanced validation of required fields
      if (!analysis.overall_aesthetic || typeof analysis.overall_aesthetic !== 'string') {
        throw new Error('Missing or invalid overall_aesthetic field');
      }
      if (!Array.isArray(analysis.key_pieces) || analysis.key_pieces.length === 0) {
        throw new Error('Missing or invalid key_pieces array');
      }
      if (!analysis.color_palette || !Array.isArray(analysis.color_palette.primary)) {
        throw new Error('Missing or invalid color_palette structure');
      }
      
      // Generate recommendations with style tips
      const recommendations = [
        {
          type: "Core Style Elements",
          items: await Promise.all(
            analysis.key_pieces.map(async (piece: any) => 
              searchMultipleStores(
                piece.item,
                piece.style_elements,
                budget
              )
            )
          ),
          aesthetic: analysis.overall_aesthetic,
          color_palette: [...analysis.color_palette.primary, ...analysis.color_palette.accent],
          stores: ["Amazon", "Nordstrom", "ASOS"]
        },
        {
          type: "Styling Tips",
          items: analysis.styling_patterns.map((tip: string) => ({
            name: "Style Tip",
            description: tip,
            style_match: "Based on your Instagram inspiration"
          })),
          color_palette: analysis.color_palette.primary,
          aesthetic: "How to style your pieces"
        }
      ];

      return NextResponse.json({ recommendations });
    } catch (error) {
      console.error('Error parsing analysis:', error);
      return NextResponse.json(
        { error: 'Failed to parse analysis' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Failed to analyze style' },
      { status: 500 }
    );
  }
}
