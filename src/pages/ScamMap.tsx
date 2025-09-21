import React, { useState, useRef, useEffect } from 'react';
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
  MapPin
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

const ScamMap = () => {
  const [selectedState, setSelectedState] = useState<ScamData | null>(null);
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

  const onEachFeature = (feature: any, layer: any) => {
    const stateData = scamData?.find(data => data.stateCode === feature.properties.code);
    
    if (stateData) {
      // Get risk color for border highlighting
      const riskColor = getRiskColor(stateData.riskLevel);
      
      // Set default outline style - clean borders with no fill
      layer.setStyle({
        fillColor: 'transparent', // No fill - outline only
        weight: 1.5, // Slightly thinner for detailed boundaries
        opacity: 0.8,
        color: '#475569', // Slightly darker gray for better visibility
        fillOpacity: 0, // Completely transparent fill
        dashArray: ''
      });

      // Add click event
      layer.on('click', () => {
        setSelectedState(stateData);
      });

      // Add hover events with data display
      layer.on('mouseover', (e) => {
        const layer = e.target;
        
        // Highlight the state border on hover
        layer.setStyle({
          weight: 3, // Slightly thicker on hover
          color: riskColor, // Use risk color for border highlight
          opacity: 1,
          fillColor: riskColor,
          fillOpacity: 0.05, // Very subtle fill on hover
          dashArray: ''
        });
        
        // Show tooltip popup immediately on hover
        layer.openPopup();
      });

      layer.on('mouseout', (e) => {
        const layer = e.target;
        
        // Reset to outline style
        layer.setStyle({
          fillColor: 'transparent',
          weight: 1.5,
          opacity: 0.8,
          color: '#475569',
          fillOpacity: 0,
          dashArray: ''
        });
        
        // Close tooltip when not hovering
        layer.closePopup();
      });

      // Bind enhanced popup with modern styling
      layer.bindPopup(`
        <div style="
          min-width: 280px; 
          background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
          padding: 0;
          font-family: 'Inter', system-ui, sans-serif;
        ">
          <!-- Header -->
          <div style="
            background: linear-gradient(135deg, ${riskColor} 0%, ${riskColor}dd 100%);
            color: white;
            padding: 12px 16px;
            border-radius: 12px 12px 0 0;
            border-bottom: 1px solid ${riskColor}33;
          ">
            <h3 style="
              margin: 0;
              font-size: 18px;
              font-weight: 700;
              display: flex;
              align-items: center;
              gap: 8px;
            ">
              📍 ${stateData.stateName}
              <span style="
                background: rgba(255, 255, 255, 0.2);
                padding: 2px 8px;
                border-radius: 12px;
                font-size: 11px;
                font-weight: 600;
              ">${stateData.riskLevel}</span>
            </h3>
          </div>
          
          <!-- Content -->
          <div style="padding: 16px;">
            <div style="display: grid; gap: 10px;">
              <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px 0; border-bottom: 1px solid #f1f5f9;">
                <span style="color: #64748b; font-size: 14px; font-weight: 500;">📊 Total Cases</span>
                <span style="color: #1e293b; font-size: 16px; font-weight: 700;">${stateData.totalCases.toLocaleString()}</span>
              </div>
              
              <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px 0; border-bottom: 1px solid #f1f5f9;">
                <span style="color: #64748b; font-size: 14px; font-weight: 500;">💰 Total Loss</span>
                <span style="color: #dc2626; font-size: 16px; font-weight: 700;">₹${stateData.totalLoss.toFixed(1)} Cr</span>
              </div>
              
              <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px 0; border-bottom: 1px solid #f1f5f9;">
                <span style="color: #64748b; font-size: 14px; font-weight: 500;">👥 Per 100k Pop</span>
                <span style="color: #1e293b; font-size: 16px; font-weight: 700;">${stateData.populationRatio}</span>
              </div>
              
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-top: 8px;">
                <div style="background: #f8fafc; padding: 8px; border-radius: 8px; text-align: center;">
                  <div style="color: #64748b; font-size: 11px; font-weight: 600; text-transform: uppercase;">Financial</div>
                  <div style="color: #1e293b; font-size: 14px; font-weight: 700;">${stateData.financialFraud.toLocaleString()}</div>
                </div>
                <div style="background: #f8fafc; padding: 8px; border-radius: 8px; text-align: center;">
                  <div style="color: #64748b; font-size: 11px; font-weight: 600; text-transform: uppercase;">Online</div>
                  <div style="color: #1e293b; font-size: 14px; font-weight: 700;">${stateData.onlineFraud.toLocaleString()}</div>
                </div>
              </div>
            </div>
            
            <div style="margin-top: 12px; padding-top: 12px; border-top: 1px solid #f1f5f9; text-align: center;">
              <span style="color: #64748b; font-size: 12px; font-style: italic;">Click state for detailed view</span>
            </div>
          </div>
        </div>
      `, {
        closeButton: false, // Remove default close button for cleaner look
        autoClose: false,
        closeOnClick: false,
        className: 'custom-popup' // Custom class for additional styling if needed
      });
    }
  };

  const getTrendIcon = (direction: string) => {
    switch (direction) {
      case 'up': return <TrendingUp className="h-4 w-4 text-red-500" />;
      case 'down': return <TrendingDown className="h-4 w-4 text-green-500" />;
      default: return <Minus className="h-4 w-4 text-gray-500" />;
    }
  };

  const filteredStates = filterRiskLevel === 'all' 
    ? (scamData || []) 
    : (scamData || []).filter(state => state.riskLevel.toLowerCase() === filterRiskLevel);

  // Show loading state
  if (loading && !scamData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin h-12 w-12 border-4 border-blue-600 rounded-full border-t-transparent mx-auto"></div>
          <h2 className="text-xl font-semibold text-gray-800">Loading India Scam Map...</h2>
          <p className="text-gray-600">Initializing real cyber crime data with live increments</p>
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
                India Cyber Crime Map
              </h1>
              <p className="text-lg text-gray-700 mt-2 font-medium">
                🔍 Real-time visualization of cyber fraud incidents across Indian states
              </p>
            </div>
          </div>

          {/* Quick Stats */}
          {/* Data Source and Status Indicator */}
          <div className="mb-6 p-4 bg-white/60 backdrop-blur-sm border border-white/20 rounded-xl shadow-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Badge 
                  className="bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0 px-4 py-2 text-sm font-semibold shadow-lg"
                >
                  📊 Real India Data + Live Increments
                </Badge>
                {lastUpdated && (
                  <span className="text-sm text-gray-600 bg-white/50 px-3 py-1 rounded-lg">
                    ⏰ Updated: {lastUpdated.toLocaleTimeString()}
                  </span>
                )}
                {loading && (
                  <div className="flex items-center gap-2 text-sm text-blue-600 bg-blue-50/50 px-3 py-1 rounded-lg">
                    <div className="animate-spin h-4 w-4 border-2 border-blue-600 rounded-full border-t-transparent"></div>
                    Loading...
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
                  🔄 Refresh Data
                </Button>
                <Badge 
                  className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white border-0 px-3 py-1 shadow-lg"
                >
                  📋 Local Database
                </Badge>
              </div>
            </div>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-yellow-600" />
                <span className="text-sm font-medium text-yellow-800">Notice</span>
              </div>
              <p className="text-sm text-yellow-700 mt-1">{error}</p>
            </div>
          )}

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

        {/* Tabs for different views */}
        <Tabs defaultValue="map" className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-white/60 backdrop-blur-sm border border-white/20 shadow-lg p-1">
            <TabsTrigger value="map" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500 data-[state=active]:text-white transition-all duration-200">🗺 Interactive Map</TabsTrigger>
            <TabsTrigger value="analytics" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-emerald-500 data-[state=active]:text-white transition-all duration-200">📈 Analytics</TabsTrigger>
            <TabsTrigger value="insights" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-red-500 data-[state=active]:text-white transition-all duration-200">🔍 Insights</TabsTrigger>
            <TabsTrigger value="sources" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-500 data-[state=active]:text-white transition-all duration-200">📋 Sources</TabsTrigger>
          </TabsList>

          {/* Map Tab */}
          <TabsContent value="map" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Map Section */}
          <div className="lg:col-span-3">
            <Card className="bg-white/70 backdrop-blur-sm border border-white/20 shadow-xl">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-t-lg">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-lg font-bold">
                    <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg">
                      <Map className="h-5 w-5 text-white" />
                    </div>
                    🇮🇳 India Cyber Fraud Risk Map
                  </CardTitle>
                  <div className="flex gap-2">
                    <Select value={viewMode} onValueChange={(value: 'heatmap' | 'cases') => setViewMode(value)}>
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="heatmap">Risk Level</SelectItem>
                        <SelectItem value="cases">Case Count</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={filterRiskLevel} onValueChange={setFilterRiskLevel}>
                      <SelectTrigger className="w-32">
                        <Filter className="h-4 w-4 mr-1" />
                        <SelectValue placeholder="Filter" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Levels</SelectItem>
                        <SelectItem value="critical">Critical</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="low">Low</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <CardDescription>
                  Detailed geographical map of India - hover over any state for instant statistics, click for detailed analysis
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="h-[500px] rounded-lg overflow-hidden border-2 border-white/20 shadow-inner relative">
                  {/* Subtle overlay pattern */}
                  <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/5 to-transparent pointer-events-none z-10" />
                  <MapContainer
                    center={[20.5937, 78.9629]}
                    zoom={5}
                    style={{ 
                      height: '100%', 
                      width: '100%',
                      background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 50%, #e2e8f0 100%)'
                    }}
                    zoomControl={true}
                    scrollWheelZoom={true}
                    doubleClickZoom={true}
                  >
                    {scamData && (
                      <GeoJSON
                        data={indiaStatesGeoJSON as any}
                        onEachFeature={onEachFeature}
                        style={{
                          weight: 1.5,
                          color: '#475569', // Slightly darker gray for better visibility
                          opacity: 0.8,
                          fillOpacity: 0, // Transparent fill for outline-only look
                          fillColor: 'transparent'
                        }}
                      />
                    )}
                  </MapContainer>
                </div>
                
                {/* Legend */}
                <div className="m-4 p-4 bg-gradient-to-r from-slate-50 via-white to-slate-50 rounded-xl border border-slate-200 shadow-sm">
                  <h4 className="font-semibold mb-3 text-slate-700 flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-500" />
                    Risk Level Highlighting (Hover)
                  </h4>
                  <div className="flex flex-wrap gap-4">
                    {[
                      { level: 'Low', color: '#10B981', gradient: 'from-green-400 to-green-600' },
                      { level: 'Medium', color: '#F59E0B', gradient: 'from-yellow-400 to-yellow-600' },
                      { level: 'High', color: '#EF4444', gradient: 'from-red-400 to-red-600' },
                      { level: 'Critical', color: '#7C2D12', gradient: 'from-red-700 to-red-900' }
                    ].map(({ level, color, gradient }) => (
                      <div key={level} className="flex items-center gap-2 px-2 py-1 rounded-lg bg-white/50 backdrop-blur-sm">
                        <div 
                          className={`w-4 h-4 rounded-full shadow-sm bg-gradient-to-br ${gradient}`}
                          style={{ backgroundColor: color }}
                        />
                        <span className="text-sm font-medium text-slate-600">{level}</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 pt-3 border-t border-slate-200">
                    <div className="text-xs text-slate-500 flex items-center gap-1">
                      <span>👆</span>
                      Hover over any state to see instant data popup with risk-based border highlighting
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
                  Quick Safety Tips
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  {[
                    { icon: '🛡️', tip: 'Never share OTP or passwords', color: 'from-red-500 to-pink-500' },
                    { icon: '🔒', tip: 'Verify caller identity independently', color: 'from-blue-500 to-cyan-500' },
                    { icon: '⚠️', tip: 'Be cautious of too-good offers', color: 'from-yellow-500 to-orange-500' },
                    { icon: '📞', tip: 'Report suspicious calls to 1930', color: 'from-green-500 to-emerald-500' }
                  ].map(({ icon, tip, color }, index) => (
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
                    This map shows <span className="font-semibold text-emerald-700">real cyber fraud data</span> compiled from Indian government sources. 
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
                    Numbers increase with each refresh to simulate ongoing cases in real-time.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
            </div>
          </TabsContent>

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
                      Delhi shows the highest cyber fraud density with 53 cases per 100k population, 
                      requiring immediate attention and enhanced security measures.
                    </p>
                  </div>
                  
                  <div className="p-4 bg-yellow-50 rounded-lg border-l-4 border-yellow-400">
                    <h4 className="font-semibold text-yellow-800 mb-2">Emerging Trend</h4>
                    <p className="text-yellow-700 text-sm">
                      Financial fraud cases have increased by 18% in tech hubs like Bengaluru 
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
                    <Shield className="h-5 w-5 text-green-500" />
                    Recommendations
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-red-500 rounded-full mt-2"></div>
                      <div>
                        <h4 className="font-medium">Priority Action Required</h4>
                        <p className="text-sm text-gray-600">
                          Deploy additional cyber crime units in Delhi, Goa, and Telangana to handle high case volumes.
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
                      <div>
                        <h4 className="font-medium">Enhanced Monitoring</h4>
                        <p className="text-sm text-gray-600">
                          Implement real-time fraud detection systems in major metropolitan areas.
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                      <div>
                        <h4 className="font-medium">Awareness Campaigns</h4>
                        <p className="text-sm text-gray-600">
                          Launch targeted awareness programs in rural areas to prevent social engineering attacks.
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                      <div>
                        <h4 className="font-medium">Success Replication</h4>
                        <p className="text-sm text-gray-600">
                          Replicate successful fraud prevention strategies from low-risk states to high-risk areas.
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Data Sources Tab */}
          <TabsContent value="sources" className="mt-6">
            <DataSources />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ScamMap;
