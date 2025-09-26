import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Upload, Mic, AlertCircle, CheckCircle2, XCircle, Phone, FileAudio, Info, AlertTriangle, Cpu, Globe } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/hooks/use-toast";
import { audioProcessingService } from "@/services/audioProcessingService";
import { checkBrowserSupport } from "@/utils/audioTranscription";
import { whisperService } from "@/services/whisperService";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

interface AnalysisResult {
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
  detailedScores?: {
    urgencyScore: number;
    financialScore: number;
    threatScore: number;
    impersonationScore: number;
    personalInfoScore: number;
    technicalScore: number;
  };
}

const VoiceScamDetector = () => {
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [transcriptionProgress, setTranscriptionProgress] = useState(0);
  const [processingStatus, setProcessingStatus] = useState<string>("");
  const [useManualTranscript, setUseManualTranscript] = useState(false);
  const [manualTranscript, setManualTranscript] = useState("");
  const [transcriptionEngine, setTranscriptionEngine] = useState<'auto' | 'whisper' | 'webspeech'>('auto');
  const [whisperAvailable, setWhisperAvailable] = useState(false);
  const [checkingWhisper, setCheckingWhisper] = useState(true);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Check browser compatibility and Whisper availability on mount
  const browserSupport = checkBrowserSupport();
  const isFullySupported = browserSupport.fullSupport;
  
  // Check Whisper server availability
  useEffect(() => {
    const checkWhisper = async () => {
      setCheckingWhisper(true);
      try {
        const available = await whisperService.isServerAvailable();
        setWhisperAvailable(available);
        if (available) {
          const info = await whisperService.getServerInfo();
          if (info?.gpu_available) {
            toast({
              title: "🚀 GPU Acceleration Available",
              description: "Whisper server is running with GPU support for faster transcription!",
            });
          }
        }
      } catch (error) {
        console.log('Whisper server not available');
        setWhisperAvailable(false);
      } finally {
        setCheckingWhisper(false);
      }
    };
    
    checkWhisper();
    // Check again every 30 seconds
    const interval = setInterval(checkWhisper, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const validation = audioProcessingService.validateFile(file);
    if (!validation.valid) {
      toast({
        title: "Invalid file",
        description: validation.error,
        variant: "destructive",
      });
      return;
    }

    setAudioFile(file);
    setAudioUrl(URL.createObjectURL(file));
    setAnalysisResult(null);
    setTranscriptionProgress(0);
    setProcessingStatus("");
    
    toast({
      title: "File uploaded",
      description: `${file.name} is ready for analysis`,
    });
  };

  const analyzeAudio = async () => {
    if (!audioFile) return;

    setIsAnalyzing(true);
    setTranscriptionProgress(0);
    setAnalysisResult(null);
    setProcessingStatus("Initializing...");

    try {
      // Process audio file using the new service
      const result = await audioProcessingService.processAudioFile(audioFile, {
        onProgress: (progress, status) => {
          setTranscriptionProgress(progress);
          setProcessingStatus(status);
        },
        enableAudioAnalysis: true,
        language: 'en-US',
        manualTranscript: useManualTranscript ? manualTranscript : undefined,
        useWhisper: transcriptionEngine === 'whisper',
        preferWhisper: transcriptionEngine === 'auto',
      });
      
      setAnalysisResult(result);
      
      if (result.isScam) {
        toast({
          title: "⚠️ Scam Detected!",
          description: `${result.scamType || 'Potential scam'} detected with ${result.confidence}% confidence`,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Analysis Complete",
          description: "Call appears to be legitimate, but always stay vigilant.",
        });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
      
      toast({
        title: "Analysis failed",
        description: errorMessage,
        variant: "destructive",
      });
      
      // Show user-friendly error in the UI
      setAnalysisResult({
        isScam: false,
        confidence: 0,
        transcript: "Error: Could not transcribe audio",
        redFlags: [errorMessage],
        recommendations: [
          "Please ensure your browser supports local file-based transcription or use a supported browser",
          "Try using Chrome, Edge, or Safari for best compatibility",
          "Alternatively, paste the call transcript manually using the toggle above",
          "Make sure the audio file is clear and not corrupted"
        ]
      });
    } finally {
      setIsAnalyzing(false);
      setProcessingStatus("");
    }
  };

  const resetAnalysis = () => {
    setAudioFile(null);
    setAudioUrl(null);
    setAnalysisResult(null);
    setTranscriptionProgress(0);
    setProcessingStatus("");
    setUseManualTranscript(false);
    setManualTranscript("");
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Show detailed scores component
  const DetailedScoresCard = ({ scores }: { scores: any }) => {
    if (!scores) return null;
    
    const scoreItems = [
      { label: 'Urgency Tactics', score: scores.urgencyScore, color: 'yellow' },
      { label: 'Financial Threats', score: scores.financialScore, color: 'red' },
      { label: 'Intimidation', score: scores.threatScore, color: 'red' },
      { label: 'Impersonation', score: scores.impersonationScore, color: 'orange' },
      { label: 'Personal Info Request', score: scores.personalInfoScore, color: 'red' },
      { label: 'Technical Scam', score: scores.technicalScore, color: 'purple' }
    ];
    
    return (
      <div className="space-y-3">
        <h3 className="font-medium mb-2">Detailed Analysis Scores</h3>
        <div className="space-y-2">
          {scoreItems.map((item, index) => {
            const percentage = Math.min(100, item.score * 2);
            return (
              <div key={index}>
                <div className="flex justify-between mb-1">
                  <span className="text-sm">{item.label}</span>
                  <span className="text-sm font-medium">{item.score > 0 ? `${percentage}%` : '-'}</span>
                </div>
                <Progress 
                  value={percentage} 
                  className="h-2"
                />
              </div>
            );
          })}
        </div>
      </div>
    );
  };


  return (
    <div className="container max-w-6xl mx-auto p-6 space-y-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-4">Voice Scam Detector</h1>
        <p className="text-xl text-gray-600 dark:text-gray-400">
          Upload a call recording to detect potential scam attempts
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Upload Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Phone className="h-5 w-5" />
              Upload Call Recording
            </CardTitle>
            <CardDescription>
              Upload an audio file of a suspicious phone call for analysis
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center">
              <input
                ref={fileInputRef}
                type="file"
                accept="audio/*"
                onChange={handleFileUpload}
                className="hidden"
                id="audio-upload"
              />
              <label htmlFor="audio-upload" className="cursor-pointer">
                <Upload className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  Click to upload or drag and drop
                </p>
                <p className="text-xs text-gray-500">
                  MP3, WAV, M4A up to 50MB
                </p>
              </label>
            </div>

            {audioFile && (
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="flex items-center gap-2">
                    <FileAudio className="h-5 w-5 text-blue-500" />
                    <span className="text-sm font-medium">{audioFile.name}</span>
                  </div>
                  <Badge>{(audioFile.size / 1024 / 1024).toFixed(2)} MB</Badge>
                </div>

                {audioUrl && (
                  <audio controls className="w-full">
                    <source src={audioUrl} type={audioFile.type} />
                    Your browser does not support the audio element.
                  </audio>
                )}

                {/* Manual transcript toggle */}
                <div className="mt-4 p-3 border rounded-md bg-gray-50 dark:bg-gray-800">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Provide transcript manually</h4>
                      <p className="text-xs text-gray-600 dark:text-gray-400">If automatic transcription is unavailable, paste the call transcript here.</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm">Off</span>
                      <input
                        type="checkbox"
                        role="switch"
                        aria-label="Use manual transcript"
                        className="sr-only"
                        onChange={(e) => setUseManualTranscript(e.target.checked)}
                        checked={useManualTranscript}
                      />
                      {/* Visual switch using existing styles */}
                      <div
                        onClick={() => setUseManualTranscript(v => !v)}
                        className={`inline-flex h-6 w-11 rounded-full transition-colors cursor-pointer ${useManualTranscript ? 'bg-blue-600' : 'bg-gray-300'}`}
                      >
                        <div className={`h-5 w-5 bg-white rounded-full shadow transform transition-transform ${useManualTranscript ? 'translate-x-5' : 'translate-x-0'}`} />
                      </div>
                      <span className="text-sm">On</span>
                    </div>
                  </div>
                  <div className="mt-2">
                    <textarea
                      className="w-full h-28 p-2 text-sm rounded-md border bg-background"
                      placeholder="Paste the call content here..."
                      disabled={!useManualTranscript}
                      value={manualTranscript}
                      onChange={(e) => setManualTranscript(e.target.value)}
                    />
                  </div>
                </div>

                {(useManualTranscript && manualTranscript.trim().length === 0) && (
                  <p className="text-xs text-red-600">Paste the transcript to enable analysis.</p>
                )}

                {/* Transcription Engine Selection */}
                {!useManualTranscript && (
                  <div className="mt-4 p-3 border rounded-md bg-gray-50 dark:bg-gray-800">
                    <h4 className="font-medium mb-3">Transcription Engine</h4>
                    <RadioGroup 
                      value={transcriptionEngine} 
                      onValueChange={(value: 'auto' | 'whisper' | 'webspeech') => setTranscriptionEngine(value)}
                    >
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="auto" id="auto" />
                          <Label htmlFor="auto" className="cursor-pointer flex-1">
                            <div className="flex items-center justify-between">
                              <span>Auto (Recommended)</span>
                              <Badge variant="secondary" className="text-xs">
                                {whisperAvailable ? 'Whisper + Web Speech' : 'Web Speech'}
                              </Badge>
                            </div>
                            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                              Automatically uses the best available engine
                            </p>
                          </Label>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem 
                            value="whisper" 
                            id="whisper" 
                            disabled={!whisperAvailable}
                          />
                          <Label htmlFor="whisper" className="cursor-pointer flex-1">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Cpu className="h-4 w-4" />
                                <span>Whisper (GPU)</span>
                              </div>
                              {checkingWhisper ? (
                                <Badge variant="outline" className="text-xs">Checking...</Badge>
                              ) : whisperAvailable ? (
                                <Badge className="text-xs bg-green-500">Available</Badge>
                              ) : (
                                <Badge variant="destructive" className="text-xs">Offline</Badge>
                              )}
                            </div>
                            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                              {whisperAvailable 
                                ? "High-accuracy local transcription with GPU acceleration"
                                : "Start the Whisper server (local-whisper/start-whisper.bat)"
                              }
                            </p>
                          </Label>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem 
                            value="webspeech" 
                            id="webspeech"
                            disabled={!browserSupport.webSpeechAPI}
                          />
                          <Label htmlFor="webspeech" className="cursor-pointer flex-1">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Globe className="h-4 w-4" />
                                <span>Web Speech API</span>
                              </div>
                              {browserSupport.webSpeechAPI ? (
                                <Badge variant="secondary" className="text-xs">Available</Badge>
                              ) : (
                                <Badge variant="destructive" className="text-xs">Not Supported</Badge>
                              )}
                            </div>
                            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                              Browser-based transcription (works offline)
                            </p>
                          </Label>
                        </div>
                      </div>
                    </RadioGroup>
                    
                    {whisperAvailable && (
                      <div className="mt-3 p-2 bg-green-50 dark:bg-green-950 rounded text-xs text-green-700 dark:text-green-300">
                        ✅ Whisper server detected! GPU transcription will be 16x faster.
                      </div>
                    )}
                  </div>
                )}

                <div className="flex gap-2">
                  <Button 
                    onClick={analyzeAudio} 
                    disabled={isAnalyzing || (useManualTranscript && manualTranscript.trim().length === 0)}
                    className="flex-1"
                  >
                    {isAnalyzing ? (
                      <>
                        <Mic className="mr-2 h-4 w-4 animate-pulse" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <Mic className="mr-2 h-4 w-4" />
                        Analyze Call
                      </>
                    )}
                  </Button>
                  <Button onClick={resetAnalysis} variant="outline">
                    Reset
                  </Button>
                </div>
              </div>
            )}

            {isAnalyzing && (
              <div className="space-y-2">
                <p className="text-sm text-gray-600">{processingStatus || "Processing..."}</p>
                <Progress value={transcriptionProgress} />
              </div>
            )}
          </CardContent>
        </Card>

        {/* How It Works */}
        <Card>
          <CardHeader>
            <CardTitle>How It Works</CardTitle>
            <CardDescription>
              Our AI-powered system analyzes call recordings for scam indicators
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center text-sm font-semibold">
                  1
                </div>
                <div>
                  <h4 className="font-medium mb-1">Upload Recording</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Upload the audio file of the suspicious call
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center text-sm font-semibold">
                  2
                </div>
                <div>
                  <h4 className="font-medium mb-1">Speech Recognition</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Convert audio to text using advanced speech recognition
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center text-sm font-semibold">
                  3
                </div>
                <div>
                  <h4 className="font-medium mb-1">Pattern Analysis</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Analyze for common scam patterns and red flags
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center text-sm font-semibold">
                  4
                </div>
                <div>
                  <h4 className="font-medium mb-1">Get Results</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Receive detailed analysis and recommendations
                  </p>
                </div>
              </div>

              <Separator className="my-4" />

              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Privacy First</AlertTitle>
                <AlertDescription>
                  All analysis is performed locally in your browser. Your audio files are never uploaded to our servers, and we never access your microphone without permission.
                </AlertDescription>
              </Alert>

              {!isFullySupported && (
                <Alert className="mt-4" variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Browser Compatibility Warning</AlertTitle>
                  <AlertDescription>
                    Your browser has limited support for audio processing features:
                    <ul className="list-disc list-inside mt-2 text-sm">
                      {!browserSupport.webSpeechAPI && <li>Web Speech API not supported</li>}
                      {!browserSupport.webAudioAPI && <li>Web Audio API not supported</li>}
                      {!browserSupport.mediaRecorder && <li>MediaRecorder API not supported</li>}
                    </ul>
                    <p className="mt-2">For best results, please use Chrome, Edge, or Safari.</p>
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Results Section */}
      {analysisResult && (
        <Card className={analysisResult.isScam ? "border-red-500" : "border-green-500"}>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Analysis Results</span>
              <Badge 
                variant={analysisResult.isScam ? "destructive" : "default"}
                className="text-lg px-4 py-2"
              >
                {analysisResult.isScam ? "SCAM DETECTED" : "APPEARS LEGITIMATE"}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Confidence Score */}
            <div>
              <div className="flex justify-between mb-2">
                <span className="font-medium">Scam Probability</span>
                <span className="font-bold">{analysisResult.confidence}%</span>
              </div>
              <Progress 
                value={analysisResult.confidence} 
                className={analysisResult.confidence > 60 ? "bg-red-100" : analysisResult.confidence > 30 ? "bg-yellow-100" : "bg-green-100"}
              />
            </div>

            {/* Audio Features */}
            {analysisResult.audioFeatures && (
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <h3 className="font-medium mb-2">Audio Analysis</h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-gray-600">Duration:</span>
                    <span className="ml-2 font-medium">{analysisResult.audioFeatures.duration.toFixed(1)}s</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Background Noise:</span>
                    <span className="ml-2 font-medium">{analysisResult.audioFeatures.hasBackgroundNoise ? 'Yes' : 'No'}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Silence Ratio:</span>
                    <span className="ml-2 font-medium">{(analysisResult.audioFeatures.silenceRatio * 100).toFixed(0)}%</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Audio Quality:</span>
                    <span className="ml-2 font-medium">
                      {analysisResult.audioFeatures.averageAmplitude > 0.5 ? 'Good' : 
                       analysisResult.audioFeatures.averageAmplitude > 0.2 ? 'Fair' : 'Poor'}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Scam Type */}
            {analysisResult.scamType && (
              <div>
                <h3 className="font-medium mb-2">Detected Scam Type</h3>
                <Badge variant="outline" className="text-base">
                  {analysisResult.scamType}
                </Badge>
              </div>
            )}

            {/* Red Flags */}
            {analysisResult.redFlags.length > 0 && (
              <div>
                <h3 className="font-medium mb-3">Red Flags Detected</h3>
                <div className="space-y-2">
                  {analysisResult.redFlags.map((flag, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <XCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
                      <span className="text-sm">{flag}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Transcript */}
            <div>
              <h3 className="font-medium mb-2">Call Transcript</h3>
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <p className="text-sm italic text-gray-900 dark:text-gray-100">{analysisResult.transcript}</p>
              </div>
            </div>

            {/* Detailed Scores */}
            {analysisResult.detailedScores && (
              <DetailedScoresCard scores={analysisResult.detailedScores} />
            )}

            {/* Recommendations */}
            <div>
              <h3 className="font-medium mb-3">Recommendations</h3>
              <div className="space-y-2">
                {analysisResult.recommendations.map((rec, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <span className="text-sm">{rec}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <Button variant="outline" onClick={() => window.location.href = '/report-scam'}>
                Report This Scam
              </Button>
              <Button variant="outline" onClick={() => window.location.href = '/fir-generator'}>
                File FIR
              </Button>
              <Button variant="outline" onClick={resetAnalysis}>
                Analyze Another Call
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Information Cards */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Common Phone Scams</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              <li>• IRS/Tax scams</li>
              <li>• Tech support scams</li>
              <li>• Prize/Lottery scams</li>
              <li>• Bank fraud calls</li>
              <li>• Medicare/Insurance scams</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Warning Signs</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              <li>• Urgent threats or deadlines</li>
              <li>• Requests for gift cards</li>
              <li>• Asking for personal info</li>
              <li>• Pressure to act immediately</li>
              <li>• Too good to be true offers</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Stay Safe</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              <li>• Never give personal info</li>
              <li>• Hang up and verify</li>
              <li>• Don't trust caller ID</li>
              <li>• Report suspicious calls</li>
              <li>• Register for Do Not Call</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default VoiceScamDetector;