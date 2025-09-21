export interface ScamData {
  stateCode: string;
  stateName: string;
  totalCases: number;
  financialFraud: number;
  onlineFraud: number;
  identityTheft: number;
  phishing: number;
  dataTheft: number;
  socialEngineering: number;
  totalLoss: number; // in crores
  populationRatio: number; // cases per 100k population
  riskLevel: 'Low' | 'Medium' | 'High' | 'Critical';
  trendDirection: 'up' | 'down' | 'stable';
  lastUpdated: string;
}

// Mock data for Indian states cyber fraud statistics
export const mockScamData: ScamData[] = [
  {
    stateCode: 'MH',
    stateName: 'Maharashtra',
    totalCases: 15420,
    financialFraud: 4200,
    onlineFraud: 3800,
    identityTheft: 2300,
    phishing: 2900,
    dataTheft: 1520,
    socialEngineering: 700,
    totalLoss: 892.5,
    populationRatio: 13.7,
    riskLevel: 'High',
    trendDirection: 'up',
    lastUpdated: '2024-09-20'
  },
  {
    stateCode: 'DL',
    stateName: 'Delhi',
    totalCases: 8900,
    financialFraud: 3100,
    onlineFraud: 2700,
    identityTheft: 1200,
    phishing: 1300,
    dataTheft: 400,
    socialEngineering: 200,
    totalLoss: 567.8,
    populationRatio: 53.0,
    riskLevel: 'Critical',
    trendDirection: 'up',
    lastUpdated: '2024-09-20'
  },
  {
    stateCode: 'KA',
    stateName: 'Karnataka',
    totalCases: 12800,
    financialFraud: 4500,
    onlineFraud: 3200,
    identityTheft: 2100,
    phishing: 2000,
    dataTheft: 800,
    socialEngineering: 200,
    totalLoss: 734.2,
    populationRatio: 20.9,
    riskLevel: 'High',
    trendDirection: 'up',
    lastUpdated: '2024-09-20'
  },
  {
    stateCode: 'UP',
    stateName: 'Uttar Pradesh',
    totalCases: 11200,
    financialFraud: 3800,
    onlineFraud: 2900,
    identityTheft: 2000,
    phishing: 1800,
    dataTheft: 500,
    socialEngineering: 200,
    totalLoss: 445.6,
    populationRatio: 5.6,
    riskLevel: 'Medium',
    trendDirection: 'stable',
    lastUpdated: '2024-09-20'
  },
  {
    stateCode: 'TN',
    stateName: 'Tamil Nadu',
    totalCases: 9800,
    financialFraud: 3200,
    onlineFraud: 2800,
    identityTheft: 1600,
    phishing: 1500,
    dataTheft: 500,
    socialEngineering: 200,
    totalLoss: 523.4,
    populationRatio: 13.6,
    riskLevel: 'High',
    trendDirection: 'up',
    lastUpdated: '2024-09-20'
  },
  {
    stateCode: 'GJ',
    stateName: 'Gujarat',
    totalCases: 7600,
    financialFraud: 2800,
    onlineFraud: 2100,
    identityTheft: 1200,
    phishing: 1000,
    dataTheft: 400,
    socialEngineering: 100,
    totalLoss: 412.3,
    populationRatio: 12.6,
    riskLevel: 'Medium',
    trendDirection: 'down',
    lastUpdated: '2024-09-20'
  },
  {
    stateCode: 'RJ',
    stateName: 'Rajasthan',
    totalCases: 5400,
    financialFraud: 1900,
    onlineFraud: 1600,
    identityTheft: 800,
    phishing: 700,
    dataTheft: 300,
    socialEngineering: 100,
    totalLoss: 234.7,
    populationRatio: 7.9,
    riskLevel: 'Medium',
    trendDirection: 'stable',
    lastUpdated: '2024-09-20'
  },
  {
    stateCode: 'WB',
    stateName: 'West Bengal',
    totalCases: 6200,
    financialFraud: 2100,
    onlineFraud: 1800,
    identityTheft: 1000,
    phishing: 900,
    dataTheft: 300,
    socialEngineering: 100,
    totalLoss: 287.5,
    populationRatio: 6.8,
    riskLevel: 'Medium',
    trendDirection: 'up',
    lastUpdated: '2024-09-20'
  },
  {
    stateCode: 'TG',
    stateName: 'Telangana',
    totalCases: 8900,
    financialFraud: 3400,
    onlineFraud: 2600,
    identityTheft: 1500,
    phishing: 1000,
    dataTheft: 300,
    socialEngineering: 100,
    totalLoss: 456.8,
    populationRatio: 25.4,
    riskLevel: 'High',
    trendDirection: 'up',
    lastUpdated: '2024-09-20'
  },
  {
    stateCode: 'AP',
    stateName: 'Andhra Pradesh',
    totalCases: 4800,
    financialFraud: 1700,
    onlineFraud: 1400,
    identityTheft: 700,
    phishing: 600,
    dataTheft: 300,
    socialEngineering: 100,
    totalLoss: 198.4,
    populationRatio: 9.7,
    riskLevel: 'Medium',
    trendDirection: 'stable',
    lastUpdated: '2024-09-20'
  },
  {
    stateCode: 'KL',
    stateName: 'Kerala',
    totalCases: 3600,
    financialFraud: 1300,
    onlineFraud: 1100,
    identityTheft: 500,
    phishing: 400,
    dataTheft: 200,
    socialEngineering: 100,
    totalLoss: 167.8,
    populationRatio: 10.8,
    riskLevel: 'Medium',
    trendDirection: 'down',
    lastUpdated: '2024-09-20'
  },
  {
    stateCode: 'MP',
    stateName: 'Madhya Pradesh',
    totalCases: 3200,
    financialFraud: 1200,
    onlineFraud: 900,
    identityTheft: 500,
    phishing: 400,
    dataTheft: 150,
    socialEngineering: 50,
    totalLoss: 134.6,
    populationRatio: 4.4,
    riskLevel: 'Low',
    trendDirection: 'stable',
    lastUpdated: '2024-09-20'
  },
  {
    stateCode: 'HR',
    stateName: 'Haryana',
    totalCases: 4200,
    financialFraud: 1600,
    onlineFraud: 1200,
    identityTheft: 700,
    phishing: 500,
    dataTheft: 150,
    socialEngineering: 50,
    totalLoss: 223.4,
    populationRatio: 16.6,
    riskLevel: 'Medium',
    trendDirection: 'up',
    lastUpdated: '2024-09-20'
  },
  {
    stateCode: 'PB',
    stateName: 'Punjab',
    totalCases: 2800,
    financialFraud: 1100,
    onlineFraud: 800,
    identityTheft: 400,
    phishing: 300,
    dataTheft: 150,
    socialEngineering: 50,
    totalLoss: 145.7,
    populationRatio: 10.1,
    riskLevel: 'Medium',
    trendDirection: 'stable',
    lastUpdated: '2024-09-20'
  },
  {
    stateCode: 'BR',
    stateName: 'Bihar',
    totalCases: 1800,
    financialFraud: 700,
    onlineFraud: 500,
    identityTheft: 300,
    phishing: 200,
    dataTheft: 80,
    socialEngineering: 20,
    totalLoss: 67.5,
    populationRatio: 1.7,
    riskLevel: 'Low',
    trendDirection: 'stable',
    lastUpdated: '2024-09-20'
  },
  {
    stateCode: 'OR',
    stateName: 'Odisha',
    totalCases: 1600,
    financialFraud: 600,
    onlineFraud: 450,
    identityTheft: 250,
    phishing: 200,
    dataTheft: 80,
    socialEngineering: 20,
    totalLoss: 56.3,
    populationRatio: 3.8,
    riskLevel: 'Low',
    trendDirection: 'up',
    lastUpdated: '2024-09-20'
  },
  {
    stateCode: 'JH',
    stateName: 'Jharkhand',
    totalCases: 1200,
    financialFraud: 450,
    onlineFraud: 350,
    identityTheft: 200,
    phishing: 150,
    dataTheft: 40,
    socialEngineering: 10,
    totalLoss: 43.2,
    populationRatio: 3.6,
    riskLevel: 'Low',
    trendDirection: 'stable',
    lastUpdated: '2024-09-20'
  },
  {
    stateCode: 'AS',
    stateName: 'Assam',
    totalCases: 900,
    financialFraud: 350,
    onlineFraud: 250,
    identityTheft: 150,
    phishing: 100,
    dataTheft: 40,
    socialEngineering: 10,
    totalLoss: 32.1,
    populationRatio: 2.9,
    riskLevel: 'Low',
    trendDirection: 'up',
    lastUpdated: '2024-09-20'
  },
  {
    stateCode: 'CG',
    stateName: 'Chhattisgarh',
    totalCases: 800,
    financialFraud: 300,
    onlineFraud: 220,
    identityTheft: 130,
    phishing: 100,
    dataTheft: 40,
    socialEngineering: 10,
    totalLoss: 28.7,
    populationRatio: 3.1,
    riskLevel: 'Low',
    trendDirection: 'stable',
    lastUpdated: '2024-09-20'
  },
  {
    stateCode: 'UK',
    stateName: 'Uttarakhand',
    totalCases: 1100,
    financialFraud: 420,
    onlineFraud: 310,
    identityTheft: 180,
    phishing: 130,
    dataTheft: 50,
    socialEngineering: 10,
    totalLoss: 48.9,
    populationRatio: 10.9,
    riskLevel: 'Medium',
    trendDirection: 'up',
    lastUpdated: '2024-09-20'
  },
  {
    stateCode: 'HP',
    stateName: 'Himachal Pradesh',
    totalCases: 600,
    financialFraud: 230,
    onlineFraud: 170,
    identityTheft: 100,
    phishing: 70,
    dataTheft: 25,
    socialEngineering: 5,
    totalLoss: 23.4,
    populationRatio: 8.7,
    riskLevel: 'Low',
    trendDirection: 'stable',
    lastUpdated: '2024-09-20'
  },
  {
    stateCode: 'JK',
    stateName: 'Jammu and Kashmir',
    totalCases: 700,
    financialFraud: 270,
    onlineFraud: 200,
    identityTheft: 120,
    phishing: 80,
    dataTheft: 25,
    socialEngineering: 5,
    totalLoss: 29.1,
    populationRatio: 5.7,
    riskLevel: 'Low',
    trendDirection: 'up',
    lastUpdated: '2024-09-20'
  },
  {
    stateCode: 'GA',
    stateName: 'Goa',
    totalCases: 400,
    financialFraud: 150,
    onlineFraud: 120,
    identityTheft: 70,
    phishing: 40,
    dataTheft: 15,
    socialEngineering: 5,
    totalLoss: 18.9,
    populationRatio: 27.4,
    riskLevel: 'High',
    trendDirection: 'up',
    lastUpdated: '2024-09-20'
  },
  {
    stateCode: 'TR',
    stateName: 'Tripura',
    totalCases: 120,
    financialFraud: 50,
    onlineFraud: 35,
    identityTheft: 20,
    phishing: 12,
    dataTheft: 2,
    socialEngineering: 1,
    totalLoss: 4.2,
    populationRatio: 3.3,
    riskLevel: 'Low',
    trendDirection: 'stable',
    lastUpdated: '2024-09-20'
  },
  {
    stateCode: 'ML',
    stateName: 'Meghalaya',
    totalCases: 80,
    financialFraud: 35,
    onlineFraud: 25,
    identityTheft: 12,
    phishing: 6,
    dataTheft: 1,
    socialEngineering: 1,
    totalLoss: 2.8,
    populationRatio: 2.7,
    riskLevel: 'Low',
    trendDirection: 'stable',
    lastUpdated: '2024-09-20'
  },
  {
    stateCode: 'MN',
    stateName: 'Manipur',
    totalCases: 90,
    financialFraud: 40,
    onlineFraud: 28,
    identityTheft: 14,
    phishing: 6,
    dataTheft: 1,
    socialEngineering: 1,
    totalLoss: 3.1,
    populationRatio: 3.5,
    riskLevel: 'Low',
    trendDirection: 'up',
    lastUpdated: '2024-09-20'
  },
  {
    stateCode: 'NL',
    stateName: 'Nagaland',
    totalCases: 65,
    financialFraud: 28,
    onlineFraud: 20,
    identityTheft: 10,
    phishing: 5,
    dataTheft: 1,
    socialEngineering: 1,
    totalLoss: 2.2,
    populationRatio: 3.3,
    riskLevel: 'Low',
    trendDirection: 'stable',
    lastUpdated: '2024-09-20'
  },
  {
    stateCode: 'AR',
    stateName: 'Arunachal Pradesh',
    totalCases: 45,
    financialFraud: 20,
    onlineFraud: 15,
    identityTheft: 6,
    phishing: 3,
    dataTheft: 1,
    socialEngineering: 0,
    totalLoss: 1.5,
    populationRatio: 3.3,
    riskLevel: 'Low',
    trendDirection: 'stable',
    lastUpdated: '2024-09-20'
  },
  {
    stateCode: 'MZ',
    stateName: 'Mizoram',
    totalCases: 35,
    financialFraud: 15,
    onlineFraud: 12,
    identityTheft: 5,
    phishing: 2,
    dataTheft: 1,
    socialEngineering: 0,
    totalLoss: 1.2,
    populationRatio: 3.2,
    riskLevel: 'Low',
    trendDirection: 'stable',
    lastUpdated: '2024-09-20'
  },
  {
    stateCode: 'SK',
    stateName: 'Sikkim',
    totalCases: 25,
    financialFraud: 12,
    onlineFraud: 8,
    identityTheft: 3,
    phishing: 1,
    dataTheft: 1,
    socialEngineering: 0,
    totalLoss: 0.8,
    populationRatio: 4.1,
    riskLevel: 'Low',
    trendDirection: 'stable',
    lastUpdated: '2024-09-20'
  }
];

// Helper function to get color based on risk level
export const getRiskColor = (riskLevel: string): string => {
  switch (riskLevel) {
    case 'Low': return '#10B981'; // Green
    case 'Medium': return '#F59E0B'; // Amber
    case 'High': return '#EF4444'; // Red
    case 'Critical': return '#7C2D12'; // Dark red
    default: return '#6B7280'; // Gray
  }
};

// Helper function to get scam data by state code
export const getScamDataByState = (stateCode: string): ScamData | undefined => {
  return mockScamData.find(data => data.stateCode === stateCode);
};

// Function to get aggregated statistics
export const getAggregatedStats = () => {
  const totals = mockScamData.reduce((acc, curr) => ({
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

  return totals;
};

// Function to get top 10 states by cyber fraud cases
export const getTopStates = (limit: number = 10) => {
  return [...mockScamData]
    .sort((a, b) => b.totalCases - a.totalCases)
    .slice(0, limit);
};

// Function to get states by risk level
export const getStatesByRiskLevel = (riskLevel: string) => {
  return mockScamData.filter(data => data.riskLevel === riskLevel);
};
