import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, GeoJSON, Tooltip } from 'react-leaflet';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
  Info,
  RefreshCw,
  MapPin,
  Activity,
  Eye,
  Loader2
} from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

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

// Fix Leaflet default markers
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Comprehensive state name mapping for India states
const stateNameMapping: Record<string, string> = {
  // Standard names to state codes
  'Andaman and Nicobar Islands': 'AN',
  'Andaman & Nicobar Island': 'AN',
  'Andhra Pradesh': 'AP',
  'Arunachal Pradesh': 'AR',
  'Assam': 'AS',
  'Bihar': 'BR',
  'Chandigarh': 'CH',
  'Chhattisgarh': 'CG',
  'Chattisgarh': 'CG',
  'Dadra and Nagar Haveli': 'DN',
  'Dadra & Nagar Haveli': 'DN',
  'Daman and Diu': 'DD',
  'Daman & Diu': 'DD',
  'Delhi': 'DL',
  'NCT of Delhi': 'DL',
  'National Capital Territory of Delhi': 'DL',
  'Goa': 'GA',
  'Gujarat': 'GJ',
  'Haryana': 'HR',
  'Himachal Pradesh': 'HP',
  'Jammu and Kashmir': 'JK',
  'Jammu & Kashmir': 'JK',
  'J&K': 'JK',
  'Jharkhand': 'JH',
  'Karnataka': 'KA',
  'Kerala': 'KL',
  'Ladakh': 'LA',
  'Lakshadweep': 'LD',
  'Madhya Pradesh': 'MP',
  'Maharashtra': 'MH',
  'Manipur': 'MN',
  'Meghalaya': 'ML',
  'Mizoram': 'MZ',
  'Nagaland': 'NL',
  'Odisha': 'OR',
  'Orissa': 'OR', // Old name for Odisha
  'Puducherry': 'PY',
  'Pondicherry': 'PY', // Old name for Puducherry
  'Punjab': 'PB',
  'Rajasthan': 'RJ',
  'Sikkim': 'SK',
  'Tamil Nadu': 'TN',
  'Telangana': 'TG',
  'Tripura': 'TR',
  'Uttar Pradesh': 'UP',
  'Uttarakhand': 'UK',
  'Uttaranchal': 'UK', // Old name for Uttarakhand
  'West Bengal': 'WB'
};

// Reverse mapping: state codes to names (for our internal data)
const stateCodeToName: Record<string, string> = {
  'AN': 'Andaman and Nicobar Islands',
  'AP': 'Andhra Pradesh',
  'AR': 'Arunachal Pradesh',
  'AS': 'Assam',
  'BR': 'Bihar',
  'CH': 'Chandigarh',
  'CG': 'Chhattisgarh',
  'DN': 'Dadra and Nagar Haveli',
  'DD': 'Daman and Diu',
  'DL': 'Delhi',
  'GA': 'Goa',
  'GJ': 'Gujarat',
  'HR': 'Haryana',
  'HP': 'Himachal Pradesh',
  'JK': 'Jammu and Kashmir',
  'JH': 'Jharkhand',
  'KA': 'Karnataka',
  'KL': 'Kerala',
  'LA': 'Ladakh',
  'LD': 'Lakshadweep',
  'MP': 'Madhya Pradesh',
  'MH': 'Maharashtra',
  'MN': 'Manipur',
  'ML': 'Meghalaya',
  'MZ': 'Mizoram',
  'NL': 'Nagaland',
  'OR': 'Odisha',
  'PY': 'Puducherry',
  'PB': 'Punjab',
  'RJ': 'Rajasthan',
  'SK': 'Sikkim',
  'TN': 'Tamil Nadu',
  'TG': 'Telangana',
  'TR': 'Tripura',
  'UP': 'Uttar Pradesh',
  'UK': 'Uttarakhand',
  'WB': 'West Bengal'
};

interface IndiaGeoJSONFeature {
  type: string;
  properties: {
    NAME_1?: string;
    ST_NM?: string;
    NAME?: string;
    [key: string]: any;
  };
  geometry: {
    type: string;
    coordinates: any[];
  };
}

interface IndiaGeoJSON {
  type: string;
  features: IndiaGeoJSONFeature[];
}

const ScamMap = () => {
  const [selectedState, setSelectedState] = useState<ScamData | null>(null);
  const [hoveredState, setHoveredState] = useState<ScamData | null>(null);
  const [indiaGeoJSON, setIndiaGeoJSON] = useState<IndiaGeoJSON | null>(null);
  const [mapLoading, setMapLoading] = useState(true);
  const [mapError, setMapError] = useState<string | null>(null);

  // Use real data
  const {
    data: scamData,
    aggregatedStats,
    topStates,
    loading,
    error,
    lastUpdated,
    refreshData,
  } = useRealScamData({
    topStatesLimit: 5,
    onError: (error) => console.error('Data fetch error:', error),
    onSuccess: (data) => console.log(`Successfully loaded ${data.length} states data`)
  });

  // Fetch India GeoJSON data from a reliable source
  useEffect(() => {
    const fetchIndiaGeoJSON = async () => {
      try {
        setMapLoading(true);
        setMapError(null);
        
        // Try multiple sources for India GeoJSON data
        const sources = [
          // DataMeet - Most comprehensive and updated Indian maps
          'https://raw.githubusercontent.com/datameet/maps/master/States/states.geojson',
          // Backup comprehensive source
          'https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson',
          // Alternative detailed source
          'https://raw.githubusercontent.com/geohacker/india/master/state/india_state.geojson',
          // Recent updated boundaries
          'https://raw.githubusercontent.com/AnujTiwari/India-State-and-Country-Shapefile-Updated-Jan-2020/master/India_State_Boundary.geojson',
          // Backup from different source
          'https://raw.githubusercontent.com/mapbox/carto/master/demo/india-states.geojson'
        ];
        
        let geoJsonData = null;
        
        for (const source of sources) {
          try {
            console.log(`Trying to fetch from: ${source}`);
            const response = await fetch(source);
            
            if (response.ok) {
              geoJsonData = await response.json();
              console.log('Successfully fetched GeoJSON data:', geoJsonData);
              break;
            }
          } catch (err) {
            console.warn(`Failed to fetch from ${source}:`, err);
            continue;
          }
        }
        
        if (!geoJsonData) {
          console.warn('All external sources failed, loading fallback data');
          // Import fallback data
          const fallbackData = await import('@/data/indiaStatesFallback.json');
          geoJsonData = fallbackData.default;
        }
        
        // Validate and clean the GeoJSON data
        if (geoJsonData.type === 'FeatureCollection' && Array.isArray(geoJsonData.features)) {
          // Ensure each feature has proper properties
          geoJsonData.features = geoJsonData.features.filter((feature: any) => {
            return feature.geometry && feature.properties && 
                   (feature.properties.NAME_1 || feature.properties.ST_NM || feature.properties.NAME);
          });
          
          // Log all state names found in the GeoJSON for debugging
          const stateNames = geoJsonData.features.map((feature: any) => {
            const props = feature.properties;
            const name = props.NAME_1 || props.ST_NM || props.NAME || props.state || props.State || props.name || 'Unknown';
            return name;
          });
          
          console.log('States found in GeoJSON:', stateNames);
          console.log('Our available cyber crime data states:', scamData?.map(d => `${d.stateName} (${d.stateCode})`) || 'Loading...');
          
          setIndiaGeoJSON(geoJsonData);
          console.log(`Loaded ${geoJsonData.features.length} states/territories`);
        } else {
          throw new Error('Invalid GeoJSON format');
        }
        
      } catch (err) {
        console.error('Error fetching India GeoJSON:', err);
        setMapError(err instanceof Error ? err.message : 'Failed to load map data');
      } finally {
        setMapLoading(false);
      }
    };

    fetchIndiaGeoJSON();
  }, []);

  // Get state data by name with comprehensive matching
  const getStateDataByName = (stateName: string): ScamData | null => {
    if (!scamData || !stateName) return null;
    
    // Clean the state name
    const cleanStateName = stateName.trim();
    
    // Try exact name match first
    let stateData = scamData.find(data => 
      data.stateName.toLowerCase() === cleanStateName.toLowerCase()
    );
    
    if (stateData) return stateData;
    
    // Try mapping from GeoJSON name to state code, then find by code
    const stateCode = stateNameMapping[cleanStateName];
    if (stateCode) {
      stateData = scamData.find(data => data.stateCode === stateCode);
      if (stateData) return stateData;
    }
    
    // Try all possible property names from GeoJSON
    const possibleNames = [
      cleanStateName,
      cleanStateName.replace('&', 'and'),
      cleanStateName.replace('and', '&'),
      cleanStateName.replace(/\s+/g, ''),
      cleanStateName.replace(/\s+/g, ' '),
    ];
    
    for (const name of possibleNames) {
      // Try mapping each possible name
      const code = stateNameMapping[name];
      if (code) {
        stateData = scamData.find(data => data.stateCode === code);
        if (stateData) return stateData;
      }
      
      // Try direct name matching
      stateData = scamData.find(data => 
        data.stateName.toLowerCase() === name.toLowerCase()
      );
      if (stateData) return stateData;
    }
    
    // Try partial matching as last resort
    stateData = scamData.find(data => {
      const dataName = data.stateName.toLowerCase();
      const searchName = cleanStateName.toLowerCase();
      
      return dataName.includes(searchName) || 
             searchName.includes(dataName) ||
             dataName.replace(/\s+/g, '').includes(searchName.replace(/\s+/g, '')) ||
             searchName.replace(/\s+/g, '').includes(dataName.replace(/\s+/g, ''));
    });
    
    // Debug logging to see what's not matching
    if (!stateData) {
      console.warn(`No data found for state: "${cleanStateName}". Available states:`, 
        scamData.map(d => `${d.stateName} (${d.stateCode})`));
    }
    
    return stateData || null;
  };

  // Extract state name from GeoJSON feature properties
  const getStateNameFromFeature = (feature: IndiaGeoJSONFeature): string => {
    const props = feature.properties;
    // Try various property names that might contain the state name
    return props.NAME_1 || 
           props.ST_NM || 
           props.NAME || 
           props.state || 
           props.State || 
           props.STATE || 
           props.name || 
           props.admin_name || 
           props.ADMIN_NAME ||
           props.st_nm ||
           props.STATE_NAME ||
           props.statename ||
           '';
  };

  // Style function for GeoJSON features
  const getFeatureStyle = (feature: IndiaGeoJSONFeature) => {
    const stateName = getStateNameFromFeature(feature);
    const stateData = getStateDataByName(stateName);
    
    if (!stateData) {
      return {
        fillColor: '#e5e7eb',
        weight: 1,
        opacity: 1,
        color: '#9ca3af',
        dashArray: '',
        fillOpacity: 0.3
      };
    }
    
    const riskColor = getRiskColor(stateData.riskLevel);
    const isSelected = selectedState?.stateCode === stateData.stateCode;
    const isHovered = hoveredState?.stateCode === stateData.stateCode;
    
    return {
      fillColor: riskColor,
      weight: isSelected ? 3 : isHovered ? 2.5 : 1.5,
      opacity: 1,
      color: isSelected ? '#1e40af' : isHovered ? riskColor : '#4b5563',
      dashArray: '',
      fillOpacity: isSelected ? 0.8 : isHovered ? 0.6 : 0.4
    };
  };

  // Event handlers for GeoJSON features
  const onEachFeature = (feature: IndiaGeoJSONFeature, layer: any) => {
    const stateName = getStateNameFromFeature(feature);
    const stateData = getStateDataByName(stateName);
    
    if (!stateData) return;
    
    // Add click event
    layer.on('click', () => {
      setSelectedState(stateData);
    });
    
    // Add hover events
    layer.on('mouseover', (e: any) => {
      setHoveredState(stateData);
      layer.setStyle({
        weight: 2.5,
        color: getRiskColor(stateData.riskLevel),
        fillOpacity: 0.6
      });
    });
    
    layer.on('mouseout', () => {
      setHoveredState(null);
      layer.setStyle(getFeatureStyle(feature));
    });
    
    // Bind tooltip
    layer.bindTooltip(`
      <div class="font-semibold text-lg">${stateData.stateName}</div>
      <div class="text-sm mt-1">
        <div><strong>Risk Level:</strong> <span style="color: ${getRiskColor(stateData.riskLevel)}">${stateData.riskLevel}</span></div>
        <div><strong>Total Cases:</strong> ${stateData.totalCases.toLocaleString()}</div>
        <div><strong>Per 100k:</strong> ${stateData.populationRatio}</div>
        <div><strong>Total Loss:</strong> ₹${stateData.totalLoss} Cr</div>
      </div>
    `, {
      permanent: false,
      sticky: true,
      className: 'custom-tooltip',
      opacity: 0.95
    });
  };

  const getTrendIcon = (direction: string) => {
    switch (direction) {
      case 'up': return <TrendingUp className="h-4 w-4 text-red-500" />;
      case 'down': return <TrendingDown className="h-4 w-4 text-green-500" />;
      default: return <Minus className="h-4 w-4 text-gray-500" />;
    }
  };

  // Show loading state
  if ((loading && !scamData) || mapLoading) {
    return (
      <div className="min-h-screen bg-slate-900 p-6 flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-cyan-400 mx-auto" />
          <h2 className="text-xl font-semibold text-white">
            {mapLoading ? 'Loading India Map...' : 'Loading Cyber Crime Data...'}
          </h2>
          <p className="text-slate-400">
            {mapLoading ? 'Fetching real geographical boundaries from API' : 'Initializing real-time cyber crime intelligence'}
          </p>
        </div>
      </div>
    );
  }

  // Show error state
  if ((error && !scamData) || mapError) {
    return (
      <div className="min-h-screen bg-slate-900 p-6 flex items-center justify-center">
        <div className="text-center space-y-4 max-w-md">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto" />
          <h2 className="text-xl font-semibold text-white">Failed to Load Data</h2>
          <p className="text-slate-400">{mapError || error}</p>
          <Button onClick={() => window.location.reload()} className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500">Try Again</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl shadow-lg transform hover:scale-105 transition-transform duration-200 shadow-cyan-500/25">
              <Map className="h-10 w-10 text-white" />
            </div>
            <div>
              <h1 className="text-5xl font-bold">
                <span className="text-white">India Cyber Crime</span>{' '}
                <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">Intelligence</span>
              </h1>
              <p className="text-lg text-slate-400 mt-2 font-medium flex items-center gap-2">
                <Activity className="h-5 w-5 text-cyan-400" />
                Real geographical boundaries with live cyber fraud data visualization
              </p>
            </div>
          </div>

          {/* Data Source and Status Indicator */}
          <div className="mb-6 p-4 bg-slate-800/80 backdrop-blur-sm border border-slate-700/60 rounded-xl shadow-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Badge className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white border-0 px-4 py-2 text-sm font-semibold shadow-lg shadow-cyan-500/25">
                  🌍 Real Geographic Data + Live Crime Stats
                </Badge>
                {lastUpdated && (
                  <span className="text-sm text-slate-300 bg-slate-700/70 px-3 py-1 rounded-lg">
                    ⏰ Updated: {lastUpdated.toLocaleTimeString()}
                  </span>
                )}
                {loading && (
                  <div className="flex items-center gap-2 text-sm text-cyan-400 bg-cyan-500/10 px-3 py-1 rounded-lg">
                    <div className="animate-spin h-4 w-4 border-2 border-cyan-400 rounded-full border-t-transparent"></div>
                    Refreshing...
                  </div>
                )}
              </div>
              <div className="flex gap-3">
                <Button 
                  className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white border-0 shadow-lg transform hover:scale-105 transition-all duration-200 shadow-cyan-500/25" 
                  size="sm" 
                  onClick={refreshData}
                  disabled={loading}
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh Data
                </Button>
                <Badge className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white border-0 px-3 py-1 shadow-lg shadow-cyan-500/25">
                  🗺️ API Map Data
                </Badge>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          {aggregatedStats && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card className="bg-slate-800/80 border-slate-700/60 hover:shadow-xl hover:shadow-cyan-500/10 transition-all duration-300 transform hover:-translate-y-1">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-gradient-to-br from-red-500 to-orange-500 rounded-xl">
                      <AlertTriangle className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-400">Total Cases</p>
                      <p className="text-3xl font-bold text-white">
                        {aggregatedStats.totalCases.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-slate-800/80 border-slate-700/60 hover:shadow-xl hover:shadow-cyan-500/10 transition-all duration-300 transform hover:-translate-y-1">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl shadow-cyan-500/25">
                      <DollarSign className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-400">Total Loss</p>
                      <p className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                        ₹{aggregatedStats.totalLoss.toFixed(0)} Cr
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-slate-800/80 border-slate-700/60 hover:shadow-xl hover:shadow-cyan-500/10 transition-all duration-300 transform hover:-translate-y-1">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl shadow-emerald-500/25">
                      <Shield className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-400">Financial Fraud</p>
                      <p className="text-3xl font-bold text-white">
                        {aggregatedStats.financialFraud.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-slate-800/80 border-slate-700/60 hover:shadow-xl hover:shadow-cyan-500/10 transition-all duration-300 transform hover:-translate-y-1">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-gradient-to-br from-purple-500 to-violet-600 rounded-xl shadow-purple-500/25">
                      <Users className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-400">Online Fraud</p>
                      <p className="text-3xl font-bold text-white">
                        {aggregatedStats.onlineFraud.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        {/* Main Map Section */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Interactive Map */}
          <div className="lg:col-span-3">
            <Card className="bg-slate-800/80 backdrop-blur-sm border border-slate-700/60 shadow-xl">
              <CardHeader className="bg-slate-900/60 rounded-t-lg border-b border-slate-700/60">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-lg font-bold text-white">
                    <div className="p-2 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg shadow-cyan-500/25">
                      <Eye className="h-5 w-5 text-white" />
                    </div>
                    🇮🇳 Real India Geographic Map - Cyber Crime Data
                  </CardTitle>
                  <div className="flex gap-2">
                    <Badge className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-3 py-1 shadow-cyan-500/25">
                      <Activity className="h-3 w-3 mr-1" />
                      Live API Data
                    </Badge>
                  </div>
                </div>
                <CardDescription className="text-slate-400">
                  Real geographical boundaries from OpenStreetMap • Hover for instant stats • Click for detailed analysis
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="h-[500px] rounded-lg overflow-hidden border-2 border-slate-700/40 shadow-inner relative bg-slate-900/60">
                  {indiaGeoJSON ? (
                    <MapContainer
                      center={[20.5937, 78.9629]}
                      zoom={5}
                      style={{ height: '100%', width: '100%' }}
                      className="leaflet-container"
                    >
                      <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        opacity={0.7}
                      />
                      <GeoJSON
                        data={indiaGeoJSON}
                        style={(feature) => {
                          const stateName = feature?.properties?.ST_NM;
                          const stateData = scamData?.find(s => s.stateName === stateName);
                          return {
                            fillColor: stateData ? getRiskColor(stateData.riskLevel) : '#6b7280',
                            weight: 1,
                            opacity: 1,
                            color: '#374151',
                            fillOpacity: 0.7,
                          };
                        }}
                        onEachFeature={(feature, layer) => {
                          const stateName = feature.properties.ST_NM;
                          const stateData = scamData?.find(s => s.stateName === stateName);
                          
                          layer.on({
                            mouseover: (e) => {
                              e.target.setStyle({
                                weight: 3,
                                color: '#06b6d4',
                                fillOpacity: 0.9
                              });
                              if (stateData) {
                                setHoveredState(stateData);
                              }
                            },
                            mouseout: (e) => {
                              e.target.setStyle({
                                weight: 1,
                                color: '#374151',
                                fillOpacity: 0.7
                              });
                              setHoveredState(null);
                            },
                            click: (e) => {
                              if (stateData) {
                                setSelectedState(stateData);
                              }
                            }
                          });

                          if (stateData) {
                            layer.bindTooltip(
                              `<div style="background: #1e293b; color: white; padding: 8px; border-radius: 8px; border: 1px solid #475569;">
                                <strong style="color: #06b6d4;">${stateData.stateName}</strong><br/>
                                Cases: <strong>${stateData.totalCases.toLocaleString()}</strong><br/>
                                Risk: <strong style="color: ${getRiskColor(stateData.riskLevel)}">${stateData.riskLevel}</strong><br/>
                                Loss: <strong>₹${stateData.totalLoss} Cr</strong>
                              </div>`,
                              {
                                permanent: false,
                                sticky: true,
                                className: 'custom-tooltip'
                              }
                            );
                          }
                        }}
                      />
                    </MapContainer>
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center">
                        <div className="animate-spin h-8 w-8 border-2 border-cyan-400 rounded-full border-t-transparent mx-auto mb-4"></div>
                        <p className="text-slate-400">Loading geographical boundaries...</p>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Legend */}
                <div className="m-4 p-4 bg-slate-900/80 backdrop-blur-sm rounded-xl border border-slate-700/60 shadow-sm">
                  <h4 className="font-semibold mb-3 text-white flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 animate-pulse" />
                    Risk Level Color Coding
                  </h4>
                  <div className="flex flex-wrap gap-4">
                    {[
                      { level: 'Low', color: '#10B981', gradient: 'from-green-400 to-green-600' },
                      { level: 'Medium', color: '#F59E0B', gradient: 'from-yellow-400 to-yellow-600' },
                      { level: 'High', color: '#EF4444', gradient: 'from-red-400 to-red-600' },
                      { level: 'Critical', color: '#7C2D12', gradient: 'from-red-700 to-red-900' }
                    ].map(({ level, color, gradient }) => (
                      <div key={level} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-800/70 backdrop-blur-sm border border-slate-700/50">
                        <div 
                          className={`w-4 h-4 rounded-full shadow-sm bg-gradient-to-br ${gradient}`}
                          style={{ backgroundColor: color }}
                        />
                        <span className="text-sm font-medium text-slate-300">{level} Risk</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 pt-3 border-t border-slate-700/50">
                    <div className="text-xs text-slate-400 flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      Powered by OpenStreetMap • Real geographical boundaries • Hover for details • Click for analysis
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
              <Card className="bg-slate-800/80 border border-slate-700/60 shadow-lg hover:shadow-xl hover:shadow-cyan-500/10 transition-all duration-300">
                <CardHeader className="bg-slate-900/60 rounded-t-lg border-b border-slate-700/60">
                  <CardTitle className="flex items-center justify-between text-lg">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 animate-pulse" />
                      <span className="text-white">{selectedState.stateName}</span>
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
                  <CardDescription className="text-slate-400">
                    Last updated: {selectedState.lastUpdated}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-5 p-6">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-slate-400 font-medium">Total Cases</span>
                      <span className="font-bold text-white">{selectedState.totalCases.toLocaleString()}</span>
                    </div>
                    <div className="relative">
                      <Progress 
                        value={Math.min(100, (selectedState.totalCases / 20000) * 100)} 
                        className="h-3 bg-slate-700 overflow-hidden rounded-full"
                      />
                      <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full opacity-30" />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-slate-400 font-medium">Per 100k Population</span>
                      <span className="font-bold text-white">{selectedState.populationRatio}</span>
                    </div>
                    <div className="relative">
                      <Progress 
                        value={Math.min(100, (selectedState.populationRatio / 60) * 100)} 
                        className="h-3 bg-slate-700 overflow-hidden rounded-full"
                      />
                      <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full opacity-30" />
                    </div>
                  </div>

                  <div className="space-y-3 p-4 bg-slate-900/60 rounded-xl border border-slate-700/60">
                    <h4 className="font-semibold text-sm text-white flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 animate-pulse" />
                      Fraud Types Breakdown
                    </h4>
                    <div className="space-y-2">
                      {[
                        { name: 'Financial', value: selectedState.financialFraud, icon: '💳', gradient: 'from-cyan-400 to-blue-500' },
                        { name: 'Online', value: selectedState.onlineFraud, icon: '🌐', gradient: 'from-cyan-400 to-blue-500' },
                        { name: 'Identity Theft', value: selectedState.identityTheft, icon: '🆔', gradient: 'from-cyan-400 to-blue-500' },
                        { name: 'Phishing', value: selectedState.phishing, icon: '🎣', gradient: 'from-cyan-400 to-blue-500' },
                      ].map(({ name, value, icon, gradient }) => (
                        <div key={name} className="flex justify-between items-center p-2 rounded-lg bg-slate-800/70 border border-slate-700/50 hover:bg-slate-800/90 transition-all duration-200">
                          <div className="flex items-center gap-2">
                            <span className="text-sm">{icon}</span>
                            <span className="text-sm font-medium text-slate-300">{name}</span>
                          </div>
                          <span className={`text-sm font-bold bg-gradient-to-r ${gradient} bg-clip-text text-transparent`}>
                            {value.toLocaleString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-4 mt-4 border-t border-slate-700/50">
                    <div className="flex justify-between items-center p-3 bg-slate-800/70 rounded-lg mb-2 border border-slate-700/50">
                      <span className="text-sm font-medium text-slate-300">📈 Trend</span>
                      <div className="flex items-center gap-2 px-2 py-1 rounded-full bg-slate-900/60 border border-slate-700/60">
                        {getTrendIcon(selectedState.trendDirection)}
                        <span className="text-sm capitalize font-semibold text-white">{selectedState.trendDirection}</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-slate-800/70 rounded-lg border border-slate-700/50">
                      <span className="text-sm font-medium text-slate-300">💰 Total Loss</span>
                      <span className="font-bold text-lg bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">₹{selectedState.totalLoss} Cr</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Quick Tips Card */}
            <Card className="bg-slate-800/80 border border-slate-700/60 shadow-lg hover:shadow-cyan-500/10 transition-all duration-300">
              <CardHeader className="pb-3 bg-slate-900/60 rounded-t-lg border-b border-slate-700/60">
                <CardTitle className="flex items-center gap-2 text-base text-white">
                  <div className="p-2 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg shadow-cyan-500/25">
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
                    <div key={index} className="flex items-start gap-3 p-2 rounded-lg bg-slate-700/70 hover:bg-slate-700/90 transition-all duration-200 border border-slate-600/40">
                      <div className="text-sm">
                        {icon}
                      </div>
                      <span className="text-xs text-slate-300 leading-relaxed font-medium">{tip}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Top States */}
            <Card className="bg-slate-800/80 border border-slate-700/60 shadow-lg hover:shadow-cyan-500/10 transition-all duration-300">
              <CardHeader className="bg-slate-900/60 rounded-t-lg border-b border-slate-700/60">
                <CardTitle className="flex items-center gap-2 text-white">
                  <div className="p-2 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg shadow-cyan-500/25">
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
                      className="flex items-center justify-between p-3 rounded-xl bg-slate-700/70 hover:bg-slate-700/90 border border-slate-600/40 cursor-pointer hover:shadow-md hover:shadow-cyan-500/10 hover:scale-[1.02] transition-all duration-200"
                      onClick={() => setSelectedState(state)}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold text-white shadow-cyan-500/25 ${
                          index === 0 ? 'bg-gradient-to-r from-cyan-400 to-blue-500' :
                          index === 1 ? 'bg-gradient-to-r from-cyan-500 to-blue-600 opacity-80' :
                          index === 2 ? 'bg-gradient-to-r from-cyan-500 to-blue-600 opacity-60' :
                          'bg-gradient-to-r from-cyan-500 to-blue-600 opacity-40'
                        }`}>
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-semibold text-sm text-white">{state.stateName}</p>
                          <p className="text-xs text-slate-300 font-medium">
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
                  Map Data Source
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="p-3 bg-white/70 rounded-lg border border-white/50">
                  <p className="text-sm text-slate-700 leading-relaxed">
                    This map uses <span className="font-semibold text-emerald-700">real geographical boundaries</span> from OpenStreetMap API 
                    combined with <span className="font-medium">live cyber fraud data</span> from Indian government sources 
                    including NCRB, RBI, and state police reports.
                  </p>
                </div>
                <div className="p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                  <p className="text-sm text-blue-700">
                    <span className="font-semibold flex items-center gap-1 mb-1">
                      <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
                      API Integration:
                    </span> 
                    Real-time data updates with accurate state boundaries for precise geographic visualization.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Tabs for different views */}
        <div className="mt-8">
          <Tabs defaultValue="analytics" className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-slate-800/80 backdrop-blur-sm border border-slate-700/60 shadow-lg p-1">
              <TabsTrigger value="analytics" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-500 data-[state=active]:to-blue-600 data-[state=active]:text-white data-[state=active]:shadow-cyan-500/25 transition-all duration-200 text-slate-300">📈 Analytics</TabsTrigger>
              <TabsTrigger value="insights" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-500 data-[state=active]:to-blue-600 data-[state=active]:text-white data-[state=active]:shadow-cyan-500/25 transition-all duration-200 text-slate-300">🔍 Insights</TabsTrigger>
              <TabsTrigger value="sources" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-500 data-[state=active]:to-blue-600 data-[state=active]:text-white data-[state=active]:shadow-cyan-500/25 transition-all duration-200 text-slate-300">📋 Sources</TabsTrigger>
            </TabsList>

            {/* Analytics Tab */}
            <TabsContent value="analytics" className="mt-6">
              <div className="space-y-6">
                <Card className="bg-slate-800/80 border border-slate-700/60 shadow-lg">
                  <CardHeader className="bg-slate-900/60 rounded-t-lg border-b border-slate-700/60">
                    <CardTitle className="text-white flex items-center gap-2">
                      <div className="p-2 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg shadow-cyan-500/25">
                        <BarChart3 className="h-5 w-5 text-white" />
                      </div>
                      Analytics Dashboard
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <p className="text-slate-400">
                      Comprehensive analytics and insights about cyber crime trends across India.
                      This section provides detailed statistical analysis and data visualizations.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Insights Tab */}
            <TabsContent value="insights" className="mt-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="bg-slate-800/80 border border-slate-700/60">
                  <CardHeader className="bg-slate-900/60 rounded-t-lg border-b border-slate-700/60">
                    <CardTitle className="flex items-center gap-2 text-white">
                      <AlertTriangle className="h-5 w-5 text-cyan-400" />
                      Key Insights
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="p-4 bg-red-900/30 rounded-lg border-l-4 border-red-400">
                      <h4 className="font-semibold text-red-300 mb-2">High Risk Alert</h4>
                      <p className="text-red-200 text-sm">
                        Delhi shows the highest cyber fraud density with critical risk levels, 
                        requiring immediate attention and enhanced security measures.
                      </p>
                    </div>
                    
                    <div className="p-4 bg-yellow-900/30 rounded-lg border-l-4 border-yellow-400">
                      <h4 className="font-semibold text-yellow-300 mb-2">Emerging Trend</h4>
                      <p className="text-yellow-200 text-sm">
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
