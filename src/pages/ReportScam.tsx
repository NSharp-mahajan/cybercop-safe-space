import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  AlertTriangle, 
  Send, 
  Loader2, 
  Shield, 
  Eye, 
  Lock, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Zap,
  Target,
  Users,
  Clock,
  FileText,
  MapPin,
  User,
  Globe,
  Sparkles,
  Star,
  Crown,
  ArrowRight,
  ArrowLeft,
  RefreshCw
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import UrlChecker from '@/components/UrlChecker';

const ReportScamPage = () => {
  const [formData, setFormData] = useState({
    url: '',
    title: '',
    description: '',
    category: '',
    reporterName: '',
    location: '',
    isAnonymous: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [formProgress, setFormProgress] = useState(0);
  const [particles, setParticles] = useState<Array<{id: number, x: number, y: number, delay: number}>>([]);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const [validationErrors, setValidationErrors] = useState<{[key: string]: string}>({});
  const [isSuccess, setIsSuccess] = useState(false);
  const { toast } = useToast();

  const steps = [
    { id: 1, title: "Suspicious URL", icon: Globe, description: "Enter the suspicious website URL" },
    { id: 2, title: "Scam Details", icon: FileText, description: "Describe the scam type and details" },
    { id: 3, title: "Your Information", icon: User, description: "Provide your contact details" },
    { id: 4, title: "Review & Submit", icon: Send, description: "Review and submit your report" }
  ];

  const categories = [
    { value: "phishing", label: "Phishing", icon: Target, color: "text-red-400", description: "Fake login pages or credential theft" },
    { value: "fake-shopping", label: "Fake Shopping", icon: Globe, color: "text-orange-400", description: "Fraudulent e-commerce sites" },
    { value: "investment", label: "Investment Scam", icon: Zap, color: "text-yellow-400", description: "Fake investment opportunities" },
    { value: "romance", label: "Romance Scam", icon: Users, color: "text-pink-400", description: "Dating and relationship fraud" },
    { value: "tech-support", label: "Tech Support", icon: AlertCircle, color: "text-blue-400", description: "Fake technical support" },
    { value: "identity-theft", label: "Identity Theft", icon: Lock, color: "text-purple-400", description: "Personal information theft" },
    { value: "other", label: "Other", icon: AlertTriangle, color: "text-gray-400", description: "Other types of scams" }
  ];

  // Generate floating particles
  useEffect(() => {
    const newParticles = Array.from({ length: 15 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      delay: Math.random() * 5
    }));
    setParticles(newParticles);
  }, []);

  // Calculate form progress
  useEffect(() => {
    const requiredFields = ['url', 'title', 'description', 'category'];
    const filledFields = requiredFields.filter(field => formData[field as keyof typeof formData]);
    const progress = (filledFields.length / requiredFields.length) * 100;
    setFormProgress(progress);
  }, [formData]);

  React.useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();
  }, []);

  // Mouse tracking for 3D effects
  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setMousePosition({ x, y });
  };

  // Validation function
  const validateField = (field: string, value: string) => {
    const errors = { ...validationErrors };
    
    switch (field) {
      case 'url':
        if (!value) {
          errors.url = 'URL is required';
        } else {
          try {
            new URL(value);
            errors.url = '';
          } catch {
            errors.url = 'Please enter a valid URL';
          }
        }
        break;
      case 'title':
        if (!value) {
          errors.title = 'Title is required';
        } else if (value.length < 5) {
          errors.title = 'Title must be at least 5 characters';
        } else {
          errors.title = '';
        }
        break;
      case 'description':
        if (!value) {
          errors.description = 'Description is required';
        } else if (value.length < 20) {
          errors.description = 'Description must be at least 20 characters';
        } else {
          errors.description = '';
        }
        break;
      case 'category':
        if (!value) {
          errors.category = 'Please select a category';
        } else {
          errors.category = '';
        }
        break;
    }
    
    setValidationErrors(errors);
    return !errors[field];
  };

  // Navigation functions
  const nextStep = () => {
    // Validate current step before proceeding
    if (currentStep === 1 && !formData.url) {
      toast({
        title: "URL Required",
        description: "Please enter a suspicious URL before proceeding.",
        variant: "destructive",
      });
      return;
    }
    if (currentStep === 2 && (!formData.title || !formData.description || !formData.category)) {
      toast({
        title: "Details Required",
        description: "Please fill in all scam details before proceeding.",
        variant: "destructive",
      });
      return;
    }
    
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.url || !formData.title || !formData.description || !formData.category) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    // Basic URL validation
    try {
      new URL(formData.url);
    } catch {
      toast({
        title: "Invalid URL",
        description: "Please enter a valid URL (e.g., https://example.com)",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      console.log('Submitting report with data:', {
        url: formData.url,
        title: formData.title,
        description: formData.description,
        category: formData.category,
        reporter_name: formData.isAnonymous ? null : formData.reporterName,
        reporter_user_id: user?.id,
        location: formData.location || null,
      });

      // Try Supabase function first
    try {
      const { data, error } = await supabase.functions.invoke('scam-report', {
        body: {
          url: formData.url,
          title: formData.title,
          description: formData.description,
          category: formData.category,
          reporter_name: formData.isAnonymous ? null : formData.reporterName,
          reporter_user_id: user?.id,
          location: formData.location || null,
        },
      });

        console.log('Supabase function response:', { data, error });

        if (error) {
          console.error('Supabase function error:', error);
          throw new Error(error.message || 'Function call failed');
        }

        if (data && data.error) {
          if (data.error.includes('already been reported')) {
        toast({
          title: "Already Reported",
          description: "This URL has already been reported to the community.",
              variant: "destructive",
            });
            return;
          } else {
            throw new Error(data.error);
          }
        } else if (data && data.success) {
          setIsSuccess(true);
          toast({
            title: "Report Submitted Successfully! 🎉",
            description: "Thank you for helping keep our community safe!",
          });
          
          // Reset form after success animation
          setTimeout(() => {
            setFormData({
              url: '',
              title: '',
              description: '',
              category: '',
              reporterName: '',
              location: '',
              isAnonymous: false,
            });
            setCurrentStep(1);
            setIsSuccess(false);
          }, 3000);
          return;
      } else {
          throw new Error('Unexpected response format');
        }
      } catch (functionError) {
        console.warn('Supabase function failed, trying direct database insert:', functionError);
        
        // Fallback: Direct database insert
        const urlHash = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(formData.url.toLowerCase().trim()))
          .then(hashBuffer => Array.from(new Uint8Array(hashBuffer))
            .map(b => b.toString(16).padStart(2, '0'))
            .join(''));

        // Check if URL already exists
        const { data: existingReport } = await supabase
          .from('scam_reports')
          .select('id, title, upvotes, downvotes')
          .eq('url_hash', urlHash)
          .single();

        if (existingReport) {
          toast({
            title: "Already Reported",
            description: "This URL has already been reported to the community.",
            variant: "destructive",
          });
          return;
        }

        // Insert new report
        const { data: report, error: insertError } = await supabase
          .from('scam_reports')
          .insert({
            url: formData.url.trim(),
            url_hash: urlHash,
            title: formData.title.trim(),
            description: formData.description.trim(),
            category: formData.category,
            reporter_name: formData.isAnonymous ? null : formData.reporterName?.trim(),
            reporter_user_id: user?.id,
            location: formData.location?.trim() || null,
            status: 'pending',
            upvotes: 0,
            downvotes: 0,
          })
          .select()
          .single();

        if (insertError) {
          console.error('Direct insert error:', insertError);
          throw new Error(insertError.message || 'Failed to create scam report');
        }

        console.log('Report created successfully:', report);
        setIsSuccess(true);
        toast({
          title: "Report Submitted Successfully! 🎉",
          description: "Thank you for helping keep our community safe!",
        });
        
        // Reset form after success animation
        setTimeout(() => {
        setFormData({
          url: '',
          title: '',
          description: '',
          category: '',
          reporterName: '',
          location: '',
          isAnonymous: false,
        });
          setCurrentStep(1);
          setIsSuccess(false);
        }, 3000);
      }
    } catch (error) {
      console.error('Error submitting report:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      toast({
        title: "Submission Failed",
        description: `Failed to submit report: ${errorMessage}`,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
  return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center px-4">
        {/* Success Animation */}
        <div className="text-center space-y-8 max-w-2xl mx-auto">
          <div className="relative">
            <div className="w-32 h-32 mx-auto bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full flex items-center justify-center shadow-2xl animate-bounce">
              <CheckCircle className="w-16 h-16 text-white" />
            </div>
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full blur-2xl opacity-50 animate-pulse"></div>
          </div>
          
          <div className="space-y-4">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
              Report Submitted Successfully! 🎉
        </h1>
            <p className="text-xl text-slate-300">
              Thank you for helping keep our community safe! Your report has been submitted and will be reviewed by our security team.
        </p>
      </div>

          <div className="flex items-center justify-center space-x-4 text-slate-400">
            <div className="flex items-center space-x-2">
              <Shield className="w-5 h-5 text-cyan-400" />
              <span>Report Protected</span>
            </div>
            <div className="flex items-center space-x-2">
              <Users className="w-5 h-5 text-blue-400" />
              <span>Community Safe</span>
            </div>
            <div className="flex items-center space-x-2">
              <Clock className="w-5 h-5 text-purple-400" />
              <span>Under Review</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden">
      {/* Clean Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900" />
      
      {/* Subtle Grid Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, rgba(6, 182, 212, 0.3) 1px, transparent 0)`,
          backgroundSize: '20px 20px'
        }}></div>
      </div>

      <div className="container mx-auto px-4 py-12 relative z-10">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="space-y-4">
            <h1 className="text-4xl lg:text-5xl font-bold text-white mb-4">
              Report a Scam
            </h1>
            <div className="w-24 h-1 bg-gradient-to-r from-cyan-400 to-blue-500 mx-auto rounded-full"></div>
          </div>
          
          <p className="text-xl text-slate-300 mb-8 max-w-3xl mx-auto">
            Help protect our community by reporting suspicious websites and scams. 
            Your report makes the internet safer for everyone.
          </p>

          {/* Progress Indicator */}
          <div className="max-w-2xl mx-auto mb-8">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-slate-400">Form Progress</span>
              <span className="text-sm font-medium text-slate-400">{Math.round(formProgress)}% Complete</span>
            </div>
            <Progress value={formProgress} className="h-2 bg-slate-700/50">
              <div className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full transition-all duration-500" style={{ width: `${formProgress}%` }}></div>
            </Progress>
          </div>
        </div>

        {/* Step Navigation */}
        <div className="max-w-4xl mx-auto mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className={`relative flex items-center justify-center w-12 h-12 rounded-full border-2 transition-all duration-300 ${
                  currentStep >= step.id 
                    ? 'bg-cyan-500 border-cyan-500 text-white shadow-lg shadow-cyan-500/20' 
                    : 'bg-slate-800/50 border-slate-600 text-slate-400'
                }`}>
                  {currentStep > step.id ? (
                    <CheckCircle className="w-6 h-6" />
                  ) : (
                    <step.icon className="w-6 h-6" />
                  )}
                </div>
                <div className="ml-3 hidden sm:block">
                  <p className={`text-sm font-medium ${currentStep >= step.id ? 'text-white' : 'text-slate-400'}`}>
                    {step.title}
                  </p>
                  <p className="text-xs text-slate-500">{step.description}</p>
                </div>
                {index < steps.length - 1 && (
                  <div className={`hidden sm:block w-16 h-0.5 mx-4 ${
                    currentStep > step.id ? 'bg-cyan-500' : 'bg-slate-600'
                  }`} />
                )}
              </div>
            ))}
          </div>
      </div>

        {/* Main Form Card */}
        <div 
          className="max-w-4xl mx-auto"
          onMouseMove={handleMouseMove}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          style={{
            transform: `perspective(1000px) rotateX(${(mousePosition.y - 50) * 0.02}deg) rotateY(${(mousePosition.x - 50) * 0.02}deg)`,
            transition: isHovered ? 'none' : 'transform 0.3s ease-out'
          }}
        >
          <Card className="relative overflow-hidden bg-slate-800/50 border border-slate-700/50 shadow-xl hover:shadow-2xl transition-all duration-300 backdrop-blur-sm">
            
            <CardHeader className="relative z-10">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl font-bold text-white flex items-center gap-3">
                    <AlertTriangle className="h-6 w-6 text-cyan-400" />
                    {steps[currentStep - 1].title}
                  </CardTitle>
                  <CardDescription className="text-slate-400 mt-2">
                    {steps[currentStep - 1].description}
          </CardDescription>
                </div>
                <Badge className="bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 px-3 py-1 text-sm font-medium">
                  Step {currentStep} of 4
                </Badge>
              </div>
        </CardHeader>
        
            <CardContent className="relative z-10">
              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Step 1: URL Input */}
                {currentStep === 1 && (
                  <div className="space-y-6">
                    <div className="space-y-3">
                      <Label htmlFor="url" className="text-base font-medium text-slate-200 flex items-center gap-2">
                        <Globe className="w-4 h-4 text-cyan-400" />
                        Suspicious Website URL *
                      </Label>
                      <div className="relative">
              <Input
                id="url"
                type="url"
                placeholder="https://suspicious-site.com"
                value={formData.url}
                          onChange={(e) => {
                            setFormData({ ...formData, url: e.target.value });
                            validateField('url', e.target.value);
                          }}
                          className={`h-11 bg-slate-700/50 border ${
                            validationErrors.url ? 'border-red-500' : 'border-slate-600 hover:border-cyan-500/50'
                          } focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/20 transition-all duration-200`}
                required
              />
                        {formData.url && !validationErrors.url && (
                          <CheckCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-green-400" />
                        )}
                        {validationErrors.url && (
                          <XCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-red-400" />
                        )}
                      </div>
                      {validationErrors.url && (
                        <p className="text-red-400 text-sm flex items-center gap-2">
                          <AlertCircle className="w-3 h-3" />
                          {validationErrors.url}
                        </p>
                      )}
                    </div>

                    <div className="mt-6">
                <UrlChecker 
                  className="w-full"
                  size="sm"
                />
              </div>
            </div>
                )}

                {/* Step 2: Scam Details */}
                {currentStep === 2 && (
                  <div className="space-y-6">
                    <div className="space-y-3">
                      <Label htmlFor="title" className="text-base font-medium text-slate-200 flex items-center gap-2">
                        <FileText className="w-4 h-4 text-cyan-400" />
                        Scam Title *
                      </Label>
                      <div className="relative">
              <Input
                id="title"
                placeholder="Brief description of the scam"
                value={formData.title}
                          onChange={(e) => {
                            setFormData({ ...formData, title: e.target.value });
                            validateField('title', e.target.value);
                          }}
                          className={`h-11 bg-slate-700/50 border ${
                            validationErrors.title ? 'border-red-500' : 'border-slate-600 hover:border-cyan-500/50'
                          } focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/20 transition-all duration-200`}
                required
              />
                        {formData.title && !validationErrors.title && (
                          <CheckCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-green-400" />
                        )}
                        {validationErrors.title && (
                          <XCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-red-400" />
                        )}
                      </div>
                      {validationErrors.title && (
                        <p className="text-red-400 text-sm flex items-center gap-2">
                          <AlertCircle className="w-4 h-4" />
                          {validationErrors.title}
                        </p>
                      )}
            </div>

                    <div className="space-y-3">
                      <Label className="text-base font-medium text-slate-200 flex items-center gap-2">
                        <Target className="w-4 h-4 text-cyan-400" />
                        Scam Category *
                      </Label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {categories.map((category) => (
                          <div
                            key={category.value}
                            className={`relative p-3 rounded-lg border cursor-pointer transition-all duration-200 ${
                              formData.category === category.value
                                ? 'border-cyan-500 bg-cyan-500/10 shadow-md shadow-cyan-500/10'
                                : 'border-slate-600 bg-slate-700/50 hover:border-cyan-500/50 hover:bg-slate-700/70'
                            }`}
                            onClick={() => {
                              setFormData({ ...formData, category: category.value });
                              validateField('category', category.value);
                            }}
                          >
                            <div className="flex items-center space-x-3">
                              <category.icon className={`w-5 h-5 ${category.color}`} />
                              <div>
                                <h3 className="font-medium text-slate-200">{category.label}</h3>
                                <p className="text-xs text-slate-400">{category.description}</p>
                              </div>
                            </div>
                            {formData.category === category.value && (
                              <CheckCircle className="absolute top-3 right-3 w-5 h-5 text-green-400" />
                            )}
                          </div>
                        ))}
                      </div>
                      {validationErrors.category && (
                        <p className="text-red-400 text-sm flex items-center gap-2">
                          <AlertCircle className="w-4 h-4" />
                          {validationErrors.category}
                        </p>
                      )}
            </div>

                    <div className="space-y-3">
                      <Label htmlFor="description" className="text-base font-medium text-slate-200 flex items-center gap-2">
                        <FileText className="w-4 h-4 text-cyan-400" />
                        Detailed Description *
                      </Label>
                      <div className="relative">
              <Textarea
                id="description"
                placeholder="Describe what makes this suspicious, how you encountered it, what they're asking for, etc."
                value={formData.description}
                          onChange={(e) => {
                            setFormData({ ...formData, description: e.target.value });
                            validateField('description', e.target.value);
                          }}
                          rows={6}
                          className={`bg-slate-700/50 border ${
                            validationErrors.description ? 'border-red-500' : 'border-slate-600 hover:border-cyan-500/50'
                          } focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/20 transition-all duration-200 resize-none`}
                required
              />
                        <div className="absolute bottom-3 right-3 text-xs text-slate-500">
                          {formData.description.length}/500
                        </div>
                      </div>
                      {validationErrors.description && (
                        <p className="text-red-400 text-sm flex items-center gap-2">
                          <AlertCircle className="w-4 h-4" />
                          {validationErrors.description}
                        </p>
                      )}
                    </div>
            </div>
                )}

                {/* Step 3: Personal Information */}
                {currentStep === 3 && (
                  <div className="space-y-6">
                    <div className="flex items-center space-x-3 p-4 bg-slate-800/50 rounded-xl border border-slate-600">
              <Checkbox
                id="anonymous"
                checked={formData.isAnonymous}
                onCheckedChange={(checked) => 
                  setFormData({ ...formData, isAnonymous: checked as boolean })
                }
                        className="w-5 h-5"
              />
                      <Label htmlFor="anonymous" className="text-base font-medium text-slate-200 flex items-center gap-2">
                        <Lock className="w-4 h-4 text-cyan-400" />
                        Report anonymously
                      </Label>
            </div>

            {!formData.isAnonymous && (
                      <div className="space-y-3">
                        <Label htmlFor="reporterName" className="text-base font-medium text-slate-200 flex items-center gap-2">
                          <User className="w-4 h-4 text-cyan-400" />
                          Your Name
                        </Label>
                <Input
                  id="reporterName"
                  placeholder="Optional - helps with credibility"
                  value={formData.reporterName}
                  onChange={(e) => setFormData({ ...formData, reporterName: e.target.value })}
                          className="h-11 bg-slate-700/50 border border-slate-600 hover:border-cyan-500/50 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/20 transition-all duration-200"
                />
              </div>
            )}

                    <div className="space-y-3">
                      <Label htmlFor="location" className="text-base font-medium text-slate-200 flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-cyan-400" />
                        Location (Optional)
                      </Label>
              <Input
                id="location"
                placeholder="City, Country (optional)"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                        className="h-11 bg-slate-700/50 border border-slate-600 hover:border-cyan-500/50 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/20 transition-all duration-200"
              />
            </div>
                  </div>
                )}

                {/* Step 4: Review & Submit */}
                {currentStep === 4 && (
                  <div className="space-y-6">
                    <div className="text-center mb-6">
                      <h3 className="text-xl font-semibold text-white mb-2">Review Your Report</h3>
                      <p className="text-slate-400">Please review your information before submitting</p>
                    </div>

                    <div className="space-y-4">
                      <div className="p-3 bg-slate-700/50 rounded-lg border border-slate-600">
                        <h4 className="font-medium text-slate-200 mb-1 flex items-center gap-2">
                          <Globe className="w-4 h-4 text-cyan-400" />
                          URL
                        </h4>
                        <p className="text-slate-300 break-all text-sm">{formData.url}</p>
                      </div>

                      <div className="p-3 bg-slate-700/50 rounded-lg border border-slate-600">
                        <h4 className="font-medium text-slate-200 mb-1 flex items-center gap-2">
                          <FileText className="w-4 h-4 text-cyan-400" />
                          Title
                        </h4>
                        <p className="text-slate-300 text-sm">{formData.title}</p>
                      </div>

                      <div className="p-3 bg-slate-700/50 rounded-lg border border-slate-600">
                        <h4 className="font-medium text-slate-200 mb-1 flex items-center gap-2">
                          <Target className="w-4 h-4 text-cyan-400" />
                          Category
                        </h4>
                        <p className="text-slate-300 text-sm capitalize">{formData.category.replace('-', ' ')}</p>
                      </div>

                      <div className="p-3 bg-slate-700/50 rounded-lg border border-slate-600">
                        <h4 className="font-medium text-slate-200 mb-1 flex items-center gap-2">
                          <FileText className="w-4 h-4 text-cyan-400" />
                          Description
                        </h4>
                        <p className="text-slate-300 text-sm">{formData.description}</p>
                      </div>

                      {!formData.isAnonymous && formData.reporterName && (
                        <div className="p-3 bg-slate-700/50 rounded-lg border border-slate-600">
                          <h4 className="font-medium text-slate-200 mb-1 flex items-center gap-2">
                            <User className="w-4 h-4 text-cyan-400" />
                            Reporter
                          </h4>
                          <p className="text-slate-300 text-sm">{formData.reporterName}</p>
                        </div>
                      )}

                      {formData.location && (
                        <div className="p-3 bg-slate-700/50 rounded-lg border border-slate-600">
                          <h4 className="font-medium text-slate-200 mb-1 flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-cyan-400" />
                            Location
                          </h4>
                          <p className="text-slate-300 text-sm">{formData.location}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Debug Information (Development Only) */}
                {process.env.NODE_ENV === 'development' && (
                  <div className="mt-6 p-4 bg-slate-800/30 rounded-lg border border-slate-600">
                    <h4 className="text-sm font-semibold text-slate-300 mb-2">Debug Info:</h4>
                    <div className="text-xs text-slate-400 space-y-1">
                      <div>User: {user ? 'Logged in' : 'Anonymous'}</div>
                      <div>Form Data: {JSON.stringify(formData, null, 2)}</div>
                      <div>Validation Errors: {JSON.stringify(validationErrors, null, 2)}</div>
                      <div>Form Progress: {Math.round(formProgress)}%</div>
                    </div>
                  </div>
                )}

                {/* Navigation Buttons */}
                <div className="flex items-center justify-between pt-8 border-t border-slate-700">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={prevStep}
                    disabled={currentStep === 1}
                    className="flex items-center gap-2 bg-slate-700/50 border-slate-600 text-slate-300 hover:bg-slate-600/50 hover:border-slate-500 transition-all duration-200"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Previous
                  </Button>

                  {currentStep < 4 ? (
                    <Button
                      type="button"
                      onClick={nextStep}
                      className="flex items-center gap-2 bg-cyan-500 hover:bg-cyan-600 text-white shadow-md shadow-cyan-500/20 transition-all duration-200"
                    >
                      Next
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  ) : (
            <Button
              type="submit"
              disabled={isSubmitting}
                      className="flex items-center gap-2 bg-cyan-500 hover:bg-cyan-600 text-white shadow-md shadow-cyan-500/20 transition-all duration-200"
            >
              {isSubmitting ? (
                <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                  Submitting Report...
                </>
              ) : (
                <>
                          <Send className="w-4 h-4" />
                  Submit Report
                </>
              )}
            </Button>
                  )}
                </div>
          </form>
        </CardContent>
      </Card>
        </div>
      </div>
    </div>
  );
};

export default ReportScamPage;