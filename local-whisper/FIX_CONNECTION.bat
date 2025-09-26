@echo off
echo =========================================
echo   Fixing Connection Issues
echo =========================================
echo.

echo Trying different installation methods...
echo.

echo Method 1: Updating pip first...
python -m pip install --upgrade pip

echo.
echo Method 2: Setting trusted hosts...
pip config set global.trusted-host "pypi.org files.pythonhosted.org"

echo.
echo Method 3: Installing with trusted host flags...
pip install --trusted-host pypi.org --trusted-host files.pythonhosted.org openai-whisper

echo.
echo Method 4: Try alternative package name...
pip install -U openai-whisper

echo.
echo Method 5: Installing from GitHub directly...
pip install git+https://github.com/openai/whisper.git

echo.
echo If none of these work, try:
echo 1. Disable antivirus temporarily
echo 2. Use a VPN
echo 3. Install faster-whisper instead: pip install faster-whisper
echo.
pause
