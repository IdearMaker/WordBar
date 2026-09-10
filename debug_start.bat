@echo off
cd /d "%~dp0"
echo [Debug] Starting electron...
"%~dp0node_modules\electron\dist\electron.exe" . --enable-logging
echo [Debug] Process exited with code %errorlevel%
pause
