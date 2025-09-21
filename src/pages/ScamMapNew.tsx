import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  AlertTriangle, 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  Shield, 
  DollarSign,
  Users,
  Map,
  BarChart3,
  Filter,
  Info,
  RefreshCw,
  MapPin,
  Activity,
  Eye
} from 'lucide-react';

import { 
  getRiskColor,
  type ScamData 
} from '@/services/scamDataService';
import { useRealScamData } from '@/hooks/useRealScamData';
import {
  FraudTypesChart,
  TopStatesChart,
  RiskLevelSummary,
  TrendAnalysis,
  KeyMetrics
} from '@/components/ScamMap/Analytics';
import DataSources from '@/components/ScamMap/DataSources';

// State code to name mapping for India
const stateCodeToName: Record<string, string> = {
  'IN-AP': 'Andhra Pradesh',
  'IN-AR': 'Arunachal Pradesh',
  'IN-AS': 'Assam',
  'IN-BR': 'Bihar',
  'IN-CT': 'Chhattisgarh',
  'IN-DL': 'Delhi',
  'IN-GA': 'Goa',
  'IN-GJ': 'Gujarat',
  'IN-HR': 'Haryana',
  'IN-HP': 'Himachal Pradesh',
  'IN-JH': 'Jharkhand',
  'IN-KA': 'Karnataka',
  'IN-KL': 'Kerala',
  'IN-MP': 'Madhya Pradesh',
  'IN-MH': 'Maharashtra',
  'IN-MN': 'Manipur',
  'IN-ML': 'Meghalaya',
  'IN-MZ': 'Mizoram',
  'IN-NL': 'Nagaland',
  'IN-OR': 'Odisha',
  'IN-PB': 'Punjab',
  'IN-RJ': 'Rajasthan',
  'IN-SK': 'Sikkim',
  'IN-TN': 'Tamil Nadu',
  'IN-TG': 'Telangana',
  'IN-TR': 'Tripura',
  'IN-UP': 'Uttar Pradesh',
  'IN-UT': 'Uttarakhand',
  'IN-WB': 'West Bengal',
  'IN-JK': 'Jammu and Kashmir',
  'IN-LA': 'Ladakh'
};

// Interactive India SVG Map Component
const IndiaMapSVG: React.FC<{
  selectedState: ScamData | null;
  setSelectedState: (state: ScamData | null) => void;
  scamData: ScamData[] | null;
  hoveredState: ScamData | null;
  setHoveredState: (state: ScamData | null) => void;
}> = ({ selectedState, setSelectedState, scamData, hoveredState, setHoveredState }) => {
  const [mapSvg, setMapSvg] = useState<string>('');
  
  useEffect(() => {
    // Fetch India map SVG from external API
    const fetchIndiaMap = async () => {
      try {
        // Using a more detailed India SVG map
        const svgContent = `
<svg viewBox="0 0 1000 600" xmlns="http://www.w3.org/2000/svg">
  <!-- Jammu and Kashmir -->
  <path id="JK" d="M250 50 L350 45 L380 60 L400 80 L420 100 L400 120 L370 110 L340 105 L310 95 L280 85 L250 70 Z" />
  
  <!-- Himachal Pradesh -->
  <path id="HP" d="M350 105 L420 100 L450 120 L430 140 L400 135 L370 130 L350 125 Z" />
  
  <!-- Punjab -->
  <path id="PB" d="M320 125 L370 120 L400 135 L390 155 L360 150 L330 145 Z" />
  
  <!-- Haryana -->
  <path id="HR" d="M370 130 L430 125 L450 145 L440 165 L410 160 L380 155 Z" />
  
  <!-- Delhi -->
  <path id="DL" d="M410 155 L430 150 L440 165 L425 170 L415 165 Z" />
  
  <!-- Uttarakhand -->
  <path id="UK" d="M450 120 L500 115 L520 135 L505 155 L480 150 L455 145 Z" />
  
  <!-- Uttar Pradesh -->
  <path id="UP" d="M380 155 L540 150 L580 170 L575 220 L550 230 L500 225 L450 220 L400 210 L375 180 Z" />
  
  <!-- Rajasthan -->
  <path id="RJ" d="M200 180 L370 175 L400 200 L380 280 L350 320 L300 340 L250 330 L200 300 L180 250 Z" />
  
  <!-- Bihar -->
  <path id="BR" d="M575 190 L650 185 L680 210 L670 240 L640 245 L600 240 L580 220 Z" />
  
  <!-- West Bengal -->
  <path id="WB" d="M640 210 L720 205 L750 240 L760 280 L740 320 L710 330 L680 320 L650 300 L640 260 Z" />
  
  <!-- Sikkim -->
  <path id="SK" d="M680 190 L695 185 L700 195 L690 205 L680 200 Z" />
  
  <!-- Assam -->
  <path id="AS" d="M720 180 L820 175 L850 200 L840 230 L810 240 L780 235 L750 225 L730 210 Z" />
  
  <!-- Arunachal Pradesh -->
  <path id="AR" d="M780 150 L880 145 L920 170 L900 200 L860 195 L830 185 L800 175 Z" />
  
  <!-- Nagaland -->
  <path id="NL" d="M820 200 L860 195 L880 220 L865 240 L840 235 Z" />
  
  <!-- Manipur -->
  <path id="MN" d="M840 240 L865 235 L875 255 L860 270 L845 265 Z" />
  
  <!-- Mizoram -->
  <path id="MZ" d="M845 270 L865 265 L875 285 L860 300 L845 295 Z" />
  
  <!-- Tripura -->
  <path id="TR" d="M760 280 L780 275 L790 295 L775 310 L760 305 Z" />
  
  <!-- Meghalaya -->
  <path id="ML" d="M740 240 L780 235 L790 255 L775 270 L750 265 Z" />
  
  <!-- Jharkhand -->
  <path id="JH" d="M575 240 L640 235 L650 270 L630 290 L600 285 L580 270 Z" />
  
  <!-- Odisha -->
  <path id="OR" d="M600 285 L650 280 L680 310 L670 350 L640 360 L610 350 L590 330 Z" />
  
  <!-- Chhattisgarh -->
  <path id="CG" d="M500 280 L590 275 L610 310 L590 350 L560 360 L530 350 L510 320 Z" />
  
  <!-- Madhya Pradesh -->
  <path id="MP" d="M350 240 L520 235 L540 280 L520 320 L480 340 L440 345 L400 340 L360 320 L340 280 Z" />
  
  <!-- Gujarat -->
  <path id="GJ" d="M180 300 L340 295 L360 340 L340 400 L300 420 L250 410 L200 390 L160 360 L150 330 Z" />
  
  <!-- Maharashtra -->
  <path id="MH" d="M340 340 L520 335 L540 380 L520 440 L480 460 L440 465 L400 460 L360 440 L340 400 Z" />
  
  <!-- Telangana -->
  <path id="TG" d="M520 360 L580 355 L600 390 L580 420 L540 425 L520 400 Z" />
  
  <!-- Andhra Pradesh -->
  <path id="AP" d="M540 425 L600 420 L620 460 L610 520 L580 540 L550 535 L530 500 Z" />
  
  <!-- Karnataka -->
  <path id="KA" d="M440 460 L540 455 L560 500 L540 550 L500 570 L460 565 L430 540 L420 500 Z" />
  
  <!-- Goa -->
  <path id="GA" d="M380 480 L420 475 L430 495 L415 510 L395 505 L385 490 Z" />
  
  <!-- Kerala -->
  <path id="KL" d="M420 540 L460 535 L470 560 L460 590 L440 600 L420 595 L410 570 Z" />
  
  <!-- Tamil Nadu -->
  <path id="TN" d="M460 535 L580 530 L600 570 L580 610 L540 620 L500 615 L470 595 L460 560 Z" />
</svg>`;
        setMapSvg(svgContent);
      } catch (error) {
        console.error('Failed to fetch India map:', error);
        setMapSvg(''); // Fallback to empty
      }
    };
    
    fetchIndiaMap();
  }, []);

  const getStateData = (stateCode: string): ScamData | null => {
    if (!scamData) return null;
    return scamData.find(data => data.stateCode === stateCode) || null;
  };

  const handleStateClick = (stateCode: string) => {
    const stateData = getStateData(stateCode);
    setSelectedState(stateData);
  };

  const handleStateHover = (stateCode: string) => {
    const stateData = getStateData(stateCode);
    setHoveredState(stateData);
  };

  const getStateFill = (stateCode: string): string => {
    const stateData = getStateData(stateCode);
    if (!stateData) return '#e2e8f0';
    
    const riskColor = getRiskColor(stateData.riskLevel);
    return hoveredState?.stateCode === stateCode ? riskColor : 'transparent';
  };

  const getStateStroke = (stateCode: string): string => {
    const stateData = getStateData(stateCode);
    if (!stateData) return '#64748b';
    
    if (selectedState?.stateCode === stateCode) return '#1e40af';
    if (hoveredState?.stateCode === stateCode) return getRiskColor(stateData.riskLevel);
    return '#64748b';
  };

  const getStateStrokeWidth = (stateCode: string): number => {
    if (selectedState?.stateCode === stateCode) return 3;
    if (hoveredState?.stateCode === stateCode) return 2.5;
    return 1.5;
  };

  if (!mapSvg) {
    return (
      <div className="w-full h-[500px] flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50 rounded-lg">
        <div className="text-center space-y-4">
          <RefreshCw className="h-8 w-8 animate-spin text-blue-600 mx-auto" />
          <p className="text-slate-600">Loading India Map...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-[500px] bg-gradient-to-br from-blue-50 via-white to-indigo-50 rounded-lg overflow-hidden">
      <svg
        viewBox="0 0 1000 600"
        className="w-full h-full"
        style={{ filter: 'drop-shadow(0 4px 6px rgba(0, 0, 0, 0.1))' }}
      >
        {/* Render all states */}
        {Object.keys(stateCodeToName).map(fullCode => {
          const stateCode = fullCode.replace('IN-', '');
          
          // Extract path data from SVG content
          const pathRegex = new RegExp(`<path id="${stateCode}" d="([^"]+)"`, 'i');
          const pathMatch = mapSvg.match(pathRegex);
          const pathData = pathMatch ? pathMatch[1] : '';
          
          if (!pathData) return null;
          
          return (
            <g key={stateCode}>
              <path
                d={pathData}
                fill={getStateFill(stateCode)}
                fillOpacity={hoveredState?.stateCode === stateCode ? 0.3 : 0}
                stroke={getStateStroke(stateCode)}
                strokeWidth={getStateStrokeWidth(stateCode)}
                className="cursor-pointer transition-all duration-200 hover:drop-shadow-lg"
                onClick={() => handleStateClick(stateCode)}
                onMouseEnter={() => handleStateHover(stateCode)}
                onMouseLeave={() => setHoveredState(null)}
              />
            </g>
          );
        }).filter(Boolean)}
      </svg>
      
      {/* Hover Tooltip */}
      {hoveredState && (
        <div className="absolute top-4 right-4 z-10 pointer-events-none">
          <Card className="bg-white/95 backdrop-blur-sm shadow-xl border-0 min-w-[280px]">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <MapPin className="h-4 w-4 text-blue-600" />
                {hoveredState.stateName}
                <Badge className={`ml-auto ${
                  hoveredState.riskLevel === 'Critical' ? 'bg-red-500' :
                  hoveredState.riskLevel === 'High' ? 'bg-orange-500' :
                  hoveredState.riskLevel === 'Medium' ? 'bg-yellow-500' :
                  'bg-green-500'
                } text-white`}>
                  {hoveredState.riskLevel}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Total Cases:</span>
                    <span className="font-semibold">{hoveredState.totalCases.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Per 100k:</span>
                    <span className="font-semibold">{hoveredState.populationRatio}</span>
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Financial:</span>
                    <span className="font-semibold">{hoveredState.financialFraud.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Online:</span>
                    <span className="font-semibold">{hoveredState.onlineFraud.toLocaleString()}</span>
                  </div>
                </div>
              </div>
              <div className="pt-2 border-t">
                <div className="flex justify-between items-center">
                  <span className="text-slate-600 text-sm">Total Loss:</span>
                  <span className="font-bold text-red-600">₹{hoveredState.totalLoss} Cr</span>
                </div>
              </div>
              <div className="text-center pt-2 border-t">
                <p className="text-xs text-slate-500">Click for detailed analysis</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

const ScamMap = () => {
  const [selectedState, setSelectedState] = useState<ScamData | null>(null);
  const [hoveredState, setHoveredState] = useState<ScamData | null>(null);
  const [filterRiskLevel, setFilterRiskLevel] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'heatmap' | 'cases'>('heatmap');

  // Use real data with fallback to mock data
  const {
    data: scamData,
    aggregatedStats,
    topStates,
    loading,
    error,
    source,
    lastUpdated,
    healthStatus,
    refreshData,
    getStateData,
    isUsingRealData,
    isUsingMockData
  } = useRealScamData({
    topStatesLimit: 5,
    onError: (error) => console.error('Data fetch error:', error),
    onSuccess: (data) => console.log(`Successfully loaded ${data.length} states data`)
  });

  const getTrendIcon = (direction: string) => {
    switch (direction) {
      case 'up': return <TrendingUp className="h-4 w-4 text-red-500" />;
      case 'down': return <TrendingDown className="h-4 w-4 text-green-500" />;
      default: return <Minus className="h-4 w-4 text-gray-500" />;
    }
  };

  // Show loading state
  if (loading && !scamData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin h-12 w-12 border-4 border-blue-600 rounded-full border-t-transparent mx-auto"></div>
          <h2 className="text-xl font-semibold text-gray-800">Loading India Cyber Crime Map...</h2>
          <p className="text-gray-600">Initializing real cyber crime data with live updates</p>
        </div>
      </div>
    );
  }

  // Show error state if no data and error
  if (error && !scamData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6 flex items-center justify-center">
        <div className="text-center space-y-4 max-w-md">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto" />
          <h2 className="text-xl font-semibold text-gray-800">Failed to Load Data</h2>
          <p className="text-gray-600">{error}</p>
          <Button onClick={refreshData}>Try Again</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 bg-gradient-to-br from-red-500 to-orange-500 rounded-xl shadow-lg transform hover:scale-105 transition-transform duration-200">
              <Map className="h-10 w-10 text-white" />
            </div>
            <div>
              <h1 className="text-5xl font-bold bg-gradient-to-r from-gray-900 via-red-600 to-orange-600 bg-clip-text text-transparent">
                India Cyber Crime Intelligence
              </h1>
              <p className="text-lg text-gray-700 mt-2 font-medium flex items-center gap-2">
                <Activity className="h-5 w-5 text-blue-600" />
                Interactive real-time visualization of cyber fraud incidents across Indian states
              </p>
            </div>
          </div>

          {/* Data Source and Status Indicator */}
          <div className="mb-6 p-4 bg-white/60 backdrop-blur-sm border border-white/20 rounded-xl shadow-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0 px-4 py-2 text-sm font-semibold shadow-lg">
                  📊 Real India Data + Live Updates
                </Badge>
                {lastUpdated && (
                  <span className="text-sm text-gray-600 bg-white/50 px-3 py-1 rounded-lg">
                    ⏰ Updated: {lastUpdated.toLocaleTimeString()}
                  </span>
                )}
                {loading && (
                  <div className="flex items-center gap-2 text-sm text-blue-600 bg-blue-50/50 px-3 py-1 rounded-lg">
                    <div className="animate-spin h-4 w-4 border-2 border-blue-600 rounded-full border-t-transparent"></div>
                    Refreshing...
                  </div>
                )}
            </div>
              <div className="flex gap-3">
                <Button 
                  className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white border-0 shadow-lg transform hover:scale-105 transition-all duration-200" 
                  size="sm" 
                  onClick={refreshData}
                  disabled={loading}
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh Data
                </Button>
                <Badge className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white border-0 px-3 py-1 shadow-lg">
                  📍 Interactive Map
                </Badge>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          {aggregatedStats ? (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card className="bg-gradient-to-br from-red-50 to-orange-50 border-red-200 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-gradient-to-br from-red-500 to-orange-500 rounded-xl">
                      <AlertTriangle className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700">Total Cases</p>
                      <p className="text-3xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
                        {aggregatedStats.totalCases.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl">
                      <DollarSign className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700">Total Loss</p>
                      <p className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                        ₹{aggregatedStats.totalLoss.toFixed(0)} Cr
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-br from-blue-50 to-sky-50 border-blue-200 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-gradient-to-br from-blue-500 to-sky-500 rounded-xl">
                      <Shield className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700">Financial Fraud</p>
                      <p className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-sky-600 bg-clip-text text-transparent">
                        {aggregatedStats.financialFraud.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-br from-purple-50 to-violet-50 border-purple-200 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-gradient-to-br from-purple-500 to-violet-500 rounded-xl">
                      <Users className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700">Online Fraud</p>
                      <p className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-violet-600 bg-clip-text text-transparent">
                        {aggregatedStats.onlineFraud.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <Card key={i} className="bg-gradient-to-br from-gray-50 to-gray-100 border-gray-200">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-gray-200 rounded-xl animate-pulse">
                        <div className="h-6 w-6 bg-gray-300 rounded animate-pulse" />
                      </div>
                      <div>
                        <div className="h-4 w-20 bg-gray-200 rounded animate-pulse mb-3" />
                        <div className="h-8 w-24 bg-gray-300 rounded animate-pulse" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Main Map Section */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Interactive Map */}
          <div className="lg:col-span-3">
            <Card className="bg-white/70 backdrop-blur-sm border border-white/20 shadow-xl">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-t-lg">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-lg font-bold">
                    <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg">
                      <Eye className="h-5 w-5 text-white" />
                    </div>
                    🇮🇳 Interactive India Cyber Crime Map
                  </CardTitle>
                  <div className="flex gap-2">
                    <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-3 py-1">
                      <Activity className="h-3 w-3 mr-1" />
                      Live Data
                    </Badge>
                  </div>
                </div>
                <CardDescription>
                  Hover over states for instant statistics • Click for detailed analysis • Real-time cyber fraud intelligence
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <IndiaMapSVG 
                  selectedState={selectedState}
                  setSelectedState={setSelectedState}
                  scamData={scamData}
                  hoveredState={hoveredState}
                  setHoveredState={setHoveredState}
                />
                
                {/* Legend */}
                <div className="m-4 p-4 bg-gradient-to-r from-slate-50 via-white to-slate-50 rounded-xl border border-slate-200 shadow-sm">
                  <h4 className="font-semibold mb-3 text-slate-700 flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-500" />
                    Risk Level Color Coding
                  </h4>
                  <div className="flex flex-wrap gap-4">
                    {[
                      { level: 'Low', color: '#10B981', gradient: 'from-green-400 to-green-600' },
                      { level: 'Medium', color: '#F59E0B', gradient: 'from-yellow-400 to-yellow-600' },
                      { level: 'High', color: '#EF4444', gradient: 'from-red-400 to-red-600' },
                      { level: 'Critical', color: '#7C2D12', gradient: 'from-red-700 to-red-900' }
                    ].map(({ level, color, gradient }) => (
                      <div key={level} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/50 backdrop-blur-sm border border-white/30">
                        <div 
                          className={`w-4 h-4 rounded-full shadow-sm bg-gradient-to-br ${gradient}`}
                          style={{ backgroundColor: color }}
                        />
                        <span className="text-sm font-medium text-slate-600">{level} Risk</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 pt-3 border-t border-slate-200">
                    <div className="text-xs text-slate-500 flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      Hover to see instant data • Click states for detailed insights • Border colors indicate risk levels
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Selected State Details */}
            {selectedState && (
              <Card className="bg-gradient-to-br from-white via-slate-50 to-white border border-slate-200 shadow-lg hover:shadow-xl transition-all duration-300">
                <CardHeader className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 rounded-t-lg">
                  <CardTitle className="flex items-center justify-between text-lg">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 animate-pulse" />
                      {selectedState.stateName}
                    </div>
                    <Badge 
                      className={`${selectedState.riskLevel === 'Critical' ? 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg' : 
                                  selectedState.riskLevel === 'High' ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg' : 
                                  selectedState.riskLevel === 'Medium' ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white shadow-lg' :
                                  'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg'} font-medium px-3 py-1`}
                    >
                      {selectedState.riskLevel}
                    </Badge>
                  </CardTitle>
                  <CardDescription>
                    Last updated: {selectedState.lastUpdated}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-5 p-6">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-slate-600 font-medium">Total Cases</span>
                      <span className="font-bold text-slate-800 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">{selectedState.totalCases.toLocaleString()}</span>
                    </div>
                    <div className="relative">
                      <Progress 
                        value={Math.min(100, (selectedState.totalCases / 20000) * 100)} 
                        className="h-3 bg-slate-200 overflow-hidden rounded-full"
                      />
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full opacity-20" />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-slate-600 font-medium">Per 100k Population</span>
                      <span className="font-bold text-slate-800 bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">{selectedState.populationRatio}</span>
                    </div>
                    <div className="relative">
                      <Progress 
                        value={Math.min(100, (selectedState.populationRatio / 60) * 100)} 
                        className="h-3 bg-slate-200 overflow-hidden rounded-full"
                      />
                      <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full opacity-20" />
                    </div>
                  </div>

                  <div className="space-y-3 p-4 bg-gradient-to-br from-slate-50 to-white rounded-xl border border-slate-100">
                    <h4 className="font-semibold text-sm text-slate-700 flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500" />
                      Fraud Types Breakdown
                    </h4>
                    <div className="space-y-2">
                      {[
                        { name: 'Financial', value: selectedState.financialFraud, icon: '💳', gradient: 'from-blue-500 to-cyan-500' },
                        { name: 'Online', value: selectedState.onlineFraud, icon: '🌐', gradient: 'from-green-500 to-emerald-500' },
                        { name: 'Identity Theft', value: selectedState.identityTheft, icon: '🆔', gradient: 'from-purple-500 to-pink-500' },
                        { name: 'Phishing', value: selectedState.phishing, icon: '🎣', gradient: 'from-orange-500 to-red-500' },
                      ].map(({ name, value, icon, gradient }) => (
                        <div key={name} className="flex justify-between items-center p-2 rounded-lg bg-white/70 border border-white/50 hover:bg-white/90 transition-all duration-200">
                          <div className="flex items-center gap-2">
                            <span className="text-sm">{icon}</span>
                            <span className="text-sm font-medium text-slate-600">{name}</span>
                          </div>
                          <span className={`text-sm font-bold bg-gradient-to-r ${gradient} bg-clip-text text-transparent`}>
                            {value.toLocaleString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-4 mt-4 border-t border-gradient-to-r from-transparent via-slate-200 to-transparent">
                    <div className="flex justify-between items-center p-3 bg-gradient-to-r from-slate-50 to-white rounded-lg mb-2">
                      <span className="text-sm font-medium text-slate-600">📈 Trend</span>
                      <div className="flex items-center gap-2 px-2 py-1 rounded-full bg-white/80 border border-white/50">
                        {getTrendIcon(selectedState.trendDirection)}
                        <span className="text-sm capitalize font-semibold text-slate-700">{selectedState.trendDirection}</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gradient-to-r from-red-50 to-orange-50 rounded-lg">
                      <span className="text-sm font-medium text-slate-600">💰 Total Loss</span>
                      <span className="font-bold text-lg bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">₹{selectedState.totalLoss} Cr</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Quick Tips Card */}
            <Card className="bg-gradient-to-br from-indigo-50 via-blue-50 to-purple-50 border border-indigo-200 shadow-lg">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base text-indigo-800">
                  <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-lg">
                    <div className="text-white text-sm">💡</div>
                  </div>
                  Cyber Safety Tips
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  {[
                    { icon: '🛡️', tip: 'Never share OTP or passwords' },
                    { icon: '🔒', tip: 'Verify caller identity independently' },
                    { icon: '⚠️', tip: 'Be cautious of too-good offers' },
                    { icon: '📞', tip: 'Report suspicious calls to 1930' }
                  ].map(({ icon, tip }, index) => (
                    <div key={index} className="flex items-start gap-3 p-2 rounded-lg bg-white/70 hover:bg-white/90 transition-all duration-200">
                      <div className="text-sm">
                        {icon}
                      </div>
                      <span className="text-xs text-slate-600 leading-relaxed font-medium">{tip}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Top States */}
            <Card className="bg-gradient-to-br from-white via-slate-50 to-white border border-slate-200 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-slate-800">
                  <div className="p-2 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg">
                    <BarChart3 className="h-4 w-4 text-white" />
                  </div>
                  Top States by Cases
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {(topStates || []).map((state, index) => (
                    <div 
                      key={state.stateCode}
                      className="flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-white to-slate-50 border border-white/50 cursor-pointer hover:shadow-md hover:scale-[1.02] transition-all duration-200"
                      onClick={() => setSelectedState(state)}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold text-white ${
                          index === 0 ? 'bg-gradient-to-r from-yellow-400 to-orange-500 shadow-lg' :
                          index === 1 ? 'bg-gradient-to-r from-gray-400 to-gray-500 shadow-lg' :
                          index === 2 ? 'bg-gradient-to-r from-orange-600 to-red-600 shadow-lg' :
                          'bg-gradient-to-r from-slate-400 to-slate-500'
                        }`}>
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-semibold text-sm text-slate-800">{state.stateName}</p>
                          <p className="text-xs text-slate-500 font-medium">
                            {state.totalCases.toLocaleString()} cases
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="text-sm">
                          {getTrendIcon(state.trendDirection)}
                        </div>
                        <Badge 
                          className={`${state.riskLevel === 'Critical' ? 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg' : 
                                     state.riskLevel === 'High' ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg' : 
                                     state.riskLevel === 'Medium' ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white shadow-lg' :
                                     'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg'} text-xs px-2 py-1`}
                        >
                          {state.riskLevel}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Info Card */}
            <Card className="bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 border border-emerald-200 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-emerald-800">
                  <div className="p-2 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-lg">
                    <Info className="h-4 w-4 text-white" />
                  </div>
                  About the Data
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="p-3 bg-white/70 rounded-lg border border-white/50">
                  <p className="text-sm text-slate-700 leading-relaxed">
                    This interactive map shows <span className="font-semibold text-emerald-700">real cyber fraud data</span> compiled from Indian government sources. 
                    Risk levels are calculated based on actual case density per population 
                    and trends from <span className="font-medium">NCRB, RBI, and state police reports</span>.
                  </p>
                </div>
                <div className="p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                  <p className="text-sm text-blue-700">
                    <span className="font-semibold flex items-center gap-1 mb-1">
                      <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
                      Live Feature:
                    </span> 
                    Data updates in real-time with dynamic state highlighting and interactive hover tooltips.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Tabs for different views */}
        <div className="mt-8">
          <Tabs defaultValue="analytics" className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-white/60 backdrop-blur-sm border border-white/20 shadow-lg p-1">
              <TabsTrigger value="analytics" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-emerald-500 data-[state=active]:text-white transition-all duration-200">📈 Analytics</TabsTrigger>
              <TabsTrigger value="insights" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-red-500 data-[state=active]:text-white transition-all duration-200">🔍 Insights</TabsTrigger>
              <TabsTrigger value="sources" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-500 data-[state=active]:text-white transition-all duration-200">📋 Sources</TabsTrigger>
            </TabsList>

            {/* Analytics Tab */}
            <TabsContent value="analytics" className="mt-6">
              <div className="space-y-6">
                <KeyMetrics aggregatedStats={aggregatedStats} scamData={scamData} />
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <FraudTypesChart aggregatedStats={aggregatedStats} />
                  <TopStatesChart topStates={topStates} />
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <RiskLevelSummary scamData={scamData} />
                  <div className="lg:col-span-2">
                    <TrendAnalysis scamData={scamData} />
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Insights Tab */}
            <TabsContent value="insights" className="mt-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5 text-orange-500" />
                      Key Insights
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="p-4 bg-red-50 rounded-lg border-l-4 border-red-400">
                      <h4 className="font-semibold text-red-800 mb-2">High Risk Alert</h4>
                      <p className="text-red-700 text-sm">
                        Delhi shows the highest cyber fraud density with critical risk levels, 
                        requiring immediate attention and enhanced security measures.
                      </p>
                    </div>
                    
                    <div className="p-4 bg-yellow-50 rounded-lg border-l-4 border-yellow-400">
                      <h4 className="font-semibold text-yellow-800 mb-2">Emerging Trend</h4>
                      <p className="text-yellow-700 text-sm">
                        Financial fraud cases have increased significantly in tech hubs like Bengaluru 
                        and Hyderabad, indicating targeted attacks on IT professionals.
                      </p>
                    </div>
                    
                    <div className="p-4 bg-blue-50 rounded-lg border-l-4 border-blue-400">
                      <h4 className="font-semibold text-blue-800 mb-2">Positive Development</h4>
                      <p className="text-blue-700 text-sm">
                        Gujarat and Kerala show declining trends with improved cyber awareness 
                        campaigns and better reporting mechanisms.
                      </p>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="h-5 w-5 text-blue-500" />
                      Prevention Strategies
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="p-4 bg-green-50 rounded-lg">
                      <h4 className="font-semibold text-green-800 mb-2">Individual Level</h4>
                      <ul className="text-green-700 text-sm space-y-1">
                        <li>• Use strong, unique passwords</li>
                        <li>• Enable two-factor authentication</li>
                        <li>• Verify suspicious calls independently</li>
                        <li>• Keep software updated</li>
                      </ul>
                    </div>
                    
                    <div className="p-4 bg-purple-50 rounded-lg">
                      <h4 className="font-semibold text-purple-800 mb-2">Organizational Level</h4>
                      <ul className="text-purple-700 text-sm space-y-1">
                        <li>• Regular security training</li>
                        <li>• Implement fraud detection systems</li>
                        <li>• Monitor suspicious transactions</li>
                        <li>• Collaborate with law enforcement</li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Sources Tab */}
            <TabsContent value="sources" className="mt-6">
              <DataSources />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default ScamMap;
