@echo off
echo ====================================
echo Whisper GPU Setup Script
echo ====================================
echo.

REM Check if Python 3.12 is installed
py -3.12 --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Python 3.12 is required but not found.
    echo Please install Python 3.12 first:
    echo   winget install Python.Python.3.12
    pause
    exit /b 1
)

echo Found Python 3.12 ✓
echo.

REM Create virtual environment
echo Creating virtual environment with Python 3.12...
py -3.12 -m venv venv

REM Activate virtual environment
call venv\Scripts\activate.bat

REM Upgrade pip
echo.
echo Upgrading pip...
python -m pip install --upgrade pip

REM Install PyTorch with CUDA support
echo.
echo Installing PyTorch with CUDA 12.1 support...
pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu121

REM Install Whisper and dependencies
echo.
echo Installing Whisper and server dependencies...
pip install openai-whisper flask flask-cors

REM Test GPU availability
echo.
echo Testing GPU availability...
python -c "import torch; print(f'GPU Available: {torch.cuda.is_available()}'); print(f'GPU Name: {torch.cuda.get_device_name(0) if torch.cuda.is_available() else \"N/A\"}')"

echo.
echo ====================================
echo Setup Complete!
echo ====================================
echo.
echo To start the server, run: start-whisper.bat
echo.
pause
