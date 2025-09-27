// Test script for OCR fraud detection function
const testOCRFunction = async () => {
  // A tiny test image (1x1 pixel)
  const testImage = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==";
  
  const url = "https://itvgzcdcthxqqczqgtbl.supabase.co/functions/v1/ocr-fraud-detection";
  const anonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml0dmd6Y2RjdGh4cXFjenFndGJsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzczNjk0NjcsImV4cCI6MjA1Mjk0NTQ2N30.x9kZwP8h3sqRNX0dBEAK31TABMbVkW0-7wfDiTVmTYE";

  try {
    console.log("Testing OCR fraud detection function...");
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${anonKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        image: testImage,
        fileName: "test.png",
        fileSize: 1024,
        fileType: "image/png"
      })
    });

    const data = await response.json();
    
    console.log("\n✅ Function Response:");
    console.log(JSON.stringify(data, null, 2));
    
    if (data.success) {
      console.log("\n🎉 SUCCESS! The OCR fraud detection is working!");
      console.log("\nAnalysis Details:");
      console.log("- Document Type:", data.analysis.document_type);
      console.log("- Fraud Risk:", data.analysis.fraud_risk);
      console.log("- Confidence:", data.analysis.confidence);
      console.log("- API Key Status: ✅ GEMINI_API_KEY_OCR is properly configured");
    } else {
      console.log("\n❌ Function returned an error:");
      console.log("Error:", data.error || "Unknown error");
      console.log("\nTroubleshooting:");
      console.log("1. Check if GEMINI_API_KEY_OCR is set in Supabase");
      console.log("2. Verify the API key is valid");
      console.log("3. Check Supabase function logs for details");
    }
  } catch (error) {
    console.error("\n❌ Request failed:", error.message);
  }
};

// Run the test
testOCRFunction();
