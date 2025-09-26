import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { 
  MapPin, 
  AlertTriangle, 
  Shield, 
  TrendingUp, 
  TrendingDown, 
  Activity,
  Users,
  DollarSign,
  Clock,
  Eye,
  Phone,
  Zap,
  Target,
  Minus,
  X,
  BarChart3,
  FileText,
  Calendar
} from 'lucide-react';
import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet';
import { StateDetailedData, EnhancedScamDataService, TrendingScam } from '@/services/enhancedScamDataService';
import { CrimeReportsService, StateCrimeReports } from '@/services/crimeReportsService';
import { CrimeReportsViewer } from '@/components/ScamMap/CrimeReportsViewer';
import 'leaflet/dist/leaflet.css';

interface InteractiveStateMapProps {
  indiaGeoJSON: any;
  scamDataService: EnhancedScamDataService;
}

export const InteractiveStateMap: React.FC<InteractiveStateMapProps> = ({ 
  indiaGeoJSON, 
  scamDataService 
}) => {
  const [selectedState, setSelectedState] = useState<StateDetailedData | null>(null);
  const [selectedStateReports, setSelectedStateReports] = useState<StateCrimeReports | null>(null);
  const [liveCrimeStats, setLiveCrimeStats] = useState(scamDataService.getLiveCrimeStats());
  const [safetyRatings, setSafetyRatings] = useState(scamDataService.getSafetyRatings());
  const [showCrimeReports, setShowCrimeReports] = useState(false);
  const [crimeReportsService] = useState(() => CrimeReportsService.getInstance());
  const mapRef = useRef<any>(null);

  // Update live stats every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setLiveCrimeStats(scamDataService.getLiveCrimeStats());
      setSafetyRatings(scamDataService.getSafetyRatings());
    }, 30000);

    return () => clearInterval(interval);
  }, [scamDataService]);

  // Get state color based on risk level
  const getStateColor = (riskLevel: string): string => {
    switch (riskLevel) {
      case 'Critical': return '#dc2626'; // red-600
      case 'High': return '#ea580c'; // orange-600
      case 'Medium': return '#ca8a04'; // yellow-600
      case 'Low': return '#16a34a'; // green-600
      default: return '#6b7280'; // gray-500
    }
  };

  // Style function for GeoJSON
  const geoJSONStyle = (feature: any) => {
    const stateName = feature.properties.ST_NM || feature.properties.NAME_1 || feature.properties.name;
    const stateCode = stateNameToCode[stateName] || stateName?.substring(0, 2).toUpperCase();
    const stateData = scamDataService.getStateData(stateCode);
    
    return {
      fillColor: stateData ? getStateColor(stateData.riskLevel) : '#6b7280',
      weight: 2,
      opacity: 1,
      color: '#1e293b',
      fillOpacity: 0.7,
      className: 'state-polygon cursor-pointer'
    };
  };

  // State name to code mapping
  const stateNameToCode: { [key: string]: string } = {
    'Delhi': 'DL',
    'Maharashtra': 'MH',
    'Karnataka': 'KA',
    'Tamil Nadu': 'TN',
    'Uttar Pradesh': 'UP',
    'Gujarat': 'GJ',
    'Rajasthan': 'RJ',
    'West Bengal': 'WB',
    'Andhra Pradesh': 'AP',
    'Telangana': 'TG',
    'Kerala': 'KL',
    'Odisha': 'OR',
    'Assam': 'AS',
    'Punjab': 'PB',
    'Haryana': 'HR',
    'Madhya Pradesh': 'MP',
    'Chhattisgarh': 'CG',
    'Bihar': 'BR',
    'Jharkhand': 'JH',
    'Uttarakhand': 'UK',
    'Himachal Pradesh': 'HP',
    'Jammu and Kashmir': 'JK',
    'Goa': 'GA',
    'Manipur': 'MN',
    'Meghalaya': 'ML',
    'Tripura': 'TR',
    'Nagaland': 'NL',
    'Mizoram': 'MZ',
    'Arunachal Pradesh': 'AR',
    'Sikkim': 'SK'
  };

  // Handle state click
  const onStateClick = (feature: any, layer: any) => {
    console.log('State clicked:', feature.properties); // Debug log
    
    const stateName = feature.properties.ST_NM || feature.properties.NAME_1 || feature.properties.name;
    console.log('State name found:', stateName); // Debug log
    
    const stateCode = stateNameToCode[stateName] || stateName?.substring(0, 2).toUpperCase();
    console.log('State code mapped:', stateCode); // Debug log
    
    const stateData = scamDataService.getStateData(stateCode);
    const crimeReports = crimeReportsService.getStateReports(stateCode);
    
    console.log('State data found:', !!stateData, 'Crime reports found:', !!crimeReports); // Debug log
    
    if (crimeReports) {
      setSelectedState(stateData);
      setSelectedStateReports(crimeReports);
      setShowCrimeReports(true);
      console.log('Opening crime reports for:', stateName); // Debug log
    } else {
      // Fallback: show alert with available data
      alert(`Clicked on ${stateName} (Code: ${stateCode})\nCrime reports not available for this state yet.`);
    }
  };

  // Event handlers for GeoJSON
  const onEachFeature = (feature: any, layer: any) => {
    // Add click event
    layer.on('click', (e: any) => {
      console.log('Layer clicked!', e); // Debug log
      onStateClick(feature, layer);
      e.originalEvent.stopPropagation(); // Prevent map click
    });

    // Add hover effects
    layer.on('mouseover', (e: any) => {
      const target = e.target;
      target.setStyle({
        weight: 4,
        color: '#06b6d4',
        fillOpacity: 0.9
      });
      target.bringToFront();
      
      // Change cursor to pointer
      target._container.style.cursor = 'pointer';
    });

    layer.on('mouseout', (e: any) => {
      const target = e.target;
      target.setStyle(geoJSONStyle(feature));
      
      // Reset cursor
      target._container.style.cursor = '';
    });

    // Add tooltip
    const stateName = feature.properties.ST_NM || feature.properties.NAME_1 || feature.properties.name;
    const stateCode = stateNameToCode[stateName] || 'Unknown';
    const crimeReports = crimeReportsService.getStateReports(stateCode);
    
    if (stateName) {
      layer.bindTooltip(
        `<div style="background: #1e293b; color: white; padding: 8px; border-radius: 8px; border: 1px solid #475569;">
          <strong style="color: #06b6d4;">${stateName}</strong><br/>
          ${crimeReports ? `Reports: <strong>${crimeReports.totalReports}</strong><br/>Click to view cases` : 'No reports available'}
        </div>`,
        {
          permanent: false,
          sticky: true,
          className: 'custom-tooltip'
        }
      );
    }
  };

  // Get trend icon
  const getTrendIcon = (direction: string) => {
    switch (direction) {
      case 'up': return <TrendingUp className="h-4 w-4 text-red-500" />;
      case 'down': return <TrendingDown className="h-4 w-4 text-green-500" />;
      default: return <Minus className="h-4 w-4 text-gray-500" />;
    }
  };

  // Get risk level color for badges
  const getRiskColor = (level: string) => {
    switch (level) {
      case 'Critical': return 'bg-red-500/20 text-red-300 border-red-500/50';
      case 'High': return 'bg-orange-500/20 text-orange-300 border-orange-500/50';
      case 'Medium': return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/50';
      case 'Low': return 'bg-green-500/20 text-green-300 border-green-500/50';
      default: return 'bg-gray-500/20 text-gray-300 border-gray-500/50';
    }
  };

  // Updated header description
  const getMapDescription = () => (
    <span className="text-slate-400">
      Click on any state to view detailed crime reports • Live data updates every 30 seconds
    </span>
  );

  // Old Detailed State View Component (keeping for reference but not used)
  const DetailedStateView = ({ state }: { state: StateDetailedData }) => (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700/60 rounded-xl max-w-6xl w-full max-h-[90vh] overflow-auto shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-slate-900/95 backdrop-blur-sm border-b border-slate-700/60 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl shadow-cyan-500/25">
                <MapPin className="h-8 w-8 text-white" />
              </div>
              <div>
                <h2 className="text-3xl font-bold text-white">{state.stateName}</h2>
                <p className="text-slate-400">Population: {state.population.toLocaleString()}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Badge className={`${getRiskColor(state.riskLevel)} px-4 py-2 text-sm font-semibold`}>
                {state.riskLevel} Risk
              </Badge>
              <Button 
                onClick={() => setShowDetailedView(false)}
                className="bg-slate-700 hover:bg-slate-600 text-white"
                size="sm"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Live Crime Statistics */}
          <Card className="bg-slate-800/80 border border-slate-700/60">
            <CardHeader className="pb-3">
              <CardTitle className="text-white flex items-center gap-2">
                <Activity className="h-5 w-5 text-red-400" />
                Live Cyber Crime Statistics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-red-900/30 rounded-lg border border-red-500/50">
                  <div className="text-3xl font-bold text-red-300">{state.liveCyberCrimes.toLocaleString()}</div>
                  <div className="text-sm text-red-200">Total Live Crimes</div>
                  <div className="text-xs text-red-400 mt-1">Updated: {state.lastUpdated}</div>
                </div>
                <div className="text-center p-4 bg-orange-900/30 rounded-lg border border-orange-500/50">
                  <div className="text-3xl font-bold text-orange-300">{state.liveCrimesThisWeek}</div>
                  <div className="text-sm text-orange-200">This Week</div>
                  <div className="text-xs text-orange-400 mt-1 flex items-center justify-center gap-1">
                    {getTrendIcon(state.trendDirection)} {state.crimeGrowthRate}%
                  </div>
                </div>
                <div className="text-center p-4 bg-yellow-900/30 rounded-lg border border-yellow-500/50">
                  <div className="text-3xl font-bold text-yellow-300">{state.liveCrimesThisMonth}</div>
                  <div className="text-sm text-yellow-200">This Month</div>
                  <div className="text-xs text-yellow-400 mt-1">Growth Rate</div>
                </div>
                <div className="text-center p-4 bg-slate-700/70 rounded-lg border border-slate-600/50">
                  <div className="text-3xl font-bold text-white">₹{state.averageLossPerCase}K</div>
                  <div className="text-sm text-slate-300">Avg Loss/Case</div>
                  <div className="text-xs text-slate-400 mt-1">Per incident</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Safety Ratings */}
          <Card className="bg-slate-800/80 border border-slate-700/60">
            <CardHeader className="pb-3">
              <CardTitle className="text-white flex items-center gap-2">
                <Shield className="h-5 w-5 text-cyan-400" />
                Safety Ratings (out of 10)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-slate-300">Overall Safety</span>
                      <span className="text-white font-bold">{state.overallSafetyRating}/10</span>
                    </div>
                    <Progress value={state.overallSafetyRating * 10} className="h-3 bg-slate-700" />
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-slate-300">Women Safety</span>
                      <span className="text-white font-bold">{state.womenSafetyRating}/10</span>
                    </div>
                    <Progress value={state.womenSafetyRating * 10} className="h-3 bg-slate-700" />
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-slate-300">Digital Safety</span>
                      <span className="text-white font-bold">{state.digitalSafetyRating}/10</span>
                    </div>
                    <Progress value={state.digitalSafetyRating * 10} className="h-3 bg-slate-700" />
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-slate-300">Financial Safety</span>
                      <span className="text-white font-bold">{state.financialSafetyRating}/10</span>
                    </div>
                    <Progress value={state.financialSafetyRating * 10} className="h-3 bg-slate-700" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Latest Trending Scams */}
          <Card className="bg-slate-800/80 border border-slate-700/60">
            <CardHeader className="pb-3">
              <CardTitle className="text-white flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-yellow-400" />
                Latest Trending Scams in {state.stateName}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {state.trendingScams.map((scam, index) => (
                  <div key={scam.id} className="p-4 bg-slate-700/70 rounded-lg border border-slate-600/50 hover:bg-slate-700/90 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <Badge className={`${getRiskColor(scam.riskLevel)} text-xs`}>
                            {scam.riskLevel}
                          </Badge>
                          <span className="text-sm text-slate-400">#{index + 1}</span>
                          <span className="text-sm text-slate-400">{scam.affectedAge} years</span>
                        </div>
                        <h4 className="font-semibold text-white mb-1">{scam.type}</h4>
                        <p className="text-sm text-slate-300 mb-2">{scam.description}</p>
                        <div className="flex items-center gap-4 text-xs text-slate-400">
                          <span className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {scam.reportedCases} cases
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {scam.lastReported}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Police Response & Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="bg-slate-800/80 border border-slate-700/60">
              <CardHeader className="pb-3">
                <CardTitle className="text-white flex items-center gap-2">
                  <Shield className="h-5 w-5 text-cyan-400" />
                  Police Response
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-slate-300">Cases Solved</span>
                  <span className="text-white font-bold">{state.casesSolved.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-300">Avg Response Time</span>
                  <span className="text-white font-bold">{state.responseTime}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-300">Conviction Rate</span>
                  <span className="text-white font-bold">{state.convictionRate}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-300">Awareness Campaigns</span>
                  <span className="text-white font-bold">{state.awarenessCampaigns}</span>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/80 border border-slate-700/60">
              <CardHeader className="pb-3">
                <CardTitle className="text-white flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-cyan-400" />
                  Crime Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-slate-300">Financial Fraud</span>
                  <span className="text-white font-bold">{state.financialFraud.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-300">Online Fraud</span>
                  <span className="text-white font-bold">{state.onlineFraud.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-300">Identity Theft</span>
                  <span className="text-white font-bold">{state.identityTheft.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-300">Phishing</span>
                  <span className="text-white font-bold">{state.phishing.toLocaleString()}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Main Map */}
      <Card className="bg-slate-800/80 backdrop-blur-sm border border-slate-700/60 shadow-xl">
        <CardHeader className="bg-slate-900/60 rounded-t-lg border-b border-slate-700/60">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg font-bold text-white">
              <div className="p-2 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg shadow-cyan-500/25">
                <Eye className="h-5 w-5 text-white" />
              </div>
              🇮🇳 Interactive Crime Reports Map - Click States for Crime Cases
            </CardTitle>
            <div className="flex gap-2">
              <Badge className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-3 py-1 shadow-cyan-500/25">
                <Activity className="h-3 w-3 mr-1" />
                Live Data
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="h-[600px] rounded-lg overflow-hidden border-2 border-slate-700/40 shadow-inner relative bg-slate-900/60">
            {indiaGeoJSON ? (
              <MapContainer
                center={[20.5937, 78.9629]}
                zoom={5}
                style={{ height: '100%', width: '100%', cursor: 'default' }}
                ref={mapRef}
                zoomControl={true}
                scrollWheelZoom={true}
                doubleClickZoom={true}
                dragging={true}
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                  opacity={0.7}
                />
                <GeoJSON
                  data={indiaGeoJSON}
                  style={geoJSONStyle}
                  onEachFeature={onEachFeature}
                />
              </MapContainer>
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="animate-spin h-8 w-8 border-2 border-cyan-400 rounded-full border-t-transparent mx-auto mb-4"></div>
                  <p className="text-slate-400">Loading interactive map...</p>
                </div>
              </div>
            )}

            {/* Risk Level Legend */}
            <div className="absolute bottom-4 left-4 p-4 bg-slate-900/80 backdrop-blur-sm rounded-xl border border-slate-700/60 shadow-sm">
              <h4 className="font-semibold mb-3 text-white flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 animate-pulse" />
                Click States for Crime Reports
              </h4>
              <div className="flex flex-wrap gap-2">
                {[
                  { level: 'Low', color: '#16a34a' },
                  { level: 'Medium', color: '#ca8a04' },
                  { level: 'High', color: '#ea580c' },
                  { level: 'Critical', color: '#dc2626' }
                ].map(({ level, color }) => (
                  <div key={level} className="flex items-center gap-2 px-2 py-1 rounded-lg bg-slate-800/70 backdrop-blur-sm border border-slate-700/50">
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: color }}
                    />
                    <span className="text-xs font-medium text-slate-300">{level}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Live Stats Overlay */}
            <div className="absolute top-4 right-4 p-4 bg-slate-900/80 backdrop-blur-sm rounded-xl border border-slate-700/60 shadow-sm">
              <h4 className="font-semibold mb-2 text-white flex items-center gap-2">
                <Activity className="h-4 w-4 text-red-400" />
                Live Stats
              </h4>
              <div className="space-y-1 text-sm">
                <div className="text-slate-300">
                  Total: <span className="text-red-300 font-bold">{liveCrimeStats.totalCrimes.toLocaleString()}</span>
                </div>
                <div className="text-slate-300">
                  Weekly: <span className="text-orange-300 font-bold">+{liveCrimeStats.weeklyIncrease}</span>
                </div>
                <div className="text-slate-300">
                  Most Active: <span className="text-yellow-300 font-bold">{liveCrimeStats.mostActiveState}</span>
                </div>
              </div>
              
              {/* Debug button */}
              <Button 
                onClick={() => {
                  const states = crimeReportsService.getAllStateReports();
                  alert(`Available states with crime reports:\n${states.map(s => `${s.stateName} (${s.stateCode})`).join('\n')}`);
                }}
                className="mt-2 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 text-xs border border-cyan-500/50"
                size="sm"
              >
                Debug States
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Crime Reports Viewer Modal */}
      {showCrimeReports && selectedStateReports && (
        <CrimeReportsViewer 
          stateReports={selectedStateReports} 
          onClose={() => setShowCrimeReports(false)}
        />
      )}
    </>
  );
};

export default InteractiveStateMap;
