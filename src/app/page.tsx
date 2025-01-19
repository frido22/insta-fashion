"use client";

import { useState } from "react";
import Image from "next/image";
import {
  Instagram,
  Palette,
  Sparkles,
  ShoppingBag,
  AlertCircle,
  Camera,
  Wand2,
  Shirt,
  TrendingUp,
  Upload,
  Tag,
  Search,
  Grid,
} from "lucide-react";

interface Recommendation {
  type: string;
  items: {
    name: string;
    description: string;
    style_match: string;
    image_url?: string;
    shop_links?: {
      amazon: string;
      nordstrom: string;
      asos: string;
    };
    price?: number;
  }[];
  aesthetic: string;
  color_palette: string[];
  stores?: string[];
}

interface RecommendationItem {
  name: string;
  description: string;
  style_match: string;
  shop_links?: {
    amazon: string;
    nordstrom: string;
    asos: string;
  };
  price?: number;
}

const RecommendationCard = ({ item }: { item: RecommendationItem }) => {
  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-6 mb-6 border border-purple-100 hover:border-purple-200 transition-all">
      <div className="mb-4">
        <h3 className="text-xl font-semibold mb-2 text-gray-800">{item.name}</h3>
        <p className="text-gray-600 mb-3">{item.description}</p>
        <p className="text-purple-600 font-medium">{item.style_match}</p>
      </div>
      
      {item.price && (
        <p className="text-purple-600 font-semibold mb-4">${item.price}</p>
      )}

      {item.shop_links && (
        <div className="flex flex-col gap-2">
          {item.shop_links.amazon && (
            <a
              href={item.shop_links.amazon}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center px-4 py-2.5 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg hover:from-purple-600 hover:to-purple-700 transition-all shadow-sm hover:shadow group"
            >
              <span className="font-medium">Shop on Amazon</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2 group-hover:translate-x-0.5 transition-transform" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </a>
          )}
          {item.shop_links.nordstrom && (
            <a
              href={item.shop_links.nordstrom}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center px-4 py-2.5 bg-white text-purple-600 border-2 border-purple-200 rounded-lg hover:bg-purple-50 hover:border-purple-300 transition-all shadow-sm hover:shadow group"
            >
              <span className="font-medium">Shop on Nordstrom</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2 group-hover:translate-x-0.5 transition-transform" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </a>
          )}
          {item.shop_links.asos && (
            <a
              href={item.shop_links.asos}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center px-4 py-2.5 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-all shadow-sm hover:shadow group"
            >
              <span className="font-medium">Shop on ASOS</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2 group-hover:translate-x-0.5 transition-transform" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </a>
          )}
        </div>
      )}
    </div>
  );
};

const sampleStyles = [
  {
    name: "Minimalist Chic",
    description: "Clean lines, neutral colors, and timeless pieces",
    image: "/sample_images/IMG_4053.jpg",
  },
  {
    name: "Modest Fashion",
    description: "Elegant modest wear with creative layering, contemporary style, and sophisticated details",
    image: "/sample_images/IMG_4054.jpg",
  },
  {
    name: "Modern Elegance",
    description: "Sophisticated, polished, and contemporary fashion",
    image: "/sample_images/IMG_5155.png",
  }
];

const features = [
  {
    icon: Camera,
    title: "Upload Instagram Grid",
    description: "Share screenshots from your favorite fashion influencers",
  },
  {
    icon: Wand2,
    title: "AI Analysis",
    description: "Our AI breaks down the style elements that inspire you",
  },
  {
    icon: Shirt,
    title: "Style Profile",
    description: "Get a detailed breakdown of your fashion preferences",
  },
  {
    icon: TrendingUp,
    title: "Style Evolution",
    description: "Track how your style evolves over time",
  },
];

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [budget, setBudget] = useState<string>("medium");

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement> | string) => {
    let imageUrl: string;
    
    if (typeof e === 'string') {
      imageUrl = e;
      setPreviewUrl(imageUrl);
      
      try {
        const response = await fetch(imageUrl);
        const blob = await response.blob();
        const base64 = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(blob);
        });
        setPreviewUrl(base64);
      } catch (error) {
        console.error('Error loading example image:', error);
        setError('Failed to load example image');
      }
    } else {
      const file = e.target.files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          setPreviewUrl(e.target?.result as string);
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const analyzeStyle = async () => {
    if (!previewUrl) {
      setError("Please upload an Instagram grid screenshot first");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/analyze-style", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          image: previewUrl,
          budget,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to analyze style");
      }

      const data = await response.json();
      setRecommendations(data.recommendations);
    } catch (err) {
      setError("Failed to analyze style. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="w-full bg-gradient-to-br from-purple-700 via-purple-800 to-pink-800 py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-7xl font-bold mb-6 text-white">
              Define Your Style
            </h1>
            <p className="text-xl text-white/90 max-w-2xl mx-auto leading-relaxed">
              Upload your favorite fashion influencer's Instagram grid and
              let AI decode your unique style preferences
            </p>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="w-full bg-gray-50 py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-4 mx-auto">
                  <feature.icon className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600 text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Sample Styles Section */}
      <div className="w-full bg-white py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-semibold text-center mb-12">Explore Style Categories</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {sampleStyles.map((style, index) => (
              <div 
                key={index}
                className="group relative aspect-[4/5] rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <Image
                  src={style.image}
                  alt={style.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex flex-col justify-end p-6">
                  <h3 className="text-white font-semibold text-xl mb-2">{style.name}</h3>
                  <p className="text-white/90 text-sm">{style.description}</p>
                  <button 
                    onClick={() => handleImageUpload(style.image)}
                    className="mt-4 bg-white/90 hover:bg-white text-gray-900 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                  >
                    Try this style
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Upload Section */}
      <div id="upload-section" className="w-full bg-gray-50 py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white p-8 rounded-2xl shadow-lg">
              <h2 className="text-2xl font-semibold mb-6 flex items-center gap-3 text-gray-800">
                <Upload className="w-6 h-6 text-purple-600" />
                Upload Instagram Grid
              </h2>
              
              <div className="space-y-6">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  id="imageUpload"
                />
                <label
                  htmlFor="imageUpload"
                  className="block w-full cursor-pointer bg-purple-50/30 hover:bg-purple-100/30 text-purple-500 py-4 px-6 rounded-[24px] text-center transition-colors border border-dashed border-purple-300 hover:border-purple-400 shadow-sm"
                >
                  Choose Screenshot
                </label>

                {!previewUrl && (
                  <div className="mt-4 relative w-full">
                    <div className="bg-white rounded-[32px] shadow-[0_2px_8px_rgba(0,0,0,0.05)] overflow-hidden">
                      <div className="p-6">
                        <div className="text-gray-400/80 text-base mb-6 text-center">Instagram Grid Format</div>
                        <div className="grid grid-cols-3 gap-3">
                          {[...Array(9)].map((_, i) => (
                            <div 
                              key={i} 
                              className="aspect-square bg-gray-50 rounded-xl flex items-center justify-center"
                            >
                              <div className="w-10 h-10 rounded-lg bg-gray-100 animate-pulse" />
                            </div>
                          ))}
                        </div>
                        <div className="text-gray-400/60 text-sm mt-6 text-center">
                          Take a screenshot of a fashion influencer's grid (3x3)
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                {previewUrl && (
                  <div className="relative aspect-square rounded-xl overflow-hidden shadow-md">
                    <Image
                      src={previewUrl}
                      alt="Preview"
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-lg">
              <h2 className="text-2xl font-semibold mb-6 flex items-center gap-3 text-gray-800">
                <Tag className="w-6 h-6 text-purple-600" />
                Your Preferences
              </h2>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">Budget Range</label>
                  <select
                    value={budget}
                    onChange={(e) => setBudget(e.target.value)}
                    className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                  >
                    <option value="budget">Budget-Friendly</option>
                    <option value="medium">Mid-Range</option>
                    <option value="luxury">Luxury</option>
                  </select>
                </div>

                <button
                  onClick={analyzeStyle}
                  disabled={isLoading || !previewUrl}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-4 px-6 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-md hover:shadow-lg transform hover:translate-y-[-2px] active:translate-y-0 duration-200"
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Analyzing Style...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center">
                      <Sparkles className="w-5 h-5 mr-2" />
                      Get Style Recommendations
                    </span>
                  )}
                </button>

                {error && (
                  <div className="text-red-500 text-sm bg-red-50 p-4 rounded-lg">
                    {error}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recommendations Section */}
      {recommendations.length > 0 && (
        <div className="w-full bg-white py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <section className="bg-white rounded-2xl shadow-lg p-8">
              <h2 className="text-3xl font-semibold mb-8 flex items-center gap-3 text-gray-800">
                <Sparkles className="w-8 h-8 text-purple-600" />
                Your Style Recommendations
              </h2>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {recommendations.map((rec, index) => (
                  <div key={index} className="border border-gray-100 rounded-xl p-6 bg-gray-50">
                    <h3 className="text-xl font-semibold mb-4 text-gray-800">{rec.type}</h3>
                    <p className="text-gray-600 mb-4">
                      {rec.aesthetic}
                    </p>
                    
                    <div className="flex flex-wrap gap-2 mb-6">
                      {rec.color_palette.map((color, i) => (
                        <div
                          key={i}
                          className="w-8 h-8 rounded-full shadow-sm"
                          style={{ backgroundColor: color }}
                          title={color}
                        />
                      ))}
                    </div>
                    
                    <div className="space-y-6">
                      {rec.items.map((item, i) => (
                        <RecommendationCard key={i} item={item} />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>
      )}
    </main>
  );
}
