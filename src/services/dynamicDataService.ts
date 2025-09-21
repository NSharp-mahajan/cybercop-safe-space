import { ScamData } from './scamDataService';
import { baseCyberCrimeData, dataSources, monthlyTrendData } from '../data/realCyberCrimeData';

// LocalStorage keys
const STORAGE_KEYS = {
  INCREMENTS: 'cyber_crime_increments',
  LAST_UPDATE: 'cyber_crime_last_update',
  SESSION_COUNT: 'cyber_crime_session_count'
} as const;

// Interface for stored increments
interface StateIncrements {
  [stateCode: string]: {
    totalCases: number;
    financialFraud: number;
    onlineFraud: number;
    identityTheft: number;
    phishing: number;
    dataTheft: number;
    socialEngineering: number;
    totalLoss: number;
    lastIncrement: string;
  };
}

// Interface for session tracking
interface SessionInfo {
  count: number;
  firstSession: string;
  lastSession: string;
}

class DynamicDataService {
  private incrementData: StateIncrements = {};
  private sessionInfo: SessionInfo;
  
  constructor() {
    try {
      this.loadFromStorage();
      this.incrementSessionCount();
      this.applyRandomIncrements();
    } catch (error) {
      console.error('Failed to initialize dynamic data service:', error);
      // Fallback initialization
      this.incrementData = {};
      this.sessionInfo = {
        count: 1,
        firstSession: new Date().toISOString(),
        lastSession: new Date().toISOString()
      };
    }
  }

  // Load existing increments from localStorage
  private loadFromStorage(): void {
    try {
      const storedIncrements = localStorage.getItem(STORAGE_KEYS.INCREMENTS);
      const storedSession = localStorage.getItem(STORAGE_KEYS.SESSION_COUNT);
      
      if (storedIncrements) {
        this.incrementData = JSON.parse(storedIncrements);
      }
      
      if (storedSession) {
        this.sessionInfo = JSON.parse(storedSession);
      } else {
        this.sessionInfo = {
          count: 0,
          firstSession: new Date().toISOString(),
          lastSession: new Date().toISOString()
        };
      }
    } catch (error) {
      console.error('Failed to load data from storage:', error);
      this.incrementData = {};
      this.sessionInfo = {
        count: 0,
        firstSession: new Date().toISOString(),
        lastSession: new Date().toISOString()
      };
    }
  }

  // Save increments to localStorage
  private saveToStorage(): void {
    try {
      localStorage.setItem(STORAGE_KEYS.INCREMENTS, JSON.stringify(this.incrementData));
      localStorage.setItem(STORAGE_KEYS.LAST_UPDATE, new Date().toISOString());
      localStorage.setItem(STORAGE_KEYS.SESSION_COUNT, JSON.stringify(this.sessionInfo));
    } catch (error) {
      console.error('Failed to save data to storage:', error);
    }
  }

  // Increment session count
  private incrementSessionCount(): void {
    this.sessionInfo = {
      ...this.sessionInfo,
      count: this.sessionInfo.count + 1,
      lastSession: new Date().toISOString()
    };
  }

  // Generate random increment (1-4) for a category
  private getRandomIncrement(): number {
    return Math.floor(Math.random() * 4) + 1; // 1, 2, 3, or 4
  }

  // Generate random loss increment (0.1 to 2.0 crores)
  private getRandomLossIncrement(): number {
    return Math.round((Math.random() * 1.9 + 0.1) * 10) / 10; // 0.1 to 2.0, rounded to 1 decimal
  }

  // Apply random increments to all states
  private applyRandomIncrements(): void {
    const now = new Date().toISOString();
    
    baseCyberCrimeData.forEach(state => {
      if (!this.incrementData[state.stateCode]) {
        this.incrementData[state.stateCode] = {
          totalCases: 0,
          financialFraud: 0,
          onlineFraud: 0,
          identityTheft: 0,
          phishing: 0,
          dataTheft: 0,
          socialEngineering: 0,
          totalLoss: 0,
          lastIncrement: now
        };
      }

      // Apply increments based on state risk level and size
      const riskMultiplier = this.getRiskMultiplier(state.riskLevel);
      const sizeMultiplier = this.getSizeMultiplier(state.totalCases);
      
      const increment = this.incrementData[state.stateCode];
      
      // Apply increments with probability based on risk and size
      if (Math.random() < 0.7 * riskMultiplier) { // 70% base chance, modified by risk
        increment.financialFraud += Math.floor(this.getRandomIncrement() * sizeMultiplier);
      }
      
      if (Math.random() < 0.6 * riskMultiplier) {
        increment.onlineFraud += Math.floor(this.getRandomIncrement() * sizeMultiplier);
      }
      
      if (Math.random() < 0.5 * riskMultiplier) {
        increment.identityTheft += Math.floor(this.getRandomIncrement() * sizeMultiplier);
      }
      
      if (Math.random() < 0.6 * riskMultiplier) {
        increment.phishing += Math.floor(this.getRandomIncrement() * sizeMultiplier);
      }
      
      if (Math.random() < 0.4 * riskMultiplier) {
        increment.dataTheft += Math.floor(this.getRandomIncrement() * sizeMultiplier);
      }
      
      if (Math.random() < 0.3 * riskMultiplier) {
        increment.socialEngineering += Math.floor(this.getRandomIncrement() * sizeMultiplier);
      }
      
      // Update total cases and loss
      increment.totalCases = increment.financialFraud + increment.onlineFraud + 
                            increment.identityTheft + increment.phishing + 
                            increment.dataTheft + increment.socialEngineering;
      
      increment.totalLoss += this.getRandomLossIncrement() * riskMultiplier * sizeMultiplier;
      increment.lastIncrement = now;
    });

    this.saveToStorage();
  }

  // Get risk multiplier based on risk level
  private getRiskMultiplier(riskLevel: string): number {
    switch (riskLevel) {
      case 'Critical': return 1.5;
      case 'High': return 1.2;
      case 'Medium': return 1.0;
      case 'Low': return 0.6;
      default: return 1.0;
    }
  }

  // Get size multiplier based on total cases
  private getSizeMultiplier(totalCases: number): number {
    if (totalCases > 15000) return 1.3;
    if (totalCases > 10000) return 1.1;
    if (totalCases > 5000) return 1.0;
    if (totalCases > 1000) return 0.8;
    return 0.6;
  }

  // Get current data with increments applied
  getCurrentData(): ScamData[] {
    return baseCyberCrimeData.map(state => {
      const increments = this.incrementData[state.stateCode] || {
        totalCases: 0,
        financialFraud: 0,
        onlineFraud: 0,
        identityTheft: 0,
        phishing: 0,
        dataTheft: 0,
        socialEngineering: 0,
        totalLoss: 0,
        lastIncrement: new Date().toISOString()
      };

      const updatedState: ScamData = {
        ...state,
        totalCases: state.totalCases + increments.totalCases,
        financialFraud: state.financialFraud + increments.financialFraud,
        onlineFraud: state.onlineFraud + increments.onlineFraud,
        identityTheft: state.identityTheft + increments.identityTheft,
        phishing: state.phishing + increments.phishing,
        dataTheft: state.dataTheft + increments.dataTheft,
        socialEngineering: state.socialEngineering + increments.socialEngineering,
        totalLoss: Math.round((state.totalLoss + increments.totalLoss) * 10) / 10,
        lastUpdated: new Date().toISOString().split('T')[0],
        // Recalculate population ratio with new numbers
        populationRatio: this.recalculatePopulationRatio(
          state.totalCases + increments.totalCases,
          this.getPopulationByState(state.stateCode)
        )
      };

      // Update risk level if needed
      updatedState.riskLevel = this.calculateRiskLevel(
        updatedState.populationRatio
      );

      return updatedState;
    });
  }

  // Recalculate population ratio
  private recalculatePopulationRatio(cases: number, population: number): number {
    return Math.round(((cases / population) * 100000) * 10) / 10;
  }

  // Get population by state code (simplified mapping)
  private getPopulationByState(stateCode: string): number {
    const populations: Record<string, number> = {
      'UP': 199812341, 'MH': 112374333, 'BR': 104099452, 'WB': 91276115,
      'MP': 72626809, 'TN': 72147030, 'RJ': 68548437, 'KA': 61095297,
      'GJ': 60439692, 'AP': 49576777, 'OR': 42020982, 'TG': 35003674,
      'KL': 33406061, 'JH': 32988134, 'AS': 31205576, 'PB': 27743338,
      'CG': 25545198, 'HR': 25351462, 'DL': 16787941, 'JK': 12267032,
      'UK': 10086292, 'HP': 6864602, 'TR': 3673917, 'ML': 2966889,
      'MN': 2570390, 'NL': 1978502, 'GA': 1458545, 'AR': 1383727,
      'MZ': 1097206, 'SK': 610577
    };
    return populations[stateCode] || 1000000; // fallback
  }

  // Calculate risk level based on population ratio
  private calculateRiskLevel(ratio: number): 'Low' | 'Medium' | 'High' | 'Critical' {
    if (ratio > 50) return 'Critical';
    if (ratio > 20) return 'High';
    if (ratio > 10) return 'Medium';
    return 'Low';
  }

  // Get aggregated statistics
  getAggregatedStats() {
    const currentData = this.getCurrentData();
    return currentData.reduce((acc, curr) => ({
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

  // Get top states
  getTopStates(limit: number = 10): ScamData[] {
    return this.getCurrentData()
      .sort((a, b) => b.totalCases - a.totalCases)
      .slice(0, limit);
  }

  // Get data by state code
  getScamDataByState(stateCode: string): ScamData | null {
    return this.getCurrentData().find(data => data.stateCode === stateCode) || null;
  }

  // Get session information
  getSessionInfo(): SessionInfo & { totalIncrements: number } {
    const totalIncrements = Object.values(this.incrementData).reduce(
      (total, state) => total + state.totalCases, 
      0
    );
    
    return {
      ...this.sessionInfo,
      totalIncrements
    };
  }

  // Get data sources
  getDataSources() {
    return dataSources;
  }

  // Get monthly trend data (can be enhanced with increments)
  getMonthlyTrendData() {
    const currentStats = this.getAggregatedStats();
    const lastMonth = monthlyTrendData[monthlyTrendData.length - 1];
    
    // Add current month with increments
    const currentMonth = {
      month: new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
      cases: currentStats.totalCases,
      loss: Math.round(currentStats.totalLoss)
    };

    return [...monthlyTrendData, currentMonth];
  }

  // Force new increments (for testing)
  forceNewIncrements(): void {
    this.applyRandomIncrements();
  }

  // Reset all increments (for testing)
  resetIncrements(): void {
    this.incrementData = {};
    this.sessionInfo = {
      count: 1,
      firstSession: new Date().toISOString(),
      lastSession: new Date().toISOString()
    };
    this.saveToStorage();
  }

  // Get increment statistics
  getIncrementStats() {
    const stats = {
      statesWithIncrements: 0,
      totalIncrements: 0,
      averageIncrement: 0,
      highestIncrement: 0,
      stateWithHighestIncrement: ''
    };

    Object.entries(this.incrementData).forEach(([stateCode, increments]) => {
      if (increments.totalCases > 0) {
        stats.statesWithIncrements++;
        stats.totalIncrements += increments.totalCases;
        
        if (increments.totalCases > stats.highestIncrement) {
          stats.highestIncrement = increments.totalCases;
          stats.stateWithHighestIncrement = baseCyberCrimeData.find(
            s => s.stateCode === stateCode
          )?.stateName || stateCode;
        }
      }
    });

    stats.averageIncrement = stats.statesWithIncrements > 0 ? 
      Math.round(stats.totalIncrements / stats.statesWithIncrements * 10) / 10 : 0;

    return stats;
  }
}

// Export singleton instance
export const dynamicDataService = new DynamicDataService();

// Export types and data
export type { StateIncrements, SessionInfo };
export { dataSources, monthlyTrendData };
