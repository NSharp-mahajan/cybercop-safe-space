import { useState, useEffect, useCallback, useRef } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, ExternalLink, RefreshCw, Search, Calendar, Globe, ChevronLeft, ChevronRight, Play, Pause } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";

interface NewsArticle {
  title: string;
  description: string;
  url: string;
  urlToImage: string | null;
  publishedAt: string;
  source: {
    name: string;
  };
  content: string;
}

interface NewsAPIResponse {
  status: string;
  totalResults: number;
  articles: NewsArticle[];
}

const FraudNews = () => {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [featuredArticles, setFeaturedArticles] = useState<NewsArticle[]>([]);
  const [regularArticles, setRegularArticles] = useState<NewsArticle[]>([]);
  const [refreshCount, setRefreshCount] = useState(0);
  const autoPlayRef = useRef<NodeJS.Timeout | null>(null);

  // NewsAPI configuration
  const NEWS_API_KEY = "c53eba5535a743b28d1785642c0caac7"; // Replace with actual API key
  const BASE_URL = "https://newsapi.org/v2/everything";

  // Category mappings for enhanced filtering
  const categories = {
    all: "cybercrime OR fraud OR scam OR phishing OR hacking OR data breach OR identity theft",
    phishing: "phishing OR email fraud OR fake websites",
    banking: "banking fraud OR UPI fraud OR credit card fraud OR online banking scam",
    otp: "OTP fraud OR SMS scam OR two factor authentication fraud",
    hacking: "hacking OR cyber attack OR malware OR ransomware",
    global: "international cybercrime OR global fraud OR cross border scam"
  };

  const fetchNews = useCallback(async (query?: string, category?: string) => {
    setLoading(true);
    setError(null);
    
    try {
      // Build search query
      let searchKeywords = categories[category as keyof typeof categories] || categories.all;
      if (query && query.trim()) {
        searchKeywords = `(${searchKeywords}) AND ${query}`;
      }

      const url = new URL(BASE_URL);
      url.searchParams.append("q", searchKeywords);
      url.searchParams.append("language", "en");
      url.searchParams.append("sortBy", "publishedAt");
      url.searchParams.append("pageSize", "30");
      url.searchParams.append("apiKey", NEWS_API_KEY);

      const response = await fetch(url.toString());
      
      if (!response.ok) {
        throw new Error(`Failed to fetch news: ${response.statusText}`);
      }

      const data: NewsAPIResponse = await response.json();
      
      if (data.status === "error") {
        throw new Error("Failed to fetch news from API");
      }

      // Filter out articles without images and sanitize content
      const filteredArticles = data.articles
        .filter(article => 
          article.title && 
          article.description && 
          article.url &&
          article.title !== "[Removed]" &&
          article.description !== "[Removed]"
        )
        .slice(0, 24);

      // Separate featured articles (first 6) and regular articles
      const featured = filteredArticles.slice(0, 6);
      const regular = filteredArticles.slice(6, 24);

      setArticles(filteredArticles);
      setFeaturedArticles(featured);
      setRegularArticles(regular);
      setLastRefresh(new Date());
    } catch (err) {
      console.error("Error fetching news:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch news");
    } finally {
      setLoading(false);
    }
  }, []);

  // Auto-play carousel functionality
  useEffect(() => {
    if (isAutoPlaying && featuredArticles.length > 0) {
      autoPlayRef.current = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % Math.ceil(featuredArticles.length / 3));
      }, 5000); // Change slide every 5 seconds
    } else {
      if (autoPlayRef.current) {
        clearInterval(autoPlayRef.current);
      }
    }

    return () => {
      if (autoPlayRef.current) {
        clearInterval(autoPlayRef.current);
      }
    };
  }, [isAutoPlaying, featuredArticles.length]);

  // Initial load and auto-refresh setup
  useEffect(() => {
    fetchNews(searchQuery, selectedCategory);

    // Set up auto-refresh every 15 minutes
    const interval = setInterval(() => {
      fetchNews(searchQuery, selectedCategory);
    }, 15 * 60 * 1000);

    return () => clearInterval(interval);
  }, [fetchNews, searchQuery, selectedCategory]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchNews(searchQuery, selectedCategory);
  };

  const handleRefresh = () => {
    fetchNews(searchQuery, selectedCategory);
    setRefreshCount(prev => prev + 1);
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % Math.ceil(featuredArticles.length / 3));
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => 
      prev === 0 ? Math.ceil(featuredArticles.length / 3) - 1 : prev - 1
    );
  };

  const toggleAutoPlay = () => {
    setIsAutoPlaying(!isAutoPlaying);
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      return "Just now";
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays}d ago`;
    }
  };

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + "...";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950/20 to-purple-950/20 text-white relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.1),transparent_50%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[conic-gradient(from_0deg_at_50%_50%,transparent_0deg,rgba(139,92,246,0.05)_60deg,transparent_120deg)] pointer-events-none" />
      
      <div className="relative z-10">
        <div className="container mx-auto px-4 py-12 max-w-7xl">
          {/* Enhanced Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-3 bg-gradient-to-r from-blue-600/20 to-purple-600/20 backdrop-blur-sm border border-blue-500/30 rounded-full px-6 py-2 mb-6">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              <span className="text-sm font-medium text-blue-300">LIVE UPDATES</span>
            </div>
            
            <h1 className="text-6xl md:text-7xl font-black mb-4 bg-gradient-to-r from-white via-blue-200 to-purple-300 bg-clip-text text-transparent leading-tight">
              Fraud News
            </h1>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed">
              Real-time cybercrime intelligence and fraud alerts from trusted sources worldwide
            </p>
            
            {/* Stats Bar */}
            <div className="flex justify-center items-center gap-8 mt-8 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-1 h-1 bg-green-400 rounded-full" />
                <span className="text-gray-400">24/7 Monitoring</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-1 h-1 bg-blue-400 rounded-full" />
                <span className="text-gray-400">Global Sources</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-1 h-1 bg-purple-400 rounded-full" />
                <span className="text-gray-400">AI Filtered</span>
              </div>
            </div>
          </div>

          {/* Enhanced Controls */}
          <div className="mb-12">
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl">
              <div className="space-y-6 lg:space-y-0 lg:flex lg:items-center lg:gap-6">
                <form onSubmit={handleSearch} className="flex-1 flex gap-3">
                  <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <Input
                      type="text"
                      placeholder="Search cybercrime news... (e.g., 'UPI fraud', 'phishing attacks')"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-12 h-12 bg-white/10 border-white/20 text-white placeholder-gray-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 backdrop-blur-sm rounded-xl text-base"
                    />
                  </div>
                  <Button 
                    type="submit" 
                    className="h-12 px-8 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-blue-500/25 transition-all duration-300 rounded-xl font-semibold"
                  >
                    Search
                  </Button>
                </form>

                <div className="flex gap-3">
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger className="w-56 h-12 bg-white/10 border-white/20 text-white backdrop-blur-sm rounded-xl">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-900/95 border-gray-700 text-white backdrop-blur-xl">
                      <SelectItem value="all">🌐 All Categories</SelectItem>
                      <SelectItem value="phishing">🎣 Phishing</SelectItem>
                      <SelectItem value="banking">🏦 Banking Fraud</SelectItem>
                      <SelectItem value="otp">📱 OTP Scams</SelectItem>
                      <SelectItem value="hacking">⚡ Hacking</SelectItem>
                      <SelectItem value="global">🌍 Global Cybercrime</SelectItem>
                    </SelectContent>
                  </Select>

                  <Button 
                    onClick={handleRefresh} 
                    variant="outline"
                    className="h-12 px-4 border-white/20 text-white hover:bg-white/10 backdrop-blur-sm rounded-xl transition-all duration-300"
                    disabled={loading}
                  >
                    <RefreshCw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Error State */}
          {error && (
            <Alert className="mb-8 bg-gradient-to-r from-red-900/30 to-red-800/20 border border-red-500/30 backdrop-blur-sm rounded-xl">
              <AlertCircle className="h-5 w-5 text-red-400" />
              <AlertDescription className="text-red-200 text-base">
                {error}. 
                <Button 
                  variant="link" 
                  className="text-red-300 hover:text-red-200 underline p-0 ml-2 h-auto font-semibold"
                  onClick={handleRefresh}
                >
                  Try again →
                </Button>
              </AlertDescription>
            </Alert>
          )}

          {/* Enhanced Loading State */}
          {loading && (
            <div className="space-y-12">
              {/* Featured Loading */}
              <div className="relative">
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                  <div className="w-6 h-6 bg-blue-500/20 rounded animate-pulse" />
                  Featured Stories
                </h2>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {Array.from({ length: 3 }).map((_, index) => (
                    <div key={index} className="relative">
                      <Skeleton className="h-96 bg-white/10 rounded-2xl animate-pulse" />
                      <div className="absolute inset-0 bg-gradient-to-t from-white/10 to-transparent rounded-2xl" />
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Regular Loading */}
              <div>
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                  <div className="w-6 h-6 bg-purple-500/20 rounded animate-pulse" />
                  Latest Updates
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                  {Array.from({ length: 12 }).map((_, index) => (
                    <div key={index} className="relative">
                      <Skeleton className="h-48 bg-white/10 rounded-xl animate-pulse" />
                      <div className="absolute inset-0 bg-gradient-to-t from-white/5 to-transparent rounded-xl" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Main Content */}
          {!loading && articles.length > 0 && (
            <div className="space-y-8">
              {/* Enhanced Featured News Carousel */}
              {featuredArticles.length > 0 && (
                <div className="relative mb-16">
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                      <div className="w-1 h-8 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full" />
                      <h2 className="text-3xl font-bold text-white">Featured Stories</h2>
                      <Badge className="bg-red-600/90 text-white border-red-500 animate-pulse">
                        BREAKING
                      </Badge>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="bg-white/10 backdrop-blur-sm rounded-full p-1 border border-white/20">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={toggleAutoPlay}
                          className="text-gray-300 hover:text-white hover:bg-white/20 rounded-full h-8 w-8 p-0"
                        >
                          {isAutoPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                        </Button>
                      </div>
                      <div className="bg-white/10 backdrop-blur-sm rounded-full p-1 border border-white/20 flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={prevSlide}
                          className="text-gray-300 hover:text-white hover:bg-white/20 rounded-full h-8 w-8 p-0"
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={nextSlide}
                          className="text-gray-300 hover:text-white hover:bg-white/20 rounded-full h-8 w-8 p-0"
                        >
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-2">
                    <div 
                      className="flex transition-transform duration-700 ease-out"
                      style={{ transform: `translateX(-${currentSlide * 100}%)` }}
                    >
                      {Array.from({ length: Math.ceil(featuredArticles.length / 3) }).map((_, slideIndex) => (
                        <div key={slideIndex} className="w-full flex-shrink-0">
                          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {featuredArticles.slice(slideIndex * 3, (slideIndex + 1) * 3).map((article, index) => (
                              <Card 
                                key={`${slideIndex}-${index}`}
                                className="group bg-white/10 border-white/20 overflow-hidden backdrop-blur-md hover:bg-white/15 transition-all duration-700 hover:scale-110 hover:shadow-2xl hover:shadow-blue-500/30 hover:-translate-y-4 cursor-pointer relative"
                                onClick={() => window.open(article.url, '_blank')}
                              >
                                {/* Glow effect */}
                                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-blue-500/5 to-purple-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 rounded-2xl" />
                                
                                <CardHeader className="p-0">
                                  <div className="relative h-72 overflow-hidden rounded-t-2xl">
                                    {article.urlToImage ? (
                                      <img
                                        src={article.urlToImage}
                                        alt={article.title}
                                        className="w-full h-full object-cover group-hover:scale-125 transition-transform duration-1000"
                                        onError={(e) => {
                                          const target = e.target as HTMLImageElement;
                                          target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='288' viewBox='0 0 400 288'%3E%3Crect width='400' height='288' fill='%23374151'/%3E%3Ctext x='200' y='144' text-anchor='middle' dy='0.3em' fill='%236B7280' font-family='Arial, sans-serif' font-size='16'%3ENo Image Available%3C/text%3E%3C/svg%3E";
                                        }}
                                      />
                                    ) : (
                                      <div className="w-full h-full bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center">
                                        <Globe className="h-20 w-20 text-gray-500" />
                                      </div>
                                    )}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                                    
                                    {/* Category badge */}
                                    <div className="absolute top-4 left-4">
                                      <Badge className="bg-red-600/95 text-white border-0 shadow-lg backdrop-blur-sm animate-pulse">
                                        🚨 ALERT
                                      </Badge>
                                    </div>
                                    
                                    {/* Title overlay */}
                                    <div className="absolute bottom-6 left-6 right-6">
                                      <h3 className="font-bold text-xl text-white leading-tight line-clamp-3 drop-shadow-lg">
                                        {truncateText(article.title, 100)}
                                      </h3>
                                    </div>
                                  </div>
                                </CardHeader>
                                <CardContent className="p-6 space-y-4">
                                  <p className="text-gray-300 text-base leading-relaxed line-clamp-3">
                                    {truncateText(article.description || "", 160)}
                                  </p>
                                  
                                  <div className="flex items-center justify-between pt-2">
                                    <Badge variant="outline" className="border-blue-400 text-blue-300 bg-blue-500/10 backdrop-blur-sm">
                                      📰 {article.source.name}
                                    </Badge>
                                    <div className="flex items-center gap-2 text-sm text-gray-400">
                                      <Calendar className="h-3 w-3" />
                                      {formatTimeAgo(article.publishedAt)}
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Enhanced Carousel Indicators */}
                  <div className="flex justify-center mt-8 gap-3">
                    {Array.from({ length: Math.ceil(featuredArticles.length / 3) }).map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentSlide(index)}
                        className={`rounded-full transition-all duration-500 ${
                          index === currentSlide 
                            ? 'w-12 h-3 bg-gradient-to-r from-blue-500 to-purple-500 shadow-lg shadow-blue-500/30' 
                            : 'w-3 h-3 bg-white/30 hover:bg-white/50 hover:scale-110'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Enhanced Regular News Grid */}
              {regularArticles.length > 0 && (
                <div className="space-y-8">
                  <div className="flex items-center gap-4">
                    <div className="w-1 h-8 bg-gradient-to-b from-purple-500 to-pink-500 rounded-full" />
                    <h2 className="text-3xl font-bold text-white">Latest Updates</h2>
                    <Badge className="bg-blue-600/90 text-white border-blue-500">
                      {regularArticles.length} stories
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                    {regularArticles.map((article, index) => (
                      <Card 
                        key={index}
                        className="group bg-white/8 border-white/15 overflow-hidden backdrop-blur-md hover:bg-white/12 transition-all duration-500 hover:scale-110 hover:shadow-xl hover:shadow-purple-500/20 hover:-translate-y-2 cursor-pointer relative"
                        onClick={() => window.open(article.url, '_blank')}
                      >
                        {/* Shimmer effect */}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-1000 -skew-x-12 transform translate-x-[-100%] group-hover:translate-x-[200%]" />
                        
                        <CardHeader className="p-0">
                          <div className="relative h-32 overflow-hidden rounded-t-xl">
                            {article.urlToImage ? (
                              <img
                                src={article.urlToImage}
                                alt={article.title}
                                className="w-full h-full object-cover group-hover:scale-125 transition-transform duration-700"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='128' viewBox='0 0 200 128'%3E%3Crect width='200' height='128' fill='%23374151'/%3E%3Ctext x='100' y='64' text-anchor='middle' dy='0.3em' fill='%236B7280' font-family='Arial, sans-serif' font-size='10'%3ENo Image%3C/text%3E%3C/svg%3E";
                                }}
                              />
                            ) : (
                              <div className="w-full h-full bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center">
                                <Globe className="h-8 w-8 text-gray-500" />
                              </div>
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                            
                            {/* Quick read indicator */}
                            <div className="absolute top-2 right-2">
                              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="p-4 space-y-3">
                          <h3 className="font-semibold text-sm text-white leading-tight line-clamp-3 group-hover:text-blue-300 transition-colors duration-300">
                            {truncateText(article.title, 80)}
                          </h3>
                          
                          <div className="flex items-center justify-between text-xs">
                            <Badge variant="outline" className="border-purple-400/50 text-purple-300 bg-purple-500/10 text-[10px] px-2 py-0.5">
                              {article.source.name}
                            </Badge>
                            <div className="flex items-center gap-1 text-gray-500">
                              <div className="w-1 h-1 bg-gray-500 rounded-full" />
                              {formatTimeAgo(article.publishedAt)}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* Enhanced Stats */}
              <div className="mt-16 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-6 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                      <span className="text-gray-300">Showing <strong className="text-white">{articles.length}</strong> articles</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-400">Last updated: <strong className="text-white">{lastRefresh.toLocaleTimeString()}</strong></span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <Badge className="bg-green-600/20 text-green-300 border-green-500/30">
                      🔄 Auto-refresh: 15min
                    </Badge>
                    <Badge className="bg-blue-600/20 text-blue-300 border-blue-500/30">
                      🔴 Live
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Enhanced Empty State */}
          {!loading && articles.length === 0 && !error && (
            <div className="text-center py-24">
              <div className="relative mb-8">
                <div className="w-32 h-32 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full mx-auto flex items-center justify-center backdrop-blur-sm border border-white/10">
                  <Globe className="h-16 w-16 text-gray-400" />
                </div>
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-pink-500/5 rounded-full blur-xl" />
              </div>
              
              <h3 className="text-3xl font-bold text-white mb-4">No Articles Found</h3>
              <p className="text-gray-400 mb-8 max-w-md mx-auto text-lg leading-relaxed">
                Try adjusting your search terms or category filter to discover relevant cybercrime news and security updates
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  onClick={handleRefresh} 
                  className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-blue-500/25 transition-all duration-300 px-8 py-3"
                >
                  <RefreshCw className="h-5 w-5 mr-2" />
                  Refresh News
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => setSelectedCategory("all")}
                  className="border-white/20 text-white hover:bg-white/10 backdrop-blur-sm px-8 py-3"
                >
                  View All Categories
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FraudNews;