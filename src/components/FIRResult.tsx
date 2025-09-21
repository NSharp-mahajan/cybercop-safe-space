import React from "react";
import jsPDF from "jspdf";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Copy, Download, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface FormData {
  name: string;
  address: string;
  contact: string;
  incident: string;
  date: string;
  location: string;
  language: string;
}

interface FIRResultProps {
  detail: FormData;
  onBack: () => void;
}

function FIRResult({ detail, onBack }: FIRResultProps) {
  const { toast } = useToast();

  const generateFIRText = (): string => {
    const { name, address, contact, date, location, incident, language } = detail;
    
    if (language === "hi") {
      return `सेवा में,
थाना प्रभारी,
पुलिस स्टेशन

विषय: घटना के संबंध में एफआईआर दर्ज कराने हेतु

मान्यवर,

मैं, ${name}, ${address} का निवासी, एक घटना की रिपोर्ट करना चाहता/चाहती हूँ जो ${date} को ${location} पर हुई थी।

विवरण:
${incident}

मुझसे ${contact} पर संपर्क किया जा सकता है।

कृपया उपयुक्त कार्रवाई करें।

धन्यवाद।

सादर,
${name}`;
    } else {
      return `To,
The Officer In-Charge,
Police Station

Subject: Filing of FIR regarding incident

Respected Sir/Madam,

I, ${name}, residing at ${address}, would like to report an incident that occurred on ${date} at ${location}.

Details:
${incident}

You can contact me at ${contact}.

Kindly acknowledge and take appropriate action.

Thank you.

Sincerely,
${name}`;
    }
  };

  const text = generateFIRText();

  const handleDownload = () => {
    const pdf = new jsPDF();
    const lines = pdf.splitTextToSize(text, 180);
    pdf.text(lines, 10, 10);
    pdf.save("FIR.pdf");
    
    toast({
      title: "Download Successful",
      description: "FIR has been downloaded as PDF",
    });
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied to Clipboard",
      description: "FIR text has been copied to clipboard",
    });
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl text-center">📄 FIR Preview</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="bg-muted/50 p-6 rounded-lg border">
          <pre className="whitespace-pre-wrap text-sm font-mono leading-relaxed">
            {text}
          </pre>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button 
            onClick={handleCopy}
            variant="outline"
            className="transition-glow hover:glow-primary"
          >
            <Copy className="mr-2 h-4 w-4" />
            📋 Copy
          </Button>
          
          <Button 
            onClick={handleDownload}
            className="glow-primary transition-glow"
          >
            <Download className="mr-2 h-4 w-4" />
            📥 Download PDF
          </Button>
          
          <Button 
            onClick={onBack}
            variant="outline"
            className="transition-glow hover:glow-primary"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            🔁 Back
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default FIRResult;
