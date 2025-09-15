import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  Lock, 
  Eye, 
  EyeOff, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Copy,
  RefreshCw
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface PasswordCriteria {
  length: boolean;
  uppercase: boolean;
  lowercase: boolean;
  numbers: boolean;
  symbols: boolean;
  noCommon: boolean;
}

const PasswordChecker = () => {
  const { toast } = useToast();
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [strength, setStrength] = useState(0);
  const [criteria, setCriteria] = useState<PasswordCriteria>({
    length: false,
    uppercase: false,
    lowercase: false,
    numbers: false,
    symbols: false,
    noCommon: false,
  });
  const [generatedPassword, setGeneratedPassword] = useState("");

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

    setCriteria(newCriteria);

    // Calculate strength score
    const score = Object.values(newCriteria).filter(Boolean).length;
    setStrength((score / 6) * 100);
  };

  useEffect(() => {
    checkPasswordStrength(password);
  }, [password]);

  const getStrengthText = () => {
    if (strength < 30) return { text: "Very Weak", color: "text-cyber-danger" };
    if (strength < 50) return { text: "Weak", color: "text-cyber-warning" };
    if (strength < 70) return { text: "Medium", color: "text-yellow-500" };
    if (strength < 90) return { text: "Strong", color: "text-cyber-success" };
    return { text: "Very Strong", color: "text-cyber-success" };
  };

  const generateSecurePassword = () => {
    const lowercase = "abcdefghijklmnopqrstuvwxyz";
    const uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const numbers = "0123456789";
    const symbols = "!@#$%^&*()_+-=[]{}|;':\",./<>?";
    
    const allChars = lowercase + uppercase + numbers + symbols;
    let newPassword = "";
    
    // Ensure at least one character from each category
    newPassword += lowercase[Math.floor(Math.random() * lowercase.length)];
    newPassword += uppercase[Math.floor(Math.random() * uppercase.length)];
    newPassword += numbers[Math.floor(Math.random() * numbers.length)];
    newPassword += symbols[Math.floor(Math.random() * symbols.length)];
    
    // Fill the rest randomly
    for (let i = 4; i < 16; i++) {
      newPassword += allChars[Math.floor(Math.random() * allChars.length)];
    }
    
    // Shuffle the password
    const shuffled = newPassword.split('').sort(() => Math.random() - 0.5).join('');
    setGeneratedPassword(shuffled);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast({
        title: "Copied!",
        description: "Password copied to clipboard",
      });
    });
  };

  const strengthData = getStrengthText();

  const criteriaList = [
    { key: "length", label: "At least 8 characters", met: criteria.length },
    { key: "uppercase", label: "Uppercase letter (A-Z)", met: criteria.uppercase },
    { key: "lowercase", label: "Lowercase letter (a-z)", met: criteria.lowercase },
    { key: "numbers", label: "Number (0-9)", met: criteria.numbers },
    { key: "symbols", label: "Special character (!@#$%)", met: criteria.symbols },
    { key: "noCommon", label: "Not a common password", met: criteria.noCommon },
  ];

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="container mx-auto max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <div className="p-4 rounded-full bg-primary/10 glow-primary">
              <Lock className="h-12 w-12 text-primary" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="gradient-primary bg-clip-text text-transparent">Password Strength Checker</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Analyze your password security and generate ultra-secure passwords
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Password Checker */}
          <Card className="border-border/40">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5 text-primary" />
                Check Password Strength
              </CardTitle>
              <CardDescription>
                Enter your password to analyze its security strength
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Password Input */}
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
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
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              {/* Strength Meter */}
              {password && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <Label>Password Strength</Label>
                      <Badge 
                        variant="secondary" 
                        className={`${strengthData.color} glow-primary`}
                      >
                        {strengthData.text}
                      </Badge>
                    </div>
                    <Progress 
                      value={strength} 
                      className="h-3 transition-all duration-300"
                    />
                  </div>

                  {/* Criteria Checklist */}
                  <div className="space-y-3">
                    <Label>Security Requirements</Label>
                    <div className="space-y-2">
                      {criteriaList.map((criterion) => (
                        <div
                          key={criterion.key}
                          className="flex items-center gap-3 p-2 rounded-lg bg-muted/30"
                        >
                          {criterion.met ? (
                            <CheckCircle className="h-4 w-4 text-cyber-success" />
                          ) : (
                            <XCircle className="h-4 w-4 text-cyber-danger" />
                          )}
                          <span className={`text-sm ${criterion.met ? 'text-cyber-success' : 'text-muted-foreground'}`}>
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
                Generate a cryptographically secure password
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

                  <div className="p-4 rounded-lg bg-cyber-success/10 border border-cyber-success/20">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-cyber-success mt-0.5" />
                      <div>
                        <h4 className="font-semibold text-cyber-success mb-1">Ultra-Secure Password</h4>
                        <p className="text-sm text-muted-foreground">
                          This password meets all security requirements and provides maximum protection.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Security Tips */}
              <div className="space-y-4">
                <Label>Security Tips</Label>
                <div className="space-y-3">
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/30">
                    <AlertTriangle className="h-5 w-5 text-cyber-warning mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-sm mb-1">Use Unique Passwords</h4>
                      <p className="text-xs text-muted-foreground">
                        Never reuse passwords across different accounts
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/30">
                    <AlertTriangle className="h-5 w-5 text-cyber-warning mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-sm mb-1">Enable 2FA</h4>
                      <p className="text-xs text-muted-foreground">
                        Always enable two-factor authentication when available
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/30">
                    <AlertTriangle className="h-5 w-5 text-cyber-warning mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-sm mb-1">Use Password Managers</h4>
                      <p className="text-xs text-muted-foreground">
                        Consider using a reputable password manager
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PasswordChecker;