import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, FileText, Scan, Upload, Shield, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

const OcrFraudDetection = () => {
  const [text, setText] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [results, setResults] = useState<any>(null);

  const fraudPatterns = [
    { pattern: "urgent", risk: "high", description: "Urgency tactics" },
    { pattern: "limited time", risk: "high", description: "Time pressure" },
    { pattern: "act now", risk: "medium", description: "Action pressure" },
    { pattern: "congratulations", risk: "medium", description: "False rewards" },
    { pattern: "winner", risk: "medium", description: "Fake prizes" },
    { pattern: "click here", risk: "low", description: "Suspicious links" },
  ];

  const analyzeText = async () => {
    setAnalyzing(true);
    
    // Simulate analysis
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const detectedPatterns = fraudPatterns.filter(pattern => 
      text.toLowerCase().includes(pattern.pattern.toLowerCase())
    );
    
    const riskScore = detectedPatterns.reduce((score, pattern) => {
      return score + (pattern.risk === "high" ? 30 : pattern.risk === "medium" ? 20 : 10);
    }, 0);
    
    setResults({
      patterns: detectedPatterns,
      riskScore: Math.min(riskScore, 100),
      riskLevel: riskScore > 60 ? "high" : riskScore > 30 ? "medium" : "low"
    });
    
    setAnalyzing(false);
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case "high": return "text-destructive";
      case "medium": return "text-warning";
      default: return "text-success";
    }
  };

  return (
    <div className="min-h-screen bg-cyber-grid">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <div className="p-3 rounded-full bg-primary/10 border border-primary/20 glow-primary">
                <Scan className="h-8 w-8 text-primary" />
              </div>
            </div>
            <h1 className="text-4xl font-bold gradient-primary bg-clip-text text-transparent mb-4">
              OCR Fraud Detection
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Upload images or paste text to detect potential fraud patterns using advanced AI analysis
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Input Section */}
            <Card className="cyber-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  Text Analysis
                </CardTitle>
                <CardDescription>
                  Paste suspicious text or upload an image for fraud detection
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <Button 
                    variant="outline" 
                    className="w-full h-32 border-dashed border-primary/20 hover:border-primary/40 transition-glow hover:glow-primary"
                  >
                    <div className="flex flex-col items-center gap-2">
                      <Upload className="h-8 w-8 text-primary" />
                      <span>Upload Image (OCR)</span>
                      <span className="text-xs text-muted-foreground">JPG, PNG, PDF</span>
                    </div>
                  </Button>
                  
                  <div className="relative">
                    <Textarea
                      placeholder="Or paste suspicious text here for analysis..."
                      value={text}
                      onChange={(e) => setText(e.target.value)}
                      className="min-h-[150px] resize-none"
                    />
                  </div>
                  
                  <Button 
                    onClick={analyzeText}
                    disabled={!text.trim() || analyzing}
                    className="w-full transition-glow hover:glow-primary"
                  >
                    {analyzing ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent mr-2" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <Shield className="mr-2 h-4 w-4" />
                        Analyze for Fraud
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Results Section */}
            <Card className="cyber-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-primary" />
                  Analysis Results
                </CardTitle>
                <CardDescription>
                  Fraud detection results and risk assessment
                </CardDescription>
              </CardHeader>
              <CardContent>
                {!results ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Scan className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Run analysis to see fraud detection results</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Risk Score */}
                    <div className="text-center">
                      <div className={`text-3xl font-bold ${getRiskColor(results.riskLevel)}`}>
                        {results.riskScore}%
                      </div>
                      <div className="text-sm text-muted-foreground">Fraud Risk Score</div>
                      <Badge 
                        variant={results.riskLevel === "high" ? "destructive" : results.riskLevel === "medium" ? "secondary" : "default"}
                        className="mt-2"
                      >
                        {results.riskLevel.toUpperCase()} RISK
                      </Badge>
                    </div>

                    {/* Detected Patterns */}
                    {results.patterns.length > 0 && (
                      <div>
                        <h4 className="font-semibold mb-3 flex items-center gap-2">
                          <AlertCircle className="h-4 w-4" />
                          Detected Fraud Patterns
                        </h4>
                        <div className="space-y-2">
                          {results.patterns.map((pattern: any, index: number) => (
                            <Alert key={index} className="py-2">
                              <AlertDescription className="flex items-center justify-between">
                                <span>"{pattern.pattern}" - {pattern.description}</span>
                                <Badge 
                                  variant={pattern.risk === "high" ? "destructive" : pattern.risk === "medium" ? "secondary" : "default"}
                                  className="text-xs"
                                >
                                  {pattern.risk}
                                </Badge>
                              </AlertDescription>
                            </Alert>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Recommendations */}
                    <Alert>
                      <Shield className="h-4 w-4" />
                      <AlertDescription>
                        {results.riskLevel === "high" 
                          ? "⚠️ High fraud risk detected! Do not respond or click any links. Report to authorities."
                          : results.riskLevel === "medium"
                          ? "⚡ Moderate risk detected. Verify sender identity before taking any action."
                          : "✅ Low risk detected, but always stay vigilant with unexpected messages."
                        }
                      </AlertDescription>
                    </Alert>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Common Fraud Patterns */}
          <Card className="cyber-card mt-8">
            <CardHeader>
              <CardTitle>Common Fraud Indicators</CardTitle>
              <CardDescription>Learn to identify these suspicious patterns</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {fraudPatterns.map((pattern, index) => (
                  <div key={index} className="p-3 rounded-lg border border-border/40 bg-card/50">
                    <div className="flex items-center justify-between mb-2">
                      <code className="text-sm bg-muted px-2 py-1 rounded">"{pattern.pattern}"</code>
                      <Badge 
                        variant={pattern.risk === "high" ? "destructive" : pattern.risk === "medium" ? "secondary" : "default"}
                        className="text-xs"
                      >
                        {pattern.risk}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{pattern.description}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default OcrFraudDetection;