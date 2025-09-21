import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react';

const DebugPanel = () => {
  const [tests, setTests] = useState<Record<string, 'idle' | 'loading' | 'success' | 'error'>>({
    chat: 'idle',
    urlCheck: 'idle',
    ocrFraud: 'idle',
    scamReport: 'idle'
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});

  const updateTest = (test: string, status: 'loading' | 'success' | 'error', error?: string) => {
    setTests(prev => ({ ...prev, [test]: status }));
    if (error) {
      setErrors(prev => ({ ...prev, [test]: error }));
    }
  };

  const testChatFunction = async () => {
    updateTest('chat', 'loading');
    try {
      const { data, error } = await supabase.functions.invoke('chat', {
        body: {
          message: 'Test message',
          anonymous_session: crypto.randomUUID()
        }
      });
      
      if (error) throw error;
      console.log('Chat test result:', data);
      updateTest('chat', 'success');
    } catch (error: any) {
      console.error('Chat test error:', error);
      updateTest('chat', 'error', error.message || 'Unknown error');
    }
  };

  const testUrlCheckFunction = async () => {
    updateTest('urlCheck', 'loading');
    try {
      const { data, error } = await supabase.functions.invoke('url-check', {
        body: {
          url: 'https://google.com'
        }
      });
      
      if (error) throw error;
      console.log('URL check test result:', data);
      updateTest('urlCheck', 'success');
    } catch (error: any) {
      console.error('URL check test error:', error);
      updateTest('urlCheck', 'error', error.message || 'Unknown error');
    }
  };

  const testScamReportFunction = async () => {
    updateTest('scamReport', 'loading');
    try {
      const { data, error } = await supabase.functions.invoke('scam-report', {
        body: {
          url: 'https://test.com',
          title: 'Test Report',
          description: 'Test description',
          category: 'phishing',
          reporter_name: 'Test User'
        }
      });
      
      if (error) throw error;
      console.log('Scam report test result:', data);
      updateTest('scamReport', 'success');
    } catch (error: any) {
      console.error('Scam report test error:', error);
      updateTest('scamReport', 'error', error.message || 'Unknown error');
    }
  };

  const testOcrFunction = async () => {
    updateTest('ocrFraud', 'loading');
    try {
      // Create a small test image as base64
      const testImage = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
      
      const { data, error } = await supabase.functions.invoke('ocr-fraud-detection', {
        body: {
          image: testImage,
          fileName: 'test.png',
          fileSize: 100,
          fileType: 'image/png'
        }
      });
      
      if (error) throw error;
      console.log('OCR test result:', data);
      updateTest('ocrFraud', 'success');
    } catch (error: any) {
      console.error('OCR test error:', error);
      updateTest('ocrFraud', 'error', error.message || 'Unknown error');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'loading':
        return <Loader2 className="h-4 w-4 animate-spin" />;
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'loading':
        return <Badge variant="secondary">Testing...</Badge>;
      case 'success':
        return <Badge className="bg-green-500">Success</Badge>;
      case 'error':
        return <Badge variant="destructive">Error</Badge>;
      default:
        return <Badge variant="outline">Ready</Badge>;
    }
  };

  return (
    <Card className="fixed bottom-20 right-6 w-80 shadow-xl z-40">
      <CardHeader>
        <CardTitle className="text-sm">Backend Function Tests</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={testChatFunction}
            disabled={tests.chat === 'loading'}
            className="justify-between"
          >
            <span>Chat</span>
            {getStatusIcon(tests.chat)}
          </Button>
          
          <Button
            size="sm"
            variant="outline"
            onClick={testUrlCheckFunction}
            disabled={tests.urlCheck === 'loading'}
            className="justify-between"
          >
            <span>URL Check</span>
            {getStatusIcon(tests.urlCheck)}
          </Button>
          
          <Button
            size="sm"
            variant="outline"
            onClick={testScamReportFunction}
            disabled={tests.scamReport === 'loading'}
            className="justify-between"
          >
            <span>Scam Report</span>
            {getStatusIcon(tests.scamReport)}
          </Button>
          
          <Button
            size="sm"
            variant="outline"
            onClick={testOcrFunction}
            disabled={tests.ocrFraud === 'loading'}
            className="justify-between"
          >
            <span>OCR Fraud</span>
            {getStatusIcon(tests.ocrFraud)}
          </Button>
        </div>

        <div className="space-y-2">
          {Object.entries(tests).map(([test, status]) => (
            <div key={test} className="flex justify-between items-center text-xs">
              <span className="capitalize">{test}:</span>
              {getStatusBadge(status)}
            </div>
          ))}
        </div>

        {Object.entries(errors).map(([test, error]) => error && (
          <div key={test} className="text-xs text-red-500 bg-red-50 p-2 rounded">
            <strong>{test}:</strong> {error}
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default DebugPanel;