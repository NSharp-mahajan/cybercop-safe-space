@echo off
echo =========================================
echo   Local Whisper Server Installation
echo =========================================
echo.

:: Check Python
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Python is not installed!
    echo.
    echo Please install Python 3.8 or later from:
    echo https://www.python.org/downloads/
    echo.
    echo Make sure to check "Add Python to PATH" during installation
    pause
    exit /b 1
)

echo [OK] Python found
python --version
echo.

echo Installing PyTorch with CUDA support for your GPU...
echo This will download ~2GB for GPU acceleration
echo.

:: Install PyTorch with CUDA
pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu121

echo.
echo Installing other dependencies...
pip install -r requirements.txt

echo.
echo =========================================
echo   Installation Complete!
echo =========================================
echo.
echo To start the server, run:
echo   start-whisper.bat
echo.
pause
