// Local Whisper Server Integration Service
// Connects to the local Whisper server for high-quality, GPU-accelerated transcription

export interface WhisperTranscriptionResult {
  transcript: string;
  confidence: number;
  model: string;
  device: string;
  duration: number;
  segments?: WhisperSegment[];
  stats?: {
    processing_time: number;
    audio_duration: number;
    speed_factor: number;
    file_size_mb: number;
  };
}

export interface WhisperSegment {
  start: number;
  end: number;
  text: string;
}

export interface WhisperServerStatus {
  status: string;
  model: string;
  device: string;
  gpu_available: boolean;
  server: string;
}

class WhisperService {
  private baseUrl: string;
  private isAvailable: boolean = false;
  private lastHealthCheck: number = 0;
  private healthCheckInterval: number = 30000; // 30 seconds

  constructor() {
    // Default to localhost:5000 where the Whisper server runs
    this.baseUrl = 'http://localhost:5000';
    this.checkServerHealth();
  }

  /**
   * Check if the Whisper server is running and available
   */
  async checkServerHealth(): Promise<boolean> {
    // Cache health check for 30 seconds
    if (Date.now() - this.lastHealthCheck < this.healthCheckInterval && this.isAvailable) {
      return true;
    }

    try {
      const response = await fetch(`${this.baseUrl}/health`, {
        method: 'GET',
        mode: 'cors',
        signal: AbortSignal.timeout(5000) // 5 second timeout
      });

      if (response.ok) {
        const health: WhisperServerStatus = await response.json();
        this.isAvailable = health.status === 'healthy';
        this.lastHealthCheck = Date.now();
        
        if (this.isAvailable) {
          console.log(`✅ Whisper server available: ${health.model} on ${health.device}`);
        }
        
        return this.isAvailable;
      }
    } catch (error) {
      console.warn('Whisper server not available:', error);
      this.isAvailable = false;
    }

    return false;
  }

  /**
   * Check if the Whisper server is available
   */
  async isServerAvailable(): Promise<boolean> {
    return this.checkServerHealth();
  }

  /**
   * Get available models from the Whisper server
   */
  async getAvailableModels() {
    try {
      const response = await fetch(`${this.baseUrl}/api/models`, {
        method: 'GET',
        mode: 'cors'
      });

      if (response.ok) {
        return await response.json();
      }
    } catch (error) {
      console.error('Error fetching models:', error);
    }

    return null;
  }

  /**
   * Transcribe an audio file using the local Whisper server
   */
  async transcribeAudio(
    audioFile: File | Blob,
    options: {
      onProgress?: (progress: number, status: string) => void;
      language?: string;
    } = {}
  ): Promise<WhisperTranscriptionResult> {
    const { onProgress, language = 'en' } = options;

    // Check server availability first
    const isAvailable = await this.isServerAvailable();
    if (!isAvailable) {
      throw new Error('Whisper server is not available. Please ensure the server is running on http://localhost:5000');
    }

    // Prepare form data
    const formData = new FormData();
    
    // Convert Blob to File if necessary
    if (audioFile instanceof Blob && !(audioFile instanceof File)) {
      audioFile = new File([audioFile], 'audio.webm', { type: audioFile.type });
    }
    
    formData.append('file', audioFile as File);

    // Update progress
    if (onProgress) {
      onProgress(10, 'Uploading audio to Whisper server...');
    }

    try {
      // Create abort controller for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 300000); // 5 minute timeout

      // Send request to Whisper server
      const response = await fetch(`${this.baseUrl}/api/transcribe`, {
        method: 'POST',
        body: formData,
        mode: 'cors',
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(error.error || `Server error: ${response.status}`);
      }

      if (onProgress) {
        onProgress(90, 'Processing complete!');
      }

      const result: WhisperTranscriptionResult = await response.json();

      // Ensure confidence is between 0 and 1
      if (result.confidence > 1) {
        result.confidence = result.confidence / 100;
      }

      if (onProgress) {
        onProgress(100, 'Transcription complete!');
      }

      return result;
    } catch (error) {
      if (error.name === 'AbortError') {
        throw new Error('Transcription timeout - audio file may be too large');
      }
      
      throw error;
    }
  }

  /**
   * Format Whisper segments to match the expected format
   */
  formatSegments(whisperSegments: WhisperSegment[]): Array<{
    text: string;
    startTime: number;
    endTime: number;
    confidence: number;
  }> {
    return whisperSegments.map(segment => ({
      text: segment.text.trim(),
      startTime: segment.start,
      endTime: segment.end,
      confidence: 0.95 // Whisper doesn't provide per-segment confidence
    }));
  }

  /**
   * Get server configuration and status
   */
  async getServerInfo(): Promise<WhisperServerStatus | null> {
    try {
      const response = await fetch(`${this.baseUrl}/health`, {
        method: 'GET',
        mode: 'cors'
      });

      if (response.ok) {
        return await response.json();
      }
    } catch (error) {
      console.error('Error getting server info:', error);
    }

    return null;
  }
}

// Export singleton instance
export const whisperService = new WhisperService();

// Export types
export type { WhisperService };
