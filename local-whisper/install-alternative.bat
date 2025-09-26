@echo off
echo =========================================
echo   Alternative Installation Method
echo =========================================
echo.

:: Check Python
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Python is not installed!
    echo Please install Python 3.8+ from python.org
    pause
    exit /b 1
)

echo [OK] Python found
echo.

echo Step 1: Installing PyTorch for your GPU...
echo (This will download ~2GB)
python -m pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu121

echo.
echo Step 2: Installing Whisper from GitHub...
python -m pip install git+https://github.com/openai/whisper.git

echo.
echo Step 3: Installing web server...
python -m pip install flask flask-cors

echo.
echo =========================================
echo   Installation Complete!
echo =========================================
echo.
echo To start the server, run:
echo   start-whisper.bat
echo.
pause
