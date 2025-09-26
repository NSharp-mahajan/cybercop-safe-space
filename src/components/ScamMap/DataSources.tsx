import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  ExternalLink, 
  Database, 
  RefreshCw,
  BarChart3,
  Clock,
  Users,
  Activity
} from 'lucide-react';
import { dynamicDataService } from '@/services/dynamicDataService';
import { useState, useEffect } from 'react';

export const DataSources = () => {
  const [sessionInfo, setSessionInfo] = useState(dynamicDataService.getSessionInfo());
  const [incrementStats, setIncrementStats] = useState(dynamicDataService.getIncrementStats());
  const dataSources = dynamicDataService.getDataSources();

  // Update stats when component mounts
  useEffect(() => {
    setSessionInfo(dynamicDataService.getSessionInfo());
    setIncrementStats(dynamicDataService.getIncrementStats());
  }, []);

  const resetIncrements = () => {
    dynamicDataService.resetIncrements();
    setSessionInfo(dynamicDataService.getSessionInfo());
    setIncrementStats(dynamicDataService.getIncrementStats());
    // Reload the page to see the reset data
    window.location.reload();
  };

  const forceNewIncrements = () => {
    dynamicDataService.forceNewIncrements();
    setSessionInfo(dynamicDataService.getSessionInfo());
    setIncrementStats(dynamicDataService.getIncrementStats());
    // Reload the page to see the new increments
    window.location.reload();
  };

  return (
    <div className="space-y-6">
      {/* Live Increment Statistics */}
      <Card className="bg-slate-800/80 border border-slate-700/60">
        <CardHeader className="bg-slate-900/60 rounded-t-lg border-b border-slate-700/60">
          <CardTitle className="flex items-center gap-2 text-white">
            <Activity className="h-5 w-5 text-cyan-400" />
            Live Data Simulation
          </CardTitle>
          <CardDescription className="text-slate-400">
            Real cyber crime data with live increments simulating ongoing cases
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-slate-700/70 rounded-lg border border-slate-600/40 hover:bg-slate-700/90 transition-colors">
              <div className="text-2xl font-bold text-white">{sessionInfo.count}</div>
              <div className="text-sm text-slate-300">Page Views</div>
            </div>
            
            <div className="text-center p-3 bg-slate-700/70 rounded-lg border border-slate-600/40 hover:bg-slate-700/90 transition-colors">
              <div className="text-2xl font-bold text-cyan-400">{sessionInfo.totalIncrements}</div>
              <div className="text-sm text-slate-300">New Cases</div>
            </div>
            
            <div className="text-center p-3 bg-slate-700/70 rounded-lg border border-slate-600/40 hover:bg-slate-700/90 transition-colors">
              <div className="text-2xl font-bold text-white">{incrementStats.statesWithIncrements}</div>
              <div className="text-sm text-slate-300">States Updated</div>
            </div>
            
            <div className="text-center p-3 bg-slate-700/70 rounded-lg border border-slate-600/40 hover:bg-slate-700/90 transition-colors">
              <div className="text-2xl font-bold text-cyan-400">{incrementStats.averageIncrement}</div>
              <div className="text-sm text-slate-300">Avg Increment</div>
            </div>
          </div>

          {incrementStats.stateWithHighestIncrement && (
            <div className="p-4 bg-red-900/30 border border-red-500/50 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-red-300">Most Active Region</p>
                  <p className="text-sm text-red-200">
                    {incrementStats.stateWithHighestIncrement} has seen {incrementStats.highestIncrement} new cases
                  </p>
                </div>
                <Badge className="bg-red-500/20 text-red-300 border border-red-500/50">{incrementStats.highestIncrement}+</Badge>
              </div>
            </div>
          )}

          <div className="flex gap-2">
            <Button onClick={forceNewIncrements} className="bg-slate-700 hover:bg-slate-600 text-white border border-slate-600" size="sm">
              <RefreshCw className="h-4 w-4 mr-1" />
              Simulate New Cases
            </Button>
            <Button onClick={resetIncrements} className="bg-slate-700 hover:bg-slate-600 text-white border border-slate-600" size="sm">
              <Database className="h-4 w-4 mr-1" />
              Reset to Base Data
            </Button>
          </div>

          <div className="text-xs text-slate-400 space-y-1">
            <p>• Each page refresh adds 1-4 random cases per state based on risk level</p>
            <p>• Data persists across browser sessions using localStorage</p>
            <p>• Higher risk states get more frequent updates</p>
          </div>
        </CardContent>
      </Card>

      {/* Data Sources */}
      <Card className="bg-slate-800/80 border border-slate-700/60">
        <CardHeader className="bg-slate-900/60 rounded-t-lg border-b border-slate-700/60">
          <CardTitle className="flex items-center gap-2 text-white">
            <Database className="h-5 w-5 text-cyan-400" />
            Data Sources & Attribution
          </CardTitle>
          <CardDescription className="text-slate-400">
            Based on real cyber crime statistics from official Indian government sources
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {dataSources.map((source, index) => (
              <div key={index} className="border border-slate-600/40 rounded-lg p-4 bg-slate-700/70 hover:bg-slate-700/90 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-semibold text-white mb-1">{source.name}</h4>
                    <p className="text-sm text-slate-300 mb-2">{source.description}</p>
                    <div className="flex items-center gap-2">
                      <Badge className="bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 text-xs">Official Source</Badge>
                      <span className="text-xs text-slate-400">Government Data</span>
                    </div>
                  </div>
                  <Button className="bg-slate-600 hover:bg-slate-500 text-white" size="sm" asChild>
                    <a 
                      href={source.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-1"
                    >
                      <ExternalLink className="h-4 w-4" />
                      Visit
                    </a>
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 p-4 bg-slate-700/60 border border-slate-600/50 rounded-lg">
            <div className="flex items-start gap-2">
              <BarChart3 className="h-5 w-5 text-cyan-400 mt-0.5" />
              <div>
                <h4 className="font-medium text-white mb-2">Data Compilation Methodology</h4>
                <div className="text-sm text-slate-300 space-y-1">
                  <p>• Base statistics compiled from NCRB Crime in India reports (2022-2024)</p>
                  <p>• Financial fraud data cross-referenced with RBI annual reports</p>
                  <p>• State-wise data normalized using 2023 population census projections</p>
                  <p>• Risk levels calculated based on cases per 100,000 population</p>
                  <p>• Trend directions based on YoY growth from government reports</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 p-3 bg-yellow-900/30 border border-yellow-500/50 rounded-lg">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-yellow-400" />
              <span className="text-sm font-medium text-yellow-300">Last Data Update</span>
            </div>
            <p className="text-sm text-yellow-200 mt-1">
              Base data: September 2024 | Live increments: Real-time simulation
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Session Information */}
      <Card className="bg-slate-800/80 border border-slate-700/60">
        <CardHeader className="bg-slate-900/60 rounded-t-lg border-b border-slate-700/60">
          <CardTitle className="flex items-center gap-2 text-white">
            <Users className="h-5 w-5 text-cyan-400" />
            Session Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-400">First Session</span>
              <span className="text-sm font-medium text-white">
                {new Date(sessionInfo.firstSession).toLocaleDateString()} at{' '}
                {new Date(sessionInfo.firstSession).toLocaleTimeString()}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-400">Current Session</span>
              <span className="text-sm font-medium text-white">
                {new Date(sessionInfo.lastSession).toLocaleDateString()} at{' '}
                {new Date(sessionInfo.lastSession).toLocaleTimeString()}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-400">Total Sessions</span>
              <Badge className="bg-cyan-500/20 text-cyan-300 border border-cyan-500/50">{sessionInfo.count}</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DataSources;
