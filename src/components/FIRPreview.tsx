import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Eye } from "lucide-react";

interface FormData {
  name: string;
  address: string;
  contact: string;
  incident: string;
  date: string;
  location: string;
  language: string;
}

interface FIRPreviewProps {
  formData: FormData;
}

function FIRPreview({ formData }: FIRPreviewProps) {
  const generateFIRText = (): string => {
    const { name, address, contact, date, location, incident, language } = formData;
    
    // Show placeholder text if required fields are empty
    if (!name || !address || !contact || !date || !location || !incident) {
      return "Fill in the form details to see your FIR preview...";
    }
    
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
  const isComplete = formData.name && formData.address && formData.contact && 
                    formData.date && formData.location && formData.incident;

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Eye className="h-5 w-5 text-primary" />
          Live FIR Preview
          {isComplete ? (
            <Badge variant="default" className="ml-auto">Complete</Badge>
          ) : (
            <Badge variant="secondary" className="ml-auto">In Progress</Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="bg-muted/50 p-4 rounded-lg border h-[500px] overflow-y-auto">
          <pre className="whitespace-pre-wrap text-sm font-mono leading-relaxed text-muted-foreground">
            {text}
          </pre>
        </div>
        {!isComplete && (
          <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <p className="text-sm text-blue-700 dark:text-blue-300">
              💡 <strong>Tip:</strong> Fill in all the required fields to see your complete FIR preview
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default FIRPreview;
