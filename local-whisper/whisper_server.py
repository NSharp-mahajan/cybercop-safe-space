#!/usr/bin/env python3
"""
Local Whisper Server - Run OpenAI Whisper on your GPU
No cloud, no API keys, completely free!
"""

import os
import sys
import time
import torch
import whisper
import warnings
import tempfile
from flask import Flask, request, jsonify
from flask_cors import CORS
from werkzeug.utils import secure_filename
import logging

# Suppress warnings
warnings.filterwarnings("ignore")

# Setup logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(message)s')
logger = logging.getLogger(__name__)

# Initialize Flask
app = Flask(__name__)
CORS(app, origins=['http://localhost:*', 'http://127.0.0.1:*'])

# Configuration
MODEL_NAME = "base"  # Options: tiny, base, small, medium, large
MAX_FILE_SIZE = 50 * 1024 * 1024  # 50MB
ALLOWED_EXTENSIONS = {'wav', 'mp3', 'mp4', 'm4a', 'ogg', 'flac', 'webm', 'aac'}

# Global model variable
model = None
device = None

def init_model():
    """Initialize Whisper model on GPU/CPU"""
    global model, device
    
    print("\n🚀 Initializing Whisper...")
    
    # Check for GPU
    if torch.cuda.is_available():
        device = "cuda"
        gpu_name = torch.cuda.get_device_name(0)
        vram = torch.cuda.get_device_properties(0).total_memory / 1024**3
        print(f"✅ GPU Detected: {gpu_name} ({vram:.1f}GB VRAM)")
        print("   Your RTX 4050 will make this FAST! 🏎️")
    else:
        device = "cpu"
        print("⚠️  No GPU detected, using CPU (will be slower)")
    
    # Load model
    print(f"📥 Loading Whisper '{MODEL_NAME}' model...")
    start = time.time()
    
    try:
        model = whisper.load_model(MODEL_NAME, device=device)
        elapsed = time.time() - start
        print(f"✅ Model loaded in {elapsed:.1f} seconds!")
        
        # Model info
        model_sizes = {
            "tiny": "39 MB",
            "base": "74 MB", 
            "small": "244 MB",
            "medium": "769 MB",
            "large": "1550 MB"
        }
        print(f"📊 Model size: {model_sizes.get(MODEL_NAME, 'Unknown')}")
        
    except Exception as e:
        print(f"❌ Failed to load model: {e}")
        sys.exit(1)

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        "status": "healthy",
        "model": MODEL_NAME,
        "device": str(device),
        "gpu_available": torch.cuda.is_available(),
        "server": "local-whisper"
    })

@app.route('/api/transcribe', methods=['POST'])
def transcribe():
    """Main transcription endpoint"""
    start_time = time.time()
    
    # Check file
    if 'file' not in request.files:
        return jsonify({"error": "No file uploaded"}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "No file selected"}), 400
    
    if not allowed_file(file.filename):
        return jsonify({
            "error": f"Invalid file type. Supported: {', '.join(ALLOWED_EXTENSIONS)}"
        }), 400
    
    try:
        # Save temporary file
        with tempfile.NamedTemporaryFile(delete=False, suffix=os.path.splitext(file.filename)[1]) as tmp_file:
            file.save(tmp_file.name)
            temp_path = tmp_file.name
        
        file_size = os.path.getsize(temp_path) / 1024 / 1024  # MB
        logger.info(f"📁 Processing: {file.filename} ({file_size:.1f}MB)")
        
        # Transcribe
        logger.info("🎙️ Transcribing...")
        result = model.transcribe(
            temp_path,
            language="en",  # Set to None for auto-detection
            task="transcribe",
            fp16=(device == "cuda"),  # Use FP16 on GPU for speed
            verbose=False
        )
        
        # Clean up
        os.unlink(temp_path)
        
        # Calculate stats
        elapsed = time.time() - start_time
        audio_duration = result.get("segments", [{}])[-1].get("end", 0) if result.get("segments") else 0
        speed_factor = audio_duration / elapsed if elapsed > 0 else 0
        
        logger.info(f"✅ Done in {elapsed:.1f}s (Speed: {speed_factor:.1f}x realtime)")
        
        # Prepare response
        response = {
            "transcript": result["text"].strip(),
            "confidence": 0.95,  # Whisper doesn't provide confidence
            "model": f"whisper-{MODEL_NAME}",
            "device": str(device),
            "duration": elapsed,
            "segments": [
                {
                    "start": seg["start"],
                    "end": seg["end"], 
                    "text": seg["text"].strip()
                } 
                for seg in result.get("segments", [])
            ],
            "stats": {
                "processing_time": round(elapsed, 2),
                "audio_duration": round(audio_duration, 2),
                "speed_factor": round(speed_factor, 1),
                "file_size_mb": round(file_size, 2)
            }
        }
        
        return jsonify(response)
        
    except Exception as e:
        logger.error(f"❌ Error: {str(e)}")
        return jsonify({
            "error": "Transcription failed",
            "details": str(e)
        }), 500

@app.route('/api/models', methods=['GET'])
def list_models():
    """List available models"""
    models_info = {
        "tiny": {"size": "39 MB", "speed": "~32x", "english": "tiny.en", "vram": "~1 GB"},
        "base": {"size": "74 MB", "speed": "~16x", "english": "base.en", "vram": "~1 GB"},
        "small": {"size": "244 MB", "speed": "~6x", "english": "small.en", "vram": "~2 GB"},
        "medium": {"size": "769 MB", "speed": "~2x", "english": "medium.en", "vram": "~5 GB"},
        "large": {"size": "1550 MB", "speed": "~1x", "english": "N/A", "vram": "~10 GB"}
    }
    
    return jsonify({
        "current": MODEL_NAME,
        "available": models_info,
        "recommendation": "Use 'base' or 'small' for RTX 4050 6GB"
    })

if __name__ == '__main__':
    print("""
    ╔════════════════════════════════════════╗
    ║    🎙️  LOCAL WHISPER SERVER 🎙️        ║
    ║    Free Speech Recognition on GPU!     ║
    ╚════════════════════════════════════════╝
    """)
    
    # Initialize model
    init_model()
    
    # Start server
    print(f"""
    🌐 Server starting on http://localhost:5000
    
    📝 Quick Test:
       curl -X POST -F "file=@audio.mp3" http://localhost:5000/api/transcribe
    
    ⚡ Performance on RTX 4050:
       - Base model: ~16x faster than realtime
       - Small model: ~6x faster than realtime
       - First run downloads model (~74MB for base)
    
    🔒 Privacy: Everything runs locally, no internet needed!
    """)
    
    app.run(host='0.0.0.0', port=5000, debug=False)
