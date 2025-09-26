import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  MapPin, 
  Target,
  Activity,
  Shield,
  Users,
  TrendingUp,
  X,
  Eye
} from 'lucide-react';
import { MapContainer, TileLayer, GeoJSON, CircleMarker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// State data structure for the sidebar
interface StateInfo {
  name: string;
  code: string;
  cyberCrimeCases: number;
  womenSafetyRate: string;
  policeScore: string;
  coordinates: [number, number];
  color: string;
  description: string;
}

// Sample state data - you can expand this
const statesData: { [key: string]: StateInfo } = {
  'Haryana': {
    name: 'Haryana',
    code: 'HR',
    cyberCrimeCases: 681,
    womenSafetyRate: '119 / 100k',
    policeScore: '67/10',
    coordinates: [29.0588, 76.0856],
    color: '#06b6d4',
    description: 'Northern state with moderate cyber crime rates'
  },
  'Delhi': {
    name: 'Delhi',
    code: 'DL',
    cyberCrimeCases: 1247,
    womenSafetyRate: '145 / 100k',
    policeScore: '58/10',
    coordinates: [28.6139, 77.2090],
    color: '#ef4444',
    description: 'National capital with high cyber crime density'
  },
  'Maharashtra': {
    name: 'Maharashtra',
    code: 'MH',
    cyberCrimeCases: 2156,
    womenSafetyRate: '89 / 100k',
    policeScore: '72/10',
    coordinates: [19.7515, 75.7139],
    color: '#f97316',
    description: 'Financial capital with significant cyber threats'
  },
  'Karnataka': {
    name: 'Karnataka',
    code: 'KA',
    cyberCrimeCases: 1876,
    womenSafetyRate: '94 / 100k',
    policeScore: '75/10',
    coordinates: [15.3173, 75.7139],
    color: '#eab308',
    description: 'Tech hub with sophisticated cyber crimes'
  },
  'Tamil Nadu': {
    name: 'Tamil Nadu',
    code: 'TN',
    cyberCrimeCases: 1654,
    womenSafetyRate: '76 / 100k',
    policeScore: '78/10',
    coordinates: [11.1271, 78.6569],
    color: '#22c55e',
    description: 'Southern state with good cyber security measures'
  },
  'Uttar Pradesh': {
    name: 'Uttar Pradesh',
    code: 'UP',
    cyberCrimeCases: 2987,
    womenSafetyRate: '156 / 100k',
    policeScore: '45/10',
    coordinates: [26.8467, 80.9462],
    color: '#dc2626',
    description: 'Most populous state with high crime rates'
  },
  'Gujarat': {
    name: 'Gujarat',
    code: 'GJ',
    cyberCrimeCases: 1234,
    womenSafetyRate: '68 / 100k',
    policeScore: '82/10',
    coordinates: [23.0225, 72.5714],
    color: '#10b981',
    description: 'Business state with good security infrastructure'
  },
  'Rajasthan': {
    name: 'Rajasthan',
    code: 'RJ',
    cyberCrimeCases: 1567,
    womenSafetyRate: '112 / 100k',
    policeScore: '65/10',
    coordinates: [27.0238, 74.2179],
    color: '#f59e0b',
    description: 'Tourism state with emerging cyber threats'
  },
  'West Bengal': {
    name: 'West Bengal',
    code: 'WB',
    cyberCrimeCases: 1876,
    womenSafetyRate: '134 / 100k',
    policeScore: '62/10',
    coordinates: [22.9868, 87.8550],
    color: '#f97316',
    description: 'Cultural hub with moderate cyber security'
  }
};

interface InteractiveIndiaMapProps {
  indiaGeoJSON: any;
}

export const InteractiveIndiaMap: React.FC<InteractiveIndiaMapProps> = ({ 
  indiaGeoJSON 
}) => {
  const [selectedState, setSelectedState] = useState<StateInfo | null>(null);
  const [targetPosition, setTargetPosition] = useState<[number, number] | null>(null);
  const [showSidebar, setShowSidebar] = useState(false);
  const mapRef = useRef<any>(null);

  // Style function for GeoJSON states
  const getStateStyle = (feature: any) => {
    const stateName = feature.properties.ST_NM || feature.properties.NAME_1 || feature.properties.name;
    const stateInfo = statesData[stateName];
    
    return {
      fillColor: stateInfo ? stateInfo.color : '#64748b',
      weight: 1.5,
      opacity: 1,
      color: '#1e293b',
      fillOpacity: 0.6,
    };
  };

  // Handle state click
  const onStateClick = (feature: any, layer: any, latlng: any) => {
    const stateName = feature.properties.ST_NM || feature.properties.NAME_1 || feature.properties.name;
    const stateInfo = statesData[stateName];
    
    if (stateInfo) {
      setSelectedState(stateInfo);
      setTargetPosition(stateInfo.coordinates);
      setShowSidebar(true);
      
      // Animate to the clicked location
      if (mapRef.current) {
        mapRef.current.flyTo(stateInfo.coordinates, 6, {
          duration: 1.5
        });
      }
    }
  };

  // GeoJSON event handlers
  const onEachFeature = (feature: any, layer: any) => {
    const stateName = feature.properties.ST_NM || feature.properties.NAME_1 || feature.properties.name;
    const stateInfo = statesData[stateName];
    
    layer.on({
      click: (e: any) => {
        onStateClick(feature, layer, e.latlng);
      },
      mouseover: (e: any) => {
        const target = e.target;
        target.setStyle({
          weight: 3,
          color: '#06b6d4',
          fillOpacity: 0.8
        });
        target.bringToFront();
      },
      mouseout: (e: any) => {
        const target = e.target;
        target.setStyle(getStateStyle(feature));
      }
    });

    // Add tooltip
    if (stateInfo) {
      layer.bindTooltip(
        `<div style="background: #1e293b; color: white; padding: 8px; border-radius: 8px; border: 1px solid #475569;">
          <strong style="color: #06b6d4;">${stateInfo.name}</strong><br/>
          <span style="color: #94a3b8;">Click to view details</span>
        </div>`,
        {
          permanent: false,
          sticky: true,
          className: 'custom-tooltip'
        }
      );
    }
  };

  // Target Circle Component
  const TargetCircle = () => {
    if (!targetPosition) return null;

    return (
      <CircleMarker
        center={targetPosition}
        radius={20}
        pathOptions={{
          fillColor: '#06b6d4',
          fillOpacity: 0.3,
          color: '#06b6d4',
          weight: 3,
          opacity: 1,
        }}
        className="target-circle"
      >
        <CircleMarker
          center={targetPosition}
          radius={10}
          pathOptions={{
            fillColor: '#06b6d4',
            fillOpacity: 0.6,
            color: '#06b6d4',
            weight: 2,
            opacity: 1,
          }}
        />
        <CircleMarker
          center={targetPosition}
          radius={5}
          pathOptions={{
            fillColor: '#06b6d4',
            fillOpacity: 1,
            color: '#ffffff',
            weight: 2,
            opacity: 1,
          }}
        />
      </CircleMarker>
    );
  };

  return (
    <div className="relative w-full h-full">
      {/* Map Container */}
      <div className="w-full h-[800px] bg-slate-900 rounded-xl overflow-hidden border border-slate-700/60 relative">
        {indiaGeoJSON ? (
          <MapContainer
            center={[20.5937, 78.9629]}
            zoom={5}
            style={{ height: '100%', width: '100%', background: '#0f172a' }}
            ref={mapRef}
            zoomControl={true}
            scrollWheelZoom={true}
            doubleClickZoom={true}
            dragging={true}
          >
            {/* Dark tile layer */}
            <TileLayer
              url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
              opacity={0.8}
            />
            
            {/* India GeoJSON */}
            <GeoJSON
              data={indiaGeoJSON}
              style={getStateStyle}
              onEachFeature={onEachFeature}
            />
            
            {/* Target Circle */}
            <TargetCircle />
          </MapContainer>
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="animate-spin h-8 w-8 border-2 border-cyan-400 rounded-full border-t-transparent mx-auto mb-4"></div>
              <p className="text-slate-400">Loading map...</p>
            </div>
          </div>
        )}

        {/* Title Overlay */}
        <div className="absolute top-4 left-4 bg-slate-900/90 backdrop-blur-sm rounded-xl border border-slate-700/60 p-4">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Target className="h-6 w-6 text-cyan-400" />
            Interactive Cyber Crime Map
          </h2>
          <p className="text-slate-400 text-sm mt-1">Click on any state to view details</p>
        </div>

        {/* Stats Overlay */}
        <div className="absolute top-4 right-4 bg-slate-900/90 backdrop-blur-sm rounded-xl border border-slate-700/60 p-4">
          <div className="flex items-center gap-2 text-cyan-400 mb-2">
            <Activity className="h-4 w-4" />
            <span className="text-sm font-semibold">Live Data</span>
          </div>
          <div className="space-y-1 text-xs">
            <div className="text-slate-300">Total States: <span className="text-white font-bold">9</span></div>
            <div className="text-slate-300">Active Cases: <span className="text-red-300 font-bold">13,271</span></div>
          </div>
        </div>
      </div>

      {/* Sidebar */}
      {showSidebar && selectedState && (
        <div className="fixed top-0 right-0 h-full w-80 bg-slate-900 border-l border-slate-700/60 shadow-2xl z-50 transform transition-transform duration-300">
          {/* Sidebar Header */}
          <div className="p-6 border-b border-slate-700/60 bg-gradient-to-r from-slate-900 to-slate-800">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-2xl font-bold text-cyan-400">{selectedState.name}</h3>
              <Button
                onClick={() => {
                  setShowSidebar(false);
                  setTargetPosition(null);
                  setSelectedState(null);
                }}
                className="bg-slate-700 hover:bg-slate-600 text-white"
                size="sm"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-slate-400 text-sm">{selectedState.description}</p>
          </div>

          {/* Sidebar Content */}
          <div className="p-6 space-y-6">
            {/* Cyber Crime Cases */}
            <div className="bg-slate-800/60 rounded-xl p-4 border border-slate-700/60">
              <div className="text-slate-400 text-sm mb-1">Cyber Crime Cases</div>
              <div className="text-3xl font-bold text-cyan-400">{selectedState.cyberCrimeCases}</div>
              <div className="flex items-center gap-2 mt-2">
                <TrendingUp className="h-4 w-4 text-red-400" />
                <span className="text-xs text-slate-400">+12% this month</span>
              </div>
            </div>

            {/* Women Safety Rate */}
            <div className="bg-gradient-to-br from-purple-900/40 to-pink-900/40 rounded-xl p-4 border border-purple-500/30">
              <div className="text-purple-200 text-sm mb-1">Women Safety Rate</div>
              <div className="text-2xl font-bold text-purple-300">{selectedState.womenSafetyRate}</div>
              <div className="flex items-center gap-2 mt-2">
                <Users className="h-4 w-4 text-purple-400" />
                <span className="text-xs text-purple-200">Per 100k population</span>
              </div>
            </div>

            {/* Police Score */}
            <div className="bg-gradient-to-br from-orange-900/40 to-yellow-900/40 rounded-xl p-4 border border-orange-500/30">
              <div className="text-orange-200 text-sm mb-1">Police Score</div>
              <div className="text-2xl font-bold text-orange-300">{selectedState.policeScore}</div>
              <div className="flex items-center gap-2 mt-2">
                <Shield className="h-4 w-4 text-orange-400" />
                <span className="text-xs text-orange-200">Response efficiency</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <Button className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white">
                <Eye className="h-4 w-4 mr-2" />
                View Crime Reports
              </Button>
              
              <Button className="w-full bg-slate-700 hover:bg-slate-600 text-white">
                <MapPin className="h-4 w-4 mr-2" />
                View Police Stations
              </Button>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-3 pt-4 border-t border-slate-700/60">
              <div className="text-center p-3 bg-slate-800/40 rounded-lg">
                <div className="text-lg font-bold text-white">24h</div>
                <div className="text-xs text-slate-400">Avg Response</div>
              </div>
              <div className="text-center p-3 bg-slate-800/40 rounded-lg">
                <div className="text-lg font-bold text-green-400">68%</div>
                <div className="text-xs text-slate-400">Solved Rate</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Custom CSS for animations */}
      <style jsx>{`
        .target-circle {
          animation: pulse 2s infinite;
        }
        
        @keyframes pulse {
          0% {
            transform: scale(1);
            opacity: 1;
          }
          50% {
            transform: scale(1.1);
            opacity: 0.7;
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }
        
        .leaflet-tooltip {
          border: none !important;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3) !important;
        }
      `}</style>
    </div>
  );
};

export default InteractiveIndiaMap;
