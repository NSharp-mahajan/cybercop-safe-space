// Enhanced Scam Data Service with comprehensive state-wise information
export interface TrendingScam {
  id: string;
  type: string;
  description: string;
  riskLevel: 'Low' | 'Medium' | 'High' | 'Critical';
  affectedAge: string;
  reportedCases: number;
  lastReported: string;
}

export interface StateDetailedData {
  stateCode: string;
  stateName: string;
  population: number;
  
  // Live Crime Data
  liveCyberCrimes: number;
  liveCrimesThisWeek: number;
  liveCrimesThisMonth: number;
  crimeGrowthRate: number; // percentage
  
  // Safety Ratings (out of 10)
  overallSafetyRating: number;
  womenSafetyRating: number;
  digitalSafetyRating: number;
  financialSafetyRating: number;
  
  // Fraud Statistics
  totalCases: number;
  financialFraud: number;
  onlineFraud: number;
  identityTheft: number;
  phishing: number;
  
  // Financial Impact
  totalLoss: number; // in crores
  averageLossPerCase: number; // in thousands
  
  // Demographics
  primaryTargetAge: string;
  mostVulnerableGroup: string;
  
  // Risk Assessment
  riskLevel: 'Low' | 'Medium' | 'High' | 'Critical';
  trendDirection: 'up' | 'down' | 'stable';
  
  // Trending Scams (latest 5)
  trendingScams: TrendingScam[];
  
  // Police Response
  casesSolved: number;
  responseTime: string; // average response time
  awarenessCampaigns: number;
  
  // Additional Metrics
  reportingRate: number; // percentage of crimes reported
  convictionRate: number; // percentage
  lastUpdated: string;
}

// Enhanced data for all Indian states with comprehensive information
export const enhancedScamData: StateDetailedData[] = [
  {
    stateCode: 'DL',
    stateName: 'Delhi',
    population: 32900000,
    liveCyberCrimes: 1247,
    liveCrimesThisWeek: 89,
    liveCrimesThisMonth: 356,
    crimeGrowthRate: 23.5,
    overallSafetyRating: 4.2,
    womenSafetyRating: 3.8,
    digitalSafetyRating: 3.5,
    financialSafetyRating: 4.0,
    totalCases: 24567,
    financialFraud: 12890,
    onlineFraud: 8234,
    identityTheft: 2145,
    phishing: 1298,
    totalLoss: 1245.7,
    averageLossPerCase: 50.7,
    primaryTargetAge: '25-45 years',
    mostVulnerableGroup: 'Young professionals',
    riskLevel: 'Critical',
    trendDirection: 'up',
    trendingScams: [
      {
        id: 'dl_1',
        type: 'UPI Fraud',
        description: 'Fake UPI payment links targeting online shoppers during festival season',
        riskLevel: 'Critical',
        affectedAge: '18-35',
        reportedCases: 234,
        lastReported: '2 hours ago'
      },
      {
        id: 'dl_2',
        type: 'Job Portal Scam',
        description: 'Fraudulent job offers demanding upfront fees for work-from-home positions',
        riskLevel: 'High',
        affectedAge: '22-35',
        reportedCases: 189,
        lastReported: '4 hours ago'
      },
      {
        id: 'dl_3',
        type: 'Investment Fraud',
        description: 'Fake cryptocurrency and stock market investment schemes on social media',
        riskLevel: 'High',
        affectedAge: '25-50',
        reportedCases: 156,
        lastReported: '6 hours ago'
      },
      {
        id: 'dl_4',
        type: 'Dating App Scam',
        description: 'Romance scams targeting professionals on dating applications',
        riskLevel: 'Medium',
        affectedAge: '25-40',
        reportedCases: 98,
        lastReported: '8 hours ago'
      },
      {
        id: 'dl_5',
        type: 'Rental Fraud',
        description: 'Fake property rental listings demanding advance payments',
        riskLevel: 'Medium',
        affectedAge: '20-35',
        reportedCases: 87,
        lastReported: '10 hours ago'
      }
    ],
    casesSolved: 12456,
    responseTime: '2.5 hours',
    awarenessCampaigns: 15,
    reportingRate: 67.8,
    convictionRate: 23.4,
    lastUpdated: '5 minutes ago'
  },
  {
    stateCode: 'MH',
    stateName: 'Maharashtra',
    population: 112374333,
    liveCyberCrimes: 2156,
    liveCrimesThisWeek: 167,
    liveCrimesThisMonth: 642,
    crimeGrowthRate: 18.2,
    overallSafetyRating: 5.8,
    womenSafetyRating: 5.2,
    digitalSafetyRating: 5.5,
    financialSafetyRating: 6.1,
    totalCases: 45678,
    financialFraud: 23456,
    onlineFraud: 15234,
    identityTheft: 4567,
    phishing: 2421,
    totalLoss: 2345.8,
    averageLossPerCase: 51.3,
    primaryTargetAge: '28-50 years',
    mostVulnerableGroup: 'IT professionals',
    riskLevel: 'High',
    trendDirection: 'up',
    trendingScams: [
      {
        id: 'mh_1',
        type: 'Credit Card Fraud',
        description: 'Cloned credit cards used for online purchases and ATM withdrawals',
        riskLevel: 'Critical',
        affectedAge: '25-55',
        reportedCases: 312,
        lastReported: '1 hour ago'
      },
      {
        id: 'mh_2',
        type: 'Loan Scam',
        description: 'Instant loan apps charging exorbitant interest and threatening customers',
        riskLevel: 'High',
        affectedAge: '21-40',
        reportedCases: 289,
        lastReported: '3 hours ago'
      },
      {
        id: 'mh_3',
        type: 'Business Email Compromise',
        description: 'Hackers targeting corporate emails to redirect payments',
        riskLevel: 'Critical',
        affectedAge: '30-60',
        reportedCases: 145,
        lastReported: '2 hours ago'
      },
      {
        id: 'mh_4',
        type: 'Social Media Fraud',
        description: 'Fake profiles selling luxury goods at discounted prices',
        riskLevel: 'Medium',
        affectedAge: '18-35',
        reportedCases: 198,
        lastReported: '5 hours ago'
      },
      {
        id: 'mh_5',
        type: 'Insurance Fraud',
        description: 'Fake insurance policies sold through cold calling',
        riskLevel: 'High',
        affectedAge: '35-65',
        reportedCases: 134,
        lastReported: '7 hours ago'
      }
    ],
    casesSolved: 28945,
    responseTime: '1.8 hours',
    awarenessCampaigns: 22,
    reportingRate: 72.3,
    convictionRate: 31.7,
    lastUpdated: '3 minutes ago'
  },
  {
    stateCode: 'KA',
    stateName: 'Karnataka',
    population: 61095297,
    liveCyberCrimes: 1876,
    liveCrimesThisWeek: 134,
    liveCrimesThisMonth: 523,
    crimeGrowthRate: 21.7,
    overallSafetyRating: 6.2,
    womenSafetyRating: 5.9,
    digitalSafetyRating: 5.8,
    financialSafetyRating: 6.5,
    totalCases: 38945,
    financialFraud: 19234,
    onlineFraud: 13456,
    identityTheft: 3987,
    phishing: 2268,
    totalLoss: 1987.4,
    averageLossPerCase: 51.0,
    primaryTargetAge: '25-45 years',
    mostVulnerableGroup: 'Tech workers',
    riskLevel: 'High',
    trendDirection: 'up',
    trendingScams: [
      {
        id: 'ka_1',
        type: 'Tech Support Scam',
        description: 'Fake Microsoft/Google support calls targeting software professionals',
        riskLevel: 'Critical',
        affectedAge: '25-50',
        reportedCases: 267,
        lastReported: '30 minutes ago'
      },
      {
        id: 'ka_2',
        type: 'Cryptocurrency Fraud',
        description: 'Fake crypto trading platforms promising guaranteed returns',
        riskLevel: 'Critical',
        affectedAge: '22-40',
        reportedCases: 234,
        lastReported: '2 hours ago'
      },
      {
        id: 'ka_3',
        type: 'Online Shopping Fraud',
        description: 'Fraudulent e-commerce websites during festival sales',
        riskLevel: 'High',
        affectedAge: '20-45',
        reportedCases: 189,
        lastReported: '4 hours ago'
      },
      {
        id: 'ka_4',
        type: 'Gaming Fraud',
        description: 'Fake gaming tournaments and in-app purchase scams',
        riskLevel: 'Medium',
        affectedAge: '16-30',
        reportedCases: 156,
        lastReported: '6 hours ago'
      },
      {
        id: 'ka_5',
        type: 'Digital Loan Fraud',
        description: 'Predatory lending apps targeting young professionals',
        riskLevel: 'High',
        affectedAge: '21-35',
        reportedCases: 123,
        lastReported: '8 hours ago'
      }
    ],
    casesSolved: 24567,
    responseTime: '1.5 hours',
    awarenessCampaigns: 28,
    reportingRate: 75.6,
    convictionRate: 35.2,
    lastUpdated: '7 minutes ago'
  },
  {
    stateCode: 'TN',
    stateName: 'Tamil Nadu',
    population: 72147030,
    liveCyberCrimes: 1654,
    liveCrimesThisWeek: 112,
    liveCrimesThisMonth: 445,
    crimeGrowthRate: 16.8,
    overallSafetyRating: 6.8,
    womenSafetyRating: 6.5,
    digitalSafetyRating: 6.2,
    financialSafetyRating: 7.1,
    totalCases: 32145,
    financialFraud: 15678,
    onlineFraud: 11234,
    identityTheft: 3456,
    phishing: 1777,
    totalLoss: 1654.3,
    averageLossPerCase: 51.5,
    primaryTargetAge: '30-55 years',
    mostVulnerableGroup: 'Business owners',
    riskLevel: 'Medium',
    trendDirection: 'stable',
    trendingScams: [
      {
        id: 'tn_1',
        type: 'Gold Investment Scam',
        description: 'Fake gold investment schemes targeting traditional investors',
        riskLevel: 'High',
        affectedAge: '35-65',
        reportedCases: 198,
        lastReported: '1 hour ago'
      },
      {
        id: 'tn_2',
        type: 'Education Loan Fraud',
        description: 'Fake education consultancies promising scholarships abroad',
        riskLevel: 'High',
        affectedAge: '18-25',
        reportedCases: 167,
        lastReported: '3 hours ago'
      },
      {
        id: 'tn_3',
        type: 'Property Investment Fraud',
        description: 'Fraudulent real estate deals with fake documents',
        riskLevel: 'Critical',
        affectedAge: '30-60',
        reportedCases: 145,
        lastReported: '2 hours ago'
      },
      {
        id: 'tn_4',
        type: 'Medical Insurance Fraud',
        description: 'Fake health insurance policies during health crises',
        riskLevel: 'Medium',
        affectedAge: '25-55',
        reportedCases: 134,
        lastReported: '5 hours ago'
      },
      {
        id: 'tn_5',
        type: 'Agricultural Loan Scam',
        description: 'Fake agricultural subsidies and loan schemes',
        riskLevel: 'Medium',
        affectedAge: '25-65',
        reportedCases: 89,
        lastReported: '9 hours ago'
      }
    ],
    casesSolved: 21789,
    responseTime: '1.2 hours',
    awarenessCampaigns: 31,
    reportingRate: 78.9,
    convictionRate: 42.1,
    lastUpdated: '4 minutes ago'
  },
  {
    stateCode: 'UP',
    stateName: 'Uttar Pradesh',
    population: 199812341,
    liveCyberCrimes: 2987,
    liveCrimesThisWeek: 234,
    liveCrimesThisMonth: 891,
    crimeGrowthRate: 25.3,
    overallSafetyRating: 4.8,
    womenSafetyRating: 4.2,
    digitalSafetyRating: 4.5,
    financialSafetyRating: 5.1,
    totalCases: 56789,
    financialFraud: 28456,
    onlineFraud: 19234,
    identityTheft: 5678,
    phishing: 3421,
    totalLoss: 2897.6,
    averageLossPerCase: 51.0,
    primaryTargetAge: '20-50 years',
    mostVulnerableGroup: 'Rural population',
    riskLevel: 'Critical',
    trendDirection: 'up',
    trendingScams: [
      {
        id: 'up_1',
        type: 'Government Scheme Fraud',
        description: 'Fake government benefit schemes targeting rural areas',
        riskLevel: 'Critical',
        affectedAge: '25-65',
        reportedCases: 445,
        lastReported: '45 minutes ago'
      },
      {
        id: 'up_2',
        type: 'Mobile Recharge Fraud',
        description: 'Fake mobile recharge offers through SMS and calls',
        riskLevel: 'High',
        affectedAge: '18-50',
        reportedCases: 356,
        lastReported: '2 hours ago'
      },
      {
        id: 'up_3',
        type: 'Bank Account Fraud',
        description: 'Fake bank officials collecting account details over phone',
        riskLevel: 'Critical',
        affectedAge: '30-70',
        reportedCases: 289,
        lastReported: '1 hour ago'
      },
      {
        id: 'up_4',
        type: 'Lottery Scam',
        description: 'Fake lottery winnings demanding processing fees',
        riskLevel: 'High',
        affectedAge: '20-60',
        reportedCases: 234,
        lastReported: '4 hours ago'
      },
      {
        id: 'up_5',
        type: 'Job Guarantee Scam',
        description: 'Fake government job offers demanding registration fees',
        riskLevel: 'High',
        affectedAge: '18-35',
        reportedCases: 198,
        lastReported: '6 hours ago'
      }
    ],
    casesSolved: 19876,
    responseTime: '3.2 hours',
    awarenessCampaigns: 18,
    reportingRate: 52.3,
    convictionRate: 18.7,
    lastUpdated: '8 minutes ago'
  },
  {
    stateCode: 'GJ',
    stateName: 'Gujarat',
    population: 60439692,
    liveCyberCrimes: 1234,
    liveCrimesThisWeek: 89,
    liveCrimesThisMonth: 345,
    crimeGrowthRate: 12.3,
    overallSafetyRating: 7.2,
    womenSafetyRating: 6.8,
    digitalSafetyRating: 7.5,
    financialSafetyRating: 7.8,
    totalCases: 28456,
    financialFraud: 14234,
    onlineFraud: 9876,
    identityTheft: 2890,
    phishing: 1456,
    totalLoss: 1456.7,
    averageLossPerCase: 51.2,
    primaryTargetAge: '30-60 years',
    mostVulnerableGroup: 'Business community',
    riskLevel: 'Medium',
    trendDirection: 'down',
    trendingScams: [
      {
        id: 'gj_1',
        type: 'Trade Finance Fraud',
        description: 'Fake import-export financing schemes targeting SME businesses',
        riskLevel: 'High',
        affectedAge: '35-60',
        reportedCases: 145,
        lastReported: '2 hours ago'
      },
      {
        id: 'gj_2',
        type: 'Diamond Investment Scam',
        description: 'Fraudulent diamond trading and investment schemes',
        riskLevel: 'Critical',
        affectedAge: '40-70',
        reportedCases: 123,
        lastReported: '4 hours ago'
      },
      {
        id: 'gj_3',
        type: 'Agricultural Commodity Fraud',
        description: 'Fake commodity trading platforms targeting farmers',
        riskLevel: 'High',
        affectedAge: '25-55',
        reportedCases: 98,
        lastReported: '6 hours ago'
      },
      {
        id: 'gj_4',
        type: 'Textile Export Fraud',
        description: 'Fake international buyers scamming textile manufacturers',
        riskLevel: 'Medium',
        affectedAge: '30-50',
        reportedCases: 76,
        lastReported: '8 hours ago'
      },
      {
        id: 'gj_5',
        type: 'Chemical Trading Scam',
        description: 'Fraudulent chemical supply contracts and advance payments',
        riskLevel: 'Medium',
        affectedAge: '35-65',
        reportedCases: 54,
        lastReported: '12 hours ago'
      }
    ],
    casesSolved: 19876,
    responseTime: '1.8 hours',
    awarenessCampaigns: 25,
    reportingRate: 81.2,
    convictionRate: 45.6,
    lastUpdated: '6 minutes ago'
  },
  {
    stateCode: 'RJ',
    stateName: 'Rajasthan',
    population: 68548437,
    liveCyberCrimes: 1567,
    liveCrimesThisWeek: 103,
    liveCrimesThisMonth: 412,
    crimeGrowthRate: 19.7,
    overallSafetyRating: 5.8,
    womenSafetyRating: 5.2,
    digitalSafetyRating: 5.5,
    financialSafetyRating: 6.2,
    totalCases: 34567,
    financialFraud: 17890,
    onlineFraud: 12456,
    identityTheft: 2987,
    phishing: 1234,
    totalLoss: 1789.3,
    averageLossPerCase: 51.8,
    primaryTargetAge: '25-55 years',
    mostVulnerableGroup: 'Tourist industry workers',
    riskLevel: 'High',
    trendDirection: 'up',
    trendingScams: [
      {
        id: 'rj_1',
        type: 'Tourism Package Fraud',
        description: 'Fake travel and heritage tour packages targeting domestic tourists',
        riskLevel: 'High',
        affectedAge: '25-60',
        reportedCases: 189,
        lastReported: '3 hours ago'
      },
      {
        id: 'rj_2',
        type: 'Handicraft Export Scam',
        description: 'Fraudulent international buyers targeting local artisans',
        riskLevel: 'Medium',
        affectedAge: '30-65',
        reportedCases: 156,
        lastReported: '5 hours ago'
      },
      {
        id: 'rj_3',
        type: 'Mining Rights Fraud',
        description: 'Fake mining licenses and mineral trading schemes',
        riskLevel: 'Critical',
        affectedAge: '35-70',
        reportedCases: 134,
        lastReported: '7 hours ago'
      },
      {
        id: 'rj_4',
        type: 'Solar Energy Scam',
        description: 'Fraudulent solar panel installation and subsidy schemes',
        riskLevel: 'High',
        affectedAge: '30-60',
        reportedCases: 112,
        lastReported: '9 hours ago'
      },
      {
        id: 'rj_5',
        type: 'Gemstone Investment Fraud',
        description: 'Fake precious stone trading and investment opportunities',
        riskLevel: 'High',
        affectedAge: '40-70',
        reportedCases: 87,
        lastReported: '11 hours ago'
      }
    ],
    casesSolved: 16789,
    responseTime: '2.8 hours',
    awarenessCampaigns: 19,
    reportingRate: 65.4,
    convictionRate: 28.9,
    lastUpdated: '9 minutes ago'
  },
  {
    stateCode: 'WB',
    stateName: 'West Bengal',
    population: 91276115,
    liveCyberCrimes: 1876,
    liveCrimesThisWeek: 145,
    liveCrimesThisMonth: 567,
    crimeGrowthRate: 17.8,
    overallSafetyRating: 6.1,
    womenSafetyRating: 5.7,
    digitalSafetyRating: 5.9,
    financialSafetyRating: 6.4,
    totalCases: 41234,
    financialFraud: 20567,
    onlineFraud: 14789,
    identityTheft: 3456,
    phishing: 2422,
    totalLoss: 2134.6,
    averageLossPerCase: 51.8,
    primaryTargetAge: '28-50 years',
    mostVulnerableGroup: 'Cultural and creative workers',
    riskLevel: 'High',
    trendDirection: 'stable',
    trendingScams: [
      {
        id: 'wb_1',
        type: 'Cultural Event Fraud',
        description: 'Fake Durga Puja and cultural event sponsorship scams',
        riskLevel: 'Medium',
        affectedAge: '25-55',
        reportedCases: 234,
        lastReported: '4 hours ago'
      },
      {
        id: 'wb_2',
        type: 'Fish Trading Scam',
        description: 'Fraudulent seafood export contracts targeting fishermen',
        riskLevel: 'High',
        affectedAge: '30-60',
        reportedCases: 189,
        lastReported: '6 hours ago'
      },
      {
        id: 'wb_3',
        type: 'Tea Garden Investment Fraud',
        description: 'Fake tea plantation investment schemes in Darjeeling region',
        riskLevel: 'Critical',
        affectedAge: '35-65',
        reportedCases: 167,
        lastReported: '8 hours ago'
      },
      {
        id: 'wb_4',
        type: 'Handloom Export Scam',
        description: 'Fraudulent international buyers targeting handloom weavers',
        riskLevel: 'Medium',
        affectedAge: '25-50',
        reportedCases: 145,
        lastReported: '10 hours ago'
      },
      {
        id: 'wb_5',
        type: 'Educational Coaching Fraud',
        description: 'Fake competitive exam coaching and placement guarantees',
        riskLevel: 'High',
        affectedAge: '18-30',
        reportedCases: 123,
        lastReported: '12 hours ago'
      }
    ],
    casesSolved: 23456,
    responseTime: '2.2 hours',
    awarenessCampaigns: 22,
    reportingRate: 71.8,
    convictionRate: 34.7,
    lastUpdated: '11 minutes ago'
  }
  // Additional states can be added following the same pattern...
];

// Service class for managing enhanced scam data
export class EnhancedScamDataService {
  private static instance: EnhancedScamDataService;
  private stateData: StateDetailedData[];
  private liveCrimeUpdateInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.stateData = [...enhancedScamData];
    this.startLiveCrimeSimulation();
  }

  static getInstance(): EnhancedScamDataService {
    if (!EnhancedScamDataService.instance) {
      EnhancedScamDataService.instance = new EnhancedScamDataService();
    }
    return EnhancedScamDataService.instance;
  }

  // Start live crime counter simulation
  startLiveCrimeSimulation() {
    if (this.liveCrimeUpdateInterval) {
      clearInterval(this.liveCrimeUpdateInterval);
    }

    this.liveCrimeUpdateInterval = setInterval(() => {
      this.updateLiveCrimes();
    }, 30000); // Update every 30 seconds
  }

  // Update live crime counts with realistic increments
  private updateLiveCrimes() {
    this.stateData.forEach(state => {
      // Increment based on risk level and population
      let increment = 0;
      switch (state.riskLevel) {
        case 'Critical':
          increment = Math.floor(Math.random() * 3) + 1; // 1-3 crimes
          break;
        case 'High':
          increment = Math.floor(Math.random() * 2) + 1; // 1-2 crimes
          break;
        case 'Medium':
          increment = Math.random() > 0.5 ? 1 : 0; // 0-1 crimes
          break;
        case 'Low':
          increment = Math.random() > 0.7 ? 1 : 0; // Less frequent
          break;
      }

      state.liveCyberCrimes += increment;
      state.liveCrimesThisWeek += increment;
      state.liveCrimesThisMonth += increment;
      state.lastUpdated = new Date().toLocaleString();
    });
  }

  // Get all states data
  getAllStatesData(): StateDetailedData[] {
    return [...this.stateData];
  }

  // Get specific state data
  getStateData(stateCode: string): StateDetailedData | undefined {
    return this.stateData.find(state => state.stateCode === stateCode);
  }

  // Get live crime statistics
  getLiveCrimeStats() {
    const totalCrimes = this.stateData.reduce((sum, state) => sum + state.liveCyberCrimes, 0);
    const weeklyIncrease = this.stateData.reduce((sum, state) => sum + state.liveCrimesThisWeek, 0);
    const mostActiveState = this.stateData.reduce((max, state) => 
      state.liveCrimesThisWeek > max.liveCrimesThisWeek ? state : max
    );

    return {
      totalCrimes,
      weeklyIncrease,
      mostActiveState: mostActiveState.stateName,
      lastUpdated: new Date().toLocaleString()
    };
  }

  // Get safety ratings summary
  getSafetyRatings() {
    const avgOverallSafety = this.stateData.reduce((sum, state) => sum + state.overallSafetyRating, 0) / this.stateData.length;
    const avgWomenSafety = this.stateData.reduce((sum, state) => sum + state.womenSafetyRating, 0) / this.stateData.length;
    const safestState = this.stateData.reduce((max, state) => 
      state.overallSafetyRating > max.overallSafetyRating ? state : max
    );

    return {
      avgOverallSafety: Number(avgOverallSafety.toFixed(1)),
      avgWomenSafety: Number(avgWomenSafety.toFixed(1)),
      safestState: safestState.stateName,
      safestStateRating: safestState.overallSafetyRating
    };
  }

  // Get trending scams across all states
  getAllTrendingScams(): TrendingScam[] {
    const allScams: TrendingScam[] = [];
    this.stateData.forEach(state => {
      allScams.push(...state.trendingScams);
    });
    
    // Sort by reported cases and return top 10
    return allScams
      .sort((a, b) => b.reportedCases - a.reportedCases)
      .slice(0, 10);
  }

  // Stop live updates (cleanup)
  stopLiveCrimeSimulation() {
    if (this.liveCrimeUpdateInterval) {
      clearInterval(this.liveCrimeUpdateInterval);
      this.liveCrimeUpdateInterval = null;
    }
  }
}

export default EnhancedScamDataService;
