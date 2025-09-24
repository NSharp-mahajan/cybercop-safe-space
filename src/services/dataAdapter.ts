import { ScamData } from './scamDataService';
import { realDataService } from './realDataService';
import { mockScamData, getAggregatedStats as getMockAggregatedStats, getTopStates as getMockTopStates } from './scamDataService';
import { dynamicDataService } from './dynamicDataService';

// Configuration
const isDemoMode = import.meta.env.VITE_DEMO_MODE === 'true';
const enableFallback = import.meta.env.VITE_ENABLE_FALLBACK !== 'false'; // Default to true

// Loading and error states
export interface DataState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  source: 'real' | 'mock' | 'cache';
  lastUpdated: Date | null;
}

export interface APIHealthStatus {
  ncrb: boolean;
  rbi: boolean;
  dataGov: boolean;
  news: boolean;
  overall: boolean;
}

class DataAdapter {
  private healthStatus: APIHealthStatus = {
    ncrb: false,
    rbi: false,
    dataGov: false,
    news: false,
    overall: false
  };

  private lastHealthCheck: Date | null = null;
  private readonly HEALTH_CHECK_INTERVAL = 5 * 60 * 1000; // 5 minutes

  // Main method to fetch scam data with fallback logic
  async fetchScamData(): Promise<DataState<ScamData[]>> {
    const startTime = Date.now();
    
    // If in demo mode, return dynamic data (real data with increments) immediately
    if (isDemoMode) {
      const dynamicData = dynamicDataService.getCurrentData();
      return {
        data: dynamicData,
        loading: false,
        error: null,
        source: 'mock', // Keep as 'mock' to indicate it's not live API data
        lastUpdated: new Date()
      };
    }

    try {
      // Check API health if needed
      await this.checkAPIHealthIfNeeded();

      // If no APIs are healthy and fallback is enabled, use dynamic data
      if (!this.healthStatus.overall && enableFallback) {
        console.warn('No APIs available, using fallback real data with increments');
        const dynamicData = dynamicDataService.getCurrentData();
        return {
          data: dynamicData,
          loading: false,
          error: 'APIs unavailable, showing real data with live increments',
          source: 'mock',
          lastUpdated: new Date()
        };
      }

      // Attempt to fetch real data
      const realData = await realDataService.fetchAggregatedScamData();
      
      // If real data is empty or invalid, fallback to dynamic data
      if (!realData || realData.length === 0) {
        if (enableFallback) {
          console.warn('Real data unavailable, using fallback real data with increments');
          const dynamicData = dynamicDataService.getCurrentData();
          return {
            data: dynamicData,
            loading: false,
            error: 'Real API data unavailable, showing real data with live increments',
            source: 'mock',
            lastUpdated: new Date()
          };
        } else {
          return {
            data: null,
            loading: false,
            error: 'No data available from real sources',
            source: 'real',
            lastUpdated: null
          };
        }
      }

      // Success - return real data
      const endTime = Date.now();
      console.log(`Real data fetched successfully in ${endTime - startTime}ms`);
      
      return {
        data: realData,
        loading: false,
        error: null,
        source: 'real',
        lastUpdated: new Date()
      };

    } catch (error) {
      console.error('Error fetching real data:', error);
      
      // If fallback is enabled, return dynamic data
      if (enableFallback) {
        const dynamicData = dynamicDataService.getCurrentData();
        return {
          data: dynamicData,
          loading: false,
          error: `Real data failed: ${error instanceof Error ? error.message : 'Unknown error'}, showing real data with live increments`,
          source: 'mock',
          lastUpdated: new Date()
        };
      }

      // No fallback - return error state
      return {
        data: null,
        loading: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        source: 'real',
        lastUpdated: null
      };
    }
  }

  // Get aggregated statistics with fallback
  async getAggregatedStats() {
    const dataState = await this.fetchScamData();
    
    if (!dataState.data) {
      // Return empty stats instead of throwing error
      return {
        totalCases: 0,
        totalLoss: 0,
        financialFraud: 0,
        onlineFraud: 0,
        identityTheft: 0,
        phishing: 0,
        dataTheft: 0,
        socialEngineering: 0
      };
    }

    // If using mock data, use the dynamic data service aggregation
    if (dataState.source === 'mock') {
      return dynamicDataService.getAggregatedStats();
    }

    // Calculate real data aggregation
    return dataState.data.reduce((acc, curr) => ({
      totalCases: acc.totalCases + curr.totalCases,
      totalLoss: acc.totalLoss + curr.totalLoss,
      financialFraud: acc.financialFraud + curr.financialFraud,
      onlineFraud: acc.onlineFraud + curr.onlineFraud,
      identityTheft: acc.identityTheft + curr.identityTheft,
      phishing: acc.phishing + curr.phishing,
      dataTheft: acc.dataTheft + curr.dataTheft,
      socialEngineering: acc.socialEngineering + curr.socialEngineering
    }), {
      totalCases: 0,
      totalLoss: 0,
      financialFraud: 0,
      onlineFraud: 0,
      identityTheft: 0,
      phishing: 0,
      dataTheft: 0,
      socialEngineering: 0
    });
  }

  // Get top states with fallback
  async getTopStates(limit: number = 10) {
    const dataState = await this.fetchScamData();
    
    if (!dataState.data) {
      return []; // Return empty array instead of throwing error
    }

    // If using mock data, use the dynamic data service function
    if (dataState.source === 'mock') {
      return dynamicDataService.getTopStates(limit);
    }

    // Sort and return top states from real data
    return [...dataState.data]
      .sort((a, b) => b.totalCases - a.totalCases)
      .slice(0, limit);
  }

  // Get data by state code
  async getScamDataByState(stateCode: string): Promise<ScamData | null> {
    const dataState = await this.fetchScamData();
    
    if (!dataState.data) {
      return null;
    }

    return dataState.data.find(data => data.stateCode === stateCode) || null;
  }

  // Check API health if needed (disabled for local-only mode)
  private async checkAPIHealthIfNeeded(): Promise<void> {
    // Skip health checks for local-only mode
    if (!this.lastHealthCheck) {
      this.healthStatus = {
        ncrb: true,
        rbi: true,
        dataGov: true,
        news: true,
        overall: true
      };
      this.lastHealthCheck = new Date();
      console.log('Using local data only - all APIs marked as healthy');
    }
  }

  // Public method to get API health status
  async getAPIHealthStatus(): Promise<APIHealthStatus> {
    await this.checkAPIHealthIfNeeded();
    return { ...this.healthStatus };
  }

  // Force refresh data (bypass cache)
  async refreshData(): Promise<DataState<ScamData[]>> {
    realDataService.clearCache();
    return this.fetchScamData();
  }

  // Get cache statistics
  getCacheStats() {
    return realDataService.getCacheStats();
  }

  // Enable/disable demo mode at runtime
  setDemoMode(enabled: boolean) {
    // Note: This would require restarting the app to change VITE env vars
    // This is for runtime toggling, but env vars take precedence
    console.warn(`Demo mode toggle requested: ${enabled}. Note: Environment variable takes precedence.`);
  }

  // Get current configuration
  getConfiguration() {
    return {
      demoMode: isDemoMode,
      fallbackEnabled: enableFallback,
      lastHealthCheck: this.lastHealthCheck,
      healthStatus: this.healthStatus
    };
  }
}

// Export singleton instance
export const dataAdapter = new DataAdapter();

// Export types and utilities
export type { DataState, APIHealthStatus };

// Hook for React components
export const useScamData = () => {
  return {
    fetchData: () => dataAdapter.fetchScamData(),
    getAggregatedStats: () => dataAdapter.getAggregatedStats(),
    getTopStates: (limit?: number) => dataAdapter.getTopStates(limit),
    getStateData: (stateCode: string) => dataAdapter.getScamDataByState(stateCode),
    getHealthStatus: () => dataAdapter.getAPIHealthStatus(),
    refreshData: () => dataAdapter.refreshData(),
    getCacheStats: () => dataAdapter.getCacheStats(),
    getConfig: () => dataAdapter.getConfiguration()
  };
};
