import { useState, useRef } from "react";
import { 
  Brain,
  MessageSquare,
  ScanText,
  Mic,
  MicOff,
  Upload,
  FileText,
  AlertTriangle,
  Shield,
  CheckCircle,
  XCircle,
  Loader2,
  Download,
  Trash2,
  Eye,
  EyeOff,
  Phone,
  PlayCircle,
  StopCircle,
  Activity
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { audioProcessingService } from "@/services/audioProcessingService";
import { whisperService } from "@/services/whisperService";
import { FraudRiskMeter } from "@/components/FraudRiskMeter";

// Fraud Detection Interfaces
interface FraudDetectionResult {
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  score: number;
  flags: string[];
  recommendations: string[];
  category: string;
}

interface AnalysisHistoryItem {
  id: string;
  message: string;
  result: FraudDetectionResult;
  timestamp: Date;
}

// OCR Interfaces
interface OCRResult {
  text: string;
  confidence: number;
  fraudIndicators: string[];
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  documentType?: string;
  fraudRiskScore?: number;
  recommendations?: string[];
}

// Voice Analysis Interfaces
interface VoiceAnalysisResult {
  isScam: boolean;
  confidence: number;
  transcript: string;
  redFlags: string[];
  scamType?: string;
  recommendations: string[];
  audioFeatures?: {
    duration: number;
    hasBackgroundNoise: boolean;
    silenceRatio: number;
    averageAmplitude: number;
  };
  detailedScores: {
    urgencyScore: number;
    financialScore: number;
    threatScore: number;
    impersonationScore: number;
    personalInfoScore: number;
    technicalScore: number;
  };
}

const AIDetectionHub = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("fraud-message");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);

  // Fraud Message Detector State
  const [message, setMessage] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [fraudResult, setFraudResult] = useState<FraudDetectionResult | null>(null);
  const [analysisHistory, setAnalysisHistory] = useState<AnalysisHistoryItem[]>([]);

  // OCR State
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isProcessingOCR, setIsProcessingOCR] = useState(false);
  const [ocrResult, setOcrResult] = useState<OCRResult | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Voice Analysis State
  const [isRecording, setIsRecording] = useState(false);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [isProcessingVoice, setIsProcessingVoice] = useState(false);
  const [voiceResult, setVoiceResult] = useState<VoiceAnalysisResult | null>(null);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [audioChunks, setAudioChunks] = useState<Blob[]>([]);

  // Fraud Message Detector Logic
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
      flags.push(`Urgent language detected: ${urgentMatches.join(', ')}`);
    }

    // Check for money-related keywords
    const moneyMatches = fraudPatterns.moneyKeywords.filter(word => lowerText.includes(word));
    if (moneyMatches.length > 0) {
      score += moneyMatches.length * 20;
      flags.push(`Money-related keywords: ${moneyMatches.join(', ')}`);
    }

    // Check for personal information requests
    const personalInfoMatches = fraudPatterns.personalInfoRequests.filter(word => lowerText.includes(word));
    if (personalInfoMatches.length > 0) {
      score += personalInfoMatches.length * 25;
      flags.push(`Personal information requests: ${personalInfoMatches.join(', ')}`);
    }

    // Check for phishing indicators
    const phishingMatches = fraudPatterns.phishingIndicators.filter(phrase => lowerText.includes(phrase));
    if (phishingMatches.length > 0) {
      score += phishingMatches.length * 30;
      flags.push(`Phishing indicators: ${phishingMatches.join(', ')}`);
    }

    // Check for impersonation
    const impersonationMatches = fraudPatterns.impersonation.filter(word => lowerText.includes(word));
    if (impersonationMatches.length > 0) {
      score += impersonationMatches.length * 20;
      flags.push(`Potential impersonation: ${impersonationMatches.join(', ')}`);
    }

    // Determine scam category
    for (const [type, keywords] of Object.entries(fraudPatterns.scamTypes)) {
      const matches = keywords.filter(keyword => lowerText.includes(keyword));
      if (matches.length > 0) {
        category = type;
        break;
      }
    }

    // Determine risk level
    let riskLevel: 'low' | 'medium' | 'high' | 'critical';
    if (score >= 80) riskLevel = 'critical';
    else if (score >= 50) riskLevel = 'high';
    else if (score >= 25) riskLevel = 'medium';
    else riskLevel = 'low';

    // Generate recommendations
    const recommendations: string[] = [];
    if (score > 25) {
      recommendations.push("Do not respond to this message");
      recommendations.push("Do not click any links or download attachments");
      recommendations.push("Do not share personal or financial information");
    }
    if (score > 50) {
      recommendations.push("Block the sender immediately");
      recommendations.push("Report this message to cybercrime authorities");
    }
    if (score < 25) {
      recommendations.push("Message appears relatively safe, but always verify sender identity");
    }

    return {
      riskLevel,
      score: Math.min(score, 100),
      flags,
      recommendations,
      category
    };
  };

  const handleAnalyzeMessage = async () => {
    if (!message.trim()) return;
    
    setIsAnalyzing(true);
    
    try {
      // Try to use Gemini API first
      const { data, error } = await supabase.functions.invoke('fraud-message-detection', {
        body: {
          message: message,
          language: 'en'
        },
      });

      if (error) throw error;

      if (data && data.success && data.analysis) {
        // Use Gemini API results
        const geminiResult: FraudDetectionResult = {
          riskLevel: data.analysis.riskLevel,
          score: data.analysis.score,
          flags: data.analysis.flags,
          recommendations: data.analysis.recommendations,
          category: data.analysis.category
        };
        
        setFraudResult(geminiResult);
        
        // Add to history
        const historyItem: AnalysisHistoryItem = {
          id: crypto.randomUUID(),
          message: message.substring(0, 100) + (message.length > 100 ? '...' : ''),
          result: geminiResult,
          timestamp: new Date()
        };
        setAnalysisHistory(prev => [historyItem, ...prev.slice(0, 4)]); // Keep last 5
        
        toast({
          title: "AI Analysis Complete",
          description: `Risk Level: ${geminiResult.riskLevel.toUpperCase()} (${data.analysis.confidence}% confidence)`,
        });
      } else {
        throw new Error('Invalid response from API');
      }
    } catch (error) {
      console.log('Gemini API failed, falling back to local analysis:', error);
      
      // Fallback to local pattern-based analysis
      const result = analyzeMessage(message);
      setFraudResult(result);
      
      // Add to history
      const historyItem: AnalysisHistoryItem = {
        id: crypto.randomUUID(),
        message: message.substring(0, 100) + (message.length > 100 ? '...' : ''),
        result,
        timestamp: new Date()
      };
      setAnalysisHistory(prev => [historyItem, ...prev.slice(0, 4)]); // Keep last 5
      
      toast({
        title: "Analysis Complete",
        description: "Using local pattern analysis (Gemini API unavailable)",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  // OCR Processing Logic
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setOcrResult(null);
    } else {
      toast({
        title: "Invalid File",
        description: "Please select a valid image file (PNG, JPG, etc.)",
        variant: "destructive",
      });
    }
  };

  const processOCR = async () => {
    if (!selectedFile) return;

    setIsProcessingOCR(true);
    setOcrResult(null);
    
    try {
      const { data: user } = await supabase.auth.getUser();
      
      // Convert file to base64
      const reader = new FileReader();
      const base64Promise = new Promise<string>((resolve, reject) => {
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
      });
      reader.readAsDataURL(selectedFile);
      const base64Image = await base64Promise;

      const { data, error } = await supabase.functions.invoke('ocr-fraud-detection', {
        body: {
          image: base64Image,
          fileName: selectedFile.name,
          fileSize: selectedFile.size,
          fileType: selectedFile.type,
          userId: user.user?.id || null
        },
      });

      if (error) throw error;

      // Check for success response
      if (!data || !data.success) {
        throw new Error(data?.error || 'OCR processing failed');
      }

      const analysis = data.analysis;
      
      // Map fraud risk score to risk level
      let riskLevel: 'low' | 'medium' | 'high' | 'critical';
      if (analysis.fraud_risk >= 8) riskLevel = 'critical';
      else if (analysis.fraud_risk >= 6) riskLevel = 'high';
      else if (analysis.fraud_risk >= 4) riskLevel = 'medium';
      else riskLevel = 'low';

      setOcrResult({
        text: analysis.extracted_text || '',
        confidence: (analysis.confidence || 5) * 10, // Convert 1-10 to percentage
        fraudIndicators: analysis.fraud_indicators || [],
        riskLevel,
        documentType: analysis.document_type || 'Unknown',
        fraudRiskScore: analysis.fraud_risk || 5,
        recommendations: analysis.recommendations || []
      });

      toast({
        title: "✅ Document Analysis Complete",
        description: `${analysis.document_type} analyzed with ${analysis.confidence}/10 confidence`,
      });

      // Show additional warning if high fraud risk
      if (analysis.fraud_risk >= 7) {
        toast({
          title: "⚠️ High Fraud Risk Detected!",
          description: "This document shows signs of potential fraud. Please verify carefully.",
          variant: "destructive",
        });
      }

    } catch (error: any) {
      console.error('OCR Error:', error);
      
      let errorMessage = "Failed to process the document. ";
      let debugInfo = "";
      
      // Enhanced error detection
      if (error.message?.includes('Gemini') || error.message?.includes('API key')) {
        errorMessage += "The Gemini AI service is not configured or temporarily unavailable.";
        debugInfo = "\n\n🔧 Setup Required:\n1. Get API key from https://makersuite.google.com/app/apikey\n2. Add GEMINI_API_KEY to Supabase Edge Functions\n3. Redeploy the ocr-fraud-detection function";
      } else if (error.message?.includes('size') || error.message?.includes('large')) {
        errorMessage += "The image file is too large. Please try a smaller image (< 4MB).";
      } else if (error.message?.includes('non-2xx status code')) {
        errorMessage += "The analysis service returned an error.";
        debugInfo = "\n\n🔍 Debug Info:\n- Check Supabase function logs\n- Verify API keys are configured\n- Try a smaller image file";
      } else if (error.details?.message) {
        errorMessage += error.details.message;
      } else {
        errorMessage += error.message || "Please try again.";
      }
      
      // Log detailed error for debugging
      console.error('Detailed OCR Error:', {
        message: error.message,
        details: error.details,
        status: error.status,
        stack: error.stack
      });
      
      toast({
        title: "Analysis Failed",
        description: errorMessage + debugInfo,
        variant: "destructive",
      });
    } finally {
      setIsProcessingOCR(false);
    }
  };

  // Voice Analysis Logic
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks: Blob[] = [];

      recorder.ondataavailable = (event) => {
        chunks.push(event.data);
      };

      recorder.onstop = () => {
        const audioBlob = new Blob(chunks, { type: 'audio/wav' });
        const audioFile = new File([audioBlob], 'recording.wav', { type: 'audio/wav' });
        setAudioFile(audioFile);
        setAudioChunks([]);
      };

      setMediaRecorder(recorder);
      setAudioChunks(chunks);
      recorder.start();
      setIsRecording(true);

      toast({
        title: "Recording Started",
        description: "Speak clearly into your microphone",
      });

    } catch (error) {
      toast({
        title: "Recording Failed",
        description: "Could not access microphone. Please check permissions.",
        variant: "destructive",
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop();
      mediaRecorder.stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
      setMediaRecorder(null);

      toast({
        title: "Recording Stopped",
        description: "Audio captured successfully",
      });
    }
  };

  const handleAudioFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('audio/')) {
      setAudioFile(file);
      setVoiceResult(null);
    } else {
      toast({
        title: "Invalid File",
        description: "Please select a valid audio file",
        variant: "destructive",
      });
    }
  };

  const processVoiceAnalysis = async () => {
    if (!audioFile) return;

    setIsProcessingVoice(true);
    setVoiceResult(null);
    
    try {
      // First check if Whisper server is available
      const whisperAvailable = await whisperService.isServerAvailable();
      
      const result = await audioProcessingService.processAudioFile(audioFile, {
        onProgress: (progress, status) => {
          console.log(`Progress: ${progress}% - ${status}`);
        },
        enableAudioAnalysis: true,
        preferWhisper: true,
        useWhisper: whisperAvailable // Force Whisper if available
      });

      setVoiceResult(result);

      // Show appropriate toast based on results
      if (result.isScam) {
        toast({
          title: "⚠️ Scam Detected!",
          description: `${result.scamType || 'Potential scam'} detected with ${result.confidence}% confidence`,
          variant: "destructive",
        });
      } else {
        toast({
          title: "✅ Analysis Complete",
          description: `Call appears safe (${result.confidence}% confidence)`,
        });
      }

    } catch (error: any) {
      console.error('Voice analysis error:', error);
      
      // Provide helpful error messages
      let errorMessage = "Failed to analyze the audio. ";
      
      if (error.message.includes('Whisper server')) {
        errorMessage += "\n\nTo use Whisper transcription:\n1. Install local Whisper server\n2. Run: python whisper_server.py\n\nOr try uploading a smaller audio file.";
      } else if (error.message.includes('Web Speech API')) {
        errorMessage += "Your browser doesn't support speech recognition. Please try Chrome or Edge.";
      } else {
        errorMessage += error.message || "Please try again.";
      }
      
      toast({
        title: "Analysis Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsProcessingVoice(false);
    }
  };

  // Helper Functions
  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'low': return 'text-green-500 border-green-200 bg-green-50';
      case 'medium': return 'text-yellow-500 border-yellow-200 bg-yellow-50';
      case 'high': return 'text-orange-500 border-orange-200 bg-orange-50';
      case 'critical': return 'text-red-500 border-red-200 bg-red-50';
      default: return 'text-gray-500 border-gray-200 bg-gray-50';
    }
  };

  const exportAnalysis = (type: string, data: any) => {
    const report = {
      type,
      analysisType: type === 'ocr-fraud' ? 'Document Fraud Detection' : type,
      timestamp: new Date().toISOString(),
      summary: {
        riskLevel: data.riskLevel || 'unknown',
        riskScore: data.fraudRiskScore || data.score || 0,
        confidence: data.confidence || 0,
        documentType: data.documentType || 'Unknown',
        totalIndicators: data.fraudIndicators?.length || 0,
        totalRecommendations: data.recommendations?.length || 0
      },
      detailedAnalysis: {
        extractedText: data.text || data.extracted_text || '',
        fraudIndicators: data.fraudIndicators || [],
        recommendations: data.recommendations || [],
        category: data.category || 'Unknown'
      },
      metadata: {
        fileName: selectedFile?.name || 'Unknown',
        fileSize: selectedFile?.size || 0,
        analyzedAt: new Date().toISOString(),
        aiModel: 'gemini-1.5-flash-8b'
      }
    };
    
    // Create formatted text report
    const textReport = `
FRAUD ANALYSIS REPORT
=====================
Generated: ${new Date().toLocaleString()}
Type: ${report.analysisType}

RISK ASSESSMENT
--------------
Risk Level: ${report.summary.riskLevel.toUpperCase()}
Risk Score: ${report.summary.riskScore}/10
Confidence: ${report.summary.confidence}%
Document Type: ${report.summary.documentType}

FRAUD INDICATORS (${report.summary.totalIndicators})
${report.detailedAnalysis.fraudIndicators.map((ind, i) => `${i + 1}. ${ind}`).join('\n') || 'None detected'}

RECOMMENDATIONS (${report.summary.totalRecommendations})
${report.detailedAnalysis.recommendations.map((rec, i) => `${i + 1}. ${rec}`).join('\n') || 'None'}

EXTRACTED TEXT
--------------
${report.detailedAnalysis.extractedText || 'No text extracted'}

---
Report generated by CyberCop Safe Space AI Detection Hub
`;
    
    // Let user choose format
    const format = confirm('Download as JSON (OK) or Text Report (Cancel)?');
    
    if (format) {
      // JSON format
      const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `fraud-analysis-${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } else {
      // Text format
      const blob = new Blob([textReport], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `fraud-analysis-${Date.now()}.txt`;
      a.click();
      URL.revokeObjectURL(url);
    }
    
    toast({
      title: "Report Exported",
      description: `Analysis report downloaded as ${format ? 'JSON' : 'Text'} file`,
    });
  };

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <div className="p-4 rounded-full bg-primary/10 glow-primary">
              <Brain className="h-12 w-12 text-primary" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="gradient-primary bg-clip-text text-transparent">AI Detection Hub</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Advanced AI-powered fraud detection for messages, documents, and voice calls
          </p>
        </div>

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="fraud-message" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Message Detector
            </TabsTrigger>
            <TabsTrigger value="ocr-fraud" className="flex items-center gap-2">
              <ScanText className="h-4 w-4" />
              Document Scanner
            </TabsTrigger>
            <TabsTrigger value="voice-analysis" className="flex items-center gap-2">
              <Mic className="h-4 w-4" />
              Voice Analyzer
            </TabsTrigger>
          </TabsList>

          {/* Fraud Message Detector Tab */}
          <TabsContent value="fraud-message" className="space-y-6">
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Message Analyzer */}
              <div className="lg:col-span-2 space-y-6">
                <Card className="border-border/40">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MessageSquare className="h-5 w-5 text-primary" />
                      Fraud Message Analyzer
                    </CardTitle>
                    <CardDescription>
                      Paste a suspicious message to analyze for fraud indicators and scam patterns
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="message">Message Content</Label>
                      <Textarea
                        id="message"
                        placeholder="Paste the suspicious message, email, or SMS here..."
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        className="min-h-[120px] transition-glow focus:glow-primary"
                      />
                    </div>

                    <div className="flex gap-2">
                      <Button
                        onClick={handleAnalyzeMessage}
                        disabled={isAnalyzing || !message.trim()}
                        className="glow-primary transition-glow"
                      >
                        {isAnalyzing ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <Brain className="mr-2 h-4 w-4" />
                        )}
                        {isAnalyzing ? "Analyzing..." : "Analyze Message"}
                      </Button>
                      
                      {message && (
                        <Button variant="outline" onClick={() => { setMessage(""); setFraudResult(null); }}>
                          <Trash2 className="mr-2 h-4 w-4" />
                          Clear
                        </Button>
                      )}
                    </div>

                    {fraudResult && (
                      <div className="space-y-4">
                        <Separator />
                        
                        {/* Risk Assessment */}
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <h3 className="text-lg font-semibold">Analysis Results</h3>
                            <div className="flex gap-2">
                              <Badge className={`${getRiskColor(fraudResult.riskLevel)} border`}>
                                {fraudResult.riskLevel.toUpperCase()} RISK
                              </Badge>
                              <Button size="sm" variant="outline" onClick={() => exportAnalysis('fraud-message', fraudResult)}>
                                <Download className="h-3 w-3 mr-1" />
                                Export
                              </Button>
                            </div>
                          </div>

                          {/* Risk Score */}
                          <div className="space-y-2">
                            <div className="flex justify-between items-center">
                              <Label>Fraud Risk Score</Label>
                              <span className="text-sm font-medium">{fraudResult.score}/100</span>
                            </div>
                            <Progress 
                              value={fraudResult.score} 
                              className="h-3"
                            />
                          </div>

                          {/* Category */}
                          {fraudResult.category !== 'unknown' && (
                            <div className="p-3 rounded-lg bg-muted/30">
                              <div className="flex items-center gap-2">
                                <Badge variant="secondary">
                                  Scam Category: {fraudResult.category.charAt(0).toUpperCase() + fraudResult.category.slice(1)}
                                </Badge>
                              </div>
                            </div>
                          )}

                          {/* Fraud Indicators */}
                          {fraudResult.flags.length > 0 && (
                            <div className="space-y-3">
                              <Label>Detected Fraud Indicators</Label>
                              <div className="space-y-2">
                                {fraudResult.flags.map((flag, index) => (
                                  <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-red-50 border border-red-200">
                                    <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5" />
                                    <span className="text-sm text-red-700">{flag}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Recommendations */}
                          <div className="space-y-3">
                            <Label>Security Recommendations</Label>
                            <div className="space-y-2">
                              {fraudResult.recommendations.map((rec, index) => (
                                <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-blue-50 border border-blue-200">
                                  <Shield className="h-4 w-4 text-blue-500 mt-0.5" />
                                  <span className="text-sm text-blue-700">{rec}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Analysis History Sidebar */}
              <Card className="border-border/40">
                <CardHeader>
                  <CardTitle className="text-lg">Recent Analysis</CardTitle>
                  <CardDescription>
                    Your last analyzed messages
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {analysisHistory.length === 0 ? (
                    <div className="text-center py-8">
                      <MessageSquare className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">
                        No analysis history yet
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {analysisHistory.map((item) => (
                        <div
                          key={item.id}
                          className="p-3 rounded-lg border cursor-pointer hover:bg-muted/30 transition-colors"
                          onClick={() => {
                            setMessage(item.message);
                            setFraudResult(item.result);
                          }}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <Badge 
                              variant="secondary" 
                              className={`text-xs ${getRiskColor(item.result.riskLevel)}`}
                            >
                              {item.result.riskLevel}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {item.timestamp.toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground truncate">
                            {item.message}
                          </p>
                          <div className="text-xs text-muted-foreground mt-1">
                            Score: {item.result.score}/100
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* OCR Fraud Detection Tab */}
          <TabsContent value="ocr-fraud" className="space-y-6">
            <Card className="border-border/40 max-w-4xl mx-auto">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ScanText className="h-5 w-5 text-primary" />
                  Document Fraud Scanner
                </CardTitle>
                <CardDescription>
                  Upload images of documents to detect fraudulent text patterns and suspicious content
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <Button
                      onClick={() => fileInputRef.current?.click()}
                      className="glow-primary transition-glow"
                    >
                      <Upload className="mr-2 h-4 w-4" />
                      Upload Document
                    </Button>
                    
                    {selectedFile && (
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-primary" />
                        <span className="text-sm text-muted-foreground">{selectedFile.name}</span>
                      </div>
                    )}
                  </div>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                  />

                  {previewUrl && (
                    <div className="space-y-4">
                      <div className="max-w-md mx-auto">
                        <img
                          src={previewUrl}
                          alt="Document preview"
                          className="w-full h-auto rounded-lg border shadow-sm"
                        />
                      </div>
                      
                      <div className="flex justify-center">
                        <Button
                          onClick={processOCR}
                          disabled={isProcessingOCR}
                          className="glow-primary transition-glow"
                        >
                          {isProcessingOCR ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          ) : (
                            <ScanText className="mr-2 h-4 w-4" />
                          )}
                          {isProcessingOCR ? "Processing..." : "Analyze Document"}
                        </Button>
                      </div>
                    </div>
                  )}

                  {ocrResult && (
                    <div className="space-y-6">
                      <Separator />
                      
                      {/* Analysis Header with Risk Assessment */}
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h3 className="text-xl font-bold gradient-primary bg-clip-text text-transparent">
                            Document Analysis Complete
                          </h3>
                          <Button size="sm" variant="outline" onClick={() => exportAnalysis('ocr-fraud', ocrResult)}>
                            <Download className="h-3 w-3 mr-1" />
                            Export Report
                          </Button>
                        </div>

                        {/* Risk Level Card with Visual Meter */}
                        <Card className={`${getRiskColor(ocrResult.riskLevel)} border-2 p-6`}>
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                              {ocrResult.riskLevel === 'critical' && <AlertTriangle className="h-8 w-8 text-red-500 animate-pulse" />}
                              {ocrResult.riskLevel === 'high' && <AlertTriangle className="h-8 w-8 text-orange-500" />}
                              {ocrResult.riskLevel === 'medium' && <Shield className="h-8 w-8 text-yellow-500" />}
                              {ocrResult.riskLevel === 'low' && <CheckCircle className="h-8 w-8 text-green-500" />}
                              <div>
                                <h4 className="text-xl font-bold">
                                  {ocrResult.riskLevel.toUpperCase()} RISK DETECTED
                                </h4>
                                <p className="text-sm text-muted-foreground max-w-md">
                                  {ocrResult.riskLevel === 'critical' && 'Immediate action required - High fraud probability detected in this document'}
                                  {ocrResult.riskLevel === 'high' && 'Suspicious document detected - Verify authenticity carefully before proceeding'}
                                  {ocrResult.riskLevel === 'medium' && 'Some concerns detected - Additional verification steps recommended'}
                                  {ocrResult.riskLevel === 'low' && 'Document appears legitimate - Standard verification procedures sufficient'}
                                </p>
                              </div>
                            </div>
                          </div>
                          
                          {/* Visual Risk Meter */}
                          <div className="flex justify-center">
                            <FraudRiskMeter 
                              riskScore={ocrResult.fraudRiskScore || Math.round(ocrResult.confidence / 10)} 
                              className="mx-auto"
                            />
                          </div>
                          
                          {/* Additional Risk Stats */}
                          <div className="grid grid-cols-3 gap-4 mt-6 pt-4 border-t">
                            <div className="text-center">
                              <div className="text-2xl font-bold text-red-500">{ocrResult.fraudIndicators?.length || 0}</div>
                              <div className="text-xs text-muted-foreground">Red Flags</div>
                            </div>
                            <div className="text-center">
                              <div className="text-2xl font-bold text-blue-500">{ocrResult.recommendations?.length || 0}</div>
                              <div className="text-xs text-muted-foreground">Actions</div>
                            </div>
                            <div className="text-center">
                              <div className="text-2xl font-bold text-green-500">{ocrResult.confidence}%</div>
                              <div className="text-xs text-muted-foreground">Confidence</div>
                            </div>
                          </div>
                        </Card>

                        {/* Document Type and Confidence */}
                        <div className="grid md:grid-cols-2 gap-4">
                          <Card className="p-4">
                            <div className="flex items-center gap-2 mb-2">
                              <FileText className="h-5 w-5 text-primary" />
                              <h5 className="font-semibold">Document Type</h5>
                            </div>
                            <p className="text-2xl font-bold">{ocrResult.documentType || 'Unknown'}</p>
                            <p className="text-sm text-muted-foreground mt-1">
                              AI-identified document category
                            </p>
                          </Card>
                          
                          <Card className="p-4">
                            <div className="flex items-center gap-2 mb-2">
                              <Activity className="h-5 w-5 text-primary" />
                              <h5 className="font-semibold">Analysis Confidence</h5>
                            </div>
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <Progress value={ocrResult.confidence} className="flex-1" />
                                <span className="text-sm font-medium w-12">{ocrResult.confidence}%</span>
                              </div>
                              <p className="text-xs text-muted-foreground">
                                {ocrResult.confidence >= 80 ? 'High accuracy' : ocrResult.confidence >= 60 ? 'Good accuracy' : 'Low accuracy'}
                              </p>
                            </div>
                          </Card>
                        </div>

                        {/* Extracted Text Section */}
                        <Card className="p-4">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <ScanText className="h-5 w-5 text-primary" />
                              <h5 className="font-semibold">Extracted Text</h5>
                            </div>
                            <Badge variant="outline">
                              {ocrResult.text.split(' ').length} words
                            </Badge>
                          </div>
                          <Textarea
                            value={ocrResult.text}
                            readOnly
                            className="min-h-[120px] bg-muted/30 font-mono text-sm"
                          />
                        </Card>

                        {/* Fraud Indicators */}
                        {ocrResult.fraudIndicators && ocrResult.fraudIndicators.length > 0 && (
                          <Card className="p-4 border-red-200">
                            <div className="flex items-center gap-2 mb-4">
                              <AlertTriangle className="h-5 w-5 text-red-500" />
                              <h5 className="font-semibold text-red-700">Fraud Indicators Detected</h5>
                              <Badge variant="destructive" className="ml-auto">
                                {ocrResult.fraudIndicators.length}
                              </Badge>
                            </div>
                            <div className="space-y-2">
                              {ocrResult.fraudIndicators.map((indicator, index) => (
                                <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-red-50/50 border border-red-200/50">
                                  <div className="mt-0.5 p-1 rounded-full bg-red-100">
                                    <AlertTriangle className="h-3 w-3 text-red-600" />
                                  </div>
                                  <span className="text-sm text-red-800 flex-1">{indicator}</span>
                                </div>
                              ))}
                            </div>
                          </Card>
                        )}

                        {/* Recommendations */}
                        {ocrResult.recommendations && ocrResult.recommendations.length > 0 && (
                          <Card className="p-4 border-blue-200">
                            <div className="flex items-center gap-2 mb-4">
                              <Shield className="h-5 w-5 text-blue-500" />
                              <h5 className="font-semibold text-blue-700">Security Recommendations</h5>
                              <Badge className="ml-auto bg-blue-100 text-blue-700">
                                {ocrResult.recommendations.length}
                              </Badge>
                            </div>
                            <div className="space-y-2">
                              {ocrResult.recommendations.map((rec, index) => (
                                <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-blue-50/50 border border-blue-200/50">
                                  <div className="mt-0.5 p-1 rounded-full bg-blue-100">
                                    <CheckCircle className="h-3 w-3 text-blue-600" />
                                  </div>
                                  <span className="text-sm text-blue-800 flex-1">{rec}</span>
                                </div>
                              ))}
                            </div>
                          </Card>
                        )}

                        {/* Quick Actions */}
                        <Card className="p-4 bg-muted/30">
                          <h5 className="font-semibold mb-3 flex items-center gap-2">
                            <Activity className="h-5 w-5 text-primary" />
                            Quick Actions
                          </h5>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => {
                                navigator.clipboard.writeText(ocrResult.text);
                                toast({
                                  title: "Text Copied",
                                  description: "Extracted text copied to clipboard",
                                });
                              }}
                            >
                              <FileText className="h-3 w-3 mr-1" />
                              Copy Text
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => {
                                setSelectedFile(null);
                                setPreviewUrl(null);
                                setOcrResult(null);
                              }}
                            >
                              <Trash2 className="h-3 w-3 mr-1" />
                              Clear
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => fileInputRef.current?.click()}
                            >
                              <Upload className="h-3 w-3 mr-1" />
                              New Scan
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => window.print()}
                            >
                              <Download className="h-3 w-3 mr-1" />
                              Print
                            </Button>
                          </div>
                        </Card>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Voice Analysis Tab */}
          <TabsContent value="voice-analysis" className="space-y-6">
            <Card className="border-border/40 max-w-4xl mx-auto">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Phone className="h-5 w-5 text-primary" />
                  Voice Scam Analyzer
                </CardTitle>
                <CardDescription>
                  Record live audio or upload voice files to detect scam patterns and emotional manipulation
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Live Recording */}
                  <Card className="p-4">
                    <div className="text-center space-y-4">
                      <div className="p-3 rounded-full bg-primary/10 mx-auto w-fit">
                        {isRecording ? (
                          <Activity className="h-8 w-8 text-red-500 animate-pulse" />
                        ) : (
                          <Mic className="h-8 w-8 text-primary" />
                        )}
                      </div>
                      
                      <div>
                        <h3 className="font-semibold mb-2">Live Recording</h3>
                        <p className="text-sm text-muted-foreground">
                          Record a live conversation or call
                        </p>
                      </div>

                      <Button
                        onClick={isRecording ? stopRecording : startRecording}
                        className={`w-full ${isRecording ? 'bg-red-500 hover:bg-red-600' : 'glow-primary'} transition-glow`}
                      >
                        {isRecording ? (
                          <>
                            <StopCircle className="mr-2 h-4 w-4" />
                            Stop Recording
                          </>
                        ) : (
                          <>
                            <PlayCircle className="mr-2 h-4 w-4" />
                            Start Recording
                          </>
                        )}
                      </Button>
                    </div>
                  </Card>

                  {/* File Upload */}
                  <Card className="p-4">
                    <div className="text-center space-y-4">
                      <div className="p-3 rounded-full bg-primary/10 mx-auto w-fit">
                        <Upload className="h-8 w-8 text-primary" />
                      </div>
                      
                      <div>
                        <h3 className="font-semibold mb-2">Upload Audio File</h3>
                        <p className="text-sm text-muted-foreground">
                          Upload an existing audio recording
                        </p>
                      </div>

                      <Button
                        onClick={() => audioInputRef.current?.click()}
                        variant="outline"
                        className="w-full"
                      >
                        <Upload className="mr-2 h-4 w-4" />
                        Choose Audio File
                      </Button>

                      <input
                        ref={audioInputRef}
                        type="file"
                        accept="audio/*"
                        onChange={handleAudioFileSelect}
                        className="hidden"
                      />
                    </div>
                  </Card>
                </div>

                {audioFile && (
                  <div className="space-y-4">
                    <Separator />
                    
                    <div className="text-center space-y-4">
                      <div className="flex items-center justify-center gap-2">
                        <div className="p-2 rounded-lg bg-green-50 border border-green-200">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        </div>
                        <span className="text-sm font-medium">Audio Ready: {audioFile.name}</span>
                      </div>

                      <Button
                        onClick={processVoiceAnalysis}
                        disabled={isProcessingVoice}
                        className="glow-primary transition-glow"
                      >
                        {isProcessingVoice ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <Brain className="mr-2 h-4 w-4" />
                        )}
                        {isProcessingVoice ? "Analyzing Voice..." : "Analyze Audio"}
                      </Button>
                    </div>
                  </div>
                )}

                {voiceResult && (
                  <div className="space-y-4">
                    <Separator />
                    
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold">Voice Analysis Results</h3>
                        <div className="flex gap-2">
                          <Badge className={`${
                            voiceResult.isScam 
                              ? 'bg-red-500 hover:bg-red-600 text-white' 
                              : 'bg-green-500 hover:bg-green-600 text-white'
                          }`}>
                            {voiceResult.isScam ? 'SCAM DETECTED' : 'APPEARS SAFE'}
                          </Badge>
                          <Button size="sm" variant="outline" onClick={() => exportAnalysis('voice-analysis', voiceResult)}>
                            <Download className="h-3 w-3 mr-1" />
                            Export
                          </Button>
                        </div>
                      </div>

                      {/* Scam Type and Confidence */}
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Analysis Confidence</Label>
                          <div className="flex items-center gap-2">
                            <Progress value={voiceResult.confidence} className="flex-1" />
                            <span className="text-sm font-medium w-12">{voiceResult.confidence}%</span>
                          </div>
                        </div>
                        {voiceResult.scamType && (
                          <div className="space-y-2">
                            <Label>Scam Type Detected</Label>
                            <Badge variant="destructive" className="w-fit">
                              {voiceResult.scamType}
                            </Badge>
                          </div>
                        )}
                      </div>

                      {/* Transcription */}
                      <div className="space-y-2">
                        <Label>Transcription</Label>
                        <Textarea
                          value={voiceResult.transcript}
                          readOnly
                          className="min-h-[100px] bg-muted/50"
                        />
                      </div>

                      {/* Audio Features */}
                      {voiceResult.audioFeatures && (
                        <div className="space-y-2">
                          <Label>Audio Analysis</Label>
                          <div className="grid grid-cols-2 gap-2">
                            <div className="p-2 rounded-lg bg-muted/30">
                              <div className="text-xs text-muted-foreground">Duration</div>
                              <div className="font-medium">{voiceResult.audioFeatures.duration.toFixed(1)}s</div>
                            </div>
                            <div className="p-2 rounded-lg bg-muted/30">
                              <div className="text-xs text-muted-foreground">Background Noise</div>
                              <div className="font-medium">{voiceResult.audioFeatures.hasBackgroundNoise ? 'Yes' : 'No'}</div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Detailed Scores */}
                      {voiceResult.detailedScores && (
                        <div className="space-y-2">
                          <Label>Risk Analysis Breakdown</Label>
                          <div className="space-y-1">
                            {Object.entries(voiceResult.detailedScores).map(([category, score]) => {
                              const displayName = category.replace('Score', '').replace(/([A-Z])/g, ' $1').trim();
                              const capitalize = displayName.charAt(0).toUpperCase() + displayName.slice(1);
                              return (
                                <div key={category} className="flex items-center gap-2">
                                  <span className="text-sm w-32">{capitalize}:</span>
                                  <Progress value={score} className="flex-1 h-2" />
                                  <span className="text-xs w-8">{score}</span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* Red Flags */}
                      {voiceResult.redFlags && voiceResult.redFlags.length > 0 && (
                        <div className="space-y-3">
                          <Label>Red Flags Detected</Label>
                          <div className="space-y-2">
                            {voiceResult.redFlags.map((flag, index) => (
                              <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-red-50 border border-red-200">
                                <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5" />
                                <span className="text-sm text-red-700">{flag}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Recommendations */}
                      {voiceResult.recommendations && voiceResult.recommendations.length > 0 && (
                        <div className="space-y-3">
                          <Label>Security Recommendations</Label>
                          <div className="space-y-2">
                            {voiceResult.recommendations.map((rec, index) => (
                              <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-blue-50 border border-blue-200">
                                <Shield className="h-4 w-4 text-blue-500 mt-0.5" />
                                <span className="text-sm text-blue-700">{rec}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AIDetectionHub;
