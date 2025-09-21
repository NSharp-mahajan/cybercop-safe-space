import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  BookOpen, 
  Search, 
  CreditCard, 
  Phone, 
  Mail, 
  MessageSquare, 
  Globe, 
  Shield,
  AlertTriangle,
  ExternalLink
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

const ScamLibrary = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const scamCategories = [
    { id: "all", name: "All Scams", icon: BookOpen },
    { id: "phishing", name: "Phishing", icon: Mail },
    { id: "phone", name: "Phone Scams", icon: Phone },
    { id: "financial", name: "Financial", icon: CreditCard },
    { id: "social", name: "Social Media", icon: MessageSquare },
    { id: "online", name: "Online", icon: Globe },
  ];

  const scamData = [
    {
      id: 1,
      title: "Email Phishing Attacks",
      category: "phishing",
      severity: "high",
      description: "Fraudulent emails designed to steal personal information, passwords, or financial details.",
      methods: ["Fake bank emails", "Suspicious attachments", "Urgent action requests"],
      prevention: ["Verify sender identity", "Check URLs carefully", "Never share passwords via email"],
      examples: "Emails claiming your account will be closed unless you click a link and verify details."
    },
    {
      id: 2,
      title: "Fake Tech Support Calls",
      category: "phone",
      severity: "high",
      description: "Scammers pose as tech support from major companies to gain remote access to your computer.",
      methods: ["Cold calling", "Fake virus warnings", "Remote access requests"],
      prevention: ["Hang up and call official support", "Never allow remote access", "Companies don't call unsolicited"],
      examples: "Calls claiming your computer is infected and needs immediate remote assistance."
    },
    {
      id: 3,
      title: "Investment Fraud",
      category: "financial",
      severity: "high",
      description: "Fake investment opportunities promising unrealistic returns with little to no risk.",
      methods: ["Ponzi schemes", "Cryptocurrency scams", "Get-rich-quick promises"],
      prevention: ["Research thoroughly", "Be skeptical of guaranteed returns", "Use registered advisors only"],
      examples: "Offers of guaranteed 500% returns in cryptocurrency or foreign exchange trading."
    },
    {
      id: 4,
      title: "Social Media Romance Scams",
      category: "social",
      severity: "medium",
      description: "Fake online relationships designed to emotionally manipulate victims into sending money.",
      methods: ["Fake profiles", "Emotional manipulation", "Emergency money requests"],
      prevention: ["Video chat before meeting", "Never send money", "Be wary of quick emotional attachment"],
      examples: "Online romantic interest asking for money for travel, medical emergencies, or visa fees."
    },
    {
      id: 5,
      title: "Online Shopping Fraud",
      category: "online",
      severity: "medium",
      description: "Fake online stores or marketplace sellers taking payment without delivering goods.",
      methods: ["Too-good-to-be-true prices", "Fake websites", "No contact information"],
      prevention: ["Use secure payment methods", "Check seller reviews", "Verify website authenticity"],
      examples: "Brand name products sold at extremely low prices on suspicious websites."
    },
    {
      id: 6,
      title: "SMS Phishing (Smishing)",
      category: "phishing",
      severity: "medium",
      description: "Text messages with malicious links designed to steal personal information.",
      methods: ["Fake delivery notifications", "Bank security alerts", "Prize announcements"],
      prevention: ["Don't click suspicious links", "Verify with official channels", "Report spam messages"],
      examples: "Texts claiming package delivery issues or account security problems requiring immediate action."
    }
  ];

  const filteredScams = scamData.filter(scam => {
    const matchesSearch = scam.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         scam.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || scam.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "high": return "destructive";
      case "medium": return "secondary";
      default: return "default";
    }
  };

  const getSeverityIcon = (severity: string) => {
    return severity === "high" ? AlertTriangle : Shield;
  };

  return (
    <div className="min-h-screen bg-cyber-grid">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <div className="p-3 rounded-full bg-primary/10 border border-primary/20 glow-primary">
                <BookOpen className="h-8 w-8 text-primary" />
              </div>
            </div>
            <h1 className="text-4xl font-bold gradient-primary bg-clip-text text-transparent mb-4">
              Scam Awareness Library
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Learn about common scams and how to protect yourself from cybercriminals
            </p>
          </div>

          {/* Search and Filter */}
          <div className="flex flex-col md:flex-row gap-4 mb-8">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search scams..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2 overflow-x-auto">
              {scamCategories.map((category) => (
                <Button
                  key={category.id}
                  variant={selectedCategory === category.id ? "default" : "outline"}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`whitespace-nowrap transition-glow ${
                    selectedCategory === category.id ? "glow-primary" : "hover:glow-primary"
                  }`}
                >
                  <category.icon className="mr-2 h-4 w-4" />
                  {category.name}
                </Button>
              ))}
            </div>
          </div>

          {/* Scam Cards */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {filteredScams.map((scam) => {
              const SeverityIcon = getSeverityIcon(scam.severity);
              return (
                <Card key={scam.id} className="cyber-card h-full">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <SeverityIcon className="h-5 w-5 text-primary" />
                        {scam.title}
                      </CardTitle>
                      <Badge variant={getSeverityColor(scam.severity)}>
                        {scam.severity}
                      </Badge>
                    </div>
                    <CardDescription>{scam.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-sm mb-2">Common Methods:</h4>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        {scam.methods.map((method, index) => (
                          <li key={index} className="flex items-center gap-2">
                            <div className="w-1 h-1 bg-primary rounded-full" />
                            {method}
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold text-sm mb-2">Prevention Tips:</h4>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        {scam.prevention.map((tip, index) => (
                          <li key={index} className="flex items-center gap-2">
                            <Shield className="w-3 h-3 text-green-500" />
                            {tip}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <Alert>
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription className="text-xs">
                        <strong>Example:</strong> {scam.examples}
                      </AlertDescription>
                    </Alert>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Quick Tips Card */}
          <Card className="cyber-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                Universal Scam Protection Tips
              </CardTitle>
              <CardDescription>
                Golden rules to protect yourself from any type of scam
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <h4 className="font-semibold text-green-500">✅ DO:</h4>
                  <ul className="space-y-2 text-sm">
                    <li>• Verify identity through official channels</li>
                    <li>• Take time to research and think</li>
                    <li>• Use secure payment methods</li>
                    <li>• Trust your instincts if something feels wrong</li>
                    <li>• Keep software and security up to date</li>
                  </ul>
                </div>
                <div className="space-y-3">
                  <h4 className="font-semibold text-red-500">❌ DON'T:</h4>
                  <ul className="space-y-2 text-sm">
                    <li>• Share personal info with unsolicited contacts</li>
                    <li>• Act under pressure or urgency</li>
                    <li>• Click suspicious links or attachments</li>
                    <li>• Send money to unknown recipients</li>
                    <li>• Provide remote access to your devices</li>
                  </ul>
                </div>
              </div>
              
              <div className="mt-6 p-4 rounded-lg bg-primary/5 border border-primary/20">
                <p className="text-sm flex items-center gap-2">
                  <ExternalLink className="h-4 w-4" />
                  <strong>Report Scams:</strong> If you encounter a scam, report it to local authorities and relevant platforms immediately.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ScamLibrary;