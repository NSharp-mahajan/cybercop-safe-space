#!/usr/bin/env python3
"""
Alternative: Faster-Whisper Server
Uses less VRAM and runs faster than regular Whisper
"""

import os
import time
import tempfile
from flask import Flask, request, jsonify
from flask_cors import CORS
from faster_whisper import WhisperModel
import logging

# Setup
app = Flask(__name__)
CORS(app)
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Configuration
MODEL_SIZE = "base"  # tiny, base, small, medium, large-v2
device = "cuda"  # or "cpu"
compute_type = "float16"  # float16 for GPU, int8 for CPU

# Initialize model
print(f"Loading Faster-Whisper {MODEL_SIZE} model...")
model = WhisperModel(MODEL_SIZE, device=device, compute_type=compute_type)
print("Model loaded!")

@app.route('/health', methods=['GET'])
def health():
    return jsonify({
        "status": "healthy",
        "model": f"faster-whisper-{MODEL_SIZE}",
        "device": device
    })

@app.route('/api/transcribe', methods=['POST'])
def transcribe():
    if 'file' not in request.files:
        return jsonify({"error": "No file"}), 400
    
    file = request.files['file']
    
    # Save temp file
    with tempfile.NamedTemporaryFile(delete=False, suffix='.wav') as tmp:
        file.save(tmp.name)
        temp_path = tmp.name
    
    try:
        start = time.time()
        
        # Transcribe
        segments, info = model.transcribe(temp_path, beam_size=5)
        
        # Collect results
        text = ""
        segs = []
        for segment in segments:
            text += segment.text + " "
            segs.append({
                "start": segment.start,
                "end": segment.end,
                "text": segment.text.strip()
            })
        
        elapsed = time.time() - start
        
        return jsonify({
            "transcript": text.strip(),
            "confidence": 0.95,
            "duration": elapsed,
            "device": device,
            "model": f"faster-whisper-{MODEL_SIZE}",
            "segments": segs[:10]  # First 10 segments
        })
        
    finally:
        os.unlink(temp_path)

if __name__ == '__main__':
    print(f"\nFaster-Whisper Server running on http://localhost:5000")
    print(f"Using {device.upper()} with {MODEL_SIZE} model\n")
    app.run(host='0.0.0.0', port=5000)
