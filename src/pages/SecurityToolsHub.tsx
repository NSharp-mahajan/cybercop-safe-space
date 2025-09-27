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
  Loader2,
  Mail,
  Info,
  ArrowRight,
  Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RobotLogo } from "@/components/RobotLogo";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
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

interface BreachResult {
  compromised: boolean;
  breachCount?: number;
  breaches?: Array<{
    name: string;
    title?: string;
    domain?: string;
    date: string;
    pwnCount?: number;
    description: string;
    dataTypes?: string[];
    isVerified?: boolean;
    isSensitive?: boolean;
    logoPath?: string;
  }>;
  suggestions?: string[];
}

// URL Checker Interface
interface UrlResult {
  status: 'safe' | 'suspicious' | 'malicious';
  cached?: boolean;
  score?: number;
  details?: {
    checks: {
      patternAnalysis: { passed: boolean; score: number; reason?: string };
      domainReputation: { passed: boolean; score: number; reason?: string };
      sslCertificate: { passed: boolean; score: number; reason?: string };
      urlStructure: { passed: boolean; score: number; reason?: string };
      contentAnalysis: { passed: boolean; score: number; reason?: string };
    };
    warnings: string[];
    recommendations: string[];
    domainContext?: {
      type: 'government' | 'educational' | 'healthcare' | 'financial' | 'trusted' | 'general';
      trustLevel: 'high' | 'medium' | 'low';
      explanation: string;
    };
    scoreExplanation?: string;
  };
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
  const [improvedPassword, setImprovedPassword] = useState("");
  
  // Breach Check State
  const [email, setEmail] = useState("");
  const [isCheckingBreach, setIsCheckingBreach] = useState(false);
  const [passwordBreachResult, setPasswordBreachResult] = useState<BreachResult | null>(null);
  const [emailBreachResult, setEmailBreachResult] = useState<BreachResult | null>(null);

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

  // Check if password has been breached
  const checkPasswordBreach = async () => {
    if (!password.trim()) return;
    
    setIsCheckingBreach(true);
    setPasswordBreachResult(null);
    
    try {
      const { data: user } = await supabase.auth.getUser();
      
      const { data, error } = await supabase.functions.invoke('breach-check', {
        body: {
          type: 'password',
          value: password,
          user_id: user.user?.id,
        },
      });

      if (error) throw error;
      
      setPasswordBreachResult(data);
      
      if (data.compromised) {
        toast({
          title: "⚠️ Password Compromised!",
          description: `This password has been found in ${data.breachCount?.toLocaleString()} data breaches. Please use a different password.`,
          variant: "destructive",
        });
      } else {
        toast({
          title: "✅ Password Not Found in Breaches",
          description: "This password hasn't been found in any known data breaches.",
        });
      }
    } catch (error: any) {
      console.error('Error checking password breach:', error);
      toast({
        title: "Error",
        description: "Failed to check password breach status.",
        variant: "destructive",
      });
    } finally {
      setIsCheckingBreach(false);
    }
  };
  
  // Check if email has been breached
  const checkEmailBreach = async () => {
    if (!email.trim()) return;
    
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address.",
        variant: "destructive",
      });
      return;
    }
    
    setIsCheckingBreach(true);
    setEmailBreachResult(null);
    
    try {
      const { data: user } = await supabase.auth.getUser();
      
      const { data, error } = await supabase.functions.invoke('breach-check', {
        body: {
          type: 'email',
          value: email,
          user_id: user.user?.id,
        },
      });

      if (error) throw error;
      
      setEmailBreachResult(data);
      
      if (data.compromised) {
        toast({
          title: "⚠️ Email Found in Data Breaches",
          description: `This email has been found in ${data.breachCount} data breach${data.breachCount > 1 ? 'es' : ''}. Check the details below.`,
          variant: "destructive",
        });
      } else {
        toast({
          title: "✅ Email Not Found in Breaches",
          description: "This email hasn't been found in any known data breaches.",
        });
      }
    } catch (error: any) {
      console.error('Error checking email breach:', error);
      toast({
        title: "Error",
        description: "Failed to check email breach status.",
        variant: "destructive",
      });
    } finally {
      setIsCheckingBreach(false);
    }
  };
  
  // Improve existing password
  const improvePassword = () => {
    if (!password) return;
    
    let improved = password;
    
    // Add complexity based on what's missing
    if (!/[A-Z]/.test(improved)) {
      // Capitalize first letter or add random uppercase
      improved = improved.charAt(0).toUpperCase() + improved.slice(1);
    }
    
    if (!/\d/.test(improved)) {
      // Add a random number at a random position
      const num = Math.floor(Math.random() * 10);
      const pos = Math.floor(Math.random() * improved.length);
      improved = improved.slice(0, pos) + num + improved.slice(pos);
    }
    
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(improved)) {
      // Add a special character
      const specials = "!@#$%^&*";
      const special = specials[Math.floor(Math.random() * specials.length)];
      improved += special;
    }
    
    // Ensure minimum length
    while (improved.length < 12) {
      const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
      improved += chars[Math.floor(Math.random() * chars.length)];
    }
    
    // Replace common patterns
    improved = improved.replace(/password/gi, 'P@ssw0rd');
    improved = improved.replace(/admin/gi, '@dm1n');
    improved = improved.replace(/123456/g, '1@3$5^');
    improved = improved.replace(/qwerty/gi, 'Qw3r7y!');
    
    setImprovedPassword(improved);
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
        score: data.score,
        details: data.details,
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
              <RobotLogo size={64} className="text-primary" />
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

                  {/* Breach Check for Password */}
                  <Separator />
                  <div className="space-y-3">
                    <Label>Security Breach Check</Label>
                    <div className="flex gap-2">
                      <Button
                        onClick={checkPasswordBreach}
                        disabled={!password || isCheckingBreach}
                        className="transition-glow hover:glow-primary"
                      >
                        {isCheckingBreach ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Shield className="h-4 w-4" />
                        )}
                        {isCheckingBreach ? "Checking..." : "Check Password Breach"}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={improvePassword}
                        disabled={!password}
                        className="transition-glow hover:glow-primary"
                      >
                        <Sparkles className="h-4 w-4" />
                        Improve Password
                      </Button>
                    </div>

                    {passwordBreachResult && (
                      <div
                        className={`p-3 rounded-lg border ${
                          passwordBreachResult.compromised
                            ? "bg-red-50 border-red-200"
                            : "bg-green-50 border-green-200"
                        }`}
                      >
                        <div className="flex items-start gap-2">
                          {passwordBreachResult.compromised ? (
                            <XCircle className="h-4 w-4 text-red-500 mt-0.5" />
                          ) : (
                            <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                          )}
                          <div className="text-sm">
                            {passwordBreachResult.compromised ? (
                              <>
                                <div className="font-medium">
                                  Password found in {passwordBreachResult.breachCount?.toLocaleString()}{" "}
                                  breaches
                                </div>
                                <div className="text-red-700">
                                  Do not use this password. Generate a new one below.
                                </div>
                              </>
                            ) : (
                              <div className="font-medium">Password not found in known breaches</div>
                            )}

                            {passwordBreachResult.suggestions &&
                              passwordBreachResult.suggestions.length > 0 && (
                                <div className="mt-2 space-y-1">
                                  <div className="text-xs font-medium">Suggestions to strengthen:</div>
                                  <ul className="list-disc ml-5 text-xs text-muted-foreground">
                                    {passwordBreachResult.suggestions.map((s, idx) => (
                                      <li key={idx}>{s}</li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                          </div>
                        </div>
                      </div>
                    )}

                    {improvedPassword && (
                      <div className="space-y-2">
                        <Label>Improved Password Suggestion</Label>
                        <div className="flex gap-2">
                          <Input
                            value={improvedPassword}
                            readOnly
                            className="font-mono text-sm bg-muted/50"
                          />
                          <Button
                            size="icon"
                            variant="outline"
                            onClick={() => copyToClipboard(improvedPassword)}
                            className="shrink-0 transition-glow hover:glow-primary"
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="text-xs text-muted-foreground flex items-center gap-1">
                          <Info className="h-3 w-3" />
                          Use this as inspiration and store it in a password manager.
                        </div>
                      </div>
                    )}

                    {/* Email Breach Check */}
                    <Separator />
                    <div className="space-y-2">
                      <Label htmlFor="email">Check Email Breaches</Label>
                      <div className="flex gap-2">
                        <Input
                          id="email"
                          type="email"
                          placeholder="you@example.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          onKeyPress={(e) => e.key === "Enter" && checkEmailBreach()}
                          className="transition-glow focus:glow-primary"
                        />
                        <Button
                          onClick={checkEmailBreach}
                          disabled={!email || isCheckingBreach}
                          className="transition-glow hover:glow-primary"
                        >
                          {isCheckingBreach ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Mail className="h-4 w-4" />
                          )}
                          {isCheckingBreach ? "Checking..." : "Check Email"}
                        </Button>
                      </div>
                    </div>

                    {emailBreachResult && (
                      <div className="space-y-3">
                        <div
                          className={`p-3 rounded-lg border ${
                            emailBreachResult.compromised
                              ? "bg-yellow-50 border-yellow-200"
                              : "bg-green-50 border-green-200"
                          }`}
                        >
                          <div className="flex items-start gap-2">
                            {emailBreachResult.compromised ? (
                              <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5" />
                            ) : (
                              <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                            )}
                            <div className="text-sm">
                              {emailBreachResult.compromised ? (
                                <div className="font-medium">
                                  Email found in {emailBreachResult.breachCount} breaches
                                </div>
                              ) : (
                                <div className="font-medium">Email not found in known breaches</div>
                              )}
                            </div>
                          </div>
                        </div>

                        {emailBreachResult.breaches && emailBreachResult.breaches.length > 0 && (
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <Label>Breached Websites (Top {Math.min(10, emailBreachResult.breaches.length)})</Label>
                              <Badge variant="destructive">{emailBreachResult.breachCount} Total Breaches</Badge>
                            </div>
                            <div className="space-y-3 max-h-96 overflow-auto p-3 border rounded-lg bg-muted/20">
                              {emailBreachResult.breaches.slice(0, 10).map((breach, idx) => (
                                <div key={idx} className="p-4 rounded-lg bg-white border shadow-sm hover:shadow-md transition-shadow">
                                  <div className="flex items-start justify-between mb-2">
                                    <div className="flex-1">
                                      <div className="flex items-center gap-2">
                                        <h4 className="font-semibold text-base">{breach.title || breach.name}</h4>
                                        {breach.isVerified && (
                                          <Badge variant="secondary" className="text-xs">
                                            <CheckCircle className="h-3 w-3 mr-1" />
                                            Verified
                                          </Badge>
                                        )}
                                        {breach.isSensitive && (
                                          <Badge variant="destructive" className="text-xs">
                                            <AlertTriangle className="h-3 w-3 mr-1" />
                                            Sensitive
                                          </Badge>
                                        )}
                                      </div>
                                      {breach.domain && (
                                        <div className="text-sm text-muted-foreground mt-1">
                                          <Globe className="h-3 w-3 inline mr-1" />
                                          {breach.domain}
                                        </div>
                                      )}
                                    </div>
                                    <div className="text-right">
                                      <div className="text-sm font-medium text-muted-foreground">
                                        {new Date(breach.date).toLocaleDateString()}
                                      </div>
                                      {breach.pwnCount && (
                                        <div className="text-xs text-muted-foreground mt-1">
                                          {breach.pwnCount.toLocaleString()} accounts
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                  
                                  <p className="text-sm text-muted-foreground mb-2">
                                    {breach.description.length > 200 
                                      ? breach.description.substring(0, 200) + '...' 
                                      : breach.description
                                    }
                                  </p>
                                  
                                  {breach.dataTypes && breach.dataTypes.length > 0 && (
                                    <div className="mt-3">
                                      <div className="text-xs font-medium mb-1">Compromised data:</div>
                                      <div className="flex flex-wrap gap-1">
                                        {breach.dataTypes.map((dataType, dtIdx) => (
                                          <Badge key={dtIdx} variant="outline" className="text-xs">
                                            {dataType}
                                          </Badge>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                            
                            {emailBreachResult.breaches.length > 10 && (
                              <Alert className="bg-yellow-50 border-yellow-200">
                                <AlertTriangle className="h-4 w-4 text-yellow-600" />
                                <AlertDescription className="text-yellow-800">
                                  Showing top 10 of {emailBreachResult.breaches.length} total breaches. 
                                  Your email has been exposed in {emailBreachResult.breaches.length - 10} additional breaches.
                                </AlertDescription>
                              </Alert>
                            )}
                            
                            <Alert className="bg-blue-50 border-blue-200">
                              <Shield className="h-4 w-4 text-blue-600" />
                              <AlertDescription className="text-blue-800">
                                <strong>What to do:</strong>
                                <ul className="list-disc ml-5 mt-1">
                                  <li>Change passwords on all affected sites immediately</li>
                                  <li>Enable two-factor authentication wherever possible</li>
                                  <li>Use unique passwords for each service</li>
                                  <li>Monitor your accounts for suspicious activity</li>
                                  <li>Consider using a password manager</li>
                                </ul>
                              </AlertDescription>
                            </Alert>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
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
                        <div className="flex items-center gap-3">
                          {/* Domain Context Badge */}
                          {urlResult.details?.domainContext && (
                            <Badge 
                              variant={urlResult.details.domainContext.trustLevel === 'high' ? 'default' : 'secondary'}
                              className="text-xs"
                            >
                              {urlResult.details.domainContext.type === 'government' && '🏛️ Government'}
                              {urlResult.details.domainContext.type === 'educational' && '🎓 Educational'}
                              {urlResult.details.domainContext.type === 'healthcare' && '🏥 Healthcare'}
                              {urlResult.details.domainContext.type === 'financial' && '🏦 Financial'}
                              {urlResult.details.domainContext.type === 'trusted' && '✓ Trusted'}
                              {urlResult.details.domainContext.type === 'general' && '🌐 General'}
                            </Badge>
                          )}
                          {urlResult.score !== undefined && (
                            <div className="text-right">
                              <div className="text-2xl font-bold">{urlResult.score}/100</div>
                              <div className="text-xs text-muted-foreground">Safety Score</div>
                            </div>
                          )}
                          <Badge className={`${getUrlStatusColor(urlResult.status)} text-white`}>
                            {getUrlStatusIcon(urlResult.status)}
                            <span className="ml-1 capitalize">{urlResult.status}</span>
                          </Badge>
                        </div>
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
                              {urlResult.details?.scoreExplanation || (
                                urlResult.status === 'safe' ? "This URL has been verified and appears to be legitimate. However, always exercise caution when sharing personal information." :
                                urlResult.status === 'suspicious' ? "This URL exhibits patterns commonly associated with phishing or scam sites. Proceed with extreme caution." :
                                "This URL has been identified as malicious. Do not visit this site or download any content from it."
                              )}
                            </p>
                            {urlResult.cached && (
                              <Badge variant="secondary" className="mt-2 text-xs">
                                Cached Result
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      {/* Domain Context Information */}
                      {urlResult.details?.domainContext && (
                        <Alert className="bg-blue-50 border-blue-200">
                          <Info className="h-4 w-4 text-blue-600" />
                          <AlertDescription className="text-blue-800">
                            <strong>Domain Information:</strong> {urlResult.details.domainContext.explanation}
                          </AlertDescription>
                        </Alert>
                      )}

                      {/* Detailed Analysis */}
                      {urlResult.details && (
                        <div className="space-y-4">
                          <h4 className="font-semibold">Detailed Analysis</h4>
                          <div className="grid gap-3">
                            {Object.entries(urlResult.details.checks).map(([checkName, check]) => {
                              const displayNames: Record<string, string> = {
                                patternAnalysis: "Pattern Analysis",
                                domainReputation: "Domain Reputation",
                                sslCertificate: "SSL Certificate",
                                urlStructure: "URL Structure",
                                contentAnalysis: "Content Analysis"
                              };
                              
                              return (
                                <div key={checkName} className="p-3 rounded-lg bg-muted/30 border">
                                  <div className="flex items-start justify-between">
                                    <div className="flex items-start gap-2">
                                      {check.passed ? (
                                        <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                                      ) : (
                                        <XCircle className="h-4 w-4 text-red-500 mt-0.5" />
                                      )}
                                      <div>
                                        <div className="font-medium text-sm">{displayNames[checkName] || checkName}</div>
                                        {check.reason && (
                                          <div className="text-xs text-muted-foreground mt-1">{check.reason}</div>
                                        )}
                                      </div>
                                    </div>
                                    <Badge variant={check.passed ? "default" : "destructive"} className="text-xs">
                                      {check.score} pts
                                    </Badge>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                          
                          {/* Warnings */}
                          {urlResult.details.warnings && urlResult.details.warnings.length > 0 && (
                            <div className="space-y-2">
                              <h5 className="font-medium text-sm">Warnings</h5>
                              {urlResult.details.warnings.map((warning, index) => (
                                <Alert key={index} className="bg-yellow-50 border-yellow-200">
                                  <AlertTriangle className="h-4 w-4 text-yellow-600" />
                                  <AlertDescription className="text-yellow-800 text-sm">
                                    {warning}
                                  </AlertDescription>
                                </Alert>
                              ))}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Security Recommendations */}
                      <div className="space-y-3">
                        <Label>Security Recommendations</Label>
                        <div className="space-y-2">
                          {urlResult.details?.recommendations && urlResult.details.recommendations.length > 0 ? (
                            urlResult.details.recommendations.map((rec, index) => (
                              <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-blue-50 border border-blue-200">
                                <Shield className="h-4 w-4 text-blue-500 mt-0.5" />
                                <span className="text-sm text-blue-700">{rec}</span>
                              </div>
                            ))
                          ) : (
                            <>
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
                            </>
                          )}
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
