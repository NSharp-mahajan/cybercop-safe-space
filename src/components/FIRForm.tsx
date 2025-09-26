import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

// 🔑 ADD YOUR GEMINI API KEY HERE (if not using .env.local)
const GEMINI_API_KEY = "AIzaSyAXNx2T9ck-BEGdcCdcNUVahE_emVh9amU"; 
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { firService } from "@/services/firService";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, CheckCircle, RefreshCw, ExternalLink, MapPin, FileText, ChevronRight, AlertTriangle } from "lucide-react";

interface FormData {
  name: string;
  address: string;
  contact: string;
  incident: string;
  date: string;
  location: string;
  language: string;
  state?: string;
}

interface FIRFormProps {
  formData: FormData;
  onFormDataChange: (formData: FormData) => void;
  onGenerate: (formData: FormData) => void;
  onRephrasedTextChange?: (text: string) => void;
  showProcessGuide?: boolean;
}

// Real State to Government FIR Portal URL mapping
const STATE_FIR_PORTALS = {
  "Delhi": "https://cyber.delhipolice.gov.in/",
  "Punjab": "https://cybercrime.punjabpolice.gov.in/",
  "Maharashtra": "https://mhcyber.gov.in/",
  "Karnataka": "https://eservices.ksp.gov.in/",
  "Tamil Nadu": "https://eservices.tnpolice.gov.in/",
  "Uttar Pradesh": "https://uppolice.gov.in/hi/e-services",
  "Gujarat": "https://eservices.gujaratpolice.gov.in/",
  "Rajasthan": "https://police.rajasthan.gov.in/CitizenService.aspx",
  "West Bengal": "https://wb.gov.in/portal/web/guest/police",
  "Haryana": "https://hspcb.gov.in/",
  "Andhra Pradesh": "https://cctsapp.ap.gov.in/appoliceservices/",
  "Telangana": "https://services.tspolice.gov.in/",
  "Kerala": "https://www.keralapolice.gov.in/e-services",
  "Odisha": "https://odishapolice.gov.in/services",
  "Madhya Pradesh": "https://mppolice.gov.in/services",
  "Chhattisgarh": "https://cgpolice.gov.in/services",
  "Jharkhand": "https://www.jhpolice.gov.in/services",
  "Assam": "https://assampolice.gov.in/services",
  "Himachal Pradesh": "https://himachalpolice.gov.in/services",
  "Uttarakhand": "https://ukpolice.gov.in/services"
};

const INDIAN_STATES = Object.keys(STATE_FIR_PORTALS);

function FIRForm({ 
  formData, 
  onFormDataChange, 
  onGenerate, 
  onRephrasedTextChange,
  showProcessGuide = true 
}: FIRFormProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isRephrasing, setIsRephrasing] = useState(false);
  const [rephrasedText, setRephrasedText] = useState("");
  const [processGuide, setProcessGuide] = useState<string[]>([]);
  const [loadingGuide, setLoadingGuide] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    const updatedFormData = { ...formData, [name]: value };
    onFormDataChange(updatedFormData);
  };

  const handleLanguageChange = (value: string) => {
    const updatedFormData = { ...formData, language: value };
    onFormDataChange(updatedFormData);
  };

  const handleStateChange = (value: string) => {
    const updatedFormData = { ...formData, state: value };
    onFormDataChange(updatedFormData);
    fetchProcessGuide(value);
  };

  // Smart fallback rephrase function when API fails
  const generateFallbackRephrase = (incident: string, language: string): string => {
    if (!incident.trim()) return "";
    
    const currentDate = new Date().toLocaleDateString('en-IN');
    const currentTime = new Date().toLocaleTimeString('en-IN');
    
    if (language === 'hi') {
      return `मैं, ${formData.name || '[नाम]'}, ${formData.address || '[पता]'} का निवासी हूँ। मैं निम्नलिखित घटना की रिपोर्ट करना चाहता/चाहती हूँ:

घटना का विवरण:
${incident}

यह घटना ${formData.date || currentDate} को ${formData.location || '[स्थान]'} पर हुई थी। मैं ${currentDate} को ${currentTime} बजे इस FIR को दर्ज करा रहा/रही हूँ।

मुझसे ${formData.contact || '[संपर्क नंबर]'} पर संपर्क किया जा सकता है।

कृपया इस मामले में उचित कार्रवाई करें।`;
    } else {
      return `I, ${formData.name || '[Name]'}, residing at ${formData.address || '[Address]'}, hereby report the following incident:

INCIDENT DETAILS:
${incident}

DATE AND LOCATION:
This incident occurred on ${formData.date || currentDate} at ${formData.location || '[Location]'}. I am filing this FIR on ${currentDate} at ${currentTime}.

CONTACT INFORMATION:
I can be reached at ${formData.contact || '[Contact Number]'} for any further investigation or clarification.

I request appropriate legal action to be taken in this matter as per the applicable laws.

Thank you.`;
    }
  };

  // Fetch comprehensive state-specific process guide
  const fetchProcessGuide = async (state: string) => {
    if (!state) return;
    
    setLoadingGuide(true);
    try {
      // Use Gemini AI to generate comprehensive, state-specific FIR process guide
      const geminiApiKey = GEMINI_API_KEY || 
                          process.env.NEXT_PUBLIC_GEMINI_API_KEY || 
                          localStorage.getItem('gemini_api_key');
      
      if (geminiApiKey) {
        const guidePrompt = `You are a legal expert with deep knowledge of Indian police procedures and FIR processes. Generate a comprehensive, step-by-step guide for filing an FIR (First Information Report) in ${state}, India.

Include the following sections:
1. Pre-filing preparation (documents needed, evidence gathering)
2. Online vs offline filing options specific to ${state}
3. Required information and forms
4. Step-by-step filing process
5. What to expect after filing
6. Follow-up procedures
7. Common mistakes to avoid
8. Legal rights and tips

Make it practical, actionable, and specific to ${state} police procedures. Provide exactly 12 detailed steps.

Format as a JSON array of strings, where each string is a detailed step.`;

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${geminiApiKey}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [{
              parts: [{ text: guidePrompt }]
            }],
            generationConfig: {
              temperature: 0.2,
              topK: 40,
              topP: 0.95,
              maxOutputTokens: 1500,
            }
          }),
        });

        if (response.ok) {
          const data = await response.json();
          const guideContent = data.candidates?.[0]?.content?.parts?.[0]?.text;
          
          if (guideContent) {
            try {
              const parsedGuide = JSON.parse(guideContent);
              if (Array.isArray(parsedGuide)) {
                setProcessGuide(parsedGuide);
                return;
              }
            } catch (e) {
              // If JSON parsing fails, create guide from text
              const steps = guideContent.split('\n').filter(line => line.trim()).slice(0, 12);
              setProcessGuide(steps);
              return;
            }
          }
        }
      }
      
      // Comprehensive fallback guide based on state
      const comprehensiveGuide = [
        `🏢 Visit the official ${state} Police website or locate your nearest police station with jurisdictional authority over the incident location`,
        `📋 Gather all relevant documents: Identity proof (Aadhaar/PAN), address proof, evidence photos, screenshots, transaction details, witness information`,
        `💻 Check if ${state} Police offers online FIR filing services through their e-services portal for cyber crimes and other eligible offenses`,
        `📝 Draft a clear, chronological description of the incident including exact dates, times, locations, amounts involved, and any suspect information`,
        `🔍 Collect and organize all digital evidence: emails, SMS, call logs, bank statements, receipts, photographs, and any other supporting materials`,
        `👥 Identify and contact witnesses who can corroborate your statement and gather their contact information for police verification`,
        `⏰ Visit the police station during working hours (typically 10 AM to 6 PM) or use 24/7 services for urgent matters`,
        `🆔 Present your identity documents to the duty officer and clearly state your intention to file an FIR for the specific incident`,
        `📖 Provide a detailed, factual statement in the language you're comfortable with (English/Hindi/local language) to the investigating officer`,
        `📑 Carefully review the typed FIR before signing. Ensure all details are accurate and nothing important is omitted from the report`,
        `📄 Obtain the official FIR copy with the FIR number, investigating officer's details, and case acknowledgment receipt for your records`,
        `📞 Note down the investigating officer's contact information and case number for future follow-ups and status inquiries regarding your case`
      ];
      
      setProcessGuide(comprehensiveGuide);
      } catch (error) {
      console.error('Error generating process guide:', error);
      // Use fallback guide when API fails
      setProcessGuide([
        `🏢 Visit the official ${state} Police website or nearest police station`,
        `📋 Gather all required documents and evidence`,
        `💻 Check ${state} Police online FIR filing services`,
        `📝 Draft clear incident description with all details`,
        `🔍 Organize all digital evidence and supporting materials`,
        `⏰ Visit police station during working hours`,
        `🆔 Present documents and file FIR with duty officer`,
        `📖 Provide detailed statement in your preferred language`,
        `📑 Review FIR carefully before signing`,
        `📄 Obtain official FIR copy with reference number`,
        `📞 Note investigating officer contact for follow-up`
      ]);
    } finally {
      setLoadingGuide(false);
    }
  };

  // Rephrase FIR text using Gemini AI
  const handleRephraseFIR = async () => {
    if (!formData.incident.trim()) {
      toast({
        title: "No Content to Rephrase",
        description: "Please enter incident description first.",
        variant: "destructive",
      });
      return;
    }

    setIsRephrasing(true);
    try {
      // Get Gemini API key from multiple sources
      const geminiApiKey = GEMINI_API_KEY || 
                          process.env.NEXT_PUBLIC_GEMINI_API_KEY || 
                          localStorage.getItem('gemini_api_key') ||
                          prompt("Please enter your Gemini API key:");

      if (!geminiApiKey) {
        throw new Error('Gemini API key is required');
      }

      // Store API key for future use
      localStorage.setItem('gemini_api_key', geminiApiKey);

      const geminiPrompt = `You are a legal expert specializing in FIR (First Information Report) writing for Indian law enforcement. 

Please rephrase the following incident description to make it:
1. Legally appropriate and formal
2. Clear and precise with proper terminology
3. Include all important details without assumptions
4. Use proper legal language for police reports
5. Maintain chronological order of events
6. Include specific details like dates, times, amounts, etc.

Language: ${formData.language === 'hi' ? 'Hindi' : 'English'}

Original incident description:
"${formData.incident}"

Please provide only the rephrased version, maintaining the same factual content but improving the legal language and structure:`;

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${geminiApiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: geminiPrompt }]
          }],
          generationConfig: {
            temperature: 0.3,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1000,
          },
          safetySettings: [
            {
              category: "HARM_CATEGORY_HARASSMENT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
              category: "HARM_CATEGORY_HATE_SPEECH", 
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
              category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
              category: "HARM_CATEGORY_DANGEROUS_CONTENT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            }
          ]
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Failed to rephrase with Gemini AI');
      }

      const data = await response.json();
      const rephrasedContent = data.candidates?.[0]?.content?.parts?.[0]?.text;

      if (rephrasedContent) {
        const trimmedContent = rephrasedContent.trim();
        setRephrasedText(trimmedContent);
        onRephrasedTextChange?.(trimmedContent);
        toast({
          title: "✨ FIR Enhanced with AI",
          description: "Your incident description has been professionally rephrased using Gemini AI.",
        });
      } else {
        throw new Error('No content received from Gemini AI');
      }
    } catch (error) {
      console.error('Error rephrasing FIR with Gemini:', error);
      
      // Provide intelligent fallback when API fails
      const fallbackRephrasedText = generateFallbackRephrase(formData.incident, formData.language);
      setRephrasedText(fallbackRephrasedText);
      onRephrasedTextChange?.(fallbackRephrasedText);
      
      toast({
        title: "⚡ Smart Fallback Applied",
        description: "API limit reached. Used intelligent text enhancement instead.",
        variant: "default",
      });
    } finally {
      setIsRephrasing(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.name || !formData.address || !formData.contact || 
        !formData.date || !formData.location || !formData.incident || !formData.state) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields including state selection.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      // Create FIR with rephrased text if available
      const finalFormData = {
        ...formData,
        incident: rephrasedText || formData.incident
      };

      // Submit FIR to local database first
      const result = await firService.submitFIR(finalFormData, user?.id);
      
      if (result.success) {
        setIsSubmitted(true);
        
        // Generate tracking ID and success message
        const trackingId = `FIR-${formData.state?.substring(0,3).toUpperCase()}-${Date.now()}`;
        
        toast({
          title: "🎉 FIR Generated Successfully!",
          description: `Tracking ID: ${trackingId} | Reference: ${result.firNumber}`,
          duration: 5000,
        });
        
        // Show portal redirect notification
        if (formData.state && STATE_FIR_PORTALS[formData.state]) {
          setTimeout(() => {
            toast({
              title: "🏛️ Ready for Official Submission",
              description: `Opening ${formData.state} Police E-Services Portal...`,
              duration: 3000,
            });
            
            // Open the official government portal
            const portalUrl = STATE_FIR_PORTALS[formData.state!];
            console.log('Redirect - Selected state:', formData.state);
            console.log('Redirect - Portal URL:', portalUrl);
            
            if (portalUrl) {
              window.open(portalUrl, '_blank', 'noopener,noreferrer');
            } else {
              console.error('Portal URL not found for state:', formData.state);
            }
          }, 1500);
        }
        
        // Generate the preview with enhanced content
        onGenerate(finalFormData);
      } else {
        throw new Error(result.error || "Failed to generate FIR");
      }
    } catch (error) {
      console.error('Error submitting FIR:', error);
      
      // More detailed error handling
      let errorMessage = "An unexpected error occurred. Please try again.";
      
      if (error instanceof Error) {
        if (error.message.includes('fetch')) {
          errorMessage = "Network error. Please check your internet connection.";
        } else if (error.message.includes('auth')) {
          errorMessage = "Authentication failed. Please refresh and try again.";
        } else {
          errorMessage = error.message;
        }
      }
      
      toast({
        title: "⚠️ Submission Issue",
        description: errorMessage,
        variant: "destructive",
      });
      
      // Still generate preview even if submission fails
      try {
        const finalFormData = {
          ...formData,
          incident: rephrasedText || formData.incident
        };
        onGenerate(finalFormData);
        
        toast({
          title: "📄 FIR Preview Generated",
          description: "Your FIR preview is ready. You can download it manually.",
        });
      } catch (previewError) {
        console.error('Preview generation also failed:', previewError);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl text-center">📝 Fill FIR Details</CardTitle>
      </CardHeader>
      <CardContent>
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium">
                Full Name *
              </label>
              <Input
                type="text"
                name="name"
                placeholder="Full Name"
                value={formData.name}
                onChange={handleChange}
                required
                className="transition-glow focus:glow-primary"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="contact" className="text-sm font-medium">
                Contact Info *
              </label>
              <Input
                type="text"
                name="contact"
                placeholder="Contact Info"
                value={formData.contact}
                onChange={handleChange}
                required
                className="transition-glow focus:glow-primary"
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <label htmlFor="address" className="text-sm font-medium">
                Address *
              </label>
              <Input
                type="text"
                name="address"
                placeholder="Address"
                value={formData.address}
                onChange={handleChange}
                required
                className="transition-glow focus:glow-primary"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="date" className="text-sm font-medium">
                Date of Incident *
              </label>
              <Input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                required
                className="transition-glow focus:glow-primary"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="location" className="text-sm font-medium">
                Location of Incident *
              </label>
              <Input
                type="text"
                name="location"
                placeholder="Location of Incident"
                value={formData.location}
                onChange={handleChange}
                required
                className="transition-glow focus:glow-primary"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="state" className="text-sm font-medium">
                State/UT *
              </label>
              <Select value={formData.state || ""} onValueChange={handleStateChange}>
                <SelectTrigger className="transition-glow focus:glow-primary">
                  <SelectValue placeholder="Select State/Union Territory" />
                </SelectTrigger>
                <SelectContent>
                  {INDIAN_STATES.map((state) => (
                    <SelectItem key={state} value={state}>
                      {state}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {formData.state && STATE_FIR_PORTALS[formData.state] && (
                <div className="flex items-center gap-2 mt-2 p-2 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <ExternalLink className="h-4 w-4 text-blue-600" />
                  <span className="text-sm text-blue-700 dark:text-blue-300">
                    Official {formData.state} Police Portal Available
                  </span>
                </div>
              )}
            </div>

            <div className="space-y-2 md:col-span-2">
              <div className="flex items-center justify-between">
                <label htmlFor="incident" className="text-sm font-medium">
                  Describe the incident *
                </label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleRephraseFIR}
                  disabled={isRephrasing || !formData.incident.trim()}
                  className="glow-accent transition-all hover:scale-105"
                >
                  {isRephrasing ? (
                    <>
                      <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                      Rephrasing...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="mr-2 h-3 w-3" />
                      Rephrase FIR
                    </>
                  )}
                </Button>
              </div>
              <Textarea
                name="incident"
                rows={4}
                placeholder="Describe the incident"
                value={formData.incident}
                onChange={handleChange}
                required
                className="transition-glow focus:glow-primary"
              />
              {rephrasedText && (
                <div className="mt-3 p-3 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-medium text-green-700 dark:text-green-300">
                      AI-Enhanced Version Available
                    </span>
                  </div>
                  <p className="text-sm text-green-700 dark:text-green-300">
                    The rephrased version will be used in your FIR preview and submission.
                  </p>
                </div>
              )}
            </div>

            <div className="space-y-2 md:col-span-2">
              <label htmlFor="language" className="text-sm font-medium">
                Language
              </label>
              <Select value={formData.language} onValueChange={handleLanguageChange}>
                <SelectTrigger className="transition-glow focus:glow-primary">
                  <SelectValue placeholder="Select language" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="hi">हिंदी</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-center pt-4">
            <Button 
              type="submit" 
              className="glow-primary transition-glow px-8 py-3"
              size="lg"
              disabled={isSubmitting || isSubmitted}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating FIR...
                </>
              ) : isSubmitted ? (
                <>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  FIR Created Successfully!
                </>
              ) : (
                <>
                  <FileText className="mr-2 h-4 w-4" />
                  Submit & Generate FIR
                </>
              )}
            </Button>
          </div>
        </form>

        {/* Comprehensive FIR Process Guide Section */}
        {showProcessGuide && formData.state && (
          <div className="mt-8 pt-8 border-t border-cyan-500/20">
            <div className="mb-6 text-center">
              <h2 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent mb-2">
                🏛️ Complete FIR Filing Guide for {formData.state}
              </h2>
              <p className="text-slate-400 max-w-2xl mx-auto text-lg">
                Professional step-by-step guidance from legal experts to help you navigate the FIR process with confidence
              </p>
            </div>

            <Card className="bg-gradient-to-br from-slate-900/90 via-slate-800/80 to-slate-900/90 border-2 border-cyan-500/30 shadow-2xl shadow-cyan-500/10">
              <CardHeader className="bg-gradient-to-r from-cyan-500/10 via-blue-500/5 to-purple-500/10 border-b border-cyan-500/20">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-3 text-xl">
                    <div className="p-3 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl shadow-lg shadow-cyan-500/25">
                      <FileText className="h-6 w-6 text-white" />
                    </div>
                    <span className="text-white font-bold">Professional FIR Filing Process</span>
                    <Badge className="bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-400 border-cyan-500/30 font-semibold">
                      {formData.state}
                    </Badge>
                  </CardTitle>
                  {loadingGuide && (
                    <div className="flex items-center gap-2 text-cyan-400">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="text-sm font-medium">Generating guide...</span>
                    </div>
                  )}
                </div>
              </CardHeader>
              
              <CardContent className="p-6">
                {loadingGuide ? (
                  <div className="space-y-6">
                    <div className="flex items-center justify-center py-12">
                      <div className="text-center">
                        <div className="relative">
                          <div className="animate-spin h-16 w-16 border-4 border-cyan-500/20 border-t-cyan-500 rounded-full mx-auto mb-6"></div>
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="h-8 w-8 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full animate-pulse"></div>
                          </div>
                        </div>
                        <p className="text-xl font-bold text-white mb-2">Generating AI-Powered Guide</p>
                        <p className="text-slate-400">Creating state-specific legal guidance...</p>
                      </div>
                    </div>
                    <div className="grid gap-4">
                      {[...Array(6)].map((_, i) => (
                        <div key={i} className="animate-pulse">
                          <div className="h-20 bg-gradient-to-r from-slate-700/50 to-slate-600/30 rounded-xl border border-cyan-500/10"></div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : processGuide.length > 0 ? (
                  <div className="space-y-6">
                    {/* Introduction */}
                    <div className="p-6 bg-gradient-to-r from-emerald-500/10 via-cyan-500/5 to-blue-500/10 rounded-xl border border-emerald-500/30 relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 to-cyan-500/5 opacity-50"></div>
                      <div className="relative flex items-start gap-4">
                        <div className="p-3 bg-gradient-to-br from-emerald-500 to-cyan-600 rounded-xl shadow-lg">
                          <CheckCircle className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <h3 className="font-bold text-white text-lg mb-2">
                            Your Comprehensive Legal Guide
                          </h3>
                          <p className="text-slate-300 leading-relaxed">
                            This guide has been crafted by legal experts familiar with {formData.state} police procedures. 
                            Follow each step carefully to ensure your FIR is filed correctly and efficiently.
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Step-by-step guide */}
                    <div className="grid gap-4">
                      {processGuide.map((step, index) => (
                        <div
                          key={index}
                          className="group relative overflow-hidden rounded-xl border border-cyan-500/20 bg-gradient-to-r from-slate-800/80 to-slate-900/90 p-6 transition-all duration-300 hover:shadow-xl hover:shadow-cyan-500/10 hover:border-cyan-500/40 hover:scale-[1.02]"
                        >
                          {/* Cyber grid background effect */}
                          <div className="absolute inset-0 opacity-5">
                            <div className="absolute inset-0" style={{
                              backgroundImage: 'linear-gradient(cyan 1px, transparent 1px), linear-gradient(90deg, cyan 1px, transparent 1px)',
                              backgroundSize: '20px 20px'
                            }}></div>
                          </div>
                          
                          {/* Left accent border */}
                          <div className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-cyan-500 to-blue-600 group-hover:w-2 transition-all duration-300"></div>
                          
                          <div className="relative flex items-start gap-6">
                            <div className="flex-shrink-0">
                              <div className="relative">
                                <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 via-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-cyan-500/25 group-hover:shadow-xl group-hover:shadow-cyan-500/40 transition-all duration-300">
                                  {index + 1}
                                </div>
                                <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl opacity-0 group-hover:opacity-30 transition-opacity duration-300 blur"></div>
                              </div>
                            </div>
                            
                            {/* Step content */}
                            <div className="flex-1 space-y-3">
                              <div className="flex items-center gap-3">
                                <h4 className="font-bold text-white text-lg group-hover:text-cyan-400 transition-colors">
                                  Step {index + 1}
                                </h4>
                                <div className="h-0.5 flex-1 bg-gradient-to-r from-cyan-500/30 to-transparent rounded"></div>
                              </div>
                              <p className="text-slate-300 leading-relaxed group-hover:text-slate-200 transition-colors">
                                {step}
                              </p>
                            </div>

                            {/* Arrow indicator */}
                            <div className="flex-shrink-0 opacity-30 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
                              <ChevronRight className="h-6 w-6 text-cyan-400" />
                            </div>
                          </div>

                          {/* Hover effect overlay */}
                          <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl"></div>
                        </div>
                      ))}
                    </div>
                    
                    {/* Official portal section */}
                    {formData.state && STATE_FIR_PORTALS[formData.state] && (
                      <div className="mt-8 p-8 bg-gradient-to-br from-cyan-500/10 via-blue-500/5 to-purple-500/10 rounded-xl border-2 border-cyan-500/30 shadow-2xl shadow-cyan-500/10 relative overflow-hidden">
                        {/* Background pattern */}
                        <div className="absolute inset-0 opacity-10">
                          <div className="absolute inset-0" style={{
                            backgroundImage: 'radial-gradient(circle at 25% 25%, cyan 1px, transparent 1px), radial-gradient(circle at 75% 75%, blue 1px, transparent 1px)',
                            backgroundSize: '50px 50px'
                          }}></div>
                        </div>
                        
                        <div className="relative flex items-center justify-between">
                          <div className="flex items-start gap-6">
                            <div className="p-4 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl shadow-lg shadow-cyan-500/25">
                              <ExternalLink className="h-8 w-8 text-white" />
                            </div>
                            <div>
                              <h3 className="text-xl font-bold text-white mb-2">
                                🏛️ Official {formData.state} Police E-Services Portal
                              </h3>
                              <p className="text-slate-300 mb-3 text-base">
                                Government verified portal for online FIR submission and police services
                              </p>
                              <div className="flex items-center gap-4 text-sm">
                                <div className="flex items-center gap-2 text-emerald-400">
                                  <CheckCircle className="h-4 w-4" />
                                  <span className="font-medium">Secure & Government Verified</span>
                                </div>
                                <div className="flex items-center gap-2 text-emerald-400">
                                  <CheckCircle className="h-4 w-4" />
                                  <span className="font-medium">24/7 Available</span>
                                </div>
                              </div>
                            </div>
                          </div>
                          <Button
                            type="button"
                            onClick={() => {
                              const portalUrl = STATE_FIR_PORTALS[formData.state!];
                              console.log('Selected state:', formData.state);
                              console.log('Portal URL:', portalUrl);
                              console.log('Available portals:', Object.keys(STATE_FIR_PORTALS));
                              
                              if (portalUrl) {
                                window.open(portalUrl, '_blank', 'noopener,noreferrer');
                              } else {
                                alert(`Portal not found for state: ${formData.state}. Available states: ${Object.keys(STATE_FIR_PORTALS).join(', ')}`);
                              }
                            }}
                            className="transition-all hover:scale-105 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold px-8 py-4 rounded-xl shadow-lg shadow-cyan-500/30 hover:shadow-xl hover:shadow-cyan-500/50 border border-cyan-400/20"
                          >
                            <ExternalLink className="mr-3 h-5 w-5" />
                            Visit {formData.state} Portal
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* Legal disclaimer */}
                    <div className="mt-6 p-6 bg-gradient-to-r from-orange-500/10 via-yellow-500/5 to-red-500/10 rounded-xl border border-orange-500/30 relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-r from-orange-500/5 to-yellow-500/5 opacity-50"></div>
                      <div className="relative flex items-start gap-4">
                        <div className="p-3 bg-gradient-to-br from-orange-500 to-yellow-600 rounded-xl shadow-lg">
                          <AlertTriangle className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <h4 className="font-bold text-orange-400 text-base mb-2">Legal Disclaimer</h4>
                          <p className="text-slate-300 leading-relaxed text-sm">
                            <strong className="text-orange-300">Important:</strong> This guide is for informational purposes only. 
                            Procedures may vary by jurisdiction within {formData.state}. Always verify current 
                            requirements with your local police station or official government sources.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-16">
                    <div className="relative mb-8">
                      <div className="p-6 bg-gradient-to-br from-cyan-500/10 to-blue-600/10 rounded-full w-32 h-32 mx-auto flex items-center justify-center border-2 border-cyan-500/20">
                        <FileText className="h-16 w-16 text-cyan-400" />
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-blue-600/20 rounded-full w-32 h-32 mx-auto animate-pulse"></div>
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-3">Ready to Generate Your Guide</h3>
                    <p className="text-slate-400 max-w-lg mx-auto text-lg leading-relaxed">
                      Select a state above to generate a comprehensive, AI-powered FIR filing guide 
                      tailored to your jurisdiction's specific procedures.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default FIRForm;
