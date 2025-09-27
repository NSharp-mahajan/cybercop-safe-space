import React, { useState } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { AlertTriangle, Send, Loader2 } from 'lucide-react';
import { Button, Input, Card, CardContent, CardDescription, CardHeader, CardTitle, useToast } from '@/lib/hooks';
import { supabase } from '@/integrations/supabase/client';
import { Link } from 'react-router-dom';

const QuickScamReport = () => {
  const [url, setUrl] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleQuickSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!url || !description) {
      toast({
        title: "Missing Information",
        description: "Please provide both URL and description.",
        variant: "destructive",
      });
      return;
    }

    try {
      new URL(url);
    } catch {
      toast({
        title: "Invalid URL",
        description: "Please enter a valid URL.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { data: user } = await supabase.auth.getUser();
      
      const { data, error } = await supabase.functions.invoke('scam-report', {
        body: {
          url: url,
          title: `Quick Report: ${url}`,
          description: description,
          category: 'other',
          reporter_user_id: user.user?.id,
        },
      });

      if (error) throw error;

      if (data.error && data.error.includes('already been reported')) {
        toast({
          title: "Already Reported",
          description: "This URL has already been reported.",
        });
      } else {
        toast({
          title: "Report Submitted",
          description: "Thank you for helping keep our community safe!",
        });
        setUrl('');
        setDescription('');
      }
    } catch (error) {
      console.error('Error submitting quick report:', error);
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
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-red-500" />
          Quick Scam Report
        </CardTitle>
        <CardDescription>
          Spotted something suspicious? Report it quickly to help protect others.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleQuickSubmit} className="space-y-4">
          <Input
            placeholder="Enter suspicious URL"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            required
          />
          <Textarea
            placeholder="Briefly describe what makes this suspicious..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            required
          />
          <div className="flex gap-2">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Quick Report
                </>
              )}
            </Button>
            <Button variant="outline" asChild>
              <Link to="/report-scam">Full Report</Link>
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default QuickScamReport;