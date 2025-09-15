import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Shield,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  Users,
  Globe,
  Lock,
  Eye,
  Activity,
  BarChart3,
  Zap,
  FileText,
} from "lucide-react";

const Dashboard = () => {
  const securityMetrics = [
    {
      title: "Security Score",
      value: "87%",
      description: "Overall security rating",
      icon: Shield,
      color: "text-cyber-success",
      progress: 87,
    },
    {
      title: "Threats Blocked",
      value: "1,249",
      description: "This month",
      icon: AlertTriangle,
      color: "text-cyber-warning",
      trend: "+12%",
    },
    {
      title: "Incidents Resolved",
      value: "98",
      description: "Successfully handled",
      icon: CheckCircle,
      color: "text-cyber-success",
      trend: "+5%",
    },
    {
      title: "Active Monitors",
      value: "24/7",
      description: "Continuous protection",
      icon: Eye,
      color: "text-primary",
    },
  ];

  const recentActivities = [
    {
      type: "FIR Generated",
      description: "Online fraud report filed",
      time: "2 hours ago",
      icon: FileText,
      severity: "high",
    },
    {
      type: "Password Check",
      description: "Weak password detected and updated",
      time: "4 hours ago",
      icon: Lock,
      severity: "medium",
    },
    {
      type: "Threat Blocked",
      description: "Phishing attempt prevented",
      time: "6 hours ago",
      icon: Shield,
      severity: "high",
    },
    {
      type: "System Scan",
      description: "Security scan completed",
      time: "1 day ago",
      icon: Activity,
      severity: "low",
    },
  ];

  const threatSummary = [
    { type: "Phishing", count: 45, trend: "down" },
    { type: "Malware", count: 23, trend: "up" },
    { type: "Social Engineering", count: 18, trend: "down" },
    { type: "Identity Theft", count: 12, trend: "stable" },
  ];

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "high": return "text-cyber-danger";
      case "medium": return "text-cyber-warning";
      case "low": return "text-cyber-success";
      default: return "text-muted-foreground";
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "up": return "↗️";
      case "down": return "↘️";
      default: return "➡️";
    }
  };

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 rounded-full bg-primary/10 glow-primary">
              <BarChart3 className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h1 className="text-4xl md:text-5xl font-bold">
                <span className="gradient-primary bg-clip-text text-transparent">Security Dashboard</span>
              </h1>
              <p className="text-xl text-muted-foreground">
                Real-time cybersecurity insights and monitoring
              </p>
            </div>
          </div>
        </div>

        {/* Security Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {securityMetrics.map((metric, index) => (
            <Card key={index} className="border-border/40 transition-all hover:glow-primary">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <metric.icon className={`h-6 w-6 ${metric.color}`} />
                  </div>
                  {metric.trend && (
                    <Badge variant="secondary" className="text-xs">
                      {metric.trend}
                    </Badge>
                  )}
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-bold">{metric.value}</h3>
                  <p className="text-sm text-muted-foreground">{metric.description}</p>
                  {metric.progress && (
                    <Progress value={metric.progress} className="h-2" />
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          {/* Recent Activities */}
          <Card className="border-border/40">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-primary" />
                Recent Activities
              </CardTitle>
              <CardDescription>
                Latest security events and actions taken
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivities.map((activity, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-4 p-3 rounded-lg bg-muted/30 transition-all hover:bg-muted/50"
                  >
                    <div className="p-2 rounded-full bg-primary/10">
                      <activity.icon className={`h-4 w-4 ${getSeverityColor(activity.severity)}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-sm">{activity.type}</h4>
                      <p className="text-sm text-muted-foreground">{activity.description}</p>
                      <p className="text-xs text-muted-foreground mt-1">{activity.time}</p>
                    </div>
                    <Badge
                      variant="secondary"
                      className={`text-xs ${getSeverityColor(activity.severity)}`}
                    >
                      {activity.severity}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Threat Summary */}
          <Card className="border-border/40">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-primary" />
                Threat Analysis
              </CardTitle>
              <CardDescription>
                Current threat landscape overview
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {threatSummary.map((threat, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/30"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full bg-primary"></div>
                      <span className="font-medium">{threat.type}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">{threat.count}</span>
                      <span className="text-lg">{getTrendIcon(threat.trend)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="border-border/40">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-primary" />
              Quick Actions
            </CardTitle>
            <CardDescription>
              Frequently used security tools and features
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { name: "Generate FIR", icon: FileText, href: "/fir-generator" },
                { name: "Check Password", icon: Lock, href: "/password-checker" },
                { name: "Scan Document", icon: Eye, href: "#" },
                { name: "Report Scam", icon: AlertTriangle, href: "#" },
              ].map((action, index) => (
                <div
                  key={index}
                  className="flex flex-col items-center p-4 rounded-lg bg-muted/30 transition-all hover:bg-muted/50 hover:glow-primary cursor-pointer"
                >
                  <div className="p-3 rounded-full bg-primary/10 mb-3">
                    <action.icon className="h-6 w-6 text-primary" />
                  </div>
                  <span className="text-sm font-medium text-center">{action.name}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Status Banner */}
        <div className="mt-8 p-6 rounded-lg bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-full bg-cyber-success/20">
              <Shield className="h-8 w-8 text-cyber-success" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-cyber-success">All Systems Operational</h3>
              <p className="text-muted-foreground">
                CyberCop security systems are running smoothly. Your digital assets are protected 24/7.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;