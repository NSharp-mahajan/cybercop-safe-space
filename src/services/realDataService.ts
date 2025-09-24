import { ScamData } from './scamDataService';

// Environment configuration
const API_CONFIG = {
  // National Crime Records Bureau (NCRB) - India's official crime data
  NCRB_BASE_URL: import.meta.env.VITE_NCRB_API_URL || 'https://ncrb.gov.in/api',
  NCRB_API_KEY: import.meta.env.VITE_NCRB_API_KEY,
  
  // Data.gov.in - India's open data platform
  DATA_GOV_BASE_URL: import.meta.env.VITE_DATA_GOV_API_URL || 'https://api.data.gov.in',
  DATA_GOV_API_KEY: import.meta.env.VITE_DATA_GOV_API_KEY,
  
  // Reserve Bank of India (RBI) - Financial fraud data
  RBI_BASE_URL: import.meta.env.VITE_RBI_API_URL || 'https://rbi.org.in/api',
  RBI_API_KEY: import.meta.env.VITE_RBI_API_KEY,
  
  // Cyber Crime Portal - cybercrime.gov.in
  CYBER_CRIME_BASE_URL: import.meta.env.VITE_CYBER_CRIME_API_URL || 'https://cybercrime.gov.in/api',
  CYBER_CRIME_API_KEY: import.meta.env.VITE_CYBER_CRIME_API_KEY,
  
  // News API for recent cyber crime news
  NEWS_API_BASE_URL: 'https://newsapi.org/v2',
  NEWS_API_KEY: import.meta.env.VITE_NEWS_API_KEY,
  
  // Alternative data sources
  FALLBACK_SOURCES: {
    // Public datasets and research institutions
    RESEARCH_API: import.meta.env.VITE_RESEARCH_API_URL,
    STATE_POLICE_APIS: import.meta.env.VITE_STATE_POLICE_APIS?.split(',') || []
  }
};

// Data source interfaces
interface NCRBResponse {
  data: {
    state: string;
    stateCode: string;
    cyberCrimes: {
      total: number;
      financial: number;
      identity: number;
      phishing: number;
      online: number;
      dataTheft: number;
      socialEngineering: number;
    };
    financialLoss: number;
    year: number;
    month: number;
  }[];
  lastUpdated: string;
  status: 'success' | 'error';
}

interface RBIFraudResponse {
  fraudData: {
    stateName: string;
    stateCode: string;
    bankingFraud: number;
    digitalPaymentFraud: number;
    totalLoss: number;
    quarter: string;
    year: number;
  }[];
  status: string;
}

interface NewsAPIResponse {
  status: string;
  totalResults: number;
  articles: {
    title: string;
    description: string;
    publishedAt: string;
    source: { name: string };
    content: string;
  }[];
}

// Cache interface
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiry: number;
}

class RealDataService {
  private cache = new Map<string, CacheEntry<any>>();
  private readonly CACHE_DURATION = 30 * 60 * 1000; // 30 minutes

  // Generic cache methods
  private setCacheEntry<T>(key: string, data: T, customDuration?: number): void {
    const expiry = Date.now() + (customDuration || this.CACHE_DURATION);
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      expiry
    });
  }

  private getCacheEntry<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;
    
    if (Date.now() > entry.expiry) {
      this.cache.delete(key);
      return null;
    }
    
    return entry.data;
  }

  // HTTP request utility with error handling
  private async makeRequest<T>(
    url: string, 
    options: RequestInit = {},
    timeout = 10000
  ): Promise<T> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        }
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }

  // NCRB Data Service
  async fetchNCRBData(): Promise<NCRBResponse | null> {
    const cacheKey = 'ncrb_data';
    const cached = this.getCacheEntry<NCRBResponse>(cacheKey);
    if (cached) return cached;

    try {
      // Note: This is a placeholder URL - actual NCRB API would need to be implemented
      const url = `${API_CONFIG.NCRB_BASE_URL}/cyber-crime/state-wise`;
      const headers: Record<string, string> = {};
      
      if (API_CONFIG.NCRB_API_KEY) {
        headers['Authorization'] = `Bearer ${API_CONFIG.NCRB_API_KEY}`;
      }

      const data = await this.makeRequest<NCRBResponse>(url, { headers });
      this.setCacheEntry(cacheKey, data);
      return data;
    } catch (error) {
      console.error('Failed to fetch NCRB data:', error);
      return null;
    }
  }

  // RBI Fraud Data Service
  async fetchRBIFraudData(): Promise<RBIFraudResponse | null> {
    const cacheKey = 'rbi_fraud_data';
    const cached = this.getCacheEntry<RBIFraudResponse>(cacheKey);
    if (cached) return cached;

    try {
      const url = `${API_CONFIG.RBI_BASE_URL}/fraud-statistics/state-wise`;
      const headers: Record<string, string> = {};
      
      if (API_CONFIG.RBI_API_KEY) {
        headers['X-API-Key'] = API_CONFIG.RBI_API_KEY;
      }

      const data = await this.makeRequest<RBIFraudResponse>(url, { headers });
      this.setCacheEntry(cacheKey, data);
      return data;
    } catch (error) {
      console.error('Failed to fetch RBI fraud data:', error);
      return null;
    }
  }

  // Data.gov.in Service
  async fetchDataGovCyberCrime(): Promise<any> {
    const cacheKey = 'datagov_cybercrime';
    const cached = this.getCacheEntry(cacheKey);
    if (cached) return cached;

    try {
      // Using actual data.gov.in API structure
      const url = `${API_CONFIG.DATA_GOV_BASE_URL}/resource/cybercrime-statistics`;
      const params = new URLSearchParams({
        'api-key': API_CONFIG.DATA_GOV_API_KEY || '',
        format: 'json',
        limit: '1000'
      });

      const data = await this.makeRequest(`${url}?${params}`);
      this.setCacheEntry(cacheKey, data);
      return data;
    } catch (error) {
      console.error('Failed to fetch Data.gov.in data:', error);
      return null;
    }
  }

  // News API for recent cyber crime trends
  async fetchCyberCrimeNews(): Promise<NewsAPIResponse | null> {
    const cacheKey = 'cybercrime_news';
    const cached = this.getCacheEntry<NewsAPIResponse>(cacheKey);
    if (cached) return cached;

    try {
      if (!API_CONFIG.NEWS_API_KEY) {
        console.warn('News API key not configured');
        return null;
      }

      const url = `${API_CONFIG.NEWS_API_BASE_URL}/everything`;
      const params = new URLSearchParams({
        q: 'cyber crime India fraud scam',
        language: 'en',
        sortBy: 'publishedAt',
        pageSize: '50',
        apiKey: API_CONFIG.NEWS_API_KEY
      });

      const data = await this.makeRequest<NewsAPIResponse>(`${url}?${params}`);
      this.setCacheEntry(cacheKey, data, 60 * 60 * 1000); // Cache news for 1 hour
      return data;
    } catch (error) {
      console.error('Failed to fetch cyber crime news:', error);
      return null;
    }
  }

  // Aggregate all data sources
  async fetchAggregatedScamData(): Promise<ScamData[]> {
    try {
      // Fetch from multiple sources in parallel
      const [ncrbData, rbiData, dataGovData, newsData] = await Promise.allSettled([
        this.fetchNCRBData(),
        this.fetchRBIFraudData(),
        this.fetchDataGovCyberCrime(),
        this.fetchCyberCrimeNews()
      ]);

      // Transform and merge data from different sources
      const transformedData = this.transformAggregatedData({
        ncrb: ncrbData.status === 'fulfilled' ? ncrbData.value : null,
        rbi: rbiData.status === 'fulfilled' ? rbiData.value : null,
        dataGov: dataGovData.status === 'fulfilled' ? dataGovData.value : null,
        news: newsData.status === 'fulfilled' ? newsData.value : null,
      });

      return transformedData;
    } catch (error) {
      console.error('Failed to fetch aggregated scam data:', error);
      throw error;
    }
  }

  // Data transformation utility
  private transformAggregatedData(sources: {
    ncrb: NCRBResponse | null;
    rbi: RBIFraudResponse | null;
    dataGov: any;
    news: NewsAPIResponse | null;
  }): ScamData[] {
    // Start with Indian states template
    const stateTemplate = this.getIndianStatesTemplate();
    
    const transformedData: ScamData[] = stateTemplate.map(state => {
      // Find data for this state from different sources
      const ncrbStateData = sources.ncrb?.data.find(d => d.stateCode === state.stateCode);
      const rbiStateData = sources.rbi?.fraudData.find(d => d.stateCode === state.stateCode);
      
      // Calculate trend based on news mentions and data patterns
      const trend = this.calculateTrend(state.stateCode, sources.news);
      
      return {
        stateCode: state.stateCode,
        stateName: state.stateName,
        totalCases: ncrbStateData?.cyberCrimes.total || 0,
        financialFraud: (ncrbStateData?.cyberCrimes.financial || 0) + (rbiStateData?.bankingFraud || 0),
        onlineFraud: ncrbStateData?.cyberCrimes.online || 0,
        identityTheft: ncrbStateData?.cyberCrimes.identity || 0,
        phishing: ncrbStateData?.cyberCrimes.phishing || 0,
        dataTheft: ncrbStateData?.cyberCrimes.dataTheft || 0,
        socialEngineering: ncrbStateData?.cyberCrimes.socialEngineering || 0,
        totalLoss: (ncrbStateData?.financialLoss || 0) + (rbiStateData?.totalLoss || 0),
        populationRatio: this.calculatePopulationRatio(
          (ncrbStateData?.cyberCrimes.total || 0),
          state.population
        ),
        riskLevel: this.calculateRiskLevel(
          (ncrbStateData?.cyberCrimes.total || 0),
          state.population
        ),
        trendDirection: trend,
        lastUpdated: sources.ncrb?.lastUpdated || new Date().toISOString().split('T')[0]
      };
    });

    return transformedData.filter(data => data.totalCases > 0); // Only return states with data
  }

  // Helper methods
  private getIndianStatesTemplate() {
    return [
      { stateCode: 'MH', stateName: 'Maharashtra', population: 112374333 },
      { stateCode: 'DL', stateName: 'Delhi', population: 16787941 },
      { stateCode: 'KA', stateName: 'Karnataka', population: 61095297 },
      { stateCode: 'UP', stateName: 'Uttar Pradesh', population: 199812341 },
      { stateCode: 'TN', stateName: 'Tamil Nadu', population: 72147030 },
      { stateCode: 'GJ', stateName: 'Gujarat', population: 60439692 },
      { stateCode: 'RJ', stateName: 'Rajasthan', population: 68548437 },
      { stateCode: 'WB', stateName: 'West Bengal', population: 91276115 },
      { stateCode: 'TG', stateName: 'Telangana', population: 35003674 },
      { stateCode: 'AP', stateName: 'Andhra Pradesh', population: 49576777 },
      // Add more states as needed
    ];
  }

  private calculatePopulationRatio(cases: number, population: number): number {
    return parseFloat(((cases / population) * 100000).toFixed(1));
  }

  private calculateRiskLevel(cases: number, population: number): 'Low' | 'Medium' | 'High' | 'Critical' {
    const ratio = this.calculatePopulationRatio(cases, population);
    if (ratio > 40) return 'Critical';
    if (ratio > 20) return 'High';
    if (ratio > 10) return 'Medium';
    return 'Low';
  }

  private calculateTrend(stateCode: string, newsData: NewsAPIResponse | null): 'up' | 'down' | 'stable' {
    if (!newsData || !newsData.articles) return 'stable';
    
    // Simple trend analysis based on news mentions
    const recentMentions = newsData.articles.filter(article => {
      const publishedDate = new Date(article.publishedAt);
      const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      return publishedDate > oneWeekAgo;
    }).length;

    const totalMentions = newsData.articles.length;
    
    if (recentMentions > totalMentions * 0.3) return 'up';
    if (recentMentions < totalMentions * 0.1) return 'down';
    return 'stable';
  }

  // Health check for all APIs
  async checkAPIHealth(): Promise<Record<string, boolean>> {
    const healthChecks = {
      ncrb: false,
      rbi: false,
      dataGov: false,
      news: false,
    };

    try {
      // Test each API endpoint
      const promises = [
        this.testEndpoint(`${API_CONFIG.NCRB_BASE_URL}/health`).then(() => healthChecks.ncrb = true).catch(() => {}),
        this.testEndpoint(`${API_CONFIG.RBI_BASE_URL}/health`).then(() => healthChecks.rbi = true).catch(() => {}),
        this.testEndpoint(`${API_CONFIG.DATA_GOV_BASE_URL}/health`).then(() => healthChecks.dataGov = true).catch(() => {}),
        this.testEndpoint(`${API_CONFIG.NEWS_API_BASE_URL}/sources?apiKey=${API_CONFIG.NEWS_API_KEY}`).then(() => healthChecks.news = true).catch(() => {}),
      ];

      await Promise.allSettled(promises);
    } catch (error) {
      console.error('API health check failed:', error);
    }

    return healthChecks;
  }

  private async testEndpoint(url: string): Promise<void> {
    await this.makeRequest(url, {}, 5000);
  }

  // Clear cache method
  clearCache(): void {
    this.cache.clear();
  }

  // Get cache statistics
  getCacheStats(): { size: number; entries: string[] } {
    return {
      size: this.cache.size,
      entries: Array.from(this.cache.keys())
    };
  }
}

// Export singleton instance
export const realDataService = new RealDataService();

// Export types
export type { NCRBResponse, RBIFraudResponse, NewsAPIResponse };
