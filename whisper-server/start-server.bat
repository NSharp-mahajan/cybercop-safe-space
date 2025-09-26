@echo off
echo Starting Whisper Server...
echo.

REM Activate virtual environment
call venv\Scripts\activate.bat

REM Start the server
python server.py

pause
