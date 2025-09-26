// Enhanced Audio Transcription Service
// Provides real audio processing and transcription capabilities

interface TranscriptionResult {
  transcript: string;
  confidence: number;
  segments?: TranscriptionSegment[];
}

interface TranscriptionSegment {
  text: string;
  startTime: number;
  endTime: number;
  confidence: number;
}

interface AudioFeatures {
  duration: number;
  sampleRate: number;
  numberOfChannels: number;
  peakAmplitude: number;
  averageAmplitude: number;
  silenceRatio: number;
  hasBackgroundNoise: boolean;
}

// Check browser support for various APIs
export const checkBrowserSupport = () => {
  const support = {
    webSpeechAPI: 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window,
    mediaRecorder: 'MediaRecorder' in window,
    webAudioAPI: 'AudioContext' in window || 'webkitAudioContext' in window,
    mediaStream: 'MediaStream' in window
  };
  
  return {
    ...support,
    fullSupport: Object.values(support).every(v => v === true)
  };
};

// Convert blob to audio buffer for processing
const blobToAudioBuffer = async (blob: Blob): Promise<AudioBuffer> => {
  const AudioContext = (window as any).AudioContext || (window as any).webkitAudioContext;
  const audioContext = new AudioContext();
  
  const arrayBuffer = await blob.arrayBuffer();
  const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
  
  return audioBuffer;
};

// Extract detailed audio features for analysis
export const extractDetailedAudioFeatures = async (audioBlob: Blob): Promise<AudioFeatures> => {
  try {
    const audioBuffer = await blobToAudioBuffer(audioBlob);
    const channelData = audioBuffer.getChannelData(0); // Get first channel
    
    // Calculate peak and average amplitude
    let peakAmplitude = 0;
    let sumAmplitude = 0;
    let silentSamples = 0;
    const silenceThreshold = 0.01;
    
    for (let i = 0; i < channelData.length; i++) {
      const amplitude = Math.abs(channelData[i]);
      peakAmplitude = Math.max(peakAmplitude, amplitude);
      sumAmplitude += amplitude;
      
      if (amplitude < silenceThreshold) {
        silentSamples++;
      }
    }
    
    const averageAmplitude = sumAmplitude / channelData.length;
    const silenceRatio = silentSamples / channelData.length;
    
    // Detect background noise (simplified - checks for consistent low-level noise)
    const hasBackgroundNoise = averageAmplitude > 0.02 && averageAmplitude < 0.1;
    
    return {
      duration: audioBuffer.duration,
      sampleRate: audioBuffer.sampleRate,
      numberOfChannels: audioBuffer.numberOfChannels,
      peakAmplitude,
      averageAmplitude,
      silenceRatio,
      hasBackgroundNoise
    };
  } catch (error) {
    console.error('Error extracting audio features:', error);
    throw error;
  }
};

// Enhanced transcription using Web Speech API with better error handling
export const transcribeAudioEnhanced = async (
  audioBlob: Blob,
  options: {
    language?: string;
    continuous?: boolean;
    interimResults?: boolean;
    onProgress?: (progress: number) => void;
    onInterimResult?: (text: string) => void;
  } = {}
): Promise<TranscriptionResult> => {
  const {
    language = 'en-US',
    continuous = true,
    interimResults = true,
    onProgress,
    onInterimResult
  } = options;

  // Check if Web Speech API is supported
  if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
    throw new Error('Web Speech API is not supported in this browser');
  }

  return new Promise((resolve, reject) => {
    try {
      // Create audio element for playback
      const audio = new Audio();
      const audioUrl = URL.createObjectURL(audioBlob);
      audio.src = audioUrl;
      
      // Initialize speech recognition
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      const recognition = new SpeechRecognition();
      
      recognition.continuous = continuous;
      recognition.interimResults = interimResults;
      recognition.maxAlternatives = 3;
      recognition.lang = language;
      
      let finalTranscript = '';
      let confidenceScores: number[] = [];
      const segments: TranscriptionSegment[] = [];
      let startTime = Date.now();
      
      // Create a MediaStream from the audio element for better recognition
      const createMediaStream = async () => {
        try {
          // Create an AudioContext
          const AudioContext = (window as any).AudioContext || (window as any).webkitAudioContext;
          const audioContext = new AudioContext();
          
          // Create a media element source
          const source = audioContext.createMediaElementSource(audio);
          const destination = audioContext.createMediaStreamDestination();
          source.connect(destination);
          source.connect(audioContext.destination); // Also connect to speakers
          
          return destination.stream;
        } catch (error) {
          console.warn('Could not create MediaStream from audio:', error);
          return null;
        }
      };
      
      recognition.onstart = () => {
        console.log('Speech recognition started');
        if (onProgress) onProgress(10);
        startTime = Date.now();
        
        // Play the audio
        audio.play().catch(error => {
          console.error('Error playing audio:', error);
        });
      };
      
      recognition.onresult = (event: any) => {
        let interimTranscript = '';
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          const transcript = result[0].transcript;
          const confidence = result[0].confidence || 0.8;
          
          if (result.isFinal) {
            finalTranscript += transcript + ' ';
            confidenceScores.push(confidence);
            
            // Add segment
            const currentTime = (Date.now() - startTime) / 1000;
            segments.push({
              text: transcript,
              startTime: currentTime - 2, // Approximate
              endTime: currentTime,
              confidence
            });
            
            if (onProgress) {
              const progress = Math.min(90, 10 + (audio.currentTime / audio.duration) * 80);
              onProgress(progress);
            }
          } else {
            interimTranscript += transcript;
            if (onInterimResult) {
              onInterimResult(interimTranscript);
            }
          }
        }
      };
      
      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        
        // Clean up
        URL.revokeObjectURL(audioUrl);
        audio.pause();
        
        reject(new Error(`Speech recognition error: ${event.error}`));
      };
      
      recognition.onend = () => {
        console.log('Speech recognition ended');
        if (onProgress) onProgress(100);
        
        // Clean up
        URL.revokeObjectURL(audioUrl);
        audio.pause();
        
        // Calculate average confidence
        const averageConfidence = confidenceScores.length > 0
          ? confidenceScores.reduce((a, b) => a + b, 0) / confidenceScores.length
          : 0;
        
        resolve({
          transcript: finalTranscript.trim(),
          confidence: averageConfidence,
          segments
        });
      };
      
      // Handle audio ended
      audio.onended = () => {
        setTimeout(() => {
          recognition.stop();
        }, 500); // Small delay to catch final results
      };
      
      // Start recognition
      recognition.start();
      
    } catch (error) {
      console.error('Error in enhanced transcription:', error);
      reject(error);
    }
  });
};

// Alternative transcription using MediaRecorder API for better compatibility
export const transcribeUsingMediaRecorder = async (
  audioBlob: Blob,
  onProgress?: (progress: number) => void
): Promise<TranscriptionResult> => {
  return new Promise(async (resolve, reject) => {
    try {
      // Convert blob to audio element
      const audio = new Audio();
      const audioUrl = URL.createObjectURL(audioBlob);
      audio.src = audioUrl;
      
      // Get audio duration
      await new Promise((res) => {
        audio.addEventListener('loadedmetadata', res, { once: true });
      });
      
      const duration = audio.duration;
      
      // Create audio context and source
      const AudioContext = (window as any).AudioContext || (window as any).webkitAudioContext;
      const audioContext = new AudioContext();
      
      // Decode audio data
      const arrayBuffer = await audioBlob.arrayBuffer();
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
      
      // Create a destination node
      const destination = audioContext.createMediaStreamDestination();
      const source = audioContext.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(destination);
      
      // Initialize speech recognition
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      const recognition = new SpeechRecognition();
      
      recognition.continuous = true;
      recognition.interimResults = false;
      recognition.lang = 'en-US';
      
      let transcript = '';
      let confidence = 0;
      
      recognition.onresult = (event: any) => {
        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            transcript += event.results[i][0].transcript + ' ';
            confidence = Math.max(confidence, event.results[i][0].confidence || 0.8);
          }
        }
        
        if (onProgress) {
          const progress = Math.min(90, (audioContext.currentTime / duration) * 100);
          onProgress(progress);
        }
      };
      
      recognition.onend = () => {
        if (onProgress) onProgress(100);
        URL.revokeObjectURL(audioUrl);
        
        resolve({
          transcript: transcript.trim(),
          confidence
        });
      };
      
      recognition.onerror = (event: any) => {
        URL.revokeObjectURL(audioUrl);
        reject(new Error(`Recognition error: ${event.error}`));
      };
      
      // Start playback and recognition
      recognition.start();
      source.start(0);
      
      // Stop recognition when audio ends
      source.onended = () => {
        setTimeout(() => {
          recognition.stop();
        }, 1000);
      };
      
    } catch (error) {
      reject(error);
    }
  });
};

// Main transcription function using local Whisper server
export const transcribeAudio = async (
  audioBlob: Blob,
  onProgress?: (progress: number) => void
): Promise<TranscriptionResult> => {
  try {
    // Create FormData and append the audio file
    const formData = new FormData();
    formData.append('file', audioBlob, 'audio.wav');
    
    if (onProgress) onProgress(10);
    
    // Use local Whisper server
    const WHISPER_SERVER_URL = 'http://localhost:5000';
    
    // First check if server is running
    try {
      const healthCheck = await fetch(`${WHISPER_SERVER_URL}/health`);
      if (!healthCheck.ok) {
        throw new Error('Whisper server is not responding');
      }
    } catch (e) {
      throw new Error(
        'Local Whisper server is not running. Please:\n\n' +
        '1. Open a terminal in the local-whisper folder\n' +
        '2. Run: pip install -r requirements.txt (first time only)\n' +
        '3. Run: python whisper_server.py\n\n' +
        'Or use the manual transcript option below.'
      );
    }
    
    if (onProgress) onProgress(30);
    
    // Call local Whisper API
    const response = await fetch(`${WHISPER_SERVER_URL}/api/transcribe`, {
      method: 'POST',
      body: formData,
    });
    
    if (onProgress) onProgress(80);
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(error.details || error.error || `Transcription failed: ${response.statusText}`);
    }
    
    const result = await response.json();
    
    if (onProgress) onProgress(100);
    
    // Log performance info
    if (result.stats) {
      console.log(`✅ Transcribed ${result.stats.file_size_mb}MB in ${result.stats.processing_time}s`);
      console.log(`⚡ Speed: ${result.stats.speed_factor}x realtime on ${result.device}`);
    }
    
    return {
      transcript: result.transcript || '',
      confidence: result.confidence || 0.95,
      segments: result.segments
    };
    
  } catch (error) {
    console.error('Transcription error:', error);
    throw error;
  }
};

// Utility to validate audio file
export const validateAudioFile = (file: File): { valid: boolean; error?: string } => {
  const validTypes = [
    'audio/mp3', 'audio/mpeg', 'audio/wav', 'audio/wave', 
    'audio/ogg', 'audio/m4a', 'audio/webm', 'audio/flac'
  ];
  const maxSize = 50 * 1024 * 1024; // 50MB
  
  // Check file extension if MIME type is not recognized
  const fileExtension = file.name.split('.').pop()?.toLowerCase();
  const validExtensions = ['mp3', 'wav', 'ogg', 'm4a', 'webm', 'flac'];
  
  if (!validTypes.includes(file.type) && !validExtensions.includes(fileExtension || '')) {
    return { 
      valid: false, 
      error: 'Invalid file type. Please upload MP3, WAV, OGG, M4A, WebM, or FLAC files.' 
    };
  }
  
  if (file.size > maxSize) {
    return { 
      valid: false, 
      error: 'File too large. Maximum size is 50MB.' 
    };
  }
  
  if (file.size < 1000) { // Less than 1KB
    return { 
      valid: false, 
      error: 'File too small. Please upload a valid audio file.' 
    };
  }
  
  return { valid: true };
};

// Utility to convert audio file to compatible format if needed
export const ensureCompatibleAudioFormat = async (file: File): Promise<Blob> => {
  // If it's already a compatible format, return as is
  const compatibleTypes = ['audio/wav', 'audio/webm'];
  if (compatibleTypes.includes(file.type)) {
    return file;
  }
  
  try {
    // Convert to WAV format using Web Audio API
    const arrayBuffer = await file.arrayBuffer();
    const AudioContext = (window as any).AudioContext || (window as any).webkitAudioContext;
    const audioContext = new AudioContext();
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
    
    // Create a new buffer with the audio data
    const length = audioBuffer.length;
    const numberOfChannels = audioBuffer.numberOfChannels;
    const sampleRate = audioBuffer.sampleRate;
    
    // Convert to WAV blob
    const wavBlob = audioBufferToWav(audioBuffer);
    return wavBlob;
  } catch (error) {
    console.error('Error converting audio format:', error);
    // Return original file if conversion fails
    return file;
  }
};

// Convert AudioBuffer to WAV blob
function audioBufferToWav(buffer: AudioBuffer): Blob {
  const length = buffer.length * buffer.numberOfChannels * 2 + 44;
  const arrayBuffer = new ArrayBuffer(length);
  const view = new DataView(arrayBuffer);
  const channels: Float32Array[] = [];
  let offset = 0;
  let pos = 0;
  
  // Write WAV header
  const setUint16 = (data: number) => {
    view.setUint16(pos, data, true);
    pos += 2;
  };
  
  const setUint32 = (data: number) => {
    view.setUint32(pos, data, true);
    pos += 4;
  };
  
  // RIFF identifier
  setUint32(0x46464952);
  // file length
  setUint32(length - 8);
  // WAVE identifier
  setUint32(0x45564157);
  // fmt chunk identifier
  setUint32(0x20746d66);
  // chunk length
  setUint32(16);
  // sample format (PCM)
  setUint16(1);
  // channel count
  setUint16(buffer.numberOfChannels);
  // sample rate
  setUint32(buffer.sampleRate);
  // byte rate (sample rate * channel count * bytes per sample)
  setUint32(buffer.sampleRate * buffer.numberOfChannels * 2);
  // block align (channel count * bytes per sample)
  setUint16(buffer.numberOfChannels * 2);
  // bits per sample
  setUint16(16);
  // data chunk identifier
  setUint32(0x61746164);
  // data length
  setUint32(length - pos - 4);
  
  // Write interleaved data
  for (let i = 0; i < buffer.numberOfChannels; i++) {
    channels.push(buffer.getChannelData(i));
  }
  
  while (pos < length) {
    for (let i = 0; i < buffer.numberOfChannels; i++) {
      // Convert float samples to 16-bit PCM
      let sample = Math.max(-1, Math.min(1, channels[i][offset]));
      sample = sample < 0 ? sample * 0x8000 : sample * 0x7FFF;
      view.setInt16(pos, sample, true);
      pos += 2;
    }
    offset++;
  }
  
  return new Blob([arrayBuffer], { type: 'audio/wav' });
}