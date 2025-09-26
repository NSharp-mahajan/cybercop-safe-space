@echo off
echo ================================================
echo     Voice Scam Detector - Local Setup
echo ================================================
echo.

:: Start Whisper server in new window
echo Starting Local Whisper Server (GPU)...
start "Local Whisper Server" cmd /k "cd local-whisper && start-whisper.bat"

echo.
echo Waiting for Whisper to initialize...
timeout /t 5 /nobreak > nul

:: Start frontend
echo.
echo Starting Frontend Application...
npm run dev

pause
