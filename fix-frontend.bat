@echo off
title Fix Frontend Dependencies
set "PATH=C:\Program Files\nodejs;%PATH%"
cd /d "%~dp0frontend"

echo Removing broken lucide-react...
if exist "node_modules\lucide-react" rmdir /s /q "node_modules\lucide-react"

echo Reinstalling lucide-react...
call "C:\Program Files\nodejs\npm.cmd" install lucide-react@0.454.0 --force
if errorlevel 1 (
  echo FAILED. Try moving the project out of OneDrive, or run:
  echo   rmdir /s /q node_modules
  echo   npm install
  pause
  exit /b 1
)

echo.
echo Done! Run START-APP.bat or start-frontend.bat again.
pause
