import { useState } from "react";
import { MessageSquare, AlertTriangle, CheckCircle, Shield, Copy, Trash2, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";

interface FraudDetectionResult {
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  score: number;
  flags: string[];
  recommendations: string[];
  category: string;
}

const FraudMessageDetector = () => {
  const [message, setMessage] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<FraudDetectionResult | null>(null);
  const [analysisHistory, setAnalysisHistory] = useState<Array<{id: string, message: string, result: FraudDetectionResult, timestamp: Date}>>([]);
  const { toast } = useToast();

  // Fraud detection patterns and keywords
  const fraudPatterns = {
    urgentWords: ['urgent', 'immediately', 'expire', 'suspended', 'limited time', 'act now', 'hurry'],
    moneyKeywords: ['money', 'cash', 'reward', 'prize', 'winner', 'lottery', 'inheritance', 'refund', 'compensation'],
    personalInfoRequests: ['otp', 'password', 'pin', 'account number', 'card number', 'cvv', 'personal details'],
    phishingIndicators: ['click here', 'verify account', 'update information', 'confirm identity', 'suspicious activity'],
    impersonation: ['bank', 'government', 'police', 'income tax', 'rbi', 'sbi', 'hdfc', 'icici'],
    scamTypes: {
      lottery: ['lottery', 'winner', 'congratulations', 'prize', 'draw'],
      phishing: ['verify', 'confirm', 'update', 'suspended', 'blocked'],
      investment: ['investment', 'profit', 'returns', 'scheme', 'guaranteed'],
      romance: ['love', 'lonely', 'relationship', 'marriage', 'visa'],
      job: ['job', 'work from home', 'earning', 'part time', 'income']
    }
  };

  const analyzeMessage = (text: string): FraudDetectionResult => {
    const lowerText = text.toLowerCase();
    let score = 0;
    const flags: string[] = [];
    let category = 'unknown';

    // Check for urgent language
    const urgentMatches = fraudPatterns.urgentWords.filter(word => lowerText.includes(word));
    if (urgentMatches.length > 0) {
      score += urgentMatches.length * 15;
      flags.push(`Contains urgent language: ${urgentMatches.join(', ')}`);
    }

    // Check for money-related keywords
    const moneyMatches = fraudPatterns.moneyKeywords.filter(word => lowerText.includes(word));
    if (moneyMatches.length > 0) {
      score += moneyMatches.length * 20;
      flags.push(`Money-related terms detected: ${moneyMatches.join(', ')}`);
    }

    // Check for personal information requests
    const personalInfoMatches = fraudPatterns.personalInfoRequests.filter(word => lowerText.includes(word));
    if (personalInfoMatches.length > 0) {
      score += personalInfoMatches.length * 25;
      flags.push(`Requests personal information: ${personalInfoMatches.join(', ')}`);
    }

    // Check for phishing indicators
    const phishingMatches = fraudPatterns.phishingIndicators.filter(phrase => lowerText.includes(phrase));
    if (phishingMatches.length > 0) {
      score += phishingMatches.length * 30;
      flags.push(`Phishing indicators: ${phishingMatches.join(', ')}`);
    }

    // Check for impersonation
    const impersonationMatches = fraudPatterns.impersonation.filter(entity => lowerText.includes(entity));
    if (impersonationMatches.length > 0) {
      score += impersonationMatches.length * 20;
      flags.push(`Impersonates trusted entities: ${impersonationMatches.join(', ')}`);
    }

    // Determine scam category
    for (const [type, keywords] of Object.entries(fraudPatterns.scamTypes)) {
      const matches = keywords.filter(word => lowerText.includes(word));
      if (matches.length >= 2) {
        category = type;
        score += 25;
        flags.push(`Potential ${type} scam detected`);
        break;
      }
    }

    // Check for suspicious patterns
    if (/\d{10,}/.test(text)) {
      score += 15;
      flags.push('Contains long number sequences (possible phone/account numbers)');
    }

    if (text.includes('http') || text.includes('www') || text.includes('.com')) {
      score += 20;
      flags.push('Contains suspicious links');
    }

    if (lowerText.match(/free|100%|guaranteed|risk-free/)) {
      score += 15;
      flags.push('Contains too-good-to-be-true offers');
    }

    // Determine risk level
    let riskLevel: 'low' | 'medium' | 'high' | 'critical';
    if (score >= 80) riskLevel = 'critical';
    else if (score >= 60) riskLevel = 'high';
    else if (score >= 30) riskLevel = 'medium';
    else riskLevel = 'low';

    // Generate recommendations
    const recommendations: string[] = [];
    if (riskLevel === 'critical' || riskLevel === 'high') {
      recommendations.push('🚨 Do NOT respond to this message or provide any personal information');
      recommendations.push('🚫 Block the sender immediately');
      recommendations.push('📱 Report this number to cybercrime authorities');
      recommendations.push('⚠️ Warn friends and family about this type of scam');
    } else if (riskLevel === 'medium') {
      recommendations.push('⚠️ Be cautious - verify sender identity through official channels');
      recommendations.push('🔍 Do not click any links or download attachments');
      recommendations.push('📞 Contact the organization directly using official contact information');
    } else {
      recommendations.push('✅ Message appears relatively safe');
      recommendations.push('🛡️ Always remain vigilant for suspicious content');
    }

    return {
      riskLevel,
      score: Math.min(score, 100),
      flags,
      recommendations,
      category
    };
  };

  const handleAnalyze = () => {
    if (!message.trim()) {
      toast({
        title: "No Message",
        description: "Please enter a message to analyze.",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);

    // Simulate analysis delay
    setTimeout(() => {
      const analysisResult = analyzeMessage(message);
      setResult(analysisResult);
      
      // Add to history
      const historyItem = {
        id: crypto.randomUUID(),
        message: message.trim(),
        result: analysisResult,
        timestamp: new Date()
      };
      setAnalysisHistory(prev => [historyItem, ...prev.slice(0, 9)]); // Keep last 10 analyses

      setIsAnalyzing(false);
      
      toast({
        title: "Analysis Complete",
        description: `Risk level: ${analysisResult.riskLevel.toUpperCase()}`,
        variant: analysisResult.riskLevel === 'high' || analysisResult.riskLevel === 'critical' ? "destructive" : "default",
      });
    }, 1500);
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'critical': return 'bg-red-600 hover:bg-red-700';
      case 'high': return 'bg-red-500 hover:bg-red-600';
      case 'medium': return 'bg-yellow-500 hover:bg-yellow-600';
      case 'low': return 'bg-green-500 hover:bg-green-600';
      default: return 'bg-gray-500 hover:bg-gray-600';
    }
  };

  const getRiskIcon = (level: string) => {
    switch (level) {
      case 'critical':
      case 'high':
        return <AlertTriangle className="h-4 w-4" />;
      case 'medium':
        return <Shield className="h-4 w-4" />;
      case 'low':
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <Shield className="h-4 w-4" />;
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: "Text copied to clipboard.",
    });
  };

  const clearHistory = () => {
    setAnalysisHistory([]);
    toast({
      title: "History Cleared",
      description: "Analysis history has been cleared.",
    });
  };

  const exportReport = (item: typeof analysisHistory[0]) => {
    const report = `
FRAUD MESSAGE ANALYSIS REPORT
Generated: ${item.timestamp.toLocaleString()}
Risk Level: ${item.result.riskLevel.toUpperCase()}
Risk Score: ${item.result.score}/100
Category: ${item.result.category}

MESSAGE ANALYZED:
${item.message}

RISK FACTORS DETECTED:
${item.result.flags.map(flag => `• ${flag}`).join('\n')}

RECOMMENDATIONS:
${item.result.recommendations.map(rec => `• ${rec}`).join('\n')}

---
Generated by CyberCop Safe Space
    `;
    
    const blob = new Blob([report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `fraud-analysis-${item.timestamp.toISOString().split('T')[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <div className="p-4 rounded-full bg-primary/10 glow-primary">
              <MessageSquare className="h-12 w-12 text-primary" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="gradient-primary bg-clip-text text-transparent">Fraud Message Detector</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Analyze WhatsApp messages and text content to detect potential fraud, phishing attempts, and scams using AI-powered pattern recognition.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Message Input Section */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Message Analysis
                </CardTitle>
                <CardDescription>
                  Paste the suspicious message below to analyze it for potential fraud indicators
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  placeholder="Paste the WhatsApp message or text you want to analyze for fraud patterns..."
                  className="min-h-[200px] resize-none"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                />
                <div className="flex gap-2">
                  <Button 
                    onClick={handleAnalyze} 
                    disabled={isAnalyzing || !message.trim()}
                    className="flex-1"
                  >
                    {isAnalyzing ? "Analyzing..." : "Analyze Message"}
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setMessage("")}
                    disabled={!message.trim()}
                  >
                    Clear
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Common Fraud Indicators Info */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="text-lg">Common Fraud Indicators</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="h-4 w-4 text-red-500 mt-1 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-sm">Urgent Language</p>
                      <p className="text-xs text-muted-foreground">Words like "urgent", "immediately", "expire", "limited time"</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="h-4 w-4 text-red-500 mt-1 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-sm">Personal Info Requests</p>
                      <p className="text-xs text-muted-foreground">Asking for OTP, passwords, card details, or account information</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="h-4 w-4 text-red-500 mt-1 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-sm">Too Good to be True</p>
                      <p className="text-xs text-muted-foreground">Unrealistic offers, lottery wins, guaranteed profits</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="h-4 w-4 text-red-500 mt-1 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-sm">Impersonation</p>
                      <p className="text-xs text-muted-foreground">Claiming to be from banks, government, or official organizations</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Analysis Results Section */}
          <div>
            {result && (
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <Shield className="h-5 w-5" />
                      Analysis Result
                    </span>
                    <Badge className={`${getRiskColor(result.riskLevel)} text-white`}>
                      {getRiskIcon(result.riskLevel)}
                      <span className="ml-1">{result.riskLevel.toUpperCase()}</span>
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Risk Score:</span>
                    <span className="text-lg font-bold">{result.score}/100</span>
                  </div>

                  {result.category !== 'unknown' && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Category:</span>
                      <Badge variant="outline">{result.category}</Badge>
                    </div>
                  )}

                  <Separator />

                  {result.flags.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-2 text-red-600">⚠️ Risk Factors Detected:</h4>
                      <ul className="space-y-1">
                        {result.flags.map((flag, index) => (
                          <li key={index} className="text-sm text-muted-foreground flex items-start gap-1">
                            <span className="text-red-500">•</span>
                            {flag}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <Separator />

                  <div>
                    <h4 className="font-medium mb-2 text-green-600">💡 Recommendations:</h4>
                    <ul className="space-y-1">
                      {result.recommendations.map((rec, index) => (
                        <li key={index} className="text-sm text-muted-foreground">
                          {rec}
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            )}

            {!result && (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center text-muted-foreground">
                    <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Enter a message above to see the fraud analysis results here.</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Analysis History */}
            {analysisHistory.length > 0 && (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Recent Analyses</CardTitle>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={clearHistory}
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Clear
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 max-h-[400px] overflow-y-auto">
                    {analysisHistory.map((item) => (
                      <div key={item.id} className="border rounded-lg p-3">
                        <div className="flex items-center justify-between mb-2">
                          <Badge className={`${getRiskColor(item.result.riskLevel)} text-white text-xs`}>
                            {item.result.riskLevel.toUpperCase()}
                          </Badge>
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => copyToClipboard(item.message)}
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => exportReport(item)}
                            >
                              <Download className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground truncate">{item.message}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {item.timestamp.toLocaleString()}
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Safety Tips Alert */}
        <Alert className="mt-8">
          <Shield className="h-4 w-4" />
          <AlertDescription>
            <strong>Safety Reminder:</strong> Never share personal information, OTPs, passwords, or banking details through messages. 
            When in doubt, contact the organization directly using official contact information. Report suspicious messages to cybercrime authorities.
          </AlertDescription>
        </Alert>
      </div>
    </div>
  );
};

export default FraudMessageDetector;
