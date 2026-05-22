@echo off
title Team Task Manager - Backend
set "PATH=C:\Program Files\nodejs;%PATH%"
cd /d "%~dp0backend"

if not exist "node_modules\" (
  echo Installing backend dependencies...
  call "C:\Program Files\nodejs\npm.cmd" install
  if errorlevel 1 (
    echo npm install FAILED.
    pause
    exit /b 1
  )
)

echo.
echo ========================================
echo  Backend API - http://localhost:5000
echo ========================================
echo.
call "C:\Program Files\nodejs\npm.cmd" start
echo.
echo Backend stopped.
pause
