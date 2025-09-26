// Audio Processing Service for Voice Scam Detection
// Provides advanced audio analysis and scam pattern detection

import { 
  transcribeAudio, 
  extractDetailedAudioFeatures,
  ensureCompatibleAudioFormat,
  checkBrowserSupport
} from '@/utils/audioTranscription';
import { whisperService } from './whisperService';

// Scam pattern definitions with weights
interface ScamPattern {
  category: string;
  keywords: string[];
  weight: number;
  severity: 'high' | 'medium' | 'low';
}

interface ScamAnalysisResult {
  isScam: boolean;
  confidence: number;
  transcript: string;
  redFlags: string[];
  scamType?: string;
  recommendations: string[];
  audioFeatures?: {
    duration: number;
    hasBackgroundNoise: boolean;
    silenceRatio: number;
    averageAmplitude: number;
  };
  detailedScores: {
    urgencyScore: number;
    financialScore: number;
    threatScore: number;
    impersonationScore: number;
    personalInfoScore: number;
    technicalScore: number;
  };
}

interface ProcessingOptions {
  onProgress?: (progress: number, status: string) => void;
  enableAudioAnalysis?: boolean;
  language?: string;
  manualTranscript?: string; // If provided, use this transcript instead of attempting auto-transcription
  useWhisper?: boolean; // Force use of Whisper server
  preferWhisper?: boolean; // Prefer Whisper if available (default: true)
}

export class AudioProcessingService {
  private scamPatterns: ScamPattern[] = [
    {
      category: 'urgency',
      keywords: [
        'act now', 'limited time', 'urgent', 'immediately', 'right away', 
        'don\'t delay', 'expire', 'deadline', 'hurry', 'last chance',
        'time sensitive', 'critical', 'emergency', 'must call back',
        'within 24 hours', 'today only', 'final notice', 'last warning'
      ],
      weight: 15,
      severity: 'medium'
    },
    {
      category: 'financial',
      keywords: [
        'bank account', 'credit card', 'social security', 'tax', 'irs', 
        'refund', 'wire transfer', 'bitcoin', 'gift card', 'payment',
        'invoice', 'debt', 'money', 'cash', 'check', 'western union',
        'moneygram', 'paypal', 'venmo', 'zelle', 'cashapp', 'cryptocurrency',
        'routing number', 'account number', 'financial', 'transaction'
      ],
      weight: 20,
      severity: 'high'
    },
    {
      category: 'threats',
      keywords: [
        'arrest', 'legal action', 'lawsuit', 'police', 'warrant', 'suspend',
        'cancel', 'terminate', 'freeze account', 'penalty', 'prosecution',
        'criminal', 'jail', 'prison', 'court', 'judge', 'attorney',
        'consequences', 'trouble', 'investigation', 'federal', 'agent'
      ],
      weight: 25,
      severity: 'high'
    },
    {
      category: 'prizes',
      keywords: [
        'winner', 'lottery', 'prize', 'jackpot', 'free', 'giveaway',
        'congratulations', 'selected', 'claim your', 'sweepstakes',
        'contest', 'reward', 'bonus', 'grand prize', 'million dollars',
        'vacation', 'cruise', 'car', 'you\'ve won', 'lucky'
      ],
      weight: 20,
      severity: 'medium'
    },
    {
      category: 'impersonation',
      keywords: [
        'microsoft', 'amazon', 'apple', 'google', 'tech support', 
        'government', 'official', 'representative', 'agent', 'department',
        'bureau', 'administration', 'office', 'service', 'company',
        'calling from', 'on behalf of', 'authorized', 'certified'
      ],
      weight: 20,
      severity: 'high'
    },
    {
      category: 'personalInfo',
      keywords: [
        'verify', 'confirm', 'update', 'provide', 'password', 'pin',
        'account number', 'routing number', 'personal information',
        'date of birth', 'mother\'s maiden', 'security question',
        'full name', 'address', 'email', 'phone number', 'ssn',
        'identification', 'credentials', 'login', 'username'
      ],
      weight: 25,
      severity: 'high'
    },
    {
      category: 'technical',
      keywords: [
        'remote access', 'teamviewer', 'anydesk', 'logmein', 'computer',
        'virus', 'malware', 'hacked', 'infected', 'security breach',
        'ip address', 'download', 'install', 'software', 'program',
        'click on', 'link', 'website', 'screen share', 'control'
      ],
      weight: 30,
      severity: 'high'
    },
    {
      category: 'pressure',
      keywords: [
        'do not hang up', 'stay on the line', 'don\'t tell anyone',
        'keep this confidential', 'secret', 'private matter',
        'can\'t discuss with others', 'only you', 'special offer',
        'exclusive', 'one time', 'act fast', 'right now'
      ],
      weight: 20,
      severity: 'medium'
    }
  ];

  // Advanced pattern combinations that indicate high scam probability
  private dangerousCombinations = [
    { patterns: ['financial', 'threats'], multiplier: 1.5 },
    { patterns: ['impersonation', 'personalInfo'], multiplier: 1.4 },
    { patterns: ['technical', 'financial'], multiplier: 1.6 },
    { patterns: ['prizes', 'financial'], multiplier: 1.3 },
    { patterns: ['urgency', 'threats'], multiplier: 1.3 }
  ];

  // Process audio file and analyze for scams
  async processAudioFile(
    audioFile: File | Blob,
    options: ProcessingOptions = {}
  ): Promise<ScamAnalysisResult> {
    const { 
      onProgress, 
      enableAudioAnalysis = true, 
      language = 'en-US', 
      manualTranscript,
      useWhisper = false,
      preferWhisper = true
    } = options;

    try {
      // Step 1: Validate and prepare audio
      if (onProgress) onProgress(5, 'Validating audio file...');
      
      // Ensure compatible format
      const compatibleAudio = await ensureCompatibleAudioFormat(audioFile as File);
      
      // Step 2: Extract audio features (optional)
      let audioFeatures;
      if (enableAudioAnalysis) {
        if (onProgress) onProgress(15, 'Analyzing audio characteristics...');
        
        try {
          const features = await extractDetailedAudioFeatures(compatibleAudio);
          audioFeatures = {
            duration: features.duration,
            hasBackgroundNoise: features.hasBackgroundNoise,
            silenceRatio: features.silenceRatio,
            averageAmplitude: features.averageAmplitude
          };
          
          // Add warnings based on audio features
          if (features.duration < 5) {
            console.warn('Audio is very short, analysis may be limited');
          }
          if (features.silenceRatio > 0.7) {
            console.warn('Audio contains mostly silence');
          }
        } catch (error) {
          console.warn('Could not extract audio features:', error);
        }
      }
      
      // Step 3: Transcribe audio or use manual transcript
      let transcript = '';
      let transcriptionConfidence = 0;
      let transcriptionMethod = 'manual';

      if (manualTranscript && manualTranscript.trim().length > 0) {
        if (onProgress) onProgress(30, 'Using provided transcript...');
        transcript = manualTranscript.trim();
        transcriptionConfidence = 0.95;
      } else {
        // Try Whisper first if preferred or forced
        const shouldTryWhisper = useWhisper || (preferWhisper && await whisperService.isServerAvailable());
        
        if (shouldTryWhisper) {
          try {
            if (onProgress) onProgress(30, 'Transcribing with Whisper (GPU-accelerated)...');
            
            const whisperResult = await whisperService.transcribeAudio(compatibleAudio, {
              onProgress: (progress, status) => {
                if (onProgress) {
                  // Map Whisper progress to overall progress (30-80)
                  const overallProgress = 30 + (progress * 0.5);
                  onProgress(overallProgress, status);
                }
              },
              language: language.split('-')[0] // Extract language code (en from en-US)
            });
            
            transcript = whisperResult.transcript;
            transcriptionConfidence = whisperResult.confidence;
            transcriptionMethod = 'whisper';
            
            // Log Whisper stats if available
            if (whisperResult.stats) {
              console.log('Whisper transcription stats:', {
                processingTime: `${whisperResult.stats.processing_time}s`,
                speedFactor: `${whisperResult.stats.speed_factor}x realtime`,
                device: whisperResult.device
              });
            }
          } catch (whisperError) {
            console.warn('Whisper transcription failed, falling back to Web Speech API:', whisperError);
            
            if (useWhisper) {
              // If Whisper was explicitly requested, throw the error
              throw new Error(`Whisper transcription failed: ${whisperError.message}`);
            }
            // Otherwise fall back to Web Speech API
            transcriptionMethod = 'webspeech-fallback';
          }
        }
        
        // Use Web Speech API if Whisper wasn't used or failed
        if (!transcript && transcriptionMethod !== 'whisper') {
          if (onProgress) onProgress(30, 'Transcribing audio (Web Speech API)...');
          const transcriptionResult = await transcribeAudio(
            compatibleAudio,
            (progress) => {
              if (onProgress) {
                // Map transcription progress (0-100) to overall progress (30-80)
                const overallProgress = 30 + (progress * 0.5);
                onProgress(overallProgress, 'Transcribing audio (Web Speech API)...');
              }
            }
          );
          transcript = transcriptionResult.transcript;
          transcriptionConfidence = transcriptionResult.confidence;
          transcriptionMethod = 'webspeech';
        }
      }
      
      // Step 4: Analyze transcript for scam patterns
      if (onProgress) onProgress(85, 'Analyzing for scam patterns...');
      
      const analysisResult = this.analyzeTranscript(
        transcript,
        transcriptionConfidence,
        audioFeatures
      );
      
      if (onProgress) onProgress(100, 'Analysis complete');
      
      return analysisResult;
      
    } catch (error) {
      console.error('Error processing audio:', error);
      throw new Error(`Failed to process audio: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Analyze transcript for scam patterns
  private analyzeTranscript(
    transcript: string,
    transcriptionConfidence: number,
    audioFeatures?: any
  ): ScamAnalysisResult {
    const lowerTranscript = transcript.toLowerCase();
    const words = lowerTranscript.split(/\s+/);
    const wordCount = words.length;
    
    const redFlags: string[] = [];
    const detectedPatterns: { [key: string]: number } = {};
    const detailedScores = {
      urgencyScore: 0,
      financialScore: 0,
      threatScore: 0,
      impersonationScore: 0,
      personalInfoScore: 0,
      technicalScore: 0
    };
    
    let totalScore = 0;
    let scamType = '';

    // Analyze each pattern category
    this.scamPatterns.forEach(pattern => {
      const matches = pattern.keywords.filter(keyword => 
        lowerTranscript.includes(keyword.toLowerCase())
      );
      
      if (matches.length > 0) {
        const categoryScore = matches.length * pattern.weight;
        detectedPatterns[pattern.category] = matches.length;
        totalScore += categoryScore;
        
        // Update detailed scores
        switch (pattern.category) {
          case 'urgency':
            detailedScores.urgencyScore = categoryScore;
            if (matches.length >= 2) redFlags.push('Creates strong sense of urgency');
            break;
          case 'financial':
            detailedScores.financialScore = categoryScore;
            redFlags.push(`Mentions financial information (${matches.length} times)`);
            break;
          case 'threats':
            detailedScores.threatScore = categoryScore;
            redFlags.push('Contains threats or intimidation tactics');
            scamType = scamType || 'Threatening/Intimidation Scam';
            break;
          case 'prizes':
            redFlags.push('Mentions unexpected prizes or winnings');
            scamType = scamType || 'Prize/Lottery Scam';
            break;
          case 'impersonation':
            detailedScores.impersonationScore = categoryScore;
            redFlags.push(`Possible impersonation attempt (claiming to be ${matches.join(', ')})`);
            scamType = scamType || 'Impersonation Scam';
            break;
          case 'personalInfo':
            detailedScores.personalInfoScore = categoryScore;
            redFlags.push('Requests sensitive personal information');
            break;
          case 'technical':
            detailedScores.technicalScore = categoryScore;
            redFlags.push('Requests remote computer access or software installation');
            scamType = scamType || 'Tech Support Scam';
            break;
          case 'pressure':
            redFlags.push('Uses high-pressure tactics');
            break;
        }
      }
    });

    // Check for dangerous pattern combinations
    this.dangerousCombinations.forEach(combo => {
      const hasAllPatterns = combo.patterns.every(p => detectedPatterns[p] > 0);
      if (hasAllPatterns) {
        totalScore *= combo.multiplier;
        redFlags.push(`Dangerous combination: ${combo.patterns.join(' + ')}`);
      }
    });

    // Additional contextual analysis
    if (lowerTranscript.includes('calling back') && lowerTranscript.includes('number')) {
      redFlags.push('Provides callback number (common in scams)');
      totalScore += 10;
    }

    if (wordCount < 50 && detectedPatterns['threats']) {
      redFlags.push('Short message with threats (high-pressure tactic)');
      totalScore *= 1.2;
    }

    // Audio feature analysis
    if (audioFeatures) {
      if (audioFeatures.hasBackgroundNoise && audioFeatures.averageAmplitude < 0.3) {
        redFlags.push('Poor call quality (common in scam call centers)');
        totalScore += 5;
      }
      
      if (audioFeatures.duration < 10 && detectedPatterns['urgency']) {
        redFlags.push('Very short call with urgency (suspicious)');
        totalScore += 10;
      }
    }

    // Calculate final confidence score
    const baseConfidence = Math.min(totalScore, 100);
    const adjustedConfidence = baseConfidence * (0.7 + transcriptionConfidence * 0.3);
    
    const isScam = adjustedConfidence >= 40;
    
    if (!scamType && isScam) {
      // Determine scam type based on highest scoring category
      const scoreEntries = Object.entries(detailedScores);
      const highestScore = scoreEntries.reduce((max, [category, score]) => 
        score > max[1] ? [category, score] : max, ['', 0]);
      
      const typeMap: { [key: string]: string } = {
        urgencyScore: 'High-Pressure Scam',
        financialScore: 'Financial Fraud',
        threatScore: 'Threatening/Intimidation Scam',
        impersonationScore: 'Impersonation Scam',
        personalInfoScore: 'Phishing/Identity Theft',
        technicalScore: 'Tech Support Scam'
      };
      
      scamType = typeMap[highestScore[0]] || 'Potential Scam';
    }

    // Generate recommendations
    const recommendations = this.generateRecommendations(
      isScam, 
      adjustedConfidence, 
      detectedPatterns,
      scamType
    );

    return {
      isScam,
      confidence: Math.round(adjustedConfidence),
      transcript,
      redFlags,
      scamType: isScam ? scamType : undefined,
      recommendations,
      audioFeatures,
      detailedScores
    };
  }

  // Generate personalized recommendations based on analysis
  private generateRecommendations(
    isScam: boolean,
    confidence: number,
    detectedPatterns: { [key: string]: number },
    scamType: string
  ): string[] {
    const recommendations: string[] = [];
    
    if (isScam) {
      // High-risk recommendations
      recommendations.push('⚠️ Do NOT provide any personal or financial information');
      recommendations.push('🚫 Hang up immediately and block the number');
      recommendations.push('📞 If claiming to be a company/agency, verify by calling their official number');
      recommendations.push('🚨 Report this call to the Federal Trade Commission (FTC)');
      
      // Specific recommendations based on patterns
      if (detectedPatterns['threats']) {
        recommendations.push('💡 Remember: Government agencies never threaten arrest over the phone');
        recommendations.push('📝 Document the call details for law enforcement');
      }
      
      if (detectedPatterns['financial']) {
        recommendations.push('🏦 Contact your bank directly if concerned about your accounts');
        recommendations.push('💳 Never provide financial details to unsolicited callers');
      }
      
      if (detectedPatterns['technical']) {
        recommendations.push('💻 Legitimate tech companies don\'t make unsolicited support calls');
        recommendations.push('🔒 Never allow remote access to your computer');
      }
      
      if (detectedPatterns['prizes']) {
        recommendations.push('🎁 Real prizes never require upfront payment');
        recommendations.push('📋 If you didn\'t enter a contest, you didn\'t win');
      }
      
    } else if (confidence > 20) {
      // Medium-risk recommendations
      recommendations.push('⚡ Exercise caution with this call');
      recommendations.push('✅ Verify the caller\'s identity independently');
      recommendations.push('🤔 Don\'t feel pressured to make immediate decisions');
      recommendations.push('📱 Ask for information in writing before proceeding');
      
    } else {
      // Low-risk recommendations
      recommendations.push('✅ Call appears legitimate but always remain vigilant');
      recommendations.push('🛡️ Never share sensitive information unless you initiated the call');
      recommendations.push('📝 Keep records of important calls');
    }
    
    // Add general safety tip
    recommendations.push('💡 Register your number at DoNotCall.gov to reduce scam calls');
    
    return recommendations;
  }

  // Get browser compatibility status
  getBrowserCompatibility() {
    return checkBrowserSupport();
  }

  // Validate if a file can be processed
  validateFile(file: File): { valid: boolean; error?: string } {
    const validTypes = [
      'audio/mp3', 'audio/mpeg', 'audio/wav', 'audio/wave',
      'audio/ogg', 'audio/m4a', 'audio/webm', 'audio/flac'
    ];
    const maxSize = 50 * 1024 * 1024; // 50MB
    const minSize = 1024; // 1KB

    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    const validExtensions = ['mp3', 'wav', 'ogg', 'm4a', 'webm', 'flac'];

    if (!validTypes.includes(file.type) && !validExtensions.includes(fileExtension || '')) {
      return {
        valid: false,
        error: 'Invalid file type. Supported formats: MP3, WAV, OGG, M4A, WebM, FLAC'
      };
    }

    if (file.size > maxSize) {
      return {
        valid: false,
        error: `File too large (${(file.size / 1024 / 1024).toFixed(2)}MB). Maximum size is 50MB.`
      };
    }

    if (file.size < minSize) {
      return {
        valid: false,
        error: 'File too small. Please upload a valid audio file.'
      };
    }

    return { valid: true };
  }
}

// Export singleton instance
export const audioProcessingService = new AudioProcessingService();