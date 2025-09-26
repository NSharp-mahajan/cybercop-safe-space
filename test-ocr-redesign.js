// Test the redesigned OCR function
const SUPABASE_URL = 'https://itvgzcdcthxqqczqgtbl.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml0dmd6Y2RjdGh4cXFjenFndGJsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjczOTI4MjMsImV4cCI6MjA0Mjk2ODgyM30.PLjL3Jpo7_J0Y5QJUpFXBIVdqfk3p-f22wCJB0y7t5I';

async function testRedesignedOCR() {
  try {
    // Create a test image with some text
    const testImage = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMgAAAAyCAYAAAAZUZThAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAOxAAADsQBlSsOGwAABAlJREFUeJzt3D9oHGcQxuHfSiKxcBAiuEgRghAhCBcugguHEIILFy5cuAhBuHAIIbhwSJEihAsXwUWKFClSpEgRXAQXLlyEIIQLFyEIFy6CCxchCBcuQhAiCEmR38ye7mazf+7u9k53eg/M3t3O7OzM7Pf97O2dZMkYY0xvvpEugDGTzALEmAALEGMCLECMCbAAMSbAAsSYAAuQHkn6XtKvkr6U9FLSNUm3Jd2R9IOkzyR9LOlE0qGk7yTdlHRb0g+SPpf0RNJe83XH9aaTPcsWII2k9yX9IumGpN8lXZG0K+mhpN8kfSjpgaQvJH0r6WdJu5I+kvS7pK8l/STpvqR3Jb2qrWQ1n29ztgB5i6TPJT2V9IGkPyXNS1qV9Lmk15K2JM1JOmtqjyNJC5K2Jb2SdE3STNN5W5L+k/SupH8kLUp6U1Nhw1gOCpBqP/Qkk/SepMeSfpX0o6RvJD2V9JGkjyS9lPRU0nVJH0i6L+mJpDuSPpb0jaRfJd2R9K6kV7VV0KQPsIcFiKT5/IXHJK1JuirppaSdZgd/JOlc0rKkTUl/S1qStCPplqQTSTckXZF0Q9K5pI2m/SJ7jhkgP0t6KOmppOuS/pS0JOmtpGeSfpF0VdJ9STclfS3pJ0kPJL0t6YGkXyTdkHRH0itJx/WWvx3fMjkBMivpQP5Dek3SmaQNSf/KX2jNSzqRdCzpUtO8krQp/+HbGUmXJZ1KWpG/+LomaVn+bdeipIPaC7RJViRp8VWzAc+bWv+ZpFV503cl/SupqJtvFiANECAz8md0W/IXZJuStppla/IH8K7k5h1J15plG/LeY0f+zG+jaZ60LelnSftZO2PMuBxhzEjsG1MNO8c0lj0HsOcoD2IB0tAeJHtwOyepFOLdZEfdoG4LkIb2IMxnNfacMZPOAsSYAAsQYwIsQIwJsAAxJsACxJgACxBjAixAjAmwADEmwALEmAALEGMCLECMCbAAMSbAAsSYAAsQYwIsQIwJsAAxJsACxJgACxBjAixAjAmwADEmwALEmAALEGMCLECMCbAAMSbAAsSYAAsQYwIsQIwJsAAxJsACxJgACxBjAixAjAmwADEmwALEmAALEGMCLECMCbAAMSbAAsSYAAsQYwIsQIwJsAAxJsACxJgACxBjAixAjAmwADEmwALEmAALEGMCLECMCbAAMSbAAsSYAAsQYwIsQIwJsAAxJsACxJgACxBjAixAjAmwADEmwALEmAALEGMCLECMCbAAMSbAAsSYAAsQYwIsQIwJsAAxJsACxJgACxBjAixAjAmwADEmwALEmAALEGMCLECMCbAAMSbAAsSYgP8Br9Pz8EoeXFkAAAAASUVORK5CYII=';
    
    console.log('Testing redesigned OCR function...\n');
    
    const response = await fetch(`${SUPABASE_URL}/functions/v1/ocr-fraud-detection`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({
        image: testImage,
        fileName: 'test-document.png',
        fileSize: 1000,
        fileType: 'image/png',
        userId: null
      })
    });

    const data = await response.json();
    console.log('Response status:', response.status);
    console.log('\nFull response:');
    console.log(JSON.stringify(data, null, 2));
    
    if (data.success && data.analysis) {
      console.log('\n✅ Analysis Summary:');
      console.log('- Extracted Text:', data.analysis.extracted_text);
      console.log('- Document Type:', data.analysis.document_type);
      console.log('- Fraud Risk:', data.analysis.fraud_risk);
      console.log('- Confidence:', data.analysis.confidence);
      console.log('- Fraud Indicators:', data.analysis.fraud_indicators);
      console.log('- Recommendations:', data.analysis.recommendations);
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

testRedesignedOCR();
