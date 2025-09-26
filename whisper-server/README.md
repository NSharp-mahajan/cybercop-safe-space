# Local Whisper Server

Run OpenAI's Whisper speech recognition model locally on your GPU!

## Features

- 🚀 **GPU Acceleration**: Uses your RTX 4050 for fast transcription
- 🔒 **100% Private**: All processing happens on your machine
- 💰 **Free Forever**: No API costs, no usage limits
- 🎯 **High Accuracy**: OpenAI's Whisper is state-of-the-art
- ⚡ **Fast**: 10-20x faster than real-time on your GPU

## Quick Start

1. **Install** (one-time setup, ~5-10 minutes):
   ```bash
   install.bat
   ```

2. **Start Server**:
   ```bash
   start-server.bat
   ```

3. **Use in your app**: Server runs at `http://localhost:5000`

## System Requirements

- ✅ Python 3.8 or higher
- ✅ NVIDIA GPU with 4GB+ VRAM (you have RTX 4050 6GB)
- ✅ ~2GB disk space for PyTorch
- ✅ ~74MB for Whisper base model

## API Endpoints

### Transcribe Audio
```
POST http://localhost:5000/api/transcribe
Content-Type: multipart/form-data
Body: file=<audio_file>
```

Response:
```json
{
  "transcript": "Hello, this is a test recording.",
  "confidence": 0.95,
  "duration": 2.3,
  "segments": [...],
  "device": "cuda"
}
```

### Check Health
```
GET http://localhost:5000/health
```

### List Models
```
GET http://localhost:5000/api/models
```

## Model Options

Edit `MODEL_SIZE` in `server.py`:

| Model | Size | Speed | Quality | VRAM |
|-------|------|-------|---------|------|
| tiny  | 39MB | ~32x  | Good    | 1GB  |
| base  | 74MB | ~16x  | Better  | 1GB  |
| small | 244MB| ~6x   | Great   | 2GB  |
| medium| 769MB| ~2x   | Excellent| 5GB |
| large | 1.5GB| ~1x   | Best    | 10GB |

**Recommended for RTX 4050**: `base` or `small`

## Performance Tips

1. **First run**: Model downloads automatically (~74MB)
2. **Warmup**: First transcription is slower (model loading)
3. **File formats**: WAV/MP3 work best
4. **Audio quality**: Clear audio = better results

## Troubleshooting

### "CUDA not available"
- Update NVIDIA drivers
- Install CUDA toolkit (optional)

### "Out of memory"
- Use smaller model (tiny/base)
- Close other GPU apps

### Slow performance
- Check if using GPU: should show "cuda" in logs
- Ensure no other GPU-intensive apps running

## Customization

### Change model size:
```python
MODEL_SIZE = "small"  # or tiny, base, medium, large
```

### Change port:
```python
app.run(host='0.0.0.0', port=5000)  # Change 5000 to any port
```

### Multi-language:
```python
language="en"  # Remove this line for auto-detect
```
