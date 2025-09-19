import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { AlertTriangle, Send, Loader2 } from 'lucide-react';
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
  const { toast } = useToast();

  React.useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
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

      if (error) throw error;

      if (data.error && data.error.includes('already been reported')) {
        toast({
          title: "Already Reported",
          description: "This URL has already been reported to the community.",
        });
      } else {
        toast({
          title: "Report Submitted",
          description: "Thank you for helping keep our community safe!",
        });
        
        // Reset form
        setFormData({
          url: '',
          title: '',
          description: '',
          category: '',
          reporterName: '',
          location: '',
          isAnonymous: false,
        });
      }
    } catch (error) {
      console.error('Error submitting report:', error);
      toast({
        title: "Error",
        description: "Failed to submit report. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
          <AlertTriangle className="h-8 w-8 text-red-500" />
          Report a Scam
        </h1>
        <p className="text-muted-foreground">
          Help protect others by reporting suspicious websites and scams
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Scam Report Form</CardTitle>
          <CardDescription>
            All fields marked with * are required. Your report helps keep the community safe.
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="url">Suspicious URL *</Label>
              <Input
                id="url"
                type="url"
                placeholder="https://suspicious-site.com"
                value={formData.url}
                onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                required
              />
              <div className="mt-2">
                <UrlChecker 
                  className="w-full"
                  size="sm"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                placeholder="Brief description of the scam"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Select 
                value={formData.category} 
                onValueChange={(value) => setFormData({ ...formData, category: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select scam type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="phishing">Phishing</SelectItem>
                  <SelectItem value="fake-shopping">Fake Shopping Site</SelectItem>
                  <SelectItem value="investment">Investment Scam</SelectItem>
                  <SelectItem value="romance">Romance Scam</SelectItem>
                  <SelectItem value="tech-support">Tech Support Scam</SelectItem>
                  <SelectItem value="identity-theft">Identity Theft</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                placeholder="Describe what makes this suspicious, how you encountered it, what they're asking for, etc."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
                required
              />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="anonymous"
                checked={formData.isAnonymous}
                onCheckedChange={(checked) => 
                  setFormData({ ...formData, isAnonymous: checked as boolean })
                }
              />
              <Label htmlFor="anonymous">Report anonymously</Label>
            </div>

            {!formData.isAnonymous && (
              <div className="space-y-2">
                <Label htmlFor="reporterName">Your Name</Label>
                <Input
                  id="reporterName"
                  placeholder="Optional - helps with credibility"
                  value={formData.reporterName}
                  onChange={(e) => setFormData({ ...formData, reporterName: e.target.value })}
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                placeholder="City, Country (optional)"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              />
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting Report...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Submit Report
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReportScamPage;