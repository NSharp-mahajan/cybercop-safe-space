# Voice Scam Detector Feature Documentation

## Overview

The Voice Scam Detector is a free, browser-based tool that analyzes recorded phone calls to detect potential scam attempts. It uses advanced pattern recognition and speech analysis to identify common scam indicators and protect users from fraudulent calls.

## Features

### 1. **Audio File Upload**
- Supports multiple audio formats: MP3, WAV, M4A, OGG
- Maximum file size: 50MB
- Drag-and-drop or click-to-upload interface
- Audio preview player

### 2. **Speech-to-Text Transcription**
- **Primary Method**: Web Speech API (free, browser-based)
- **Fallback**: Simulated transcription for demonstration/unsupported browsers
- Real-time progress tracking
- Confidence scoring for transcription accuracy

### 3. **Scam Detection Analysis**
The system analyzes transcripts for multiple scam indicators:

#### Pattern Categories:
- **Urgency Patterns**: "act now", "limited time", "urgent", etc.
- **Financial Keywords**: "bank account", "credit card", "wire transfer", etc.
- **Threats/Intimidation**: "arrest", "legal action", "warrant", etc.
- **Prize Scams**: "winner", "lottery", "congratulations", etc.
- **Impersonation**: "Microsoft", "IRS", "government", etc.
- **Personal Info Requests**: "verify", "PIN", "password", etc.

#### Scam Types Detected:
- IRS/Tax Scams
- Tech Support Scams
- Prize/Lottery Scams
- Banking Fraud
- Government Impersonation
- Threatening/Intimidation Scams

### 4. **Analysis Results**
- **Scam Probability**: 0-100% confidence score
- **Scam Type Classification**: Identifies the type of scam detected
- **Red Flags List**: Specific warning signs found in the call
- **Full Transcript**: Complete text of the analyzed call
- **Recommendations**: Actionable advice based on the analysis

### 5. **Privacy & Security**
- **100% Client-Side Processing**: All analysis happens in your browser
- **No Server Upload**: Audio files never leave your device
- **No Data Storage**: Files and results are not saved
- **Secure Analysis**: Uses browser's built-in Web Speech API

## How It Works

### Step 1: Upload Recording
Users upload an audio file of a suspicious phone call. The system validates the file type and size.

### Step 2: Speech Recognition
The Web Speech API converts audio to text. If unavailable, a fallback simulation is used for demonstration.

### Step 3: Pattern Analysis
The transcript is analyzed for:
- Keyword matching across scam categories
- Phrase pattern recognition
- Context analysis for scam indicators

### Step 4: Scoring Algorithm
```
Scam Score Calculation:
- Urgency patterns: +15 points per match
- Financial mentions: +20 points per match
- Threats: +25 points per match
- Prize mentions: +20 points per match
- Impersonation: +20 points per match
- Personal info requests: +25 points per match
- Special phrases: +20-30 points

Final Score = min(total_points, 100)
Scam Detected = score >= 40%
```

### Step 5: Results & Recommendations
Based on the analysis, users receive:
- Clear scam/legitimate classification
- Specific recommendations for action
- Options to report the scam or file an FIR

## Technical Implementation

### Technologies Used
- **React + TypeScript**: Component framework
- **Web Speech API**: Free speech recognition
- **Tailwind CSS**: Styling
- **Lucide Icons**: UI icons
- **Shadcn/ui**: UI components

### Key Files
- `/src/pages/VoiceScamDetector.tsx`: Main component
- `/src/utils/speechRecognition.ts`: Speech processing utilities
- Pattern matching logic embedded in component

### Browser Compatibility
- **Chrome/Edge**: Full Web Speech API support
- **Safari**: Limited support (may use fallback)
- **Firefox**: Uses fallback transcription
- **Mobile**: Varies by browser

## Usage Instructions

1. Navigate to `/voice-scam-detector` in the application
2. Click "Upload" or drag an audio file into the upload area
3. Preview the audio if needed
4. Click "Analyze Call" to start the detection process
5. Review the results and follow recommendations
6. Use action buttons to report scams or file complaints

## Limitations

1. **Language Support**: Currently optimized for English
2. **Audio Quality**: Poor quality recordings may affect accuracy
3. **Real-time Analysis**: Not supported for live calls
4. **Browser Dependency**: Accuracy depends on browser's speech recognition
5. **Offline Capability**: Requires active internet for Web Speech API

## Future Enhancements

1. **Multi-language Support**: Add support for regional languages
2. **Real-time Call Analysis**: Live call monitoring capability
3. **Machine Learning**: Train custom models for better accuracy
4. **Voice Pattern Analysis**: Detect synthetic/robotic voices
5. **Integration with Databases**: Check against known scammer databases
6. **Mobile App**: Dedicated mobile application
7. **Call Recording**: Built-in recording functionality

## Security Considerations

- All processing is client-side to protect user privacy
- No audio data is transmitted to servers
- Users should still be cautious about uploading sensitive recordings
- The tool is for educational/protective purposes only

## Free Alternatives & APIs

For developers looking to enhance this feature:

1. **Web Speech API**: Built into modern browsers (free)
2. **OpenAI Whisper**: Can be self-hosted (free, requires server)
3. **Mozilla DeepSpeech**: Open-source speech recognition
4. **Vosk**: Offline speech recognition (can run in browser)
5. **SpeechRecognition Python**: For server-side implementation

## Contributing

To improve the Voice Scam Detector:

1. Add new scam patterns to the detection logic
2. Improve transcription accuracy
3. Add support for more languages
4. Enhance the UI/UX
5. Add more sophisticated analysis algorithms

## License

This feature is part of the CyberCop Safe Space project and follows the project's licensing terms.