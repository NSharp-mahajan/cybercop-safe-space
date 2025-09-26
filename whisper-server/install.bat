@echo off
echo ====================================
echo  Whisper Server Installation Script
echo ====================================
echo.

REM Check if Python is installed
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Python is not installed or not in PATH
    echo Please install Python 3.8+ from https://python.org
    pause
    exit /b 1
)

echo [1/4] Creating virtual environment...
python -m venv venv
if %errorlevel% neq 0 (
    echo ERROR: Failed to create virtual environment
    pause
    exit /b 1
)

echo [2/4] Activating virtual environment...
call venv\Scripts\activate.bat

echo [3/4] Installing PyTorch with CUDA support...
echo This will download ~2GB for GPU support
pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu121

echo [4/4] Installing other requirements...
pip install -r requirements.txt

echo.
echo ====================================
echo  Installation Complete!
echo ====================================
echo.
echo To start the server:
echo   1. Run: start-server.bat
echo   2. Server will be available at http://localhost:5000
echo.
echo First run will download Whisper model (~74MB)
echo.
pause
