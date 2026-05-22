@echo off
title Team Task Manager - Frontend
set "PATH=C:\Program Files\nodejs;%PATH%"
cd /d "%~dp0frontend"

if not exist "node_modules\" (
  echo Installing frontend dependencies...
  call "C:\Program Files\nodejs\npm.cmd" install
  if errorlevel 1 (
    echo npm install FAILED.
    pause
    exit /b 1
  )
)

echo.
echo ========================================
echo  Web App - http://localhost:5173
echo ========================================
echo.
call "C:\Program Files\nodejs\npm.cmd" run dev
echo.
echo Frontend stopped.
pause
