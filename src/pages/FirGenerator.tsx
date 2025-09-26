import { useState } from "react";
import { FileText } from "lucide-react";
import FIRForm from "@/components/FIRForm";
import FIRResult from "@/components/FIRResult";
import FIRPreview from "@/components/FIRPreview";
import FIRProcessGuide from "@/components/FIRProcessGuide";

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

const FirGenerator = () => {
  const [currentStep, setCurrentStep] = useState<'form' | 'result'>('form');
  const [formData, setFormData] = useState<FormData>({
    name: "",
    address: "",
    contact: "",
    incident: "",
    date: "",
    location: "",
    language: "en",
    state: "",
  });
  const [rephrasedText, setRephrasedText] = useState("");

  const handleFormDataChange = (data: FormData) => {
    setFormData(data);
  };

  const handleRephrasedTextChange = (text: string) => {
    setRephrasedText(text);
  };

  const handleGenerate = (data: FormData) => {
    setFormData(data);
    setCurrentStep('result');
  };

  const handleBack = () => {
    setCurrentStep('form');
  };

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <div className="p-4 rounded-full bg-primary/10 glow-primary">
              <FileText className="h-12 w-12 text-primary" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="gradient-primary bg-clip-text text-transparent">FIR Generator</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Generate a comprehensive First Information Report for cybersecurity incidents
          </p>
        </div>

        {/* Render appropriate component based on current step */}
        {currentStep === 'form' ? (
          <>
            <div className="grid lg:grid-cols-2 gap-8 mb-12">
              <div>
                <FIRForm 
                  formData={formData}
                  onFormDataChange={handleFormDataChange}
                  onGenerate={handleGenerate}
                  onRephrasedTextChange={handleRephrasedTextChange}
                  showProcessGuide={false}
                />
              </div>
              <div>
                <FIRPreview formData={formData} rephrasedText={rephrasedText} />
              </div>
            </div>
            
            {/* Full-width Process Guide */}
            {formData.state && (
              <div className="w-full">
                <div className="mb-8 text-center">
                  <h2 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent mb-2">
                    🏛️ Complete FIR Filing Guide for {formData.state}
                  </h2>
                  <p className="text-slate-400 max-w-2xl mx-auto text-lg">
                    Professional step-by-step guidance from legal experts to help you navigate the FIR process with confidence
                  </p>
                </div>
                
                <FIRProcessGuide state={formData.state} />
              </div>
            )}
          </>
        ) : (
          <FIRResult detail={formData} onBack={handleBack} />
        )}
      </div>
    </div>
  );
};

export default FirGenerator;