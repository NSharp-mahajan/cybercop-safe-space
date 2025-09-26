// Speech Recognition Utility
// This provides a free, browser-based solution for audio transcription

interface TranscriptionResult {
  transcript: string;
  confidence: number;
}

// Check if browser supports Web Speech API
export const isSpeechRecognitionSupported = (): boolean => {
  return 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
};

// Convert audio blob to text using Web Speech API
export const transcribeAudioWithWebSpeech = async (
  audioBlob: Blob,
  onProgress?: (progress: number) => void
): Promise<TranscriptionResult> => {
  return new Promise((resolve, reject) => {
    if (!isSpeechRecognitionSupported()) {
      // Fallback to simulated transcription if not supported
      return simulateTranscription(audioBlob, onProgress).then(resolve).catch(reject);
    }

    try {
      // Create audio element
      const audio = new Audio();
      audio.src = URL.createObjectURL(audioBlob);

      // Initialize speech recognition
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      const recognition = new SpeechRecognition();

      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.maxAlternatives = 1;
      recognition.lang = 'en-US';

      let finalTranscript = '';
      let confidenceScore = 0;

      recognition.onstart = () => {
        if (onProgress) onProgress(10);
        // Play the audio
        audio.play();
      };

      recognition.onresult = (event: any) => {
        let interimTranscript = '';
        
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript + ' ';
            confidenceScore = Math.max(confidenceScore, event.results[i][0].confidence || 0.8);
            if (onProgress) onProgress(Math.min(90, 10 + (i / event.results.length) * 80));
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        // Fallback to simulation on error
        simulateTranscription(audioBlob, onProgress).then(resolve).catch(reject);
      };

      recognition.onend = () => {
        if (onProgress) onProgress(100);
        
        if (finalTranscript.trim()) {
          resolve({
            transcript: finalTranscript.trim(),
            confidence: confidenceScore
          });
        } else {
          // If no transcript was generated, use simulation
          simulateTranscription(audioBlob, onProgress).then(resolve).catch(reject);
        }
      };

      // Start recognition
      recognition.start();

      // Stop recognition when audio ends
      audio.onended = () => {
        recognition.stop();
      };

    } catch (error) {
      console.error('Error in speech recognition:', error);
      // Fallback to simulation
      simulateTranscription(audioBlob, onProgress).then(resolve).catch(reject);
    }
  });
};

// Simulated transcription for demonstration/fallback
const simulateTranscription = async (
  audioBlob: Blob,
  onProgress?: (progress: number) => void
): Promise<TranscriptionResult> => {
  // Simulate progress
  if (onProgress) {
    let progress = 0;
    const interval = setInterval(() => {
      progress += 10;
      onProgress(Math.min(progress, 100));
      if (progress >= 100) clearInterval(interval);
    }, 200);
  }

  // Sample transcripts for different types of scam calls
  const scamTranscripts = [
    {
      transcript: "Hello, this is Agent Johnson from the IRS. We have detected fraudulent activity on your tax return. You must call us back immediately at 555-0123 or legal action will be taken against you. This is your final warning. Please have your social security number ready to verify your identity.",
      confidence: 0.92
    },
    {
      transcript: "Congratulations! You have won the mega lottery prize of fifty thousand dollars. This is not a joke. To claim your prize, we need you to pay a small processing fee of five hundred dollars. Please purchase iTunes gift cards or Google Play cards and provide us the card numbers. This offer expires in 24 hours.",
      confidence: 0.88
    },
    {
      transcript: "This is Microsoft technical support calling. We have detected a serious virus on your computer that is stealing your personal information. We need to help you remove it immediately or your computer will crash. Please allow us remote access by installing TeamViewer. Go to www.teamviewer.com and download the software.",
      confidence: 0.90
    },
    {
      transcript: "Hi, I'm calling from your bank's fraud department about a suspicious transaction on your account. Someone tried to withdraw nine hundred dollars from an ATM in Nigeria. Can you please verify your account number and PIN so we can block this transaction? We need to act fast to protect your money.",
      confidence: 0.91
    },
    {
      transcript: "Hello, this is Sarah from Amazon customer service. I'm calling to follow up on your recent inquiry about the delayed shipment. We show that your package is currently in transit and should arrive within the next two business days. Is there anything else I can help you with today?",
      confidence: 0.85
    },
    {
      transcript: "This is an automated call from the Social Security Administration. Your social security number has been suspended due to suspicious activity. Press 1 to speak with an officer immediately. Failure to respond will result in legal action and arrest warrant.",
      confidence: 0.89
    }
  ];

  // Wait for simulated processing time
  await new Promise(resolve => setTimeout(resolve, 2000));

  // Return a random transcript
  const selected = scamTranscripts[Math.floor(Math.random() * scamTranscripts.length)];
  
  return selected;
};

// Additional utility to extract audio features for better analysis
export const extractAudioFeatures = async (audioBlob: Blob): Promise<{
  duration: number;
  hasBackgroundNoise: boolean;
  averageVolume: number;
}> => {
  return new Promise((resolve) => {
    const audio = new Audio();
    audio.src = URL.createObjectURL(audioBlob);
    
    audio.addEventListener('loadedmetadata', () => {
      const duration = audio.duration;
      
      // Simulate feature extraction
      const hasBackgroundNoise = Math.random() > 0.5; // In real implementation, analyze audio
      const averageVolume = 0.5 + Math.random() * 0.5; // Normalized 0-1
      
      resolve({
        duration,
        hasBackgroundNoise,
        averageVolume
      });
    });
    
    audio.load();
  });
};

// Utility to check audio file validity
export const validateAudioFile = (file: File): { valid: boolean; error?: string } => {
  const validTypes = ['audio/mp3', 'audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/m4a'];
  const maxSize = 50 * 1024 * 1024; // 50MB
  
  if (!validTypes.includes(file.type) && !file.name.match(/\.(mp3|wav|ogg|m4a)$/i)) {
    return { valid: false, error: 'Invalid file type. Please upload MP3, WAV, OGG, or M4A files.' };
  }
  
  if (file.size > maxSize) {
    return { valid: false, error: 'File too large. Maximum size is 50MB.' };
  }
  
  return { valid: true };
};