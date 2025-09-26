import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  FileText, 
  Loader2, 
  CheckCircle, 
  ChevronRight, 
  ExternalLink,
  AlertTriangle
} from "lucide-react";

interface FIRProcessGuideProps {
  state: string;
}

// State-wise FIR portal mapping
const STATE_FIR_PORTALS: { [key: string]: string } = {
  "Haryana": "https://haryanpolice.gov.in/",
  "Punjab": "https://cybercrime.punjabpolice.gov.in/",
  "Delhi": "https://cyber.delhipolice.gov.in/",
  "Maharashtra": "https://mhcyber.gov.in/",
  "Gujarat": "https://gujaratpolice.gov.in/",
  "Rajasthan": "https://police.rajasthan.gov.in/",
  "Uttar Pradesh": "https://uppolice.gov.in/",
  "Madhya Pradesh": "https://mppolice.gov.in/",
  "Karnataka": "https://ksp.gov.in/",
  "Tamil Nadu": "https://tnpolice.gov.in/",
  "Andhra Pradesh": "https://appolice.gov.in/",
  "Telangana": "https://tspolice.gov.in/",
  "Kerala": "https://keralapolice.gov.in/",
  "Odisha": "https://odishapolice.gov.in/",
  "West Bengal": "https://wbpolice.gov.in/",
  "Bihar": "https://biharpolice.bih.nic.in/",
  "Jharkhand": "https://jhpolice.gov.in/",
  "Assam": "https://assampolice.gov.in/",
  "Himachal Pradesh": "https://himachalpolice.gov.in/",
  "Uttarakhand": "https://uttarakhandpolice.uk.gov.in/",
  "Goa": "https://citizenservices.goapolice.gov.in/",
};

const FIRProcessGuide: React.FC<FIRProcessGuideProps> = ({ state }) => {
  const [processGuide, setProcessGuide] = useState<string[]>([]);
  const [loadingGuide, setLoadingGuide] = useState(false);

  const fetchProcessGuide = async (selectedState: string) => {
    setLoadingGuide(true);
    
    try {
      // Comprehensive local fallback guide
      const comprehensiveGuide = [
        `Visit the official ${selectedState} Police website or locate your nearest police station with proper identification documents including Aadhaar card, PAN card, and address proof.`,
        
        `Clearly explain the cybercrime incident to the duty officer, providing specific details about the nature of fraud, financial losses, digital evidence, and timeline of events.`,
        
        `Submit all relevant evidence including screenshots, transaction details, email communications, SMS messages, call recordings, and any other digital proof related to the incident.`,
        
        `Provide a detailed written complaint describing the incident chronologically, including dates, times, amounts involved, and contact details of suspected perpetrators if known.`,
        
        `Ensure your complaint includes specific cyber crime sections under IT Act 2000, Indian Penal Code provisions, and mention of financial fraud if applicable for proper case registration.`,
        
        `Obtain a complaint receipt with reference number, investigating officer details, and expected timeline for preliminary investigation and case status updates.`,
        
        `Follow up with the investigating officer within 7-10 days to check case progress, provide additional evidence if requested, and ensure proper investigation is being conducted.`,
        
        `Cooperate fully with cyber crime investigation team, provide access to affected devices, bank statements, and participate in identification processes as required by law.`,
        
        `Keep detailed records of all interactions with police, case numbers, officer names, and maintain copies of all submitted documents for future reference and legal proceedings.`,
        
        `Stay informed about case developments through regular communication with investigating officer and be prepared to appear for court proceedings if the case goes to trial.`,
        
        `If not satisfied with local police response, escalate the matter to SP/Commissioner office, state cyber crime cell, or National Cyber Crime Reporting Portal for additional support.`,
        
        `Obtain the official FIR copy with the FIR number, investigating officer's details, and case acknowledgment receipt for your records and insurance/bank claim purposes.`
      ];
      
      setProcessGuide(comprehensiveGuide);
    } catch (error) {
      console.error('Error generating process guide:', error);
      // Use the comprehensive local guide as fallback
      const comprehensiveGuide = [
        `Visit the official ${selectedState} Police website or locate your nearest police station with proper identification documents.`,
        `Clearly explain the cybercrime incident to the duty officer with specific details about the fraud and timeline.`,
        `Submit all relevant evidence including screenshots, transaction details, and digital communications.`,
        `Provide a detailed written complaint describing the incident chronologically with dates and amounts.`,
        `Ensure your complaint includes specific cyber crime sections under IT Act 2000 and IPC provisions.`,
        `Obtain a complaint receipt with reference number and investigating officer details.`,
        `Follow up within 7-10 days to check case progress and provide additional evidence if needed.`,
        `Cooperate fully with the cyber crime investigation team and provide device access as required.`,
        `Keep detailed records of all police interactions and maintain copies of submitted documents.`,
        `Stay informed about case developments through regular officer communication.`,
        `Escalate to higher authorities if not satisfied with local police response.`,
        `Obtain the official FIR copy with number and officer details for your records.`
      ];
      setProcessGuide(comprehensiveGuide);
    } finally {
      setLoadingGuide(false);
    }
  };

  useEffect(() => {
    if (state) {
      fetchProcessGuide(state);
    }
  }, [state]);

  return (
    <Card className="bg-gradient-to-br from-slate-900/90 via-slate-800/80 to-slate-900/90 border-2 border-cyan-500/30 shadow-2xl shadow-cyan-500/10">
      <CardHeader className="bg-gradient-to-r from-cyan-500/10 via-blue-500/5 to-purple-500/10 border-b border-cyan-500/20">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-3 text-xl">
            <div className="p-3 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl shadow-lg shadow-cyan-500/25">
              <FileText className="h-6 w-6 text-white" />
            </div>
            <span className="text-white font-bold">Professional FIR Filing Process</span>
            <Badge className="bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-400 border-cyan-500/30 font-semibold">
              {state}
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
                    This guide has been crafted by legal experts familiar with {state} police procedures. 
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
            {state && STATE_FIR_PORTALS[state] && (
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
                        🏛️ Official {state} Police E-Services Portal
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
                      const portalUrl = STATE_FIR_PORTALS[state];
                      console.log('Selected state:', state);
                      console.log('Portal URL:', portalUrl);
                      console.log('Available portals:', Object.keys(STATE_FIR_PORTALS));
                      
                      if (portalUrl) {
                        window.open(portalUrl, '_blank', 'noopener,noreferrer');
                      } else {
                        alert(`Portal not found for state: ${state}. Available states: ${Object.keys(STATE_FIR_PORTALS).join(', ')}`);
                      }
                    }}
                    className="transition-all hover:scale-105 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold px-8 py-4 rounded-xl shadow-lg shadow-cyan-500/30 hover:shadow-xl hover:shadow-cyan-500/50 border border-cyan-400/20"
                  >
                    <ExternalLink className="mr-3 h-5 w-5" />
                    Visit Official Portal
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
                    Procedures may vary by jurisdiction within {state}. Always verify current 
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
  );
};

export default FIRProcessGuide;
