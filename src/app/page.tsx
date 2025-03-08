"use client";

import { useState, useEffect } from "react";
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

interface StyleAnalysis {
  dominant_style: string;
  aesthetic: string;
  color_palette: string[];
}

interface Recommendation {
  type: string;
  items: {
    name: string;
    description: string;
    style_match: string;
    price: string;
    links: {
      amazon: string;
      asos: string;
      nordstrom: string;
    };
  }[];
}

interface AnalysisResult {
  style_analysis: StyleAnalysis;
  general_style_tips: string[];
  recommendations: Recommendation[];
}

interface RecommendationItem {
  name: string;
  description: string;
  style_match: string;
  price: string;
  links: {
    amazon: string;
    asos: string;
    nordstrom: string;
  };
}

const RecommendationCard = ({ item }: { item: RecommendationItem }) => {
  // Function to ensure links are properly encoded
  const getEncodedLink = (link: string, itemName: string) => {
    // If the link already contains the item name, use it as is
    if (link.includes(itemName.replace(/ /g, '+'))) {
      return link;
    }
    
    // Otherwise, create a search link with the item name
    if (link.includes('amazon.com')) {
      return `https://www.amazon.com/s?k=${encodeURIComponent(itemName)}`;
    } else if (link.includes('asos.com')) {
      return `https://www.asos.com/search/?q=${encodeURIComponent(itemName)}`;
    } else if (link.includes('nordstrom.com')) {
      return `https://www.nordstrom.com/sr?keyword=${encodeURIComponent(itemName)}`;
    }
    
    // Default: return the original link
    return link;
  };

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-6 mb-6 border border-purple-100 hover:border-purple-200 transition-all">
      <div className="mb-4">
        <h3 className="text-xl font-semibold mb-2 text-gray-800">{item.name}</h3>
        <p className="text-gray-600 mb-3">{item.description}</p>
        <p className="text-purple-600 font-medium">{item.style_match}</p>
      </div>
      
      <p className="text-purple-600 font-semibold mb-4">${item.price}</p>

      <div className="flex flex-col gap-2">
        {item.links.amazon && (
          <a
            href={getEncodedLink(item.links.amazon, item.name)}
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
        {item.links.nordstrom && (
          <a
            href={getEncodedLink(item.links.nordstrom, item.name)}
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
        {item.links.asos && (
          <a
            href={getEncodedLink(item.links.asos, item.name)}
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
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [budget, setBudget] = useState<string>("budget");
  const [gender, setGender] = useState<string>("female");
  const [size, setSize] = useState<string>("m");
  const [shoeSize, setShoeSize] = useState<string>("us8");
  const [jobId, setJobId] = useState<string | null>(null);
  const [progress, setProgress] = useState<number>(0);

  // Get the base URL for API calls
  const getBaseUrl = () => {
    if (typeof window !== 'undefined') {
      return window.location.origin;
    }
    return '';
  };

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

  // Poll for job status
  useEffect(() => {
    let intervalId: NodeJS.Timeout;
    let failedAttempts = 0;
    const maxFailedAttempts = 5;
    
    if (jobId && isLoading) {
      intervalId = setInterval(async () => {
        try {
          const baseUrl = getBaseUrl();
          const response = await fetch(`${baseUrl}/api/analyze/status?jobId=${jobId}`);
          
          if (!response.ok) {
            failedAttempts++;
            console.error(`Failed to check job status: ${response.status} ${response.statusText}`);
            
            if (failedAttempts >= maxFailedAttempts) {
              clearInterval(intervalId);
              setIsLoading(false);
              setError("Failed to check job status after multiple attempts. Please try again.");
            }
            return;
          }
          
          // Reset failed attempts counter on successful response
          failedAttempts = 0;
          
          const data = await response.json();
          
          if (data.status === 'completed' && data.result) {
            setAnalysisResult(data.result);
            setIsLoading(false);
            setJobId(null);
            setProgress(100);
          } else if (data.status === 'failed') {
            setIsLoading(false);
            setError(data.error || "Analysis failed");
            setJobId(null);
          } else if (data.status === 'processing') {
            // Update progress - simulate progress from 10% to 90% during processing
            const newProgress = Math.min(90, progress + 5);
            setProgress(newProgress);
          }
        } catch (error) {
          failedAttempts++;
          console.error("Error checking job status:", error);
          
          if (failedAttempts >= maxFailedAttempts) {
            clearInterval(intervalId);
            setIsLoading(false);
            setError("Failed to check job status. Please try again.");
          }
        }
      }, 2000);
    }
    
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [jobId, isLoading, progress]);

  const analyzeStyle = async () => {
    if (!previewUrl) {
      setError("Please upload an Instagram grid screenshot first");
      return;
    }

    setIsLoading(true);
    setError(null);
    setProgress(0);

    try {
      // Start the analysis job
      const baseUrl = getBaseUrl();
      const response = await fetch(`${baseUrl}/api/analyze/start`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          image: previewUrl,
          budget,
          gender,
          size,
          shoeSize,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to start analysis");
      }

      const data = await response.json();
      setJobId(data.jobId);
      setProgress(5); // Initial progress
    } catch (err) {
      setError("Failed to start analysis. Please try again.");
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
          <h2 className="text-3xl font-semibold mb-12">Explore Style Categories</h2>
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
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
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
                      sizes="(max-width: 768px) 100vw, 50vw"
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

                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">Gender</label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="non-binary">Non-Binary</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">Clothing Size</label>
                  <select
                    value={size}
                    onChange={(e) => setSize(e.target.value)}
                    className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                  >
                    <option value="xxs">XXS</option>
                    <option value="xs">XS</option>
                    <option value="s">S</option>
                    <option value="m">M</option>
                    <option value="l">L</option>
                    <option value="xl">XL</option>
                    <option value="xxl">XXL</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">Shoe Size (US/EU)</label>
                  <select
                    value={shoeSize}
                    onChange={(e) => setShoeSize(e.target.value)}
                    className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                  >
                    <option value="us5">US 5 / EU 35</option>
                    <option value="us6">US 6 / EU 36</option>
                    <option value="us7">US 7 / EU 37</option>
                    <option value="us8">US 8 / EU 38</option>
                    <option value="us9">US 9 / EU 39</option>
                    <option value="us10">US 10 / EU 40</option>
                    <option value="us11">US 11 / EU 41</option>
                    <option value="us12">US 12 / EU 42</option>
                    <option value="us13">US 13 / EU 43</option>
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
      {analysisResult && (
        <div className="w-full bg-white py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <section className="bg-white rounded-2xl shadow-lg p-8">
              <h2 className="text-3xl font-semibold mb-8 flex items-center gap-3 text-gray-800">
                <Sparkles className="w-8 h-8 text-purple-600" />
                Your Style Analysis
              </h2>
              
              {/* Style Analysis */}
              <div className="mb-12 p-6 bg-purple-50 rounded-xl border border-purple-100">
                <h3 className="text-xl font-semibold mb-4 text-gray-800">Style Profile</h3>
                <p className="text-gray-700 mb-4 text-lg">
                  <span className="font-medium">Dominant Style:</span> {analysisResult.style_analysis.dominant_style}
                </p>
                <p className="text-gray-700 mb-6">
                  <span className="font-medium">Aesthetic:</span> {analysisResult.style_analysis.aesthetic}
                </p>
                
                <div className="mb-6">
                  <h4 className="text-md font-medium mb-3 text-gray-700 flex items-center gap-2">
                    <Palette className="w-5 h-5 text-purple-600" />
                    Color Palette
                  </h4>
                  <div className="flex flex-wrap gap-3">
                    {analysisResult.style_analysis.color_palette.map((color, i) => (
                      <div
                        key={i}
                        className="w-10 h-10 rounded-full shadow-sm flex items-center justify-center"
                        style={{ backgroundColor: color }}
                      >
                        <span className="sr-only">{color}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              {/* Style Tips */}
              <div className="mb-12">
                <h3 className="text-xl font-semibold mb-4 text-gray-800 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-purple-600" />
                  Style Tips
                </h3>
                <ul className="space-y-3">
                  {analysisResult.general_style_tips.map((tip, i) => (
                    <li key={i} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className="bg-purple-100 text-purple-700 rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 mt-0.5">
                        {i + 1}
                      </div>
                      <p className="text-gray-700">{tip}</p>
                    </li>
                  ))}
                </ul>
              </div>
              
              {/* Recommendations */}
              <h3 className="text-xl font-semibold mb-6 text-gray-800 flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-purple-600" />
                Recommended Items
              </h3>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {analysisResult.recommendations.map((rec, index) => (
                  <div key={index} className="border border-gray-100 rounded-xl p-6 bg-gray-50">
                    <h3 className="text-xl font-semibold mb-4 text-gray-800">{rec.type}</h3>
                    
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
      
      {/* Progress bar for async processing */}
      {isLoading && jobId && (
        <div className="fixed bottom-0 left-0 right-0 bg-white shadow-lg p-4">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center">
              <div className="w-full bg-gray-200 rounded-full h-2.5 mr-4">
                <div 
                  className="bg-purple-600 h-2.5 rounded-full transition-all duration-500" 
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              <span className="text-sm text-gray-700">{progress}%</span>
            </div>
            <p className="text-sm text-gray-600 mt-2">
              Analyzing your style preferences... This may take a minute.
            </p>
          </div>
        </div>
      )}
    </main>
  );
}
