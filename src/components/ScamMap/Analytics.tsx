import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Area,
  AreaChart
} from 'recharts';
import { 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  Shield,
  DollarSign,
  Users,
  Target
} from 'lucide-react';
import { mockScamData } from '@/services/scamDataService';

interface AnalyticsProps {
  scamData?: any[];
  aggregatedStats?: any;
  topStates?: any[];
  selectedStates?: string[];
  timeframe?: 'month' | 'quarter' | 'year';
}

export const FraudTypesChart = ({ aggregatedStats }: AnalyticsProps) => {
  if (!aggregatedStats) return <div>Loading fraud types data...</div>;
  
  const fraudTypesData = [
    { name: 'Financial Fraud', value: aggregatedStats.financialFraud, color: '#EF4444' },
    { name: 'Online Fraud', value: aggregatedStats.onlineFraud, color: '#F59E0B' },
    { name: 'Identity Theft', value: aggregatedStats.identityTheft, color: '#8B5CF6' },
    { name: 'Phishing', value: aggregatedStats.phishing, color: '#06B6D4' },
    { name: 'Data Theft', value: aggregatedStats.dataTheft, color: '#10B981' },
    { name: 'Social Engineering', value: aggregatedStats.socialEngineering, color: '#6B7280' }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5" />
          Fraud Types Distribution
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={fraudTypesData}
                cx="50%"
                cy="50%"
                outerRadius={80}
                dataKey="value"
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                labelLine={false}
              >
                {fraudTypesData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value: number) => [value.toLocaleString(), 'Cases']} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export const TopStatesChart = ({ topStates }: AnalyticsProps) => {
  if (!topStates) return <div>Loading top states data...</div>;
  const displayStates = topStates.slice(0, 10);
  
  const chartData = displayStates.map(state => ({
    name: state.stateCode,
    fullName: state.stateName,
    cases: state.totalCases,
    loss: state.totalLoss,
    riskColor: state.riskLevel === 'Critical' ? '#7C2D12' :
                state.riskLevel === 'High' ? '#EF4444' :
                state.riskLevel === 'Medium' ? '#F59E0B' : '#10B981'
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart className="h-5 w-5" />
          Top 10 States by Cases
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip 
                formatter={(value: number, name: string, props: any) => [
                  value.toLocaleString(), 
                  name === 'cases' ? 'Cases' : 'Loss (₹ Cr)'
                ]}
                labelFormatter={(label: string, payload: any) => {
                  const data = payload?.[0]?.payload;
                  return data ? data.fullName : label;
                }}
              />
              <Bar dataKey="cases" fill="#3B82F6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export const RiskLevelSummary = ({ scamData }: AnalyticsProps) => {
  if (!scamData) return <div>Loading risk level data...</div>;
  
  const riskLevels = {
    Critical: scamData.filter(s => s.riskLevel === 'Critical').length,
    High: scamData.filter(s => s.riskLevel === 'High').length,
    Medium: scamData.filter(s => s.riskLevel === 'Medium').length,
    Low: scamData.filter(s => s.riskLevel === 'Low').length
  };

  const totalStates = scamData.length;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Risk Level Summary
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {Object.entries(riskLevels).map(([level, count]) => (
          <div key={level} className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">{level} Risk</span>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">{count} states</span>
                <Badge 
                  variant={level === 'Critical' ? 'destructive' : 
                          level === 'High' ? 'secondary' : 'default'}
                  className="text-xs"
                >
                  {((count / totalStates) * 100).toFixed(0)}%
                </Badge>
              </div>
            </div>
            <Progress 
              value={(count / totalStates) * 100}
              className={`h-2 ${
                level === 'Critical' ? 'bg-red-100' :
                level === 'High' ? 'bg-orange-100' :
                level === 'Medium' ? 'bg-yellow-100' : 'bg-green-100'
              }`}
            />
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export const TrendAnalysis = ({ scamData }: AnalyticsProps) => {
  if (!scamData) return <div>Loading trend data...</div>;
  
  const trendData = {
    up: scamData.filter(s => s.trendDirection === 'up').length,
    down: scamData.filter(s => s.trendDirection === 'down').length,
    stable: scamData.filter(s => s.trendDirection === 'stable').length
  };

  // Mock historical data for trend chart
  const historicalData = [
    { month: 'Jan', cases: 8500, loss: 234 },
    { month: 'Feb', cases: 9200, loss: 267 },
    { month: 'Mar', cases: 10800, loss: 298 },
    { month: 'Apr', cases: 11500, loss: 345 },
    { month: 'May', cases: 13200, loss: 398 },
    { month: 'Jun', cases: 14800, loss: 456 }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Current Trends
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-red-500" />
                <span className="font-medium">Increasing</span>
              </div>
              <span className="text-lg font-bold text-red-600">{trendData.up} states</span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div className="flex items-center gap-2">
                <TrendingDown className="h-4 w-4 text-green-500" />
                <span className="font-medium">Decreasing</span>
              </div>
              <span className="text-lg font-bold text-green-600">{trendData.down} states</span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 bg-gray-400 rounded-full" />
                <span className="font-medium">Stable</span>
              </div>
              <span className="text-lg font-bold text-gray-600">{trendData.stable} states</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>6-Month Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={historicalData}>
                <defs>
                  <linearGradient id="colorCases" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" />
                <YAxis />
                <CartesianGrid strokeDasharray="3 3" />
                <Tooltip formatter={(value: number) => [value.toLocaleString(), 'Cases']} />
                <Area 
                  type="monotone" 
                  dataKey="cases" 
                  stroke="#3B82F6" 
                  fillOpacity={1} 
                  fill="url(#colorCases)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export const KeyMetrics = ({ aggregatedStats, scamData }: AnalyticsProps) => {
  if (!aggregatedStats || !scamData) return <div>Loading metrics data...</div>;
  
  const criticalStates = scamData.filter(s => s.riskLevel === 'Critical').length;
  const avgLossPerCase = aggregatedStats.totalLoss / aggregatedStats.totalCases * 100000; // Converting to actual amount

  const metrics = [
    {
      title: 'Total Active Cases',
      value: aggregatedStats.totalCases.toLocaleString(),
      change: '+12%',
      trend: 'up',
      icon: AlertTriangle,
      color: 'text-red-500'
    },
    {
      title: 'Financial Loss',
      value: `₹${aggregatedStats.totalLoss.toFixed(0)} Cr`,
      change: '+8%',
      trend: 'up',
      icon: DollarSign,
      color: 'text-green-500'
    },
    {
      title: 'Critical Risk States',
      value: criticalStates.toString(),
      change: '+2',
      trend: 'up',
      icon: Shield,
      color: 'text-blue-500'
    },
    {
      title: 'Avg Loss/Case',
      value: `₹${avgLossPerCase.toFixed(0)}`,
      change: '-5%',
      trend: 'down',
      icon: Users,
      color: 'text-purple-500'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {metrics.map((metric, index) => (
        <Card key={index}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{metric.title}</p>
                <p className="text-2xl font-bold text-gray-900">{metric.value}</p>
                <div className="flex items-center mt-2">
                  {metric.trend === 'up' ? (
                    <TrendingUp className="h-4 w-4 text-red-500" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-green-500" />
                  )}
                  <span className={`ml-1 text-sm ${
                    metric.trend === 'up' ? 'text-red-500' : 'text-green-500'
                  }`}>
                    {metric.change}
                  </span>
                </div>
              </div>
              <div className={`p-2 rounded-lg bg-gray-100`}>
                <metric.icon className={`h-6 w-6 ${metric.color}`} />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
