import { useState, useEffect } from "react";
import { 
  Lock, 
  Eye, 
  EyeOff, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Copy,
  RefreshCw,
  Shield,
  ShieldCheck,
  ShieldX,
  Globe,
  KeyRound,
  Scan,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

// Password Checker Interfaces
interface PasswordCriteria {
  length: boolean;
  uppercase: boolean;
  lowercase: boolean;
  numbers: boolean;
  symbols: boolean;
  noCommon: boolean;
}

// URL Checker Interface
interface UrlResult {
  status: 'safe' | 'suspicious' | 'malicious';
  cached?: boolean;
}


const SecurityToolsHub = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("password");

  // Password Checker State
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [passwordCriteria, setPasswordCriteria] = useState<PasswordCriteria>({
    length: false,
    uppercase: false,
    lowercase: false,
    numbers: false,
    symbols: false,
    noCommon: false,
  });
  const [generatedPassword, setGeneratedPassword] = useState("");

  // URL Checker State
  const [url, setUrl] = useState("");
  const [isCheckingUrl, setIsCheckingUrl] = useState(false);
  const [urlResult, setUrlResult] = useState<UrlResult | null>(null);


  // Password Checker Logic
  const commonPasswords = [
    "password", "123456", "123456789", "12345678", "12345",
    "1234567", "admin", "qwerty", "abc123", "password123"
  ];

  const checkPasswordStrength = (pwd: string) => {
    const newCriteria: PasswordCriteria = {
      length: pwd.length >= 8,
      uppercase: /[A-Z]/.test(pwd),
      lowercase: /[a-z]/.test(pwd),
      numbers: /\d/.test(pwd),
      symbols: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pwd),
      noCommon: !commonPasswords.includes(pwd.toLowerCase()),
    };

    setPasswordCriteria(newCriteria);
    const score = Object.values(newCriteria).filter(Boolean).length;
    setPasswordStrength((score / 6) * 100);
  };

  useEffect(() => {
    checkPasswordStrength(password);
  }, [password]);

  const getPasswordStrengthText = () => {
    if (passwordStrength < 30) return { text: "Very Weak", color: "text-red-500" };
    if (passwordStrength < 50) return { text: "Weak", color: "text-orange-500" };
    if (passwordStrength < 70) return { text: "Medium", color: "text-yellow-500" };
    if (passwordStrength < 90) return { text: "Strong", color: "text-green-500" };
    return { text: "Very Strong", color: "text-green-600" };
  };

  const generateSecurePassword = () => {
    const lowercase = "abcdefghijklmnopqrstuvwxyz";
    const uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const numbers = "0123456789";
    const symbols = "!@#$%^&*()_+-=[]{}|;':\",./<>?";
    
    const allChars = lowercase + uppercase + numbers + symbols;
    let newPassword = "";
    
    newPassword += lowercase[Math.floor(Math.random() * lowercase.length)];
    newPassword += uppercase[Math.floor(Math.random() * uppercase.length)];
    newPassword += numbers[Math.floor(Math.random() * numbers.length)];
    newPassword += symbols[Math.floor(Math.random() * symbols.length)];
    
    for (let i = 4; i < 16; i++) {
      newPassword += allChars[Math.floor(Math.random() * allChars.length)];
    }
    
    const shuffled = newPassword.split('').sort(() => Math.random() - 0.5).join('');
    setGeneratedPassword(shuffled);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast({
        title: "Copied!",
        description: "Text copied to clipboard",
      });
    });
  };

  // URL Checker Logic
  const checkUrl = async () => {
    if (!url.trim()) return;

    try {
      new URL(url);
    } catch {
      toast({
        title: "Invalid URL",
        description: "Please enter a valid URL (e.g., https://example.com)",
        variant: "destructive",
      });
      return;
    }

    setIsCheckingUrl(true);
    setUrlResult(null);

    try {
      const { data: user } = await supabase.auth.getUser();
      
      const { data, error } = await supabase.functions.invoke('url-check', {
        body: {
          url: url,
          user_id: user.user?.id,
        },
      });

      if (error) throw error;

      setUrlResult({
        status: data.status,
        cached: data.cached,
      });

      if (data.status === 'malicious') {
        toast({
          title: "⚠️ Malicious URL Detected",
          description: "This URL has been flagged as potentially dangerous. Avoid visiting it.",
          variant: "destructive",
        });
      } else if (data.status === 'suspicious') {
        toast({
          title: "🔍 Suspicious URL",
          description: "This URL shows suspicious patterns. Exercise caution.",
        });
      } else {
        toast({
          title: "✅ URL is Safe",
          description: "This URL appears to be safe to visit.",
        });
      }

    } catch (error: any) {
      console.error('Error checking URL:', error);
      toast({
        title: "Error",
        description: "Failed to check URL. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsCheckingUrl(false);
    }
  };


  // Helper Functions
  const getUrlStatusIcon = (status: string) => {
    switch (status) {
      case 'safe': return <ShieldCheck className="h-4 w-4" />;
      case 'suspicious': return <Shield className="h-4 w-4" />;
      case 'malicious': return <ShieldX className="h-4 w-4" />;
      default: return <Shield className="h-4 w-4" />;
    }
  };

  const getUrlStatusColor = (status: string) => {
    switch (status) {
      case 'safe': return 'bg-green-500 hover:bg-green-600';
      case 'suspicious': return 'bg-yellow-500 hover:bg-yellow-600';
      case 'malicious': return 'bg-red-500 hover:bg-red-600';
      default: return 'bg-gray-500';
    }
  };


  const passwordStrengthData = getPasswordStrengthText();

  const passwordCriteriaList = [
    { key: "length", label: "At least 8 characters", met: passwordCriteria.length },
    { key: "uppercase", label: "Uppercase letter (A-Z)", met: passwordCriteria.uppercase },
    { key: "lowercase", label: "Lowercase letter (a-z)", met: passwordCriteria.lowercase },
    { key: "numbers", label: "Number (0-9)", met: passwordCriteria.numbers },
    { key: "symbols", label: "Special character (!@#$%)", met: passwordCriteria.symbols },
    { key: "noCommon", label: "Not a common password", met: passwordCriteria.noCommon },
  ];

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <div className="p-4 rounded-full bg-primary/10 glow-primary">
              <Shield className="h-12 w-12 text-primary" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="gradient-primary bg-clip-text text-transparent">Security Tools Hub</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Essential security tools for password protection and URL verification
          </p>
        </div>

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="password" className="flex items-center gap-2">
              <KeyRound className="h-4 w-4" />
              Password Security
            </TabsTrigger>
            <TabsTrigger value="url" className="flex items-center gap-2">
              <Globe className="h-4 w-4" />
              URL Scanner
            </TabsTrigger>
          </TabsList>

          {/* Password Checker Tab */}
          <TabsContent value="password" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-8">
              {/* Password Analyzer */}
              <Card className="border-border/40">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lock className="h-5 w-5 text-primary" />
                    Password Strength Analyzer
                  </CardTitle>
                  <CardDescription>
                    Check your password's security strength and get improvement suggestions
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="password">Enter Password</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Type your password here..."
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="pr-12 transition-glow focus:glow-primary"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>

                  {password && (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <Label>Password Strength</Label>
                          <Badge variant="secondary" className={`${passwordStrengthData.color} glow-primary`}>
                            {passwordStrengthData.text}
                          </Badge>
                        </div>
                        <Progress value={passwordStrength} className="h-3 transition-all duration-300" />
                      </div>

                      <div className="space-y-3">
                        <Label>Security Requirements</Label>
                        <div className="space-y-2">
                          {passwordCriteriaList.map((criterion) => (
                            <div
                              key={criterion.key}
                              className="flex items-center gap-3 p-2 rounded-lg bg-muted/30"
                            >
                              {criterion.met ? (
                                <CheckCircle className="h-4 w-4 text-green-500" />
                              ) : (
                                <XCircle className="h-4 w-4 text-red-500" />
                              )}
                              <span className={`text-sm ${criterion.met ? 'text-green-500' : 'text-muted-foreground'}`}>
                                {criterion.label}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Password Generator */}
              <Card className="border-border/40">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <RefreshCw className="h-5 w-5 text-primary" />
                    Secure Password Generator
                  </CardTitle>
                  <CardDescription>
                    Generate ultra-secure passwords that meet all security requirements
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <Button
                    onClick={generateSecurePassword}
                    className="w-full glow-primary transition-glow"
                    size="lg"
                  >
                    <RefreshCw className="mr-2 h-5 w-5" />
                    Generate Secure Password
                  </Button>

                  {generatedPassword && (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>Generated Password</Label>
                        <div className="flex gap-2">
                          <Input
                            value={generatedPassword}
                            readOnly
                            className="font-mono text-sm bg-muted/50"
                          />
                          <Button
                            size="icon"
                            variant="outline"
                            onClick={() => copyToClipboard(generatedPassword)}
                            className="shrink-0 transition-glow hover:glow-primary"
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      <Alert className="bg-green-50 border-green-200">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <AlertDescription className="text-green-700">
                          <strong>Ultra-Secure Password Generated!</strong> This password meets all security requirements and provides maximum protection.
                        </AlertDescription>
                      </Alert>
                    </div>
                  )}

                  {/* Security Tips */}
                  <div className="space-y-4">
                    <Label>Security Best Practices</Label>
                    <div className="space-y-3">
                      {[
                        { title: "Use Unique Passwords", desc: "Never reuse passwords across different accounts" },
                        { title: "Enable 2FA", desc: "Always enable two-factor authentication when available" },
                        { title: "Use Password Managers", desc: "Consider using a reputable password manager" },
                        { title: "Regular Updates", desc: "Change passwords every 3-6 months" }
                      ].map((tip, index) => (
                        <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-muted/30">
                          <AlertTriangle className="h-5 w-5 text-primary mt-0.5" />
                          <div>
                            <h4 className="font-semibold text-sm mb-1">{tip.title}</h4>
                            <p className="text-xs text-muted-foreground">{tip.desc}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* URL Scanner Tab */}
          <TabsContent value="url" className="space-y-6">
            <Card className="border-border/40 max-w-4xl mx-auto">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5 text-primary" />
                  URL Security Scanner
                </CardTitle>
                <CardDescription>
                  Check if a URL is safe, suspicious, or malicious before visiting
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="url">Enter URL to Check</Label>
                  <div className="flex gap-2">
                    <Input
                      id="url"
                      placeholder="https://example.com"
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && checkUrl()}
                      disabled={isCheckingUrl}
                      className="flex-1 transition-glow focus:glow-primary"
                    />
                    <Button
                      onClick={checkUrl}
                      disabled={isCheckingUrl || !url.trim()}
                      className="glow-primary transition-glow"
                    >
                      {isCheckingUrl ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Scan className="h-4 w-4" />
                      )}
                      {isCheckingUrl ? "Scanning..." : "Scan URL"}
                    </Button>
                  </div>
                </div>

                {urlResult && (
                  <div className="space-y-4">
                    <Separator />
                    
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold">Scan Results</h3>
                        <Badge className={`${getUrlStatusColor(urlResult.status)} text-white`}>
                          {getUrlStatusIcon(urlResult.status)}
                          <span className="ml-1 capitalize">{urlResult.status}</span>
                        </Badge>
                      </div>

                      <div className="p-4 rounded-lg border">
                        <div className="flex items-start gap-3">
                          {urlResult.status === 'safe' && (
                            <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                          )}
                          {urlResult.status === 'suspicious' && (
                            <AlertTriangle className="h-5 w-5 text-yellow-500 mt-0.5" />
                          )}
                          {urlResult.status === 'malicious' && (
                            <XCircle className="h-5 w-5 text-red-500 mt-0.5" />
                          )}
                          <div className="flex-1">
                            <h4 className="font-semibold mb-1">
                              {urlResult.status === 'safe' && "URL appears safe to visit"}
                              {urlResult.status === 'suspicious' && "URL shows suspicious patterns"}
                              {urlResult.status === 'malicious' && "URL flagged as dangerous"}
                            </h4>
                            <p className="text-sm text-muted-foreground">
                              {urlResult.status === 'safe' && "This URL has been verified and appears to be legitimate. However, always exercise caution when sharing personal information."}
                              {urlResult.status === 'suspicious' && "This URL exhibits patterns commonly associated with phishing or scam sites. Proceed with extreme caution."}
                              {urlResult.status === 'malicious' && "This URL has been identified as malicious. Do not visit this site or download any content from it."}
                            </p>
                            {urlResult.cached && (
                              <Badge variant="secondary" className="mt-2 text-xs">
                                Cached Result
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Security Recommendations */}
                      <div className="space-y-3">
                        <Label>Security Recommendations</Label>
                        <div className="space-y-2">
                          {urlResult.status === 'safe' && [
                            "Verify the website's SSL certificate before entering sensitive data",
                            "Check the URL spelling for any subtle misspellings",
                            "Be cautious of unsolicited links, even from safe domains"
                          ].map((rec, index) => (
                            <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-green-50 border border-green-200">
                              <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                              <span className="text-sm text-green-700">{rec}</span>
                            </div>
                          ))}
                          
                          {urlResult.status === 'suspicious' && [
                            "Do not enter personal or financial information",
                            "Verify the legitimacy through official channels",
                            "Use antivirus software before proceeding"
                          ].map((rec, index) => (
                            <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-yellow-50 border border-yellow-200">
                              <AlertTriangle className="h-4 w-4 text-yellow-500 mt-0.5" />
                              <span className="text-sm text-yellow-700">{rec}</span>
                            </div>
                          ))}
                          
                          {urlResult.status === 'malicious' && [
                            "Do not visit this website under any circumstances",
                            "Block this URL in your browser and security software",
                            "Report this URL to cybersecurity authorities"
                          ].map((rec, index) => (
                            <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-red-50 border border-red-200">
                              <XCircle className="h-4 w-4 text-red-500 mt-0.5" />
                              <span className="text-sm text-red-700">{rec}</span>
                            </div>
                          ))}
                        </div>
                      </div>
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

export default SecurityToolsHub;
