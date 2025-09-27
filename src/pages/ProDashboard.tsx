import { useState, useEffect } from "react";
import { Crown, Shield, Chrome, MessageSquare, FileText, Zap, CheckCircle, Download, ExternalLink } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Badge, Alert, AlertDescription, useAuth, useSubscription } from '@/lib/hooks';
import { ExtensionDownload } from "@/components/ExtensionDownload";
import { Link } from "react-router-dom";

const ProDashboard = () => {
  const { user } = useAuth();
  const { currentSubscription, getCurrentPlan } = useSubscription();
  const [showExtensionSection, setShowExtensionSection] = useState(false);

  const currentPlan = getCurrentPlan();

  useEffect(() => {
    // Show celebration animation or welcome message
    const timer = setTimeout(() => {
      setShowExtensionSection(true);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const proFeatures = [
    {
      icon: <FileText className="h-6 w-6" />,
      title: "Unlimited FIR Generator",
      description: "Generate unlimited FIR reports with advanced templates and customization options.",
      link: "/fir-generator",
      status: "available"
    },
    {
      icon: <MessageSquare className="h-6 w-6" />,
      title: "Premium Message Analyzer",
      description: "Advanced AI-powered fraud detection for WhatsApp messages and communications.",
      link: "/fraud-message-detector",
      status: "available"
    },
    {
      icon: <Chrome className="h-6 w-6" />,
      title: "Chrome Extension",
      description: "Real-time fraud protection while browsing with advanced threat detection.",
      link: "#extension",
      status: "new",
      highlight: true
    },
    {
      icon: <Shield className="h-6 w-6" />,
      title: "Advanced OCR Scanning",
      description: "Enhanced document scanning with higher accuracy and batch processing.",
      link: "/ocr-fraud-detection",
      status: "available"
    },
    {
      icon: <Zap className="h-6 w-6" />,
      title: "Priority Support",
      description: "Get priority email support with faster response times and dedicated assistance.",
      link: "/help",
      status: "available"
    }
  ];

  const usageStats = [
    { label: "FIR Reports", current: 5, limit: 50, color: "bg-cyber-neon" },
    { label: "Message Analysis", current: 12, limit: 500, color: "bg-cyber-success" },
    { label: "OCR Scans", current: 3, limit: 100, color: "bg-cyber-electric" }
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Welcome Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 mb-4 px-4 py-2 bg-gradient-to-r from-cyber-neon to-cyber-electric text-primary-foreground rounded-full glow-primary">
            <Crown className="h-5 w-5" />
            <span className="font-semibold">Welcome to Pro!</span>
          </div>
          <h1 className="text-4xl font-bold text-foreground mb-4">
            🎉 Congratulations, {user?.user_metadata?.name || user?.email?.split('@')[0] || 'User'}!
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Your subscription has been successfully activated. You now have access to all premium cybersecurity features.
          </p>
        </div>

        {/* Subscription Status */}
        <Card className="mb-8 border-cyber-success/30 bg-cyber-success/10 glow-accent">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-8 w-8 text-cyber-success" />
                <div>
                  <h3 className="font-semibold text-cyber-success">Pro Subscription Active</h3>
                  <p className="text-sm text-cyber-success/80">
                    Plan: {currentPlan?.name} • 
                    Expires: {currentSubscription?.ends_at ? new Date(currentSubscription.ends_at).toLocaleDateString() : 'Never'}
                  </p>
                </div>
              </div>
              <Badge className="bg-cyber-success text-primary-foreground">
                <Crown className="h-3 w-3 mr-1" />
                Pro Active
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Usage Statistics */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Your Pro Usage This Month
            </CardTitle>
            <CardDescription>
              Track your usage across all premium features
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {usageStats.map((stat, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">{stat.label}</span>
                    <span className="text-muted-foreground">{stat.current}/{stat.limit}</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${stat.color}`}
                      style={{ width: `${(stat.current / stat.limit) * 100}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {stat.limit - stat.current} remaining
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Premium Features Grid */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-center mb-8 text-foreground">Your Premium Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {proFeatures.map((feature, index) => (
              <Card 
                key={index} 
                className={`relative transition-all duration-300 hover:shadow-lg cursor-pointer glow-primary ${
                  feature.highlight ? 'ring-2 ring-cyber-neon bg-gradient-to-br from-cyber-neon/10 to-cyber-electric/10' : ''
                }`}
                onClick={() => {
                  if (feature.link === "#extension") {
                    setShowExtensionSection(true);
                    document.getElementById('extension-section')?.scrollIntoView({ behavior: 'smooth' });
                  } else {
                    window.location.href = feature.link;
                  }
                }}
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${feature.highlight ? 'bg-cyber-neon text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                        {feature.icon}
                      </div>
                      <CardTitle className="text-lg">{feature.title}</CardTitle>
                    </div>
                    {feature.status === "new" && (
                      <Badge className="bg-cyber-danger text-primary-foreground animate-pulse">
                        NEW!
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-sm mb-4">
                    {feature.description}
                  </CardDescription>
                  <Button 
                    variant={feature.highlight ? "default" : "outline"} 
                    size="sm" 
                    className="w-full"
                    asChild={feature.link !== "#extension"}
                  >
                    {feature.link === "#extension" ? (
                      <span>Access Feature</span>
                    ) : (
                      <Link to={feature.link}>
                        Access Feature
                        <ExternalLink className="h-3 w-3 ml-1" />
                      </Link>
                    )}
                  </Button>
                </CardContent>
                {feature.highlight && (
                  <div className="absolute -top-2 -right-2">
                    <div className="bg-yellow-400 text-yellow-800 text-xs font-bold px-2 py-1 rounded-full animate-bounce">
                      🔥 HOT
                    </div>
                  </div>
                )}
              </Card>
            ))}
          </div>
        </div>

        {/* Chrome Extension Section */}
        {showExtensionSection && (
          <div id="extension-section" className="mb-12">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-4 text-foreground">🔥 Your Premium Chrome Extension</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Get real-time fraud protection while browsing the web. Your license key is ready!
              </p>
            </div>
            <ExtensionDownload />
          </div>
        )}

        <Separator className="my-8" />

        {/* Quick Actions */}
        <div className="text-center">
          <h3 className="text-xl font-semibold mb-6 text-foreground">Quick Actions</h3>
          <div className="flex flex-wrap justify-center gap-4">
            <Button asChild variant="outline">
              <Link to="/fir-generator">
                <FileText className="h-4 w-4 mr-2" />
                Generate FIR
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/fraud-message-detector">
                <MessageSquare className="h-4 w-4 mr-2" />
                Analyze Messages
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/subscription">
                <Crown className="h-4 w-4 mr-2" />
                Manage Subscription
              </Link>
            </Button>
          </div>
        </div>

        {/* Support Section */}
        <Alert className="mt-8">
          <Shield className="h-4 w-4" />
          <AlertDescription>
            <strong>Pro Support:</strong> Need help? As a Pro subscriber, you get priority email support. 
            Contact us at support@cybercop.com and mention your subscription for faster assistance.
          </AlertDescription>
        </Alert>
      </div>
    </div>
  );
};

export default ProDashboard;
