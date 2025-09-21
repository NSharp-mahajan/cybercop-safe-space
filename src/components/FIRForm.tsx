import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface FormData {
  name: string;
  address: string;
  contact: string;
  incident: string;
  date: string;
  location: string;
  language: string;
}

interface FIRFormProps {
  formData: FormData;
  onFormDataChange: (formData: FormData) => void;
  onGenerate: (formData: FormData) => void;
}

function FIRForm({ formData, onFormDataChange, onGenerate }: FIRFormProps) {

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    const updatedFormData = { ...formData, [name]: value };
    onFormDataChange(updatedFormData);
  };

  const handleLanguageChange = (value: string) => {
    const updatedFormData = { ...formData, language: value };
    onFormDataChange(updatedFormData);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onGenerate(formData);
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

            <div className="space-y-2 md:col-span-2">
              <label htmlFor="incident" className="text-sm font-medium">
                Describe the incident *
              </label>
              <Textarea
                name="incident"
                rows={4}
                placeholder="Describe the incident"
                value={formData.incident}
                onChange={handleChange}
                required
                className="transition-glow focus:glow-primary"
              />
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
            >
              ⚡ Generate FIR
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

export default FIRForm;
