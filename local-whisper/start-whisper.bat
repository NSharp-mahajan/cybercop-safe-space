@echo off
echo Starting Local Whisper Server...
echo.

REM Activate virtual environment if it exists
if exist "venv\Scripts\activate.bat" (
    call venv\Scripts\activate.bat
    echo Virtual environment activated.
) else (
    echo Warning: Virtual environment not found. GPU support may not be available.
)

python whisper_server.py
pause
