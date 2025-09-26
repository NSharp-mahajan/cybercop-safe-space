# Whisper Integration for Audio Spam Detection

## Overview

The Audio Spam Detection tool now integrates with a local Whisper server for high-quality, GPU-accelerated transcription. This provides significantly better accuracy and speed compared to the browser-based Web Speech API.

## Features

### 1. **Dual Transcription Engines**
- **Whisper (GPU)**: High-accuracy local transcription using OpenAI's Whisper model
  - Runs on your RTX 4050 GPU for ~16x faster-than-realtime processing
  - No internet required after initial model download
  - Supports multiple languages and accents
  - Higher accuracy for poor-quality audio

- **Web Speech API**: Browser-based transcription
  - Works offline in supported browsers
  - Fallback option when Whisper server is not available
  - Good for quick tests and simple audio

### 2. **Automatic Fallback**
The system automatically falls back to Web Speech API if:
- Whisper server is not running
- Whisper transcription fails
- User explicitly selects Web Speech API

### 3. **Transcription Engine Selection**
Users can choose between:
- **Auto (Recommended)**: Uses Whisper if available, falls back to Web Speech API
- **Whisper (GPU)**: Forces use of Whisper server (fails if not available)
- **Web Speech API**: Uses browser-based transcription only

## Setup Instructions

### 1. Install Python 3.12
```powershell
winget install Python.Python.3.12
```

### 2. Set up Whisper Server
Navigate to the local-whisper directory and run the setup script:
```powershell
cd local-whisper
./setup-gpu.bat
```

This will:
- Create a Python 3.12 virtual environment
- Install PyTorch with CUDA 12.1 support
- Install Whisper and server dependencies
- Verify GPU availability

### 3. Start Whisper Server
```powershell
cd local-whisper
./start-whisper.bat
```

The server will:
- Start on http://localhost:5000
- Load the Whisper model (first run downloads ~74MB)
- Show GPU detection status
- Be ready for transcription requests

### 4. Run the Audio Spam Detection Tool
In a separate terminal:
```powershell
cd C:\dev\cybercop-safe-space
npm run dev
```

## Usage

1. **Upload Audio File**: Drag and drop or click to upload an audio file
2. **Select Transcription Engine**: Choose between Auto, Whisper, or Web Speech API
3. **Analyze**: Click "Analyze Call" to start the scam detection process

The system will:
- Show which transcription engine is being used
- Display progress during transcription
- Analyze the transcript for scam patterns
- Provide detailed results and recommendations

## Technical Details

### File Structure
```
cybercop-safe-space/
├── src/
│   ├── services/
│   │   ├── whisperService.ts      # Whisper server integration
│   │   └── audioProcessingService.ts # Updated to use Whisper
│   └── pages/
│       └── VoiceScamDetector.tsx  # UI with engine selection
└── local-whisper/
    ├── whisper_server.py          # Flask server for Whisper
    ├── start-whisper.bat          # Start script (uses venv)
    └── setup-gpu.bat              # Setup script for environment
```

### API Endpoints

- `GET /health` - Check server status and GPU availability
- `POST /api/transcribe` - Transcribe audio file
- `GET /api/models` - List available Whisper models

### Performance

On RTX 4050 6GB:
- Base model: ~16x faster than realtime
- Small model: ~6x faster than realtime
- Medium model: ~2x faster than realtime

### Privacy & Security

- All processing happens locally on your machine
- No audio data is sent to external servers
- Whisper server only accepts connections from localhost
- Audio files are temporarily stored and immediately deleted after processing

## Troubleshooting

### Whisper Server Not Detected
1. Ensure the server is running: Check for the terminal window running whisper_server.py
2. Check firewall settings: Ensure localhost:5000 is not blocked
3. Verify Python environment: The virtual environment must be activated

### GPU Not Detected
1. Ensure NVIDIA drivers are up to date
2. Check CUDA installation: PyTorch requires CUDA 12.1
3. Verify GPU memory: At least 1GB free VRAM needed for base model

### Transcription Fails
1. Check audio file format: Supported formats include MP3, WAV, M4A, OGG
2. Verify file size: Maximum 50MB
3. Check Whisper server logs for errors

## Future Enhancements

1. **Model Selection**: Allow users to choose between tiny, base, small, medium models
2. **Language Detection**: Auto-detect language from audio
3. **Batch Processing**: Process multiple files at once
4. **Real-time Transcription**: Support for live audio streams
5. **Multi-language Support**: Expand scam detection to other languages
