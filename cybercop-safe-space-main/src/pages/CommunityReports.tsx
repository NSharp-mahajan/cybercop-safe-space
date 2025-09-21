import React from 'react';
import { Users, AlertTriangle, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import ScamReportsList from '@/components/ScamReportsList';

const CommunityReports = () => {
  return (
    <div className="min-h-screen bg-cyber-grid">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <div className="p-3 rounded-full bg-primary/10 border border-primary/20 glow-primary">
                <Users className="h-8 w-8 text-primary" />
              </div>
            </div>
            <h1 className="text-4xl font-bold gradient-primary bg-clip-text text-transparent mb-4">
              Community Scam Reports
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              View and vote on scam reports submitted by the community. Help verify threats and protect others.
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <Card className="cyber-card">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Reports</CardTitle>
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary">1,234</div>
                <p className="text-xs text-muted-foreground">
                  +12% from last month
                </p>
              </CardContent>
            </Card>
            
            <Card className="cyber-card">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Verified Threats</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-500">892</div>
                <p className="text-xs text-muted-foreground">
                  72% verification rate
                </p>
              </CardContent>
            </Card>
            
            <Card className="cyber-card">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Community Votes</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-500">5,678</div>
                <p className="text-xs text-muted-foreground">
                  Active community participation
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Reports List */}
          <Card className="cyber-card">
            <CardHeader>
              <CardTitle>Recent Scam Reports</CardTitle>
              <CardDescription>
                Help the community by voting on the credibility of these reports
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScamReportsList />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CommunityReports;