# Local Whisper Server - Free Speech Recognition on Your GPU! 🚀

This runs OpenAI's Whisper model locally on your RTX 4050, giving you unlimited, free speech-to-text with no cloud dependencies!

## Features

✅ **100% Free** - No API costs, no usage limits  
✅ **100% Private** - Everything runs on your machine  
✅ **GPU Accelerated** - Uses your RTX 4050 for blazing fast transcription  
✅ **High Accuracy** - OpenAI Whisper is state-of-the-art  
✅ **Easy Setup** - Just run two scripts  

## Quick Start

### 1️⃣ First Time Setup (5-10 minutes)
```bash
cd local-whisper
install.bat
```
This installs PyTorch with GPU support (~2GB download) and Whisper.

### 2️⃣ Start the Server
```bash
start-whisper.bat
```
Or from the main folder, run `START_APP.bat` to start everything!

## Performance on RTX 4050 6GB

| Model | Size | Speed | Quality | Recommended |
|-------|------|-------|---------|-------------|
| tiny | 39MB | ~32x realtime | Good | Quick drafts |
| **base** | 74MB | ~16x realtime | Better | ✅ Best balance |
| small | 244MB | ~6x realtime | Great | High quality |
| medium | 769MB | ~2x realtime | Excellent | If VRAM allows |

## How It Works

1. Your React app sends audio files to `localhost:5000`
2. Whisper processes them on your GPU
3. You get back the transcript in ~2-5 seconds
4. No internet required after initial setup!

## API Usage

### Transcribe Audio
```bash
POST http://localhost:5000/api/transcribe
Content-Type: multipart/form-data
file: <your-audio-file>
```

### Check Health
```bash
GET http://localhost:5000/health
```

## Supported Formats
MP3, WAV, M4A, OGG, FLAC, WebM, AAC

## Troubleshooting

### "CUDA not available"
- Update NVIDIA drivers: https://www.nvidia.com/drivers
- Restart after driver update

### "Out of memory"
- Close other GPU applications
- Use "tiny" or "base" model
- Edit `MODEL_NAME = "tiny"` in `whisper_server.py`

### Slow performance
- Make sure it shows "cuda" not "cpu" in the logs
- First transcription is slower (model loading)
- Subsequent ones are much faster

## Customization

### Change Model Size
Edit `whisper_server.py`:
```python
MODEL_NAME = "small"  # Options: tiny, base, small, medium, large
```

### Change Language
For auto-detection, edit line 124:
```python
language=None,  # Auto-detect language
```

### Change Port
Edit line 215:
```python
app.run(host='0.0.0.0', port=5000)  # Change port here
```

## Privacy & Security

- ✅ No data leaves your machine
- ✅ No API keys needed
- ✅ No internet required after setup
- ✅ Your audio files stay private

## Credits

Using OpenAI's Whisper: https://github.com/openai/whisper  
Made for your Voice Scam Detector project! 🎉
