import { NextResponse } from 'next/server';
import OpenAI from 'openai';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

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
      model: "gpt-4-turbo",
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
    const stylePrompt = `Analyze this Instagram fashion image in detail and provide a structured analysis in the following JSON format:
{
  "overall_aesthetic": "Brief description of the overall style aesthetic",
  "key_pieces": [
    {
      "item": "Specific item name",
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

Focus on identifying specific, searchable items and their unique characteristics, including quality indicators. Consider the budget level: ${budget}`;

    // Analyze the image using GPT-4 Turbo
    const response = await openai.chat.completions.create({
      model: "gpt-4-turbo",
      messages: [
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
      max_tokens: 1000,
    });

    // Clean up the response content by removing markdown code blocks
    let analysisText = response.choices[0].message.content || "{}";
    analysisText = analysisText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    
    try {
      const analysis = JSON.parse(analysisText);

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
