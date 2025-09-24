import { useState, useEffect, useCallback, useRef } from 'react';
import { dataAdapter, DataState, APIHealthStatus } from '@/services/dataAdapter';
import { ScamData } from '@/services/scamDataService';

// Hook state interface
interface UseScamDataState {
  data: ScamData[] | null;
  aggregatedStats: any | null;
  topStates: ScamData[] | null;
  loading: boolean;
  error: string | null;
  source: 'real' | 'mock' | 'cache';
  lastUpdated: Date | null;
  healthStatus: APIHealthStatus | null;
}

// Hook options
interface UseScamDataOptions {
  autoFetch?: boolean;
  refreshInterval?: number; // in milliseconds
  topStatesLimit?: number;
  onError?: (error: string) => void;
  onSuccess?: (data: ScamData[]) => void;
}

export const useRealScamData = (options: UseScamDataOptions = {}) => {
  const {
    autoFetch = true,
    refreshInterval = 0, // 0 means no auto-refresh
    topStatesLimit = 10,
    onError,
    onSuccess
  } = options;

  // State management
  const [state, setState] = useState<UseScamDataState>({
    data: null,
    aggregatedStats: null,
    topStates: null,
    loading: true,
    error: null,
    source: 'mock',
    lastUpdated: null,
    healthStatus: null
  });

  // Refs for cleanup and preventing stale closures
  const refreshTimerRef = useRef<NodeJS.Timeout | null>(null);
  const mountedRef = useRef(true);

  // Fetch all data
  const fetchData = useCallback(async (showLoading = true) => {
    if (!mountedRef.current) return;

    if (showLoading) {
      setState(prev => ({ ...prev, loading: true, error: null }));
    }

    try {
      // Fetch main data
      const dataState = await dataAdapter.fetchScamData();
      
      if (!mountedRef.current) return;

      if (dataState.error && !dataState.data) {
        setState(prev => ({
          ...prev,
          loading: false,
          error: dataState.error,
          data: null,
          aggregatedStats: null,
          topStates: null,
          source: dataState.source,
          lastUpdated: dataState.lastUpdated
        }));
        onError?.(dataState.error);
        return;
      }

      // Fetch aggregated stats and top states in parallel
      const [aggregatedStats, topStates, healthStatus] = await Promise.allSettled([
        dataAdapter.getAggregatedStats(),
        dataAdapter.getTopStates(topStatesLimit),
        dataAdapter.getAPIHealthStatus()
      ]);

      if (!mountedRef.current) return;

      setState({
        data: dataState.data,
        aggregatedStats: aggregatedStats.status === 'fulfilled' ? aggregatedStats.value : null,
        topStates: topStates.status === 'fulfilled' ? topStates.value : null,
        loading: false,
        error: dataState.error, // May have error but still have fallback data
        source: dataState.source,
        lastUpdated: dataState.lastUpdated,
        healthStatus: healthStatus.status === 'fulfilled' ? healthStatus.value : null
      });

      if (dataState.data) {
        onSuccess?.(dataState.data);
      }

    } catch (error) {
      if (!mountedRef.current) return;

      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage,
        data: null,
        aggregatedStats: null,
        topStates: null
      }));
      onError?.(errorMessage);
    }
  }, [topStatesLimit, onError, onSuccess]);

  // Refresh data (bypass cache)
  const refreshData = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      await dataAdapter.refreshData();
      await fetchData(false); // Don't show loading again
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Refresh failed';
      setState(prev => ({ ...prev, loading: false, error: errorMessage }));
      onError?.(errorMessage);
    }
  }, [fetchData, onError]);

  // Get data for specific state
  const getStateData = useCallback(async (stateCode: string): Promise<ScamData | null> => {
    try {
      return await dataAdapter.getScamDataByState(stateCode);
    } catch (error) {
      console.error('Failed to get state data:', error);
      return null;
    }
  }, []);

  // Check API health
  const checkAPIHealth = useCallback(async (): Promise<APIHealthStatus | null> => {
    try {
      const health = await dataAdapter.getAPIHealthStatus();
      setState(prev => ({ ...prev, healthStatus: health }));
      return health;
    } catch (error) {
      console.error('Failed to check API health:', error);
      return null;
    }
  }, []);

  // Get configuration
  const getConfiguration = useCallback(() => {
    return dataAdapter.getConfiguration();
  }, []);

  // Setup auto-refresh
  useEffect(() => {
    if (refreshInterval > 0) {
      refreshTimerRef.current = setInterval(() => {
        fetchData(false); // Silent refresh
      }, refreshInterval);
    }

    return () => {
      if (refreshTimerRef.current) {
        clearInterval(refreshTimerRef.current);
        refreshTimerRef.current = null;
      }
    };
  }, [refreshInterval, fetchData]);

  // Initial fetch
  useEffect(() => {
    if (autoFetch) {
      fetchData();
    }

    return () => {
      mountedRef.current = false;
    };
  }, [autoFetch, fetchData]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      mountedRef.current = false;
      if (refreshTimerRef.current) {
        clearInterval(refreshTimerRef.current);
      }
    };
  }, []);

  return {
    // Data
    data: state.data,
    aggregatedStats: state.aggregatedStats,
    topStates: state.topStates,
    
    // Status
    loading: state.loading,
    error: state.error,
    source: state.source,
    lastUpdated: state.lastUpdated,
    healthStatus: state.healthStatus,
    
    // Actions
    fetchData: () => fetchData(true),
    refreshData,
    getStateData,
    checkAPIHealth,
    getConfiguration,
    
    // Utility
    isUsingRealData: state.source === 'real',
    isUsingMockData: state.source === 'mock',
    hasError: !!state.error,
    isHealthy: state.healthStatus?.overall || false,
    
    // Cache stats
    getCacheStats: () => dataAdapter.getCacheStats()
  };
};

// Specialized hook for just getting state data
export const useStateScamData = (stateCode: string) => {
  const [stateData, setStateData] = useState<ScamData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStateData = useCallback(async () => {
    if (!stateCode) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const data = await dataAdapter.getScamDataByState(stateCode);
      setStateData(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch state data';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [stateCode]);

  useEffect(() => {
    fetchStateData();
  }, [fetchStateData]);

  return {
    data: stateData,
    loading,
    error,
    refresh: fetchStateData
  };
};

// Hook for API health monitoring
export const useAPIHealth = (checkInterval: number = 5 * 60 * 1000) => {
  const [healthStatus, setHealthStatus] = useState<APIHealthStatus | null>(null);
  const [lastCheck, setLastCheck] = useState<Date | null>(null);
  const [checking, setChecking] = useState(false);

  const checkHealth = useCallback(async () => {
    setChecking(true);
    try {
      const health = await dataAdapter.getAPIHealthStatus();
      setHealthStatus(health);
      setLastCheck(new Date());
    } catch (error) {
      console.error('Health check failed:', error);
      setHealthStatus({
        ncrb: false,
        rbi: false,
        dataGov: false,
        news: false,
        overall: false
      });
    } finally {
      setChecking(false);
    }
  }, []);

  useEffect(() => {
    checkHealth(); // Initial check

    const interval = setInterval(checkHealth, checkInterval);
    return () => clearInterval(interval);
  }, [checkHealth, checkInterval]);

  return {
    healthStatus,
    lastCheck,
    checking,
    checkHealth
  };
};
