# Installation Help - Connection Issues

If you're getting connection errors, here are several solutions:

## Method 1: Use Alternative Script
```bash
install-alternative.bat
```

## Method 2: Manual Installation
Open Command Prompt or PowerShell and run these commands one by one:

### 1. Install PyTorch (for GPU)
```bash
pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu121
```

### 2. Install Whisper
Try ONE of these:
```bash
# Option A: From GitHub
pip install git+https://github.com/openai/whisper.git

# Option B: Direct from PyPI
pip install -U openai-whisper

# Option C: If behind proxy/firewall
pip install --trusted-host pypi.org --trusted-host files.pythonhosted.org openai-whisper
```

### 3. Install other dependencies
```bash
pip install flask flask-cors numpy
```

## Method 3: Offline Installation
If your internet is restricted:

1. Download these wheel files on another computer:
   - https://pypi.org/project/openai-whisper/#files
   - https://pypi.org/project/flask/#files
   - https://pypi.org/project/flask-cors/#files

2. Copy to your computer and install:
```bash
pip install openai_whisper-*.whl flask-*.whl flask_cors-*.whl
```

## Common Issues

### "Could not find a version"
- Your pip might be outdated: `python -m pip install --upgrade pip`
- Try: `pip install -U openai-whisper`

### Connection/SSL errors
- Corporate firewall blocking pip
- Try: `pip config set global.trusted-host "pypi.org files.pythonhosted.org"`

### "No module named whisper"
- The package name is `openai-whisper` but imports as `whisper`
- Make sure to install: `pip install openai-whisper`

## Alternative: Use Faster-Whisper
If regular Whisper won't install, try faster-whisper (uses less VRAM too):
```bash
pip install faster-whisper
```

Then I can update the server code to use it.
